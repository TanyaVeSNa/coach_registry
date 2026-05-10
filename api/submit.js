/**
 * Vercel Serverless Function — proxy for coach registration form.
 *
 * Receives POST from the registration form (same domain = no CORS issues,
 * no ad-blocker interference). Forwards data to Google Apps Script.
 * Returns real success/error response to the client.
 *
 * URL: POST /api/submit
 * Body: JSON with form data
 */

/**
 * Vercel config: increase body size limit to accommodate
 * base64-encoded photo uploads (~7 MB for a 5 MB file).
 */
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbydF_JjV1HaBHhW-TtOpQY5z4K6pg7mZ_qezW5wDKzDsLb-IFweXFQA5tyunHnxTeaU/exec';

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const formData = req.body;

    if (!formData || !formData.name || !formData.email) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields (name, email)',
      });
    }

    // Forward to Google Apps Script as form-encoded payload
    const body = new URLSearchParams();
    body.append('payload', JSON.stringify(formData));

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      body: body,
      redirect: 'follow',
    });

    // Apps Script returns a redirect, then HTML/JSON
    // If we got here without throwing, it worked
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: 'Failed to submit registration',
    });
  }
}
