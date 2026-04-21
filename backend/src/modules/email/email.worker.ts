import { EmailJob } from "./email.queue";
import {
    sendWelcomeEmail,
    sendVerificationEmail,
    sendThankYouEmail,
    sendInterviewInvitationEmail,
    sendRejectionEmail,
} from "./email.service";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function executeEmailJob(job: EmailJob): Promise<void> {
    switch (job.type) {
        case "welcome":
            return sendWelcomeEmail(job.to, job.fullName);
        case "verification":
            return sendVerificationEmail(job.to, job.fullName, job.code);
        case "thank-you":
            return sendThankYouEmail(job.to, job.fullName, job.jobTitle);
        case "interview-invitation":
            return sendInterviewInvitationEmail(
                job.to, job.fullName, job.jobTitle,
                job.interviewDate, job.interviewLocation, job.hrName,
            );
        case "rejection":
            return sendRejectionEmail(job.to, job.fullName, job.jobTitle);
    }
}

export function dispatchEmail(job: EmailJob): void {
    const run = async () => {
        for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                await executeEmailJob(job);
                console.log(`[Email] Sent ${job.type} email to ${job.to}`);
                return;
            } catch (err) {
                console.error(
                    `[Email] Attempt ${attempt}/${MAX_RETRIES} failed for ${job.type} email to ${job.to}:`,
                    err,
                );
                if (attempt < MAX_RETRIES) {
                    await sleep(RETRY_DELAY_MS * attempt);
                }
            }
        }
        console.error(`[Email] All ${MAX_RETRIES} attempts exhausted for ${job.type} email to ${job.to}`);
    };

    run();
}
