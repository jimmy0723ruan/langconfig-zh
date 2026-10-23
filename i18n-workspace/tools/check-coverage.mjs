#!/usr/bin/env node
/**
 * check-coverage.mjs — guard against new hardcoded UI copy.
 *
 * Runs `i18next-cli lint` in the app workspace, counts hardcoded strings and
 * exits non-zero when the count exceeds the threshold.
 *
 * Usage:
 *   node tools/check-coverage.mjs                # run lint, compare to 450
 *   node tools/check-coverage.mjs --threshold 400
 *   node tools/check-coverage.mjs --lint-file report/lint-final.txt   # reuse an existing report
 */

import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Layout detection, three cases:
//   dev workspace : <root>/app/package.json exists  -> app root is <root>/app
//   published repo: the repo root is the app        -> <root>/package.json exists
//   neither       : we are inside i18n-workspace/   -> app root is the parent
function detectAppDir(root) {
  if (existsSync(resolve(root, 'app/package.json'))) return resolve(root, 'app');
  if (existsSync(resolve(root, 'package.json'))) return root;
  return resolve(root, '..');
}
const appDir = detectAppDir(root);

const argv = process.argv.slice(2);
const thresholdIdx = argv.indexOf('--threshold');
const threshold = thresholdIdx >= 0 ? Number(argv[thresholdIdx + 1]) : 450;
const lintFileIdx = argv.indexOf('--lint-file');
// Relative paths resolve from the caller's cwd (repo root in CI, workspace root locally).
const lintFile = lintFileIdx >= 0 ? resolve(process.cwd(), argv[lintFileIdx + 1]) : null;

function countFrom(text) {
  const matches = text.match(/Found hardcoded string/g);
  return matches ? matches.length : 0;
}

let count = 0;
let source = '';

if (lintFile && existsSync(lintFile)) {
  count = countFrom(readFileSync(lintFile, 'utf8'));
  source = lintFile;
} else {
  const result = spawnSync('npx', ['i18next-cli', 'lint'], {
    cwd: appDir,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    timeout: 180000,
  });
  if (result.error) {
    console.error('failed to run i18next-cli lint:', result.error.message);
    process.exit(2);
  }
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  count = countFrom(output);
  source = 'npx i18next-cli lint';
}

const pct = ((2856 - count) / 2856 * 100).toFixed(1);
console.log(`hardcoded strings : ${count}`);
console.log(`baseline          : 2856 (eb786cf)`);
console.log(`translated        : ${pct}%`);
console.log(`threshold         : ${threshold}  (source: ${source})`);

if (count > threshold) {
  console.error(`\nFAIL: ${count} > ${threshold}. New untranslated copy was introduced.`);
  console.error('Run `npx i18next-cli lint` in app/ and translate the new strings, or raise the threshold deliberately.');
  process.exit(1);
}

console.log('\nOK: within threshold.');
