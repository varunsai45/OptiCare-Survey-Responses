import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';

const bundle = readFileSync(
  new URL('./.build/bundle.js', import.meta.url),
  'utf8',
);

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
});

const { window } = dom;

// jsdom has no IntersectionObserver: fire every callback immediately so
// reveal-on-scroll content is present.
window.IntersectionObserver = class {
  constructor(cb) { this.cb = cb; }
  observe(el) { this.cb([{ isIntersecting: true, target: el }], this); }
  unobserve() {}
  disconnect() {}
};
window.matchMedia = window.matchMedia || ((q) => ({
  matches: false, media: q, addEventListener() {}, removeEventListener() {},
  addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false,
}));
window.scrollTo = () => {};
window.MessageChannel = (await import('node:worker_threads')).MessageChannel;

if (!window.crypto || !window.crypto.randomUUID) { try { Object.defineProperty(window, 'crypto', { value: { randomUUID: () => 'test-' + Math.random().toString(36).slice(2) }, configurable: true }); } catch {} }

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.IS_REACT_ACT_ENVIRONMENT = true;

const sent = [];
window.console.info = (...args) => { const p = args.find((a) => a && typeof a === 'object'); if (p) sent.push(p); };

const errors = [];
const origError = console.error;
console.error = (...args) => { errors.push(args.join(' ')); origError(...args); };

window.eval(bundle);

const { document } = window;
const act = window.__act;
window.__mount(document.getElementById('root'));

const pass = [];
const fail = [];
const check = (label, cond, extra = '') => {
  (cond ? pass : fail).push(label + (cond ? '' : ` — ${extra}`));
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];
const text = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
const byText = (sel, needle) =>
  $$(sel).find((el) => text(el).toLowerCase().includes(needle.toLowerCase()));

const click = (el) => {
  if (!el) throw new Error('click: element missing');
  act(() => {
    el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  });
};

const tick = async (ms = 0) => {
  await act(async () => {
    window.__jsdomAdvance?.(ms);
    await new Promise((r) => setTimeout(r, ms));
  });
};

// ---------------------------------------------------------------- landing
check('Hero headline renders', text($('h1')).includes('Your eyes work hard'), text($('h1')));
check('Hero CTA present', !!byText('button', 'Take the 2-minute experience'));
check('Problem section renders', text($('#problem h2')).includes('One day'), text($('#problem h2')));
check('Exposure example is labelled', text($('#exposure .marker')).toLowerCase().includes('example only'));
check('Why-breaks section renders', !!$('#why-missed'));
check('Concept section marked as proposed', text($('#concept .marker')).toLowerCase().includes('proposed'));
check('Activity showcase has five options', $$('.showcase__item').length === 5, String($$('.showcase__item').length));
check('Session demo present', !!$('.session__frame'));
check('Research intro CTA present', !!byText('#research button', 'Start the research'));
check('Footer disclaimer present', text($('.footer__note')).includes('does not diagnose'));

// No fake statistics anywhere on the landing page.
const pageText = text(document.body);
const statPattern = /\b\d{1,3}\s?%|\b\d+\s+out of\s+\d+\b|\b\d{1,3},\d{3}\+?\s+(people|users|responses)/i;
check('No fabricated statistics on the page', !statPattern.test(pageText),
  (pageText.match(statPattern) || [])[0]);

// ---------------------------------------------------------------- open quiz
click(byText('#research button', 'Start the research'));
await tick();
check('Questionnaire opens', !!$('.quiz'), 'no .quiz');
check('Q1 shown first', text($('.qscreen__title')).includes('mainly use digital screens'), text($('.qscreen__title')));
check('Counter shows 01 / 10', text($('.quiz__count')) === '01 / 10', text($('.quiz__count')));

const answerSingle = (needle) => {
  const opt = byText('.option', needle);
  if (!opt) throw new Error(`option not found: ${needle} in ${$$('.option').map(text).join(' | ')}`);
  click(opt);
};
const cont = async () => {
  click(byText('.qnav button', 'Continue') || byText('.qnav button', 'Submit'));
  await tick();
};

// Validation: continue with nothing selected.
click(byText('.qnav button', 'Continue'));
await tick();
check('Blocks empty required answer', !!$('.qnav__error'), 'no error shown');
check('Still on Q1 after failed continue', text($('.quiz__count')) === '01 / 10', text($('.quiz__count')));

answerSingle('Studying');
check('Selection marks the card', $$('.option.is-selected').length === 1, String($$('.option.is-selected').length));
await cont();
check('Q2 reached', text($('.quiz__count')) === '02 / 10', text($('.quiz__count')));

// Multi-select
answerSingle('Smartphone');
answerSingle('Laptop');
check('Multi-select keeps both', $$('.option.is-selected').length === 2, String($$('.option.is-selected').length));

// Back preserves answers
click(byText('.qnav button', 'Back'));
await tick();
check('Back returns to Q1', text($('.quiz__count')) === '01 / 10', text($('.quiz__count')));
check('Q1 answer remembered', text($('.option.is-selected')).includes('Studying'), text($('.option.is-selected')));
await cont();
check('Q2 answers remembered', $$('.option.is-selected').length === 2, String($$('.option.is-selected').length));
await cont();

check('Q3 reached', text($('.quiz__count')) === '03 / 10', text($('.quiz__count')));
answerSingle('6–8 hours');
await tick(700); // q3 auto-advances
check('Q3 auto-advances', text($('.quiz__count')) === '04 / 10', text($('.quiz__count')));
if (text($('.quiz__count')) === '03 / 10') { await cont(); }

// Exclusive option logic
answerSingle('Tired eyes');
answerSingle('Headache');
check('Two symptoms selected', $$('.option.is-selected').length === 2, String($$('.option.is-selected').length));
answerSingle("I don't usually experience any of these");
check('Exclusive option clears the others', $$('.option.is-selected').length === 1, String($$('.option.is-selected').length));
answerSingle('Tired eyes');
check('Choosing a symptom clears the exclusive option',
  $$('.option.is-selected').length === 1 && text($('.option.is-selected')).includes('Tired eyes'),
  $$('.option.is-selected').map(text).join(' | '));
answerSingle('Dry eyes');
await cont();

check('Q5 reached', text($('.quiz__count')) === '05 / 10', text($('.quiz__count')));
answerSingle('I take a break only when I feel eye discomfort');
await cont();

check('Q6 reached', text($('.quiz__count')) === '06 / 10', text($('.quiz__count')));
answerSingle('A reminder or notification');
await cont();

// Interstitial 1
check('Break-concept interstitial appears', !!$('.qscreen--concept') && text($('.qscreen__title--concept')).includes('nudge'), text($('.qscreen__title--concept')));
check('Interstitial marks the concept', text($('.conceptviz .marker')).toLowerCase().includes('not a medical rule'));
click(byText('.qnav button', 'Continue'));
await tick();

check('Q7 reached', text($('.quiz__count')) === '07 / 10', text($('.quiz__count')));
answerSingle('A relaxing focus activity');
await cont();

// Rating
check('Q8 reached', text($('.quiz__count')) === '08 / 10', text($('.quiz__count')));
check('Rating has five points', $$('.rating__point').length === 5, String($$('.rating__point').length));
click(byText('.qnav button', 'Continue'));
await tick();
check('Rating required', !!$('.qnav__error'));
click($$('.rating__point')[3]);
await tick();
check('Rating readout shows the label', text($('.rating__readout')).includes('Very interested'), text($('.rating__readout')));
await cont();

// Interstitial 2
check('Multi-device interstitial appears', !!$('.qscreen--concept') && text($('.qscreen__title--concept')).includes('added up'), text($('.qscreen__title--concept')));
check('Interstitial chart labelled example only', text($('.qscreen--concept .marker')).toLowerCase().includes('example only'));
click(byText('.qnav button', 'Continue'));
await tick();

check('Q9 reached', text($('.quiz__count')) === '09 / 10', text($('.quiz__count')));
click($$('.rating__point')[4]);
await tick();
await cont();

// Open text
check('Q10 reached', text($('.quiz__count')) === '10 / 10', text($('.quiz__count')));
check('Submit button is the final action', !!byText('.qnav button', 'Submit my response'));
const area = $('.textresponse__field');
check('Text area present', !!area);

// Too-short answer is rejected.
act(() => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  setter.call(area, 'no');
  area.dispatchEvent(new window.Event('input', { bubbles: true }));
});
click(byText('.qnav button', 'Submit my response'));
await tick();
check('Short open answer rejected', !!$('.qnav__error'), 'accepted a 2-character answer');

act(() => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  setter.call(area, 'I would stop checking my phone right before bed.');
  area.dispatchEvent(new window.Event('input', { bubbles: true }));
});

// Progress survives a refresh: remount from localStorage.
const saved = JSON.parse(window.localStorage.getItem('opticare.research.v1'));
check('Progress persisted to localStorage', saved && saved.stepIndex === 11, JSON.stringify(saved?.stepIndex));
check('Persisted answers include Q1', saved?.answers?.q1_primary_use === 'Studying', JSON.stringify(saved?.answers?.q1_primary_use));
const persistedKeys = [...Object.keys(saved), ...Object.keys(saved.answers), ...Object.keys(saved.details)].join(' ');
check('No personal fields persisted', !/email|phone|fullname|address|location|latitude|ip/i.test(persistedKeys), persistedKeys);

// ---------------------------------------------------------------- submit
click(byText('.qnav button', 'Submit my response'));
await tick(50);
check('Submitting state shown', text($('.qnav button.btn--accent')).includes('Sending'), text($('.qnav button.btn--accent')));
await tick(1200);
check('Success screen shown', !!$('.success'), 'no .success');
check('Success copy is sincere, no counts', text($('.success')).includes('Your experience has been added to our research'));
check('Success shows the tagline', text($('.success__tagline')).includes('AI-Powered Eye Wellness'));
const payload = sent[sent.length - 1];
check('Payload sent once', sent.length === 1, String(sent.length));
check('Structured keys present', payload?.q1_primary_use === 'Studying' && Array.isArray(payload?.q2_devices), JSON.stringify(payload?.q1_primary_use));
check('Flat aliases present for the simple Apps Script', payload?.q1 === 'Studying' && payload?.q2 === 'Smartphone, Laptop', JSON.stringify(payload?.q2));
check('Flat rating aliases are numbers', payload?.q8 === 4 && payload?.q9 === 5, JSON.stringify([payload?.q8, payload?.q9]));
check('Flat multi-select joined readably', payload?.q4 === 'Tired eyes, Dry eyes', JSON.stringify(payload?.q4));
check('Payload carries no personal fields', !/email|phoneNumber|fullName|address|latitude/i.test(Object.keys(payload || {}).join(' ')));
check('Completion persisted', JSON.parse(window.localStorage.getItem('opticare.research.v1')).completed === true);

// Restart clears everything.
click(byText('.success__restart', 'start again'));
await tick();
check('Restart returns to Q1', text($('.quiz__count')) === '01 / 10', text($('.quiz__count')));
check('Restart clears previous answers', $$('.option.is-selected').length === 0, String($$('.option.is-selected').length));

// ---------------------------------------------------------------- a11y
click($('.quiz__close'));
await tick(400);
const a11y = [];
$$('button').forEach((b) => {
  if (!text(b) && !b.getAttribute('aria-label') && !b.querySelector('.sr-only')) {
    a11y.push(b.className || b.outerHTML.slice(0, 60));
  }
});
check('Every button has an accessible name', a11y.length === 0, a11y.join(', '));
$$('img').forEach((img) => { if (!img.hasAttribute('alt')) a11y.push('img without alt'); });
check('No images without alt text', !a11y.includes('img without alt'));
check('Single h1 on the page', $$('h1').length === 1, String($$('h1').length));
check('Skip link present', !!$('.skip-link'));

const realErrors = errors.filter((e) => !/not wrapped in act|ReactDOMTestUtils\.act|deprecated/i.test(e));
check('No React errors or warnings', realErrors.length === 0, realErrors.slice(0, 3).join(' // '));

console.log(`\n=== ${pass.length} passed, ${fail.length} failed ===`);
if (fail.length) {
  console.log('\nFAILURES:');
  fail.forEach((f) => console.log('  ✗ ' + f));
} else {
  pass.forEach((p) => console.log('  ✓ ' + p));
}
process.exit(fail.length ? 1 : 0);
