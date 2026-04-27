import express from "express";
import { user_role } from "@prisma/client";
import { authMiddleware, authorizeRole } from "../auth/auth.middleware";
import {
    createJobHandler,
    getHrJobDetail,
    getPublicJobDetail,
    listHrJobs,
    listPublicJobs,
    updateJobHandler,
} from "./job.controller";

const router = express.Router();

// HR-specific routes (authenticated)
router.get("/hr", authMiddleware, authorizeRole(user_role.HR), listHrJobs);
router.get("/hr/:id", authMiddleware, authorizeRole(user_role.HR), getHrJobDetail);
router.post("/", authMiddleware, authorizeRole(user_role.HR), createJobHandler);
router.patch("/:id", authMiddleware, authorizeRole(user_role.HR), updateJobHandler);

// Public routes
router.get("/", listPublicJobs);
router.get("/:id", getPublicJobDetail);

export default router;
