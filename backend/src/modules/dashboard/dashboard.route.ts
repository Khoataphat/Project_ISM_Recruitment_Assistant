import express from "express";
import { getDashboardStats, getApplications, getApplicationDetail, patchStatus } from "./dashboard.controller";

const router = express.Router();

// GET /dashboard/stats
router.get("/stats", getDashboardStats);

// GET /dashboard/applications - list all apps with candidate + job details
router.get("/applications", getApplications);

// GET /dashboard/applications/:id - single application detail
router.get("/applications/:id", getApplicationDetail);

// PATCH /dashboard/applications/:id/status - update hr_status (Shortlisted, Rejected, Interviewing, etc.)
router.patch("/applications/:id/status", patchStatus);

export default router;
