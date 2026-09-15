# OptiCare — HCD research experience

A short interactive website that explains the screen-use problem we are researching, shows the
OptiCare concept we are considering, and then collects ten research answers.

It is **not** the OptiCare product. The product is the Flutter app in `../opticare`; this is the
research instrument that runs before the product design is finalised. Nothing here claims the
concept is validated, and there are no statistics on the site because we have not collected any
yet.

- **Stack:** React 18 + TypeScript + Vite. No UI framework, no animation library, no Firebase.
- **Storage:** Google Sheets via a free Google Apps Script web app.
- **Data collected:** ten answers. No name, email, phone, location, camera, microphone or device
  identifier.

---

## 1. Run it locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default <http://localhost:5173>).

Without a configured endpoint, `npm run dev` runs in **dry-run mode**: submitting prints the
payload to the browser console and shows the success screen, but sends nothing anywhere. That is
deliberate — no test rows should ever reach the real research sheet.

Other scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run build       # typecheck + production build into dist/
npm run preview     # serve the production build locally
npm test            # participant flow (jsdom) + Apps Script validation
```

---

## 2. Google Sheets setup

Everything below is free and needs only a normal Google account.

### Step 1 — Create the sheet

1. Go to <https://sheets.new> and name the spreadsheet, e.g. `OptiCare research responses`.
2. Rename the first tab to **`Responses`** (the script creates it if you forget, but this is
   tidier).

### Step 2 — Add the header row

Paste this into row 1, one value per column (A–K):

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| Timestamp | Primary Screen Use | Devices Used | Daily Screen Time | Eye Experiences | Long Session Behavior | Break Motivation | Preferred Break Activity | Eye-Rest Activity Interest | Multi-Device Usefulness | Open Response |

If you leave the sheet empty, the script writes this header itself on the first submission.

### Step 3 — Add the Apps Script

1. In the spreadsheet, choose **Extensions → Apps Script**.
2. Delete the placeholder `function myFunction() {}`.
3. Copy the entire contents of [`apps-script/Code.gs`](apps-script/Code.gs) and paste it in.
4. Click the save icon.

### Step 4 — Deploy as a web app

1. Click **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description:** `OptiCare research endpoint`
   - **Execute as:** **Me** (your account) — this is what lets the script write to your sheet.
   - **Who has access:** **Anyone** — required so participants can submit without a Google
     account. "Anyone with Google account" will block most of your respondents.
4. Click **Deploy**.
5. Google asks you to authorise the script. Choose your account → **Advanced** → **Go to (project
   name)** → **Allow**. This warning is normal for your own unpublished script.
6. Copy the **Web app URL**. It looks like
   `https://script.google.com/macros/s/AKfycb.../exec`.

### Step 5 — Point the site at it

```bash
cp .env.example .env
```

Then edit `.env`:

```
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycb.../exec
VITE_SURVEY_DRY_RUN=false
```

Restart the dev server — Vite only reads `.env` at startup.

> `.env` is gitignored. The endpoint is not a secret (a public survey has to be publicly
> writable), but keeping it out of the repo means you can rotate it without a commit. All
> validation happens server-side inside the Apps Script.

### Step 6 — Test it

1. Open the site, complete all ten questions, and submit.
2. You should see the **Thank you** screen.
3. Switch to the Google Sheet. A new row should appear within a second or two.
4. Check the row: the timestamp is filled in, multi-select answers are comma-separated, and the
   two ratings are numbers.

Quick check without filling the form: open the web app URL in a browser tab. A reachable
deployment replies with `{"ok":true,"message":"OptiCare research endpoint is live."}`.

**If no row appears**, work through these in order:

| Symptom | Cause | Fix |
| --- | --- | --- |
| Friendly error on the site, nothing in the sheet | "Who has access" is not **Anyone** | Redeploy with the correct access setting |
| Nothing happens, console shows a CORS error | An old deployment URL, or `/dev` instead of `/exec` | Use the `/exec` URL from the latest deployment |
| Worked before, stopped after an edit | Apps Script keeps serving the deployed version | **Deploy → Manage deployments → Edit → Version: New version** |
| Rows appear with blank cells | Header order changed | Keep `HEADERS` in `Code.gs` matching the sheet |

Whenever you change `Code.gs`, you must deploy a **new version** — saving alone does not update
the live endpoint.

---

## 2b. Which Apps Script is deployed

The site works with either of two scripts, because every answer is sent twice — once under
structured keys (`q1_primary_use`, `q2_devices`, …) and once under flat aliases (`q1`…`q10`,
with multi-selects comma-joined). Switching between them needs no frontend change.

| | `apps-script/Code.gs` (this repo) | The simpler script |
| --- | --- | --- |
| Reads | structured keys | `q1`…`q10` |
| Columns | `Primary Screen Use`, `Devices Used`, … | `Q1_Main_Use`, `Q2_Devices`, … |
| `doGet` says | `OptiCare research endpoint is live.` | `OptiCare Survey API is running` |
| Rejects incomplete submissions | yes | no — writes whatever arrives |
| Blocks duplicate retries | yes, 6-hour window | no — a retry adds a second row |
| Neutralises `=` formula injection | yes | no |
| Caps answer length / body size | yes | no |
| Bold, frozen header row | yes | no |

Open the `/exec` URL in a browser to see which one is live — the `doGet` message above tells you
immediately.

The simpler script is fine for collecting responses. The trade-off is that nothing validates the
data server-side, so a double-tap on Submit can produce two rows; check for duplicate rows before
analysing. To switch, paste `apps-script/Code.gs` over **all** existing files in the project
(delete any other `.gs` file first — two files defining `doPost` will fight, and the old one
usually wins), then **Deploy → Manage deployments → pencil → Version: New version**.

---
## 3. Deploying the site

The build is a static bundle, so any free host works. Set the environment variable
`VITE_GOOGLE_SCRIPT_URL` in the host's dashboard before building.

**Netlify / Vercel:** connect the repo, build command `npm run build`, publish directory `dist`.

**GitHub Pages:**

```bash
npm run build
# commit the contents of dist/ to a gh-pages branch, or use an action
```

Share the deployed URL — it is designed to be opened from a WhatsApp message on a phone.

---

## 4. How the code is organised

```
src/
├── components/
│   ├── common/          Wordmark, icon set
│   ├── questionnaire/   The survey engine and its controls
│   └── visuals/         Device composition, timeline, exposure chart, demos
├── sections/            The scrollable page, one file per section
├── data/questions.ts    The ten questions + the two concept interstitials
├── services/            Payload building and submission
├── hooks/               Survey state, reveal-on-scroll, reduced motion, counters
├── types/               Question model
└── styles/              Design tokens and section styles
apps-script/Code.gs      The Google Sheets endpoint
```

### Changing the questions

Edit `src/data/questions.ts`. The questionnaire renders whatever is in that array — question
types, options, exclusive options ("none of these"), "Other" with a free-text detail, rating
scales, validation rules and the order of the concept interstitials all come from the data.

If you add or rename a question, update three things together:

1. `sheetColumn` on the question (the sheet heading),
2. `HEADERS` and `buildRow()` in `apps-script/Code.gs`,
3. the header row in the spreadsheet itself.

### Research notes

Each question carries a `researchPurpose` describing which part of the Unit-II process it feeds
(segmentation, observation, pain points, qualitative analysis, and so on). Participants can read
it too, under "Why we ask this" on every question.

---

## 5. Design and behaviour notes

- **One question per screen.** Answers are kept in React state and mirrored to `localStorage`, so
  going Back preserves a selection and an accidental refresh does not lose progress. The success
  screen offers "start again" for the next participant on a shared device.
- **Keyboard.** Arrow keys move between options, Enter continues once the answer is valid, Escape
  leaves the questionnaire without clearing anything.
- **Reduced motion.** `prefers-reduced-motion` disables the animation layer; counters and timed
  demos jump straight to their end state, and nothing stops working.
- **Duplicate submissions.** Each session generates a `submissionId`. The Apps Script caches it
  for six hours, so a retry after a response that actually arrived does not create a second row.
- **Errors.** Network, timeout and endpoint failures all surface as one plain sentence with a
  retry button. Raw exception text is never shown to a participant.
- **No fabricated content.** The example figures (3h 20m / 5h 10m / 1h 30m and the two-and-a-half
  hour threshold) are labelled as illustrations wherever they appear, and there are no statistics,
  testimonials or response counts anywhere on the site.

---

## 6. Before sharing the link

- [ ] `npm test` passes and `npm run build` succeeds.
- [ ] A test submission from a phone reaches the sheet.
- [ ] Delete your test rows from the sheet so only real participant data remains.
- [ ] Open the link on a phone from WhatsApp and complete it once, start to finish.
