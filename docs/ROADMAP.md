# Roadmap: Coach Registry

## Current Stage: Phase 2 Complete — White-Label Ready

All core features delivered and deployed at **https://coaches.icf-cyprus.com/**
The registry is now a reusable white-label product — deployable for any coaching organization.

**What's done (Phase 1 + 1.5 + 2):**
- Coach catalog with filtering (specialization, language, format, ICF level, price)
- Coach registration form with admin moderation via Google Sheet
- Coach profile editing via email magic link (secure, no passwords)
- Direct photo upload in registration and edit forms
- Bilingual bios (coach writes in 2 languages, catalog shows matching UI language)
- Photo storage in Google Drive (auto-copy via Apps Script)
- Configurable branding (colors, fonts, logo, name) via Google Sheet Settings
- Trilingual UI (EN / RU / EL) with brand name overrides
- Vercel hosting with custom domain + serverless proxy
- Coach profile modal with full bio
- Mobile-responsive layout
- Deployment guide for new instances (fork + 1 env var + Settings sheet)

**What's next:**
1. Test with a second instance (coaching school)
2. Conference landing workflow (QR → registry)
3. AI coach matching assistant

---

## Phase 1 — MVP ✅

**Theme**: Working coach catalog with filtering and contact

- Coach card grid with profile fields
- Client-side filtering (5 filters)
- Contact buttons (WhatsApp, Telegram, Email) with pre-filled messages
- 3-language UI (EN / RU / EL)
- Google Sheets as data backend
- Coach registration form with moderation
- Deployed on Vercel, linked from WordPress

---

## Phase 1.5 — Polish & Infrastructure ✅

**Theme**: Production-ready with professional branding

- ICF Brand Guidelines 2025 redesign
- Bilingual bio support
- Google Drive photo storage
- Coach profile modal
- Vercel serverless proxy (ad-blocker bypass)
- Custom domain: coaches.icf-cyprus.com
- Mobile layout optimization

---

## Phase 2 — Product Expansion ✅

**Theme**: Self-service editing, white-label reuse

### Completed
- **G-024**: Update WordPress links to new domain ✅
- **G-023**: Direct photo upload in registration form ✅
- **G-011**: Coach profile editing via magic link ✅
- **G-025**: White-label product ✅
  - All config in Google Sheet Settings tab (17 keys)
  - Frontend loads config at runtime (colors, fonts, logo, brand)
  - Apps Script URL as Vercel env var
  - Deployment guide for new instances

---

## Phase 3 — Scale & AI (next)

**Theme**: Growth, analytics, intelligent matching

### Near-term
- **G-025**: Test with second instance (coaching school client)
- **G-006**: Conference landing workflow (QR → registry)

### Medium-term
- **G-012**: ICF membership expiration tracking
- **G-003**: AI coach matching assistant (chatbot)
- **G-004**: Analytics (page views, contact clicks, conversion)

### Later
- **G-015**: Migrate infrastructure to ICF Cyprus org account
- **G-017**: Unit + integration tests

---

## Strategic Decisions

| Decision | Status |
|----------|--------|
| Google Sheets as data backend (not WordPress CPT) | Decided — no WP admin access needed |
| Standalone JS widget on custom domain | Decided — WP embedding cancelled (platform strips scripts) |
| White-label product for coaching schools | Done — config-driven, first client onboarding |
| All config in Google Sheet | Done — no code changes for new instances |
| AI provider (Claude / GPT / other) | Deferred to Phase 3 |
