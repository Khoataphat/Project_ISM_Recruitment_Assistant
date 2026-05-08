import fs from "fs";
import { Request, Response, NextFunction } from 'express';

// PDF magic bytes: %PDF (hex 25 50 44 46)
const PDF_MAGIC_BYTES = Buffer.from([0x25, 0x50, 0x44, 0x46]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const validateFile = (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                status: "error",
                message: `File is required (field: ${fieldName})`,
            });
        }

        if (file.size > MAX_FILE_SIZE) {
            return res.status(413).json({
                status: "error",
                message: "File too large. Maximum size is 5MB",
            });
        }

        if (!file.path) {
            return res.status(400).json({
                status: "error",
                message: "Invalid file content",
            });
        }

        const fd = fs.openSync(file.path, "r");
        const header = Buffer.alloc(4);
        const bytesRead = fs.readSync(fd, header, 0, 4, 0);
        fs.closeSync(fd);

        if (bytesRead < 4) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({
                status: "error",
                message: "Invalid file content",
            });
        }

        if (!header.equals(PDF_MAGIC_BYTES)) {
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            return res.status(400).json({
                status: "error",
                message: "Only PDF files are allowed. The uploaded file is not a valid PDF",
            });
        }

        next();
    };
};
