"""P8: 汉化 DeepAgent 模板的 name / description（不改 system_prompt）。

输出到 stdout，由 shell 写入目标文件（沙箱限制 Python 直接写 app 目录）。
"""

import pathlib
import sys

TARGET = pathlib.Path(__file__).resolve().parent.parent / "app" / "backend" / "core" / "templates" / "deep_agent.py"

PAIRS = [
    ("Deep Code Researcher", "深度代码研究员"),
    ("Deep Architect", "深度架构师"),
    ("Deep Debugger", "深度调试专家"),
    ("Deep Document Writer", "文档撰写专家"),
    ("Deep Test Engineer", "测试工程师"),
    ("Hermes Platform Builder", "Hermes 平台构建器"),
    ("Dynamic Workflow Agent", "动态工作流智能体"),
    (
        "Advanced code analysis with file exploration and subagent delegation",
        "具备文件探索与子智能体委派的深度代码分析",
    ),
    (
        "System design and architecture planning with specialized subagents",
        "借助专业子智能体完成系统设计与架构规划",
    ),
    (
        "Systematic debugging with hypothesis tracking and root cause analysis",
        "系统化调试：假设追踪与根因分析",
    ),
    (
        "Long-form technical documentation with research and examples",
        "长篇幅技术文档撰写，含调研与示例",
    ),
    (
        "Comprehensive test generation with coverage analysis",
        "全面的测试生成与覆盖率分析",
    ),
    (
        "LangConfig-native automation architect with approval-gated drafts and local Codex delegation",
        "LangConfig 原生自动化架构，支持审批把关的草稿与本地 Codex 委派",
    ),
    (
        "QuickJS eval-orchestrated DeepAgent for typed dynamic subagent fan-out and verification",
        "由 QuickJS 求值编排的 DeepAgent，用于带类型的动态子智能体分发与校验",
    ),
]


def main() -> int:
    if not TARGET.exists():
        print("target not found:", TARGET, file=sys.stderr)
        return 1
    s = TARGET.read_text(encoding="utf-8")
    changed = 0
    for old, new in PAIRS:
        needle = f'"{old}"'
        if needle in s:
            s = s.replace(needle, f'"{new}"')
            changed += 1
        else:
            print("skip (not found):", old[:50], file=sys.stderr)
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stdout.write(s)
    print(f"replaced: {changed}/{len(PAIRS)}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
