import activityInterest from '../../illustrations/activity-interest.svg?raw';
import breakActivities from '../../illustrations/break-activities.svg?raw';
import breakMissedPhone from '../../illustrations/break-missed-phone.svg?raw';
import breakMissedWork from '../../illustrations/break-missed-work.svg?raw';
import breakMotivation from '../../illustrations/break-motivation.svg?raw';
import continuousSession from '../../illustrations/continuous-session.svg?raw';
import deviceEcosystem from '../../illustrations/device-ecosystem.svg?raw';
import dismissibleReminder from '../../illustrations/dismissible-reminder.svg?raw';
import eyeBreakNotification from '../../illustrations/eye-break-notification.svg?raw';
import eyeExperiences from '../../illustrations/eye-experiences.svg?raw';
import habitReflection from '../../illustrations/habit-reflection.svg?raw';
import landingDevices from '../../illustrations/landing-devices.svg?raw';
import multiDeviceDay from '../../illustrations/multi-device-day.svg?raw';
import multiDeviceTotal from '../../illustrations/multi-device-total.svg?raw';
import screenTimeClock from '../../illustrations/screen-time-clock.svg?raw';
import screenUsePersonas from '../../illustrations/screen-use-personas.svg?raw';
import surveyComplete from '../../illustrations/survey-complete.svg?raw';
import timeAwareness from '../../illustrations/time-awareness.svg?raw';
import './Illustration.css';

/**
 * The illustration set.
 *
 * Each drawing is an ordinary `.svg` file in `src/illustrations/` — open it in
 * any vector editor, redraw it, save it, done. They are imported as raw markup
 * and inlined rather than loaded through `<img>` for two reasons:
 *
 *   1. Colour. An `<img>` is a closed document, so it cannot pick up the page's
 *      CSS variables. Inlined, the same file reads correctly on the warm page
 *      and on the dark questionnaire.
 *   2. Motion and state. CSS can reach the named parts inside the drawing, so a
 *      selected answer can light up the matching device without a second asset.
 *
 * None of the files contain `id` attributes, so the same drawing can appear
 * twice on a page without colliding.
 */
const registry = {
  'activity-interest': activityInterest,
  'break-activities': breakActivities,
  'break-missed-phone': breakMissedPhone,
  'break-missed-work': breakMissedWork,
  'break-motivation': breakMotivation,
  'continuous-session': continuousSession,
  'device-ecosystem': deviceEcosystem,
  'dismissible-reminder': dismissibleReminder,
  'eye-break-notification': eyeBreakNotification,
  'eye-experiences': eyeExperiences,
  'habit-reflection': habitReflection,
  'landing-devices': landingDevices,
  'multi-device-day': multiDeviceDay,
  'multi-device-total': multiDeviceTotal,
  'screen-time-clock': screenTimeClock,
  'screen-use-personas': screenUsePersonas,
  'survey-complete': surveyComplete,
  'time-awareness': timeAwareness,
} as const;

export type IllustrationName = keyof typeof registry;

interface IllustrationProps {
  name: IllustrationName;
  /**
   * What the drawing says, for people who cannot see it. Leave it out only
   * when the drawing repeats adjacent text — then it is marked decorative.
   */
  alt?: string;
  /** Surface the drawing sits on. Drives the colour tokens. */
  tone?: 'light' | 'dark';
  /** Extra sizing class from the section using it. */
  className?: string;
  /**
   * Space-separated tokens describing the current answer, e.g. "phone laptop".
   * CSS inside the drawing keys off these to highlight the matching parts.
   */
  state?: string;
  /** 1–5, for the two rating questions. */
  rating?: number;
}

export function Illustration({
  name,
  alt,
  tone = 'light',
  className,
  state,
  rating,
}: IllustrationProps) {
  const decorative = !alt;

  return (
    <div
      className={`ill ill--${tone} ${className ?? ''}`}
      data-ill={name}
      data-sel={state || undefined}
      data-rating={rating || undefined}
      role={decorative ? undefined : 'img'}
      aria-label={alt}
      aria-hidden={decorative || undefined}
      dangerouslySetInnerHTML={{ __html: registry[name] }}
    />
  );
}
