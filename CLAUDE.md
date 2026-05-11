# Coach Registry

## Overview

White-label coach directory. Filterable catalog, registration form, profile editing via magic link.
First instance: ICF Cyprus (`coaches.icf-cyprus.com`).
Configurable for any coaching organization — no code changes needed.

## Stack

- **Frontend**: Vanilla JavaScript / HTML / CSS (standalone widget)
- **Backend**: Google Apps Script (forms, emails, photos, config)
- **Data**: Google Sheets (coach data + Settings config)
- **Hosting**: Vercel (hosting + serverless API proxy) — auto-deploys from main
- **Languages**: 3 UI languages — EN / RU / EL

## Project Structure

```
/
├── CLAUDE.md                          # This file
├── DESIGN.md                          # Design system tokens
├── README.md                          # Project overview
├── api/                               # Vercel serverless functions
│   ├── config.js                      # GET /api/config — frontend config
│   ├── submit.js                      # POST /api/submit — registration
│   ├── request-edit-link.js           # POST /api/request-edit-link
│   ├── verify-token.js                # POST /api/verify-token
│   └── save-profile.js               # POST /api/save-profile
├── src/
│   ├── index.html                     # Catalog page
│   ├── register.html                  # Registration page
│   ├── edit.html                      # Profile edit page
│   ├── success.html                   # Post-registration page
│   ├── js/
│   │   ├── app.js                     # Main entry point
│   │   ├── config.js                  # Remote config loader
│   │   ├── i18n.js                    # Translations (EN/RU/EL)
│   │   ├── cards.js                   # Coach card rendering
│   │   ├── filters.js                 # Filter panel
│   │   ├── registration.js            # Registration form
│   │   ├── edit.js                    # Edit profile (magic link)
│   │   ├── submit.js                  # Form submission
│   │   ├── sheets.js                  # Google Sheets data fetching
│   │   └── utils.js                   # Utilities (escaping, etc.)
│   ├── styles/main.css                # All styles
│   └── assets/                        # Logo, icons, SVG decorations
├── docs/
│   ├── DEPLOYMENT_GUIDE.md            # Deploy a new instance
│   ├── ADMIN_GUIDE.md                 # Coach moderation
│   ├── GOOGLE_APPS_SCRIPT.md          # Backend setup
│   ├── GOOGLE_SHEETS_SETUP.md         # Data structure
│   ├── APPS_SCRIPT_FULL_CODE.js       # Complete backend code (copy-paste)
│   └── project-management/
│       ├── GOALS.md                   # Sprint goals
│       ├── BACKLOG.md                 # Feature backlog
│       └── DECISIONS.md               # Architecture decisions
├── public/embed-example.html          # WordPress embed example
└── temp/                              # Source materials (brandbook, mockups)
```

## Key Docs

| Document | Path |
|----------|------|
| Deployment Guide | `docs/DEPLOYMENT_GUIDE.md` |
| Admin Guide | `docs/ADMIN_GUIDE.md` |
| Apps Script Setup | `docs/GOOGLE_APPS_SCRIPT.md` |
| Apps Script Code | `docs/APPS_SCRIPT_FULL_CODE.js` |
| Roadmap | `docs/ROADMAP.md` |
| Goals | `docs/project-management/GOALS.md` |
| Decisions | `docs/project-management/DECISIONS.md` |

## Configuration

All instance-specific config is in two places:
1. **Vercel env var**: `APPS_SCRIPT_URL` — Google Apps Script deployment URL
2. **Google Sheet Settings tab**: 17 keys — branding, colors, fonts, emails, URLs

No code changes needed for new instances. See `docs/DEPLOYMENT_GUIDE.md`.

## Conventions

- UI text must support 3 languages: EN, RU, EL (via `src/js/i18n.js`)
- Brand name comes from Settings sheet, not hardcoded
- Coach data lives in Google Sheets — no WordPress admin required
- Mobile-first responsive design
- All API endpoints proxy through Vercel to avoid CORS/ad-blocker issues

## Commands

```bash
# Development — start local server
python3 server.py
# Open http://localhost:8000

# Production — auto-deploys from main branch
# https://coaches.icf-cyprus.com/

# No lint/test/build commands — vanilla JS, no tooling
```
