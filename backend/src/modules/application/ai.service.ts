import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import { prisma } from "../../../prisma/prisma.service";
import { processing_status } from "@prisma/client";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://ai-service:8000/analyze-cv";

export const scoreApplicationWithAi = async (applicationId: string): Promise<void> => {
    try {
        console.log(`[AI Service] Starting scoring for application ${applicationId}`);

        // 1. Fetch application, job, and candidate data
        const application = await prisma.applications.findUnique({
            where: { id: applicationId },
            include: {
                jobs: true,
                candidates: {
                    include: {
                        users: true
                    }
                }
            }
        });

        if (!application) {
            console.error(`[AI Service] Application ${applicationId} not found`);
            return;
        }

        // Update status to Processing
        await prisma.applications.update({
            where: { id: applicationId },
            data: { processing_status: processing_status.Processing }
        });

        // Note: cv_url is like "/uploads/filename.pdf"
        const relativeResumePath = application.cv_url.startsWith("/") 
            ? application.cv_url.substring(1) 
            : application.cv_url;
        const resumePath = path.join(process.cwd(), relativeResumePath);
        
        if (!fs.existsSync(resumePath)) {
            throw new Error(`Resume file not found at ${resumePath}`);
        }

        const formData = new FormData();
        formData.append("file", fs.createReadStream(resumePath));
        formData.append("jd_text", application.jobs.description);

        // 3. Call AI service
        const response = await axios.post(AI_SERVICE_URL, formData, {
            headers: formData.getHeaders(),
            timeout: 60000 // Increase to 60 seconds
        });

        console.log(`[AI Service] Received response from AI service for ${applicationId}`);
        
        if (response.data?.error) {
            throw new Error(`AI Service Error: ${response.data.error}`);
        }

        console.log(`[AI Service] Data structure keys:`, Object.keys(response.data || {}));

        const { matching_data, candidate_data } = response.data;

        if (!matching_data) {
            throw new Error("AI service returned empty matching_data");
        }

        // 4. Update application with results
        // Mapping keys from Python AI service: ai_matching_score, ai_summary, ai_explanation, skills_radar
        const updateData = {
            ai_matching_score: matching_data.ai_matching_score ?? 0,
            ai_summary: {
                ai_summary: matching_data.ai_summary || "No summary available",
                ai_explanation: matching_data.ai_explanation || {}
            },
            skills_radar: matching_data.skills_radar || {},
            processing_status: processing_status.Analyzed
        };

        console.log(`[AI Service] Saving update data:`, JSON.stringify(updateData));

        await prisma.applications.update({
            where: { id: applicationId },
            data: updateData
        });

        // 5. Update candidate profile if needed (optional, depends on requirements)
        if (candidate_data) {
            await prisma.candidates.update({
                where: { id: application.candidate_id },
                data: {
                    summary: candidate_data.summary,
                    years_of_experience: candidate_data.years_of_experience || 0
                }
            });
        }

        console.log(`[AI Service] Successfully scored application ${applicationId}`);
    } catch (error: any) {
        console.error(`[AI Service] Error scoring application ${applicationId}:`, error.message);
        
        await prisma.applications.update({
            where: { id: applicationId },
            data: { processing_status: processing_status.Failed }
        });
    }
};

export const serializeApplication = (app: any) => app;
export const serializeApplications = (apps: any[]) => apps;
