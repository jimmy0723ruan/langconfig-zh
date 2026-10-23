import fs from 'node:fs';

const files = [
  'LearnLangChainTab', 'BestPracticesTab', 'EmptyStateContent', 'LibraryContentPanel',
].map((n) => `../app/src/features/workflows/library/${n}.tsx`);

const zh = JSON.parse(fs.readFileSync('../app/src/i18n/locales/zh-CN.json', 'utf8'));
const keys = new Set();
for (const f of files) {
  const src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\bt\(\s*["']([^"']{4,})["']/g)) keys.add(m[1]);
}
const missing = [...keys].filter((k) => !(k in zh));
console.log('四个文件中被 t() 包裹的 key:', keys.size);
console.log('其中语言包缺失:', missing.length);
console.log('\n缺失示例（前 10 条）:');
missing.slice(0, 10).forEach((k) => console.log('  -', k.slice(0, 90)));
