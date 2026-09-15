import { questions } from '../data/questions';
import type { Answers, QuestionId } from '../types';

/**
 * Submission payload. Deliberately contains nothing that identifies a person:
 * no name, email, phone, location, device id or IP-derived field.
 *
 * Every answer is sent twice, under two names:
 *
 *   q1_primary_use, q2_devices, …   structured — what apps-script/Code.gs reads
 *   q1, q2, …                       flat strings — what the simpler Apps Script
 *                                   deployment (columns Q1_Main_Use, Q2_Devices…)
 *                                   reads
 *
 * That way the site keeps working whichever of the two scripts is deployed,
 * and switching between them needs no frontend change. The duplication costs
 * well under a kilobyte per submission.
 */
export interface SurveyPayload {
  /** Client clock, for reference only — Apps Script records its own timestamp. */
  clientTimestamp: string;
  /** Random per-submission id, used solely to drop duplicate rows on retry. */
  submissionId: string;

  q1_primary_use: string;
  q2_devices: string[];
  q3_daily_screen_time: string;
  q4_eye_experiences: string[];
  q5_long_session_behavior: string;
  q6_break_motivation: string;
  q7_preferred_break_activity: string;
  q8_activity_interest_rating: number;
  q9_multi_device_usefulness_rating: number;
  q10_open_response: string;

  /** Flat aliases. Multi-selects are comma-joined so one cell reads naturally. */
  q1: string;
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  q8: number;
  q9: number;
  q10: string;
}

export const GOOGLE_SCRIPT_URL: string = (
  import.meta.env.VITE_GOOGLE_SCRIPT_URL ?? ''
).trim();

const DRY_RUN = import.meta.env.VITE_SURVEY_DRY_RUN === 'true';

const TIMEOUT_MS = 15000;

/** Cryptographically-random id where available, falling back for old browsers. */
export function createSubmissionId(): string {
  const c = globalThis.crypto;
  if (c && 'randomUUID' in c) return c.randomUUID();
  return `r-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Turns the answer map into the flat payload the sheet expects. An "Other"
 * choice is merged with the detail the participant typed, so a single column
 * still reads naturally in the spreadsheet.
 */
export function buildPayload(
  answers: Answers,
  details: Partial<Record<QuestionId, string>>,
  submissionId: string,
): SurveyPayload {
  const resolve = (id: QuestionId): string | string[] | number => {
    const raw = answers[id];
    const detail = details[id]?.trim();

    const withDetail = (value: string) =>
      value === 'Other' && detail ? `Other: ${detail}` : value;

    if (Array.isArray(raw)) return raw.map(withDetail);
    if (typeof raw === 'string') return withDetail(raw);
    if (typeof raw === 'number') return raw;
    return '';
  };

  const structured = {
    q1_primary_use: resolve('q1_primary_use') as string,
    q2_devices: resolve('q2_devices') as string[],
    q3_daily_screen_time: resolve('q3_daily_screen_time') as string,
    q4_eye_experiences: resolve('q4_eye_experiences') as string[],
    q5_long_session_behavior: resolve('q5_long_session_behavior') as string,
    q6_break_motivation: resolve('q6_break_motivation') as string,
    q7_preferred_break_activity: resolve('q7_preferred_break_activity') as string,
    q8_activity_interest_rating: resolve('q8_activity_interest_rating') as number,
    q9_multi_device_usefulness_rating: resolve('q9_multi_device_usefulness_rating') as number,
    q10_open_response: resolve('q10_open_response') as string,
  };

  return {
    clientTimestamp: new Date().toISOString(),
    submissionId,
    ...structured,

    // Flat aliases for the simpler Apps Script deployment. An array written
    // straight into a cell would come out as "a,b" anyway, so join it here
    // and keep control of the separator.
    q1: structured.q1_primary_use,
    q2: structured.q2_devices.join(', '),
    q3: structured.q3_daily_screen_time,
    q4: structured.q4_eye_experiences.join(', '),
    q5: structured.q5_long_session_behavior,
    q6: structured.q6_break_motivation,
    q7: structured.q7_preferred_break_activity,
    q8: structured.q8_activity_interest_rating,
    q9: structured.q9_multi_device_usefulness_rating,
    q10: structured.q10_open_response,
  };
}

/** Sheet header order, derived from the questions so the two cannot drift. */
export const sheetHeaders = ['Timestamp', ...questions.map((q) => q.sheetColumn)];

export class SubmissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SubmissionError';
  }
}

const FRIENDLY_ERROR =
  "We couldn't submit your response right now. Your answers are safe — please try again.";

const OFFLINE_ERROR =
  'You appear to be offline. Your answers are saved on this device — reconnect and try again.';

/**
 * POSTs the payload to the Apps Script web app.
 *
 * The body is sent as `text/plain` on purpose: that keeps it a CORS "simple
 * request", which avoids the preflight that Apps Script cannot answer. The
 * script parses the body as JSON on the other side.
 */
export async function submitSurvey(payload: SurveyPayload): Promise<void> {
  if (DRY_RUN || !GOOGLE_SCRIPT_URL) {
    if (import.meta.env.DEV) {
      // Local development only. Nothing is ever written to the research sheet
      // from here, and no mock rows are generated.
      console.info('[OptiCare] Dry run — payload not sent:', payload);
      await new Promise((resolve) => setTimeout(resolve, 900));
      return;
    }
    throw new SubmissionError(FRIENDLY_ERROR);
  }

  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new SubmissionError(OFFLINE_ERROR);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
      signal: controller.signal,
    });

    if (!response.ok) throw new SubmissionError(FRIENDLY_ERROR);

    const text = await response.text();
    let result: { ok?: boolean; success?: boolean } = {};
    try {
      result = JSON.parse(text);
    } catch {
      // A non-JSON body means the deployment is misconfigured (usually an
      // access-control HTML page). Treat it as a failure rather than pretend.
      throw new SubmissionError(FRIENDLY_ERROR);
    }

    // `ok` is what apps-script/Code.gs returns; `success` is accepted too so a
    // different Apps Script deployment does not read as a failed submission.
    if (result.ok !== true && result.success !== true) {
      throw new SubmissionError(FRIENDLY_ERROR);
    }
  } catch (error) {
    if (error instanceof SubmissionError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new SubmissionError(
        'That took longer than expected. Your answers are saved — please try again.',
      );
    }
    throw new SubmissionError(FRIENDLY_ERROR);
  } finally {
    clearTimeout(timer);
  }
}
