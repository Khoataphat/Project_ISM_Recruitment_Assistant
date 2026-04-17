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

export interface ThankYouEmailJob {
    type: "thank-you";
    to: string;
    fullName: string;
    jobTitle: string;
}

export interface InterviewInvitationEmailJob {
    type: "interview-invitation";
    to: string;
    fullName: string;
    jobTitle: string;
    interviewDate: string;
    interviewLocation: string;
    hrName: string;
}

export interface RejectionEmailJob {
    type: "rejection";
    to: string;
    fullName: string;
    jobTitle: string;
}

export type EmailJob =
    | WelcomeEmailJob
    | VerificationEmailJob
    | ThankYouEmailJob
    | InterviewInvitationEmailJob
    | RejectionEmailJob;
