const RESEND_ENDPOINT = 'https://api.resend.com/emails';
const DEFAULT_FROM_ADDRESS = 'Monte Notifications <login@monte.school>';
const MAX_CAPTURED_LINKS = 20;

type MagicLinkPayload = {
  email: string;
  url: string;
  token: string;
};

export type ResendEmailMessage = {
  to: string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
  tags?: Array<{ name: string; value: string }>;
};

type InvitationEmailPayload = {
  email: string;
  invitationUrl: string;
  organizationName: string;
  role: string;
  inviterName?: string | null;
  inviterEmail?: string | null;
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

const createResendMessage = (message: ResendEmailMessage): ResendEmailMessage => ({
  from: message.from ?? getResendFromAddress(),
  ...message,
});

const createMagicLinkMessage = ({ email, url }: MagicLinkPayload): ResendEmailMessage => {
  const safeUrl = escapeHtml(url);
  const text = [
    'Sign in to Monte by clicking the link below (valid for 5 minutes):',
    '',
    url,
    '',
    'If you did not request this email you can ignore it.',
  ].join('\n');
  const html = [
    '<p>Sign in to Monte by clicking the link below (valid for 5 minutes):</p>',
    `<p><a href="${safeUrl}">${safeUrl}</a></p>`,
    '<p>If you did not request this email you can safely ignore it.</p>',
  ].join('');
  return createResendMessage({
    to: [email],
    subject: 'Your Monte sign-in link',
    text,
    html,
    tags: [
      { name: 'category', value: 'magic-link' },
    ],
  });
};

const createInvitationMessage = ({
  email,
  invitationUrl,
  organizationName,
  role,
  inviterName,
  inviterEmail,
}: InvitationEmailPayload): ResendEmailMessage => {
  const safeUrl = escapeHtml(invitationUrl);
  const friendlyRole = role === 'owner' ? 'owner' : role === 'admin' ? 'admin' : 'member';
  const inviterDisplay = inviterName ?? inviterEmail ?? 'Someone from Monte';
  const text = [
    `${inviterDisplay} invited you to join ${organizationName} on Monte as a ${friendlyRole}.`,
    '',
    'Click the link below to accept and get started:',
    '',
    invitationUrl,
    '',
    'If you weren’t expecting this invite you can safely ignore it.',
  ].join('\n');
  const html = [
    `<p>${escapeHtml(inviterDisplay)} invited you to join <strong>${escapeHtml(organizationName)}</strong> on Monte as a <strong>${escapeHtml(friendlyRole)}</strong>.</p>`,
    `<p><a href="${safeUrl}" style="display:inline-block;padding:10px 16px;border-radius:9999px;background:#0C2A65;color:#FFFFFF;text-decoration:none;font-weight:600;">Accept invitation</a></p>`,
    `<p>Or copy this link: <a href="${safeUrl}">${safeUrl}</a></p>`,
    '<p>If you weren’t expecting this invite you can safely ignore it.</p>',
  ].join('');
  return createResendMessage({
    to: [email],
    subject: `You're invited to ${organizationName} on Monte`,
    text,
    html,
    tags: [
      { name: 'category', value: 'organization-invite' },
    ],
  });
};

const sendViaResend = async (message: ResendEmailMessage) => {
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
    body: JSON.stringify(createResendMessage(message)),
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

  const message = createMagicLinkMessage(payload);
  try {
    await sendViaResend(message);
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

export const sendOrganizationInvitationEmail = async (payload: InvitationEmailPayload) => {
  try {
    await sendViaResend(createInvitationMessage(payload));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    if (reason !== 'Resend API key not configured') {
      console.warn('[organization-invite] Failed to send via Resend', reason);
    }
    console.info('[organization-invite] Invitation ready (Resend unavailable)', {
      email: payload.email,
      invitationUrl: payload.invitationUrl,
      role: payload.role,
    });
  }
};
