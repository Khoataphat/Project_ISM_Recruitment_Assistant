import { Response } from "express";
import path from "path";
import { AuthRequest } from "../auth/auth.middleware";
import {
    submitApplication,
    getApplicationsByUser,
} from "./application.service";

export const submit = async (req: AuthRequest, res: Response) => {
    try {
        const { jobId, coverLetter } = req.body;
        const uploadedFile = req.file;
        const resumeFilename = uploadedFile?.filename;
        const resumeUrl = resumeFilename ? `/uploads/${resumeFilename}` : path.posix.join("/uploads", "unknown.pdf");

        const application = await submitApplication({
            userId: req.userId!,
            jobId,
            resumeUrl,
            coverLetter,
        });

        res.status(201).json({ status: "success", data: application });
    } catch (err: any) {
        const errorMap: Record<string, { status: number; message: string }> = {
            JOB_NOT_FOUND: { status: 404, message: "Job not found" },
            JOB_CLOSED: { status: 400, message: "This job is no longer accepting applications" },
            ALREADY_APPLIED: { status: 409, message: "You have already applied for this job" },
        };

        const mapped = errorMap[err.code];
        if (mapped) {
            return res.status(mapped.status).json({ status: "error", message: mapped.message });
        }

        console.error("Submit application error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getMyApplications = async (req: AuthRequest, res: Response) => {
    try {
        const applications = await getApplicationsByUser(req.userId!);
        res.status(200).json({ status: "success", data: applications });
    } catch (err) {
        console.error("Get applications error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
