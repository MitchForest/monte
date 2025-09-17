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
