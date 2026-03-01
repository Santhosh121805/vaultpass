import nodemailer from "nodemailer";
import { env } from "../utils/env.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!env.ENABLE_EMAIL_NOTIFICATIONS) {
    console.log("Email notifications disabled, skipping:", options.to);
    return;
  }

  try {
    await transporter.sendMail({
      from: env.SMTP_USER,
      ...options,
    });
    console.log("Email sent to:", options.to);
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

export async function sendCheckInReminderEmail(
  userEmail: string,
  daysRemaining: number,
  vaultName?: string
): Promise<void> {
  const vaultInfo = vaultName ? `for vault "${vaultName}"` : "";
  const emailHtml = `
    <h2>Check-In Reminder</h2>
    <p>Your VaultPass vault check-in is due in <strong>${daysRemaining} days</strong> ${vaultInfo}.</p>
    <p>Log in to your account to check in now and keep your vault active.</p>
    <a href="${process.env.FRONTEND_URL || "https://vaultpass.app"}/dashboard" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Check In Now
    </a>
  `;

  await sendEmail({
    to: userEmail,
    subject: `Reminder: Check-In Due Soon ${vaultInfo}`,
    html: emailHtml,
  });
}

export async function sendOverdueEmail(userEmail: string): Promise<void> {
  const emailHtml = `
    <h2>⚠️ Missed Check-In</h2>
    <p>You missed your vault check-in. Your grace period has started.</p>
    <p>You have 7 days to check in before your vault is triggered and beneficiaries are notified.</p>
    <a href="${process.env.FRONTEND_URL || "https://vaultpass.app"}/dashboard" style="background-color: #ff6b6b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Check In Now
    </a>
  `;

  await sendEmail({
    to: userEmail,
    subject: "⚠️ VaultPass: Missed Check-In - Grace Period Active",
    html: emailHtml,
  });
}

export async function sendGracePeriodWarningEmail(
  userEmail: string,
  daysRemaining: number
): Promise<void> {
  const emailHtml = `
    <h2>⏰ Grace Period Ending Soon</h2>
    <p>Your grace period ends in <strong>${daysRemaining} days</strong>.</p>
    <p>After this, your beneficiaries will be notified and distribution will be triggered.</p>
    <a href="${process.env.FRONTEND_URL || "https://vaultpass.app"}/dashboard" style="background-color: #ff6b6b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Check In Now to Cancel
    </a>
  `;

  await sendEmail({
    to: userEmail,
    subject: "⏰ VaultPass: Grace Period Ending Soon",
    html: emailHtml,
  });
}

export async function sendDistributionNoticeEmail(emails: string[]): Promise<void> {
  const emailHtml = `
    <h2>📦 Vault Distribution Initiated</h2>
    <p>The vault has been triggered for distribution. You are listed as a beneficiary.</p>
    <p>Check your VaultPass account to claim your allocated assets.</p>
    <a href="${process.env.FRONTEND_URL || "https://vaultpass.app"}/claim" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      View Claim Portal
    </a>
  `;

  for (const email of emails) {
    await sendEmail({
      to: email,
      subject: "📦 VaultPass: Vault Distribution Available",
      html: emailHtml,
    });
  }
}

export async function sendClaimLinkEmail(
  beneficiaryEmail: string,
  claimLink: string,
  beneficiaryName: string
): Promise<void> {
  const emailHtml = `
    <h2>🔓 Claim Your Assets</h2>
    <p>Hello ${beneficiaryName},</p>
    <p>The vault has been triggered, and you are eligible to claim your inherited assets.</p>
    <p>Use the link below to access the claim portal:</p>
    <a href="${claimLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
      Claim Assets
    </a>
    <p style="margin-top: 20px; color: #666; font-size: 12px;">
      This link will expire in 7 days.
    </p>
  `;

  await sendEmail({
    to: beneficiaryEmail,
    subject: "🔓 Claim Your Inherited Assets - VaultPass",
    html: emailHtml,
  });
}

export async function testEmail(recipientEmail: string): Promise<void> {
  const emailHtml = `
    <h2>✅ Test Email from VaultPass</h2>
    <p>This is a test email to verify your email configuration is working correctly.</p>
    <p>If you received this email, everything is set up properly!</p>
  `;

  await sendEmail({
    to: recipientEmail,
    subject: "✅ VaultPass Test Email",
    html: emailHtml,
  });
}
