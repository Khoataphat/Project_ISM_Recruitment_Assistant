import multer from 'multer';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const uploadResume = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
            cb(new Error('Only PDF files are allowed'));
            return;
        }
        cb(null, true);
    },
});
