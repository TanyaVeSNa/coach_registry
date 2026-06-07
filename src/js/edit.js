/**
 * ICF Registry -- Edit Profile Module
 *
 * Three-state flow for editing an existing coach profile:
 * 1. Email entry -- coach enters their email to request a magic link
 * 2. Link sent -- confirmation that email was sent
 * 3. Edit form -- pre-filled form when ?token=XXX is verified
 *
 * The edit form reuses the same HTML structure and CSS classes
 * as the registration form, with key differences:
 * - Fields are pre-filled from existing profile data
 * - Email is readonly (cannot be changed)
 * - Photo shows existing thumbnail with option to change
 * - Submit calls /api/save-profile instead of /api/submit
 *
 * @module edit
 */

import { t } from './i18n.js';
import { esc } from './utils.js';

/* ---------------------------------------------------------------
   Constants
   --------------------------------------------------------------- */

const BIO_MAX_WORDS = 300;
const PREVIEW_DEBOUNCE_MS = 500;
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
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
  { value: 'Greek', i18nKey: 'regLangGreek' },
  { value: 'German', i18nKey: 'regLangGerman' },
  { value: 'French', i18nKey: 'regLangFrench' },
  { value: 'Arabic', i18nKey: 'regLangArabic' },
  { value: 'Hebrew', i18nKey: 'regLangHebrew' },
  { value: 'Ukrainian', i18nKey: 'regLangUkrainian' },
  { value: 'Other', i18nKey: 'regLangOther' },
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

/** Bio language options for dropdowns */
const BIO_LANG_OPTIONS = [
  { value: 'en', i18nKey: 'regBioLangEN' },
  { value: 'ru', i18nKey: 'regBioLangRU' },
  { value: 'el', i18nKey: 'regBioLangEL' },
];

/** Badge config (same as registration.js) */
const BADGE_CONFIG = {
  MCC: { icon: '✦', cssClass: 'icf-badge--mcc' },
  PCC: { icon: '▲', cssClass: 'icf-badge--pcc' },
  ACC: { icon: '●', cssClass: 'icf-badge--acc' },
  Member: { icon: '', cssClass: 'icf-badge--member' },
};


/* ---------------------------------------------------------------
   Utility helpers
   --------------------------------------------------------------- */

function countWords(text) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function debounce(fn, ms) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function uid(base) {
  return `icf-edit-${base}`;
}

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

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
}


/* ---------------------------------------------------------------
   Form HTML builders (same structure as registration)
   --------------------------------------------------------------- */

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
  const readonlyAttr = opts.readonly ? ' readonly' : '';
  const placeholder = opts.placeholderKey
    ? ` placeholder="${esc(t(opts.placeholderKey))}"
        data-i18n-placeholder="${opts.placeholderKey}"` : '';
  const helpHtml = opts.helpKey
    ? `<span class="icf-form__help" id="${helpId}"
        data-i18n="${opts.helpKey}">${esc(t(opts.helpKey))}</span>`
    : '';
  const value = opts.value
    ? ` value="${esc(opts.value)}"` : '';

  return `
    <div class="icf-form__group">
      <label class="icf-form__label" for="${opts.id}">
        <span data-i18n="${opts.labelKey}">${esc(t(opts.labelKey))}</span>${req}
      </label>
      <input
        class="icf-form__input"
        type="${opts.type}"
        id="${opts.id}"
        name="${opts.id}"${placeholder}${ariaDesc}${reqAttr}${readonlyAttr}${value}
      >
      ${helpHtml}
      <span class="icf-form__error" id="${errorId}"
        role="alert" aria-live="polite"></span>
    </div>`;
}

function renderPhotoUpload(id, existingPhotoUrl) {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  const existingThumb = existingPhotoUrl
    ? `<div class="icf-edit__current-photo">
        <img src="${esc(existingPhotoUrl)}"
          alt="${esc(t('editCurrentPhoto'))}"
          class="icf-form__photo-thumb">
        <span class="icf-form__help"
          data-i18n="editCurrentPhoto">${esc(t('editCurrentPhoto'))}</span>
      </div>`
    : '';

  return `
    <div class="icf-form__group">
      <label class="icf-form__label">
        <span data-i18n="regLabelPhoto">${esc(t('regLabelPhoto'))}</span>
      </label>
      ${existingThumb}
      <div class="icf-form__photo-upload" id="${id}-area">
        <div class="icf-form__photo-preview" id="${id}-preview"
          aria-hidden="true"></div>
        <div class="icf-form__photo-info">
          <button type="button"
            class="icf-form__photo-btn"
            id="${id}-btn"
            aria-describedby="${helpId}">
            <span data-i18n="${existingPhotoUrl ? 'regPhotoChange' : 'regPhotoSelect'}">${esc(t(existingPhotoUrl ? 'regPhotoChange' : 'regPhotoSelect'))}</span>
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

function renderCheckboxGroup(opts) {
  const req = opts.required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  const errorId = `${opts.id}-error`;
  const selected = opts.selected || [];
  const checkboxes = opts.options.map((opt) => {
    const cbId = `${opts.id}-${opt.value.toLowerCase()
      .replace(/\s+/g, '-')}`;
    const chk = selected.includes(opt.value)
      ? ' checked' : '';
    return `
      <label class="icf-form__checkbox-item">
        <input type="checkbox" name="${opts.id}"
          value="${esc(opt.value)}" id="${cbId}"${chk}>
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

function renderRadioGroup(opts) {
  const req = opts.required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  const errorId = `${opts.id}-error`;
  const radios = opts.options.map((opt) => {
    const rbId = `${opts.id}-${opt.value.toLowerCase()
      .replace(/\s+/g, '-')}`;
    const chk = opt.value === opts.selected
      ? ' checked' : '';
    return `
      <label class="icf-form__radio-item">
        <input type="radio" name="${opts.id}"
          value="${esc(opt.value)}" id="${rbId}"${chk}>
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

function renderBioLangSelect(id, labelKey, options, required, selected) {
  const req = required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  const reqAttr = required ? ' required' : '';
  const optionsHtml = options.map((opt) => {
    const sel = opt.value === selected ? ' selected' : '';
    return `<option value="${esc(opt.value)}"${sel}>${esc(t(opt.i18nKey))}</option>`;
  }).join('');

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

function renderBioTextarea(opts) {
  const req = opts.required
    ? ' <span class="icf-form__required" aria-hidden="true">*</span>'
    : '';
  const errorId = `${opts.id}-error`;
  const countId = `${opts.id}-count`;
  const reqAttr = opts.required ? ' required' : '';
  const value = opts.value || '';

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
      >${esc(value)}</textarea>
      <span class="icf-form__word-count" id="${countId}">
        0 / ${BIO_MAX_WORDS}
      </span>
      <span class="icf-form__error" id="${errorId}"
        role="alert" aria-live="polite"></span>
    </div>`;
}


/* ---------------------------------------------------------------
   Email entry form (State 1)
   --------------------------------------------------------------- */

function renderEmailForm(container, config) {
  container.innerHTML = `
    <div class="icf-edit__email-form">
      <h2 class="icf-form__section-title"
        data-i18n="editPageTitle">${esc(t('editPageTitle'))}</h2>
      <div class="icf-form__group">
        <label class="icf-form__label" for="icf-edit-email">
          <span data-i18n="editEmailLabel">${esc(t('editEmailLabel'))}</span>
        </label>
        <input
          class="icf-form__input"
          type="email"
          id="icf-edit-email"
          placeholder="${esc(t('editEmailPlaceholder'))}"
          data-i18n-placeholder="editEmailPlaceholder"
          aria-describedby="icf-edit-email-help icf-edit-email-error"
        >
        <span class="icf-form__help" id="icf-edit-email-help"
          data-i18n="editEmailHelp">${esc(t('editEmailHelp'))}</span>
        <span class="icf-form__error" id="icf-edit-email-error"
          role="alert" aria-live="polite"></span>
      </div>
      <div class="icf-form__actions">
        <button type="button" class="icf-form__submit"
          id="icf-edit-send-btn">
          <span data-i18n="editSendLink">${esc(t('editSendLink'))}</span>
        </button>
      </div>
    </div>
  `;

  const emailInput = container.querySelector('#icf-edit-email');
  const sendBtn = container.querySelector('#icf-edit-send-btn');
  const errorEl = container.querySelector(
    '#icf-edit-email-error'
  );

  sendBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    errorEl.textContent = '';

    if (!email) {
      errorEl.textContent = t('regErrorRequired');
      emailInput.focus();
      return;
    }
    if (!isValidEmail(email)) {
      errorEl.textContent = t('regErrorEmail');
      emailInput.focus();
      return;
    }

    sendBtn.disabled = true;
    sendBtn.querySelector('span').textContent =
      t('editSending');

    try {
      const apiUrl = config.apiUrl
        ? config.apiUrl.replace(/\/submit$/, '/request-edit-link')
        : '/api/request-edit-link';

      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch (_err) {
      // Always show success to prevent email enumeration
    }

    renderLinkSent(container, email, config);
  });

  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendBtn.click();
    }
  });
}


/* ---------------------------------------------------------------
   Link sent confirmation (State 2)
   --------------------------------------------------------------- */

function renderLinkSent(container, email, config) {
  container.innerHTML = `
    <div class="icf-edit__link-sent">
      <h2 class="icf-form__section-title"
        data-i18n="editLinkSent">${esc(t('editLinkSent'))}</h2>
      <p data-i18n="editLinkSentText">${esc(t('editLinkSentText'))}</p>
      <p class="icf-form__help">${esc(email)}</p>
      <div class="icf-form__actions">
        <button type="button" class="icf-form__submit
          icf-form__submit--secondary"
          id="icf-edit-request-new">
          <span data-i18n="editRequestNew">${esc(t('editRequestNew'))}</span>
        </button>
      </div>
    </div>
  `;

  container.querySelector('#icf-edit-request-new')
    .addEventListener('click', () => {
      renderEmailForm(container, config);
    });
}


/* ---------------------------------------------------------------
   Token invalid screen
   --------------------------------------------------------------- */

function renderTokenInvalid(container, config) {
  container.innerHTML = `
    <div class="icf-edit__link-sent">
      <h2 class="icf-form__section-title"
        data-i18n="editPageTitle">${esc(t('editPageTitle'))}</h2>
      <p class="icf-form__error-message"
        data-i18n="editTokenInvalid">${esc(t('editTokenInvalid'))}</p>
      <div class="icf-form__actions">
        <button type="button" class="icf-form__submit"
          id="icf-edit-request-new">
          <span data-i18n="editRequestNew">${esc(t('editRequestNew'))}</span>
        </button>
      </div>
    </div>
  `;

  container.querySelector('#icf-edit-request-new')
    .addEventListener('click', () => {
      // Remove token from URL
      const url = new URL(window.location);
      url.searchParams.delete('token');
      window.history.replaceState({}, '', url);
      renderEmailForm(container, config);
    });
}


/* ---------------------------------------------------------------
   Edit form builder (State 3)
   --------------------------------------------------------------- */

function buildEditFormHTML(profile) {
  const specs = profile.specializations
    ? profile.specializations.split(', ').filter(Boolean)
    : [];
  const langs = profile.languages
    ? profile.languages.split(', ').filter(Boolean)
    : [];

  const priceMin = profile.priceMin || '';
  const priceMax = profile.priceMax || '';
  const minId = uid('price-min');
  const maxId = uid('price-max');
  const byReqId = uid('price-by-request');
  const isByRequest = !priceMin && !priceMax;

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
          value: profile.name,
        })}

        ${renderPhotoUpload(uid('photo'), profile.photo)}
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
          selected: specs,
        })}

        ${renderRadioGroup({
          id: uid('icf-level'),
          labelKey: 'regLabelIcfLevel',
          options: ICF_LEVELS,
          required: true,
          selected: profile.icfLevel,
        })}

        ${renderCheckboxGroup({
          id: uid('languages'),
          labelKey: 'regLabelLanguages',
          options: LANGUAGES,
          required: true,
          selected: langs,
        })}

        ${renderRadioGroup({
          id: uid('format'),
          labelKey: 'regLabelFormat',
          options: FORMATS,
          required: true,
          selected: profile.format,
        })}
      </div>

      <!-- Section 3: Pricing -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionPricing">${esc(t('regSectionPricing'))}</h3>

        <div class="icf-form__price-row">
          <div class="icf-form__group icf-form__group--half">
            <label class="icf-form__label" for="${minId}">
              <span data-i18n="regLabelPriceMin">${esc(t('regLabelPriceMin'))}</span>
            </label>
            <input class="icf-form__input" type="number"
              id="${minId}" name="${minId}" min="0" step="1"
              value="${esc(String(priceMin))}"${isByRequest ? ' disabled' : ''}>
            <span class="icf-form__error" id="${minId}-error"
              role="alert" aria-live="polite"></span>
          </div>
          <div class="icf-form__group icf-form__group--half">
            <label class="icf-form__label" for="${maxId}">
              <span data-i18n="regLabelPriceMax">${esc(t('regLabelPriceMax'))}</span>
            </label>
            <input class="icf-form__input" type="number"
              id="${maxId}" name="${maxId}" min="0" step="1"
              value="${esc(String(priceMax))}"${isByRequest ? ' disabled' : ''}>
            <span class="icf-form__error" id="${maxId}-error"
              role="alert" aria-live="polite"></span>
          </div>
        </div>

        <label class="icf-form__checkbox-item icf-form__by-request">
          <input type="checkbox" id="${byReqId}"
            name="${byReqId}"${isByRequest ? ' checked' : ''}>
          <span class="icf-form__checkbox-mark"></span>
          <span data-i18n="regLabelPriceByRequest">${esc(t('regLabelPriceByRequest'))}</span>
        </label>
      </div>

      <!-- Section 4: About You -->
      <div class="icf-form__section">
        <h3 class="icf-form__section-title"
          data-i18n="regSectionAbout">${esc(t('regSectionAbout'))}</h3>
        ${renderBioTextarea({
          id: uid('bio1'),
          labelKey: 'regLabelBio',
          placeholderKey: 'regPlaceholderBio1',
          required: true,
          value: profile.bio1,
        })}
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
          value: profile.email,
          readonly: true,
        })}

        ${renderInput({
          id: uid('whatsapp'),
          labelKey: 'regLabelWhatsApp',
          type: 'tel',
          required: false,
          placeholderKey: 'regPlaceholderWhatsApp',
          value: profile.whatsapp,
        })}

        ${renderInput({
          id: uid('telegram'),
          labelKey: 'regLabelTelegram',
          type: 'text',
          required: false,
          placeholderKey: 'regPlaceholderTelegram',
          value: profile.telegram,
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
          value: profile.instagram,
        })}

        ${renderInput({
          id: uid('linkedin'),
          labelKey: 'regLabelLinkedIn',
          type: 'url',
          required: false,
          placeholderKey: 'regPlaceholderLinkedIn',
          value: profile.linkedin,
        })}

        ${renderInput({
          id: uid('facebook'),
          labelKey: 'regLabelFacebook',
          type: 'url',
          required: false,
          placeholderKey: 'regPlaceholderFacebook',
          value: profile.facebook,
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
          <span data-i18n="editSave">${esc(t('editSave'))}</span>
        </button>
      </div>

      <!-- Result messages -->
      <div class="icf-form__result" aria-live="polite"></div>
    </form>`;
}


/* ---------------------------------------------------------------
   Form data collection (edit variant)
   --------------------------------------------------------------- */

function collectEditFormData(form) {
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
    bio1Language: 'ru',
    bio2: '',
    bio2Language: '',
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
   Validation (same logic as registration)
   --------------------------------------------------------------- */

function clearErrors(form) {
  form.querySelectorAll('.icf-form__error').forEach((el) => {
    el.textContent = '';
  });
  form.querySelectorAll(
    '.icf-form__input--error, .icf-form__textarea--error'
  ).forEach((el) => {
    el.classList.remove(
      'icf-form__input--error',
      'icf-form__textarea--error'
    );
  });
}

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

function showGroupError(form, groupName, messageKey) {
  const errorEl = form.querySelector(`#${groupName}-error`);
  if (errorEl) {
    errorEl.textContent = t(messageKey);
  }
}

function validateEditForm(form, data) {
  clearErrors(form);
  let valid = true;
  let firstError = null;

  if (!data.name) {
    showError(form, uid('name'), 'regErrorRequired');
    valid = false;
    firstError = firstError || uid('name');
  }

  const photoInput = form.querySelector(`#${uid('photo')}`);
  const photoFile = photoInput && photoInput.files
    && photoInput.files[0];
  if (photoFile) {
    if (!PHOTO_ACCEPTED_TYPES.includes(photoFile.type)) {
      showError(form, uid('photo'), 'regErrorPhotoType');
      valid = false;
      firstError = firstError || uid('photo');
    } else if (photoFile.size > PHOTO_MAX_BYTES) {
      showError(form, uid('photo'), 'regErrorPhotoSize');
      valid = false;
      firstError = firstError || uid('photo');
    }
  }

  if (data.specializations.length === 0) {
    showGroupError(
      form, uid('specializations'), 'regErrorSelectOne'
    );
    valid = false;
    firstError = firstError || uid('specializations');
  }

  if (!data.icfLevel) {
    showGroupError(
      form, uid('icf-level'), 'regErrorRequired'
    );
    valid = false;
    firstError = firstError || uid('icf-level');
  }

  if (data.languages.length === 0) {
    showGroupError(
      form, uid('languages'), 'regErrorSelectOne'
    );
    valid = false;
    firstError = firstError || uid('languages');
  }

  if (!data.format) {
    showGroupError(
      form, uid('format'), 'regErrorRequired'
    );
    valid = false;
    firstError = firstError || uid('format');
  }

  if (!data.bio1) {
    showError(form, uid('bio1'), 'regErrorRequired');
    valid = false;
    firstError = firstError || uid('bio1');
  } else if (countWords(data.bio1) > BIO_MAX_WORDS) {
    showError(form, uid('bio1'), 'regErrorBioTooLong');
    valid = false;
    firstError = firstError || uid('bio1');
  }

  if (data.bio2 && countWords(data.bio2) > BIO_MAX_WORDS) {
    showError(form, uid('bio2'), 'regErrorBioTooLong');
    valid = false;
    firstError = firstError || uid('bio2');
  }

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
   Card preview builder (same as registration)
   --------------------------------------------------------------- */

function buildPreviewCard(data) {
  let avatar;
  if (data.photoPreviewUrl) {
    avatar = `<img class="icf-avatar"
      src="${esc(data.photoPreviewUrl)}"
      alt="${esc(data.name || '')}" loading="lazy">`;
  } else {
    const name = data.name || '?';
    const initials = getInitials(name);
    const color = nameToColor(name);
    avatar = `<div class="icf-avatar-placeholder"
      style="background: ${color}" role="img"
      aria-label="${esc(name)}">${esc(initials)}</div>`;
  }

  const level = data.icfLevel || 'Member';
  const bc = BADGE_CONFIG[level] || BADGE_CONFIG.Member;
  const badgeIcon = bc.icon ? `${bc.icon} ` : '';
  const badgeLabel = level === 'Member'
    ? 'ICF' : `${level} ICF`;
  const badge = `<span class="icf-badge ${bc.cssClass}"
    >${badgeIcon}${esc(badgeLabel)}</span>`;

  const bioText = data.bio1 || data.bio || '';
  const bio = bioText
    ? `<p class="icf-card__bio">${esc(bioText)}</p>` : '';

  const specs = data.specializations || [];
  const tags = specs.length > 0
    ? `<div class="icf-tags">${specs.map(
        (s) => `<span class="icf-tag">${esc(s)}</span>`
      ).join('')}</div>`
    : '';

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
      priceText =
        `€${min}–${max} ${t('metaPerSession')}`;
    } else if (min) {
      priceText = `€${min} ${t('metaPerSession')}`;
    }
  }

  return `
    <article class="icf-card"
      aria-label="${esc(data.name || '')}">
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
   Edit form renderer (State 3)
   --------------------------------------------------------------- */

function renderEditForm(container, profile, token, config) {
  container.innerHTML = buildEditFormHTML(profile);

  const form = container.querySelector('.icf-form');
  if (!form) return;

  const previewContainer = form.querySelector(
    '.icf-form__preview-card'
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
   * For the live preview, use the existing photo URL if no
   * new file is selected. Updated when a new file is chosen.
   * @type {string|null}
   */
  let photoPreviewUrl = profile.photo || null;

  if (photoBtn && photoInput) {
    photoBtn.addEventListener('click', () => {
      photoInput.click();
    });

    photoInput.addEventListener('change', () => {
      const file = photoInput.files && photoInput.files[0];

      if (photoPreviewUrl &&
          photoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreviewUrl);
      }

      if (!file) {
        photoPreview.innerHTML = '';
        photoPreview.setAttribute('aria-hidden', 'true');
        photoNameEl.textContent = '';
        photoPreviewUrl = profile.photo || null;
        updatePreview();
        return;
      }

      if (!PHOTO_ACCEPTED_TYPES.includes(file.type)) {
        showError(form, uid('photo'), 'regErrorPhotoType');
        return;
      }
      if (file.size > PHOTO_MAX_BYTES) {
        showError(form, uid('photo'), 'regErrorPhotoSize');
        return;
      }

      const errEl = form.querySelector(
        `#${uid('photo')}-error`
      );
      if (errEl) errEl.textContent = '';

      photoPreviewUrl = URL.createObjectURL(file);
      photoPreview.innerHTML =
        `<img src="${esc(photoPreviewUrl)}" alt=""` +
        ' class="icf-form__photo-thumb">';
      photoPreview.removeAttribute('aria-hidden');

      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      photoNameEl.textContent =
        `${file.name} (${sizeMB} MB)`;

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

  // --- Bio word counters ---
  function wireWordCounter(textareaId) {
    const textarea = form.querySelector(`#${textareaId}`);
    const countEl = form.querySelector(
      `#${textareaId}-count`
    );
    if (!textarea || !countEl) return;

    function update() {
      const count = countWords(textarea.value);
      const text = t('regWordCount')
        .replace('{count}', String(count))
        .replace('{max}', String(BIO_MAX_WORDS));
      countEl.textContent = text;
      countEl.classList.toggle(
        'icf-form__word-count--over',
        count > BIO_MAX_WORDS
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

  // --- Bio 2 language: exclude Bio 1's language ---
  const bio1LangSelect = form.querySelector(
    `#${uid('bio1-lang')}`
  );
  const bio2LangSelect = form.querySelector(
    `#${uid('bio2-lang')}`
  );

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
    syncBio2LangOptions();
  }

  // --- Live card preview ---
  function updatePreview() {
    if (!previewContainer) return;
    const data = collectEditFormData(form);
    data.photoPreviewUrl = photoPreviewUrl || '';
    previewContainer.innerHTML = buildPreviewCard(data);
  }

  const debouncedPreview = debounce(
    updatePreview, PREVIEW_DEBOUNCE_MS
  );

  const bio1Textarea = form.querySelector(
    `#${uid('bio1')}`
  );
  const bio2Textarea = form.querySelector(
    `#${uid('bio2')}`
  );
  form.addEventListener('input', (e) => {
    if (e.target !== bio1Textarea &&
        e.target !== bio2Textarea) {
      debouncedPreview();
    }
  });
  form.addEventListener('change', debouncedPreview);

  updatePreview();

  // --- Submit handler ---
  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const data = collectEditFormData(form);

    if (!validateEditForm(form, data)) return;

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent =
      t('editSaving');
    submitBtn.classList.add('icf-form__submit--loading');

    try {
      const photoFile = photoInput && photoInput.files
        && photoInput.files[0];

      if (photoFile) {
        const b64 = await readFileAsBase64(photoFile);
        data.photoBase64 = b64;
        data.photoFilename = photoFile.name;
      }

      data.token = token;
      delete data.bio;
      delete data.byRequest;

      const apiUrl = config.apiUrl
        ? config.apiUrl.replace(/\/submit$/, '/save-profile')
        : '/api/save-profile';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Save failed');
      }

      renderEditSuccess(container, config);
    } catch (_err) {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent =
        t('editSave');
      submitBtn.classList.remove(
        'icf-form__submit--loading'
      );

      const resultEl = form.querySelector(
        '.icf-form__result'
      );
      if (resultEl) {
        resultEl.innerHTML = `
          <div class="icf-form__error-message">
            <span data-i18n="regErrorGeneral">${esc(t('regErrorGeneral'))}</span>
          </div>`;
      }
    }
  });
}


/* ---------------------------------------------------------------
   Success screen
   --------------------------------------------------------------- */

function renderEditSuccess(container, config) {
  const catalogUrl = config.catalogUrl || '../index.html';

  container.innerHTML = `
    <div class="icf-edit__success">
      <h2 class="icf-form__section-title"
        data-i18n="editSuccess">${esc(t('editSuccess'))}</h2>
      <p data-i18n="editSuccessText">${esc(t('editSuccessText'))}</p>
      <div class="icf-form__actions">
        <a class="icf-form__submit" href="${esc(catalogUrl)}">
          <span data-i18n="editBackToCatalog">${esc(t('editBackToCatalog'))}</span>
        </a>
      </div>
    </div>
  `;
}


/* ---------------------------------------------------------------
   Main orchestrator
   --------------------------------------------------------------- */

/**
 * Render the edit view into a container.
 * Checks URL for ?token=, verifies it, then renders
 * the appropriate state.
 *
 * @param {HTMLElement} container
 * @param {Object} config - App config from init()
 */
export async function renderEditView(container, config) {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (!token) {
    renderEmailForm(container, config);
    return;
  }

  // Show loading while verifying token
  container.innerHTML = `
    <div class="icf-edit__link-sent">
      <p data-i18n="editLoadingProfile">${esc(t('editLoadingProfile'))}</p>
    </div>
  `;

  try {
    const apiUrl = config.apiUrl
      ? config.apiUrl.replace(/\/submit$/, '/verify-token')
      : '/api/verify-token';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const result = await response.json();

    if (!response.ok || !result.success || !result.profile) {
      renderTokenInvalid(container, config);
      return;
    }

    renderEditForm(container, result.profile, token, config);
  } catch (_err) {
    renderTokenInvalid(container, config);
  }
}
