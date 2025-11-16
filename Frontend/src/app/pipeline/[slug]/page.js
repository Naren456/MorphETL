"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    ReactFlowProvider,
    Handle,
    Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { useParams } from "next/navigation";
import "./pipeline.css";

import { getDataAPI, postDataAPI } from "../../../../utils/fetchData";

const NodeLabelType = ({ data }) => {
    return (
        <div
            style={{
                padding: 8,
                border: "1px solid #555",
                borderRadius: 8,
                background: "#fff",
                textAlign: "center",
                fontSize: 12,
                minWidth: 120,
                position: "relative",
            }}
        >
            {/* REQUIRED FOR EDGE CONNECTION */}
            <Handle type="target" id="in" position={Position.Left} />
            <Handle type="source" id="out" position={Position.Right} />

            <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                {data.label}
            </div>
            <div
                style={{
                    color: "#666",
                    fontStyle: "italic",
                    borderTop: "1px solid #ddd",
                    marginTop: 4,
                    paddingTop: 4,
                }}
            >
                {data.type}
            </div>
        </div>
    );
};

const nodeTypes = {
    source: NodeLabelType,
    transform: NodeLabelType,
    join: NodeLabelType,
    load: NodeLabelType,
    derived: NodeLabelType,
};

export default function Pipeline() {
    const { slug: pipelineId } = useParams();
    const [pipeline, setPipeline] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        loadPipeline();
    }, [pipelineId]);

    const loadPipeline = async () => {
        try {
            const res = await getDataAPI(`/api/pipeline/${pipelineId}`);
            if (res.data.success) setPipeline(res.data.pipeline);
        } catch (err) {
            console.error("Failed to fetch pipeline:", err);
        }
    };

    const onNodeClick = useCallback((_, node) => {
        setSelectedNode(node);
    }, []);

    const addSourceNode = async () => {
        try {
            const res = await postDataAPI(
                `/api/pipeline/${pipelineId}/add-source`,
                {},
                true
            );
            if (res.data.success) {
                setPipeline(res.data.pipeline);
                toast.success("Source node added!");
            }
        } catch {
            toast.error("Error adding source");
        }
    };
    const [showVersionModal, setShowVersionModal] = useState(false);

    if (!pipeline) return <div>Loading pipeline...</div>;


    return (
        <ReactFlowProvider>
            {showVersionModal && <div className="versionmodal">
                <div className="versionmodalin">
                    <div className="versionmodalin_header">
                        <h1>Version history</h1>
                        <button onClick={() => setShowVersionModal(false)}>Close</button>
                    </div>
                    <div className="versionmodals">
                        {pipeline.finalSchemas.map((item, i) => <div key={i} className="versionmodals_item">
                            <h2>Version {item.version}</h2>
                            <pre>
                                {JSON.stringify(item.schema, null, 2)}
                            </pre>
                        </div>)}
                    </div>
                </div>
            </div>}
            <nav className="navbar">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
                </svg>

                <input
                    type="text"
                    defaultValue={pipeline.name}
                    className="pipeline-title"
                />

                <p>({pipeline?.nodes?.length}) Nodes</p>
                <p>({pipeline?.edges?.length}) Transforms</p>

                <button onClick={() => setShowVersionModal(true)}>View Schema Verions</button>

                <button onClick={addSourceNode}>+ Add Source</button>
            </nav>

            <div className="main_wrapper" style={{ display: "flex" }}>
                <div style={{ flex: 1 }}>
                    <ReactFlow
                        nodes={pipeline.nodes.map((node) => ({
                            ...node,
                            type: node.type,
                            data: {
                                label: node.label,
                                type: node.type,
                                metadata: node.data?.metadata || {},
                            },
                        }))}
                        edges={pipeline.edges.map((e) => ({
                            ...e,
                            animated: true,            // FORCE ANIMATION
                            type: "bezier",        // BEST DEFAULT VISUAL
                        }))}
                        nodeTypes={nodeTypes}
                        onNodeClick={onNodeClick}
                        fitView
                    >
                        <MiniMap />
                        <Controls />
                        <Background />
                    </ReactFlow>
                </div>

                <div className="dialog">
                    {!selectedNode ? (
                        <p>Select a node on the canvas</p>
                    ) : (
                        <NodeDialog
                            selectedNode={selectedNode}
                            pipelineId={pipelineId}
                            pipeline={pipeline}
                            refresh={loadPipeline}
                        />
                    )}
                </div>
            </div>
        </ReactFlowProvider>
    );
}

function NodeDialog({ selectedNode, pipelineId, refresh, pipeline }) {
    const isSource = selectedNode.type === "source";
    const rawData = selectedNode.data?.rawData || [];
    const parsedData = selectedNode.data?.parsedData || [];

    const uploadFile = async (file) => {
        const form = new FormData();
        form.append("file", file);

        try {
            const res = await postDataAPI(
                `/api/pipeline/${pipelineId}/node/${selectedNode.id}/upload`,
                form,
                true,
                "multipart/form-data"
            );

            toast.success("Uploaded & parsed!");
            await refresh();
        } catch (err) {
            console.error(err);
            toast.error("Upload failed");
        }
    };

    return (
        <div className="dialog-inner">
            <h3>Node Details</h3>

            <div className="dialog-section">
                <label>ID</label>
                <div>{selectedNode.id}</div>
            </div>

            <div className="dialog-section">
                <label>Label</label>
                <div>{selectedNode.label}</div>
            </div>

            <div className="dialog-section">
                <label>Type</label>
                <div>{selectedNode.type}</div>
            </div>


            {isSource && (
                <>
                    <h4>Upload Data File</h4>

                    <input
                        type="file"
                        onChange={(e) => uploadFile(e.target.files[0])}
                        style={{ marginBottom: 12 }}
                    />

                    {rawData.length > 0 && (
                        <div className="dialog-subsection">
                            <h4>Uploaded Files</h4>
                            {rawData.map((entry, i) => (
                                <div key={i} className="file-item">
                                    <strong>{entry.fileName}</strong>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {
                isSource &&
                <p className="sourceinnercode">
                    <b>View Previous File Data</b>

                    {
                        pipeline.nodes.find(i => i.id == selectedNode.id)?.data?.rawData[0]?.rawText
                    }
                </p>
            }

            {parsedData?.length > 0 && (
                <div className="dialog-subsection">
                    <h4>Parsed Blocks</h4>
                    {parsedData.map((block, i) => (
                        <details key={i} className="parsed-block">
                            <summary>
                                Block {i + 1} — {block.dataType}
                            </summary>

                            {block.rawText && (
                                <pre className="raw-block">{block.rawText}</pre>
                            )}

                            {block.parsedData && (
                                <pre className="json-preview">
                                    {JSON.stringify(block.parsedData, null, 2)}
                                </pre>
                            )}
                        </details>
                    ))}
                </div>
            )}

            {!isSource && (
                <div className="dialog-subsection">
                    <h4>Node Data</h4>
                    <pre>
                        {
                            JSON.stringify(pipeline.nodes.find(i => i.id == selectedNode.id)?.data, null, 2)
                        }
                    </pre>
                </div>
            )}
        </div>
    );
}













