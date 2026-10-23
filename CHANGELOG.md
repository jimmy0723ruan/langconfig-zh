# 更新日志

本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。版本号格式 `v<上游>-zh.<修订>`。

## [Unreleased]

## [v0.1.0-zh.1] — 2026-10-23

首个中文版发布。基于上游 `eb786cf`（2026-10-01）。

### 新增

- **中英切换**：设置 → 通用 → 语言，写入 `localStorage.langconfig.lang`，
  刷新保持；同步更新 `<html lang>`
- **首访自动中文**：`navigator.language` 以 `zh` 开头时首次访问即为中文，
  用户手动选择优先
- **完整中文界面**：导航、首页、项目、工作流画布、节点配置、执行面板、
  智能体、知识库、工具、技能、对话、记忆、Hermes
- **教学文档中文化**：`LearnLangChainTab`、`BestPracticesTab`、`EmptyStateContent`、
  `LibraryContentPanel` 四个页面
- **后端错误映射**：77 条精确映射 + 18 条正则模板，覆盖 404/422/429/5xx 常见消息
- **应用内错误提示**：API 错误通过 `app:toast` 事件显示为 Toast（此前只写控制台）
- **类型化 i18n key**：`src/i18n/i18next.d.ts` + 完整 `en.json`，拼错 key 编译期报错

### 修复

- `backend/run_local.py`：新增跨平台启动入口，解决 Windows 上
  `reload` 反复重启、psycopg 与 ProactorEventLoop 冲突、`NO_PROXY` 中 `[::1]`
  导致 httpx 报 `InvalidURL` 三个问题
- `backend/main.py`：`reload` 改为环境变量控制（`LANGCONFIG_RELOAD=1`），默认关闭
- 顶部导航在超长译名下溢出 → 加 `overflow-x-auto`
- 接口重复请求导致的 429：Toast 去重、可用模型请求共享缓存（本地限流放宽到 300 次/分）

### 数据

- DeepAgent 模板的名称与描述已中文化（`backend/core/templates/deep_agent.py` 及
  数据库 `deep_agent_templates` 表 7 条记录）；`system_prompt` 保持英文

### 工程

- `i18n-workspace/tools/`：codemod（TS Compiler API）、语言包合并、
  术语一致性检查、覆盖率守门、伪本地化、Playwright 验收脚本
- `i18n-workspace/report/`：覆盖率、决策记录、进度、扫描数据
- `i18n-workspace/deliverables/`：补丁、应用指南、语言包副本

### 已知问题

- 工作流默认名 `Untitled Workflow` 属数据值，未翻译
- 约 126 条低频后端错误未映射，仍显示英文（清单见
  `i18n-workspace/report/p7-untranslated.md`）
- 仅验证 Chromium（Playwright 1.63）
