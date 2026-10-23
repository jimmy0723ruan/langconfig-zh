# 覆盖率报告（P1–P10 完成）

数据来源：`app/` 分支 `feat/i18n`，`npx i18next-cli lint` 实测（`report/lint-final.txt`）。

## 一、总体

| 指标 | 数值 |
| --- | --- |
| 基线硬编码（源项目 `eb786cf`） | 2856 条 / 125 文件 |
| P5 结束时剩余 | 604 条 |
| 当前剩余 | **373 条** |
| 已消除 | 2483 条（**86.9%**） |
| 语言包条目 | **2131 条**（en.json 2258，含未翻译白名单 key） |
| 后端错误映射 | 77 条精确 + 18 条正则模板 |
| 改动文件 | **136 个** |

## 二、剩余 373 条的构成

| 类别 | 数量级 | 说明 |
| --- | --- | --- |
| material-symbols 图标名 | ~280 | 翻译会破坏图标 |
| 教学长文残留 | 0 | P9 已全部本地化 |
| 模型标识（GPT-5.4 Mini、text-embedding-*） | ~30 | 白名单 |
| 代码示例占位符（`{variable}`、`{date}`） | ~20 | 白名单 |
| 技术常量（`2D`、`GB`、`ollama.ai`） | ~5 | 白名单 |

> 结论：**剩余条目中已无「按钮/标签/空状态/提示」类界面文案**。

## 三、按模块统计（剩余）

| 模块 | 剩余条数 |
| --- | --- |
| 工作流库 library | 150 |
| 智能体 agents | 53 |
| 工作流画布 canvas | 42 |
| 页面 pages | 26 |
| 知识库 knowledge | 23 |
| 设置 settings | 22 |
| 通用组件 components | 16 |
| 工具 tools | 13 |
| 其他 | 13 |
| 执行面板 execution | 9 |
| 对话 chat | 7 |
| Hermes | 4 |
| 记忆 memory | 3 |
| 技能 skills | 2 |
| 工作流对话框 ui | 1 |

## 四、P6 新增覆盖（本轮）

- 插值句改写为单一 key（`{{count}} items` 形式），共 **183 处**
- 类组件（ErrorBoundary）通过 `i18n.t()` 直接调用
- 无 hook 组件（ThinkingToast、SkillCard、ToolProgressIndicator、JsonPreviewComponent）补装 hook
- 常量数组标签（AGENTS/TOOLS）与 **74 处三元表达式字符串**（101 条新 key）

## 五、P7 后端错误映射

- `src/i18n/errorMap.ts`：
  - 77 条精确映射（`Workflow not found` → 工作流不存在）
  - 18 条正则模板（`Skill 'x' not found` → 技能「x」不存在）
- `src/lib/api-client.ts`：`handleError` 所有分支统一走 `translateApiMessage`
- 新增 `app:toast` 事件桥，API 错误会显示在应用的 Toast 组件中（此前仅写 console）
- 未命中清单：`report/p7-untranslated.md`（194 条唯一详情，126 条未精确命中，多为模板覆盖或低频内部消息）

## 六、故意不翻的白名单

### 6.1 品牌与技术标识

`LangConfig`、`LangChain`、`LangGraph`、`GitHub`、`Hermes`、`Ollama`、`LM Studio`、`vLLM`、
`OpenAI`、`Anthropic`、`Google`、`Gemini`、`Claude`、`GPT`、`Docker`、`React`、`Monaco`、`Tauri`

### 6.2 图标名

`expand_more`、`account_tree`、`deployed_code`、`psychology`、`auto_awesome`、`folder`、
`database`、`groups`、`folder_open`、`check`、`settings` 等（约 280 处）

### 6.3 HTTP 方法与 API 路径

`GET` / `POST` / `PUT` / `PATCH` / `DELETE`、`/2/tweets`、`/2/users/:id/mentions` 等

### 6.4 环境变量、命令与路径

`OPENAI_API_KEY`、`GEMINI_API_KEY`、`ollama pull llama3.2`、`http://localhost:11434`、
`C:\Users\...`、`text-embedding-3-*`

### 6.5 示例数据与占位符

`e.g. "employee ID"`、`{date}`、`{variable}`、`{"key": "value"}`、`sk-...`

### 6.6 教学长文（P9 已全部翻译）

- `LearnLangChainTab.tsx`、`BestPracticesTab.tsx`、`EmptyStateContent.tsx`、`LibraryContentPanel.tsx`
- 四个文件共 **366 个 `t()` key，缺译文 0 条**（详见第八节 P9）
- 仍保留英文的：代码块、示例命令、`material-symbols` 图标名、模型标识

### 6.7 数据（非文案）

- 智能体名称/描述、项目名、种子数据内容（见 `report/p8` 规划）
- 后端 API `detail` 中未映射的 126 条（`report/p7-untranslated.md`）

## 七、复核方式

```bash
cd app
npx i18next-cli lint              # 384 条
npm run typecheck && npm run build
node ../tools/verify-p0.mjs       # 语言链路 10 条
node ../tools/verify-p1.mjs       # 主流程 12 条
node ../tools/pseudo-localize.mjs # 伪本地化
```

## 八、P9 / P10 新增（本轮）

### P9 · 教学文档

- `LearnLangChainTab`、`BestPracticesTab`、`EmptyStateContent`、`LibraryContentPanel`
  四个文件 **0 条未翻译**（代码块除外）
- 24 个长段落按句拆分（JSX 结构不变），新增 291 条译文
- 11 个含 `&` 的标题手工包 `t()`（codemod 的 HTML 实体规则会跳过）

### P10 · 工程化

| 项 | 结果 |
| --- | --- |
| 10.1 类型安全 | `en.json` 2258 key + `src/i18n/i18next.d.ts`；拼错 key 编译期报错 |
| 10.2 术语检查 | `tools/check-glossary.mjs` → `report/glossary-conflicts.md`（79 条，按钮类 0 冲突） |
| 10.3 伪本地化复跑 | `report/pseudo-p6p7.md`（3 处溢出，均导航栏） |
| 10.4 首访自动中文 | 中文浏览器首访即中文；用户选择优先 |
| 10.5 覆盖率守门 | `tools/check-coverage.mjs`，阈值 450，当前 373 ✅ |
| 10.6 低频错误 | 新增 5 条安全相关映射（IP/签名/路径/续接任务） |
