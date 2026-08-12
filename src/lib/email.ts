import 'server-only';
import { Resend } from 'resend';
import { SITE_NAME, SITE_URL } from '@/config/site';

const rawKey = process.env.RESEND_API_KEY?.trim().replace(/^["']|["']$/g, '');
const resend = rawKey ? new Resend(rawKey) : null;

const FROM_EMAIL =
  process.env.NEWSLETTER_FROM_EMAIL?.trim() || 'CreatorAI Hub <onboarding@resend.dev>';

/**
 * Send the double opt-in confirmation email.
 * Returns `{ sent: boolean }` — sent is false when no ESP is configured.
 */
export async function sendConfirmEmail(
  to: string,
  confirmUrl: string
): Promise<{ sent: boolean; error?: string; hint?: string }> {
  if (!resend) {
    return {
      sent: false,
      error: 'RESEND_API_KEY is not configured in environment variables.',
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Confirm your subscription to ${SITE_NAME}`,
      html: `
        <div style="background:#0E0F12;color:#F4F4F5;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;padding:32px 16px">
          <div style="max-width:480px;margin:0 auto;background:#15171C;border:1px solid rgba(255,255,255,.12);border-radius:20px;padding:32px;text-align:center">
            <div style="width:48px;height:48px;background:#F7C948;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:20px">
              <span style="font-size:24px;font-weight:900;color:#000">⚡</span>
            </div>
            <h1 style="color:#FFFFFF;font-size:22px;font-weight:900;margin:0 0 12px">Confirm your subscription</h1>
            <p style="color:#A1A1AA;font-size:14px;line-height:1.6;margin:0 0 24px">
              Welcome to <strong>${SITE_NAME}</strong>! Tap the button below to confirm your weekly AI Video tool alerts, verified discount codes, and hands-on test drops.
            </p>
            <p style="margin:28px 0">
              <a href="${confirmUrl}" style="display:inline-block;background:#F7C948;color:#000;text-decoration:none;font-weight:800;font-size:14px;padding:14px 28px;border-radius:12px;box-shadow:0 0 20px rgba(247,201,72,0.4)">
                Confirm my subscription →
              </a>
            </p>
            <p style="color:#71717A;font-size:11px;margin:24px 0 0;border-top:1px solid rgba(255,255,255,0.06);padding-top:16px">
              If you didn't request this email, you can safely ignore it. <a href="${SITE_URL}" style="color:#F7C948">${SITE_NAME}</a>
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('[Resend Error]:', error);
      const isDomainIssue =
        error.message?.includes('testing emails') || error.message?.includes('domain');
      return {
        sent: false,
        error: error.message,
        hint: isDomainIssue
          ? 'Resend Free Tier only sends to your own registered account email until you add & verify your custom domain in Resend Dashboard.'
          : undefined,
      };
    }

    return { sent: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown email error';
    console.error('[Resend Exception]:', msg);
    return { sent: false, error: msg };
  }
}
