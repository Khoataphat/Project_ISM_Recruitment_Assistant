import { Response } from "express";
import { AuthRequest } from "../auth/auth.middleware";
import { prisma } from "../../../prisma/prisma.service";
import { getApplicationById, updateApplicationStatus } from "../application/application.service";
import { hr_status } from "@prisma/client";

const hrStatusMap: Record<string, hr_status> = {
    Pending: hr_status.Pending,
    Shortlisted: hr_status.Shortlisted,
    Interviewing: hr_status.Interviewing,
    Offered: hr_status.Offered,
    Accepted: hr_status.Accepted,
    Rejected: hr_status.Rejected,
};

export const getDashboardStats = async (_req: AuthRequest, res: Response) => {
    try {
        const [totalJobs, totalApplications, totalCandidates, recentApplications] = await Promise.all([
            prisma.jobs.count({ where: { status: "Open" } }),
            prisma.applications.count(),
            prisma.candidates.count(),
            prisma.applications.findMany({
                take: 5,
                orderBy: { applied_at: "desc" },
                include: {
                    candidates: {
                        include: {
                            users: { select: { full_name: true, email: true, avatar_url: true } },
                        },
                    },
                    jobs: { select: { id: true, title: true } },
                },
            }),
        ]);

        res.status(200).json({
            status: "success",
            data: {
                stats: {
                    totalJobs,
                    totalApplications,
                    totalCandidates,
                },
                recentApplications,
            },
        });
    } catch (err) {
        console.error("Dashboard stats error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const getApplications = async (req: AuthRequest, res: Response) => {
    try {
        const { status, search, page = "1", limit = "20" } = req.query as Record<string, string>;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where: any = {};
        if (status && hrStatusMap[status]) {
            where.hr_status = hrStatusMap[status];
        }
        if (search) {
            where.OR = [
                { candidates: { users: { full_name: { contains: search, mode: "insensitive" } } } },
                { candidates: { users: { email: { contains: search, mode: "insensitive" } } } },
                { jobs: { title: { contains: search, mode: "insensitive" } } },
            ];
        }

        const [applications, total] = await Promise.all([
            prisma.applications.findMany({
                where,
                include: {
                    candidates: {
                        include: {
                            users: { select: { id: true, full_name: true, email: true, avatar_url: true } },
                        },
                    },
                    jobs: {
                        select: {
                            id: true,
                            title: true,
                            companies: { select: { name: true, logo_url: true } },
                        },
                    },
                },
                orderBy: { applied_at: "desc" },
                skip,
                take: parseInt(limit),
            }),
            prisma.applications.count({ where }),
        ]);

        res.status(200).json({
            status: "success",
            data: {
                applications,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (err) {
        console.error("Dashboard getApplications error:", err);
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
        console.error("Dashboard getApplicationDetail error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const patchStatus = async (req: AuthRequest, res: Response) => {
    try {
        const id = String(req.params.id);
        const { status, hr_note } = req.body;

        const mappedStatus = hrStatusMap[status];
        if (!mappedStatus) {
            return res.status(400).json({ status: "error", message: "Invalid status value" });
        }

        const updated = await updateApplicationStatus(id, mappedStatus, hr_note);

        res.status(200).json({
            status: "success",
            message: `Application marked as ${status}`,
            data: updated,
        });
    } catch (err: any) {
        if (err.code === "APPLICATION_NOT_FOUND") {
            return res.status(404).json({ status: "error", message: "Application not found" });
        }
        console.error("Dashboard patchStatus error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
