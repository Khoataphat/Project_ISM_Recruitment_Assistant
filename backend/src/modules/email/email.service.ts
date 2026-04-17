import nodemailer from "nodemailer";

function getTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST!,
        port: Number(process.env.EMAIL_PORT!),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER!,
            pass: process.env.EMAIL_PASSWORD!,
        }
    });
}

export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendWelcomeEmail(to: string, fullName: string) {
    await getTransporter().sendMail({
        from: process.env.EMAIL_FROM!,
        to,
        subject: "Welcome to our platform",
        html: `
            <h1>Welcome, ${fullName}!</h1>
            <p>Thank you for registering. We're excited to have you on board.</p>
            <p>If you have any questions, feel free to reach out to our support team.</p>
        `,
    });
}

export async function sendVerificationEmail(to: string, fullName: string, code: string) {
    await getTransporter().sendMail({
        from: process.env.EMAIL_FROM!,
        to,
        subject: "Email Verification Code",
        html: `
            <h1>Hello, ${fullName}!</h1>
            <p>Your verification code is:</p>
            <h2 style="letter-spacing: 8px; font-size: 32px; text-align: center; padding: 16px; background: #f4f4f4; border-radius: 8px;">${code}</h2>
            <p>This code will expire in 10 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
        `,
    });
}

export async function sendThankYouEmail(to: string, fullName: string, jobTitle: string) {
    await getTransporter().sendMail({
        from: process.env.EMAIL_FROM!,
        to,
        subject: `Application Received - ${jobTitle}`,
        html: `
            <h1>Thank you, ${fullName}!</h1>
            <p>We have received your application for the position of <strong>${jobTitle}</strong>.</p>
            <p>Our team will review your application and get back to you within 5-7 business days.</p>
            <p>In the meantime, if you have any questions, feel free to reach out.</p>
            <br/>
            <p>Best regards,<br/>The Recruitment Team</p>
        `,
    });
}

export async function sendRejectionEmail(to: string, fullName: string, jobTitle: string) {
    await getTransporter().sendMail({
        from: process.env.EMAIL_FROM!,
        to,
        subject: `Application Update - ${jobTitle}`,
        html: `
            <h1>Dear ${fullName},</h1>
            <p>Thank you for your interest in the <strong>${jobTitle}</strong> position and for taking the time to apply.</p>
            <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates at this time.</p>
            <p>We truly appreciate your effort and encourage you to apply for future openings that match your skills and experience.</p>
            <p>We wish you all the best in your career journey.</p>
            <br/>
            <p>Warm regards,<br/>The Recruitment Team</p>
        `,
    });
}

export async function sendInterviewInvitationEmail(
    to: string,
    fullName: string,
    jobTitle: string,
    interviewDate: string,
    interviewLocation: string,
    hrName: string,
) {
    await getTransporter().sendMail({
        from: process.env.EMAIL_FROM!,
        to,
        subject: `Interview Invitation - ${jobTitle}`,
        html: `
            <h1>Congratulations, ${fullName}!</h1>
            <p>We are pleased to inform you that your application for <strong>${jobTitle}</strong> has been accepted.</p>
            <p>We would like to invite you for an interview. Here are the details:</p>
            <table style="border-collapse: collapse; margin: 16px 0;">
                <tr>
                    <td style="padding: 8px 16px; font-weight: bold;">Date &amp; Time:</td>
                    <td style="padding: 8px 16px;">${interviewDate}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 16px; font-weight: bold;">Location:</td>
                    <td style="padding: 8px 16px;">${interviewLocation}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 16px; font-weight: bold;">Contact Person:</td>
                    <td style="padding: 8px 16px;">${hrName}</td>
                </tr>
            </table>
            <p>Please confirm your attendance by replying to this email.</p>
            <br/>
            <p>Best regards,<br/>The Recruitment Team</p>
        `,
    });
}