# LangConfig 中英切换与汉化 — 交付说明

## 一、交付物清单

| 文件 | 说明 |
| --- | --- |
| `i18n-mvp.patch` | 从 `eb786cf` 到 `feat/i18n` 的完整补丁（136 文件） |
| `APPLY.md` | 应用步骤、验证清单、回滚方法 |
| `README.md` | 本文件：变更摘要、覆盖范围、未覆盖清单、已知问题 |
| `zh-CN.json` | 最终语言包副本（2131 条） |

工作副本：`app/`（分支 `feat/i18n`）
工具：`tools/codemod.mjs`、`tools/frequency.mjs`、`tools/merge-zh.mjs`、
`tools/pseudo-localize.mjs`、`tools/verify-p0.mjs`、`tools/verify-p1.mjs`

## 二、变更摘要

1. **i18n 地基**
   - `i18next@26` + `react-i18next@17`
   - `src/i18n/index.ts`：初始化、语言持久化（`localStorage.langconfig.lang`）、
     `document.documentElement.lang` 同步、`changeAppLanguage()` 封装
   - `keySeparator: false` / `nsSeparator: false`，单一 `translation` 命名空间
2. **key 策略：英文原文即 key**
   - `en.json` 为空对象，英文界面直接回退到 key 本身
   - 漏翻不会出现 key 名或空白，只会显示英文
3. **接入点**
   - `main.tsx` 包 `<I18nextProvider>`
   - 设置 → 通用 → **第一块**新增「语言」下拉（English / 简体中文）
4. **文案改造**
   - 136 个文件，硬编码从 2856 降到 **373**（消除 86.9%）
   - 语言包 **2131 条**，按 `GLOSSARY.md` 术语翻译
5. **条件文案**
   - 74 处三元表达式内的字符串（`Edit/Create`、`Show/Hide`、`Enabled/Disabled`）
     也已接入 `t()`，共 101 条新 key
6. **工具链**
   - `tools/codemod.mjs`：基于 TypeScript Compiler API；默认输出 unified diff，
     `--write` 才落盘；幂等；自动补 `useTranslation` 导入与 hook；
     组件内已有 `t` 变量时自动改用 `i18nT` 别名
   - 跳过规则：含插值节点、material-symbols 图标、`<code>` 内容、
     URL/路径/命令/模型名、品牌名、纯符号、expression-body 组件

## 三、覆盖范围

| 模块 | 状态 |
| --- | --- |
| 顶部导航、首页、项目页、社区页 | ✅ 中文化 |
| 设置页 + 7 个设置面板 | ✅ 中文化 |
| 工作流库（列表、空状态、文件页、详情） | ✅ 中文化 |
| 画布工具栏、节点菜单、11 个对话框、节点配置 | ✅ 中文化 |
| 空间视图（3D） | ✅ 中文化 |
| 执行面板、结果/产物/文件页 | ✅ 中文化 |
| 智能体库、Agent/DeepAgent 构建器 | ✅ 中文化 |
| 知识库（文档、仓库、文件树） | ✅ 中文化 |
| 工具、技能、对话、记忆、Hermes | ✅ 中文化 |

## 四、未覆盖清单

| 范围 | 数量 | 原因 |
| --- | --- | --- |
| 图标名（`material-symbols`） | ~280 | 翻译会破坏图标 |
| 教学长文 | 0 | P9 已全部本地化 |
| 模型标识（GPT-5.4 Mini、text-embedding-*） | ~30 | 技术常量 |
| 代码示例占位符（`{variable}`、`{date}`） | ~20 | 示例 |
| 技术常量（`2D`、`GB`、`ollama.ai`） | ~5 | 技术常量 |
| 后端 `detail` 中未映射的 126 条 | 126 | 见 `report/p7-untranslated.md` |
| Monaco / React Flow 内部文案 | — | 第三方组件 |

## 五、已知问题

1. **工作流默认名 `Untitled Workflow`** 属数据值（会写入后端），未翻译。
2. **导航栏在超长文本下会横向滚动**：已加 `overflow-x-auto`；
   正常中文宽度下无可见影响，伪本地化（+40%）时出现滚动条。
3. **英文侧文案无法单独润色**：en.json 为空，英文完全由源码决定（有意的取舍）。
4. **仅验证 Chromium**：Playwright 1.63 headless Chromium。
5. **后端限流**：验收脚本连续运行时可能触发 60 req/min 限制，脚本已内置重试。

## 六、验收结果

| 验收项 | 结果 |
| --- | --- |
| 设置页切换中英、刷新保持 | ✅ `tools/verify-p0.mjs` 10/10 |
| 主流程中文（首页→项目→新建工作流→画布工具栏→设置） | ✅ `tools/verify-p1.mjs` 12/12 |
| `npm run typecheck` | ✅ 通过 |
| `npm run build` | ✅ 通过（含 check-build） |
| 控制台无 i18n 警告 | ✅ |
| 伪本地化 | ✅ 3 处溢出（均导航栏，已处理为可滚动） |
| 智能体/工具/知识库/工作流库页面中文 | ✅ 截图核对（`assets/p6-*.png`） |
| 三类后端错误显示中文 | ✅ 404 / 422 / 500（`assets/p7-*.png`） |
| `i18next-cli lint` 剩余 | ✅ 373 ≤ 450（守门脚本） |
| 首访自动中文 | ✅ 中文浏览器直接中文，用户选择优先 |
| 教学文档 100% 中文 | ✅ 四个文件 0 条未译 |

截图：`assets/p0-*.png`、`assets/p1-*.png`、`assets/p5-*.png`、`assets/pseudo/*.png`

## 七、内容与工程化（P9 / P10）

**P9 教学文档**：`LearnLangChainTab`、`BestPracticesTab`、`EmptyStateContent`、
`LibraryContentPanel` 四个文件已 100% 中文化（代码块除外），长段落按句拆分。

**P10 工程化**：

| 能力 | 位置 |
| --- | --- |
| 类型化 key（拼错即编译失败） | `src/i18n/i18next.d.ts` + `en.json`（2258 key） |
| 首访自动中文 | `src/i18n/index.ts` → `detectBrowserLanguage()` |
| 术语一致性检查 | `tools/check-glossary.mjs` → `report/glossary-conflicts.md` |
| 覆盖率守门（阈值 450） | `tools/check-coverage.mjs` |
| 伪本地化复跑 | `report/pseudo-p6p7.md` |

## 八、后端错误映射（P7）

- `src/i18n/errorMap.ts`：77 条精确映射 + 18 条正则模板
- `api-client.handleError` 统一转换；英文界面下保持原文
- API 错误通过 `app:toast` 事件进入应用内 Toast

## 九、后续建议

1. 把 `report/manual.md` 里的插值句改为带占位符的 key（约 180 处）
2. 评估是否翻译教学长文（`LearnLangChainTab`、`BestPracticesTab`）
3. 增加 `i18next.d.ts` 类型化 key，在编译期发现拼写错误
4. 引入 Weblate 做多人协作与术语强制
5. 每次 `git pull` 后跑 `npx i18next-cli lint`，只补新增
