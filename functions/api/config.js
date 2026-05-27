/**
 * Cloudflare Pages Function — get frontend config.
 * Proxies to Google Apps Script Settings sheet.
 *
 * URL: GET /api/config
 */
export async function onRequestGet(context) {
  const APPS_SCRIPT_URL = context.env.APPS_SCRIPT_URL;

  if (!APPS_SCRIPT_URL) {
    return Response.json(
      { success: false, error: 'APPS_SCRIPT_URL not set' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'getConfig' }),
      redirect: 'follow',
    });
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch (_e) {
      return Response.json(
        { success: false, error: 'Invalid Apps Script response' },
        { status: 502 }
      );
    }

    return Response.json(data, {
      headers: {
        'Cache-Control':
          'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (_err) {
    return Response.json(
      { success: false, error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}
