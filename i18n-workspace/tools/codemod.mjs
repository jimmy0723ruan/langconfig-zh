#!/usr/bin/env node
/**
 * codemod.mjs — wrap static English UI strings with t() using the TypeScript
 * Compiler API.
 *
 * Safety rules (PLAN §2.3):
 *   - JSX plain text nodes and whitelisted string-literal attributes only
 *   - skip anything containing interpolation / expressions
 *   - skip icon ligature text (material-symbols)
 *   - default output is a unified diff; nothing is written without --write
 *   - idempotent: strings already inside t(...) are skipped
 *
 * Usage (run from the app/ directory):
 *   node ../tools/codemod.mjs
 *   node ../tools/codemod.mjs --only list.txt
 *   node ../tools/codemod.mjs --write [--only list.txt]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, globSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve, relative } from 'node:path';

const argv = process.argv.slice(2);
const WRITE = argv.includes('--write');
const onlyIdx = argv.indexOf('--only');
const ONLY_FILE = onlyIdx >= 0 ? argv[onlyIdx + 1] : null;
const ROOT = process.cwd();

// TypeScript is resolved from the app workspace (this script lives in tools/).
const appRequire = createRequire(resolve(ROOT, 'package.json'));
const ts = appRequire('typescript');

const TEXT_ATTRS = new Set([
  'placeholder',
  'title',
  'label',
  'alt',
  'aria-label',
  'aria-description',
  'description',
  'tooltip',
]);

const SKIP_ATTRS = new Set(['className', 'id', 'key', 'role', 'type', 'name', 'style', 'href', 'src']);

/** Brand / provider / product names that stay in English. */
const KEEP_ENGLISH = new Set([
  'Ollama',
  'LM Studio',
  'vLLM',
  'LiteLLM',
  'OpenAI',
  'Anthropic',
  'Google',
  'Gemini',
  'Claude',
  'GPT',
  'GitHub',
  'LangChain',
  'LangGraph',
  'LangSmith',
  'LangConfig',
  'Hermes',
  'Docker',
  'React',
  'Monaco',
]);

/** Commands, URLs, domains, model ids — never translate. */
function looksTechnical(value) {
  if (KEEP_ENGLISH.has(value)) return true;
  if (value.includes('://')) return true;
  if (/^[a-z0-9._-]+\.[a-z]{2,}(\/\S*)?$/i.test(value)) return true; // domain
  if (/^[a-z0-9._-]+[:@][a-z0-9._/-]+$/i.test(value)) return true; // model:tag
  if (/^(ollama|pip|npm|npx|docker|git|curl|python|node|cd|ls|uv|uvx)\s/.test(value)) return true;
  if (/^(text-embedding|gpt-|claude-|gemini-)[\w.-]*/i.test(value)) return true;
  if (/^\.{0,2}\/?[\w.-]+(\/[\w.-]+)+$/.test(value)) return true; // paths
  if (/^https?/i.test(value)) return true;
  return false;
}

/** True when the node sits inside a <code> / <pre> / <kbd> element. */
function insideLiteral(node) {
  let cur = node.parent;
  while (cur) {
    if (ts.isJsxElement(cur) || ts.isJsxSelfClosingElement(cur) || ts.isJsxOpeningElement(cur)) {
      const opening = ts.isJsxElement(cur) ? cur.openingElement : cur;
      const tag = opening.tagName?.getText?.() ?? '';
      if (tag === 'code' || tag === 'pre' || tag === 'kbd') return true;
    }
    cur = cur.parent;
  }
  return false;
}

/** True when the node sits inside a material-symbols icon element. */
function insideIcon(node) {
  let cur = node.parent;
  while (cur) {
    if (ts.isJsxElement(cur) || ts.isJsxSelfClosingElement(cur) || ts.isJsxOpeningElement(cur)) {
      const opening = ts.isJsxElement(cur) ? cur.openingElement : cur;
      for (const attr of opening.attributes.properties) {
        if (!ts.isJsxAttribute(attr) || attr.name.getText() !== 'className') continue;
        const init = attr.initializer;
        const text = init ? (ts.isStringLiteral(init) ? init.text : init.getText()) : '';
        if (text.includes('material-symbols')) return true;
      }
    }
    cur = cur.parent;
  }
  return false;
}

/** True when the surrounding JSX element also renders an expression child. */
function hasSiblingExpression(node) {
  const parent = node.parent;
  if (!parent) return false;
  const children = parent.children;
  if (!children) return false;
  return children.some((child) => ts.isJsxExpression(child) && child.expression);
}

function findEnclosingComponent(node, components) {
  let cur = node.parent;
  while (cur) {
    const hit = components.find((c) => c.node === cur);
    if (hit) return hit;
    cur = cur.parent;
  }
  return null;
}

/**
 * Peel wrappers such as memo(...) / forwardRef(...) to reach the component
 * function literal, so `const Foo = memo(function Foo(props) {...})` is found.
 */
function unwrapComponentFunction(init) {
  let cur = init;
  let depth = 0;
  while (cur && depth < 5) {
    if (ts.isArrowFunction(cur) || ts.isFunctionExpression(cur)) return cur;
    if (ts.isCallExpression(cur) && cur.arguments.length) {
      const inner = cur.arguments.find(
        (arg) => ts.isArrowFunction(arg) || ts.isFunctionExpression(arg) || ts.isCallExpression(arg),
      );
      if (!inner) return null;
      cur = inner;
      depth += 1;
      continue;
    }
    if (ts.isParenthesizedExpression(cur)) {
      cur = cur.expression;
      continue;
    }
    return null;
  }
  return null;
}

function collectComponents(sf) {
  const components = [];
  const skipped = [];
  for (const stmt of sf.statements) {
    if (ts.isFunctionDeclaration(stmt) && stmt.name && /^[A-Z]/.test(stmt.name.text) && stmt.body) {
      components.push({ node: stmt, body: stmt.body, name: stmt.name.text, needHook: false, blocked: false });
      continue;
    }
    if (!ts.isVariableStatement(stmt)) continue;
    for (const decl of stmt.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || !/^[A-Z]/.test(decl.name.text)) continue;
      const fn = unwrapComponentFunction(decl.initializer);
      if (!fn) continue;
      if (ts.isBlock(fn.body)) {
        components.push({ node: fn, body: fn.body, name: decl.name.text, needHook: false, blocked: false });
      } else {
        skipped.push({ name: decl.name.text, reason: 'expression-body-component' });
      }
    }
  }
  return { components, skipped };
}

function walkFor(body, predicate) {
  let found = false;
  const visit = (node) => {
    if (found) return;
    if (predicate(node)) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  };
  visit(body);
  return found;
}

const hasUseTranslation = (body) =>
  walkFor(
    body,
    (n) => ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'useTranslation',
  );

const declaresT = (body, name = 't') =>
  walkFor(
    body,
    (n) =>
      (ts.isVariableDeclaration(n) || ts.isParameter(n)) && ts.isIdentifier(n.name) && n.name.text === name,
  ) ||
  walkFor(
    body,
    (n) =>
      (ts.isArrowFunction(n) || ts.isFunctionExpression(n)) &&
      n.parameters.some((param) => ts.isIdentifier(param.name) && param.name.text === name),
  );

function stringLiteral(value) {
  if (!value.includes("'")) {
    return `'${value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n')}'`;
  }
  return JSON.stringify(value);
}

function isTranslatableText(core) {
  if (!core) return { ok: false, reason: 'empty' };
  if (core.includes('\n')) return { ok: false, reason: 'multiline' };
  if (core.includes('&')) return { ok: false, reason: 'html-entity' };
  if (/^[\s\-–—•·*/|:;,.()[\]{}<>+=%$#@!?~`^"']+$/.test(core)) return { ok: false, reason: 'punctuation' };
  if (/^[a-z0-9_]+$/.test(core)) return { ok: false, reason: 'identifier-or-icon' };
  if (/^\d+([.,]\d+)?$/.test(core)) return { ok: false, reason: 'number' };
  if (!/[A-Za-z]{2,}/.test(core)) return { ok: false, reason: 'no-letters' };
  return { ok: true };
}

function collectFile(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const { components, skipped: skippedComponents } = collectComponents(sf);

  const edits = [];
  const stats = { text: 0, attr: 0, skipped: 0, reasons: {} };
  const keys = new Set();
  const skipNote = (reason) => {
    stats.skipped += 1;
    stats.reasons[reason] = (stats.reasons[reason] ?? 0) + 1;
  };

  const visit = (node) => {
    if (ts.isJsxText(node)) {
      const raw = node.getText(sf);
      const core = raw.trim();
      if (!core) return;
      if (insideIcon(node)) return skipNote('icon');
      if (insideLiteral(node)) return skipNote('code-literal');
      if (looksTechnical(core)) return skipNote('technical');
      // Interpolated sentences (`Total: {count}`) must be hand-written so the
      // whole sentence becomes one key with placeholders.
      if (hasSiblingExpression(node)) return skipNote('interpolation');
      const verdict = isTranslatableText(core);
      if (!verdict.ok) return skipNote(verdict.reason);
      const comp = findEnclosingComponent(node, components);
      if (!comp) return skipNote('no-component');
      comp.needHook = true;
      const lead = raw.match(/^\s*/)[0];
      const trail = raw.match(/\s*$/)[0];
      edits.push({
        start: node.getStart(sf),
        end: node.getEnd(),
        kind: 'text',
        core,
        lead,
        trail,
        comp,
      });
      keys.add(core);
      stats.text += 1;
      return;
    }

    if (ts.isJsxAttribute(node)) {
      const attrName = node.name.getText(sf);
      if (SKIP_ATTRS.has(attrName) || !TEXT_ATTRS.has(attrName)) return;
      const init = node.initializer;
      if (!init || !ts.isStringLiteral(init)) return;
      const value = init.text;
      if (insideIcon(node)) return skipNote('icon');
      if (insideLiteral(node)) return skipNote('code-literal');
      if (looksTechnical(value)) return skipNote('technical');
      const verdict = isTranslatableText(value);
      if (!verdict.ok) return skipNote(verdict.reason);
      const comp = findEnclosingComponent(node, components);
      if (!comp) return skipNote('no-component');
      comp.needHook = true;
      edits.push({
        start: init.getStart(sf),
        end: init.getEnd(),
        kind: 'attr',
        core: value,
        comp,
      });
      keys.add(value);
      stats.attr += 1;
      return;
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);

  // --- hook insertion ---
  // When a component already uses `t` as a local variable, fall back to an
  // alias so the component is still translated instead of being skipped.
  const ALIASES = ['i18nT', 'translate', 'tr'];
  const hookEdits = [];
  for (const comp of components) {
    if (!comp.needHook) continue;
    if (hasUseTranslation(comp.body)) {
      comp.alias = 't';
      continue;
    }
    let alias = 't';
    if (declaresT(comp.body)) {
      alias = ALIASES.find((candidate) => !declaresT(comp.body, candidate)) ?? null;
      if (!alias) {
        comp.blocked = true;
        skipNote('t-name-conflict');
        continue;
      }
      skipNote('t-name-conflict-aliased');
    }
    comp.alias = alias;
    const at = comp.body.getStart(sf) + 1;
    const hook = alias === 't' ? 'const { t } = useTranslation();' : `const { t: ${alias} } = useTranslation();`;
    hookEdits.push({ start: at, end: at, text: `\n  ${hook}` });
  }

  // Drop edits belonging to components that never received the hook.
  const blocked = new Set(components.filter((c) => c.blocked));
  const finalEdits = edits.filter((e) => !blocked.has(e.comp));

  // --- import insertion ---
  const importEdits = [];
  const anyHook = hookEdits.length > 0 || components.some((c) => c.needHook && !c.blocked);
  if (anyHook) {
    const alreadyImported = sf.statements.some(
      (s) =>
        ts.isImportDeclaration(s) &&
        s.moduleSpecifier.text === 'react-i18next' &&
        s.importClause?.namedBindings &&
        ts.isNamedImports(s.importClause.namedBindings) &&
        s.importClause.namedBindings.elements.some((el) => el.name.text === 'useTranslation'),
    );
    if (!alreadyImported) {
      const lastImport = [...sf.statements].reverse().find((s) => ts.isImportDeclaration(s));
      const at = lastImport ? lastImport.getEnd() : 0;
      importEdits.push({ start: at, end: at, text: `\nimport { useTranslation } from 'react-i18next';` });
    }
  }

  // Materialise edits now that every component knows its translation fn name.
  const materialized = finalEdits
    .filter((e) => e.comp.alias)
    .map((e) => {
      const call = `${e.comp.alias}(${stringLiteral(e.core)})`;
      return e.kind === 'attr'
        ? { start: e.start, end: e.end, text: `{${call}}` }
        : { start: e.start, end: e.end, text: `${e.lead}{${call}}${e.trail}` };
    });

  const allEdits = [...materialized, ...hookEdits, ...importEdits].sort((a, b) => b.start - a.start);
  if (!allEdits.length) return { filePath, changed: false, stats, keys: [...keys], skippedComponents };

  let out = source;
  for (const edit of allEdits) {
    out = out.slice(0, edit.start) + edit.text + out.slice(edit.end);
  }
  if (source.includes('\r\n')) {
    out = out.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
  }

  return { filePath, changed: true, before: source, after: out, stats, keys: [...keys], skippedComponents };
}

// ---------- unified diff ----------
function diffOps(a, b) {
  const A = a.split('\n');
  const B = b.split('\n');
  const n = A.length;
  const m = B.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      ops.push({ type: ' ', line: A[i] });
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ type: '-', line: A[i] });
      i += 1;
    } else {
      ops.push({ type: '+', line: B[j] });
      j += 1;
    }
  }
  while (i < n) ops.push({ type: '-', line: A[i++] });
  while (j < m) ops.push({ type: '+', line: B[j++] });
  return ops;
}

function unifiedDiff(relPath, before, after, context = 3) {
  const ops = diffOps(before, after);
  const changeIdx = ops.map((op, idx) => (op.type === ' ' ? -1 : idx)).filter((idx) => idx >= 0);
  if (!changeIdx.length) return '';

  const hunks = [];
  let start = changeIdx[0];
  let end = changeIdx[0];
  for (const idx of changeIdx.slice(1)) {
    if (idx - end <= context * 2) {
      end = idx;
    } else {
      hunks.push([start, end]);
      start = idx;
      end = idx;
    }
  }
  hunks.push([start, end]);

  const out = [`--- a/${relPath}`, `+++ b/${relPath}`];
  const oldAt = new Array(ops.length).fill(0);
  const newAt = new Array(ops.length).fill(0);
  let o = 1;
  let nw = 1;
  for (let k = 0; k < ops.length; k += 1) {
    oldAt[k] = o;
    newAt[k] = nw;
    if (ops[k].type === ' ') {
      o += 1;
      nw += 1;
    } else if (ops[k].type === '-') o += 1;
    else nw += 1;
  }

  for (const [s, e] of hunks) {
    const from = Math.max(0, s - context);
    const to = Math.min(ops.length - 1, e + context);
    let oldCount = 0;
    let newCount = 0;
    const body = [];
    for (let k = from; k <= to; k += 1) {
      const op = ops[k];
      body.push(`${op.type}${op.line}`);
      if (op.type === ' ' || op.type === '-') oldCount += 1;
      if (op.type === ' ' || op.type === '+') newCount += 1;
    }
    out.push(`@@ -${oldAt[from]},${oldCount} +${newAt[from]},${newCount} @@`);
    out.push(...body);
  }
  return out.join('\n');
}

// ---------- main ----------
function listFiles() {
  if (ONLY_FILE) {
    return readFileSync(resolve(ROOT, ONLY_FILE), 'utf8')
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => resolve(ROOT, l));
  }
  return globSync('src/**/*.tsx', { cwd: ROOT }).map((f) => resolve(ROOT, f));
}

const files = listFiles();
let changedFiles = 0;
let totalText = 0;
let totalAttr = 0;
let totalSkipped = 0;
const allKeys = new Set();
const reasonTotals = {};
const diffs = [];
const blockedList = [];

for (const file of files) {
  if (!existsSync(file)) continue;
  const result = collectFile(file);
  totalText += result.stats.text;
  totalAttr += result.stats.attr;
  totalSkipped += result.stats.skipped;
  for (const [k, v] of Object.entries(result.stats.reasons)) reasonTotals[k] = (reasonTotals[k] ?? 0) + v;
  for (const key of result.keys) allKeys.add(key);
  for (const s of result.skippedComponents ?? []) blockedList.push(`${relative(ROOT, file)} :: ${s.name} (${s.reason})`);

  if (!result.changed) continue;
  changedFiles += 1;
  const rel = relative(ROOT, file).replace(/\\/g, '/');
  if (WRITE) {
    writeFileSync(file, result.after, 'utf8');
  } else {
    const d = unifiedDiff(rel, result.before, result.after);
    if (d) diffs.push(d);
  }
}

mkdirSync(resolve(ROOT, '..', 'report'), { recursive: true });
if (!WRITE) process.stdout.write(`${diffs.join('\n')}\n`);
writeFileSync(
  resolve(ROOT, '..', 'report', WRITE ? 'codemod-keys-written.json' : 'codemod-keys-preview.json'),
  `${JSON.stringify([...allKeys].sort(), null, 2)}\n`,
  'utf8',
);

console.log('\n=== codemod summary ===');
console.log(`mode          : ${WRITE ? 'WRITE' : 'DRY-RUN (diff only)'}`);
console.log(`files scanned : ${files.length}`);
console.log(`files changed : ${changedFiles}`);
console.log(`jsx text      : ${totalText}`);
console.log(`attributes    : ${totalAttr}`);
console.log(`skipped       : ${totalSkipped}`);
console.log(`unique keys   : ${allKeys.size}`);
console.log('skip reasons  :', reasonTotals);
if (blockedList.length) {
  console.log(`unhandled     : ${blockedList.length} expression-body component(s)`);
  for (const line of blockedList.slice(0, 10)) console.log(`  ${line}`);
}
