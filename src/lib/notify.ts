import nodemailer from 'nodemailer';
import { env } from '@/lib/env';
import { site } from '@/config/site';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Send an internal founder notification via Gmail SMTP.
 * Fire-and-forget — never throws. Safe to call without awaiting.
 */
export async function sendNotification(subject: string, html: string): Promise<void> {
  const gmailUser = env.GMAIL_USER;
  const gmailPass = env.GMAIL_APP_PASSWORD;
  const notifyTo = env.FEEDBACK_TO || gmailUser;
  if (!gmailUser || !gmailPass || !notifyTo) return;

  await nodemailer
    .createTransport({ service: 'gmail', auth: { user: gmailUser, pass: gmailPass } })
    .sendMail({ from: gmailUser, to: notifyTo, subject, html })
    .catch(() => {});
}

/**
 * Send a user-facing transactional email via Gmail SMTP (order confirmation,
 * delivery link, magic link, etc.). Fire-and-forget — never throws.
 */
export async function sendUserEmail(to: string, subject: string, html: string): Promise<void> {
  const gmailUser = env.GMAIL_USER;
  const gmailPass = env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailPass || !to) return;

  await nodemailer
    .createTransport({ service: 'gmail', auth: { user: gmailUser, pass: gmailPass } })
    .sendMail({ from: gmailUser, to, subject, html })
    .catch(() => {});
}

/** Build a simple monospaced notification email body. */
export function notifyHtml(title: string, rows: [string, string][]): string {
  const rowsHtml = rows
    .map(([k, v]) => `<p><strong>${escapeHtml(k)}:</strong> ${v.startsWith('<') ? v : escapeHtml(v)}</p>`)
    .join('');
  return `
    <div style="font-family: monospace; padding: 20px; max-width: 500px;">
      <h2 style="margin: 0 0 16px;">${title}</h2>
      ${rowsHtml}
      <hr style="margin: 16px 0; border: 1px solid #333;" />
      <p style="color: #666; font-size: 12px;">
        Sent from <strong>${site.name}</strong> &mdash;
        <a href="${site.url}">${site.url}</a>
      </p>
    </div>
  `;
}
