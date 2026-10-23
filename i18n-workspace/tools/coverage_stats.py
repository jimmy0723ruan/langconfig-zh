#!/usr/bin/env python
"""Summarise the remaining hardcoded strings per module from a lint report."""

import collections
import re
import sys

BACKSLASH = chr(92)
lint_file = sys.argv[1] if len(sys.argv) > 1 else 'report/lint-final.txt'

per_file = collections.Counter()
cur = None
with open(lint_file, encoding='utf-8') as fh:
    for line in fh.read().splitlines():
        m = re.match(r'^(\S.*\.tsx?)$', line)
        if m:
            cur = m.group(1).replace(BACKSLASH, '/')
            continue
        if 'Found hardcoded string' in line and cur:
            per_file[cur] += 1

GROUPS = [
    ('src/pages', '页面'),
    ('src/components', '通用组件'),
    ('src/features/settings', '设置'),
    ('src/features/workflows/library', '工作流库'),
    ('src/features/workflows/canvas', '工作流画布'),
    ('src/features/workflows/ui', '工作流对话框'),
    ('src/features/workflows/execution', '执行面板'),
    ('src/features/agents', '智能体（P3）'),
    ('src/features/chat', '对话（P4）'),
    ('src/features/knowledge', '知识库（P3）'),
    ('src/features/skills', '技能（P4）'),
    ('src/features/memory', '记忆（P4）'),
    ('src/features/tools', '工具（P4）'),
    ('src/features/hermes', 'Hermes（P4）'),
]


def group_of(path):
    for prefix, name in GROUPS:
        if path.startswith(prefix):
            return name
    return '其他'


per_group = collections.Counter()
for path, count in per_file.items():
    per_group[group_of(path)] += count

print('total remaining:', sum(per_file.values()))
for name, count in per_group.most_common():
    print(f'{count:5d}  {name}')

p1_groups = {'页面', '通用组件', '设置', '工作流库', '工作流画布', '工作流对话框', '执行面板'}
p1 = {f: n for f, n in per_file.items() if group_of(f) in p1_groups}
print('\nP1 scope remaining:', sum(p1.values()), 'in', len(p1), 'files')
print('\ntop P1 files:')
for path, count in sorted(p1.items(), key=lambda item: -item[1])[:15]:
    print(f'{count:5d}  {path}')
