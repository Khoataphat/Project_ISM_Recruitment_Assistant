import { EmailJob } from "./email.queue";
import { sendWelcomeEmail, sendVerificationEmail } from "./email.service";

export function dispatchEmail(job: EmailJob): void {
    const run = async () => {
        try {
            if (job.type === "verification") {
                await sendVerificationEmail(job.to, job.fullName, job.code);
            } else {
                await sendWelcomeEmail(job.to, job.fullName);
            }
            console.log(`[Email] Sent ${job.type} email to ${job.to}`);
        } catch (err) {
            console.error(`[Email] Failed to send ${job.type} email to ${job.to}:`, err);
        }
    };

    run();
}
