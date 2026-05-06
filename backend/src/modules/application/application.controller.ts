import { Response } from "express";
import path from "path";
import { AuthRequest } from "../auth/auth.middleware";
import { submitApplication, getApplicationsByCandidate, getApplicationById, updateApplicationStatus } from "./application.service";
import { scoreApplicationWithAi } from "./ai.service";
import { hr_status } from "@prisma/client";
import { prisma } from "../../../prisma/prisma.service";

export const submit = async (req: AuthRequest, res: Response) => {
    try {
        const { jobId, coverLetter } = req.body;
        const uploadedFile = req.file;
        const resumeFilename = uploadedFile?.filename;
        const cv_url = resumeFilename
            ? `/uploads/${resumeFilename}`
            : path.posix.join("/uploads", "unknown.pdf");

        // Find candidate profile from userId
        const candidate = await prisma.candidates.findUnique({
            where: { user_id: req.userId! },
        });

        if (!candidate) {
            return res.status(403).json({ status: "error", message: "No candidate profile found" });
        }

        console.log(`[Submit] Creating application for candidate ${candidate.id} and job ${jobId}`);
        const application = await submitApplication({
            candidateId: candidate.id,
            jobId,
            cv_url,
            cover_letter: coverLetter,
        });
        console.log(`[Submit] Application created successfully with ID: ${application.id}`);

        // Trigger AI scoring in background
        scoreApplicationWithAi(application.id).catch(err => {
            console.error("Async AI scoring error:", err);
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
        const candidate = await prisma.candidates.findUnique({ where: { user_id: req.userId! } });
        if (!candidate) {
            return res.status(200).json({ status: "success", data: [] });
        }

        const applications = await getApplicationsByCandidate(candidate.id);
        res.status(200).json({ status: "success", data: applications });
    } catch (err) {
        console.error("Get applications error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getApplicationDetail = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const application = await getApplicationById(id);

        if (!application) {
            return res.status(404).json({ status: "error", message: "Application not found" });
        }

        res.status(200).json({ status: "success", data: application });
    } catch (err) {
        console.error("Get application detail error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const patchApplicationStatus = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const { status, hr_note } = req.body;

        // Map incoming string to hr_status enum
        const hrStatusMap: Record<string, hr_status> = {
            Pending: hr_status.Pending,
            Shortlisted: hr_status.Shortlisted,
            Interviewing: hr_status.Interviewing,
            Offered: hr_status.Offered,
            Accepted: hr_status.Accepted,
            Rejected: hr_status.Rejected,
        };

        const mappedStatus = hrStatusMap[status];
        if (!mappedStatus) {
            return res.status(400).json({ status: "error", message: "Invalid status value" });
        }

        const updated = await updateApplicationStatus(id, mappedStatus, hr_note);
        res.status(200).json({ status: "success", data: updated });
    } catch (err: any) {
        if (err.code === "APPLICATION_NOT_FOUND") {
            return res.status(404).json({ status: "error", message: "Application not found" });
        }
        console.error("Patch application status error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
