#!/usr/bin/env node
/**
 * check-glossary.mjs — verify that GLOSSARY.md terms are used consistently.
 *
 * For every term in the glossary (English -> Chinese), find catalog entries
 * whose English key contains the term and check the translation actually uses
 * the agreed Chinese wording. Reports mismatches for human review.
 *
 * Usage: node tools/check-glossary.mjs [--md]   (--md writes report/glossary-conflicts.md)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
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
const glossaryPath = existsSync(resolve(root, 'GLOSSARY.md'))
  ? resolve(root, 'GLOSSARY.md')
  : resolve(root, 'i18n-workspace/GLOSSARY.md');
const catalogPath = resolve(appDir, 'src/i18n/locales/zh-CN.json');
const reportPath = resolve(root, 'report/glossary-conflicts.md');

const markdown = readFileSync(glossaryPath, 'utf8');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));

// Terms that are expected to stay in English even when the key contains them.
const ALLOW_ENGLISH = new Set([
  'Deep Agent',
  'Deep Agents',
  'LangChain',
  'LangGraph',
  'Webhook',
  'Token',
]);

const terms = [];
for (const line of markdown.split(/\r?\n/)) {
  const m = line.match(/^\|\s*([A-Za-z][^|]*?)\s*\|\s*([^|]+?)\s*\|/);
  if (!m) continue;
  const en = m[1].trim();
  const zh = m[2].trim();
  if (!en || /^-+$/.test(en) || en === '英文' || en === 'English') continue;
  if (!zh || zh === '中文') continue;
  if (ALLOW_ENGLISH.has(en)) continue;
  terms.push({ en, zh });
}

const conflicts = [];
for (const { en, zh } of terms) {
  const wordRe = new RegExp(`(^|[^A-Za-z])${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Za-z]|$)`, 'i');
  for (const [key, value] of Object.entries(catalog)) {
    if (!wordRe.test(key)) continue;
    if (value.includes(zh)) continue;
    // Skip values that intentionally keep the term in English.
    if (value.includes(en)) continue;
    conflicts.push({ term: en, expected: zh, key, value });
  }
}

const byTerm = new Map();
for (const c of conflicts) {
  if (!byTerm.has(c.term)) byTerm.set(c.term, []);
  byTerm.get(c.term).push(c);
}

const lines = [];
lines.push('# 术语一致性检查\n');
lines.push('> 由 `tools/check-glossary.mjs` 生成：对照 `GLOSSARY.md` 检查 `zh-CN.json`。');
lines.push('> 命中不代表错误——可能是术语在上下文中另有含义，请人工裁决。\n');
lines.push('## 概览\n');
lines.push('| 指标 | 数值 |');
lines.push('| --- | --- |');
lines.push(`| 术语表条目 | ${terms.length} |`);
lines.push(`| 疑似不一致 | ${conflicts.length} |`);
lines.push(`| 涉及术语 | ${byTerm.size} |`);
lines.push('');
lines.push('## 明细\n');
lines.push('| 术语 | 期望译法 | 英文原文 | 当前译文 |');
lines.push('| --- | --- | --- | --- |');
for (const c of conflicts.slice(0, 200)) {
  const esc = (v) => v.replace(/\|/g, '\\|').slice(0, 90);
  lines.push(`| ${c.term} | ${c.expected} | ${esc(c.key)} | ${esc(c.value)} |`);
}
if (conflicts.length > 200) lines.push(`\n（共 ${conflicts.length} 条，仅列前 200 条）`);
lines.push('');
lines.push('## 处理建议\n');
lines.push('1. 全是同一术语的多处偏差 → 批量替换并复查；');
lines.push('2. 若属语境差异（如产品名），在 `GLOSSARY.md` 追加例外；');
lines.push('3. 修订后重跑本脚本确认归零或收敛。');

mkdirSync(resolve(root, 'report'), { recursive: true });
// ensure report dir exists even in the published layout
mkdirSync(resolve(dirname(reportPath)), { recursive: true });
writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf8');

console.log(`glossary terms: ${terms.length}`);
console.log(`conflicts     : ${conflicts.length} across ${byTerm.size} terms`);
for (const [term, items] of [...byTerm.entries()].slice(0, 8)) {
  console.log(`  ${term} -> ${items[0].expected}  (${items.length} entries)`);
}
console.log('report written to report/glossary-conflicts.md');
