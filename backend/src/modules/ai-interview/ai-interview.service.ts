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
                
                // Assuming ai-service is available at http://ai-service:8000
                const aiServiceUrl = process.env.AI_SERVICE_URL || "http://ai-service:8000/analyze-interview";
                
                // In a real scenario, we might send the filePath or a readable stream
                // Here we send the file path assuming the AI service shares the same volume
                // or we could use FormData if we need to send the actual file stream.
                // The Dev Notes say: "đính kèm file stream và JSON questions"
                // Let's use form-data to send the actual stream.

                const FormData = require('form-data');
                const form = new FormData();
                
                form.append("application_id", applicationId);
                form.append("video", fs.createReadStream(filePath));
                form.append("questions", JSON.stringify(questions));

                await axios.post(aiServiceUrl, form, {
                    headers: {
                        ...form.getHeaders()
                    }
                });

                console.log(`[AI-Service-Trigger] Successfully triggered analysis for application ${applicationId}`);
            } catch (error: any) {
                console.error(`[AI-Service-Trigger] Failed to trigger AI analysis for application ${applicationId}:`, error.message);
                
                // Update interview status to Failed if AI trigger fails
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
}

export const aiInterviewService = new AiInterviewService();
