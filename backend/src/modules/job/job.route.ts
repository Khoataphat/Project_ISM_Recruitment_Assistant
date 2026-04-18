import express from "express";
import { Role } from "@prisma/client";
import { authMiddleware, authorizeRole } from "../auth/auth.middleware";
import {
    createJobHandler,
    getHrJobDetail,
    getPublicJobDetail,
    listHrJobs,
    listPublicJobs,
    updateJobHandler,
} from "./job.controller";
import {
    createJobSchema,
    jobIdParamSchema,
    updateJobSchema,
    validateBody,
    validateParams,
} from "./dto/job.validator";

const router = express.Router();

router.get("/hr/manage", authMiddleware, authorizeRole(Role.HR), listHrJobs);
router.get("/hr/manage/:id", authMiddleware, authorizeRole(Role.HR), validateParams(jobIdParamSchema), getHrJobDetail);
router.post("/", authMiddleware, authorizeRole(Role.HR), validateBody(createJobSchema), createJobHandler);
router.patch("/:id", authMiddleware, authorizeRole(Role.HR), validateParams(jobIdParamSchema), validateBody(updateJobSchema), updateJobHandler);
router.get("/", listPublicJobs);
router.get("/:id", validateParams(jobIdParamSchema), getPublicJobDetail);

export default router;
