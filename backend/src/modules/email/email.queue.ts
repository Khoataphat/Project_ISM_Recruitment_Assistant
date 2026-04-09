export interface WelcomeEmailJob {
    type: "welcome";
    to: string;
    fullName: string;
}

export interface VerificationEmailJob {
    type: "verification";
    to: string;
    fullName: string;
    code: string;
}

export type EmailJob = WelcomeEmailJob | VerificationEmailJob;
