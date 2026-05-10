# Google Apps Script — Backend

This guide explains how to set up the Google Apps Script web app that handles
coach registration, profile editing, and admin workflows.

## Full Source Code

**`docs/APPS_SCRIPT_FULL_CODE.js`** — single file with all functions.
Copy and paste the entire file into Apps Script.

## Prerequisites

- The same Google Sheet used for the coach directory
- A "Submissions" tab in that sheet
- Google account with owner/editor access to the sheet

## Setup

### 1. Create the Submissions tab

Add these column headers in the first row:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| Status | Name | Email | ICF Level | Photo | Specializations | Languages | Format | Price Min | Price Max |

| K | L | M | N | O | P | Q | R | S | T | U |
|---|---|---|---|---|---|---|---|---|---|---|
| Bio 1 | Bio 1 Language | Bio 2 | Bio 2 Language | WhatsApp | Telegram | Instagram | LinkedIn | Facebook | ICF Membership | Submitted At |

### 2. Paste the script

1. In the Google Sheet, go to **Extensions > Apps Script**
2. Delete any default code (Ctrl+A → Delete)
3. Copy the entire contents of `docs/APPS_SCRIPT_FULL_CODE.js`
4. Paste into the editor

### 3. Create the Settings sheet

Run the function `createSettingsSheet` from the function dropdown (▶️ Run).
This creates a "Settings" sheet with default values:

**Backend settings:**

| Key | Value | Description |
|-----|-------|-------------|
| SENDER_NAME | ICF Cyprus | Display name for outgoing emails |
| ADMIN_EMAIL | _(fill in)_ | Email for admin notifications |
| SITE_URL | https://coaches.icf-cyprus.com | Base URL of the registry |
| EDIT_PAGE | /src/edit.html | Path to the edit page |
| DRIVE_FOLDER | https://drive.google.com/drive/folders/... | Google Drive folder for photos (full URL) |
| REGISTRY_NAME | ICF Cyprus Coach Registry | Full name shown in emails |

**Frontend settings (loaded by website on page load):**

| Key | Value | Description |
|-----|-------|-------------|
| BRAND_NAME | ICF Cyprus | Brand name shown in headers and text |
| COLOR_PRIMARY | #212251 | Main text/background color |
| COLOR_SECONDARY | #2b379b | Secondary/accent color |
| COLOR_ACCENT | #efcb30 | CTA buttons, highlights |
| COLOR_SURFACE | #f8f0e4 | Light background surfaces |
| FONT_HEADING | Nunito | Google Font for headings |
| FONT_BODY | Plus Jakarta Sans | Google Font for body text |
| LOCATION | Cyprus | Location for "Offline (Cyprus)" label |
| COUNTRY_CODE | +357 | Default country code for WhatsApp |
| SHEET_URL | https://docs.google.com/spreadsheets/d/.../edit | Google Sheet with coach data (full URL) |

DRIVE_FOLDER and SHEET_URL accept full Google URLs — just paste the link from your browser. The script auto-extracts the ID.

For white-label deployments: change these values for each instance.

### 4. Set up the onEdit trigger

1. Click the **clock icon** in the left sidebar (Triggers)
2. Click **+ Add Trigger**
3. Choose which function to run: `colorByStatus`
4. Select event source: From spreadsheet
5. Select event type: On edit
6. Click **Save** and authorize

### 5. Run initial setup functions

1. Select `addStatusDropdown` → Run (adds dropdowns to Status column)
2. Select `colorAllRows` → Run (colors existing rows)

### 6. Deploy as web app

1. Click **Deploy > New deployment**
2. Select type: **Web app**
3. Execute as: **Me** / Who has access: **Anyone**
4. Click **Deploy** and authorize
5. Copy the Web app URL

### 7. Configure Vercel proxies

The web app URL must match in all Vercel API files:
- `api/submit.js`
- `api/request-edit-link.js`
- `api/verify-token.js`
- `api/save-profile.js`
- `api/config.js`

## Functions Reference

| Function | Purpose | Trigger |
|----------|---------|---------|
| `doPost` | Main dispatcher — routes by `action` field | Web app POST (automatic) |
| `doGet` | GET dispatcher — serves frontend config | Web app GET (automatic) |
| `getSettings` | Reads config from Settings sheet | Called by other functions |
| `handleGetConfig` | Returns public config for frontend | `action: 'getConfig'` (GET or POST) |
| `handleRegister` | New coach registration | `action: 'register'` (default) |
| `handleRequestEditLink` | Generate magic link, send email | `action: 'requestEditLink'` |
| `handleVerifyToken` | Verify token, return profile | `action: 'verifyToken'` |
| `handleSaveProfile` | Update coach row in sheet | `action: 'saveProfile'` |
| `parseDriveFolderId` | Extract Drive folder ID from URL | Called by getSettings |
| `parseSheetId` | Extract Sheet ID from URL | Called by getSettings |
| `colorByStatus` | Color row on Status change | onEdit trigger |
| `colorAllRows` | Recolor all rows | Manual |
| `addStatusDropdown` | Add dropdown to Status cells | Manual (once) |
| `createSettingsSheet` | Create Settings sheet with defaults | Manual (once) |

## Sheets Structure

### Submissions
Coach data — one row per coach. Column A (Status) controls visibility.

| Status | Color | Visible in catalog |
|--------|-------|--------------------|
| `pending` | Yellow (#fff2cc) | No |
| `approved` | Green (#d9ead3) | Yes |
| `rejected` | Red (#f4cccc) | No |

### EditTokens
Auto-created on first edit link request.

| Column | Content |
|--------|---------|
| A: Email | Coach's email (lowercase) |
| B: Token | UUID v4 |
| C: ExpiresAt | ISO timestamp (created + 24h) |
| D: Used | TRUE after profile is saved |

Rate limit: 1 token per email per 5 minutes.

### Settings
Configuration key-value pairs (16 keys). Read by `getSettings()` on every request.
Falls back to defaults if sheet or key is missing.

Backend keys (used by Apps Script internally): SENDER_NAME, ADMIN_EMAIL, SITE_URL, EDIT_PAGE, DRIVE_FOLDER, REGISTRY_NAME.

Frontend keys (served to the website via `/api/config`): BRAND_NAME, COLOR_PRIMARY, COLOR_SECONDARY, COLOR_ACCENT, COLOR_SURFACE, FONT_HEADING, FONT_BODY, LOCATION, COUNTRY_CODE, SHEET_URL.

Sensitive keys (ADMIN_EMAIL, DRIVE_FOLDER) are NOT exposed to the frontend.

## How It Works

### Registration Flow
1. Coach fills form → Vercel proxy (`/api/submit`) → Apps Script
2. New row added to Submissions with status `pending` (yellow)
3. Admin gets email notification
4. Admin changes status to `approved` → row turns green → coach visible

### Edit Flow (Magic Link)
1. Coach enters email on edit page
2. `/api/request-edit-link` → Apps Script finds approved coach
3. UUID token generated, stored in EditTokens, email sent
4. Coach clicks link → `/api/verify-token` → profile data returned
5. Coach edits form → `/api/save-profile` → row updated, token marked used

### Photo Upload (base64)
1. Browser converts image to base64 (max 5 MB, JPEG/PNG/WebP)
2. Sent as JSON field `photoBase64` + `photoFilename`
3. Apps Script decodes, saves to Google Drive folder
4. Thumbnail URL stored in column E

## Updating the Deployment

After modifying the script:

1. **Deploy > Manage deployments**
2. Click the **✏️ pencil icon** on the active deployment
3. Version: select **New version**
4. Click **Deploy**

**Important**: Do NOT create a new deployment — it changes the URL.
Always edit the existing deployment.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| No row appears after registration | Check Apps Script execution log (Executions sidebar) |
| Edit email not arriving | Check EditTokens tab was created. Check spam. Wait 5 min (rate limit). |
| Colors not updating | Verify onEdit trigger is set up (Triggers sidebar) |
| "Submissions tab not found" | Create tab named exactly "Submissions" |
| URL mismatch after redeployment | Update URL in all `api/*.js` files and push to Vercel |
