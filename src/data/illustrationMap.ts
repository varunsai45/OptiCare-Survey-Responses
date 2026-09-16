import type { IllustrationName } from '../components/common/Illustration';
import type { AnswerValue, QuestionId } from '../types';

/**
 * Which drawing belongs to which question, and how an answer lights it up.
 *
 * This lives apart from `questions.ts` on purpose: the survey instrument —
 * wording, order, options, validation, what reaches the sheet — is untouched
 * by anything in this file. Presentation only. Delete it and the survey still
 * works exactly as before.
 */

interface QuestionVisual {
  name: IllustrationName;
  /** Describes the drawing for anyone who cannot see it. */
  alt: string;
  /** Maps a stored answer to the highlight tokens the drawing understands. */
  toState?: (value: AnswerValue) => string;
}

/** Turns option text into a token, ignoring anything unmapped ("Other"). */
const lookup =
  (table: Record<string, string>) =>
  (value: AnswerValue): string => {
    if (Array.isArray(value)) {
      return value
        .map((item) => table[item])
        .filter(Boolean)
        .join(' ');
    }
    if (typeof value === 'string') return table[value] ?? '';
    return '';
  };

export const questionVisuals: Partial<Record<QuestionId, QuestionVisual>> = {
  q1_primary_use: {
    name: 'screen-use-personas',
    alt: 'Six small scenes of people using screens: studying, working, gaming, social media, business, and a mix of devices.',
    toState: lookup({
      Studying: 'studying',
      'Office / Work': 'work',
      Gaming: 'gaming',
      'Entertainment / Social media': 'entertainment',
      Business: 'business',
      'A combination of these': 'combination',
    }),
  },

  q2_devices: {
    name: 'device-ecosystem',
    alt: 'A phone, laptop, desktop computer, tablet and television linked to one central point, as one connected set of screens.',
    toState: lookup({
      Smartphone: 'phone',
      Laptop: 'laptop',
      'Desktop computer': 'desktop',
      Tablet: 'tablet',
      Television: 'tv',
    }),
  },

  q3_daily_screen_time: {
    name: 'screen-time-clock',
    alt: 'A day drawn as a line from morning to night, filling further as the daily total grows.',
    toState: lookup({
      'Less than 2 hours': 'b1',
      '2–4 hours': 'b2',
      '4–6 hours': 'b3',
      '6–8 hours': 'b4',
      '8–10 hours': 'b5',
      'More than 10 hours': 'b6',
    }),
  },

  q4_eye_experiences: {
    name: 'eye-experiences',
    alt: 'A person at a laptop, with small markers around them for tired eyes, dry eyes, blurred vision, headache, redness and difficulty focusing.',
    toState: lookup({
      'Tired eyes': 'tired',
      'Dry eyes': 'dry',
      'Blurred vision': 'blurred',
      Headache: 'headache',
      'Eye redness': 'redness',
      'Difficulty focusing': 'focus',
      "I don't usually experience any of these": 'none',
    }),
  },

  q5_long_session_behavior: {
    name: 'continuous-session',
    alt: 'A person at a laptop beside a clock running on, and five possible responses: take a break, carry on, switch screens, stop at discomfort, or not notice the time.',
    toState: lookup({
      'I take a break by myself': 'break',
      'I continue working or studying until I finish': 'continue',
      'I check my phone or switch to another screen': 'switch',
      'I take a break only when I feel eye discomfort': 'discomfort',
      "I usually don't notice how long I've been using the screen": 'unnoticed',
    }),
  },

  q6_break_motivation: {
    name: 'break-motivation',
    alt: 'A notification reading two and a half hours of continuous screen use, surrounded by possible reasons to stop: a reminder, tiredness, a schedule, an activity, seeing the elapsed time, or nothing at all.',
    toState: lookup({
      'A reminder or notification': 'reminder',
      'Feeling tired or uncomfortable': 'tired',
      'A fixed break schedule': 'schedule',
      'A short activity or game': 'activity',
      "Seeing how long I've been continuously using screens": 'duration',
      'Nothing would encourage me': 'nothing',
    }),
  },

  q7_preferred_break_activity: {
    name: 'break-activities',
    alt: 'Seven small tiles for the candidate break formats: blinking, focus, colour, edge awareness, reading, resting with eyes closed, and no activity.',
    toState: lookup({
      'A simple blinking activity': 'blink',
      'A relaxing focus activity': 'focus',
      'A quick colour-based activity': 'colour',
      'A short peripheral-awareness activity': 'peripheral',
      'A quick reading activity': 'reading',
      'Just close my eyes and rest': 'rest',
      'I would prefer no activity': 'none',
    }),
  },

  q8_activity_interest_rating: {
    name: 'activity-interest',
    alt: 'Two things side by side: a plain reminder saying “take a break”, and a sixty-second activity to actually do.',
  },

  q9_multi_device_usefulness_rating: {
    name: 'multi-device-total',
    alt: 'An example of three devices — phone three hours twenty, laptop five hours ten, tablet one hour thirty — joining into a combined total of ten hours.',
  },

  q10_open_response: {
    name: 'habit-reflection',
    alt: 'A person pausing beside their screens, with a few example thoughts about changing a screen habit.',
  },
};
