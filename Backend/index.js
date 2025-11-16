import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

import pipelineRouter from "./routes/pipeLineRouter.js";

const app = express();

const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = isProduction
    ? [""]
    : [
        "http://localhost:3000",
    ];

app.use((req, res, next) => {
    console.log(`[${req.ip}] ${req.method} request to ${req.url}`);
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// CORS
app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

// Health route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK" });
});

// Routers
app.use("/api", pipelineRouter);

// Mongo + Server Startup
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("💾 MongoDB Connected");
        app.listen(process.env.PORT, () => {
            console.log(`🖥️ Server running: http://localhost:${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});
