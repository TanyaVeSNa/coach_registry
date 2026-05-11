# Admin Guide: Coach Moderation

## How it works

1. A coach fills out the registration form on the website
2. The data goes to the **"Submissions"** tab in your Google Sheet
3. The new row is highlighted in **yellow** (pending review)
4. You get an **email notification** with the coach's name and details
5. You review the submission in the Google Sheet
6. You **approve or reject** by selecting a value from the Status dropdown
7. The row color changes automatically: **green** = approved, **red** = rejected
8. Approved coaches automatically appear in the catalog

## Single tab: everything in Submissions

All coach data lives in **one tab** called **Submissions**. There is no separate "Coaches" tab. The website catalog reads directly from Submissions and shows only coaches with Status = `approved`.

**Status is the first column (A)** -- this makes it the easiest column to scan when moderating submissions.

The sheet also has columns for two bios: **Bio 1** (with Bio 1 Language) and **Bio 2** (with Bio 2 Language). This lets coaches provide their biography in two languages.

This means:
- New registrations appear here
- Approved coaches stay here
- Rejected coaches stay here too (for your records)
- You never need to copy rows between tabs

## Color coding

Rows in the Submissions tab are color-coded automatically based on the Status column:

| Status | Row color | Meaning |
|--------|-----------|---------|
| `pending` | Yellow | New submission, needs your review |
| `approved` | Green | Visible in the public catalog |
| `rejected` | Red | Not visible, kept for records |

The colors update automatically when you change the Status. This makes it easy to scan the sheet and see what needs attention -- just look for yellow rows.

## Status dropdown

The Status column has a **dropdown list** -- you do not need to type the values manually. Just click the cell and select one of:
- `pending`
- `approved`
- `rejected`

This prevents typos and ensures the catalog works correctly.

## Step-by-step: Approve a coach

1. Open your Google Sheet
2. Go to the **"Submissions"** tab
3. Find the yellow row (Status = `pending`)
4. Review the coach's information
5. Click the **Status cell** and select `approved` from the dropdown
6. The row turns **green** automatically
7. The catalog refreshes on next page load -- the approved coach will appear

## Step-by-step: Reject a coach

1. Open your Google Sheet
2. Find the coach's row in the **"Submissions"** tab
3. Click the **Status cell** and select `rejected` from the dropdown
4. The row turns **red** automatically
5. The coach will not appear in the catalog

## Step-by-step: Remove a coach

If a coach leaves ICF Cyprus or asks to be removed:

1. Open your Google Sheet
2. Find the coach's row in the **"Submissions"** tab
3. Change the Status cell to `rejected`
4. The coach will disappear from the catalog on next page load

**Note**: Don't delete the row -- just change the status. This keeps a record.

## Step-by-step: Edit a coach's profile

1. Open your Google Sheet
2. Find the coach's row in the **"Submissions"** tab
3. Edit any cell directly (name, bio, specializations, etc.)
4. Changes appear in the catalog on next page load

## Photos

Coaches upload photos directly during registration (JPEG, PNG, WebP, max 5 MB). Photos are automatically saved to your Google Drive folder and displayed as thumbnails in the catalog. You do not need to do anything special with photos.

## Coach self-editing

Coaches can update their own profiles via a magic link:

1. Coach goes to the **Edit Profile** page
2. Enters their email address
3. Receives a one-time link by email (valid for 24 hours)
4. Clicks the link to open a pre-filled form
5. Makes changes and saves

The link can only be used once. After saving, the coach must request a new link for further edits. Only approved coaches can request edit links.

Edit tokens are stored in a separate **EditTokens** tab (created automatically).

## Email notifications

Email notifications are sent automatically when a coach submits a registration.
To change the admin email:

1. Open the Google Sheet
2. Go to the **Settings** tab
3. Find the row with Key = `ADMIN_EMAIL`
4. Change the Value to the new email address

## FAQ

**Q: How long until changes appear on the website?**
A: Changes appear the next time someone loads the page (usually within seconds).

**Q: Can I approve multiple coaches at once?**
A: Yes! Just select `approved` from the Status dropdown for each coach you want to approve.

**Q: What if I accidentally reject a coach?**
A: Just change the Status back to `approved`. No data is lost. The row will turn green again.

**Q: Can coaches edit their own profiles?**
A: Yes! Coaches go to the Edit Profile page, enter their email, and receive a one-time edit link. The link is valid for 24 hours. You can also edit their data directly in the sheet.

**Q: Why are some rows yellow/green/red?**
A: The colors show the status at a glance. Yellow = pending review, green = approved (visible on website), red = rejected. The colors update automatically when you change the Status.

**Q: What if the colors are wrong or missing?**
A: Open Extensions > Apps Script and run the `colorAllRows` function. This recolors all rows based on their current Status. See the Apps Script guide for details.
