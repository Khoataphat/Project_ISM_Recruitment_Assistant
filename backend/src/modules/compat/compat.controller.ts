import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { AuthRequest } from "../auth/auth.middleware";
import {
    createLegacyJob,
    deleteLegacyJob,
    findLegacyApplicationFile,
    getLegacyAppliedJobs,
    getLegacyCandidateDetail,
    getLegacyCandidateResult,
    getLegacyJob,
    getLegacyJobCandidates,
    listLegacyCandidates,
    listLegacyJobs,
    submitLegacyApplication,
    updateLegacyCandidateStatus,
    updateLegacyJob,
} from "./compat.service";
import { findUserById } from "../auth/auth.service";

function readParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

export async function listJobsCompat(_req: Request, res: Response) {
    try {
        const jobs = await listLegacyJobs();
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Compat list jobs error:", error);
        res.status(500).json({ message: "Failed" });
    }
}

export async function getJobCompat(req: Request, res: Response) {
    try {
        const jobId = Number(req.params.id);
        const job = await getLegacyJob(jobId);

        if (!job) {
            return res.status(404).json({ message: "Failed" });
        }

        res.status(200).json(job);
    } catch (error) {
        console.error("Compat get job error:", error);
        res.status(500).json({ message: "Failed" });
    }
}

export async function createJobCompat(req: AuthRequest, res: Response) {
    try {
        const result = await createLegacyJob({
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,
            tags: req.body.tags,
            location: req.body.location,
            minSalary: req.body.minSalary,
            maxSalary: req.body.maxSalary,
            createdBy: req.userId!,
        });

        res.status(201).json(result);
    } catch (error) {
        console.error("Compat create job error:", error);
        res.status(500).json({ message: "Failed" });
    }
}

export async function updateJobCompat(req: AuthRequest, res: Response) {
    try {
        const jobId = Number(req.params.id);
        const result = await updateLegacyJob(jobId, {
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,
            tags: req.body.tags,
            location: req.body.location,
            minSalary: req.body.minSalary,
            maxSalary: req.body.maxSalary,
            updatedBy: req.userId!,
        });

        if (!result) {
            return res.status(404).json({ message: "Failed" });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error("Compat update job error:", error);
        res.status(500).json({ message: "Failed" });
    }
}

export async function deleteJobCompat(req: AuthRequest, res: Response) {
    try {
        const success = await deleteLegacyJob(Number(req.params.id));
        res.status(success ? 200 : 404).json({ message: success ? "Passed" : "Failed" });
    } catch (error) {
        console.error("Compat delete job error:", error);
        res.status(500).json({ message: "Failed" });
    }
}

export async function applyCompat(req: Request, res: Response) {
    try {
        const uploadedFile = req.file;
        const resumeFilename = uploadedFile?.filename;
        const resumeUrl = resumeFilename ? `/uploads/${resumeFilename}` : path.posix.join("/uploads", "unknown.pdf");

        const result = await submitLegacyApplication({
            fullName: req.body.fullName,
            email: req.body.email,
            jobId: Number(req.body.jobId),
            resumeUrl,
        });

        res.status(201).json(result);
    } catch (error: any) {
        if (error.code === "JOB_NOT_FOUND") {
            return res.status(404).json({ message: "Failed" });
        }
        if (error.code === "JOB_CLOSED" || error.code === "ALREADY_APPLIED" || error.code === "INVALID_ROLE") {
            return res.status(400).json({ message: error.message });
        }

        console.error("Compat apply error:", error);
        res.status(500).json({ message: "Failed" });
    }
}

export async function getAppliedJobsCompat(req: Request, res: Response) {
    try {
        const email = readParam(req.params.email);
        if (!email) {
            return res.status(400).json({ message: "Failed" });
        }

        const data = await getLegacyAppliedJobs(email);
        res.status(200).json(data);
    } catch (error) {
        console.error("Compat applied jobs error:", error);
        res.status(500).json({ message: "Failed" });
    }
}

export async function getSubmittedCvCompat(req: Request, res: Response) {
    try {
        const email = readParam(req.params.email);
        const pdf = readParam(req.params.pdf);
        if (!email || !pdf) {
            return res.status(400).json({ message: "Failed" });
        }

        const pdfName = path.basename(pdf);
        const filePath = await findLegacyApplicationFile(email, pdfName);

        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({ message: "Failed" });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error("Compat get submitted cv error:", error);
        res.status(500).json({ message: "Failed" });
    }
}

export async function getJobCandidatesCompat(req: Request, res: Response) {
    try {
        const data = await getLegacyJobCandidates(Number(req.params.id));
        res.status(200).json(data);
    } catch (error) {
        console.error("Compat job candidates error:", error);
        res.status(500).json({ message: "Failed" });
    }
}

export async function listCandidatesCompat(req: Request, res: Response) {
    try {
        const jobId = req.query.jobId ? Number(req.query.jobId) : undefined;
        const data = await listLegacyCandidates(jobId);
        res.status(200).json(data);
    } catch (error) {
        console.error("Compat list candidates error:", error);
        res.status(500).json({ message: "Failed" });
    }
}

export async function getCandidateDetailCompat(req: Request, res: Response) {
    try {
        const data = await getLegacyCandidateDetail(Number(req.params.id));

        if (!data) {
            return res.status(404).json({ message: "Failed" });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("Compat candidate detail error:", error);
        res.status(500).json({ message: "Failed" });
    }
}

export async function updateCandidateStatusCompat(req: AuthRequest, res: Response) {
    try {
        const hr = await findUserById(req.userId!);
        await updateLegacyCandidateStatus({
            applicationId: Number(req.params.id),
            status: req.body.status,
            reviewedBy: req.userId!,
            interviewDate: req.body.interviewDate,
            interviewLocation: req.body.interviewLocation,
            hrName: hr?.fullName,
        });

        res.status(200).json({ message: "Updated" });
    } catch (error: any) {
        if (error.code === "APPLICATION_NOT_FOUND") {
            return res.status(404).json({ message: "Failed" });
        }
        if (error.code === "ALREADY_REVIEWED" || error.code === "INVALID_STATUS") {
            return res.status(400).json({ message: error.message });
        }

        console.error("Compat update candidate status error:", error);
        res.status(500).json({ message: "Failed" });
    }
}

export async function getCandidateResultCompat(req: Request, res: Response) {
    try {
        const email = readParam(req.params.email);
        if (!email) {
            return res.status(400).json({ message: "Failed" });
        }

        const data = await getLegacyCandidateResult(Number(req.params.id), email);

        if (!data) {
            return res.status(404).json({ message: "Failed" });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error("Compat candidate result error:", error);
        res.status(500).json({ message: "Failed" });
    }
}
