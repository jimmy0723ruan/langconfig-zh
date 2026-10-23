import fs from 'node:fs';

const files = ['LearnLangChainTab', 'BestPracticesTab', 'EmptyStateContent', 'LibraryContentPanel']
  .map((n) => `../app/src/features/workflows/library/${n}.tsx`);

const zh = JSON.parse(fs.readFileSync('../app/src/i18n/locales/zh-CN.json', 'utf8'));
const re = /\bt\(\s*"((?:[^"\\]|\\.)*)"|\bt\(\s*'((?:[^'\\]|\\.)*)'/g;

const missing = [];
let total = 0;

for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(re)) {
    const raw = m[1] ?? m[2] ?? '';
    if (raw.length < 4) continue;
    total += 1;
    const key = raw.replace(/\\"/g, '"').replace(/\\'/g, "'");
    if (!(key in zh)) missing.push({ file: f.split('/').pop(), key });
  }
}

console.log('完整 t() key 总数:', total, '| 缺译文:', missing.length);
missing.forEach((o, i) => console.log(`${i + 1}. [${o.file}] ${o.key.slice(0, 110)}`));

fs.writeFileSync(
  '../report/p9-missing-keys.md',
  ['# P9 未翻译的 key', '', `共 ${missing.length} 条（总 ${total}）`, '']
    .concat(missing.map((o, i) => `${i + 1}. \`${o.file}\`\n   > ${o.key}`))
    .join('\n') + '\n',
  'utf8',
);
