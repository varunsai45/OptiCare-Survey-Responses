import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { App } from '../src/App';

const w = window as any;
w.__act = act;
w.__mount = (el: HTMLElement) => {
  const root = createRoot(el);
  act(() => { root.render(<App />); });
  return root;
};
