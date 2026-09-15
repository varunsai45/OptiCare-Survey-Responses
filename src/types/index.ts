/**
 * Types for the questionnaire engine.
 *
 * The engine is data-driven: adding, reordering or rewording a question means
 * editing `src/data/questions.ts` only — no component changes.
 */

export type QuestionType = 'single' | 'multi' | 'rating' | 'text';

export interface QuestionOption {
  /** Stored verbatim in the sheet, so keep it readable for analysis. */
  value: string;
  /** Optional one-line clarification shown under the option label. */
  hint?: string;
  /** Named glyph from `src/components/common/Glyph.tsx`. */
  icon?: GlyphName;
  /**
   * Marks an option that cannot coexist with any other in a multi-select
   * ("I don't usually experience any of these"). Selecting it clears the
   * rest; selecting anything else clears it.
   */
  exclusive?: boolean;
  /** Reveals a short free-text input when chosen. */
  allowsDetail?: boolean;
}

export interface RatingPoint {
  value: number;
  label: string;
}

export interface BaseQuestion {
  id: QuestionId;
  /** Zero-padded index shown in the progress rail, e.g. "03". */
  title: string;
  description?: string;
  required: boolean;
  /**
   * Why we ask. Shown to the participant on demand — research transparency,
   * and it doubles as documentation for the HCD write-up.
   */
  researchPurpose: string;
  /** Column heading used by the Apps Script / Google Sheet. */
  sheetColumn: string;
}

export interface SingleQuestion extends BaseQuestion {
  type: 'single';
  options: QuestionOption[];
  /** Advance automatically a beat after selection (only for short lists). */
  autoAdvance?: boolean;
}

export interface MultiQuestion extends BaseQuestion {
  type: 'multi';
  options: QuestionOption[];
  minSelections?: number;
}

export interface RatingQuestion extends BaseQuestion {
  type: 'rating';
  scale: RatingPoint[];
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
  placeholder: string;
  minLength?: number;
  maxLength: number;
}

export type Question = SingleQuestion | MultiQuestion | RatingQuestion | TextQuestion;

export type QuestionId =
  | 'q1_primary_use'
  | 'q2_devices'
  | 'q3_daily_screen_time'
  | 'q4_eye_experiences'
  | 'q5_long_session_behavior'
  | 'q6_break_motivation'
  | 'q7_preferred_break_activity'
  | 'q8_activity_interest_rating'
  | 'q9_multi_device_usefulness_rating'
  | 'q10_open_response';

export type AnswerValue = string | string[] | number | null;

export type Answers = Partial<Record<QuestionId, AnswerValue>>;

/**
 * An interstitial is a non-question step: a short concept card that gives the
 * participant the context they need before the question that follows it.
 */
export interface Interstitial {
  kind: 'interstitial';
  id: string;
  variant: 'break-concept' | 'multi-device';
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
}

export interface QuestionStep {
  kind: 'question';
  question: Question;
}

export type Step = QuestionStep | Interstitial;

export type SubmissionState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; message: string };

export type GlyphName =
  | 'book'
  | 'briefcase'
  | 'gamepad'
  | 'play'
  | 'chart'
  | 'layers'
  | 'dots'
  | 'phone'
  | 'laptop'
  | 'desktop'
  | 'tablet'
  | 'tv'
  | 'eye'
  | 'droplet'
  | 'blur'
  | 'head'
  | 'spark'
  | 'target'
  | 'check'
  | 'bell'
  | 'clock'
  | 'calendar'
  | 'pause';
