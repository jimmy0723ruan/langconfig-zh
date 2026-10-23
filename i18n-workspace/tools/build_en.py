#!/usr/bin/env python
"""Regenerate app/src/i18n/locales/en.json from source keys + zh-CN keys.

Values equal their keys (English source strings are the keys), so the catalog
only exists to make i18next's TypeScript types aware of every valid key.
"""

import json
import pathlib
import re

BS = chr(92)  # backslash
T_RE = re.compile(r"\b(?:t|i18nT)\(\s*(['\"])((?:" + BS + BS + r".|(?!\1).)*)\1")


def js_unescape(value: str) -> str:
    out = []
    i = 0
    while i < len(value):
        if value[i] == BS and i + 1 < len(value):
            nxt = value[i + 1]
            out.append({'n': chr(10), 't': chr(9), 'r': chr(13)}.get(nxt, nxt))
            i += 2
        else:
            out.append(value[i])
            i += 1
    return ''.join(out)


app = pathlib.Path('app')
zh_path = app / 'src/i18n/locales/zh-CN.json'
en_path = app / 'src/i18n/locales/en.json'

keys = set()
for path in (app / 'src').rglob('*.tsx'):
    text = path.read_text(encoding='utf-8')
    for match in T_RE.finditer(text):
        keys.add(js_unescape(match.group(2)))

zh = json.load(open(zh_path, encoding='utf-8'))
keys |= set(zh)

en = {k: k for k in sorted(keys)}
en_path.write_text(json.dumps(en, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'en.json keys: {len(en)} (zh: {len(zh)})')
