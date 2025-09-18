import { loadServerEnv, requireServerEnv } from "@monte/shared";
import { Resend } from "resend";

let cachedClient: Resend | null = null;

function getResendClient(): Resend {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = requireServerEnv("RESEND_API_KEY");

  cachedClient = new Resend(apiKey);
  return cachedClient;
}

export type SummaryEmailPayload = {
  to: string[];
  subject: string;
  html: string;
  text?: string;
};

export async function sendSummaryEmail(
  payload: SummaryEmailPayload,
): Promise<void> {
  const resend = getResendClient();
  const { RESEND_FROM_ADDRESS } = loadServerEnv();

  await resend.emails.send({
    from: RESEND_FROM_ADDRESS ?? "teach@monte.app",
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });
}

type WorkspaceInviteEmailPayload = {
  to: string;
  code: string;
  organizationName: string;
};

export async function sendWorkspaceInviteEmail(
  payload: WorkspaceInviteEmailPayload,
): Promise<void> {
  const resend = getResendClient();
  const { RESEND_FROM_ADDRESS } = loadServerEnv();

  const subject = `You're invited to ${payload.organizationName} on Monte`;
  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <h2 style="margin-bottom: 16px;">You're invited to join ${payload.organizationName}</h2>
      <p style="margin-bottom: 12px;">Enter this code when signing up to join the workspace:</p>
      <p style="font-size: 24px; letter-spacing: 4px; font-weight: 600; margin-bottom: 20px;">${payload.code}</p>
      <p style="margin-bottom: 12px;">If you weren't expecting this invite, you can ignore this email.</p>
      <p style="color: #636363; font-size: 12px;">Monte • Montessori operations platform</p>
    </div>
  `;

  await resend.emails.send({
    from: RESEND_FROM_ADDRESS ?? "teach@monte.app",
    to: payload.to,
    subject,
    html,
    text: `You're invited to join ${payload.organizationName} on Monte. Your code is ${payload.code}.`,
  });
}
