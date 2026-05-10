# Goals

## Active Goals

### _(no active goal)_

---

## Future Goals (by priority)

### G-024: Update WordPress Links
**Status**: Planned
**Priority**: 🔴 High — next
**Description**: Update links on the ICF Cyprus WordPress page (`icf-chapters.org/icf-cyprus/find-a-coach/`) to point to the new custom domain `coaches.icf-cyprus.com` instead of old Vercel/GitHub Pages URLs. Also update registration page link.
**Action**: Ask WP admin to update the links, or provide exact URLs to replace.

### G-023: Photo Upload Rework
**Status**: Planned
**Priority**: 🔴 High
**Description**: Replace the current photo flow (coach pastes Google Drive URL → Apps Script copies file) with direct file upload through the registration form. Current flow is confusing for coaches. Consider: upload via Vercel Serverless Function to Google Drive, or upload via Apps Script with base64 encoding.

### G-025: White-Label Product (Reusable Registry)
**Status**: Planned
**Priority**: 🟡 Medium
**Description**: Refactor the registry into a configurable white-label product that can be deployed for other coaching schools and organizations. A coaching school requested their own copy. Need to extract ICF Cyprus-specific branding, data sources, and config into a separate layer so the core engine is reusable. Each instance gets its own: branding (logo, colors, fonts), Google Sheet, domain, i18n overrides.
**Action**: Identify all hardcoded ICF Cyprus references, design a config system, create deployment guide for new instances.

### G-006: Conference Landing Workflow
**Status**: Planned
**Priority**: 🟡 Medium
**Description**: Workflow for potential clients from conference to access the registry. Details TBD.

### G-011: Coach Profile Editing Workflow
**Status**: Planned
**Priority**: 🟡 Medium
**Description**: Process for coaches to update their profile (new photo, ICF level upgrade, bio changes). Define who does it (coach self-service vs admin) and how. Currently admin edits Google Sheet manually — need a scalable approach as registry grows.

### G-012: ICF Membership Expiration Tracking
**Status**: Backlog (needs input from chapter admin)
**Priority**: 🟢 Low
**Description**: Track when a coach's ICF chapter membership expires and auto-hide or flag them in the registry. Need to understand from the responsible colleague: how membership data is tracked, is there an API/export, what's the renewal cycle.
**Action**: Ask responsible colleague about membership tracking process before designing solution.

### G-003: AI Coach Matching Assistant
**Status**: Deferred
**Priority**: 🟢 Low (Phase 2)
**Description**: AI chatbot widget that helps clients find the right coach through a short conversation.

### G-004: Analytics & Optimization
**Status**: Deferred
**Priority**: 🟢 Low (Phase 2)
**Description**: Track page views, filter usage, contact clicks, and AI conversation conversion.

### G-015: Migrate Infrastructure to ICF Cyprus Account
**Status**: Backlog
**Priority**: 🟢 Low (Phase 2+)
**Description**: Move all infrastructure from personal account to official ICF Cyprus account: Google Sheet, Google Drive (photos), Apps Script, Vercel project, GitHub repo. Currently everything runs under the personal account of the board member who set it up.
**Action**: Coordinate with ICF Cyprus admin to create/transfer ownership.

### G-017: Unit + Integration Tests
**Status**: Backlog
**Priority**: 🟢 Low (Phase 2+)
**Description**: Add test coverage for the widget. Unit tests for pure logic (CSV parsing, filters, i18n, URL validation, HTML escaping). Integration tests for DOM rendering (cards, filters, language switch, form validation). Simple HTML test runner — no npm/Node required.

### ~~G-005: Embed Widget in WordPress~~
**Status**: Cancelled
**Reason**: WP platform strips `<script>` tags. Custom domain `coaches.icf-cyprus.com` solves the problem — no need to embed. WP page links to the registry externally.

---

## Achieved Goals

### G-018: Coach Profile Modal
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-09

Clicking a coach card opens a modal with the full profile: complete bio (no truncation), tags, meta info, and contact buttons. Modal closes via X button, backdrop click, or Escape key. On mobile the modal renders as a bottom sheet (85vh max). Cards show cursor:pointer for clickability. i18n key `closeModal` added for EN/RU/EL.

**Files changed**: `src/js/cards.js`, `src/styles/main.css`, `src/js/i18n.js`

---

### G-019: Registration Form Fix (Apps Script Redeployment)
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-09

Apps Script endpoint was broken (page not found error). User redeployed the script with a new deployment. Documentation updated: `docs/GOOGLE_APPS_SCRIPT.md` now uses `e.parameter.payload` instead of `e.postData.contents` for correct parameter handling.

**Files changed**: `docs/GOOGLE_APPS_SCRIPT.md`

---

### G-020: Remove ICF Membership Field from Registration
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-09

Removed Section 7 (ICF Membership Number) from the registration form entirely. Field removed from data collection. Coaches no longer need to provide membership info during registration.

---

### G-021: Avatar Photo Centering Fix
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-09

Added `object-position: center top` to `.icf-avatar` so that coach photos focus on the face/upper body rather than the center of the image. Fixes cropping issues with portrait photos.

**Files changed**: `src/styles/main.css`

---

### G-022: Browser-Based Modal Tests
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-09

Added `tests/modal.test.html` with 13 assertions covering modal open/close behavior, content rendering, keyboard navigation (Escape), and backdrop click. Simple HTML test runner — no npm/Node required, runs in any browser.

**Files changed**: `tests/modal.test.html`

---

### G-013: Registration Form Redesign + Bilingual Bio
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-05

Bilingual bio support: coaches write bio in 2 languages, catalog shows bio matching UI language (fallback: English → first bio). New Google Sheet column structure with Status as column A. Form updated with two bio fields + language selectors. Apps Script rewritten for new column order.

---

### G-014: Filter Cleanup + Translation
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-05

Languages: only EN/RU/EL (translated per UI language). Format: removed "Both" chip (coaches with both still match). Specializations translated. Price filters on second row.

---

### G-010: Photo Storage in Google Drive
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-05

Apps Script auto-copies coach photos to chapter's Google Drive folder on registration. Stable thumbnail URL stored in Sheet.

---

### G-016: Custom Domain
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-14

Connected custom subdomain `coaches.icf-cyprus.com` to Vercel. Domain admin created CNAME record pointing `coaches` to `cname.vercel-dns.com`. Vercel auto-issued SSL certificate. Old URLs (`icf-cyprus-coaches.vercel.app`, `icf-coach-registry.vercel.app`) continue to work as aliases.

**Live URL**: https://coaches.icf-cyprus.com

---

### G-008+G-009: Vercel Deploy + ICF Brandbook Redesign
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-05

- Deployed to Vercel: https://icf-cyprus-coaches.vercel.app/
- Full redesign per ICF Brand Guidelines 2025
- Colors: Deep Blue #212251, Blue #2b379b, Yellow #efcb30, Bone #f8f0e4
- Typography: Nunito headlines + Plus Jakarta Sans body
- Card hover: Blue bg with white text + yellow tags
- ICF badges: yellow bg default, white bg on hover
- Decorative brush stroke SVGs on background
- ICF logo in header (PNG placeholder, awaiting SVG from designer)
- Title: "Найти коуча" + "ICF Cyprus" in yellow pill badge

**Finalization (2026-04-07)**:
- Real ICF Cyprus Chapter logo (full color) at 110px desktop / 70px mobile
- 2 large brush stroke decorations (blue star + symbol) from designer
- AI button hidden (deferred to Phase 2)
- Coach avatars enlarged 64px → 96px

**Notes**: `docs/notes/G-008-009.md`

---

### G-005a: Deploy to GitHub Pages
**Status**: Achieved
**Phase**: 1.5
**Completed**: 2026-04-05

Catalog deployed at https://slip-pro.github.io/icf-coach-registry/
Linked from WP page Find a Coach. Full WP embed blocked by platform restrictions.

---

### G-002: Coach Registration Flow
**Status**: Achieved
**Phase**: 1
**Completed**: 2026-04-04
**Commit**: 5579d2a

**Acceptance Criteria**:
- [x] Коуч может заполнить и отправить форму без WP-доступа
- [x] Админ получает уведомление и может одобрить/отклонить
- [x] Одобренные коучи появляются в каталоге

**Notes**: `docs/notes/G-002.md`

---

### G-001: MVP Coach Catalog
**Status**: Achieved
**Phase**: 1
**Completed**: 2026-04-03
**Commit**: 884b48b

**Acceptance Criteria**:
- [x] Catalog displays coach cards from Google Sheets data
- [x] All 5 filters work without page reload
- [x] Contact buttons open messenger/email with pre-filled text
- [x] Works on mobile (iOS Safari, Android Chrome)
- [x] UI available in 3 languages

**Notes**: `docs/notes/G-001.md`

---

## Technical Debt

### TD-001: ARIA keyboard navigation in filter dropdown
**Problem**: Specialization dropdown uses `role="listbox"` but lacks arrow key navigation between options
**Fix**: Implement arrow key navigation or change to `role="group"`
**Priority**: Medium
**Source**: G-001 Sprint 1 (audit finding)

### TD-002: WhatsApp number country code assumption
**Problem**: WhatsApp normalization assumes Cyprus prefix (+357) for numbers starting with 0
**Fix**: Document assumption or require full international format
**Priority**: Low
**Source**: G-001 Sprint 1 (audit finding)

### TD-003: CSP compatibility for inline styles
**Problem**: Avatar placeholders use inline `style` attribute for dynamic colors — blocked by strict CSP
**Fix**: Move dynamic color to CSS variable via JS `.style` property
**Priority**: Low
**Source**: G-001 Sprint 1 (audit finding)
