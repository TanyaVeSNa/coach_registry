# Roadmap: ICF Cyprus Coach Registry

## Current Stage: Phase 1 Complete — Live on Custom Domain

All core features delivered and deployed at **https://coaches.icf-cyprus.com/**

**What's done:**
- Coach catalog with filtering (specialization, language, format, ICF level, price)
- Coach registration form with admin moderation via Google Sheet
- Bilingual bios (coach writes in 2 languages, catalog shows matching UI language)
- Photo storage in Google Drive (auto-copy via Apps Script)
- ICF Brand Guidelines 2025 design (Deep Blue, Yellow, Bone palette)
- Trilingual UI (EN / RU / EL)
- Vercel hosting with custom domain + serverless proxy for form submission
- Coach profile modal with full bio
- Mobile-responsive layout

**What's next (in priority order):**
1. Update WordPress page links to new domain
2. Rework photo upload (direct file upload instead of URL)
3. White-label product for other coaching organizations

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

## Phase 2 — Product Expansion (current)

**Theme**: Improve UX, enable reuse, prepare for scale

### Near-term
- **G-024**: Update WordPress links to new domain
- **G-023**: Direct photo upload in registration form
- **G-025**: White-label product (configurable branding for other orgs)

### Medium-term
- **G-006**: Conference landing workflow (QR → registry)
- **G-011**: Coach profile self-editing
- **G-012**: ICF membership expiration tracking

### Later
- **G-003**: AI coach matching assistant (chatbot)
- **G-004**: Analytics (page views, contact clicks, conversion)
- **G-015**: Migrate infrastructure to ICF Cyprus org account
- **G-017**: Unit + integration tests

---

## Strategic Decisions

| Decision | Status |
|----------|--------|
| Google Sheets as data backend (not WordPress CPT) | Decided — no WP admin access needed |
| Standalone JS widget on custom domain | Decided — WP embedding cancelled (platform strips scripts) |
| AI provider (Claude / GPT / other) | Deferred to Phase 2+ |
| White-label product for coaching schools | Planned — first client requested |
