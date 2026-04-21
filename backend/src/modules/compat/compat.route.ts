import express from "express";
import { Role } from "@prisma/client";
import { authMiddleware, authorizeRole } from "../auth/auth.middleware";
import { uploadResume } from "../../shared/middleware/upload.middleware";
import { validateFile } from "../../shared/middleware/fileValidation.middleware";
import {
    applyCompat,
    createJobCompat,
    deleteJobCompat,
    getAppliedJobsCompat,
    getCandidateDetailCompat,
    getCandidateResultCompat,
    getJobCandidatesCompat,
    getJobCompat,
    getSubmittedCvCompat,
    listCandidatesCompat,
    listJobsCompat,
    updateCandidateStatusCompat,
    updateJobCompat,
} from "./compat.controller";
import {
    validateLegacyApply,
    validateLegacyCandidateStatus,
    validateLegacyJob,
} from "./compat.validator";

const router = express.Router();

router.get("/jobs", listJobsCompat);
router.get("/jobs/:id", getJobCompat);
router.post("/jobs", authMiddleware, authorizeRole(Role.HR), validateLegacyJob, createJobCompat);
router.put("/jobs/:id", authMiddleware, authorizeRole(Role.HR), validateLegacyJob, updateJobCompat);
router.delete("/jobs/:id", authMiddleware, authorizeRole(Role.HR), deleteJobCompat);

router.post("/apply", uploadResume.single("cvFile"), validateFile("cvFile"), validateLegacyApply, applyCompat);
router.get("/candidates/:email/applied", getAppliedJobsCompat);
router.get("/candidates/:email/cv/:pdf", getSubmittedCvCompat);

router.get("/jobs/:id/candidates", authMiddleware, authorizeRole(Role.HR), getJobCandidatesCompat);
router.get("/candidates", authMiddleware, authorizeRole(Role.HR), listCandidatesCompat);
router.get("/candidates/:id", authMiddleware, authorizeRole(Role.HR), getCandidateDetailCompat);
router.patch(
    "/candidates/:id",
    authMiddleware,
    authorizeRole(Role.HR),
    validateLegacyCandidateStatus,
    updateCandidateStatusCompat,
);

router.get("/jobs/:id/candidates/:email/result", getCandidateResultCompat);

export default router;
