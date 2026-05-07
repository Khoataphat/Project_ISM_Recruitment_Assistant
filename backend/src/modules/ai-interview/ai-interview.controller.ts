import { Request, Response } from "express";
import { aiInterviewService } from "./ai-interview.service";
import { prisma } from "../../../prisma/prisma.service";

export class AiInterviewController {
    public async submitInterview(req: any, res: Response): Promise<void> {
        try {
            // application_id could come from req.body or params. Let's assume body
            // questions might also come from body as a stringified JSON array
            const { applicationId, questions } = req.body;
            
            if (!applicationId) {
                res.status(400).json({ status: "error", message: "applicationId is required" });
                return;
            }

            if (!req.file) {
                res.status(400).json({ status: "error", message: "Video file is required" });
                return;
            }

            const videoPath = req.file.path as string;
            const videoUrl = `/uploads/interviews/${req.file.filename as string}`;

            // Check if interview record already exists for this application
            // For simplicity, we just create. If it fails due to unique constraint, we can handle it
            try {
                await aiInterviewService.createInterviewRecord(applicationId, videoUrl);
                await aiInterviewService.updateApplicationVideoUrl(applicationId, videoUrl);
            } catch (dbError: any) {
                // If record exists, we could just update it instead, or ignore.
                if (dbError.code === 'P2002') { // Unique constraint violation
                    console.log(`[AI-Interview] Record already exists for application ${applicationId}, proceeding.`);
                } else {
                    throw dbError;
                }
            }

            // Parse questions if passed as string
            let parsedQuestions = [];
            if (questions) {
                try {
                    parsedQuestions = typeof questions === 'string' ? JSON.parse(questions) : questions;
                } catch (e) {
                    console.warn(`[AI-Interview] Could not parse questions for application ${applicationId}`);
                }
            }

            // Trigger AI Service asynchronously
            aiInterviewService.triggerAiAnalysisAsync(applicationId, videoPath, parsedQuestions);

            // Return fast response according to Acceptance Criteria
            res.status(200).json({ status: "PROCESSING" });
        } catch (error: any) {
            console.error("[AI-Interview] Error submitting interview:", error);
            res.status(500).json({ status: "error", message: "Internal server error" });
        }
    }

    public async getInterviewQuestions(req: any, res: Response): Promise<void> {
        try {
            const jobId = req.params.id; // Updated to match /:id route

            // Use the service to get interview questions
            const questions = await aiInterviewService.getInterviewQuestions(jobId);

            res.status(200).json({
                status: "success",
                data: questions
            });
        } catch (error: any) {
            console.error("[AI-Interview] Error getting interview questions:", error);
            res.status(500).json({ status: "error", message: "Internal server error" });
        }
    }

    /**
     * @swagger
     * /ai-interview/result/{applicationId}:
     *   get:
     *     summary: Lấy kết quả phỏng vấn AI của ứng viên
     *     description: API dành riêng cho HR để xem điểm số chi tiết và nhận xét từ AI cho phần phỏng vấn video. Trả về communication_score, confidence_score, relevance_score, attitude_score, environment_note, các text nhận xét và URL video.
     *     tags: [AI Interview]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: applicationId
     *         schema:
     *           type: string
     *           format: uuid
     *         required: true
     *         description: ID của application
     *     responses:
     *       200:
     *         description: Lấy dữ liệu thành công
     *       401:
     *         description: Chưa đăng nhập
     *       403:
     *         description: Không có quyền truy cập
     *       404:
     *         description: Không tìm thấy kết quả phỏng vấn
     *       500:
     *         description: Lỗi hệ thống
     */
    public async getInterviewResult(req: any, res: Response): Promise<void> {
        try {
            const userId = req.userId;
            const applicationId = req.params.applicationId;

            // Lấy hrProfile để kiểm tra quyền truy cập (HR only)
            const hrProfile = await prisma.hr_profiles.findUnique({
                where: { user_id: userId },
                select: { company_id: true }
            });

            if (!hrProfile) {
                res.status(403).json({ status: "error", message: "HR profile not found" });
                return;
            }

            const interviewResult = await aiInterviewService.getInterviewResult(applicationId);

            if (!interviewResult) {
                res.status(404).json({ status: "error", message: "Interview result not found" });
                return;
            }

            // Security check: HR chỉ được xem kết quả của công ty mình
            const companyId = interviewResult.applications?.jobs?.company_id;
            if (companyId !== hrProfile.company_id) {
                res.status(403).json({ status: "error", message: "Forbidden: You do not have access to this application" });
                return;
            }

            // Xóa thông tin applications khỏi response để gọn nhẹ
            const { applications, ...resultData } = interviewResult;

            res.status(200).json({
                status: "success",
                data: resultData
            });

        } catch (error: any) {
            console.error("[AI-Interview] Error getting interview result:", error);
            res.status(500).json({ status: "error", message: "Internal server error" });
        }
    }
}

export const aiInterviewController = new AiInterviewController();
