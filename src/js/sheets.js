/**
 * ICF Registry — Google Sheets Data Fetcher
 *
 * Fetches coach data from a published Google Sheet (CSV export).
 * Falls back to local mock data in development.
 *
 * Usage:
 *   import { fetchCoaches } from './sheets.js';
 *   const coaches = await fetchCoaches('SHEET_ID');
 *   // or for dev: const coaches = await fetchCoaches();
 */

/**
 * @typedef {Object} Coach
 * @property {string} id
 * @property {string} name
 * @property {string} photo
 * @property {string[]} specializations
 * @property {string} icfLevel — 'ACC' | 'PCC' | 'MCC' | 'Member'
 * @property {string[]} languages
 * @property {string} format — 'online' | 'offline' | 'both'
 * @property {string} city
 * @property {number} priceMin
 * @property {number} priceMax
 * @property {string} bio1
 * @property {string} bio1Lang — 'en', 'ru', 'el' or empty
 * @property {string} bio2
 * @property {string} bio2Lang — 'en', 'ru', 'el' or empty
 * @property {string} bio — alias for bio1 (backward compat)
 * @property {string} email
 * @property {string} whatsapp
 * @property {string} telegram
 * @property {string} instagram
 * @property {string} linkedin
 * @property {string} facebook
 * @property {string} status — 'approved' | 'pending' | 'rejected'
 */

/**
 * Build the public CSV export URL for a Google Sheet.
 * @param {string} sheetId
 * @returns {string}
 */
function buildSheetURL(sheetId) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv`;
}

/**
 * Parse a CSV string into an array of string arrays.
 * Handles quoted fields with commas and newlines.
 * @param {string} csv
 * @returns {string[][]}
 */
function parseCSV(csv) {
  const rows = [];
  let current = '';
  let inQuotes = false;
  /** @type {string[]} */
  let row = [];

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    const next = csv[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(current.trim());
        current = '';
      } else if (char === '\n' || (char === '\r' && next === '\n')) {
        row.push(current.trim());
        current = '';
        if (row.length > 1 || row[0] !== '') {
          rows.push(row);
        }
        row = [];
        if (char === '\r') i++;
      } else {
        current += char;
      }
    }
  }

  // Last field / row
  if (current || row.length > 0) {
    row.push(current.trim());
    rows.push(row);
  }

  return rows;
}

/**
 * Split a delimited string (comma or semicolon separated)
 * into a trimmed array, filtering empty strings.
 * @param {string} value
 * @returns {string[]}
 */
function splitList(value) {
  if (!value) return [];
  return value
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Normalize a format string to 'online' | 'offline' | 'both'.
 * @param {string} value
 * @returns {string}
 */
/**
 * Normalize language name to 2-letter code.
 * Accepts: 'Russian', 'ru', 'RU', 'english', 'EN', 'Greek', 'el', etc.
 * @param {string} value
 * @returns {string} 'en', 'ru', 'el', or ''
 */
function normalizeLangCode(value) {
  const lower = (value || '').toLowerCase().trim();
  if (lower === 'en' || lower === 'english') return 'en';
  if (lower === 'ru' || lower === 'russian') return 'ru';
  if (lower === 'el' || lower === 'greek' || lower === 'ελληνικά') return 'el';
  return lower;
}

function normalizeFormat(value) {
  const lower = (value || '').toLowerCase();
  if (lower.includes('both') || (lower.includes('online') && lower.includes('offline'))) {
    return 'both';
  }
  if (lower.includes('offline')) return 'offline';
  return 'online';
}

/**
 * Normalize ICF level string to standard values.
 * @param {string} value
 * @returns {string}
 */
function normalizeLevel(value) {
  const upper = (value || '').toUpperCase();
  if (upper.includes('MCC')) return 'MCC';
  if (upper.includes('PCC')) return 'PCC';
  if (upper.includes('ACC')) return 'ACC';
  return 'Member';
}

/**
 * Map CSV header names to normalized keys.
 * Supports both English column names and common variants.
 * @type {Record<string, string>}
 */
const HEADER_MAP = {
  // English
  'id': 'id',
  'name': 'name',
  'photo': 'photo',
  'specializations': 'specializations',
  'specialization': 'specializations',
  'icf level': 'icfLevel',
  'icflevel': 'icfLevel',
  'level': 'icfLevel',
  'credential': 'icfLevel',
  'languages': 'languages',
  'language': 'languages',
  'format': 'format',
  'price min': 'priceMin',
  'pricemin': 'priceMin',
  'price_min': 'priceMin',
  'price max': 'priceMax',
  'pricemax': 'priceMax',
  'price_max': 'priceMax',
  'price': 'priceMin',
  'bio': 'bio1',
  'bio 1': 'bio1',
  'bio1': 'bio1',
  'bio 1 language': 'bio1Lang',
  'bio1language': 'bio1Lang',
  'bio1lang': 'bio1Lang',
  'bio 2': 'bio2',
  'bio2': 'bio2',
  'bio 2 language': 'bio2Lang',
  'bio2language': 'bio2Lang',
  'bio2lang': 'bio2Lang',
  'description': 'bio1',
  'about': 'bio1',
  'email': 'email',
  'whatsapp': 'whatsapp',
  'telegram': 'telegram',
  'instagram': 'instagram',
  'linkedin': 'linkedin',
  'facebook': 'facebook',
  'city': 'city',
  'status': 'status',
  'icf membership': 'icfMembership',
  'icfmembership': 'icfMembership',
  'membership': 'icfMembership',
  'submitted at': 'submittedAt',
  'submittedat': 'submittedAt',
  'timestamp': 'submittedAt',
};

/**
 * Convert CSV rows (with header) into Coach objects.
 * @param {string[][]} rows — first row is headers
 * @returns {Coach[]}
 */
function csvToCoaches(rows) {
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => {
    const key = h.toLowerCase().trim();
    return HEADER_MAP[key] || key;
  });

  return rows.slice(1).map((row, index) => {
    /** @type {Record<string, string>} */
    const raw = {};
    headers.forEach((header, i) => {
      raw[header] = row[i] || '';
    });

    return {
      id: raw.id || String(index + 1),
      name: raw.name || '',
      photo: normalizePhotoUrl(raw.photo || ''),
      specializations: splitList(raw.specializations),
      icfLevel: normalizeLevel(raw.icfLevel),
      languages: splitList(raw.languages),
      format: normalizeFormat(raw.format),
      city: raw.city || '',
      priceMin: parseInt(raw.priceMin, 10) || 0,
      priceMax: parseInt(raw.priceMax, 10) || 0,
      bio1: raw.bio1 || '',
      bio1Lang: normalizeLangCode(raw.bio1Lang),
      bio2: raw.bio2 || '',
      bio2Lang: normalizeLangCode(raw.bio2Lang),
      get bio() { return this.bio1; },
      email: raw.email || '',
      whatsapp: raw.whatsapp || '',
      telegram: raw.telegram || '',
      instagram: raw.instagram || '',
      linkedin: raw.linkedin || '',
      facebook: raw.facebook || '',
      status: normalizeStatus(raw.status),
    };
  }).filter((coach) => coach.name);
}

/**
 * Normalize a status string to a known value.
 * When the column is missing or empty, defaults to 'approved'
 * for backward compatibility with sheets that lack a Status column.
 * @param {string} value
 * @returns {string}
 */
/**
 * Convert Google Drive share links to direct thumbnail URLs.
 * @param {string} url
 * @returns {string}
 */
function normalizePhotoUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();

  // Google Drive file link: drive.google.com/file/d/{ID}/...
  const driveMatch = trimmed.match(
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/
  );
  if (driveMatch) {
    return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w256`;
  }

  // Google Drive open link: drive.google.com/open?id={ID}
  const openMatch = trimmed.match(
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/
  );
  if (openMatch) {
    return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w256`;
  }

  return trimmed;
}

function normalizeStatus(value) {
  const lower = (value || '').toLowerCase().trim();
  if (lower === 'pending') return 'pending';
  if (lower === 'rejected') return 'rejected';
  // Default: approved (backward compatible — no Status column = approved)
  return 'approved';
}

/**
 * Filter coaches to only include approved entries.
 * @param {Coach[]} coaches
 * @returns {Coach[]}
 */
function filterApproved(coaches) {
  return coaches.filter((coach) => coach.status === 'approved');
}

/**
 * Fetch coaches from a published Google Sheet.
 * If no sheetId is provided, loads from local mock data.
 *
 * @param {string} [sheetId] — Google Sheet ID
 * @returns {Promise<Coach[]>}
 * @throws {Error} if fetch or parse fails
 */
export async function fetchCoaches(sheetId) {
  if (!sheetId) {
    const allCoaches = await loadMockData();
    return filterApproved(allCoaches);
  }

  const allCoaches = await fetchSheetTab(sheetId, 'Submissions');
  return filterApproved(allCoaches);
}

/**
 * Fetch all submissions from a specific Google Sheet tab.
 * Returns ALL coaches regardless of status (for admin view).
 *
 * @param {string} sheetId — Google Sheet ID
 * @param {string} [tabName='Submissions'] — Sheet tab name
 * @returns {Promise<Coach[]>}
 * @throws {Error} if fetch or parse fails
 */
export async function fetchSubmissions(sheetId, tabName = 'Submissions') {
  if (!sheetId) {
    throw new Error('Sheet ID is required for fetchSubmissions');
  }
  return fetchSheetTab(sheetId, tabName);
}

/**
 * Fetch and parse coach data from a specific Google Sheet tab.
 * @param {string} sheetId
 * @param {string} [tabName] — tab/sheet name (omit for default first tab)
 * @returns {Promise<Coach[]>}
 * @throws {Error} if fetch or parse fails
 */
async function fetchSheetTab(sheetId, tabName) {
  let url = buildSheetURL(sheetId);
  if (tabName) {
    url += `&sheet=${encodeURIComponent(tabName)}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  let response;
  try {
    response = await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sheet data: ${response.status} ${response.statusText}`
    );
  }

  const csv = await response.text();
  const rows = parseCSV(csv);
  return csvToCoaches(rows);
}

/**
 * Load mock coach data from local JSON file.
 * Uses import.meta.url to resolve path relative to this JS module,
 * so it works regardless of which HTML page loads the widget.
 * @returns {Promise<Coach[]>}
 */
async function loadMockData() {
  const baseUrl = new URL('.', import.meta.url).href;
  const mockUrl = new URL('../data/mock-coaches.json', baseUrl).href;
  const response = await fetch(mockUrl);

  if (!response.ok) {
    throw new Error('Failed to load mock data');
  }

  return response.json();
}
