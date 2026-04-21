import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";
import { Role } from "@prisma/client";
import { connectDB, disconnectDB } from "../prisma/prisma.service";
import { connectRedis, disconnectRedis } from "./shared/redis.service";

import authRoute from "./modules/auth/auth.route";
import applicationRoute from "./modules/application/application.route";
import dashboardRoute from "./modules/dashboard/dashboard.route";
import jobRoute from "./modules/job/job.route";
import compatRoute from "./modules/compat/compat.route";
import { authMiddleware, authorizeRole } from "./modules/auth/auth.middleware";
import { sanitizeBody } from "./shared/middleware/sanitize.middleware";

if (!process.env.JWT_SECRET) {
    console.error("FATAL: JWT_SECRET environment variable is not set");
    process.exit(1);
}

connectDB();
connectRedis();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeBody);
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.use("/auth", authRoute);
app.use("/jobs", jobRoute);
app.use("/applications", authMiddleware, authorizeRole(Role.CANDIDATE), applicationRoute);
app.use("/dashboard", authMiddleware, authorizeRole(Role.HR), dashboardRoute);
app.use("/api/v1", compatRoute);

// Global error handler (Multer + general)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                status: "error",
                message: "File too large. Maximum size is 5MB",
            });
        }
        return res.status(400).json({
            status: "error",
            message: `Upload error: ${err.message}`,
        });
    }

    if (err.message === "Only PDF files are allowed") {
        return res.status(400).json({
            status: "error",
            message: err.message,
        });
    }

    console.error("Unhandled error:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
});

const server = app.listen(parseInt(process.env.PORT || "3000"), "0.0.0.0", () => {
    console.log(`Server running on PORT ${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    server.close(async () => {
        await disconnectRedis();
        await disconnectDB();
        process.exit(1);
    });
});

process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    await disconnectRedis();
    await disconnectDB();
    process.exit(1);
});

process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () => {
        await disconnectRedis();
        await disconnectDB();
        process.exit(0);
    });
});
