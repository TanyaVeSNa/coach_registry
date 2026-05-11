/**
 * Vercel Serverless Function -- request edit link via email.
 *
 * Always returns success to prevent email enumeration.
 * The actual email is sent by Google Apps Script if the
 * email belongs to an approved coach.
 *
 * URL: POST /api/request-edit-link
 * Body: { email: string }
 */

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  if (!APPS_SCRIPT_URL) {
    return res.status(500).json({
      success: false,
      error: 'APPS_SCRIPT_URL environment variable is not set',
    });
  }

  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required',
    });
  }

  // Always return success to prevent email enumeration
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'requestEditLink',
        email,
      }),
      redirect: 'follow',
    });
  } catch (_err) {
    // Silently ignore -- always return success
  }

  return res.status(200).json({ success: true });
}
