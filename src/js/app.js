/**
 * ICF Registry -- Main Application Entry Point
 *
 * Initializes the coach registry widget:
 * 1. Finds or creates container element
 * 2. Sets up language from localStorage / browser locale
 * 3. Renders page header with language switcher
 * 4. Fetches coach data (Google Sheets or mock)
 * 5. Renders filters and coach cards grid
 * 6. Wires up event listeners
 *
 * Supports two views:
 * - "catalog" (default) -- coach listing with filters
 * - "registration" -- self-registration form
 *
 * External usage:
 *   <div id="icf-coach-registry"></div>
 *   <script type="module">
 *     import { ICFRegistry } from './js/app.js';
 *     ICFRegistry.init({ scriptUrl: '...' });
 *   </script>
 */

import {
  initLanguage,
  setLanguage,
  getCurrentLanguage,
  t,
  setBrandOverrides,
  SUPPORTED_LANGS,
} from './i18n.js';
import { esc } from './utils.js';
import { fetchCoaches } from './sheets.js';
import { renderCards } from './cards.js';
import { renderFilters } from './filters.js';
import { renderRegistrationForm } from './registration.js';
import { submitRegistration } from './submit.js';
import { renderEditView } from './edit.js';
import { fetchConfig, applyConfig } from './config.js';

/**
 * @typedef {Object} RegistryConfig
 * @property {string} [sheetId] -- Google Sheet ID (omit for mock data)
 * @property {string} [containerId] -- custom container ID
 * @property {string} [scriptUrl] -- Google Apps Script web app URL
 * @property {boolean} [devMode] -- force dev mode for submissions
 * @property {string} [view] -- initial view: 'catalog' (default), 'registration', or 'edit'
 * @property {string} [registerUrl] -- URL to registration page (if separate page)
 * @property {string} [catalogUrl] -- URL to catalog page (for back link from registration)
 * @property {string} [logoUrl] -- path to ICF Cyprus logo image (relative to HTML file)
 * @property {string} [assetsBase] -- base path to assets folder (default: './src/assets/')
 */

/** @type {import('./sheets.js').Coach[]} */
let coaches = [];

/** @type {HTMLElement|null} */
let containerEl = null;

/** @type {RegistryConfig} */
let appConfig = {};

/**
 * Current view: 'catalog', 'registration', or 'edit'.
 * @type {'catalog'|'registration'|'edit'}
 */
let currentView = 'catalog';

/**
 * Find the widget container element.
 * Priority: config.containerId > #icf-coach-registry > [data-icf-registry]
 * @param {string} [containerId]
 * @returns {HTMLElement|null}
 */
function findContainer(containerId) {
  if (containerId) {
    return document.getElementById(containerId);
  }
  return (
    document.getElementById('icf-coach-registry') ||
    document.getElementById('icf-coach-registration') ||
    document.querySelector('[data-icf-registry]')
  );
}

/**
 * Render the page header: logo (left) + title (center) +
 * language switcher (right) on one line, white background.
 * @param {string} [titleKey='pageTitle'] — i18n key for title
 * @param {string} [highlightKey='pageTitleHighlight'] — i18n key for highlight
 * @returns {string} HTML string
 */
function renderHeader(titleKey = 'pageTitle', highlightKey = 'pageTitleHighlight') {
  const lang = getCurrentLanguage();
  const langButtons = SUPPORTED_LANGS
    .map((code) => {
      const active = code === lang ? ' icf-lang-switch__btn--active' : '';
      const label = code.toUpperCase();
      return `<button
        class="icf-lang-switch__btn${active}"
        data-lang="${code}"
        aria-label="Switch to ${label}"
        aria-pressed="${code === lang}"
      >${label}</button>`;
    })
    .join('');

  const logoHTML = appConfig.logoUrl
    ? `<img src="${esc(appConfig.logoUrl)}"
           alt="${esc(t('pageTitleHighlight'))}"
           class="icf-header__logo">`
    : '';

  return `
    <header class="icf-page-header">
      <div class="icf-header__brand">
        ${logoHTML}
      </div>
      <h1 class="icf-page-title">
        <span data-i18n="${titleKey}">${esc(t(titleKey))}</span>
        <span class="icf-page-title__highlight" data-i18n="${highlightKey}">${esc(t(highlightKey))}</span>
      </h1>
      <nav class="icf-lang-switch" role="group"
           aria-label="Language">
        ${langButtons}
      </nav>
    </header>
  `;
}

/**
 * Render decorative SVG brush strokes for brand identity.
 * Positioned absolutely within the .icf-registry container.
 * @returns {string} HTML string with inline SVG decorations
 */
function renderDecorations() {
  const base = appConfig.assetsBase || './src/assets/';
  return `
    <img class="icf-decor icf-decor--star" src="${esc(base)}icf-star.svg"
         style="top:80px;right:-120px;width:600px;"
         alt="" aria-hidden="true">
    <img class="icf-decor icf-decor--symbol" src="${esc(base)}icf-symbol-2.svg"
         style="bottom:-120px;left:-120px;width:560px;"
         alt="" aria-hidden="true">
  `;
}

/**
 * Render the AI matching button (Phase 2 -- visual placeholder).
 * @returns {string} HTML string
 */
function renderAIButton() {
  return `
    <button class="icf-ai-button" disabled
            aria-label="${esc(t('aiButtonTitle'))}">
      <span aria-hidden="true">&#10022;</span>
      <span data-i18n="aiButtonTitle">${esc(t('aiButtonTitle'))}</span>
      <span class="icf-ai-button__sub"
            data-i18n="aiButtonSubtitle">
        ${esc(t('aiButtonSubtitle'))}
      </span>
    </button>
  `;
}

/**
 * Render the "Join the Registry" button for the catalog view.
 * @returns {string} HTML string
 */
function renderJoinButton() {
  if (appConfig.registerUrl) {
    return `
      <a class="icf-join-button" href="${esc(appConfig.registerUrl)}">
        <span data-i18n="joinRegistry">${esc(t('joinRegistry'))}</span>
      </a>
    `;
  }
  return `
    <button class="icf-join-button"
            aria-label="${esc(t('joinRegistry'))}"
            data-action="show-registration">
      <span data-i18n="joinRegistry">${esc(t('joinRegistry'))}</span>
    </button>
  `;
}

/**
 * Render the "Back to catalog" button for the registration view.
 * @returns {string} HTML string
 */
function renderBackButton() {
  if (appConfig.catalogUrl) {
    return `
      <a class="icf-back-button" href="${esc(appConfig.catalogUrl)}">
        <span data-i18n="backToCatalog">${esc(t('backToCatalog'))}</span>
      </a>
    `;
  }
  return `
    <button class="icf-back-button"
            aria-label="${esc(t('backToCatalog'))}"
            data-action="show-catalog">
      <span data-i18n="backToCatalog">${esc(t('backToCatalog'))}</span>
    </button>
  `;
}

/**
 * Render a loading state.
 * @returns {string} HTML string
 */
function renderLoading() {
  return `
    <div class="icf-loading" role="status" aria-live="polite">
      <p data-i18n="loading">${esc(t('loading'))}</p>
    </div>
  `;
}

/**
 * Render an error state.
 * @param {string} [message]
 * @returns {string} HTML string
 */
function renderError(message) {
  return `
    <div class="icf-error-state" role="alert">
      <p data-i18n="errorState">
        ${esc(message || t('errorState'))}
      </p>
    </div>
  `;
}

/**
 * Full render of the catalog view.
 * Called on init, language change, and when returning from registration.
 * @param {'loading'|'ready'|'error'} state
 * @param {string} [errorMessage]
 */
function renderCatalog(state, errorMessage) {
  if (!containerEl) return;

  let bodyHTML = '';

  if (state === 'loading') {
    bodyHTML = renderLoading();
  } else if (state === 'error') {
    bodyHTML = renderError(errorMessage);
  } else {
    bodyHTML = `
      <div id="icf-filters-container"></div>
      <div class="icf-grid" id="icf-grid-container"></div>
    `;
  }

  containerEl.innerHTML = `
    ${renderDecorations()}
    ${renderHeader()}
    ${bodyHTML}
  `;

  bindLanguageSwitch();
  bindViewActions();

  if (state === 'ready') {
    const filtersContainer = containerEl.querySelector(
      '#icf-filters-container'
    );
    const gridContainer = containerEl.querySelector(
      '#icf-grid-container'
    );

    if (filtersContainer) {
      renderFilters(coaches, filtersContainer, handleFilterChange);
    }
    if (gridContainer) {
      renderCards(coaches, gridContainer);
    }
  }
}

/**
 * Full render of the registration view.
 */
function renderRegistration() {
  if (!containerEl) return;

  containerEl.innerHTML = `
    ${renderHeader('regPageTitle', 'regPageTitleHighlight')}
    ${renderBackButton()}
    <div id="icf-registration-container"></div>
  `;

  bindLanguageSwitch();
  bindViewActions();

  const regContainer = containerEl.querySelector(
    '#icf-registration-container'
  );

  if (regContainer) {
    renderRegistrationForm(regContainer, handleFormSubmit);
  }
}

/**
 * Full render of the edit view.
 */
function renderEdit() {
  if (!containerEl) return;

  containerEl.innerHTML = `
    ${renderHeader('editPageTitle', 'editPageTitleHighlight')}
    ${renderBackButton()}
    <div id="icf-edit-container"></div>
  `;

  bindLanguageSwitch();
  bindViewActions();

  const editContainer = containerEl.querySelector(
    '#icf-edit-container'
  );

  if (editContainer) {
    renderEditView(editContainer, appConfig);
  }
}

/**
 * Handle form submission by delegating to the submit module.
 * @param {Record<string, unknown>} formData
 * @returns {Promise<void>}
 */
async function handleFormSubmit(formData) {
  await submitRegistration(formData, {
    apiUrl: appConfig.apiUrl,
    scriptUrl: appConfig.scriptUrl,
    devMode: appConfig.devMode,
  });

  // Redirect to success page
  const successUrl = appConfig.successUrl || '/success';
  window.location.href = successUrl;
}

/**
 * Switch between catalog and registration views.
 * @param {'catalog'|'registration'} view
 */
function showView(view) {
  currentView = view;

  if (view === 'registration') {
    renderRegistration();
  } else if (view === 'edit') {
    renderEdit();
  } else {
    renderCatalog('ready');
  }
}

/**
 * Handle filter change callback.
 * Re-renders cards with the filtered subset.
 * @param {import('./sheets.js').Coach[]} filteredCoaches
 */
function handleFilterChange(filteredCoaches) {
  const gridContainer = containerEl?.querySelector(
    '#icf-grid-container'
  );
  if (gridContainer) {
    renderCards(filteredCoaches, gridContainer);
  }
}

/**
 * Bind click listeners to language switch buttons.
 */
function bindLanguageSwitch() {
  if (!containerEl) return;

  const buttons = containerEl.querySelectorAll(
    '.icf-lang-switch__btn'
  );

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang');
      if (lang && lang !== getCurrentLanguage()) {
        setLanguage(lang);
        // Re-render current view with new language
        showView(currentView);
      }
    });
  });
}

/**
 * Bind click listeners for view navigation buttons.
 * Uses data-action attributes to identify buttons.
 */
function bindViewActions() {
  if (!containerEl) return;

  const regBtn = containerEl.querySelector(
    '[data-action="show-registration"]'
  );
  const backBtn = containerEl.querySelector(
    '[data-action="show-catalog"]'
  );

  if (regBtn) {
    regBtn.addEventListener('click', () => showView('registration'));
  }
  if (backBtn) {
    backBtn.addEventListener('click', () => showView('catalog'));
  }
}

/**
 * Initialize the ICF Coach Registry widget.
 * @param {RegistryConfig} [config]
 */
async function init(config = {}) {
  appConfig = config;
  containerEl = findContainer(config.containerId);

  if (!containerEl) {
    const fallback = document.createElement('div');
    fallback.id = 'icf-coach-registry';
    document.body.appendChild(fallback);
    containerEl = fallback;
  }

  // Add the scoping class for CSS custom properties
  containerEl.classList.add('icf-registry');

  // Load remote config from Settings sheet
  const remoteConfig = await fetchConfig(config.apiUrl);
  if (remoteConfig) {
    // Apply colors and fonts
    applyConfig(remoteConfig, containerEl);

    // Override brand name in i18n
    if (remoteConfig.brandName) {
      setBrandOverrides(remoteConfig.brandName, {
        registryName: remoteConfig.registryName,
        location: remoteConfig.location,
      });
    }

    // Use sheetId from remote if not provided locally
    if (remoteConfig.sheetId && !config.sheetId) {
      appConfig.sheetId = remoteConfig.sheetId;
    }

    // Remote logoUrl takes priority over local
    if (remoteConfig.logoUrl) {
      appConfig.logoUrl = remoteConfig.logoUrl;
    }

    // Update page title with brand name
    if (remoteConfig.registryName) {
      const suffix = {
        catalog: '',
        registration: ' — Registration',
        edit: ' — Edit Profile',
      };
      document.title = remoteConfig.registryName
        + (suffix[config.view] || '');
    }
  }

  // Initialize language
  const lang = initLanguage();
  containerEl.setAttribute('lang', lang);

  // Start with the configured view or default to catalog
  const startView = config.view || 'catalog';

  if (startView === 'registration') {
    // Registration-only page — no need to fetch coaches
    showView('registration');
  } else if (startView === 'edit') {
    // Edit page — no need to fetch coaches
    showView('edit');
  } else {
    // Catalog view — fetch coaches first
    renderCatalog('loading');

    try {
      coaches = await fetchCoaches(appConfig.sheetId);
      renderCatalog('ready');
    } catch (err) {
      renderCatalog('error', esc(t('errorState')));
    }
  }
}

/**
 * Public API -- exposed as ICFRegistry global and as ES module export.
 */
export const ICFRegistry = { init };

// Also attach to window for non-module usage (WordPress embed)
if (typeof window !== 'undefined') {
  window.ICFRegistry = ICFRegistry;
}
