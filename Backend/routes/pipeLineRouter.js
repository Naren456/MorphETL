import express from "express";
import Pipeline from "../models/Pipeline.js";

const router = express.Router();

import multer from "multer";
import { detectBlocks } from "../utils/pareseMe.js";

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }  // 50MB
});


router.post("/pipeline/create-default", async (req, res) => {
    try {
        const count = await Pipeline.countDocuments();
        const uniqueName = `ETL Pipeline #${count + 1}`;

        const newPipeline = {
            name: uniqueName,
            nodes: [],
            edges: []
        };

        const pipeline = await Pipeline.create(newPipeline);

        return res.status(201).json({
            success: true,
            pipelineId: pipeline._id,
            pipeline
        });

    } catch (error) {
        console.log("Pipeline creation failed:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/pipeline/list", async (req, res) => {
    try {
        const pipelines = await Pipeline.find({}, { name: 1 }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            pipelines
        });

    } catch (error) {
        console.log("Pipeline list fetch failed:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

router.get("/pipeline/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const pipeline = await Pipeline.findById(id);

        if (!pipeline) {
            return res.status(404).json({ success: false, message: "Pipeline not found" });
        }

        return res.status(200).json({
            success: true,
            pipeline
        });

    } catch (error) {
        console.log("Fetch pipeline failed:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});



router.post("/pipeline/:id/add-source", async (req, res) => {
    try {
        const { id: pipelineId } = req.params;

        const pipeline = await Pipeline.findById(pipelineId);
        if (!pipeline) {
            return res.status(404).json({ success: false, message: "Pipeline not found" });
        }

        const sourceNodes = pipeline.nodes.filter(n => n.type === "source");
        const spacingY = 150; // vertical spacing
        const startX = 150;   // fixed horizontal position

        const newNode = {
            id: `source-${Date.now()}`,
            type: "source",
            label: `New Source #${sourceNodes.length + 1}`,
            position: {
                x: startX,
                y: 20 + sourceNodes.length * spacingY,
            },
            data: {
                operation: "extract",
                sourceType: "api",
                metadata: {},
                config: {},
            },
        };

        pipeline.nodes.push(newNode);
        pipeline.updatedAt = new Date();
        pipeline.version += 1;

        await pipeline.save();

        return res.status(200).json({
            success: true,
            message: "Source node added successfully",
            node: newNode,
            pipeline,
        });

    } catch (error) {
        console.error("Failed to add source node:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
});


router.post(
    "/pipeline/:pipelineId/node/:nodeId/upload",
    upload.single("file"),
    async (req, res) => {
        try {
            const { pipelineId, nodeId } = req.params;

            const pipeline = await Pipeline.findById(pipelineId);
            if (!pipeline)
                return res.status(404).json({ success: false, message: "Pipeline not found" });

            const sourceNode = pipeline.nodes.find(n => n.id === nodeId);
            if (!sourceNode)
                return res.status(404).json({ success: false, message: "Node not found" });

            if (!req.file)
                return res.status(400).json({ success: false, message: "No file uploaded" });

            // Ensure arrays exist
            pipeline.finalSchemas = pipeline.finalSchemas || [];
            sourceNode.data = sourceNode.data || {};
            sourceNode.data.rawData = sourceNode.data.rawData || [];
            sourceNode.data.parsedData = sourceNode.data.parsedData || [];

            const oldDerivedIds = pipeline.nodes
                .filter(n => n.data?.metadata?.sourceNode === nodeId)
                .map(n => n.id);

            const oldMergedNodes = pipeline.nodes.filter(n => n.type === "merged");

            pipeline.nodes = pipeline.nodes.filter(
                n => !oldDerivedIds.includes(n.id) && !oldMergedNodes.includes(n)
            );

            pipeline.edges = pipeline.edges.filter(
                e => !oldDerivedIds.includes(e.source)
            );

            const rawText = req.file.buffer.toString("utf8");

            const rawEntry = {
                fileName: req.file.originalname,
                fileBuffer: req.file.buffer,
                contentType: req.file.mimetype,
                metadata: {},
                rawText,
                parsedJson: null
            };

            sourceNode.data.rawData.push(rawEntry);

            const blocks = detectBlocks(rawText);

            const createdNodes = [];

            for (const block of blocks) {
                const newNodeId = `${nodeId}-derived-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 8)}`;

                const derivedNode = {
                    id: newNodeId,
                    type: "derived",
                    label: `Derived ${block.blockType.toUpperCase()}`,
                    position: {
                        x: sourceNode.position.x + 350,
                        y: sourceNode.position.y + createdNodes.length * 180
                    },
                    data: {
                        operation: "parse",
                        metadata: {
                            sourceNode: nodeId,
                            blockType: block.blockType,
                            startLine: block.startLine,
                            endLine: block.endLine
                        },
                        rawData: [
                            {
                                fileName: rawEntry.fileName,
                                rawText: block.rawText,
                                fileBuffer: null,
                                contentType: "text/plain",
                                metadata: {},
                                parsedJson: null
                            }
                        ],
                        parsedData: [
                            {
                                dataType: block.blockType,
                                parsedData: block.parsed,
                                parsedAt: new Date()
                            }
                        ]
                    }
                };

                pipeline.nodes.push(derivedNode);
                createdNodes.push(derivedNode);

                pipeline.edges.push({
                    id: `edge-${nodeId}-${newNodeId}`,
                    source: nodeId,
                    target: newNodeId,
                    label: `produces ${block.blockType}`,
                    animated: true,
                    type: "smoothstep"
                });
            }

            const parsedObjects = createdNodes
                .map(n => n.data.parsedData?.[0]?.parsedData)
                .filter(Boolean);

            const deepMerge = (objects) =>
                objects.reduce((acc, obj) => {
                    for (const key in obj) {
                        if (acc[key] === undefined) acc[key] = obj[key];
                        else if (
                            typeof acc[key] === "object" &&
                            typeof obj[key] === "object"
                        ) {
                            acc[key] = deepMerge([acc[key], obj[key]]);
                        }
                    }
                    return acc;
                }, {});

            const mergedJson = deepMerge(parsedObjects);

            const mergedNodeId = `${nodeId}-merged-${Date.now()}`;

            const mergedNode = {
                id: mergedNodeId,
                type: "merged",
                label: "Merged Schema",
                position: {
                    x: sourceNode.position.x + 700,
                    y: sourceNode.position.y
                },
                data: {
                    operation: "merge",
                    metadata: { fromNodes: createdNodes.map(n => n.id) },
                    parsedData: [
                        {
                            dataType: "merged-json",
                            parsedData: mergedJson,
                            parsedAt: new Date()
                        }
                    ]
                }
            };

            pipeline.nodes.push(mergedNode);

            for (const derived of createdNodes) {
                pipeline.edges.push({
                    id: `edge-${derived.id}-to-${mergedNodeId}`,
                    source: derived.id,
                    target: mergedNodeId,
                    label: "contributes to schema",
                    animated: true,
                    type: "smoothstep"
                });
            }

            const newSchemaVersion = (pipeline.finalSchemas?.length || 0) + 1;

            pipeline.finalSchemas.push({
                version: newSchemaVersion,
                schema: mergedJson,
                sourceNodes: createdNodes.map(n => n.id),
                generatedAt: new Date(),
                notes: "Auto-generated from upload"
            });

            mergedNode.data.finalSchemaRef = newSchemaVersion;

            pipeline.version += 1;
            pipeline.updatedAt = new Date();
            await pipeline.save();

            return res.status(200).json({
                success: true,
                message: "Uploaded, parsed, derived, merged, and versioned schema created.",
                version: newSchemaVersion,
                finalSchema: mergedJson,
                derivedNodes: createdNodes,
                mergedNode,
                pipeline
            });

        } catch (err) {
            console.error("Upload/Parse Error:", err);
            res.status(500).json({ success: false, message: "Upload failed", error: err.message });
        }
    }
);


export default router;
