/**
 * ICF Registry — Filter Panel Module
 *
 * Renders filter chips for:
 * - Specialization (multi-select dropdown)
 * - Language (multi-select chips)
 * - ICF Level (ACC, PCC, MCC — multi-select chips)
 * - Price range (predefined range chips)
 *
 * Filter logic:
 * - AND between different filter groups
 * - OR within each group
 * - Empty group = all coaches pass
 *
 * @module filters
 */

import { t, translateSpec } from './i18n.js';

/** Track the current outside-click handler to prevent listener accumulation */
let currentOutsideClickHandler = null;

/**
 * @typedef {Object} FilterState
 * @property {Set<string>} specializations
 * @property {Set<string>} languages
 * @property {Set<string>} levels
 * @property {Set<string>} priceRanges
 */

/**
 * @typedef {Object} PriceRange
 * @property {string} key — unique identifier
 * @property {string} labelKey — i18n key for display label
 * @property {number} min — minimum price (inclusive)
 * @property {number} max — maximum price (inclusive, Infinity for no upper bound)
 */

/** @type {PriceRange[]} */
const PRICE_RANGES = [
  { key: 'under50', labelKey: 'priceUnder50', min: 0, max: 4999 },
  { key: '50to100', labelKey: 'price50to100', min: 5000, max: 10000 },
  { key: '100to150', labelKey: 'price100to150', min: 10000, max: 20000 },
  { key: 'over150', labelKey: 'priceOver150', min: 20001, max: Infinity },
];

/** ICF credential levels displayed as filter chips */
const ICF_LEVELS = ['ACC', 'PCC', 'MCC'];

/** Fixed language filter options (only 3 main languages) */
const LANG_FILTER_OPTIONS = ['English', 'Russian'];

/** Language display names mapped to i18n keys */
const LANG_I18N_MAP = {
  'Russian': 'langRussian',
  'English': 'langEnglish',
  'Greek': 'langGreek',
};

/** Specialization display names mapped to i18n keys */
/**
 * Create a fresh filter state with all selections empty.
 * @returns {FilterState}
 */
function createEmptyState() {
  return {
    specializations: new Set(),
    languages: new Set(),
    levels: new Set(),
    priceRanges: new Set(),
  };
}

/**
 * Extract unique sorted specialization values from all coaches.
 * @param {import('./sheets.js').Coach[]} coaches
 * @returns {string[]}
 */
function extractSpecializations(coaches) {
  const set = new Set();
  for (const coach of coaches) {
    for (const spec of coach.specializations) {
      if (spec) set.add(spec);
    }
  }
  return Array.from(set).sort();
}

/**
 * Extract unique language values from all coaches, sorted.
 * @param {import('./sheets.js').Coach[]} coaches
 * @returns {string[]}
 */
function extractLanguages(coaches) {
  const set = new Set();
  for (const coach of coaches) {
    for (const lang of coach.languages) {
      if (lang) set.add(lang);
    }
  }
  return Array.from(set).sort();
}

/**
 * Pure filter function — applies all active filters to the coach list.
 * Exported for testability.
 *
 * @param {import('./sheets.js').Coach[]} coaches — full coach list
 * @param {FilterState} state — current filter state
 * @returns {import('./sheets.js').Coach[]}
 */
export function applyFilters(coaches, state) {
  return coaches.filter((coach) => {
    // Specialization: OR within group
    if (state.specializations.size > 0) {
      const match = coach.specializations.some(
        (s) => state.specializations.has(s)
      );
      if (!match) return false;
    }

    // Language: OR within group
    if (state.languages.size > 0) {
      const match = coach.languages.some(
        (l) => state.languages.has(l)
      );
      if (!match) return false;
    }

    // ICF Level: OR within group
    if (state.levels.size > 0) {
      if (!state.levels.has(coach.icfLevel)) return false;
    }

    // Price Range: OR within group
    if (state.priceRanges.size > 0) {
      const match = PRICE_RANGES.some((range) => {
        if (!state.priceRanges.has(range.key)) return false;
        return coachMatchesPriceRange(coach, range);
      });
      if (!match) return false;
    }

    return true;
  });
}

/**
 * Check if a coach's price range overlaps with a filter range.
 * Coaches with priceMin === 0 and priceMax === 0 are "on request"
 * and do not match any price filter.
 * @param {import('./sheets.js').Coach} coach
 * @param {PriceRange} range
 * @returns {boolean}
 */
function coachMatchesPriceRange(coach, range) {
  // "On request" coaches have no price — exclude from price filtering
  if (coach.priceMin === 0 && coach.priceMax === 0) return false;

  const coachMin = coach.priceMin || 0;
  const coachMax = coach.priceMax || coach.priceMin || 0;

  // Overlap check: coach range intersects filter range
  return coachMin <= range.max && coachMax >= range.min;
}

/**
 * SVG icon for the filter/funnel indicator on the Specialization dropdown.
 * @returns {string}
 */
function filterIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
    stroke-width="1.5" width="14" height="14" aria-hidden="true">
    <path d="M2 4h12M4 8h8M6 12h4"/>
  </svg>`;
}

/**
 * SVG chevron-down icon for the dropdown toggle.
 * @returns {string}
 */
function chevronIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
    stroke-width="2" width="10" height="10" aria-hidden="true">
    <path d="M4 6l4 4 4-4"/>
  </svg>`;
}

/**
 * SVG check icon for selected items in dropdown.
 * @returns {string}
 */
function checkIcon() {
  return `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
    stroke-width="2" width="12" height="12" aria-hidden="true">
    <path d="M3 8l4 4 6-7"/>
  </svg>`;
}

/**
 * Render filter panel into the given container.
 *
 * @param {import('./sheets.js').Coach[]} coaches — full coach list
 * @param {HTMLElement} container — DOM element to render into
 * @param {function(import('./sheets.js').Coach[]): void} onFilterChange
 * @returns {void}
 */
export function renderFilters(coaches, container, onFilterChange) {
  container.innerHTML = '';

  const allSpecializations = extractSpecializations(coaches);
  const allLanguages = LANG_FILTER_OPTIONS;
  const state = createEmptyState();

  /** Re-apply filters and notify parent */
  function update() {
    const filtered = applyFilters(coaches, state);
    onFilterChange(filtered);
    updateResultsCount(filtered.length, coaches.length);
    updateClearAllVisibility();
  }

  /** Update the results counter text */
  function updateResultsCount(shown, total) {
    const el = container.querySelector('.icf-results-count');
    if (el) {
      el.textContent = t('resultsCount')
        .replace('{shown}', String(shown))
        .replace('{total}', String(total));
      el.style.display = shown < total ? '' : 'none';
    }
  }

  /** Show/hide the "Clear all" chip */
  function updateClearAllVisibility() {
    const clearBtn = container.querySelector(
      '[data-filter-action="clear-all"]'
    );
    if (!clearBtn) return;

    const hasActive = state.specializations.size > 0
      || state.languages.size > 0
      || state.levels.size > 0
      || state.priceRanges.size > 0;

    clearBtn.style.display = hasActive ? '' : 'none';
  }

  // --- Build DOM ---

  const wrapper = document.createElement('div');
  wrapper.className = 'icf-filters';

  // 1. Specialization dropdown trigger
  const specContainer = document.createElement('div');
  specContainer.className = 'icf-filter-dropdown';

  const specBtn = document.createElement('button');
  specBtn.className = 'icf-filter-chip';
  specBtn.setAttribute('aria-expanded', 'false');
  specBtn.setAttribute('aria-haspopup', 'true');
  specBtn.innerHTML = `${filterIcon()}
    <span data-i18n="filterSpecialization">${t('filterSpecialization')}</span>
    <span class="icf-filter-chip__count" style="display:none"></span>
    ${chevronIcon()}`;

  const specPanel = buildSpecDropdown(
    allSpecializations,
    state,
    specBtn,
    update
  );

  specContainer.appendChild(specBtn);
  specContainer.appendChild(specPanel);
  wrapper.appendChild(specContainer);

  // 2. Language dropdown
  const langContainer = document.createElement('div');
  langContainer.className = 'icf-filter-dropdown';

  const langBtn = document.createElement('button');
  langBtn.className = 'icf-filter-chip';
  langBtn.setAttribute('aria-expanded', 'false');
  langBtn.setAttribute('aria-haspopup', 'true');
  langBtn.innerHTML = `${filterIcon()}
    <span data-i18n="filterLanguage">${t('filterLanguage')}</span>
    <span class="icf-filter-chip__count" style="display:none"></span>
    ${chevronIcon()}`;

  const langPanel = buildGenericDropdown(
    allLanguages,
    state.languages,
    langBtn,
    update,
    getLanguageLabel
  );

  langContainer.appendChild(langBtn);
  langContainer.appendChild(langPanel);
  wrapper.appendChild(langContainer);

  // 3. ICF Level dropdown
  const levelContainer = document.createElement('div');
  levelContainer.className = 'icf-filter-dropdown';

  const levelBtn = document.createElement('button');
  levelBtn.className = 'icf-filter-chip';
  levelBtn.setAttribute('aria-expanded', 'false');
  levelBtn.setAttribute('aria-haspopup', 'true');
  levelBtn.innerHTML = `${filterIcon()}
    <span data-i18n="filterLevel">${t('filterLevel')}</span>
    <span class="icf-filter-chip__count" style="display:none"></span>
    ${chevronIcon()}`;

  const levelPanel = buildGenericDropdown(
    ICF_LEVELS,
    state.levels,
    levelBtn,
    update,
    (v) => v
  );

  levelContainer.appendChild(levelBtn);
  levelContainer.appendChild(levelPanel);
  wrapper.appendChild(levelContainer);

  // 5. Price range dropdown
  const priceContainer = document.createElement('div');
  priceContainer.className = 'icf-filter-dropdown';

  const priceBtn = document.createElement('button');
  priceBtn.className = 'icf-filter-chip';
  priceBtn.setAttribute('aria-expanded', 'false');
  priceBtn.setAttribute('aria-haspopup', 'true');
  priceBtn.innerHTML = `${filterIcon()}
    <span data-i18n="filterPrice">${t('filterPrice')}</span>
    <span class="icf-filter-chip__count" style="display:none"></span>
    ${chevronIcon()}`;

  const priceOptions = PRICE_RANGES.map((r) => r.key);
  const pricePanel = buildGenericDropdown(
    priceOptions,
    state.priceRanges,
    priceBtn,
    update,
    (key) => {
      const range = PRICE_RANGES.find((r) => r.key === key);
      return range ? t(range.labelKey) : key;
    }
  );

  priceContainer.appendChild(priceBtn);
  priceContainer.appendChild(pricePanel);
  wrapper.appendChild(priceContainer);

  // 6. Clear all button (hidden initially)
  const clearBtn = document.createElement('button');
  clearBtn.className = 'icf-filter-chip icf-filter-chip--clear';
  clearBtn.setAttribute('data-filter-action', 'clear-all');
  clearBtn.style.display = 'none';
  clearBtn.innerHTML = `<span>&times;</span>
    <span data-i18n="filterClearAll">${t('filterClearAll')}</span>`;
  clearBtn.addEventListener('click', () => {
    state.specializations.clear();
    state.languages.clear();
    state.levels.clear();
    state.priceRanges.clear();
    resetAllChips(wrapper);
    resetSpecDropdown(specPanel, specBtn);
    resetSpecDropdown(langPanel, langBtn);
    resetSpecDropdown(levelPanel, levelBtn);
    resetSpecDropdown(pricePanel, priceBtn);
    update();
  });
  wrapper.appendChild(clearBtn);

  container.appendChild(wrapper);

  // 7. Results counter (below filters)
  const resultsCount = document.createElement('div');
  resultsCount.className = 'icf-results-count';
  resultsCount.setAttribute('role', 'status');
  resultsCount.setAttribute('aria-live', 'polite');
  resultsCount.style.display = 'none';
  container.appendChild(resultsCount);

  // Close dropdowns when clicking outside
  const allDropdowns = [
    { container: specContainer, panel: specPanel, btn: specBtn },
    { container: langContainer, panel: langPanel, btn: langBtn },
    { container: levelContainer, panel: levelPanel, btn: levelBtn },
    { container: priceContainer, panel: pricePanel, btn: priceBtn },
  ];

  if (currentOutsideClickHandler) {
    document.removeEventListener('click', currentOutsideClickHandler);
  }
  currentOutsideClickHandler = (e) => {
    for (const dd of allDropdowns) {
      if (!dd.container.contains(/** @type {Node} */ (e.target))) {
        closeSpecDropdown(dd.panel, dd.btn);
      }
    }
  };
  document.addEventListener('click', currentOutsideClickHandler);

  // Close dropdowns on Escape
  for (const dd of allDropdowns) {
    dd.container.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSpecDropdown(dd.panel, dd.btn);
        dd.btn.focus();
      }
    });
  }
}

/**
 * Build a simple toggle chip button.
 * @param {string} label
 * @param {string} value
 * @param {Set<string>} stateSet — the Set in FilterState to toggle
 * @param {function(): void} onChange
 * @returns {HTMLButtonElement}
 */
function buildToggleChip(label, value, stateSet, onChange) {
  const btn = document.createElement('button');
  btn.className = 'icf-filter-chip';
  btn.textContent = label;
  btn.setAttribute('data-filter-value', value);
  btn.setAttribute('aria-pressed', 'false');

  btn.addEventListener('click', () => {
    if (stateSet.has(value)) {
      stateSet.delete(value);
      btn.classList.remove('icf-filter-chip--active');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      stateSet.add(value);
      btn.classList.add('icf-filter-chip--active');
      btn.setAttribute('aria-pressed', 'true');
    }
    onChange();
  });

  return btn;
}

/**
 * Build a generic multi-select dropdown panel.
 * @param {string[]} options — list of values
 * @param {Set<string>} stateSet — the Set in FilterState to toggle
 * @param {HTMLButtonElement} triggerBtn
 * @param {function(): void} onChange
 * @param {function(string): string} labelFn — maps value to display label
 * @returns {HTMLDivElement}
 */
function buildGenericDropdown(options, stateSet, triggerBtn, onChange, labelFn) {
  const panel = document.createElement('div');
  panel.className = 'icf-filter-dropdown__panel';
  panel.setAttribute('role', 'listbox');
  panel.setAttribute('aria-multiselectable', 'true');
  panel.style.display = 'none';

  for (const value of options) {
    const option = document.createElement('label');
    option.className = 'icf-filter-dropdown__option';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'icf-filter-dropdown__checkbox';
    checkbox.value = value;

    const checkMark = document.createElement('span');
    checkMark.className = 'icf-filter-dropdown__check';
    checkMark.innerHTML = checkIcon();

    const text = document.createElement('span');
    text.className = 'icf-filter-dropdown__text';
    text.textContent = labelFn(value);

    option.appendChild(checkbox);
    option.appendChild(checkMark);
    option.appendChild(text);

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        stateSet.add(value);
        option.setAttribute('aria-selected', 'true');
      } else {
        stateSet.delete(value);
        option.setAttribute('aria-selected', 'false');
      }
      updateSpecTrigger(triggerBtn, stateSet.size);
      onChange();
    });

    panel.appendChild(option);
  }

  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.style.display !== 'none';
    if (isOpen) {
      closeSpecDropdown(panel, triggerBtn);
    } else {
      panel.style.display = '';
      triggerBtn.setAttribute('aria-expanded', 'true');
    }
  });

  return panel;
}

/**
 * Build the specialization dropdown panel.
 * @param {string[]} specializations
 * @param {FilterState} state
 * @param {HTMLButtonElement} triggerBtn
 * @param {function(): void} onChange
 * @returns {HTMLDivElement}
 */
function buildSpecDropdown(specializations, state, triggerBtn, onChange) {
  const panel = document.createElement('div');
  panel.className = 'icf-filter-dropdown__panel';
  panel.setAttribute('role', 'listbox');
  panel.setAttribute('aria-multiselectable', 'true');
  panel.style.display = 'none';

  for (const spec of specializations) {
    const option = document.createElement('label');
    option.className = 'icf-filter-dropdown__option';
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'icf-filter-dropdown__checkbox';
    checkbox.value = spec;

    const checkMark = document.createElement('span');
    checkMark.className = 'icf-filter-dropdown__check';
    checkMark.innerHTML = checkIcon();

    const text = document.createElement('span');
    text.className = 'icf-filter-dropdown__text';
    text.textContent = getSpecLabel(spec);

    option.appendChild(checkbox);
    option.appendChild(checkMark);
    option.appendChild(text);

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        state.specializations.add(spec);
        option.setAttribute('aria-selected', 'true');
      } else {
        state.specializations.delete(spec);
        option.setAttribute('aria-selected', 'false');
      }
      updateSpecTrigger(triggerBtn, state.specializations.size);
      onChange();
    });

    panel.appendChild(option);
  }

  // Toggle dropdown open/close
  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = panel.style.display !== 'none';
    if (isOpen) {
      closeSpecDropdown(panel, triggerBtn);
    } else {
      panel.style.display = '';
      triggerBtn.setAttribute('aria-expanded', 'true');
    }
  });

  return panel;
}

/**
 * Update the specialization trigger button to show active count.
 * @param {HTMLButtonElement} triggerBtn
 * @param {number} count
 */
function updateSpecTrigger(triggerBtn, count) {
  const badge = triggerBtn.querySelector('.icf-filter-chip__count');
  if (!badge) return;

  if (count > 0) {
    badge.textContent = String(count);
    badge.style.display = '';
    triggerBtn.classList.add('icf-filter-chip--active');
    triggerBtn.setAttribute('aria-pressed', 'true');
  } else {
    badge.style.display = 'none';
    triggerBtn.classList.remove('icf-filter-chip--active');
    triggerBtn.setAttribute('aria-pressed', 'false');
  }
}

/**
 * Close the specialization dropdown panel.
 * @param {HTMLDivElement} panel
 * @param {HTMLButtonElement} triggerBtn
 */
function closeSpecDropdown(panel, triggerBtn) {
  panel.style.display = 'none';
  triggerBtn.setAttribute('aria-expanded', 'false');
}

/**
 * Reset the specialization dropdown (uncheck all, update trigger).
 * @param {HTMLDivElement} panel
 * @param {HTMLButtonElement} triggerBtn
 */
function resetSpecDropdown(panel, triggerBtn) {
  const checkboxes = panel.querySelectorAll(
    '.icf-filter-dropdown__checkbox'
  );
  checkboxes.forEach((cb) => {
    /** @type {HTMLInputElement} */ (cb).checked = false;
    const option = cb.closest('.icf-filter-dropdown__option');
    if (option) option.setAttribute('aria-selected', 'false');
  });
  updateSpecTrigger(triggerBtn, 0);
}

/**
 * Reset all toggle chips in the wrapper to inactive state.
 * @param {HTMLElement} wrapper
 */
function resetAllChips(wrapper) {
  const chips = wrapper.querySelectorAll(
    '.icf-filter-chip[data-filter-value]'
  );
  chips.forEach((chip) => {
    chip.classList.remove('icf-filter-chip--active');
    chip.setAttribute('aria-pressed', 'false');
  });
}

/**
 * Get the translated label for a language name.
 * Falls back to the raw language name if no i18n key exists.
 * @param {string} langName — e.g. "Russian", "English"
 * @returns {string}
 */
function getLanguageLabel(langName) {
  const key = LANG_I18N_MAP[langName];
  if (key) return t(key);
  return langName;
}

/**
 * Get the translated label for a specialization name.
 * @param {string} specName — e.g. "Career", "Leadership"
 * @returns {string}
 */
function getSpecLabel(specName) {
  return translateSpec(specName);
}
