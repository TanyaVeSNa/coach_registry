/**
 * ICF Registry -- Coach Card Rendering Module
 *
 * Renders individual coach cards with:
 * - Avatar (photo or initials placeholder with deterministic color)
 * - Name + ICF credential badge (MCC/PCC/ACC/Member)
 * - Bio (3-line clamp)
 * - Specialization tags
 * - Meta row (price, format, languages)
 * - Contact block (WhatsApp, Telegram, Email)
 * - Social links (LinkedIn, Facebook, Instagram)
 *
 * @module cards
 */

import { t, getCurrentLanguage, translateSpec } from './i18n.js';
import { renderContactBlock, isSafeUrl } from './contacts.js';

/* ---------------------------------------------------------------
   SVG Icons (inline, 14-16px, used in meta row and contacts)
   --------------------------------------------------------------- */

const ICONS = {
  globe: `<svg width="14" height="14" viewBox="0 0 16 16"
    fill="none" stroke="currentColor" stroke-width="1.3"
    aria-hidden="true">
    <circle cx="8" cy="8" r="6.5"/>
    <path d="M1.5 8h13M8 1.5c-2 2.5-2 9.5 0 13
      M8 1.5c2 2.5 2 9.5 0 13"/>
  </svg>`,

  monitor: `<svg width="14" height="14" viewBox="0 0 16 16"
    fill="none" stroke="currentColor" stroke-width="1.3"
    aria-hidden="true">
    <rect x="1.5" y="2" width="13" height="9" rx="1.5"/>
    <path d="M5.5 14h5M8 11v3"/>
  </svg>`,

  mapPin: `<svg width="14" height="14" viewBox="0 0 16 16"
    fill="none" stroke="currentColor" stroke-width="1.3"
    aria-hidden="true">
    <path d="M8 1.5a4.5 4.5 0 0 1 4.5 4.5c0 3.5-4.5 8.5-4.5
      8.5S3.5 9.5 3.5 6A4.5 4.5 0 0 1 8 1.5z"/>
    <circle cx="8" cy="6" r="1.5"/>
  </svg>`,

  price: `<svg width="14" height="14" viewBox="0 0 16 16"
    fill="none" stroke="currentColor" stroke-width="1.3"
    aria-hidden="true">
    <circle cx="8" cy="8" r="6.5"/>
    <path d="M8 4v8M5.5 6.5c0-1 1-1.5 2.5-1.5s2.5.7 2.5
      1.5-1.2 1.5-2.5 1.7-2.5.7-2.5 1.5 1 1.5 2.5 1.5
      2.5-.5 2.5-1.5"/>
  </svg>`,

};


/* ---------------------------------------------------------------
   Badge configuration per ICF level
   --------------------------------------------------------------- */

/** @type {Record<string, { icon: string, cssClass: string }>} */
const BADGE_CONFIG = {
  MCC: { icon: '\u2726', cssClass: 'icf-badge--mcc' },
  PCC: { icon: '\u25B2', cssClass: 'icf-badge--pcc' },
  ACC: { icon: '\u25CF', cssClass: 'icf-badge--acc' },
  ACSTH: { icon: '\u25CB', cssClass: 'icf-badge--acsth' },
  'Level 2': { icon: '\u25B3', cssClass: 'icf-badge--level2' },
  'Level 1': { icon: '\u25B3', cssClass: 'icf-badge--level1' },
  Member: { icon: '', cssClass: 'icf-badge--member' },
};

/* ---------------------------------------------------------------
   Utility: deterministic pastel color from a string
   --------------------------------------------------------------- */

/**
 * Generate a deterministic HSL color from a name string.
 * Uses a simple hash to produce a hue, with fixed saturation
 * and lightness for pleasant, distinct pastels.
 * @param {string} name
 * @returns {string} CSS hsl() color
 */
function nameToColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32-bit integer
  }
  const hue = Math.abs(hash) % 360;
  // Saturation 45-65%, lightness 35-45% for rich but not neon tones
  const saturation = 45 + (Math.abs(hash >> 8) % 20);
  const lightness = 35 + (Math.abs(hash >> 16) % 10);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}


/**
 * Extract initials from a coach name (first letter of first
 * and last word, uppercase).
 * @param {string} name
 * @returns {string} 1-2 character initials
 */
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
}



/* ---------------------------------------------------------------
   Utility: escape HTML to prevent XSS
   --------------------------------------------------------------- */

/**
 * Escape HTML special characters in a string.
 * @param {string} str
 * @returns {string}
 */
function esc(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}


/* ---------------------------------------------------------------
   Bio language selection
   --------------------------------------------------------------- */

/**
 * Get the best bio text for a given UI language.
 * Priority:
 *   1. bio whose language matches the UI language
 *   2. bio1 as fallback
 * @param {import('./sheets.js').Coach} coach
 * @param {string} lang — current UI language ('en', 'ru', 'el')
 * @returns {string}
 */
export function getBioForLanguage(coach, lang) {
  // 1. Exact match for requested language
  if (coach.bio1Lang === lang) return coach.bio1 || '';
  if (coach.bio2Lang === lang) return coach.bio2 || '';
  // 2. Fallback to English
  if (coach.bio1Lang === 'en') return coach.bio1 || '';
  if (coach.bio2Lang === 'en') return coach.bio2 || '';
  // 3. Fallback to first bio
  return coach.bio1 || coach.bio || '';
}


/* ---------------------------------------------------------------
   Card section renderers
   --------------------------------------------------------------- */

/**
 * Render the avatar element (photo or placeholder).
 * @param {import('./sheets.js').Coach} coach
 * @returns {string} HTML
 */
function renderAvatar(coach) {
  if (coach.photo && isSafeUrl(coach.photo)) {
    return `<img
      class="icf-avatar"
      src="${esc(coach.photo)}"
      alt="${esc(coach.name)}"
      loading="lazy"
    >`;
  }

  const initials = getInitials(coach.name);

  return `<div
    class="icf-avatar-placeholder"
    role="img"
    aria-label="${esc(coach.name)}"
  >${esc(initials)}</div>`;
}


/**
 * Render the ICF credential badge.
 * @param {string} level -- 'MCC' | 'PCC' | 'ACC' | 'Member'
 * @returns {string} HTML
 */
function renderBadge(level) {
  if (!level || level === 'Member') return '';
  const config = BADGE_CONFIG[level] || BADGE_CONFIG.Member;
  const icon = config.icon ? `${config.icon} ` : '';
  const noIcfSuffix = ['ACSTH', 'Level 1', 'Level 2'];
  const label = noIcfSuffix.includes(level) ? level : `${level} ICF`;

  return `<span class="icf-badge ${config.cssClass}"
    >${icon}${esc(label)}</span>`;
}


/**
 * Render the card top section (avatar + name + badge).
 * @param {import('./sheets.js').Coach} coach
 * @returns {string} HTML
 */
function renderCardTop(coach) {
  return `
    <div class="icf-card__top">
      ${renderAvatar(coach)}
      <div class="icf-card__name-block">
        <div class="icf-card__name">${esc(coach.name)}</div>
        ${renderBadge(coach.icfLevel)}
      </div>
    </div>`;
}


/**
 * Render the bio paragraph with 3-line clamp + optional "Read more".
 * @param {string} bio
 * @param {boolean} hasMore — whether full bio is longer than clamp
 * @returns {string} HTML
 */
function renderBio(bio) {
  if (!bio) return '';
  return `<p class="icf-card__bio">${esc(bio)}</p>`;
}


/**
 * Render specialization tags.
 * @param {string[]} specializations
 * @returns {string} HTML
 */
function renderTags(specializations) {
  if (!specializations || specializations.length === 0) return '';

  const tags = specializations
    .map((s) => `<span class="icf-tag">${esc(translateSpec(s))}</span>`)
    .join('');

  return `<div class="icf-tags">${tags}</div>`;
}


/**
 * Render the price string for the meta row.
 * @param {number} priceMin
 * @param {number} priceMax
 * @returns {string}
 */
function formatPrice(priceMin, priceMax) {
  if (!priceMin && !priceMax) {
    return t('metaPriceOnRequest');
  }
  if (priceMin === priceMax || !priceMax) {
    return `\u20AC${priceMin} ${t('metaPerSession')}`;
  }
  return `\u20AC${priceMin}\u2013${priceMax} ${t('metaPerSession')}`;
}


/**
 * Get the format icon(s) and label(s) for the meta row.
 * Returns an array to support showing separate items for
 * "both" format (online + city).
 * @param {string} format -- 'online' | 'offline' | 'both'
 * @param {string} [city] -- optional city name
 * @returns {Array<{ icon: string, label: string }>}
 */
function getFormatMeta(format, city) {
  switch (format) {
    case 'offline':
      if (city) {
        return [{ icon: ICONS.mapPin, label: city }];
      }
      return [{ icon: ICONS.mapPin, label: t('formatOffline') }];
    case 'both':
      if (city) {
        return [
          { icon: ICONS.monitor, label: t('formatOnline') },
          { icon: ICONS.mapPin, label: city },
        ];
      }
      return [{ icon: ICONS.monitor, label: t('formatBoth') }];
    default:
      return [{ icon: ICONS.monitor, label: t('formatOnline') }];
  }
}


/**
 * Render the meta row (languages, format, price).
 * @param {import('./sheets.js').Coach} coach
 * @returns {string} HTML
 */
function renderMeta(coach) {
  const langText = coach.languages.join(', ');
  const formatItems = getFormatMeta(coach.format, coach.city);
  const priceText = formatPrice(coach.priceMin, coach.priceMax);

  const formatHTML = formatItems
    .map((item) => `<span class="icf-meta__item">
        ${item.icon}
        ${esc(item.label)}
      </span>`)
    .join('');

  return `
    <div class="icf-meta">
      <span class="icf-meta__item">
        ${ICONS.globe}
        ${esc(langText)}
      </span>
      ${formatHTML}
      <span class="icf-meta__item">
        ${ICONS.price}
        ${esc(priceText)}
      </span>
    </div>`;
}



/* ---------------------------------------------------------------
   Card assembly
   --------------------------------------------------------------- */

/**
 * Render a single coach card.
 * @param {import('./sheets.js').Coach} coach
 * @returns {string} HTML
 */
function renderCard(coach, index) {
  const contact = renderContactBlock(coach);
  const divider = contact ? '<hr class="icf-divider">' : '';
  const bio = getBioForLanguage(coach, getCurrentLanguage());

  return `
    <article class="icf-card" aria-label="${esc(coach.name)}"
      data-coach-index="${index}">
      ${renderCardTop(coach)}
      ${renderBio(bio)}
      ${renderTags(coach.specializations)}
      ${renderMeta(coach)}
      ${divider}
      ${contact}
    </article>`;
}


/* ---------------------------------------------------------------
   Public API
   --------------------------------------------------------------- */

/* ---------------------------------------------------------------
   Modal: full coach profile
   --------------------------------------------------------------- */

/** @type {import('./sheets.js').Coach[]|null} */
let currentCoaches = null;

/**
 * Render the modal HTML for a coach.
 * @param {import('./sheets.js').Coach} coach
 * @returns {string} HTML
 */
function renderModal(coach) {
  const bio = getBioForLanguage(coach, getCurrentLanguage());
  const contact = renderContactBlock(coach);
  const divider = contact ? '<hr class="icf-divider">' : '';

  return `
    <div class="icf-modal-overlay" role="dialog"
      aria-label="${esc(coach.name)}">
      <div class="icf-modal">
        <button type="button" class="icf-modal__close"
          aria-label="${t('closeModal')}">&times;</button>
        ${renderCardTop(coach)}
        <p class="icf-modal__bio">${esc(bio)}</p>
        ${renderTags(coach.specializations)}
        ${renderMeta(coach)}
        ${divider}
        ${contact}
      </div>
    </div>`;
}

/**
 * Open the coach profile modal.
 * @param {number} index
 */
function openModal(index) {
  if (!currentCoaches || !currentCoaches[index]) return;
  closeModal();

  const coach = currentCoaches[index];
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderModal(coach);
  const overlay = wrapper.firstElementChild;
  const registry = document.querySelector('.icf-registry')
    || document.body;
  registry.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  requestAnimationFrame(() => overlay.classList.add('is-visible'));

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay
      || e.target.closest('.icf-modal__close')) {
      closeModal();
    }
  });
}

/** Close any open modal. */
function closeModal() {
  const overlay = document.querySelector('.icf-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('is-visible');
  overlay.addEventListener('transitionend', () => overlay.remove(), {
    once: true,
  });
  // Fallback if no transition fires
  setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 300);
  document.body.style.overflow = '';
}

/** Global keydown for Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});


/* ---------------------------------------------------------------
   Public API
   --------------------------------------------------------------- */

/**
 * Render coach cards into the given container.
 * Replaces container content with a grid of cards,
 * or an empty state message if no coaches match.
 *
 * @param {import('./sheets.js').Coach[]} coaches
 * @param {HTMLElement} container
 * @returns {void}
 */
export function renderCards(coaches, container) {
  container.innerHTML = '';
  currentCoaches = coaches;

  if (!coaches || coaches.length === 0) {
    container.innerHTML = `
      <div class="icf-empty-state">
        <p data-i18n="emptyState">${t('emptyState')}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = coaches
    .map((coach, i) => renderCard(coach, i))
    .join('');

  // Attach click delegation once per container
  if (!container._icfModalBound) {
    container._icfModalBound = true;
    container.addEventListener('click', (e) => {
      // Skip clicks on links/buttons inside the card
      if (e.target.closest('a, .icf-contact-link, .icf-social-icon'))
        return;
      const card = e.target.closest('.icf-card');
      if (card) openModal(Number(card.dataset.coachIndex));
    });
  }
}
