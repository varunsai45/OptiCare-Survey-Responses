/**
 * OptiCare research — Google Apps Script collection endpoint.
 *
 * Paste this into Extensions → Apps Script on the Google Sheet that will hold
 * the responses, then deploy it as a Web App (see README.md).
 *
 * It accepts one JSON submission per request and appends one row. It stores
 * nothing that identifies a person: no name, email, phone, location or IP.
 */

/** Sheet tab that receives the rows. Created automatically if missing. */
var SHEET_NAME = 'Responses';

/** Column order. Must match `sheetHeaders` in src/services/surveySubmission.ts. */
var HEADERS = [
  'Timestamp',
  'Primary Screen Use',
  'Devices Used',
  'Daily Screen Time',
  'Eye Experiences',
  'Long Session Behavior',
  'Break Motivation',
  'Preferred Break Activity',
  'Eye-Rest Activity Interest',
  'Multi-Device Usefulness',
  'Open Response',
];

/** Rejects oversized bodies before doing any work. */
var MAX_BODY_BYTES = 8000;
var MAX_TEXT_LENGTH = 1000;

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respond(false, 'Empty request.');
    }

    if (e.postData.contents.length > MAX_BODY_BYTES) {
      return respond(false, 'Request too large.');
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      return respond(false, 'Malformed request.');
    }

    if (!data || typeof data !== 'object') {
      return respond(false, 'Malformed request.');
    }

    var row = buildRow(data);
    if (!row) {
      return respond(false, 'Missing required answers.');
    }

    // One writer at a time, so two people submitting together cannot land on
    // the same row.
    var lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      var sheet = getSheet();

      if (isDuplicate(data.submissionId)) {
        // A retry after a response that did in fact arrive. Report success so
        // the participant is not asked to submit a third time.
        return respond(true, 'Already recorded.');
      }

      sheet.appendRow(row);
      rememberSubmission(data.submissionId);
    } finally {
      lock.releaseLock();
    }

    return respond(true, 'Recorded.');
  } catch (error) {
    // Never leak a stack trace to the browser.
    console.error(error);
    return respond(false, 'Could not record the response.');
  }
}

/** A GET is only ever used to check the deployment is reachable. */
function doGet() {
  return respond(true, 'OptiCare research endpoint is live.');
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }

  return sheet;
}

/**
 * Validates and sanitises the payload, returning the row to append or null if
 * a required answer is missing.
 */
function buildRow(data) {
  var primaryUse = cleanText(data.q1_primary_use);
  var devices = cleanList(data.q2_devices);
  var screenTime = cleanText(data.q3_daily_screen_time);
  var experiences = cleanList(data.q4_eye_experiences);
  var behavior = cleanText(data.q5_long_session_behavior);
  var motivation = cleanText(data.q6_break_motivation);
  var activity = cleanText(data.q7_preferred_break_activity);
  var interest = cleanRating(data.q8_activity_interest_rating);
  var usefulness = cleanRating(data.q9_multi_device_usefulness_rating);
  var openResponse = cleanText(data.q10_open_response);

  var required = [primaryUse, screenTime, behavior, motivation, activity, openResponse];
  for (var i = 0; i < required.length; i++) {
    if (!required[i]) return null;
  }
  if (!devices || !experiences) return null;
  if (interest === null || usefulness === null) return null;
  if (openResponse.length < 5) return null;

  return [
    // Server-side timestamp: the client clock is never trusted for the record.
    new Date(),
    primaryUse,
    devices,
    screenTime,
    experiences,
    behavior,
    motivation,
    activity,
    interest,
    usefulness,
    openResponse,
  ];
}

/**
 * Coerces a value to plain text. A leading =, +, - or @ is prefixed with an
 * apostrophe so Sheets treats it as text rather than a formula.
 */
function cleanText(value) {
  if (typeof value !== 'string') return '';

  // Replace control characters with spaces without relying on escape
  // sequences, so this file stays plain ASCII and safe to copy-paste.
  var cleaned = '';
  for (var i = 0; i < value.length; i++) {
    var code = value.charCodeAt(i);
    cleaned += code < 32 || code === 127 ? ' ' : value.charAt(i);
  }

  var text = cleaned.replace(/\s+/g, ' ').trim();
  if (text.length > MAX_TEXT_LENGTH) text = text.substring(0, MAX_TEXT_LENGTH);

  // A leading =, +, - or @ would be read as a formula by Sheets.
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

/** Joins a list of choices into one readable cell, or '' when empty. */
function cleanList(value) {
  if (!Array.isArray(value)) return '';
  var items = [];
  for (var i = 0; i < value.length && i < 12; i++) {
    var item = cleanText(value[i]);
    if (item) items.push(item);
  }
  return items.length ? items.join(', ') : '';
}

/** Ratings must be whole numbers from 1 to 5. */
function cleanRating(value) {
  var number = typeof value === 'number' ? value : parseInt(value, 10);
  if (isNaN(number) || number < 1 || number > 5) return null;
  return Math.round(number);
}

/**
 * Duplicate protection. Submission ids are kept in script properties for six
 * hours — long enough to cover a retry, short enough to stay tidy.
 */
function isDuplicate(submissionId) {
  if (typeof submissionId !== 'string' || !submissionId) return false;
  var cache = CacheService.getScriptCache();
  return cache.get('sub_' + submissionId) !== null;
}

function rememberSubmission(submissionId) {
  if (typeof submissionId !== 'string' || !submissionId) return;
  CacheService.getScriptCache().put('sub_' + submissionId, '1', 21600);
}

function respond(ok, message) {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: ok, message: message }),
  ).setMimeType(ContentService.MimeType.JSON);
}
