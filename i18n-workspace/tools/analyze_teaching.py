#!/usr/bin/env python
"""Analyse t() keys in the four teaching files: how many are untranslated and
how many long paragraphs would need sentence splitting."""

import json
import re

FILES = [
    'src/features/workflows/library/LearnLangChainTab.tsx',
    'src/features/workflows/library/BestPracticesTab.tsx',
    'src/features/workflows/library/EmptyStateContent.tsx',
    'src/features/workflows/library/LibraryContentPanel.tsx',
]
CAT = 'src/i18n/locales/zh-CN.json'
# single- or double-quoted t('...') with no newlines or nested quotes
T_RE = re.compile(r"""\bt\(\s*(['"])((?:\\.|(?!\1).)*)\1""")

cat = json.load(open(CAT, encoding='utf-8'))
total = untranslated = long_paras = 0
per_file = {}

for path in FILES:
    s = open(path, encoding='utf-8').read()
    keys = [m.group(2) for m in T_RE.finditer(s)]
    uniq = sorted(set(keys))
    missing = [k for k in uniq if k not in cat]
    longs = [k for k in missing if len(k) > 100 and re.search(r'[.!?]\s+[A-Z]', k)]
    per_file[path] = (len(uniq), len(missing), len(longs))
    total += len(uniq)
    untranslated += len(missing)
    long_paras += len(longs)

for path, (t_all, t_missing, t_long) in per_file.items():
    print(f'{path.split("/")[-1]:32s} keys={t_all:4d} missing={t_missing:4d} long_paras={t_long:3d}')
print(f'\nTOTAL keys={total} missing={untranslated} long_paras={long_paras}')
