/**
 * ICF Registry -- Registration Form Module
 *
 * Renders a multi-section coach registration form with:
 * - Personal info, professional info, pricing, bio
 * - Contact details, social media, ICF verification
 * - Live card preview (debounced 500ms)
 * - Client-side validation with accessible error messages
 * - Submit with loading/success/error states
 *
 * All user-facing text uses i18n keys (EN/RU/EL).
 *
 * @module registration
 */

import { t } from './i18n.js';
import { esc } from './utils.js';

/* ---------------------------------------------------------------
   Constants
   --------------------------------------------------------------- */

const BIO_MAX_WORDS = 300;
const PREVIEW_DEBOUNCE_MS = 500;
const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const PHOTO_ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

/** Specialization values mapped to i18n keys */
const SPECIALIZATIONS = [
  { value: 'Career', i18nKey: 'regSpecCareer' },
  { value: 'Leadership', i18nKey: 'regSpecLeadership' },
  { value: 'Life Goals', i18nKey: 'regSpecLife' },
  { value: 'Business', i18nKey: 'regSpecBusiness' },
  { value: 'Relationships', i18nKey: 'regSpecRelationships' },
  { value: 'Health', i18nKey: 'regSpecHealth' },
  { value: 'Team', i18nKey: 'regSpecTeam' },
  { value: 'Executive', i18nKey: 'regSpecExecutive' },
];

/** Language values mapped to i18n keys */
const LANGUAGES = [
  { value: 'English', i18nKey: 'regLangEnglish' },
  { value: 'Russian', i18nKey: 'regLangRussian' },
];

/** Format options mapped to i18n keys */
const FORMATS = [
  { value: 'online', i18nKey: 'regFormatOnline' },
  { value: 'offline', i18nKey: 'regFormatOffline' },
  { value: 'both', i18nKey: 'regFormatBoth' },
];

/** ICF Level options mapped to i18n keys */
const ICF_LEVELS = [
  { value: 'ACC', i18nKey: 'regLevelACC' },
  { value: 'PCC', i18nKey: 'regLevelPCC' },
  { value: 'MCC', i18nKey: 'regLevelMCC' },
  { value: 'Member', i18nKey: 'regLevelMember' },
];


/* ---------------------------------------------------------------
   Utility helpers
   --------------------------------------------------------------- */

// HTML escaping provided by shared utils.js module

/**
 * Count words in a string.
 * @param {string} text
 * @returns {number}
 */
function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Create a debounced version of a function.
 * @param {Function} fn
 * @param {number} ms
 * @returns {Function}
 */
function debounce(fn, ms) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

/**
 * Read a File as a base64-encoded string (data URL without
 * the prefix). Returns only the base64 payload.
 * @param {File} file
 * @returns {Promise<string>}
 */
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:<mime>;base64,PAYLOAD"
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Basic email validation.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Check if a URL is a valid https/http URL.
 * @param {string} url
 * @returns {boolean}
 */
function isValidUrl(url) {
  const trimmed = url.trim().toLowerCase();
  return trimmed.startsWith('https://') ||
    trimmed.startsWith('http://');
}

/**
 * Generate a unique ID for form elements.
 * @param {string} base
 * @returns {string}
 */
function uid(base) {
  return `icf-reg-${base}`;
}


/* ---------------------------------------------------------------
   Badge config (duplicated from cards.js to avoid circular deps)
   --------------------------------------------------------------- */

const BADGE_CONFIG = {
  MCC: { icon: '\u2726', cssClass: 'icf-badge--mcc' },
  PCC: { icon: '\u25B2', cssClass: 'icf-badge--pcc' },
  ACC: { icon: '\u25CF', cssClass: 'icf-badge--acc' },
  Member: { icon: '', cssClass: 'icf-badge--member' },
};

/**
 * Deterministic color from name (same algorithm as cards.js).
 * @param {string} name
 * @returns {string}
 */
function nameToColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  const hue = Math.abs(hash) % 360;
  const saturation = 45 + (Math.abs(hash >> 8) % 20);
  const lightness = 35 + (Math.abs(hash >> 16) % 10);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Extract initials from name.
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
}


/* ---------------------------------------------------------------
   Form HTML builders
   --------------------------------------------------------------- */

/**
 * Render a text/email/tel/number input field group.
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.labelKey
 * @param {string} opts.type
 * @param {boolean} [opts.required]
 * @param {string} [opts.placeholderKey]
 * @param {string} [opts.helpKey]
 * @returns {string}
 */
function renderInput(opts) {
  const req = opts.required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  const errorId = `${opts.id}-error`;
  const helpId = opts.helpKey ? `${opts.id}-help` : '';
  const describedBy = [
    opts.required ? errorId : '',
    helpId,
  ].filter(Boolean).join(' ');
  const ariaDesc = describedBy
    ? ` aria-describedby="${describedBy}"` : '';
  const reqAttr = opts.required ? ' required' : '';
  const placeholder = opts.placeholderKey
    ? ` placeholder="${esc(t(opts.placeholderKey))}"
        data-i18n-placeholder="${opts.placeholderKey}"` : '';
  const helpHtml = opts.helpKey
    ? `<span class="icf-form__help" id="${helpId}"
        data-i18n="${opts.helpKey}">${esc(t(opts.helpKey))}</span>`
    : '';

  return `
    <div class="icf-form__group">
      <label class="icf-form__label" for="${opts.id}">
        <span data-i18n="${opts.labelKey}">${esc(t(opts.labelKey))}</span>${req}
      </label>
      <input
        class="icf-form__input"
        type="${opts.type}"
        id="${opts.id}"
        name="${opts.id}"${placeholder}${ariaDesc}${reqAttr}
      >
      ${helpHtml}
      <span class="icf-form__error" id="${errorId}"
        role="alert" aria-live="polite"></span>
    </div>`;
}

/**
 * Render a file upload field for the coach photo.
 * Uses a hidden native file input with a styled button
 * and image preview area.
 * @param {string} id - Element ID for the file input
 * @returns {string} HTML
 */
function renderPhotoUpload(id) {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  return `
    <div class="icf-form__group">
      <label class="icf-form__label">
        <span data-i18n="regLabelPhoto">${esc(t('regLabelPhoto'))}</span>
      </label>
      <div class="icf-form__photo-upload" id="${id}-area">
        <div class="icf-form__photo-preview" id="${id}-preview"
          aria-hidden="true"></div>
        <div class="icf-form__photo-info">
          <button type="button"
            class="icf-form__photo-btn"
            id="${id}-btn"
            aria-describedby="${helpId}">
            <span data-i18n="regPhotoSelect">${esc(t('regPhotoSelect'))}</span>
          </button>
          <span class="icf-form__photo-name"
            id="${id}-name"></span>
        </div>
        <input
          type="file"
          id="${id}"
          name="${id}"
          accept="image/jpeg,image/png,image/webp"
          class="icf-form__photo-input"
          aria-describedby="${helpId} ${errorId}"
        >
      </div>
      <span class="icf-form__help" id="${helpId}"
        data-i18n="regPhotoHelp">${esc(t('regPhotoHelp'))}</span>
      <span class="icf-form__error" id="${errorId}"
        role="alert" aria-live="polite"></span>
    </div>`;
}

/**
 * Render a multi-select checkbox group.
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.labelKey
 * @param {Array<{value: string, i18nKey: string}>} opts.options
 * @param {boolean} [opts.required]
 * @returns {string}
 */
function renderCheckboxGroup(opts) {
  const req = opts.required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  const errorId = `${opts.id}-error`;
  const checkboxes = opts.options.map((opt) => {
    const cbId = `${opts.id}-${opt.value.toLowerCase()
      .replace(/\s+/g, '-')}`;
    return `
      <label class="icf-form__checkbox-item">
        <input type="checkbox" name="${opts.id}"
          value="${esc(opt.value)}" id="${cbId}">
        <span class="icf-form__checkbox-mark"></span>
        <span data-i18n="${opt.i18nKey}">${esc(t(opt.i18nKey))}</span>
      </label>`;
  }).join('');

  return `
    <div class="icf-form__group">
      <fieldset class="icf-form__fieldset">
        <legend class="icf-form__label">
          <span data-i18n="${opts.labelKey}">${esc(t(opts.labelKey))}</span>${req}
        </legend>
        <div class="icf-form__checkbox-group"
          role="group" aria-describedby="${errorId}">
          ${checkboxes}
        </div>
        <span class="icf-form__error" id="${errorId}"
          role="alert" aria-live="polite"></span>
      </fieldset>
    </div>`;
}

/**
 * Render a radio button group.
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.labelKey
 * @param {Array<{value: string, i18nKey: string}>} opts.options
 * @param {boolean} [opts.required]
 * @returns {string}
 */
function renderRadioGroup(opts) {
  const req = opts.required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  const errorId = `${opts.id}-error`;
  const radios = opts.options.map((opt) => {
    const rbId = `${opts.id}-${opt.value.toLowerCase()
      .replace(/\s+/g, '-')}`;
    return `
      <label class="icf-form__radio-item">
        <input type="radio" name="${opts.id}"
          value="${esc(opt.value)}" id="${rbId}">
        <span class="icf-form__radio-mark"></span>
        <span data-i18n="${opt.i18nKey}">${esc(t(opt.i18nKey))}</span>
      </label>`;
  }).join('');

  return `
    <div class="icf-form__group">
      <fieldset class="icf-form__fieldset">
        <legend class="icf-form__label">
          <span data-i18n="${opts.labelKey}">${esc(t(opts.labelKey))}</span>${req}
        </legend>
        <div class="icf-form__radio-group"
          role="radiogroup" aria-describedby="${errorId}">
          ${radios}
        </div>
        <span class="icf-form__error" id="${errorId}"
          role="alert" aria-live="polite"></span>
      </fieldset>
    </div>`;
}

/** Bio language options for dropdowns */
const BIO_LANG_OPTIONS = [
  { value: 'ru', i18nKey: 'regBioLangRU' },
  { value: 'en', i18nKey: 'regBioLangEN' },
];

/**
 * Render a bio language select dropdown.
 * @param {string} id — element id
 * @param {string} labelKey — i18n key for label
 * @param {Array<{value: string, i18nKey: string}>} options
 * @param {boolean} [required]
 * @returns {string}
 */
function renderBioLangSelect(id, labelKey, options, required) {
  const req = required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  const reqAttr = required ? ' required' : '';
  const optionsHtml = options.map((opt) =>
    `<option value="${esc(opt.value)}">${esc(t(opt.i18nKey))}</option>`
  ).join('');

  return `
    <div class="icf-form__group">
      <label class="icf-form__label" for="${id}">
        <span data-i18n="${labelKey}">${esc(t(labelKey))}</span>${req}
      </label>
      <select
        class="icf-form__input icf-form__select"
        id="${id}"
        name="${id}"${reqAttr}
      >
        ${optionsHtml}
      </select>
    </div>`;
}

/**
 * Render a single bio textarea with word counter.
 * @param {Object} opts
 * @param {string} opts.id
 * @param {string} opts.labelKey
 * @param {string} opts.placeholderKey
 * @param {boolean} [opts.required]
 * @returns {string}
 */
function renderBioTextarea(opts) {
  const req = opts.required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  const errorId = `${opts.id}-error`;
  const countId = `${opts.id}-count`;
  const reqAttr = opts.required ? ' required' : '';

  return `
    <div class="icf-form__group">
      <label class="icf-form__label" for="${opts.id}">
        <span data-i18n="${opts.labelKey}">${esc(t(opts.labelKey))}</span>${req}
      </label>
      <textarea
        class="icf-form__textarea"
        id="${opts.id}"
        name="${opts.id}"
        rows="5"
        placeholder="${esc(t(opts.placeholderKey))}"
        data-i18n-placeholder="${opts.placeholderKey}"
        aria-describedby="${countId} ${errorId}"${reqAttr}
      ></textarea>
      <span class="icf-form__word-count" id="${countId}">
        0 / ${BIO_MAX_WORDS}
      </span>
      <span class="icf-form__error" id="${errorId}"
        role="alert" aria-live="polite"></span>
    </div>`;
}

/**
 * Render the dual bio fields (Bio 1 required + Bio 2 optional).
 * Each has a language selector and textarea with word counter.
 * @returns {string}
 */
function renderBioFields() {
  const bio1LangId = uid('bio1-lang');
  const bio1Id = uid('bio1');
  const bio2LangId = uid('bio2-lang');
  const bio2Id = uid('bio2');

  return `
    ${renderBioLangSelect(
      bio1LangId, 'regLabelBio1Lang', BIO_LANG_OPTIONS, true
    )}
    ${renderBioTextarea({
      id: bio1Id,
      labelKey: 'regLabelBio',
      placeholderKey: 'regPlaceholderBio1',
      required: true,
    })}
    ${renderBioLangSelect(
      bio2LangId, 'regLabelBio2', BIO_LANG_OPTIONS, false
    )}
    ${renderBioTextarea({
      id: bio2Id,
      labelKey: 'regLabelBio2',
      placeholderKey: 'regPlaceholderBio1',
      required: false,
    })}`;
}

/**
 * Render the pricing section with min/max + "By request".
 * @returns {string}
 */
function renderPricingSection() {
  const minId = uid('price-min');
  const maxId = uid('price-max');
  const byReqId = uid('price-by-request');
  const minErrorId = `${minId}-error`;
  const maxErrorId = `${maxId}-error`;

  return `
    <div class="icf-form__section">
      <h3 class="icf-form__section-title"
        data-i18n="regSectionPricing">${esc(t('regSectionPricing'))}</h3>

      <div class="icf-form__price-row">
        <div class="icf-form__group icf-form__group--half">
          <label class="icf-form__label" for="${minId}">
            <span data-i18n="regLabelPriceMin">${esc(t('regLabelPriceMin'))}</span>
          </label>
          <input class="icf-form__input" type="number"
            id="${minId}" name="${minId}" min="0" step="1">
          <span class="icf-form__error" id="${minErrorId}"
            role="alert" aria-live="polite"></span>
        </div>
        <div class="icf-form__group icf-form__group--half">
          <label class="icf-form__label" for="${maxId}">
            <span data-i18n="regLabelPriceMax">${esc(t('regLabelPriceMax'))}</span>
          </label>
          <input class="icf-form__input" type="number"
            id="${maxId}" name="${maxId}" min="0" step="1">
          <span class="icf-form__error" id="${maxErrorId}"
            role="alert" aria-live="polite"></span>
        </div>
      </div>

      <label class="icf-form__checkbox-item icf-form__by-request">
        <input type="checkbox" id="${byReqId}" name="${byReqId}">
        <span class="icf-form__checkbox-mark"></span>
        <span data-i18n="regLabelPriceByRequest">${esc(t('regLabelPriceByRequest'))}</span>
      </label>
    </div>`;
}


/* ---------------------------------------------------------------
   Card Preview Builder
   --------------------------------------------------------------- */

/**
 * Build a mini card preview HTML from current form data.
 * @param {Object} data - Collected form data
 * @returns {string} HTML
 */
function buildPreviewCard(data) {
  // Avatar — photoPreviewUrl is an object URL from file input
  let avatar;
  if (data.photoPreviewUrl) {
    avatar = `<img class="icf-avatar" src="${esc(data.photoPreviewUrl)}"
      alt="${esc(data.name || '')}" loading="lazy">`;
  } else {
    const name = data.name || '?';
    const initials = getInitials(name);
    const color = nameToColor(name);
    avatar = `<div class="icf-avatar-placeholder"
      style="background: ${color}" role="img"
      aria-label="${esc(name)}">${esc(initials)}</div>`;
  }

  // Badge
  const level = data.icfLevel || 'Member';
  const bc = BADGE_CONFIG[level] || BADGE_CONFIG.Member;
  const badgeIcon = bc.icon ? `${bc.icon} ` : '';
  const badgeLabel = level === 'Member'
    ? 'ICF' : `${level} ICF`;
  const badge = `<span class="icf-badge ${bc.cssClass}"
    >${badgeIcon}${esc(badgeLabel)}</span>`;

  // Bio — show bio1 in preview (primary bio)
  const bioText = data.bio1 || data.bio || '';
  const bio = bioText
    ? `<p class="icf-card__bio">${esc(bioText)}</p>` : '';

  // Tags
  const specs = data.specializations || [];
  const tags = specs.length > 0
    ? `<div class="icf-tags">${specs.map(
        (s) => `<span class="icf-tag">${esc(s)}</span>`
      ).join('')}</div>`
    : '';

  // Meta
  const langs = (data.languages || []).join(', ');
  const formatMap = {
    online: t('formatOnline'),
    offline: t('formatOffline'),
    both: t('formatBoth'),
  };
  const formatLabel = formatMap[data.format] || '';
  let priceText = t('metaPriceOnRequest');
  if (!data.byRequest) {
    const min = data.priceMin;
    const max = data.priceMax;
    if (min && max && min !== max) {
      priceText = `\u20AC${min}\u2013${max} ${t('metaPerSession')}`;
    } else if (min) {
      priceText = `\u20AC${min} ${t('metaPerSession')}`;
    }
  }

  return `
    <article class="icf-card" aria-label="${esc(data.name || '')}">
      <div class="icf-card__top">
        ${avatar}
        <div class="icf-card__name-block">
          <div class="icf-card__name">${esc(data.name || '')}</div>
          ${badge}
        </div>
      </div>
      ${bio}
      ${tags}
      <div class="icf-meta">
        ${langs ? `<span class="icf-meta__item">${esc(langs)}</span>` : ''}
        ${formatLabel ? `<span class="icf-meta__item">${esc(formatLabel)}</span>` : ''}
        <span class="icf-meta__item">${esc(priceText)}</span>
      </div>
    </article>`;
}


/* ---------------------------------------------------------------
   Main form renderer
   --------------------------------------------------------------- */

/**
 * Build the complete registration form HTML.
 * @returns {string}
 */
function buildFormHTML() {
  return `
    <form class="icf-form" novalidate>
      <!-- Section 1: Personal Info -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionPersonal">${esc(t('regSectionPersonal'))}</h3>

        ${renderInput({
          id: uid('name'),
          labelKey: 'regLabelName',
          type: 'text',
          required: true,
          placeholderKey: 'regPlaceholderName',
        })}

        ${renderPhotoUpload(uid('photo'))}
      </div>

      <!-- Section 2: Professional Info -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionProfessional">${esc(t('regSectionProfessional'))}</h3>

        ${renderCheckboxGroup({
          id: uid('specializations'),
          labelKey: 'regLabelSpecializations',
          options: SPECIALIZATIONS,
          required: true,
        })}

        ${renderRadioGroup({
          id: uid('icf-level'),
          labelKey: 'regLabelIcfLevel',
          options: ICF_LEVELS,
          required: true,
        })}

        ${renderCheckboxGroup({
          id: uid('languages'),
          labelKey: 'regLabelLanguages',
          options: LANGUAGES,
          required: true,
        })}

        ${renderRadioGroup({
          id: uid('format'),
          labelKey: 'regLabelFormat',
          options: FORMATS,
          required: true,
        })}
      </div>

      <!-- Section 3: Pricing -->
      ${renderPricingSection()}

      <!-- Section 4: About You -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionAbout">${esc(t('regSectionAbout'))}</h3>
        ${renderBioFields()}
      </div>

      <!-- Section 5: Contact Details -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionContact">${esc(t('regSectionContact'))}</h3>

        ${renderInput({
          id: uid('email'),
          labelKey: 'regLabelEmail',
          type: 'email',
          required: true,
          placeholderKey: 'regPlaceholderEmail',
        })}

        ${renderInput({
          id: uid('whatsapp'),
          labelKey: 'regLabelWhatsApp',
          type: 'tel',
          required: false,
          placeholderKey: 'regPlaceholderWhatsApp',
        })}

        ${renderInput({
          id: uid('telegram'),
          labelKey: 'regLabelTelegram',
          type: 'text',
          required: false,
          placeholderKey: 'regPlaceholderTelegram',
        })}
      </div>

      <!-- Section 6: Social Media -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionSocial">${esc(t('regSectionSocial'))}</h3>

        ${renderInput({
          id: uid('instagram'),
          labelKey: 'regLabelInstagram',
          type: 'text',
          required: false,
          placeholderKey: 'regPlaceholderInstagram',
        })}

        ${renderInput({
          id: uid('linkedin'),
          labelKey: 'regLabelLinkedIn',
          type: 'url',
          required: false,
          placeholderKey: 'regPlaceholderLinkedIn',
        })}

        ${renderInput({
          id: uid('facebook'),
          labelKey: 'regLabelFacebook',
          type: 'url',
          required: false,
          placeholderKey: 'regPlaceholderFacebook',
        })}
      </div>

      <!-- Card Preview -->
      <div class="icf-form__preview">
        <h3 class="icf-form__section-title"
          data-i18n="regPreviewTitle">${esc(t('regPreviewTitle'))}</h3>
        <div class="icf-form__preview-card" aria-live="polite">
        </div>
      </div>

      <!-- Submit -->
      <div class="icf-form__actions">
        <button type="submit" class="icf-form__submit">
          <span data-i18n="regSubmit">${esc(t('regSubmit'))}</span>
        </button>
      </div>

      <!-- Result messages -->
      <div class="icf-form__result" aria-live="polite"></div>
    </form>`;
}


/* ---------------------------------------------------------------
   Form data collection
   --------------------------------------------------------------- */

/**
 * Collect all form values into a plain object.
 * @param {HTMLFormElement} form
 * @returns {Object}
 */
function collectFormData(form) {
  const val = (id) => {
    const el = form.querySelector(`#${id}`);
    return el ? el.value.trim() : '';
  };

  const checked = (name) => {
    return Array.from(form.querySelectorAll(
      `input[name="${name}"]:checked`
    )).map((el) => el.value);
  };

  const radio = (name) => {
    const el = form.querySelector(
      `input[name="${name}"]:checked`
    );
    return el ? el.value : '';
  };

  const byRequestEl = form.querySelector(
    `#${uid('price-by-request')}`
  );
  const byRequest = byRequestEl ? byRequestEl.checked : false;

  return {
    name: val(uid('name')),
    specializations: checked(uid('specializations')),
    icfLevel: radio(uid('icf-level')),
    languages: checked(uid('languages')),
    format: radio(uid('format')),
    priceMin: parseInt(val(uid('price-min')), 10) || 0,
    priceMax: parseInt(val(uid('price-max')), 10) || 0,
    byRequest,
    bio1: val(uid('bio1')),
    bio1Lang: val(uid('bio1-lang')),
    bio2: val(uid('bio2')),
    bio2Lang: val(uid('bio2-lang')),
    bio: val(uid('bio1')),
    email: val(uid('email')),
    whatsapp: val(uid('whatsapp')),
    telegram: val(uid('telegram')),
    instagram: val(uid('instagram')),
    linkedin: val(uid('linkedin')),
    facebook: val(uid('facebook')),
  };
}


/* ---------------------------------------------------------------
   Validation
   --------------------------------------------------------------- */

/**
 * Clear all error messages.
 * @param {HTMLFormElement} form
 */
function clearErrors(form) {
  form.querySelectorAll('.icf-form__error').forEach((el) => {
    el.textContent = '';
  });
  form.querySelectorAll('.icf-form__input--error, ' +
    '.icf-form__textarea--error').forEach((el) => {
    el.classList.remove(
      'icf-form__input--error', 'icf-form__textarea--error'
    );
  });
}

/**
 * Show an error on a specific field.
 * @param {HTMLFormElement} form
 * @param {string} fieldId
 * @param {string} messageKey
 */
function showError(form, fieldId, messageKey) {
  const errorEl = form.querySelector(`#${fieldId}-error`);
  if (errorEl) {
    errorEl.textContent = t(messageKey);
  }
  const input = form.querySelector(`#${fieldId}`);
  if (input) {
    if (input.tagName === 'TEXTAREA') {
      input.classList.add('icf-form__textarea--error');
    } else {
      input.classList.add('icf-form__input--error');
    }
  }
}

/**
 * Show an error on a checkbox/radio group.
 * @param {HTMLFormElement} form
 * @param {string} groupName
 * @param {string} messageKey
 */
function showGroupError(form, groupName, messageKey) {
  const errorEl = form.querySelector(`#${groupName}-error`);
  if (errorEl) {
    errorEl.textContent = t(messageKey);
  }
}

/**
 * Validate form data. Returns true if valid.
 * @param {HTMLFormElement} form
 * @param {Object} data
 * @returns {boolean}
 */
function validateForm(form, data) {
  clearErrors(form);
  let valid = true;
  let firstError = null;

  // Name — required
  if (!data.name) {
    showError(form, uid('name'), 'regErrorRequired');
    valid = false;
    firstError = firstError || uid('name');
  }

  // Photo file — optional, but if provided must be valid
  const photoInput = form.querySelector(`#${uid('photo')}`);
  const photoFile = photoInput && photoInput.files
    && photoInput.files[0];
  if (photoFile) {
    if (!PHOTO_ACCEPTED_TYPES.includes(photoFile.type)) {
      showError(
        form, uid('photo'), 'regErrorPhotoType'
      );
      valid = false;
      firstError = firstError || uid('photo');
    } else if (photoFile.size > PHOTO_MAX_BYTES) {
      showError(
        form, uid('photo'), 'regErrorPhotoSize'
      );
      valid = false;
      firstError = firstError || uid('photo');
    }
  }

  // Specializations — at least one
  if (data.specializations.length === 0) {
    showGroupError(
      form, uid('specializations'), 'regErrorSelectOne'
    );
    valid = false;
    firstError = firstError || uid('specializations');
  }

  // ICF Level — required
  if (!data.icfLevel) {
    showGroupError(
      form, uid('icf-level'), 'regErrorRequired'
    );
    valid = false;
    firstError = firstError || uid('icf-level');
  }

  // Languages — at least one
  if (data.languages.length === 0) {
    showGroupError(
      form, uid('languages'), 'regErrorSelectOne'
    );
    valid = false;
    firstError = firstError || uid('languages');
  }

  // Format — required
  if (!data.format) {
    showGroupError(
      form, uid('format'), 'regErrorRequired'
    );
    valid = false;
    firstError = firstError || uid('format');
  }

  // Bio 1 — required, max 300 words
  if (!data.bio1) {
    showError(form, uid('bio1'), 'regErrorRequired');
    valid = false;
    firstError = firstError || uid('bio1');
  } else if (countWords(data.bio1) > BIO_MAX_WORDS) {
    showError(form, uid('bio1'), 'regErrorBioTooLong');
    valid = false;
    firstError = firstError || uid('bio1');
  }

  // Bio 2 — optional, but if provided max 300 words
  if (data.bio2 && countWords(data.bio2) > BIO_MAX_WORDS) {
    showError(form, uid('bio2'), 'regErrorBioTooLong');
    valid = false;
    firstError = firstError || uid('bio2');
  }

  // Email — required, valid format
  if (!data.email) {
    showError(form, uid('email'), 'regErrorRequired');
    valid = false;
    firstError = firstError || uid('email');
  } else if (!isValidEmail(data.email)) {
    showError(form, uid('email'), 'regErrorEmail');
    valid = false;
    firstError = firstError || uid('email');
  }

  // Scroll to first error
  if (firstError) {
    const el = form.querySelector(`#${firstError}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (el.focus) el.focus();
    }
  }

  return valid;
}


/* ---------------------------------------------------------------
   Public API
   --------------------------------------------------------------- */

/**
 * Render the registration form into a container and wire up
 * all interactions (preview, validation, submit).
 *
 * @param {HTMLElement} container
 * @param {(formData: Object) => Promise<void>} onSubmit
 */
export function renderRegistrationForm(container, onSubmit) {
  container.innerHTML = buildFormHTML();

  const form = container.querySelector('.icf-form');
  if (!form) return;

  const previewContainer = form.querySelector(
    '.icf-form__preview-card'
  );
  const resultContainer = form.querySelector(
    '.icf-form__result'
  );
  const submitBtn = form.querySelector('.icf-form__submit');

  // --- Photo file input ---
  const photoInput = form.querySelector(
    `#${uid('photo')}`
  );
  const photoBtn = form.querySelector(
    `#${uid('photo')}-btn`
  );
  const photoPreview = form.querySelector(
    `#${uid('photo')}-preview`
  );
  const photoNameEl = form.querySelector(
    `#${uid('photo')}-name`
  );

  /**
   * Object URL for the selected photo file, used in
   * the live card preview. Revoked on file change to
   * avoid memory leaks.
   * @type {string|null}
   */
  let photoPreviewUrl = null;

  if (photoBtn && photoInput) {
    photoBtn.addEventListener('click', () => {
      photoInput.click();
    });

    photoInput.addEventListener('change', () => {
      const file = photoInput.files && photoInput.files[0];

      // Revoke previous object URL
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
        photoPreviewUrl = null;
      }

      if (!file) {
        photoPreview.innerHTML = '';
        photoPreview.setAttribute('aria-hidden', 'true');
        photoNameEl.textContent = '';
        photoBtn.querySelector('span').textContent =
          t('regPhotoSelect');
        updatePreview();
        return;
      }

      // Validate type and size inline for instant feedback
      if (!PHOTO_ACCEPTED_TYPES.includes(file.type)) {
        showError(
          form, uid('photo'), 'regErrorPhotoType'
        );
        return;
      }
      if (file.size > PHOTO_MAX_BYTES) {
        showError(
          form, uid('photo'), 'regErrorPhotoSize'
        );
        return;
      }

      // Clear any previous error
      const errEl = form.querySelector(
        `#${uid('photo')}-error`
      );
      if (errEl) errEl.textContent = '';

      // Show preview
      photoPreviewUrl = URL.createObjectURL(file);
      photoPreview.innerHTML =
        `<img src="${esc(photoPreviewUrl)}" alt=""` +
        ' class="icf-form__photo-thumb">';
      photoPreview.removeAttribute('aria-hidden');

      // Show file info
      const sizeMB = (file.size / (1024 * 1024))
        .toFixed(1);
      photoNameEl.textContent =
        `${file.name} (${sizeMB} MB)`;

      // Update button text
      photoBtn.querySelector('span').textContent =
        t('regPhotoChange');

      updatePreview();
    });
  }

  // --- "By request" checkbox toggles price inputs ---
  const byReqCheckbox = form.querySelector(
    `#${uid('price-by-request')}`
  );
  const priceMinInput = form.querySelector(
    `#${uid('price-min')}`
  );
  const priceMaxInput = form.querySelector(
    `#${uid('price-max')}`
  );

  if (byReqCheckbox && priceMinInput && priceMaxInput) {
    byReqCheckbox.addEventListener('change', () => {
      const disabled = byReqCheckbox.checked;
      priceMinInput.disabled = disabled;
      priceMaxInput.disabled = disabled;
      if (disabled) {
        priceMinInput.value = '';
        priceMaxInput.value = '';
      }
      updatePreview();
    });
  }

  // --- Bio word counters (Bio 1 + Bio 2) ---
  /**
   * Wire up word counter for a bio textarea.
   * @param {string} textareaId
   */
  function wireWordCounter(textareaId) {
    const textarea = form.querySelector(`#${textareaId}`);
    const countEl = form.querySelector(`#${textareaId}-count`);
    if (!textarea || !countEl) return;

    function update() {
      const count = countWords(textarea.value);
      const text = t('regWordCount')
        .replace('{count}', String(count))
        .replace('{max}', String(BIO_MAX_WORDS));
      countEl.textContent = text;
      countEl.classList.toggle(
        'icf-form__word-count--over', count > BIO_MAX_WORDS
      );
    }

    textarea.addEventListener('input', () => {
      update();
      debouncedPreview();
    });
    update();
  }

  wireWordCounter(uid('bio1'));
  wireWordCounter(uid('bio2'));

  // --- Bio 2 language dropdown: exclude Bio 1's language ---
  const bio1LangSelect = form.querySelector(
    `#${uid('bio1-lang')}`
  );
  const bio2LangSelect = form.querySelector(
    `#${uid('bio2-lang')}`
  );

  /**
   * Update Bio 2 language options to exclude the language
   * selected in Bio 1.
   */
  function syncBio2LangOptions() {
    if (!bio1LangSelect || !bio2LangSelect) return;
    const excluded = bio1LangSelect.value;
    const prev = bio2LangSelect.value;
    bio2LangSelect.innerHTML = BIO_LANG_OPTIONS
      .filter((opt) => opt.value !== excluded)
      .map((opt) => {
        const sel = opt.value === prev ? ' selected' : '';
        return `<option value="${esc(opt.value)}"${sel}>${esc(t(opt.i18nKey))}</option>`;
      })
      .join('');
  }

  if (bio1LangSelect) {
    bio1LangSelect.addEventListener('change', () => {
      syncBio2LangOptions();
      debouncedPreview();
    });
    // Initial sync
    syncBio2LangOptions();
  }

  // --- Live card preview (debounced) ---
  function updatePreview() {
    if (!previewContainer) return;
    const data = collectFormData(form);
    data.photoPreviewUrl = photoPreviewUrl || '';
    previewContainer.innerHTML = buildPreviewCard(data);
  }

  const debouncedPreview = debounce(
    updatePreview, PREVIEW_DEBOUNCE_MS
  );

  // Listen to all input/change events for preview
  // Bio textareas handled by wireWordCounter which calls debouncedPreview
  const bio1Textarea = form.querySelector(`#${uid('bio1')}`);
  const bio2Textarea = form.querySelector(`#${uid('bio2')}`);
  form.addEventListener('input', (e) => {
    if (e.target !== bio1Textarea && e.target !== bio2Textarea) {
      debouncedPreview();
    }
  });
  form.addEventListener('change', debouncedPreview);

  // Initial preview
  updatePreview();

  // --- Submit handler ---
  submitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const data = collectFormData(form);

    if (!validateForm(form, data)) return;

    // Loading state
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent =
      t('regSubmitting');
    submitBtn.classList.add('icf-form__submit--loading');

    /**
     * Convert photo file to base64 before submit.
     * Returns a promise that resolves with the data
     * (with photoBase64 + photoFilename added if a
     * file was selected).
     */
    const photoFile = photoInput && photoInput.files
      && photoInput.files[0];

    const prepareData = photoFile
      ? readFileAsBase64(photoFile).then((b64) => {
        data.photoBase64 = b64;
        data.photoFilename = photoFile.name;
        return data;
      })
      : Promise.resolve(data);

    // Remove preview-only fields before sending
    prepareData.then((d) => {
      delete d.photoPreviewUrl;
      return onSubmit(d);
    }).then(() => {
      // onSubmit handles redirect
    }).catch(() => {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent =
        t('regSubmit');
      submitBtn.classList.remove(
        'icf-form__submit--loading'
      );
    });
  });
}
