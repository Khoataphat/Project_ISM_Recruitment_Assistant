import express from "express";
import { submit, getMyApplications, getApplicationDetail, patchApplicationStatus } from "./application.controller";
import { uploadResume } from "../../shared/middleware/upload.middleware";

const router = express.Router();

// POST /applications - submit a new application (multipart with resume file)
router.post("/", uploadResume.single("resume"), submit);

// GET /applications - get logged-in candidate's applications
router.get("/", getMyApplications);

// GET /applications/:id - get one application detail
router.get("/:id", getApplicationDetail);

// PATCH /applications/:id/status - update status (HR action)
router.patch("/:id/status", patchApplicationStatus);

export default router;
