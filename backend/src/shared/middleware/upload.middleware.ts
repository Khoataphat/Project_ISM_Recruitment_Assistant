import crypto from "crypto";
import fs from "fs";
import path from "path";
import multer from "multer";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const uploadDir = `${process.cwd()}/uploads`;

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req: any, _file: any, cb: any) => {
        cb(null, uploadDir);
    },
    filename: (_req: any, file: any, cb: any) => {
        const extension = path.extname(file.originalname).toLowerCase() || ".pdf";
        cb(null, `${crypto.randomUUID()}${extension}`);
    },
});

export const uploadResume = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            cb(new Error('Only PDF files are allowed'));
            return;
        }
        cb(null, true);
    },
});
