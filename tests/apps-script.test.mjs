// Exercises apps-script/Code.gs against stand-ins for the Google services, so
// the validation and duplicate handling can be checked before deployment.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync('apps-script/Code.gs', 'utf8');

const rows = [];
const cache = new Map();

const sandbox = {
  console,
  rows,
  SpreadsheetApp: {
    getActiveSpreadsheet: () => ({
      getSheetByName: () => sheet,
      insertSheet: () => sheet,
    }),
  },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  CacheService: {
    getScriptCache: () => ({
      get: (k) => (cache.has(k) ? cache.get(k) : null),
      put: (k, v) => cache.set(k, v),
    }),
  },
  ContentService: {
    MimeType: { JSON: 'json' },
    createTextOutput: (t) => ({ body: t, setMimeType() { return this; } }),
  },
};

const sheet = {
  getLastRow: () => rows.length,
  appendRow: (row) => rows.push(row),
  getRange: () => ({ setFontWeight() {} }),
  setFrozenRows() {},
};

vm.createContext(sandbox);
vm.runInContext(src, sandbox);

const post = (payload) =>
  JSON.parse(
    sandbox.doPost({ postData: { contents: JSON.stringify(payload) } }).body,
  );

const valid = {
  submissionId: 'abc-123',
  q1_primary_use: 'Studying',
  q2_devices: ['Smartphone', 'Laptop'],
  q3_daily_screen_time: '6–8 hours',
  q4_eye_experiences: ['Tired eyes', 'Dry eyes'],
  q5_long_session_behavior: 'I take a break only when I feel eye discomfort',
  q6_break_motivation: 'A reminder or notification',
  q7_preferred_break_activity: 'A relaxing focus activity',
  q8_activity_interest_rating: 4,
  q9_multi_device_usefulness_rating: 5,
  q10_open_response: 'I would stop checking my phone right before bed.',
};

const pass = [];
const fail = [];
const check = (label, cond, extra = '') => (cond ? pass : fail).push(label + (cond ? '' : ` — ${extra}`));

// Header row is created on first write.
let res = post(valid);
check('Valid submission accepted', res.ok === true, JSON.stringify(res));
check('Header row written first', rows[0][0] === 'Timestamp' && rows[0].length === 11, JSON.stringify(rows[0]));
check('Response row has 11 columns', rows[1].length === 11, String(rows[1]?.length));
check('Timestamp is server-side', Object.prototype.toString.call(rows[1][0]) === '[object Date]', String(rows[1][0]));
check('Multi-select joined readably', rows[1][2] === 'Smartphone, Laptop', rows[1][2]);
check('Ratings stored as numbers', rows[1][8] === 4 && rows[1][9] === 5, `${rows[1][8]}/${rows[1][9]}`);

// Duplicate retry.
res = post(valid);
check('Duplicate submission reports ok', res.ok === true);
check('Duplicate does not add a row', rows.length === 2, String(rows.length));

// Missing answers.
check('Missing open response rejected',
  post({ ...valid, submissionId: 'b', q10_open_response: '' }).ok === false);
check('Too-short open response rejected',
  post({ ...valid, submissionId: 'c', q10_open_response: 'no' }).ok === false);
check('Empty device list rejected', post({ ...valid, submissionId: 'd', q2_devices: [] }).ok === false);
check('Out-of-range rating rejected',
  post({ ...valid, submissionId: 'e', q8_activity_interest_rating: 9 }).ok === false);
check('Missing rating rejected',
  post({ ...valid, submissionId: 'f', q9_multi_device_usefulness_rating: null }).ok === false);
check('Malformed body rejected',
  JSON.parse(sandbox.doPost({ postData: { contents: '{oops' } }).body).ok === false);
check('Empty request rejected', JSON.parse(sandbox.doPost({}).body).ok === false);
check('Oversized body rejected',
  post({ ...valid, submissionId: 'g', q10_open_response: 'x'.repeat(9000) }).ok === false);
check('No rows added by rejected requests', rows.length === 2, String(rows.length));

// Injection safety.
post({ ...valid, submissionId: 'h', q10_open_response: '=HYPERLINK("http://evil","click")' });
const injected = rows[rows.length - 1][10];
check('Formula neutralised', injected.startsWith("'="), injected);

// Long answers are truncated, not dropped.
post({ ...valid, submissionId: 'i', q10_open_response: 'y'.repeat(1500) });
check('Long answer truncated to 1000', rows[rows.length - 1][10].length === 1000,
  String(rows[rows.length - 1][10].length));

// Unexpected extra fields are ignored rather than stored.
post({ ...valid, submissionId: 'j', email: 'someone@example.com', ip: '1.2.3.4' });
const lastRow = JSON.stringify(rows[rows.length - 1]);
check('Unexpected fields never reach the sheet', !lastRow.includes('example.com') && !lastRow.includes('1.2.3.4'), lastRow);

// The frontend sends structured keys AND flat q1..q10 aliases so either
// deployment works. Code.gs must ignore the aliases, not choke on them.
const dual = { ...valid, submissionId: 'k', q1: 'Studying', q2: 'Smartphone, Laptop', q3: '6-8 hours', q4: 'Tired eyes', q5: 'x', q6: 'y', q7: 'z', q8: 4, q9: 5, q10: 'something' };
const before = rows.length;
const dualRes = post(dual);
check('Dual-key payload accepted', dualRes.ok === true, JSON.stringify(dualRes));
check('Dual-key payload adds exactly one row', rows.length === before + 1, String(rows.length - before));
check('Structured keys win over aliases', rows[rows.length - 1][1] === 'Studying' && rows[rows.length - 1][2] === 'Smartphone, Laptop', JSON.stringify(rows[rows.length - 1].slice(1, 3)));
check('Worst-case dual payload fits the size limit', JSON.stringify({ ...dual, q10_open_response: 'x'.repeat(600), q10: 'x'.repeat(600) }).length < 8000, String(JSON.stringify(dual).length));

check('doGet responds', JSON.parse(sandbox.doGet().body).ok === true);

console.log(`\n=== Apps Script: ${pass.length} passed, ${fail.length} failed ===`);
if (fail.length) fail.forEach((f) => console.log('  ✗ ' + f));
else pass.forEach((p) => console.log('  ✓ ' + p));
process.exit(fail.length ? 1 : 0);
