# 进度看板（断点恢复入口）

> 恢复工作前先读本文件，再读 `report/decisions.md`。
> 最后更新：P9 + P10 完成，交付物已重新生成。

## 已完成

### P0 · 地基（`1bc11c2`）

- clone `app/`、分支 `feat/i18n`、`i18next@26` + `react-i18next@17`
- `src/i18n/index.ts`（初始化 / 持久化 / `<html lang>` 同步）
- 设置页第一块「语言」下拉；`tools/verify-p0.mjs` 10/10

### P1 · MVP 主流程（`2cc4e30`、`fd3b515`、`e62143b`、`11934c0`）

- codemod 工具链、三批改造、语言包合并
- `tools/verify-p1.mjs` 12/12

### P2–P5 · 全站铺开（`5bab224`、`8a9d213`、`d9dd294`、`eeab4f2`、`0fc0755`）

- P2 节点配置/空间视图/执行面板（166 条）
- P3 智能体 + 知识库（406 条）
- P4 工具/技能/对话/记忆/Hermes（178 条）
- P5 别名兜底（`i18nT`）救回 14 个组件；导航溢出修复

### P6 · 前端剩余文案（`e03cb14`）

- 插值句改写为单一 key（183 处），如 `{t('Results {{count}}', { count })}`
- 类组件用 `i18n.t()`；4 个无 hook 组件补齐
- 硬编码 **604 → 384**（目标 ≤400 ✅）
- 74 处三元字符串补翻（101 条新 key），commit `3393814`

### P7 · 后端错误映射（`0895edc`）

- `src/i18n/errorMap.ts`：77 精确 + 18 模板
- `api-client.handleError` 全分支接入 `translateApiMessage`
- 新增 `app:toast` 事件桥：API 错误进入应用内 Toast（此前只写 console）
- `report/p7-untranslated.md` 记录未映射详情

### P9 · 教学文档本地化（`4ed6b1b`）

- 四个教学文件 0 条未翻译；24 个长段落按句拆分；291 条新译文

### P10 · 工程化（`508bed4`）

- 10.1 类型安全（en.json 2258 + i18next.d.ts）
- 10.2 术语检查脚本 → `report/glossary-conflicts.md`
- 10.3 伪本地化复跑 → `report/pseudo-p6p7.md`
- 10.4 首访按浏览器语言（中文浏览器直接中文）
- 10.5 覆盖率守门（阈值 450，当前 373）
- 10.6 补 5 条安全相关错误映射

## 进行中

无。

## 待办

- P8 已完成（2026-10-23）：7 个 DeepAgent 模板的 name/description 已中文化
  - 代码：`backend/core/templates/deep_agent.py`（commit `5287345`）
  - 数据：已 UPDATE 源项目数据库 `deep_agent_templates` 表 7 条
  - 原值备份：`report/p8-backup-original.csv`
  - **`system_prompt` 未翻译**（给 LLM 的指令，翻了会改变行为）
- 补 `report/p7-untranslated.md` 中的低频错误消息（按需）
- 术语冲突人工裁决（`report/glossary-conflicts.md` 中 sentence 类为语境差异，无需处理）

## 已知问题 / 决策

- 源项目只读：HEAD `eb786cf`、分支 `main`，未跟踪文件与开工前一致
- app 前端 1426（1425 被源项目占用）；后端复用源项目 8780
- 后端 60 req/min 限流：`verify-p1.mjs` 连续跑多次会 429；设置的页面检查已加硬刷新重试
- 剩余 373 条硬编码中约 99% 属白名单（图标、模型名、示例）
- 验收脚本已固定浏览器 locale，避免首访检测影响英文基线断言
- 429 错误现在也会以中文显示（映射生效的副作用）
