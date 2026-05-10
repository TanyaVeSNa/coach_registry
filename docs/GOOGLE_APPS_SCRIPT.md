# Google Apps Script -- Form Submission Backend

This guide explains how to set up a Google Apps Script web app that receives
coach registration submissions, writes them to the "Submissions" tab, and
provides automatic color coding and status dropdowns.

## Prerequisites

- The same Google Sheet used for the coach directory
- A "Submissions" tab in that sheet (create one if missing)
- Google account with owner/editor access to the sheet

## Step-by-step Setup

### 1. Create the Submissions tab

Open the Google Sheet and add a tab named **Submissions** (if it does not exist).

Add these column headers in the first row:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O | P | Q | R | S | T | U |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Status | Name | Email | ICF Level | Photo | Specializations | Languages | Format | Price Min | Price Max | Bio 1 | Bio 1 Language | Bio 2 | Bio 2 Language | WhatsApp | Telegram | Instagram | LinkedIn | Facebook | ICF Membership | Submitted At |

### 2. Open Apps Script

1. In the Google Sheet, go to **Extensions > Apps Script**
2. Delete any default code in the editor

### 3. Paste the script

Copy and paste the following code. It contains **4 functions**:

- `doPost` -- receives form submissions from the website
- `colorByStatus` -- automatically colors rows when you change the Status (onEdit trigger)
- `colorAllRows` -- recolors all rows at once (run manually if colors get out of sync)
- `addStatusDropdown` -- adds a dropdown list to the Status column (run once during setup)

```javascript
/**
 * Receives form submissions from the website.
 * Writes a new row to the Submissions tab with status "pending".
 * Sends email notification to admin if ADMIN_EMAIL is configured.
 */
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName('Submissions');

    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, error: 'Submissions tab not found' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var data = JSON.parse(e.parameter.payload);

    // If the form sent a base64-encoded photo, decode it,
    // save to Drive, and use the thumbnail URL.
    var photoUrl = '';
    if (data.photoBase64) {
      try {
        var decoded = Utilities.base64Decode(data.photoBase64);
        var blob = Utilities.newBlob(
          decoded,
          'image/jpeg',
          data.photoFilename || 'photo.jpg'
        );
        var folder = DriveApp.getFolderById(
          '1wz3ucR9kxek16X0F836Nu7rAcZrMNPFr'
        );
        var file = folder.createFile(blob);
        file.setName(
          (data.name || 'coach') + '_' + file.getId()
        );
        photoUrl =
          'https://drive.google.com/thumbnail?id=' +
          file.getId() + '&sz=w400';
      } catch (photoErr) {
        // Photo upload failed — continue without photo
        photoUrl = '';
      }
    }

    // Column order: A=Status, B=Name, C=Email, D=ICF Level, E=Photo,
    // F=Specializations, G=Languages, H=Format, I=Price Min, J=Price Max,
    // K=Bio 1, L=Bio 1 Language, M=Bio 2, N=Bio 2 Language,
    // O=WhatsApp, P=Telegram, Q=Instagram, R=LinkedIn, S=Facebook,
    // T=ICF Membership, U=Submitted At
    sheet.appendRow([
      'pending',
      data.name || '',
      data.email || '',
      data.icfLevel || '',
      photoUrl,
      (data.specializations || []).join(', '),
      (data.languages || []).join(', '),
      data.format || '',
      data.priceMin || '',
      data.priceMax || '',
      data.bio1 || data.bio || '',
      data.bio1Language || '',
      data.bio2 || '',
      data.bio2Language || '',
      data.whatsapp || '',
      data.telegram || '',
      data.instagram || '',
      data.linkedin || '',
      data.facebook || '',
      data.icfMembership || '',
      new Date().toISOString(),
    ]);

    // Color the new row yellow (pending)
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, sheet.getLastColumn())
      .setBackground('#fff2cc');

    // Add dropdown to the new row's Status cell (column 1 = A)
    var statusCell = sheet.getRange(lastRow, 1);
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(['pending', 'approved', 'rejected'], true)
      .build();
    statusCell.setDataValidation(rule);

    // Optional: send email notification to admin
    var adminEmail = PropertiesService
      .getScriptProperties()
      .getProperty('ADMIN_EMAIL');

    if (adminEmail) {
      MailApp.sendEmail({
        to: adminEmail,
        subject: 'New coach registration: ' + (data.name || 'Unknown'),
        body: 'A new coach has submitted a registration:\n\n'
          + 'Name: ' + (data.name || '') + '\n'
          + 'Email: ' + (data.email || '') + '\n'
          + 'ICF Level: ' + (data.icfLevel || '') + '\n'
          + 'Specializations: '
          + (data.specializations || []).join(', ') + '\n\n'
          + 'Review in the "Submissions" tab of your Google Sheet.',
      });
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Automatically colors a row when the Status cell is changed.
 * Set this up as an onEdit trigger (see instructions below).
 *
 * Colors:
 *   pending  = yellow (#fff2cc)
 *   approved = green  (#d9ead3)
 *   rejected = red    (#f4cccc)
 */
function colorByStatus(e) {
  var sheet = e.source.getActiveSheet();
  if (sheet.getName() !== 'Submissions') return;

  var range = e.range;
  var col = range.getColumn();
  var row = range.getRow();

  // Column 1 = A = Status
  if (col !== 1 || row === 1) return;

  var status = range.getValue().toString().toLowerCase().trim();
  var rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());

  if (status === 'approved') {
    rowRange.setBackground('#d9ead3');
  } else if (status === 'rejected') {
    rowRange.setBackground('#f4cccc');
  } else if (status === 'pending') {
    rowRange.setBackground('#fff2cc');
  }
}

/**
 * Recolors ALL rows based on their current Status value.
 * Run this manually if colors get out of sync.
 *
 * How to run: In Apps Script, select "colorAllRows" from the function
 * dropdown at the top, then click the Run button (play icon).
 */
function colorAllRows() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Submissions');
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  for (var row = 2; row <= lastRow; row++) {
    var status = sheet.getRange(row, 1).getValue()
      .toString().toLowerCase().trim();
    var rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn());

    if (status === 'approved') {
      rowRange.setBackground('#d9ead3');
    } else if (status === 'rejected') {
      rowRange.setBackground('#f4cccc');
    } else if (status === 'pending') {
      rowRange.setBackground('#fff2cc');
    }
  }
}

/**
 * Adds a dropdown list (pending / approved / rejected) to every
 * Status cell in the Submissions tab.
 * Run this once during initial setup, or after adding many rows manually.
 *
 * How to run: In Apps Script, select "addStatusDropdown" from the function
 * dropdown at the top, then click the Run button (play icon).
 */
function addStatusDropdown() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Submissions');
  if (!sheet) return;

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  var range = sheet.getRange(2, 1, lastRow - 1, 1);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['pending', 'approved', 'rejected'], true)
    .build();
  range.setDataValidation(rule);
}
```

### 4. Set up the onEdit trigger for automatic color coding

The `colorByStatus` function needs an **onEdit trigger** so it runs
automatically every time you change the Status dropdown.

1. In Apps Script, click the **clock icon** in the left sidebar (Triggers)
2. Click **+ Add Trigger** (bottom right)
3. Set the following:
   - **Choose which function to run**: `colorByStatus`
   - **Choose which deployment should run**: Head
   - **Select event source**: From spreadsheet
   - **Select event type**: On edit
4. Click **Save**
5. Authorize the app when prompted

After this, whenever you change a Status cell in the Submissions tab, the row
will automatically change color.

### 5. Run the initial setup functions

After pasting the script and setting up the trigger:

1. Select **addStatusDropdown** from the function dropdown at the top
2. Click the **Run** button (play icon)
3. This adds the dropdown to all existing Status cells

Then:

1. Select **colorAllRows** from the function dropdown
2. Click **Run**
3. This colors all existing rows based on their Status

### 6. (Optional) Set admin email for notifications

1. In Apps Script, go to **Project Settings** (gear icon in the left sidebar)
2. Scroll down to **Script Properties**
3. Click **Add script property**
4. Key: `ADMIN_EMAIL`, Value: your email address
5. Click **Save**

### 7. Deploy as web app

1. Click **Deploy > New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Set:
   - **Description**: Coach registration endpoint
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Authorize the app when prompted (review permissions and allow)
6. Copy the **Web app URL** -- you will need it for the widget configuration

### 8. Configure the widget

Pass the web app URL when initializing the widget:

```html
<script type="module">
  import { ICFRegistry } from './js/app.js';
  ICFRegistry.init({
    sheetId: 'YOUR_GOOGLE_SHEET_ID',
    scriptUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
  });
</script>
```

## How it works

1. Coach fills out the registration form in the widget
2. Form data is sent as a JSON POST to the Apps Script web app
3. The script writes a new row to the "Submissions" tab with status "pending"
4. The new row is automatically colored **yellow** (pending)
5. If ADMIN_EMAIL is configured, the admin receives an email notification
6. The admin reviews the submission in the sheet and selects `approved` from the dropdown
7. The row turns **green** automatically
8. The approved coach appears in the public catalog on next page load

## Functions reference

| Function | Purpose | How to run |
|----------|---------|-----------|
| `doPost` | Receives form submissions from the website | Runs automatically (web app) |
| `colorByStatus` | Colors a row when Status changes | Runs automatically (onEdit trigger) |
| `colorAllRows` | Recolors all rows based on Status | Run manually from Apps Script |
| `addStatusDropdown` | Adds dropdown to Status column | Run manually from Apps Script (once) |
| `copyPhotoToDrive` | (Deprecated) Copies photo from URL to Drive | No longer called by `doPost` |
| `testCopyPhoto` | Tests photo upload to Drive | Run manually from Apps Script |

---

## Photo Storage: Direct Upload (base64)

When a coach submits a registration with a photo file, the browser converts
the image to base64 and sends it as `photoBase64` + `photoFilename` fields
in the JSON payload. The `doPost` function decodes the base64 data, saves
the file to the ICF Cyprus chapter's shared Google Drive folder, and stores
the resulting thumbnail URL in column E (Photo).

### How it works

1. The registration form converts the selected image file to a base64 string
   on the client side (max 5 MB, JPEG/PNG/WebP).
2. The Vercel serverless proxy forwards the JSON payload (including the
   base64 data) to Google Apps Script.
3. `doPost` checks for `data.photoBase64`. If present:
   - Decodes the base64 string using `Utilities.base64Decode()`
   - Creates a blob with the original filename
   - Saves to the Drive folder using `folder.createFile(blob)`
   - Generates a thumbnail URL: `https://drive.google.com/thumbnail?id=FILE_ID&sz=w400`
4. If photo upload fails, the row is still created with an empty Photo column.

### Target folder

All photos are stored in a single shared folder:
- **Folder ID**: `1wz3ucR9kxek16X0F836Nu7rAcZrMNPFr`

### Legacy: `copyPhotoToDrive` (deprecated)

The previous approach used a photo URL field and `copyPhotoToDrive` to fetch
and copy the image. This function is no longer called by `doPost` but may
remain in existing deployments. It can be safely removed.

### `testCopyPhoto`

A helper function for manual testing. Can be updated to test the new base64
flow by encoding a test image and calling the relevant Drive API methods.

## Approval workflow

The "Status" column (A) controls visibility:

| Status | Row color | Meaning |
|--------|-----------|---------|
| `pending` | Yellow | New submission, not yet visible in catalog |
| `approved` | Green | Visible in the public catalog |
| `rejected` | Red | Removed, not visible |

To approve a coach: click the Status cell and select `approved` from the dropdown.

---

## Profile Editing (Magic Link Flow)

Coaches can edit their profiles via a magic link sent to their email.
This requires updating the Apps Script to handle multiple actions.

### How it works

1. Coach enters their email on the edit page
2. The website calls `/api/request-edit-link` which forwards to Apps Script
3. Apps Script finds the coach, generates a UUID token, stores it in an
   "EditTokens" tab, and sends an email with the edit link
4. Coach clicks the link, the website calls `/api/verify-token`
5. Apps Script verifies the token (not expired, not used) and returns
   the coach's profile data
6. Coach edits and saves, the website calls `/api/save-profile`
7. Apps Script re-verifies the token, updates the row, marks token as used

### Updated Apps Script code

Replace the **entire** script with this new version. It supports both
the original registration (`doPost` without `action`) and the new edit
flow (`action: 'requestEditLink'`, `'verifyToken'`, `'saveProfile'`).

```javascript
/**
 * Main entry point — dispatches based on action field.
 * Backwards-compatible: requests without action are treated
 * as registration submissions.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action || 'register';

    if (action === 'register') {
      return handleRegister(data);
    } else if (action === 'requestEditLink') {
      return handleRequestEditLink(data);
    } else if (action === 'verifyToken') {
      return handleVerifyToken(data);
    } else if (action === 'saveProfile') {
      return handleSaveProfile(data);
    }

    return jsonResponse({
      success: false,
      error: 'Unknown action',
    });
  } catch (err) {
    return jsonResponse({
      success: false,
      error: err.message,
    });
  }
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle new coach registration (original doPost logic).
 */
function handleRegister(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Submissions');

  if (!sheet) {
    return jsonResponse({
      success: false,
      error: 'Submissions tab not found',
    });
  }

  var photoUrl = '';
  if (data.photoBase64) {
    try {
      var decoded = Utilities.base64Decode(data.photoBase64);
      var mimeType = data.photoFilename
        && data.photoFilename.toLowerCase().endsWith('.png')
        ? 'image/png' : 'image/jpeg';
      var blob = Utilities.newBlob(
        decoded, mimeType,
        data.photoFilename || 'photo.jpg'
      );
      var folder = DriveApp.getFolderById(
        '1wz3ucR9kxek16X0F836Nu7rAcZrMNPFr'
      );
      var file = folder.createFile(blob);
      file.setName(
        (data.name || 'coach') + '_' + file.getId()
      );
      photoUrl =
        'https://drive.google.com/thumbnail?id='
        + file.getId() + '&sz=w400';
    } catch (photoErr) {
      photoUrl = '';
    }
  }

  sheet.appendRow([
    'pending',
    data.name || '',
    data.email || '',
    data.icfLevel || '',
    photoUrl,
    (data.specializations || []).join(', '),
    (data.languages || []).join(', '),
    data.format || '',
    data.priceMin || '',
    data.priceMax || '',
    data.bio1 || data.bio || '',
    data.bio1Language || '',
    data.bio2 || '',
    data.bio2Language || '',
    data.whatsapp || '',
    data.telegram || '',
    data.instagram || '',
    data.linkedin || '',
    data.facebook || '',
    data.icfMembership || '',
    new Date().toISOString(),
  ]);

  var lastRow = sheet.getLastRow();
  sheet.getRange(lastRow, 1, 1, sheet.getLastColumn())
    .setBackground('#fff2cc');

  var statusCell = sheet.getRange(lastRow, 1);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(
      ['pending', 'approved', 'rejected'], true
    )
    .build();
  statusCell.setDataValidation(rule);

  var adminEmail = PropertiesService
    .getScriptProperties()
    .getProperty('ADMIN_EMAIL');

  if (adminEmail) {
    MailApp.sendEmail({
      to: adminEmail,
      subject: 'New coach registration: '
        + (data.name || 'Unknown'),
      body: 'A new coach has submitted a registration:\n\n'
        + 'Name: ' + (data.name || '') + '\n'
        + 'Email: ' + (data.email || '') + '\n'
        + 'ICF Level: ' + (data.icfLevel || '') + '\n'
        + 'Specializations: '
        + (data.specializations || []).join(', ') + '\n\n'
        + 'Review in the "Submissions" tab.',
    });
  }

  return jsonResponse({ success: true });
}

/**
 * Handle request for edit link.
 * Finds approved coach by email, generates a token,
 * stores it in EditTokens tab, and sends email.
 * Always returns success to prevent email enumeration.
 */
function handleRequestEditLink(data) {
  var email = (data.email || '').trim().toLowerCase();
  if (!email) return jsonResponse({ success: true });

  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Submissions');
  if (!sheet) return jsonResponse({ success: true });

  // Find approved coach by email
  var dataRange = sheet.getDataRange().getValues();
  var coachRow = -1;
  for (var i = 1; i < dataRange.length; i++) {
    if (dataRange[i][2].toString().trim().toLowerCase()
        === email
        && dataRange[i][0].toString().trim().toLowerCase()
        === 'approved') {
      coachRow = i;
      break;
    }
  }

  if (coachRow === -1) {
    return jsonResponse({ success: true });
  }

  // Get or create EditTokens tab
  var tokensSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('EditTokens');
  if (!tokensSheet) {
    tokensSheet = SpreadsheetApp.getActiveSpreadsheet()
      .insertSheet('EditTokens');
    tokensSheet.appendRow([
      'Email', 'Token', 'ExpiresAt', 'Used',
    ]);
  }

  // Rate limit: no token sent in last 5 minutes
  var tokenData = tokensSheet.getDataRange().getValues();
  var now = new Date();
  var fiveMinAgo = new Date(
    now.getTime() - 5 * 60 * 1000
  );
  for (var j = 1; j < tokenData.length; j++) {
    if (tokenData[j][0].toString().trim().toLowerCase()
        === email) {
      var expiresAt = new Date(tokenData[j][2]);
      // expiresAt minus 24h = created time
      var createdTime = new Date(
        expiresAt.getTime() - 24 * 60 * 60 * 1000
      );
      if (createdTime > fiveMinAgo) {
        return jsonResponse({ success: true });
      }
    }
  }

  // Generate token
  var token = Utilities.getUuid();
  var expires = new Date(
    now.getTime() + 24 * 60 * 60 * 1000
  );
  tokensSheet.appendRow([
    email, token, expires.toISOString(), false,
  ]);

  // Send email
  var editUrl =
    'https://coaches.icf-cyprus.com/src/edit.html?token='
    + token;
  MailApp.sendEmail({
    to: email,
    subject: 'Edit your coach profile — ICF Cyprus',
    body: 'Hello,\n\n'
      + 'You requested to edit your coach profile '
      + 'in the ICF Cyprus Registry.\n\n'
      + 'Click this link to edit your profile:\n'
      + editUrl + '\n\n'
      + 'This link is valid for 24 hours.\n\n'
      + 'If you did not request this, '
      + 'please ignore this email.\n\n'
      + 'ICF Cyprus Coach Registry\n'
      + 'https://coaches.icf-cyprus.com',
  });

  return jsonResponse({ success: true });
}

/**
 * Verify an edit token and return the coach's profile.
 */
function handleVerifyToken(data) {
  var token = (data.token || '').trim();
  if (!token) {
    return jsonResponse({
      success: false,
      error: 'No token',
    });
  }

  var tokensSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('EditTokens');
  if (!tokensSheet) {
    return jsonResponse({
      success: false,
      error: 'Invalid token',
    });
  }

  var tokenData = tokensSheet.getDataRange().getValues();
  var tokenRow = -1;
  var tokenEmail = '';
  for (var i = 1; i < tokenData.length; i++) {
    if (tokenData[i][1] === token) {
      tokenRow = i;
      tokenEmail = tokenData[i][0].toString()
        .trim().toLowerCase();
      break;
    }
  }

  if (tokenRow === -1) {
    return jsonResponse({
      success: false,
      error: 'Invalid token',
    });
  }

  var expiresAt = new Date(tokenData[tokenRow][2]);
  if (new Date() > expiresAt) {
    return jsonResponse({
      success: false,
      error: 'Token expired',
    });
  }

  if (tokenData[tokenRow][3] === true
      || tokenData[tokenRow][3] === 'true') {
    return jsonResponse({
      success: false,
      error: 'Token already used',
    });
  }

  // Find coach in Submissions
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Submissions');
  var allData = sheet.getDataRange().getValues();
  for (var j = 1; j < allData.length; j++) {
    var row = allData[j];
    if (row[2].toString().trim().toLowerCase()
        === tokenEmail
        && row[0].toString().trim().toLowerCase()
        === 'approved') {
      return jsonResponse({
        success: true,
        profile: {
          name: row[1] || '',
          email: row[2] || '',
          icfLevel: row[3] || '',
          photo: row[4] || '',
          specializations: row[5] || '',
          languages: row[6] || '',
          format: row[7] || '',
          priceMin: row[8] || '',
          priceMax: row[9] || '',
          bio1: row[10] || '',
          bio1Language: row[11] || '',
          bio2: row[12] || '',
          bio2Language: row[13] || '',
          whatsapp: row[14] || '',
          telegram: row[15] || '',
          instagram: row[16] || '',
          linkedin: row[17] || '',
          facebook: row[18] || '',
        },
      });
    }
  }

  return jsonResponse({
    success: false,
    error: 'Coach not found',
  });
}

/**
 * Save edited profile. Re-verifies token, updates the
 * Submissions row, marks token as used.
 */
function handleSaveProfile(data) {
  var token = (data.token || '').trim();
  if (!token) {
    return jsonResponse({
      success: false,
      error: 'No token',
    });
  }

  var tokensSheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('EditTokens');
  if (!tokensSheet) {
    return jsonResponse({
      success: false,
      error: 'Invalid token',
    });
  }

  var tokenData = tokensSheet.getDataRange().getValues();
  var tokenRow = -1;
  var tokenEmail = '';
  for (var i = 1; i < tokenData.length; i++) {
    if (tokenData[i][1] === token) {
      tokenRow = i;
      tokenEmail = tokenData[i][0].toString()
        .trim().toLowerCase();
      break;
    }
  }

  if (tokenRow === -1) {
    return jsonResponse({
      success: false,
      error: 'Invalid token',
    });
  }

  var expiresAt = new Date(tokenData[tokenRow][2]);
  if (new Date() > expiresAt) {
    return jsonResponse({
      success: false,
      error: 'Token expired',
    });
  }

  if (tokenData[tokenRow][3] === true
      || tokenData[tokenRow][3] === 'true') {
    return jsonResponse({
      success: false,
      error: 'Token already used',
    });
  }

  // Find coach row
  var sheet = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName('Submissions');
  var allData = sheet.getDataRange().getValues();
  var coachRowNum = -1;
  for (var j = 1; j < allData.length; j++) {
    if (allData[j][2].toString().trim().toLowerCase()
        === tokenEmail
        && allData[j][0].toString().trim().toLowerCase()
        === 'approved') {
      coachRowNum = j + 1; // 1-indexed
      break;
    }
  }

  if (coachRowNum === -1) {
    return jsonResponse({
      success: false,
      error: 'Coach not found',
    });
  }

  // Handle photo
  var photoUrl = allData[coachRowNum - 1][4] || '';
  if (data.photoBase64) {
    try {
      var decoded = Utilities.base64Decode(
        data.photoBase64
      );
      var mimeType = data.photoFilename
        && data.photoFilename.toLowerCase()
          .endsWith('.png')
        ? 'image/png' : 'image/jpeg';
      var blob = Utilities.newBlob(
        decoded, mimeType,
        data.photoFilename || 'photo.jpg'
      );
      var folder = DriveApp.getFolderById(
        '1wz3ucR9kxek16X0F836Nu7rAcZrMNPFr'
      );
      var file = folder.createFile(blob);
      file.setName(
        (data.name || 'coach') + '_' + file.getId()
      );
      photoUrl =
        'https://drive.google.com/thumbnail?id='
        + file.getId() + '&sz=w400';
    } catch (photoErr) {
      // keep existing photo on error
    }
  }

  // Update row (B through S = 18 columns)
  var range = sheet.getRange(coachRowNum, 2, 1, 18);
  range.setValues([[
    data.name || '',
    tokenEmail,
    data.icfLevel || '',
    photoUrl,
    (data.specializations || []).join(', '),
    (data.languages || []).join(', '),
    data.format || '',
    data.priceMin || '',
    data.priceMax || '',
    data.bio1 || '',
    data.bio1Language || '',
    data.bio2 || '',
    data.bio2Language || '',
    data.whatsapp || '',
    data.telegram || '',
    data.instagram || '',
    data.linkedin || '',
    data.facebook || '',
  ]]);

  // Mark token as used
  tokensSheet.getRange(tokenRow + 1, 4).setValue(true);

  return jsonResponse({ success: true });
}
```

### EditTokens tab

The script automatically creates an "EditTokens" tab when the first
edit link is requested. The tab has 4 columns:

| A | B | C | D |
|---|---|---|---|
| Email | Token | ExpiresAt | Used |

Tokens expire after 24 hours. A rate limit prevents sending more than
one token per email per 5 minutes.

### New API endpoints

| Endpoint | Purpose |
|----------|---------|
| `POST /api/request-edit-link` | Request magic link (body: `{ email }`) |
| `POST /api/verify-token` | Verify token + get profile (body: `{ token }`) |
| `POST /api/save-profile` | Save edited profile (body: `{ token, name, ... }`) |

### Deploying the update

After pasting the new script:

1. Click **Deploy > Manage deployments**
2. Click the pencil icon on the active deployment
3. Under "Version", select **New version**
4. Click **Deploy**

The URL stays the same -- no changes needed in the website code.

---

## Updating the deployment

If you modify the script:

1. Click **Deploy > Manage deployments**
2. Click the pencil icon on the active deployment
3. Under "Version", select **New version**
4. Click **Deploy**

**Important**: If you create a **new deployment** (instead of editing the existing one), the URL changes! In that case, update the URL in:
- `api/submit.js` (Vercel serverless proxy)
- `src/register.html` (fallback scriptUrl)

## Troubleshooting

- **"Submissions tab not found"** -- Create a tab named exactly "Submissions"
- **No email notifications** -- Check ADMIN_EMAIL script property is set
- **Form says success but no row appears** -- Check the Apps Script execution log
  (Executions in the left sidebar) for errors
- **CORS errors in console** -- Expected. The widget uses `mode: 'no-cors'`
  which means the browser cannot read the response, but the request still
  goes through. Check the Submissions tab to confirm data arrived.
- **Colors not updating automatically** -- Check that the onEdit trigger is set
  up (Step 4). Go to Triggers in the left sidebar to verify.
- **Dropdown missing on new rows** -- Run `addStatusDropdown` again, or it will
  be added automatically for rows created via form submission.
