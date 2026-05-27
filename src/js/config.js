/**
 * ICF Registry -- Remote Configuration Loader
 *
 * Fetches frontend config from /api/config (which reads
 * from the Settings sheet in Google Sheets).
 *
 * Config includes: brand name, colors, fonts, location,
 * country code, sheet ID.
 *
 * Results are cached in memory for the page session
 * and in localStorage for 5 minutes.
 *
 * @module config
 */

const CACHE_KEY = 'icf_registry_config';
const CACHE_TTL_MS = 5 * 60 * 1000;

/** @type {RemoteConfig|null} */
let cachedConfig = null;

/**
 * @typedef {Object} RemoteConfig
 * @property {string} brandName
 * @property {string} registryName
 * @property {string} siteUrl
 * @property {string} editPage
 * @property {string} sheetId
 * @property {string} location
 * @property {string} countryCode
 * @property {string} logoUrl
 * @property {{ primary: string, secondary: string,
 *              accent: string, surface: string }} colors
 * @property {{ heading: string, body: string }} fonts
 */

/**
 * Try to load config from localStorage cache.
 * @returns {RemoteConfig|null}
 */
function loadFromCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (Date.now() - cached.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return cached.config;
  } catch (_err) {
    return null;
  }
}

/**
 * Save config to localStorage cache.
 * @param {RemoteConfig} config
 */
function saveToCache(config) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      config,
    }));
  } catch (_err) {
    // localStorage unavailable — ignore
  }
}

/**
 * Fetch remote config from /api/config.
 * Uses in-memory cache, then localStorage, then network.
 *
 * @param {string} [apiBase=''] - base URL for API calls
 * @returns {Promise<RemoteConfig|null>}
 */
export async function fetchConfig(apiBase = '') {
  // In-memory cache (instant)
  if (cachedConfig) return cachedConfig;

  // localStorage cache (no network)
  const fromCache = loadFromCache();
  if (fromCache) {
    cachedConfig = fromCache;
    return cachedConfig;
  }

  // Network fetch
  try {
    const url = apiBase
      ? `${apiBase.replace(/\/submit$/, '')}/config`
      : '/api/config';
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.success && data.config) {
      cachedConfig = data.config;
      saveToCache(cachedConfig);
      return cachedConfig;
    }
    return null;
  } catch (_err) {
    return null;
  }
}

/**
 * Apply remote config to the page:
 * - Override CSS custom properties (colors, fonts)
 * - Load Google Fonts dynamically
 *
 * @param {RemoteConfig} config
 * @param {HTMLElement} container
 */
export function applyConfig(config, container) {
  if (!config) return;

  // Colors and fonts are defined in main.css for this instance.
  // Remote config overrides are disabled to prevent Settings sheet
  // from overwriting the ICCS brand design.
  // To re-enable for a different instance, uncomment the blocks below.
}

/**
 * Dynamically load Google Fonts if not already present.
 * @param {{ heading: string, body: string }} fonts
 */
function loadGoogleFonts(fonts) {
  const families = [];
  if (fonts.heading) {
    families.push(
      `${fonts.heading}:wght@200;300;400;500;600`
    );
  }
  if (fonts.body) {
    families.push(
      `${fonts.body}:wght@200;300;400;500;600`
    );
  }
  if (families.length === 0) return;

  const familyParam = families
    .map((f) => `family=${f.replace(/ /g, '+')}`)
    .join('&');
  const href =
    `https://fonts.googleapis.com/css2?${familyParam}&display=swap`;

  // Check if already loaded
  const existing = document.querySelector(
    `link[href="${href}"]`
  );
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

/**
 * Clear the config cache (useful for testing).
 */
export function clearConfigCache() {
  cachedConfig = null;
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (_err) {
    // ignore
  }
}
