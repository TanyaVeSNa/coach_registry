# Coach Registry

White-label coach directory — deploy your own filterable catalog of coaches with registration, profile editing, and configurable branding. No code changes needed for a new instance.

**Live example:** https://coaches.icf-cyprus.com/

## Features

- Coach profile cards with photo, specialization, ICF level, languages, pricing
- Client-side filtering (specialization, language, format, ICF level, price)
- Coach profile modal with full bio
- Direct contact via WhatsApp, Telegram, Email with pre-filled messages
- Coach registration form with admin moderation
- Profile editing via email magic link (no passwords)
- Direct photo upload to Google Drive
- Configurable branding (colors, fonts, logo, name) via Google Sheet
- Trilingual UI: English / Russian / Greek
- Mobile-responsive layout

## Tech Stack

- Vanilla JavaScript / HTML / CSS (no build tools)
- Google Sheets as data backend + configuration
- Google Apps Script for server logic (forms, emails, photos)
- Vercel for hosting + serverless API proxy

## Deploy Your Own

See **[Deployment Guide](docs/DEPLOYMENT_GUIDE.md)** — fork, set 1 env var, fill a Settings sheet.

## Local Development

```bash
git clone https://github.com/slip-pro/icf-coach-registry.git
cd icf-coach-registry
python3 server.py
# Open http://localhost:8000
```

## Documentation

- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) — set up a new instance
- [Admin Guide](docs/ADMIN_GUIDE.md) — moderate coach registrations
- [Google Apps Script](docs/GOOGLE_APPS_SCRIPT.md) — backend setup
- [Google Sheets Setup](docs/GOOGLE_SHEETS_SETUP.md) — data structure
- [Roadmap](docs/ROADMAP.md)
- [Goals](docs/project-management/GOALS.md)
- [Decisions](docs/project-management/DECISIONS.md)

## License

Private project. Contact the maintainer for licensing.
