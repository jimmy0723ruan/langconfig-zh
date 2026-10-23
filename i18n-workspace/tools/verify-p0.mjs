#!/usr/bin/env node
/**
 * P0 acceptance check: language switch + persistence + fallback to English.
 *
 * Usage: node tools/verify-p0.mjs [baseUrl]
 * Requires the dev server to be running (default http://localhost:1426).
 */

import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
// Resolve playwright from the app workspace, not from tools/.
const appRequire = createRequire(resolve(workspaceRoot, 'app', 'package.json'));
const { chromium } = appRequire('@playwright/test');
const baseUrl = process.argv[2] ?? 'http://localhost:1426';
const assetsDir = resolve(workspaceRoot, 'assets');
mkdirSync(assetsDir, { recursive: true });

const results = [];
function check(name, ok, extra = '') {
  results.push({ name, ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`);
}

const browser = await chromium.launch();
// Pin the browser locale so first-visit detection does not leak in.
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, locale: 'en-US' });

const consoleIssues = [];
page.on('console', (msg) => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    consoleIssues.push(`${msg.type()}: ${msg.text()}`);
  }
});
page.on('pageerror', (err) => consoleIssues.push(`pageerror: ${err.message}`));

async function goHome() {
  await page.goto(`${baseUrl}/#/home`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=LangConfig Studio', { timeout: 20000 });
}

async function goSettings() {
  await page.goto(`${baseUrl}/#/settings`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('select', { timeout: 20000 });
}

// 1. Default (English) home
await goHome();
await page.screenshot({ path: resolve(assetsDir, 'p0-home-en.png') });
const enBody = await page.locator('body').innerText();
check('home defaults to English', enBody.includes('Create Project') && enBody.includes('Open Project'));

// 2. Switch to Chinese from settings
await goSettings();
const selects = page.locator('select');
const count = await selects.count();
check('settings has language select', count >= 1, `selects=${count}`);
await selects.first().selectOption('zh-CN');
await page.waitForTimeout(400);
const htmlLang = await page.evaluate(() => document.documentElement.lang);
check('document lang updated to zh-CN', htmlLang === 'zh-CN', htmlLang);
await page.screenshot({ path: resolve(assetsDir, 'p0-settings-zh.png') });

const settingsZh = await page.locator('body').innerText();
check('settings sidebar translated', settingsZh.includes('设置') && settingsZh.includes('通用'));

// 3. Home in Chinese
await goHome();
const zhBody = await page.locator('body').innerText();
await page.screenshot({ path: resolve(assetsDir, 'p0-home-zh.png') });
check('home shows Chinese copy', zhBody.includes('新建项目') && zhBody.includes('打开项目'), zhBody.split('\n').slice(0, 6).join(' / '));
check('home has no leftover English card titles', !zhBody.includes('Create Project'));

// 4. Persistence across reload
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForSelector('text=LangConfig Studio', { timeout: 20000 });
const reloadBody = await page.locator('body').innerText();
check('language persists after reload', reloadBody.includes('新建项目'));

// 5. Switch back to English
await goSettings();
await page.locator('select').first().selectOption('en');
await page.waitForTimeout(400);
await goHome();
const backEn = await page.locator('body').innerText();
check('switching back to English restores copy', backEn.includes('Create Project') && !backEn.includes('新建项目'));

const stored = await page.evaluate(() => localStorage.getItem('langconfig.lang'));
check('localStorage keeps langconfig.lang', stored === 'en', String(stored));

const i18nWarnings = consoleIssues.filter((line) => /i18n|useTranslation|Translation/i.test(line));
check('no i18n console warnings', i18nWarnings.length === 0, i18nWarnings.join(' | '));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (consoleIssues.length) {
  console.log('\nConsole issues seen (for reference):');
  for (const line of consoleIssues.slice(0, 10)) console.log(`  ${line}`);
}
process.exit(failed.length === 0 ? 0 : 1);
