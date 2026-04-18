import { Response } from "express";
import { AuthRequest } from "../auth/auth.middleware";
import { prisma } from "../../../prisma/prisma.service";
import {
    getApplicationById,
    acceptApplication,
    rejectApplication,
} from "../application/application.service";
import { findUserById } from "../auth/auth.service";

export const getApplications = async (req: AuthRequest, res: Response) => {
    try {
        const { page, limit, status, aiStatus, search, sortBy, sortOrder } = res.locals.query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (status) where.status = status;
        if (aiStatus) where.aiStatus = aiStatus;
        if (search) {
            where.OR = [
                { user: { fullName: { contains: search, mode: "insensitive" } } },
                { user: { email: { contains: search, mode: "insensitive" } } },
                { job: { title: { contains: search, mode: "insensitive" } } },
            ];
        }

        const [applications, total] = await Promise.all([
            prisma.application.findMany({
                where,
                include: {
                    user: { select: { userId: true, email: true, fullName: true } },
                    job: { select: { jobId: true, title: true } },
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.application.count({ where }),
        ]);

        res.status(200).json({
            status: "success",
            data: {
                applications,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
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
        const applicationId = Number(req.params.id);
        const application = await getApplicationById(applicationId);

        if (!application) {
            return res.status(404).json({ status: "error", message: "Application not found" });
        }

        res.status(200).json({ status: "success", data: application });
    } catch (err) {
        console.error("Dashboard getApplicationDetail error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const accept = async (req: AuthRequest, res: Response) => {
    try {
        const applicationId = Number(req.params.id);
        const { interviewDate, interviewLocation } = req.body;

        const hr = await findUserById(req.userId!);
        const hrName = hr?.fullName ?? "HR Team";

        const updated = await acceptApplication(
            applicationId, req.userId!, interviewDate, interviewLocation, hrName,
        );

        res.status(200).json({
            status: "success",
            message: "Application accepted and interview invitation sent",
            data: updated,
        });
    } catch (err: any) {
        const errorMap: Record<string, { status: number; message: string }> = {
            APPLICATION_NOT_FOUND: { status: 404, message: "Application not found" },
            ALREADY_REVIEWED: { status: 400, message: "Application has already been reviewed" },
        };

        const mapped = errorMap[err.code];
        if (mapped) {
            return res.status(mapped.status).json({ status: "error", message: mapped.message });
        }

        console.error("Dashboard accept error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};

export const reject = async (req: AuthRequest, res: Response) => {
    try {
        const applicationId = Number(req.params.id);

        const updated = await rejectApplication(applicationId, req.userId!);

        res.status(200).json({
            status: "success",
            message: "Application rejected",
            data: updated,
        });
    } catch (err: any) {
        const errorMap: Record<string, { status: number; message: string }> = {
            APPLICATION_NOT_FOUND: { status: 404, message: "Application not found" },
            ALREADY_REVIEWED: { status: 400, message: "Application has already been reviewed" },
        };

        const mapped = errorMap[err.code];
        if (mapped) {
            return res.status(mapped.status).json({ status: "error", message: mapped.message });
        }

        console.error("Dashboard reject error:", err);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
};
