#!/usr/bin/env python
"""Build report/p7-untranslated.md by comparing backend details with errorMap."""

import collections
import os
import re
import subprocess

WORKSPACE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND = r"D:\deepseek ojbect\projectA\langconfig\backend"
ERROR_MAP = os.path.join(WORKSPACE, "app", "src", "i18n", "errorMap.ts")
OUT = os.path.join(WORKSPACE, "report", "p7-untranslated.md")

# 1. read mapped exact keys from errorMap.ts
mapped = set()
with open(ERROR_MAP, encoding="utf-8") as fh:
    for line in fh:
        m = re.match(r"\s*'((?:[^'\\]|\\.)*)':", line)
        if m:
            mapped.add(m.group(1).replace("\\'", "'"))

pattern_count = 0
with open(ERROR_MAP, encoding="utf-8") as fh:
    pattern_count = len(re.findall(r"pattern: /", fh.read()))

# 2. collect backend details (walk the tree; avoids shell/encoding issues)
raw = []
for dirpath, _dirnames, filenames in os.walk(BACKEND):
    for name in filenames:
        if not name.endswith(".py"):
            continue
        try:
            text = open(os.path.join(dirpath, name), encoding="utf-8", errors="replace").read()
        except OSError:
            continue
        raw.extend(re.findall(r'detail=(f?"[^"]+")', text))

counter = collections.Counter()
for line in raw:
    value = line.strip()
    if value.startswith('f"'):
        value = value[2:-1]
    elif value.startswith('"'):
        value = value[1:-1]
    counter[value] += 1

total = sum(counter.values())
unique = len(counter)
exact_hit = sum(1 for msg in counter if msg in mapped)
unmapped = [(msg, n) for msg, n in counter.most_common() if msg not in mapped]

report = []
report.append("# P7 未映射的后端错误消息\n")
report.append("> 由 `tools/p7report.py` 生成：对比 backend 的 `detail=` 与 `app/src/i18n/errorMap.ts`。\n")
report.append("## 概览\n")
report.append("| 指标 | 数值 |")
report.append("| --- | --- |")
report.append(f"| 后端 detail 出现次数 | {total} |")
report.append(f"| 去重后的唯一消息 | {unique} |")
report.append(f"| errorMap 精确映射条目 | {len(mapped)} |")
report.append(f"| errorMap 正则模板 | {pattern_count} |")
report.append(f"| 唯一消息中精确命中 | {exact_hit} |")
report.append(f"| 未精确命中的唯一消息 | {len(unmapped)} |")
report.append("")
report.append("> 说明：带变量的消息大多已被 `PATTERNS` 里的正则覆盖（如 `Skill 'x' not found`），")
report.append("> 本表按「精确匹配」统计，因此模板类消息仍会出现在下方清单中，属正常现象。\n")
report.append("## 未精确命中的消息（按出现次数排序）\n")
report.append("| 次数 | 消息 | 建议 |")
report.append("| --- | --- | --- |")
for msg, n in unmapped[:120]:
    suggestion = "模板正则覆盖" if ("{" in msg or "'" in msg) else "待补"
    safe = msg.replace("|", "\\|")
    report.append(f"| {n} | `{safe}` | {suggestion} |")
if len(unmapped) > 120:
    report.append(f"\n（共 {len(unmapped)} 条，仅列前 120 条）")

with open(OUT, "w", encoding="utf-8") as fh:
    fh.write("\n".join(report) + "\n")

print(f"total={total} unique={unique} exact_hit={exact_hit} unmapped={len(unmapped)}")
print("written", OUT)
