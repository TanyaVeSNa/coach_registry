/**
 * Vercel Serverless Function -- verify edit token.
 *
 * Sends the token to Google Apps Script for verification.
 * Returns the coach profile data if valid, or an error
 * if the token is invalid/expired/used.
 *
 * URL: POST /api/verify-token
 * Body: { token: string }
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

  const { token } = req.body || {};

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Token is required',
    });
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({
        action: 'verifyToken',
        token,
      }),
      redirect: 'follow',
    });

    const text = await response.text();
    const result = JSON.parse(text);

    return res.status(result.success ? 200 : 400)
      .json(result);
  } catch (_err) {
    return res.status(500).json({
      success: false,
      error: 'Failed to verify token',
    });
  }
}
