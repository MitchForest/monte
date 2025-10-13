const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM_ADDRESS = 'Monte Magic Links <login@monte.school>';
const MAX_CAPTURED_LINKS = 20;

type MagicLinkPayload = {
  email: string;
  url: string;
  token: string;
};

type CapturedMagicLink = MagicLinkPayload & {
  capturedAt: number;
};

const getEnvString = (key: string): string | undefined => {
  const value = process.env[key];
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const getResendApiKey = (): string | undefined =>
  getEnvString('MAGIC_LINK_RESEND_API_KEY') ??
  getEnvString('RESEND_API_KEY') ??
  getEnvString('RESEND_KEY');

const getResendFromAddress = (): string =>
  getEnvString('MAGIC_LINK_RESEND_FROM') ??
  getEnvString('MAGIC_LINK_FROM_EMAIL') ??
  DEFAULT_FROM_ADDRESS;

const smokeTestSecret = getEnvString('MAGIC_LINK_SMOKE_TEST_SECRET');
const capturedMagicLinks: CapturedMagicLink[] = [];

export const getCapturedMagicLinks = (secret: string): CapturedMagicLink[] => {
  if (!smokeTestSecret) {
    throw new Error('Magic link smoke-test capture is disabled.');
  }
  if (secret !== smokeTestSecret) {
    throw new Error('Invalid magic link smoke-test secret.');
  }
  return [...capturedMagicLinks];
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const createEmailContent = ({ email, url }: MagicLinkPayload) => {
  const safeUrl = escapeHtml(url);
  const text = `Sign in to Monte by clicking the link below (valid for 5 minutes):\n\n${url}\n\nIf you did not request this email you can ignore it.`;
  const html = [
    '<p>Sign in to Monte by clicking the link below (valid for 5 minutes):</p>',
    `<p><a href="${safeUrl}">${safeUrl}</a></p>`,
    '<p>If you did not request this email you can safely ignore it.</p>',
  ].join('');
  return {
    from: getResendFromAddress(),
    to: [email],
    subject: 'Your Monte sign-in link',
    text,
    html,
    tags: [
      { name: 'category', value: 'magic-link' },
    ],
  };
};

const sendViaResend = async (payload: MagicLinkPayload) => {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    throw new Error('Resend API key not configured');
  }

  const requestInit = {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createEmailContent(payload)),
  };

  const response = await fetch(RESEND_ENDPOINT, requestInit);
  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(`Resend request failed (${response.status}): ${errorBody || response.statusText}`);
  }
};

const captureMagicLink = (payload: MagicLinkPayload) => {
  if (!smokeTestSecret) return;
  capturedMagicLinks.push({
    ...payload,
    capturedAt: Date.now(),
  });
  if (capturedMagicLinks.length > MAX_CAPTURED_LINKS) {
    capturedMagicLinks.splice(0, capturedMagicLinks.length - MAX_CAPTURED_LINKS);
  }
  console.info('[magic-link][capture]', {
    email: payload.email,
    url: payload.url,
  });
};

export const sendMagicLinkEmail = async (payload: MagicLinkPayload) => {
  captureMagicLink(payload);

  try {
    await sendViaResend(payload);
    return;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    if (reason !== 'Resend API key not configured') {
      console.warn('[magic-link] Failed to send via Resend', reason);
    }
  }

  console.info('[magic-link] Magic link ready (Resend unavailable)', {
    email: payload.email,
    url: payload.url,
  });
};
