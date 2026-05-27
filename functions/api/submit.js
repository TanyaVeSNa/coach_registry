/**
 * Cloudflare Pages Function — proxy for coach registration.
 * Forwards form data (including base64 photo) to Apps Script.
 *
 * URL: POST /api/submit
 */
export async function onRequestPost(context) {
  const APPS_SCRIPT_URL = context.env.APPS_SCRIPT_URL;

  if (!APPS_SCRIPT_URL) {
    return Response.json(
      { success: false, error: 'APPS_SCRIPT_URL not set' },
      { status: 500 }
    );
  }

  try {
    const formData = await context.request.json();

    if (!formData || !formData.name || !formData.email) {
      return Response.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(formData),
      redirect: 'follow',
    });

    return Response.json({ success: true });
  } catch (_err) {
    return Response.json(
      { success: false, error: 'Failed to submit registration' },
      { status: 500 }
    );
  }
}
