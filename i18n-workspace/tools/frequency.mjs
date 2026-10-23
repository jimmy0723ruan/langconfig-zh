#!/usr/bin/env node
/**
 * Parse the i18next-cli lint report and build:
 *   - report/frequency.csv   : string -> occurrences / file count
 *   - report/strings-index.json : string -> [{ file, line }]
 *
 * Usage: node tools/frequency.mjs [lintFile] [outDir]
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const lintFile = resolve(process.argv[2] ?? 'report/lint-p1.txt');
const outDir = resolve(process.argv[3] ?? 'report');

const text = readFileSync(lintFile, 'utf8');
const lines = text.split(/\r?\n/);

const FILE_RE = /^(\S.*\.(?:tsx?|jsx?))$/;
const ISSUE_RE = /^\s*(\d+): Error: Found hardcoded string: "(.*)"\s*$/;

const index = new Map(); // string -> [{file,line}]
let currentFile = null;
let issues = 0;

for (const line of lines) {
  const fileMatch = line.match(FILE_RE);
  if (fileMatch) {
    currentFile = fileMatch[1].replace(/\\/g, '/');
    continue;
  }
  const issueMatch = line.match(ISSUE_RE);
  if (issueMatch && currentFile) {
    const [, lineNo, raw] = issueMatch;
    const value = raw.replace(/\\"/g, '"');
    if (!index.has(value)) index.set(value, []);
    index.get(value).push({ file: currentFile, line: Number(lineNo) });
    issues += 1;
  }
}

const rows = [...index.entries()]
  .map(([value, hits]) => ({
    value,
    occurrences: hits.length,
    fileCount: new Set(hits.map((h) => h.file)).size,
    files: [...new Set(hits.map((h) => h.file))],
  }))
  .sort((a, b) => b.occurrences - a.occurrences || b.fileCount - a.fileCount || a.value.localeCompare(b.value));

function csvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

const csv = ['string,occurrences,file_count,files'];
for (const row of rows) {
  csv.push([csvCell(row.value), row.occurrences, row.fileCount, csvCell(row.files.join(' | '))].join(','));
}

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'frequency.csv'), `${csv.join('\n')}\n`, 'utf8');
writeFileSync(
  resolve(outDir, 'strings-index.json'),
  `${JSON.stringify(Object.fromEntries([...index.entries()]), null, 2)}\n`,
  'utf8',
);

const unique = rows.length;
const repeated = rows.filter((r) => r.occurrences >= 3);
console.log(`Parsed ${issues} issue lines -> ${unique} unique strings`);
console.log(`Strings appearing >= 3 times: ${repeated.length}`);
console.log(`Top 10:`);
for (const row of rows.slice(0, 10)) {
  console.log(`  ${String(row.occurrences).padStart(4)}  ${row.value.slice(0, 70)}`);
}
