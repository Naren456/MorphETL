import mongoose from "mongoose";

const NodeDataRawSchema = new mongoose.Schema(
    {
        fileName: String,
        fileBuffer: Buffer,
        contentType: String,
        metadata: mongoose.Schema.Types.Mixed,
        rawText: String,
        parsedJson: mongoose.Schema.Types.Mixed,
        uploadedAt: { type: Date, default: Date.now }
    },
    { _id: false }
);

const NodeDataParsedSchema = new mongoose.Schema(
    {
        blockType: String,
        parsedData: mongoose.Schema.Types.Mixed,
        startLine: Number,
        endLine: Number,
        parsedAt: { type: Date, default: Date.now }
    },
    { _id: false }
);

const NodeConfigSchema = new mongoose.Schema(
    {
        key: String,
        value: mongoose.Schema.Types.Mixed
    },
    { _id: false }
);

const PipelineNodeSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        type: { type: String, required: true }, // source | derived | merge | schema
        label: String,

        position: {
            x: Number,
            y: Number
        },

        data: {
            config: mongoose.Schema.Types.Mixed,
            operation: String,
            sourceType: String,
            metadata: mongoose.Schema.Types.Mixed,

            rawData: [NodeDataRawSchema],
            parsedData: [NodeDataParsedSchema],

            mergedJson: mongoose.Schema.Types.Mixed,
            finalSchemaRef: Number
        }
    },
    { _id: false }
);

const PipelineEdgeSchema = new mongoose.Schema(
    {
        id: { type: String, required: true },
        source: { type: String, required: true },
        target: { type: String, required: true },
        label: String,
        animated: { type: Boolean, default: true },
        metadata: mongoose.Schema.Types.Mixed
    },
    { _id: false }
);

const FinalSchemaVersionSchema = new mongoose.Schema({
    version: { type: Number, required: true },
    schema: mongoose.Schema.Types.Mixed,
    generatedAt: { type: Date, default: Date.now },
    sourceNodes: { type: [mongoose.Schema.Types.Mixed], default: [] },
    notes: String
});

const PipelineSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },

        nodes: [PipelineNodeSchema],
        edges: [PipelineEdgeSchema],

        version: { type: Number, default: 1 },

        finalSchemas: [FinalSchemaVersionSchema],

        status: {
            type: String,
            enum: ["idle", "running", "completed", "failed"],
            default: "idle"
        },

        createdBy: String,
        updatedBy: String
    },
    { timestamps: true }
);

export default mongoose.model("Pipeline", PipelineSchema);
