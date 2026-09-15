/**
 * Test runner. Bundles the app for jsdom with esbuild (already present as a
 * Vite dependency), then runs the two suites:
 *
 *   tests/flow.test.mjs         the whole participant journey in a fake DOM
 *   tests/apps-script.test.mjs  apps-script/Code.gs against mocked Google APIs
 */
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

await build({
  absWorkingDir: root,
  entryPoints: ['tests/browser-entry.tsx'],
  outfile: 'tests/.build/bundle.js',
  bundle: true,
  format: 'iife',
  platform: 'browser',
  logLevel: 'warning',
  loader: { '.css': 'empty' },
  define: {
    'process.env.NODE_ENV': '"development"',
    'import.meta.env.DEV': 'true',
    'import.meta.env.VITE_GOOGLE_SCRIPT_URL': '""',
    'import.meta.env.VITE_SURVEY_DRY_RUN': '"false"',
  },
});

for (const suite of ['tests/flow.test.mjs', 'tests/apps-script.test.mjs']) {
  execFileSync(process.execPath, [suite], { cwd: root, stdio: 'inherit' });
}
