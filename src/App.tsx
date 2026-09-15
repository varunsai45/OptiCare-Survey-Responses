import { useCallback, useEffect, useState } from 'react';
import { Wordmark } from './components/common/Wordmark';
import { Questionnaire } from './components/questionnaire/Questionnaire';
import { Hero } from './sections/Hero';
import { Problem } from './sections/Problem';
import { WhyMissed } from './sections/WhyMissed';
import { Concept } from './sections/Concept';
import { ResearchIntro } from './sections/ResearchIntro';
import { SiteFooter } from './sections/SiteFooter';
import './styles/sections.css';

const STORAGE_KEY = 'opticare.research.v1';

/** Has this visitor already started (or finished) the questionnaire? */
function readProgress(): { resuming: boolean; completed: boolean } {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { resuming: false, completed: false };
    const parsed = JSON.parse(raw) as { stepIndex?: number; completed?: boolean };
    return {
      resuming: !parsed.completed && (parsed.stepIndex ?? 0) > 0,
      completed: Boolean(parsed.completed),
    };
  } catch {
    return { resuming: false, completed: false };
  }
}

export function App() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(() => readProgress());
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const start = useCallback(() => setOpen(true), []);

  const close = useCallback(() => {
    setOpen(false);
    setProgress(readProgress());
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className={`siteheader ${stuck ? 'is-stuck' : ''}`}>
        <div className="wrap siteheader__inner">
          <a href="#top" aria-label="OptiCare — back to top" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Wordmark />
          </a>
          <button type="button" className="btn btn--ghost btn--sm siteheader__cta" onClick={start}>
            {progress.completed
              ? 'Answered — open again'
              : progress.resuming
                ? 'Continue'
                : 'Start the research'}
          </button>
        </div>
      </header>

      <main id="main">
        <Hero onStart={start} resuming={progress.resuming} />
        <Problem />
        <WhyMissed />
        <Concept />
        <ResearchIntro onStart={start} resuming={progress.resuming} />
      </main>

      <SiteFooter />

      {open && <Questionnaire onClose={close} />}
    </>
  );
}
