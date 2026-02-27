import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;

function getTransporter() {
  if (!env.smtpHost || !env.smtpPort || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
  }

  return transporter;
}

export async function sendInviteEmail(email, inviteLink, inviterName) {
  const activeTransporter = getTransporter();
  if (!activeTransporter) return { sent: false, reason: 'smtp_not_configured' };

  await activeTransporter.sendMail({
    from: env.smtpFrom,
    to: email,
    subject: `${inviterName} invited you to Event Scheduler`,
    text: `You were invited to join Event Scheduler. Accept here: ${inviteLink}`
  });

  return { sent: true };
}
