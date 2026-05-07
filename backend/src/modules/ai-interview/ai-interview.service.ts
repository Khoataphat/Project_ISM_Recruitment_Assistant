import { PrismaClient, processing_status } from "@prisma/client";
import { prisma } from "../../../prisma/prisma.service";
import axios from "axios";
import fs from "fs";

export class AiInterviewService {
    /**
     * Insert a new record into interviews table with processing_status.Processing
     */
    async createInterviewRecord(applicationId: string, videoUrl: string) {
        return await prisma.interviews.create({
            data: {
                application_id: applicationId,
                video_url: videoUrl,
                status: processing_status.Processing,
            },
        });
    }

    /**
     * Update an application's interview_video_url to reflect the new upload
     */
    async updateApplicationVideoUrl(applicationId: string, videoUrl: string) {
        return await prisma.applications.update({
            where: { id: applicationId },
            data: { interview_video_url: videoUrl },
        });
    }

    /**
     * Trigger the AI service asynchronously without blocking the main event loop
     */
    triggerAiAnalysisAsync(applicationId: string, filePath: string, questions: any[]) {
        setImmediate(async () => {
            try {
                console.log(`[AI-Service-Trigger] Sending video for application ${applicationId} to AI service`);
                
                const aiServiceUrl = process.env.AI_INTERVIEW_URL || "http://ai-service:8000/analyze-interview";
                
                const FormData = require('form-data');
                const form = new FormData();
                
                // Quy tắc 2: Đọc stream file và gắn thêm filename 'video.webm'
                form.append('file', fs.createReadStream(filePath), 'video.webm');
                
                // Gửi context chứa applicationId và questions
                const context = {
                    application_id: applicationId,
                    questions: questions
                };
                form.append("context", JSON.stringify(context));

                // Quy tắc 3: BẮT BUỘC truyền headers từ formData và bổ sung timeout 2 phút
                const response = await axios.post(aiServiceUrl, form, {
                    headers: {
                        ...form.getHeaders()
                    },
                    timeout: 120000 // 2 minutes
                });

                const result = response.data;

                // Chuẩn hệ thống phân tán: Kiểm tra tính hợp lệ của dữ liệu AI trả về
                if (!result || result.interview_score === undefined) {
                    throw new Error("Dữ liệu AI trả về rỗng hoặc không hợp lệ");
                }

                // Cập nhật kết quả vào DB
                await prisma.interviews.update({
                    where: { application_id: applicationId },
                    data: {
                        status: processing_status.Analyzed,
                        interview_score: result.interview_score,
                        communication_score: result.communication_score,
                        attitude_score: result.attitude_score,
                        environment_note: result.environment_note,
                        feedback_summary: result.feedback,
                        updated_at: new Date()
                    }
                });

                console.log(`[AI-Service-Trigger] Successfully triggered analysis and updated DB for application ${applicationId}`);
            } catch (error: any) {
                // Quy tắc 4: Bắt lỗi chi tiết từ FastAPI
                console.error(`[AI-Service-Trigger] Failed to trigger AI analysis for application ${applicationId}:`, 
                    error.message, 
                    error.response?.data || "No detailed error from AI Service"
                );
                
                try {
                    const interview = await prisma.interviews.findUnique({ where: { application_id: applicationId } });
                    if (interview) {
                        await prisma.interviews.update({
                            where: { id: interview.id },
                            data: { status: processing_status.Failed },
                        });
                    }
                } catch (dbError: any) {
                    console.error(`[AI-Service-Trigger] Failed to update interview status to Failed:`, dbError.message);
                }
            }
        });
    }

    /**
     * Get interview result by applicationId
     */
    async getInterviewResult(applicationId: string) {
        return await prisma.interviews.findUnique({
            where: { application_id: applicationId },
            select: {
                id: true,
                application_id: true,
                video_url: true,
                status: true,
                interview_score: true,
                communication_score: true,
                confidence_score: true,
                relevance_score: true,
                attitude_score: true,
                environment_note: true,
                feedback_summary: true,
                feedback_strengths: true,
                feedback_weaknesses: true,
                created_at: true,
                updated_at: true,
                applications: {
                    select: {
                        jobs: {
                            select: {
                                company_id: true
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Get interview questions by jobId
     */
    async getInterviewQuestions(jobId: string) {
        // Tạm thời fix cứng mảng 3 câu hỏi mặc định như yêu cầu
        const defaultQuestions = [
            "Please introduce yourself and your background.",
            "Why are you interested in this position?",
            "Describe a challenging project you worked on and how you handled it."
        ];
        
        // Map to standard object format expected by Frontend: { id, content }
        return defaultQuestions.map((q, index) => ({
            id: `q${index + 1}`,
            content: q
        }));
    }
}

export const aiInterviewService = new AiInterviewService();
