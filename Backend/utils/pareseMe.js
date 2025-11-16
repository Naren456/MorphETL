import JSON5 from "json5";

/**
 * Detect blocks in raw text.
 * Returns: [{ blockType, rawText, parsed, startLine, endLine, meta }]
 */
export function detectBlocks(rawText) {
    if (typeof rawText !== "string") rawText = String(rawText || "");
    const lines = rawText.split(/\r?\n/);
    const results = [];
    let i = 0;

    const tryParseJson = (text) => {
        try { return JSON.parse(text); } catch (_) { }
        try { return JSON5.parse(text); } catch (_) { }
        return null;
    };

    const tryParseCsv = (text) => {
        const rows = [];
        const allLines = text.split(/\r?\n/).filter(l => l.trim() !== "");
        for (const line of allLines) {
            const row = [];
            let cur = "", inQuotes = false;
            for (let j = 0; j < line.length; j++) {
                const ch = line[j];
                if (ch === '"') {
                    if (line[j + 1] === '"') { cur += '"'; j++; continue; }
                    inQuotes = !inQuotes; continue;
                }
                if (ch === ',' && !inQuotes) { row.push(cur.trim()); cur = ""; continue; }
                cur += ch;
            }
            row.push(cur.trim());
            rows.push(row);
        }
        if (rows.length < 2) return null;
        const colCounts = new Set(rows.map(r => r.length));
        if (colCounts.size === 1 && rows[0].length > 1) return rows;
        return null;
    };

    const parseYamlLite = (text) => {
        const out = {};
        const lines = text.split(/\r?\n/);
        let currentKey = null;
        for (const l of lines) {
            const kv = l.match(/^\s*([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
            const bullet = l.match(/^\s*-\s*(.+)$/);
            if (kv) {
                const key = kv[1]; const val = kv[2].trim();
                if (val === "") { out[key] = []; currentKey = key; } else { out[key] = val; currentKey = null; }
            } else if (bullet && currentKey) {
                out[currentKey].push(bullet[1].trim());
            } else { currentKey = null; }
        }
        return Object.keys(out).length ? out : null;
    };

    const parseKvp = (text) => {
        const obj = {};
        for (const l of text.split(/\r?\n/)) {
            const m = l.match(/^\s*([A-Za-z0-9_\-]+(?:\[[^\]]+\])?)\s*:\s*(.+)$/);
            if (m) { obj[m[1].trim()] = m[2].trim(); }
        }
        return Object.keys(obj).length ? obj : null;
    };

    const isSeparatorLine = (line) => /^\s*[-=]{3,}\s*$/.test(line);
    const isHtmlStart = (line) => /^\s*<(!doctype|html|head|body|div|table|section|article|script|h[1-6])\b/i.test(line);
    const isHtmlEnd = (line) => /<\/(html|head|body|div|table|section|article|script|h[1-6])\s*>/i.test(line);
    const isScriptJsonLdStart = (line) => /<script[^>]*type=(?:'|")application\/ld\+json(?:'|")/i.test(line);
    const isJsonStart = (line) => /^\s*[\{\[]/.test(line);
    const isLikelySQL = (line) => /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|WITH)\b/i.test(line);
    const isYamlBullet = (line) => /^\s*-\s+/.test(line);
    const isKvLine = (line) => /^\s*[A-Za-z0-9_\-]+(?:\[[^\]]+\])?\s*:\s*.+$/.test(line);
    const looksLikeCsvHeader = (line) => line.includes(",") && line.split(",").length > 1;

    const accumulateUntilBalanced = (lines, startIdx) => {
        let text = "", brace = 0, bracket = 0, inString = false, esc = false;
        let i = startIdx;
        while (i < lines.length) {
            const line = lines[i]; text += (i > startIdx ? "\n" : "") + line;
            for (const ch of line) {
                if (esc) { esc = false; continue; }
                if (ch === "\\") { esc = true; continue; }
                if ((ch === '"' || ch === "'") && !esc) inString = !inString;
                if (inString) continue;
                if (ch === "{") brace++; if (ch === "}") brace--;
                if (ch === "[") bracket++; if (ch === "]") bracket--;
            }
            const parsed = tryParseJson(text);
            if (brace === 0 && bracket === 0 && parsed !== null) return { text, parsed, endIdx: i + 1 };
            i++;
        }
        return { text, parsed: null, endIdx: i };
    };

    const accumulateHtml = (lines, startIdx) => {
        const htmlLines = [];
        const tagStack = [];
        const tagRegex = /<\/?([a-zA-Z0-9\-]+)[^>]*>/g;
        let i = startIdx;
        while (i < lines.length) {
            const line = lines[i];
            htmlLines.push(line);
            let match;
            while ((match = tagRegex.exec(line)) !== null) {
                const tag = match[1].toLowerCase();
                if (match[0].startsWith("</")) {
                    if (tagStack[tagStack.length - 1] === tag) tagStack.pop();
                } else {
                    tagStack.push(tag);
                }
            }
            if (tagStack.length === 0 && htmlLines.length > 0) break;
            i++;
        }
        return { chunk: htmlLines.join("\n"), endIdx: i + 1 };
    };

    const nlpSummarizeText = (text) => {
        const sentences = text.split(/(?<=[.?!])\s+/).filter(s => s.trim() !== "");
        return { sentences, wordCount: text.split(/\s+/).length };
    };

    while (i < lines.length) {
        const line = lines[i].trim();
        if (!line) { i++; continue; }

        if (isSeparatorLine(line)) { results.push({ blockType: "separator", rawText: line, parsed: null, startLine: i, endLine: i + 1, meta: {} }); i++; continue; }

        if (isScriptJsonLdStart(line)) {
            let j = i; while (j < lines.length && !lines[j].includes("</script>")) j++;
            const chunk = lines.slice(i, j + 1).join("\n");
            const inner = chunk.replace(/^[\s\S]*?<script[^>]*>/i, "").replace(/<\/script>[\s\S]*$/i, "");
            results.push({ blockType: "script_jsonld", rawText: chunk, parsed: tryParseJson(inner), startLine: i, endLine: j + 1, meta: {} });
            i = j + 1; continue;
        }

        if (isHtmlStart(line)) {
            const { chunk, endIdx } = accumulateHtml(lines, i);
            results.push({ blockType: "html", rawText: chunk, parsed: { html: chunk }, startLine: i, endLine: endIdx, meta: {} });
            i = endIdx; continue;
        }

        if (isJsonStart(line)) {
            const { text, parsed, endIdx } = accumulateUntilBalanced(lines, i);
            results.push({ blockType: parsed ? "json" : "json_fragment", rawText: text, parsed, startLine: i, endLine: endIdx, meta: {} });
            i = endIdx; continue;
        }

        if (isLikelySQL(line)) {
            let j = i; while (j < lines.length && !lines[j].includes(";")) j++;
            const chunk = lines.slice(i, j + 1).join("\n");
            results.push({ blockType: "sql", rawText: chunk, parsed: { sql: chunk }, startLine: i, endLine: j + 1, meta: {} });
            i = j + 1; continue;
        }

        if (looksLikeCsvHeader(line)) {
            let j = i; while (j < lines.length && lines[j].trim() !== "") j++;
            const chunk = lines.slice(i, j).join("\n");
            const parsed = tryParseCsv(chunk);
            results.push({ blockType: parsed ? "csv" : "text", rawText: chunk, parsed: parsed || nlpSummarizeText(chunk), startLine: i, endLine: j, meta: {} });
            i = j; continue;
        }

        if (isYamlBullet(line) || isKvLine(line)) {
            let j = i; while (j < lines.length && lines[j].trim() !== "" && (isYamlBullet(lines[j]) || isKvLine(lines[j]))) j++;
            const chunk = lines.slice(i, j).join("\n");
            const parsed = parseYamlLite(chunk) || parseKvp(chunk);
            results.push({ blockType: parsed && !Array.isArray(parsed) ? "yaml" : "kvp", rawText: chunk, parsed: parsed || nlpSummarizeText(chunk), startLine: i, endLine: j, meta: {} });
            i = j; continue;
        }

        let j = i; while (j < lines.length && lines[j].trim() !== "" && !isJsonStart(lines[j]) && !isHtmlStart(lines[j]) && !isLikelySQL(lines[j])) j++;
        const chunk = lines.slice(i, j).join("\n");
        results.push({ blockType: "text", rawText: chunk, parsed: nlpSummarizeText(chunk), startLine: i, endLine: j, meta: {} });
        i = j;
    }

    const merged = [];
    for (const b of results) {
        if (!b.rawText?.trim()) continue;
        const last = merged[merged.length - 1];
        if (last && last.blockType === "text" && b.blockType === "text") {
            last.rawText += "\n\n" + b.rawText;
            last.endLine = b.endLine;
            last.parsed.sentences.push(...b.parsed.sentences);
            last.parsed.wordCount += b.parsed.wordCount;
            continue;
        }
        merged.push(b);
    }

    return merged;
}
