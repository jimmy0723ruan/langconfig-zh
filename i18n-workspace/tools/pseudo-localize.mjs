#!/usr/bin/env node
/**
 * Pseudo-localization sweep (PLAN §5.1).
 *
 * Temporarily replaces every zh-CN value with an expanded pseudo string
 * (≈ +40% length, wrapped in markers), visits the main flow with Playwright,
 * collects truncation issues and suspicious English leftovers, then restores
 * the catalog.
 *
 * Usage: node tools/pseudo-localize.mjs [baseUrl]
 */

import { copyFileSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appRequire = createRequire(resolve(workspaceRoot, 'app', 'package.json'));
const { chromium } = appRequire('@playwright/test');

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const outFile = outIdx >= 0 ? args[outIdx + 1] : 'report/pseudo-issues.md';
const positional = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out');
const baseUrl = positional[0] ?? 'http://localhost:1426';
const catalogPath = resolve(workspaceRoot, 'app/src/i18n/locales/zh-CN.json');
const backupPath = resolve(workspaceRoot, 'report/zh-CN.backup.json');
const assetsDir = resolve(workspaceRoot, 'assets/pseudo');
mkdirSync(assetsDir, { recursive: true });

/** Latin brand/technical words that are allowed to stay in English. */
const KEEP = new Set([
  'LangConfig', 'LangChain', 'LangGraph', 'LangSmith', 'Hermes', 'Studio', 'Spatial', 'OpenAI',
  'Anthropic', 'Google', 'Gemini', 'Claude', 'Ollama', 'Docker', 'React', 'Monaco', 'GitHub',
  'API', 'RAG', 'JSON', 'URL', 'PDF', 'ZIP', 'HTML', 'JS', 'CSS', 'SSE', 'HITL', 'PII',
  'Token', 'Tokens', 'Webhook', 'Cron', 'Python', 'FastAPI', 'PostgreSQL', 'pgvector', 'Tauri',
  'Demo', 'MIT', 'Alpha', 'GPT', 'LLM', 'CLI', 'UI', 'ID', 'HTTP', 'HTTPS', 'Postgres',
]);

function pseudo(value) {
  // Expand to ~140% of the original length using block characters, keeping
  // start/end markers so unterminated strings stand out.
  const target = Math.max(4, Math.ceil([...value].length * 0.4));
  const padding = '·'.repeat(target);
  return `⟦${value}${padding}⟧`;
}

const original = JSON.parse(readFileSync(catalogPath, 'utf8'));
if (backupPath && !process.env.PSEUDO_NO_BACKUP) {
  try {
    copyFileSync(backupPath, `${backupPath}.tmp`);
  } catch {
    /* first run */
  }
}
copyFileSync(catalogPath, backupPath);

const pseudoCatalog = Object.fromEntries(Object.entries(original).map(([k, v]) => [k, pseudo(v)]));
writeFileSync(catalogPath, `${JSON.stringify(pseudoCatalog, null, 2)}\n`, 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
const consoleIssues = [];
page.on('pageerror', (e) => consoleIssues.push(e.message));

const overflow = [];
const english = new Set();

async function visit(path, name, wait = 2500) {
  await page.goto(`${baseUrl}/#${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: resolve(assetsDir, `${name}.png`) });

  const found = await page.$$eval('*', (els) =>
    els
      .filter((e) => e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 && !e.classList.contains('sr-only'))
      .map((e) => ({
        tag: e.tagName.toLowerCase(),
        text: (e.textContent ?? '').trim().slice(0, 60),
        scroll: e.scrollWidth,
        client: e.clientWidth,
      })),
  );
  for (const item of found) {
    if (item.text) overflow.push({ page: name, ...item });
  }

  const text = await page.locator('body').innerText();
  for (const word of text.match(/[A-Za-z][A-Za-z'-]{3,}/g) ?? []) {
    if (KEEP.has(word)) continue;
    if (/^[A-Z][a-z]+$/.test(word) && word.length < 4) continue;
    english.add(word);
  }
}

try {
  // Set the language via localStorage to avoid a slow settings render.
  await page.goto(`${baseUrl}/#/home`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.setItem('langconfig.lang', 'zh-CN'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1200);

  await visit('/home', 'home');
  await visit('/studio', 'studio', 3500);
  await visit('/settings', 'settings', 2000);
} finally {
  await browser.close();
  copyFileSync(backupPath, catalogPath);
  try {
    unlinkSync(backupPath);
  } catch {
    /* ignore */
  }
}

const report = [];
report.push('# 伪本地化问题报告', '');
report.push(`生成时间：本轮 P1 检查`, '');
report.push('## 溢出 / 截断', '');
if (!overflow.length) {
  report.push('未发现 `scrollWidth > clientWidth` 的元素。');
} else {
  report.push('| 页面 | 元素 | 文本 | scrollWidth | clientWidth |');
  report.push('| --- | --- | --- | --- | --- |');
  for (const item of overflow.slice(0, 40)) {
    report.push(`| ${item.page} | ${item.tag} | ${item.text.replace(/\|/g, '\\|')} | ${item.scroll} | ${item.client} |`);
  }
  if (overflow.length > 40) report.push(`\n（共 ${overflow.length} 条，仅列前 40 条）`);
}
report.push('', '## 仍为英文的文本（可能漏网）', '');
const englishList = [...english].sort();
if (!englishList.length) {
  report.push('未发现可疑英文残留。');
} else {
  report.push(englishList.map((w) => `- ${w}`).join('\n'));
  report.push('', '> 说明：品牌名、模型名、项目名、示例数据也会出现在此列表中，需人工判断。');
}
report.push('', '## 控制台错误', '');
report.push(consoleIssues.length ? consoleIssues.map((c) => `- ${c}`).join('\n') : '无');

writeFileSync(resolve(workspaceRoot, 'report/pseudo-issues.md'), `${report.join('\n')}\n`, 'utf8');

console.log(`overflow issues : ${overflow.length}`);
console.log(`english candidates : ${english.size}`);
console.log('report written to', outFile);
