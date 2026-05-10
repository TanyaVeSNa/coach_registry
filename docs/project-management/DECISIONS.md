# Decisions & Workflow

## Development Workflow

### Gates

| Gate | Description | Who |
|------|-------------|-----|
| PRE-GATE | Plan sprint, decompose features into tasks | TPM + Owner |
| GATE 1 | Code review before merge | Claude Code |
| GATE 2 | Audit (security, quality, accessibility) | Auditor agent |
| POST-GATE | Sprint review, retrospective | TPM + Owner |

### Sprint Cycle

1. `/tpm plan` or `/tpm G-XXX` — open sprint with goal
2. `/task` — pick and work on individual features
3. `/done` — close task, tests, commit
4. `/audit` — code quality check
5. `/close` — close sprint, retrospective

### Branching

- `main` — stable, deployable
- `feature/F-NNN-short-name` — per feature branch
- Merge via PR after GATE 1

## Key Decisions Log

### D-001: Google Sheets as data backend
**Date**: 2026-04-03
**Decision**: Use Google Sheets instead of WordPress Custom Post Types
**Rationale**: No WordPress admin access available. Google Sheets allows anyone with sheet access to manage coach data. Simpler to implement and maintain.
**Trade-offs**: No native WP search/SEO for coach profiles. Data size limited (~50 coaches, fine for Sheets).

### D-002: Standalone JS widget (not WP plugin)
**Date**: 2026-04-03
**Decision**: Build a standalone JavaScript application embedded via script tag, not a WordPress plugin
**Rationale**: Decoupled from WP theme. Can be developed and tested independently. Doesn't require WP admin to deploy. Can have its own design language.
**Trade-offs**: No access to WP theme styles/functions. Need to handle CSS isolation.

### D-003: Claude Code as primary developer
**Date**: 2026-04-03
**Decision**: AI writes all code, owner reviews and deploys
**Rationale**: No developer hired. Owner is not a developer but can follow instructions for deployment.
**Trade-offs**: Need extra attention to code quality and testing. Deployment instructions must be clear and step-by-step.

### D-004: Google Apps Script for form submission
**Date**: 2026-04-04
**Decision**: Use Google Apps Script as serverless backend for form submissions
**Rationale**: Zero backend infrastructure needed, no hosting costs, writes directly to Google Sheet. Coach registration form submits data via Apps Script web app endpoint.
**Trade-offs**: No-cors mode means the client cannot verify submission success from the HTTP response. Success is assumed on send; errors are silent on the client side.

### D-005: GitHub Pages for hosting
**Date**: 2026-04-05
**Decision**: Deploy widget on GitHub Pages instead of embedding in WordPress
**Rationale**: ICF Chapters WordPress platform strips script tags, making it impossible to embed custom JS widgets directly. GitHub Pages provides free, reliable static hosting.
**Trade-offs**: External URL (slip-pro.github.io) instead of icf-chapters.org. WordPress page links to the external registry URL.

### D-006: Single Submissions tab
**Date**: 2026-04-05
**Decision**: Use one Google Sheet tab (Submissions) for all coach data
**Rationale**: Simpler than maintaining two separate tabs (Coaches + Submissions). Registration and catalog share the same data source, reducing sync complexity.
**Trade-offs**: All data in one place -- requires status column discipline to distinguish approved coaches from pending submissions.

### D-007: Vercel for production hosting
**Date**: 2026-04-05
**Decision**: Deploy on Vercel instead of GitHub Pages
**Rationale**: Professional URL (icf-cyprus-coaches.vercel.app), auto-deploy on git push, custom domain support for later. GitHub Pages remains as fallback.
**Trade-offs**: Another service dependency, but free tier is sufficient.

### D-008: ICF Brand Guidelines 2025 as design source
**Date**: 2026-04-05
**Decision**: Redesign UI from official ICF Brand Guidelines PDF, not from the original HTML mockup
**Rationale**: Owner provided brandbook and mockup with specific requirements. Official brand alignment is important for ICF chapter credibility.
**Trade-offs**: Hoss Round (official headline font) is commercial — using Nunito as Google Fonts fallback.

### D-009: Owner-driven design iteration
**Date**: 2026-04-05
**Decision**: Design changes go through owner review with screenshots, not autonomous agent decisions
**Rationale**: First autonomous redesign attempt (dark hero banner) was rejected. Owner has specific visual preferences that require iterative feedback.
**Trade-offs**: Slower than autonomous, but results match owner expectations.

### D-010: Bilingual bio (coach chooses 2 languages)
**Date**: 2026-04-05
**Decision**: Coaches write bio in two languages of their choice. Catalog shows bio matching UI language, falls back to English, then first bio.
**Rationale**: Auto-translation is unreliable for coaching terminology. Letting coaches write in their working languages ensures quality.
**Trade-offs**: More work for coaches (two bios instead of one). Optional — Bio 2 not required.

### D-011: Google Sheet column reorder (Status first)
**Date**: 2026-04-05
**Decision**: Moved Status column to A (first) for admin convenience. New column order: Status, Name, Email, ICF Level, Photo, Specializations, Languages, Format, Prices, Bios, Contacts, Meta.
**Rationale**: Admin primarily needs Status + Name + Email for moderation. All other columns are secondary.
**Trade-offs**: Required full Apps Script rewrite and Sheet data migration.

### D-012: Vercel Serverless proxy for form submission
**Date**: 2026-04-11
**Decision**: Route form submissions through Vercel Serverless Function (/api/submit) instead of direct fetch to Google Apps Script.
**Rationale**: Ad-blockers block cross-origin requests to script.google.com. Serverless proxy keeps the request on the same domain (icf-cyprus-coaches.vercel.app), invisible to ad-blockers. Also enables real success/error responses instead of fire-and-forget.
**Trade-offs**: Extra hop (client → Vercel → Apps Script), but latency is negligible. Falls back to direct Apps Script if proxy unavailable.

### D-013: Vercel project rename to icf-cyprus-coaches
**Date**: 2026-04-11
**Decision**: Renamed Vercel project from icf-coach-registry to icf-cyprus-coaches for a professional branded URL.
**Rationale**: Owner wanted icf-cyprus-coaches in the domain name. Old URL (icf-coach-registry.vercel.app) still works as alias.
**Trade-offs**: Had to manually add new domain in Vercel Domains settings and update all references in code/docs.

### D-014: Custom subdomain coaches.icf-cyprus.com
**Date**: 2026-04-14
**Decision**: Connect custom subdomain `coaches.icf-cyprus.com` to Vercel instead of registering a separate .org domain.
**Rationale**: ICF Cyprus already owns `icf-cyprus.com`. Using a subdomain is free, branded, and professional. No need to register and pay for a separate domain.
**DNS**: CNAME record `coaches` → `cname.vercel-dns.com` (Vercel recommends updating to `8f3b787b3b52597a.vercel-dns-017.com`).
**Trade-offs**: Depends on the parent domain owner for DNS changes. Old Vercel URLs continue to work as aliases.

### D-015: Cancel WordPress embedding (G-005)
**Date**: 2026-05-10
**Decision**: Cancel the goal of embedding the widget directly into WordPress. Use external link to `coaches.icf-cyprus.com` instead.
**Rationale**: ICF Chapters WordPress platform strips `<script>` tags, making direct embedding impossible without platform-level changes. Custom domain provides a professional branded URL that works well as an external link. No user has complained about the external link approach.
**Trade-offs**: None significant — the external link works well.

### D-016: White-label product direction
**Date**: 2026-05-10
**Decision**: Refactor the registry into a configurable white-label product that other coaching organizations can deploy.
**Rationale**: A coaching school requested their own copy of the registry. This validates the product beyond ICF Cyprus. Making the branding configurable (logo, colors, fonts, title, data source) allows reuse without forking.
**Trade-offs**: Requires refactoring hardcoded ICF Cyprus references into config. Increases complexity of the codebase but enables growth.

### D-017: Direct photo upload via base64
**Date**: 2026-05-10
**Decision**: Replace URL-based photo input with direct file upload. Photo is converted to base64 in browser, sent as JSON to Vercel proxy, forwarded to Apps Script which saves to Google Drive.
**Rationale**: Previous flow required coaches to upload photo to Google Drive, get a sharing URL, and paste it — too complex for non-technical users. Direct upload is one click.
**Technical details**: Vercel proxy sends JSON body (Content-Type: text/plain) instead of URLSearchParams — URLSearchParams truncated large base64 payloads. Apps Script reads `e.postData.contents`. Max file size: 5 MB (validated client-side). Accepted: JPEG, PNG, WebP.
**Trade-offs**: Larger payload (~7 MB for 5 MB photo). Vercel body limit increased to 10 MB.

### D-018: Magic link authentication for profile editing
**Date**: 2026-05-10
**Decision**: Use email magic link (UUID token) for coach profile editing instead of passwords or OAuth.
**Rationale**: Coaches are non-technical users. Magic link requires no account creation, no password management. Coach enters their email, receives a one-time link, clicks it to edit. Simple and secure.
**Security**: UUID v4 tokens (122 bits of entropy), 24h expiry, single-use, rate limited (1 per 5 min per email). Only approved coaches can request links. API always returns success to prevent email enumeration.
**Trade-offs**: Requires access to email. Token can only be used once — coach must request a new link for each edit session.

### D-019: Settings sheet for Apps Script configuration
**Date**: 2026-05-10
**Decision**: Move hardcoded configuration values from Apps Script code into a "Settings" sheet in Google Sheets (key-value pairs).
**Rationale**: Prepares for white-label product (G-025). Non-developers can change sender name, admin email, site URL, Drive folder ID, and registry name without editing code. Falls back to defaults if Settings sheet is missing.
**Settings**: SENDER_NAME, ADMIN_EMAIL, SITE_URL, EDIT_PAGE, DRIVE_FOLDER, REGISTRY_NAME.
**Trade-offs**: Extra Sheet read on every request. Negligible performance impact (~50 coaches, low traffic).
