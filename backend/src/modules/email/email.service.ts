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
    })
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

export function generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
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
    })
}