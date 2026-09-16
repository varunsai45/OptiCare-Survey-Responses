/**
 * Test runner. Bundles the app for jsdom with esbuild (already present as a
 * Vite dependency), then runs the two suites:
 *
 *   tests/flow.test.mjs         the whole participant journey in a fake DOM
 *   tests/apps-script.test.mjs  apps-script/Code.gs against mocked Google APIs
 */
import { build } from 'esbuild';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..');

/**
 * Vite resolves `import x from './a.svg?raw'` to the file's text. esbuild has
 * no such convention, so the test build gets a plugin that does the same
 * thing — otherwise the illustrations would be invisible to the suite.
 */
const rawSvgPlugin = {
  name: 'raw-svg',
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /\.svg\?raw$/ }, (args) => ({
      path: path.resolve(args.resolveDir, args.path.replace(/\?raw$/, '')),
      namespace: 'raw-svg',
    }));
    pluginBuild.onLoad({ filter: /.*/, namespace: 'raw-svg' }, async (args) => ({
      contents: await readFile(args.path, 'utf8'),
      loader: 'text',
    }));
  },
};

await build({
  absWorkingDir: root,
  plugins: [rawSvgPlugin],
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
