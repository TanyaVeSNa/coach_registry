/**
 * Cloudflare Pages Function — request edit link via email.
 * Always returns success to prevent email enumeration.
 *
 * URL: POST /api/request-edit-link
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
    const { email } = await context.request.json();

    if (!email) {
      return Response.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    // Fire and forget — always return success
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'requestEditLink', email }),
        redirect: 'follow',
      });
    } catch (_e) { /* ignore */ }

    return Response.json({ success: true });
  } catch (_err) {
    return Response.json({ success: true });
  }
}
