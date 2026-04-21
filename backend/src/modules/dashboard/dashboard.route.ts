import express from "express";
import { getApplications, getApplicationDetail, accept, reject } from "./dashboard.controller";
import { dashboardQuerySchema, validateQuery } from "./dto/dashboard.validator";
import {
    applicationIdParamSchema,
    acceptApplicationSchema,
    validateBody,
    validateParams,
} from "../application/dto/application.validator";

const router = express.Router();

router.get("/applications", validateQuery(dashboardQuerySchema), getApplications);
router.get("/applications/:id", validateParams(applicationIdParamSchema), getApplicationDetail);
router.patch("/applications/:id/accept", validateParams(applicationIdParamSchema), validateBody(acceptApplicationSchema), accept);
router.patch("/applications/:id/reject", validateParams(applicationIdParamSchema), reject);

export default router;
