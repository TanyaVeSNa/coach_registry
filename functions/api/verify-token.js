/**
 * Cloudflare Pages Function — verify edit token.
 * Returns coach profile data if token is valid.
 *
 * URL: POST /api/verify-token
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
    const { token } = await context.request.json();

    if (!token) {
      return Response.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'verifyToken', token }),
      redirect: 'follow',
    });

    const text = await response.text();
    const result = JSON.parse(text);

    return Response.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (_err) {
    return Response.json(
      { success: false, error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}
