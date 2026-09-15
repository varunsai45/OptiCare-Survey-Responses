import type { Question, Step } from '../types';

/**
 * The ten research questions, in order.
 *
 * `researchPurpose` records which part of the Unit-II HCD process each answer
 * feeds (empathy map, pain points, POV statement, and so on), so the survey
 * instrument documents itself.
 */
export const questions: Question[] = [
  {
    id: 'q1_primary_use',
    type: 'single',
    title: 'What do you mainly use digital screens for?',
    description: 'Pick the one that describes most of your screen time.',
    required: true,
    sheetColumn: 'Primary Screen Use',
    researchPurpose: 'User identification and segmentation.',
    options: [
      { value: 'Studying', icon: 'book' },
      { value: 'Office / Work', icon: 'briefcase' },
      { value: 'Gaming', icon: 'gamepad' },
      { value: 'Entertainment / Social media', icon: 'play' },
      { value: 'Business', icon: 'chart' },
      { value: 'A combination of these', icon: 'layers' },
      { value: 'Other', icon: 'dots', allowsDetail: true },
    ],
  },
  {
    id: 'q2_devices',
    type: 'multi',
    title: 'Which devices do you normally use in a day?',
    description: 'You can choose more than one.',
    required: true,
    minSelections: 1,
    sheetColumn: 'Devices Used',
    researchPurpose: 'Establishes whether screen time is fragmented across devices.',
    options: [
      { value: 'Smartphone', icon: 'phone' },
      { value: 'Laptop', icon: 'laptop' },
      { value: 'Desktop computer', icon: 'desktop' },
      { value: 'Tablet', icon: 'tablet' },
      { value: 'Television', icon: 'tv' },
      { value: 'Other', icon: 'dots', allowsDetail: true },
    ],
  },
  {
    id: 'q3_daily_screen_time',
    type: 'single',
    title: 'About how much total time do you spend on digital screens each day?',
    description: 'Across every device. A rough estimate is fine.',
    required: true,
    autoAdvance: true,
    sheetColumn: 'Daily Screen Time',
    researchPurpose: 'Quantitative baseline for total exposure.',
    options: [
      { value: 'Less than 2 hours' },
      { value: '2–4 hours' },
      { value: '4–6 hours' },
      { value: '6–8 hours' },
      { value: '8–10 hours' },
      { value: 'More than 10 hours' },
    ],
  },
  {
    id: 'q4_eye_experiences',
    type: 'multi',
    title: 'When you use screens for a long time, what do you usually experience?',
    description: 'Choose everything that applies to you.',
    required: true,
    minSelections: 1,
    sheetColumn: 'Eye Experiences',
    researchPurpose: 'Pain points and emotion mapping.',
    options: [
      { value: 'Tired eyes', icon: 'eye' },
      { value: 'Dry eyes', icon: 'droplet' },
      { value: 'Blurred vision', icon: 'blur' },
      { value: 'Headache', icon: 'head' },
      { value: 'Eye redness', icon: 'spark' },
      { value: 'Difficulty focusing', icon: 'target' },
      { value: "I don't usually experience any of these", icon: 'check', exclusive: true },
      { value: 'Other', icon: 'dots', allowsDetail: true },
    ],
  },
  {
    id: 'q5_long_session_behavior',
    type: 'single',
    title: "What usually happens when you've been using a screen continuously for a long time?",
    description: 'Choose the one closest to your honest habit.',
    required: true,
    sheetColumn: 'Long Session Behavior',
    researchPurpose: 'User observation — what people actually do, not what they intend.',
    options: [
      { value: 'I take a break by myself' },
      { value: 'I continue working or studying until I finish' },
      { value: 'I check my phone or switch to another screen' },
      { value: 'I take a break only when I feel eye discomfort' },
      { value: "I usually don't notice how long I've been using the screen" },
      { value: 'Other', allowsDetail: true },
    ],
  },
  {
    id: 'q6_break_motivation',
    type: 'single',
    title: 'What would most likely encourage you to take a short eye break?',
    required: true,
    sheetColumn: 'Break Motivation',
    researchPurpose: 'Identifies the trigger a solution would need to use.',
    options: [
      { value: 'A reminder or notification', icon: 'bell' },
      { value: 'Feeling tired or uncomfortable', icon: 'eye' },
      { value: 'A fixed break schedule', icon: 'calendar' },
      { value: 'A short activity or game', icon: 'play' },
      { value: "Seeing how long I've been continuously using screens", icon: 'clock' },
      { value: 'Nothing would encourage me', icon: 'pause' },
      { value: 'Other', icon: 'dots', allowsDetail: true },
    ],
  },
  {
    id: 'q7_preferred_break_activity',
    type: 'single',
    title: 'What would you prefer during that short break?',
    description: 'There is no right answer — "no activity" is a genuinely useful finding.',
    required: true,
    sheetColumn: 'Preferred Break Activity',
    researchPurpose: 'Directs the concept: which break format, if any, people want.',
    options: [
      { value: 'A simple blinking activity', hint: 'Slow, comfortable blinks for 30 seconds.' },
      { value: 'A relaxing focus activity', hint: 'Follow a point as it moves near and far.' },
      { value: 'A quick colour-based activity', hint: 'Match a colour, then look away.' },
      { value: 'A short peripheral-awareness activity', hint: 'Notice what appears at the edges.' },
      { value: 'A quick reading activity', hint: 'A few lines of calm text, read slowly.' },
      { value: 'Just close my eyes and rest', hint: 'No interaction at all.' },
      { value: 'I would prefer no activity', hint: 'Skip the break entirely.' },
    ],
  },
  {
    id: 'q8_activity_interest_rating',
    type: 'rating',
    title:
      "How interested would you be in completing a short eye-rest activity instead of simply being told to 'take a break'?",
    required: true,
    sheetColumn: 'Eye-Rest Activity Interest',
    researchPurpose: 'Quantifies appetite for an interactive break over a passive reminder.',
    scale: [
      { value: 1, label: 'Not interested at all' },
      { value: 2, label: 'Slightly interested' },
      { value: 3, label: 'Moderately interested' },
      { value: 4, label: 'Very interested' },
      { value: 5, label: 'Extremely interested' },
    ],
  },
  {
    id: 'q9_multi_device_usefulness_rating',
    type: 'rating',
    title:
      'If you use multiple devices, how useful would it be to see your screen usage from those devices together in one place?',
    required: true,
    sheetColumn: 'Multi-Device Usefulness',
    researchPurpose: 'Tests the combined-exposure idea before any of it is built.',
    scale: [
      { value: 1, label: 'Not useful at all' },
      { value: 2, label: 'Slightly useful' },
      { value: 3, label: 'Moderately useful' },
      { value: 4, label: 'Very useful' },
      { value: 5, label: 'Extremely useful' },
    ],
  },
  {
    id: 'q10_open_response',
    type: 'text',
    title: 'If you could change ONE thing about your screen habits, what would it be?',
    description: 'A sentence is plenty. Your own words are the most useful part of this research.',
    required: true,
    minLength: 5,
    maxLength: 600,
    placeholder: 'Tell us in your own words…',
    sheetColumn: 'Open Response',
    researchPurpose: 'Qualitative analysis — feeds the POV statement and How Might We question.',
  },
];

/**
 * The full flow. Interstitials sit between questions so a participant always
 * has the context for what is being asked next.
 */
export const steps: Step[] = [
  ...questions.slice(0, 6).map((question) => ({ kind: 'question' as const, question })),
  {
    kind: 'interstitial',
    id: 'concept-break',
    variant: 'break-concept',
    eyebrow: "Here's one idea we're exploring",
    title: 'A nudge after a long stretch.',
    body: 'If a screen session runs long, OptiCare could notice and offer a 60-second pause — with a small activity to make the break easier to actually take. Nothing here is built yet. The next question asks what you would want from a moment like this.',
    cta: 'Continue',
  },
  ...questions.slice(6, 8).map((question) => ({ kind: 'question' as const, question })),
  {
    kind: 'interstitial',
    id: 'concept-multi-device',
    variant: 'multi-device',
    eyebrow: 'One more idea',
    title: 'Your day, added up.',
    body: 'Each device counts its own hours separately. This is a sketch of what those hours could look like in one place. The numbers below are made up for illustration — the next question asks whether a view like this would be worth having.',
    cta: 'Continue',
  },
  ...questions.slice(8).map((question) => ({ kind: 'question' as const, question })),
];

export const questionCount = questions.length;

/** Position of each question within the ten, for the "03 / 10" counter. */
export const questionNumber: Record<string, number> = Object.fromEntries(
  questions.map((q, i) => [q.id, i + 1]),
);
