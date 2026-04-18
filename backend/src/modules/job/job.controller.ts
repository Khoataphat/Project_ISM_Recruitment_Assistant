import { Request, Response } from "express";
import { AuthRequest } from "../auth/auth.middleware";
import {
    createJob,
    getJobById,
    getVisibleJobById,
    listJobsForHr,
    listOpenJobs,
    updateJob,
} from "./job.service";

export const listPublicJobs = async (_req: Request, res: Response) => {
    try {
        const jobs = await listOpenJobs();
        res.status(200).json({ status: "success", data: jobs });
    } catch (err) {
        console.error("List public jobs error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const listHrJobs = async (_req: AuthRequest, res: Response) => {
    try {
        const jobs = await listJobsForHr();
        res.status(200).json({ status: "success", data: jobs });
    } catch (err) {
        console.error("List HR jobs error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getPublicJobDetail = async (req: Request, res: Response) => {
    try {
        const jobId = Number(req.params.id);
        const job = await getVisibleJobById(jobId);

        if (!job) {
            return res.status(404).json({ status: "error", message: "Job not found" });
        }

        res.status(200).json({ status: "success", data: job });
    } catch (err) {
        console.error("Get public job detail error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getHrJobDetail = async (req: AuthRequest, res: Response) => {
    try {
        const jobId = Number(req.params.id);
        const job = await getJobById(jobId);

        if (!job) {
            return res.status(404).json({ status: "error", message: "Job not found" });
        }

        res.status(200).json({ status: "success", data: job });
    } catch (err) {
        console.error("Get HR job detail error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const createJobHandler = async (req: AuthRequest, res: Response) => {
    try {
        const job = await createJob({
            ...req.body,
            createdBy: req.userId!,
        });

        res.status(201).json({
            status: "success",
            message: "Job created successfully",
            data: job,
        });
    } catch (err) {
        console.error("Create job error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const updateJobHandler = async (req: AuthRequest, res: Response) => {
    try {
        const jobId = Number(req.params.id);
        const job = await updateJob(jobId, {
            ...req.body,
            updatedBy: req.userId!,
        });

        res.status(200).json({
            status: "success",
            message: "Job updated successfully",
            data: job,
        });
    } catch (err: any) {
        if (err.code === "JOB_NOT_FOUND") {
            return res.status(404).json({ status: "error", message: "Job not found" });
        }

        console.error("Update job error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
