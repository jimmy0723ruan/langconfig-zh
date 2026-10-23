#!/usr/bin/env node
/**
 * P1 acceptance check — PLAN §12 main-flow checklist.
 *
 * Usage: node tools/verify-p1.mjs [baseUrl]
 */

import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const appRequire = createRequire(resolve(workspaceRoot, 'app', 'package.json'));
const { chromium } = appRequire('@playwright/test');

const baseUrl = process.argv[2] ?? 'http://localhost:1426';
const assetsDir = resolve(workspaceRoot, 'assets');
mkdirSync(assetsDir, { recursive: true });

const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok, extra });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`);
};

const browser = await chromium.launch();
// Pin the browser locale so first-visit detection does not leak in.
const page = await browser.newPage({ viewport: { width: 1600, height: 950 }, locale: 'en-US' });

const consoleIssues = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') consoleIssues.push(`${m.type()}: ${m.text()}`);
});
page.on('pageerror', (e) => consoleIssues.push(`pageerror: ${e.message}`));

const body = () => page.locator('body').innerText();

async function goto(path, wait = 1500) {
  await page.goto(`${baseUrl}/#${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(wait);
}

async function openSettings() {
  // Settings view waits on several backend calls; the dev backend rate-limits
  // at 60 req/min, so retry a few times with a pause between attempts.
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    await goto('/settings', 500);
    // A hard reload clears any dialog/state left by earlier steps and avoids
    // stale SettingsView instances.
    await page.reload({ waitUntil: 'domcontentloaded' });
    try {
      await page.waitForSelector('select', { timeout: 15000 });
      return;
    } catch {
      if (attempt === 5) throw new Error('settings page never rendered the language selector');
      await page.waitForTimeout(20000 * attempt);
    }
  }
}

async function setLanguage(lang) {
  await openSettings();
  await page.locator('select').first().selectOption(lang);
  await page.waitForTimeout(600);
}

// ---------- 1. English baseline ----------
await page.goto(`${baseUrl}/#/home`, { waitUntil: 'domcontentloaded' });
await page.evaluate(() => localStorage.removeItem('langconfig.lang'));
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForSelector('text=LangConfig Studio', { timeout: 20000 });
let text = await body();
check('1. home loads in English by default', text.includes('Create Project') && text.includes('Studio'));

// ---------- 2. Switch to Chinese ----------
await setLanguage('zh-CN');
await goto('/home');
text = await body();
check('2. home copy switches to Chinese', text.includes('新建项目') && text.includes('工作台'));
await page.screenshot({ path: resolve(assetsDir, 'p1-home-zh.png') });

// ---------- 3. Project list / open dialog ----------
await page.getByText('打开项目', { exact: true }).first().click();
await page.waitForTimeout(600);
text = await body();
check(
  '3. open-project dialog translated',
  text.includes('没有找到项目') || text.includes('LangConfig Demo'),
  text.includes('Close') ? 'has English Close' : 'ok',
);
const closeBtn = page.getByRole('button', { name: '关闭' });
check('3b. dialog close button in Chinese', (await closeBtn.count()) > 0);
await closeBtn.first().click();
await page.waitForTimeout(400);

// ---------- 4. Workflow canvas toolbar ----------
await goto('/studio', 3500);
text = await body();
const toolbarChecks = ['保存', '工作台', '对话', '结果', '文件', '产物', '设置'];
const missingToolbar = toolbarChecks.filter((w) => !text.includes(w));
check('4. canvas toolbar in Chinese', missingToolbar.length === 0, missingToolbar.join(', ') || 'all present');
await page.screenshot({ path: resolve(assetsDir, 'p1-studio-zh.png') });

// ---------- 5. New workflow dialog ----------
const nameBtn = page.locator('button', { hasText: 'Untitled Workflow' }).first();
if (await nameBtn.count()) {
  await nameBtn.click();
  await page.waitForTimeout(500);
  const createBtn = page.getByRole('button', { name: '新建工作流' });
  if (await createBtn.count()) {
    await createBtn.first().click();
    await page.waitForTimeout(600);
    text = await body();
    check('5. new-workflow dialog translated', text.includes('新建工作流') && text.includes('工作流名称'));
    await page.screenshot({ path: resolve(assetsDir, 'p1-new-workflow-zh.png') });
    await page.keyboard.press('Escape');
  } else {
    check('5. new-workflow dialog translated', false, 'create button not found');
  }
} else {
  check('5. new-workflow dialog translated', false, 'workflow dropdown not found');
}

// ---------- 6. Settings page ----------
await openSettings();
text = await body();
check(
  '6. settings categories in Chinese',
  ['通用', 'API 密钥与供应商', '模型默认值', '敏感信息配置', '本地模型', '本地工作区', '外观', '关于'].every((w) =>
    text.includes(w),
  ),
);
const hasLangSelect = (await page.locator('select').count()) > 0;
check('6b. language selector present', hasLangSelect);
await page.screenshot({ path: resolve(assetsDir, 'p1-settings-zh.png') });

// ---------- 7. Persistence ----------
await page.reload({ waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
const htmlLang = await page.evaluate(() => document.documentElement.lang);
text = await body();
check(
  '7. language persists after reload',
  htmlLang === 'zh-CN' && text.includes('工作台'),
  `html lang=${htmlLang}`,
);

// ---------- 8. Switch back to English ----------
await setLanguage('en');
await goto('/home');
text = await body();
const leftovers = ['新建项目', '打开项目', '工作台', '设置'].filter((w) => text.includes(w));
check('8. English restored without leftovers', text.includes('Create Project') && leftovers.length === 0, leftovers.join(', ') || 'clean');

const stored = await page.evaluate(() => localStorage.getItem('langconfig.lang'));
check('9. localStorage langconfig.lang = en', stored === 'en', String(stored));

const i18nWarnings = consoleIssues.filter((line) => /i18n|useTranslation|Missing key|Translation/i.test(line));
check('10. no i18n console warnings', i18nWarnings.length === 0, i18nWarnings.slice(0, 3).join(' | '));

await browser.close();

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (consoleIssues.length) {
  console.log('\nOther console issues (reference only):');
  for (const line of consoleIssues.slice(0, 8)) console.log(`  ${line.slice(0, 160)}`);
}
process.exit(failed.length ? 1 : 0);
