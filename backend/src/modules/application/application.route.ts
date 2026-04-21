import express from "express";
import { submit, getMyApplications } from "./application.controller";
import { uploadResume } from "../../shared/middleware/upload.middleware";
import { validateFile } from "../../shared/middleware/fileValidation.middleware";
import { applicationSchema, validateBody } from "./dto/application.validator";

const router = express.Router();

router.post(
    "/",
    uploadResume.single("resume"),
    validateFile("resume"),
    validateBody(applicationSchema),
    submit,
);

router.get("/", getMyApplications);

export default router;
