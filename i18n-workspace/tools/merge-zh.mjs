#!/usr/bin/env node
/**
 * merge-zh.mjs — merge translation batches into the app's zh-CN catalog.
 *
 * Reads every tools/translations/*.json (later files win), merges into
 * app/src/i18n/locales/zh-CN.json, and prints coverage against a key list.
 *
 * Usage: node tools/merge-zh.mjs [keysFile]
 *   keysFile defaults to report/codemod-keys-written.json
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = resolve(root, 'app/src/i18n/locales/zh-CN.json');
const keysFile = process.argv[2] ? resolve(root, process.argv[2]) : resolve(root, 'report/codemod-keys-written.json');

const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const translationsDir = resolve(root, 'tools/translations');
const batchFiles = existsSync(translationsDir)
  ? readdirSync(translationsDir)
      .filter((f) => f.endsWith('.json'))
      .sort()
  : [];

let added = 0;
let updated = 0;
for (const file of batchFiles) {
  const batch = JSON.parse(readFileSync(resolve(translationsDir, file), 'utf8'));
  for (const [key, value] of Object.entries(batch)) {
    if (typeof value !== 'string') continue;
    if (!(key in catalog)) added += 1;
    else if (catalog[key] !== value) updated += 1;
    catalog[key] = value;
  }
}

const sorted = Object.fromEntries(Object.entries(catalog).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(catalogPath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8');

console.log(`catalog entries : ${Object.keys(sorted).length}`);
console.log(`added           : ${added}`);
console.log(`updated         : ${updated}`);

if (existsSync(keysFile)) {
  const keys = JSON.parse(readFileSync(keysFile, 'utf8'));
  const missing = keys.filter((k) => !(k in sorted));
  console.log(`keys in ${keysFile.split(/[\\/]/).pop()} : ${keys.length}, untranslated: ${missing.length}`);
  if (missing.length) {
    console.log('untranslated keys:');
    for (const key of missing) console.log(`  - ${key}`);
  }
}
