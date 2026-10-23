#!/usr/bin/env python
"""Print remaining actionable hardcoded strings with their source line."""

import re
import sys

BACKSLASH = chr(92)
lint_file = sys.argv[1] if len(sys.argv) > 1 else 'report/lint-p6.txt'
root = sys.argv[2] if len(sys.argv) > 2 else 'app'

ICON = re.compile(r'^[a-z0-9_]+$')
SYMBOL = re.compile(r'^[^A-Za-z]{0,3}$')

entries = []
cur = None
with open(lint_file, encoding='utf-8') as fh:
    for line in fh.read().splitlines():
        m = re.match(r'^(\S.*\.tsx?)$', line)
        if m:
            cur = m.group(1).replace(BACKSLASH, '/')
            continue
        m = re.match(r'^\s*(\d+): Error: Found hardcoded string: "(.*)"\s*$', line)
        if m and cur:
            entries.append((cur, int(m.group(1)), m.group(2)))

skip = 0
for path, lineno, text in entries:
    if ICON.match(text) or SYMBOL.match(text):
        skip += 1
        continue
    try:
        with open(f"{root}/{path}", encoding='utf-8') as fh:
            lines = fh.read().splitlines()
        src = lines[lineno - 1].strip() if lineno <= len(lines) else ''
    except OSError:
        src = '<missing>'
    print(f'{path}:{lineno}')
    print(f'    STR: {text}')
    print(f'    SRC: {src[:160]}')
print(f'\n--- total {len(entries)}, skipped icon/symbol {skip}, shown {len(entries) - skip}')
