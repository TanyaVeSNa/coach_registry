/**
 * Vercel Serverless Function -- save edited profile.
 *
 * Forwards the updated profile data (with token) to
 * Google Apps Script for validation and persistence.
 * Supports base64-encoded photo uploads up to 10 MB.
 *
 * URL: POST /api/save-profile
 * Body: { token, name, specializations, ... }
 */

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbz-iaJYXG4oIrth327C0tRxUVQHfHoLx28REhUlc0d2fdRVdpivc2TvwYdb59sGeaLE/exec';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  const data = req.body;

  if (!data || !data.token) {
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
        action: 'saveProfile',
        ...data,
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
      error: 'Failed to save profile',
    });
  }
}
