#!/usr/bin/env python
"""Print hardcoded strings for given source files (path-filtered)."""

import re
import sys

BACKSLASH = chr(92)
lint_file = 'report/lint-final.txt'
root = 'app'

wanted = set(sys.argv[1:])
cur = None
out = []
with open(lint_file, encoding='utf-8') as fh:
    for line in fh.read().splitlines():
        m = re.match(r'^(\S.*\.tsx?)$', line)
        if m:
            cur = m.group(1).replace(BACKSLASH, '/')
            continue
        m = re.match(r'^\s*(\d+): Error: Found hardcoded string: "(.*)"\s*$', line)
        if m and cur and any(w in cur for w in wanted):
            out.append((cur, int(m.group(1)), m.group(2)))

for path, lineno, text in out:
    print(f'{path}:{lineno}  {text.encode("ascii", "backslashreplace").decode()}')

print(f'\n--- {len(out)} strings in {len({p for p, _, _ in out})} files')
