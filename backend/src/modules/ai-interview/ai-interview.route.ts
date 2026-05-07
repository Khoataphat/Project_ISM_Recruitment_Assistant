import { Router } from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { aiInterviewController } from "./ai-interview.controller";
import { authMiddleware, authorizeRole } from "../auth/auth.middleware";

const router = Router();

// Ensure the upload directory exists
const uploadDir = path.join(process.cwd(), "uploads", "interviews");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
    destination: (req: any, file: any, cb: any) => {
        cb(null, uploadDir);
    },
    filename: (req: any, file: any, cb: any) => {
        const applicationId = req.body.applicationId;
        if (!applicationId) {
            return cb(new Error("applicationId is required in form-data before the file"), "");
        }
        // Save as {applicationId}.webm
        cb(null, `${applicationId}.webm`);
    }
});

// Multer validation config
const fileFilter = (req: any, file: any, cb: any) => {
    // Check if file is webm
    if (file.mimetype === "video/webm" || path.extname(file.originalname).toLowerCase() === ".webm") {
        cb(null, true);
    } else {
        cb(new Error("Only .webm files are allowed"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB
    }
});

// POST /ai-interview/submit
router.post("/submit", upload.single("video"), aiInterviewController.submitInterview);

// GET /ai-interview/questions/:id
router.get("/questions/:id", aiInterviewController.getInterviewQuestions);

// GET /ai-interview/result/:applicationId
router.get(
    "/result/:applicationId",
    authMiddleware,
    authorizeRole("HR"),
    aiInterviewController.getInterviewResult
);

export default router;
