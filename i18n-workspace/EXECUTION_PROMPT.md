# 执行提示词（发给执行 Agent 的 Goal）

> 直接复制下面分隔线内的全部内容发送。

---

## 任务：为 LangConfig 实现中英切换 MVP

你的目标是在本工作区完成 LangConfig 前端的中英切换能力，交付一个**能日常使用的中文版**。
范围限定为 P0（地基）与 P1（MVP 可用），P2 及之后属于后续增量，本次不做。

### 第一步：先读这三个文件，再动手

1. `D:\cherry-work\langconfig汉化实施\README.md` —— 工作区约定
2. `D:\cherry-work\langconfig汉化实施\PLAN.md` —— 完整方案（重点看第 3、6、11、12、13 节）
3. `D:\cherry-work\langconfig汉化实施\GLOSSARY.md` —— 术语表

### 工作模式：长任务，一口气做完

这是一次**长时间自主执行**，不要做完一步就停下来请示。

- 目标是一次连贯完成 P0 → P1，直到满足"完成判定"四条。
- 用 TaskCreate 维护任务清单，完成后逐项打勾，便于随时看清进度。
- **不要**因为"要不要继续""这样行不行"而中断；自行判断并继续。
- **只有下面三种情况必须停下来问**：
  1. 发现某操作可能危及源项目（`D:\deepseek ojbect\projectA\langconfig`）；
  2. 验收项反复修复仍无法通过（至少尝试 2 种方案后）；
  3. 需要用户提供凭据、账号或外部资源。
- 其余情况一律自行决策，记入 `report/decisions.md` 后继续。

### 子代理使用（已授权）

你可以启动子代理（Agent 工具）协助，遵循以下规则：

**适合交给子代理的**：

- 只读扫描：并行统计不同模块的文案数量与频次
- 独立复核：对一批 codemod diff 做"是否误改"的二次检查
- 分片翻译：按模块切分翻译任务，各自产出 JSON 片段

**必须遵守**：

1. **同一文件同一时间只允许一个执行者写入**——子代理默认只读，写操作由主 agent 统一执行；
2. 子代理的产出必须由主 agent **复核后才能合入**，不得直接采信；
3. 子代理同样受"源项目只读"约束；
4. 子代理报告写进 `report/subagents/`，注明用途与结论摘要。

### 检查点与恢复（上下文被压缩也不怕）

- **每完成一个阶段提交一次**（`i18n(P0): ...`），这是天然的还原点；
- 每阶段结束更新 `report/progress.md`，固定四段：
  ```
  ## 已完成
  ## 进行中
  ## 待办
  ## 已知问题 / 决策
  ```
- 新开上下文或恢复工作时，**先读 `report/progress.md`** 再继续；
- 发现方向性错误时，直接回滚到上一个 commit 重来，不要试图在错误基础上修补。

### 硬性约束（违反即视为失败）

1. **所有工程文件必须放在 `D:\cherry-work\langconfig汉化实施` 内**——工作副本放 `app/`，
   脚本放 `tools/`，报告放 `report/`，交付物放 `deliverables/`。不得散落到桌面或其他目录。
2. **源项目 `D:\deepseek ojbect\projectA\langconfig` 只读**——禁止在原地改代码、切分支、跑改写脚本。
3. **改写工具先在 3 个文件上试跑**，确认 diff 质量后再全量。不要相信任何工具自带的 dry-run 开关。
4. **每个阶段结束提交一次**，commit message 用 `i18n(P0): ...` / `i18n(P1): ...`。
5. **不得删减或跳过验收项**（PLAN 第 12 节）。

### 执行步骤

**P0 · 地基（目标 0.5 天）**

1. `git clone "D:\deepseek ojbect\projectA\langconfig" app`，确认 `HEAD = eb786cf`，切分支 `feat/i18n`
2. `npm install` + `npm rebuild esbuild`
3. 装 `i18next` 与 `react-i18next`
4. 建 `src/i18n/index.ts` 与 `src/i18n/locales/zh-CN.json`
5. `main.tsx` 接入 Provider；设置页 general 分区第一块加「Language / 语言」下拉
6. 语言偏好存 localStorage（key：`langconfig.lang`），默认 `en`，切换时同步 `document.documentElement.lang`
7. 先只翻首页与设置页约 30 条，验证整条链路

**P0 验收**：切换中文 → 首页文字变化 → 刷新仍中文 → 切回英文正常。

**P1 · MVP 可用（目标 1–1.5 天）**

8. 用 `npx i18next-cli lint` 生成清单，统计每个字符串的出现频次，存 `report/frequency.csv`
9. 优先处理**出现 ≥3 次**的字符串，再补：导航、通用组件、首页、项目页、主流程对话框
10. 写 `tools/codemod.mjs`（基于 TypeScript Compiler API），只处理纯静态 JSX 文本与属性字符串，
    跳过含插值的节点；默认输出 diff，`--write` 才落盘
11. 按术语表填 `zh-CN.json`
12. 跑 PLAN 第 12 节的主流程验收清单

**P1 验收**：主流程全中文、`npm run typecheck` 与 `npm run build` 通过、切换与刷新正常、控制台无 i18n 警告。

### 遇到阻塞怎么办

**你有权自行决策并继续**，只要满足：

- 决策写入 `report/decisions.md`（问题 / 选项 / 选择 / 影响 / 日期）
- 单条无法安全改写的文案记录到 `report/manual.md` 后跳过，不要卡住
- 某阶段超预估 50% 时，先提交当前进度并在决策记录中说明

**绝对不要**：改源项目、跳过验收、未试跑就全量改写、删除已有报告。

### 交付物（放 `deliverables/`）

- `i18n-mvp.patch`：从 `eb786cf` 到 `feat/i18n` 的完整补丁
- `APPLY.md`：如何应用到源项目，含回滚步骤
- `README.md`：变更摘要、覆盖范围、未覆盖清单、已知问题
- `zh-CN.json`：最终语言包副本

同时更新这两个报告：

- `report/coverage.md`：已翻/总数/覆盖率、按模块统计、故意不翻的白名单
- `report/progress.md`：完成情况与后续待办（每阶段更新，供断点恢复使用）

### 完成判定（四条全过才算完成）

1. 设置页能切换中英文，刷新后保持
2. 主流程（首页 → 项目 → 新建工作流 → 画布工具栏 → 设置页）为中文
3. `npm run typecheck` 与 `npm run build` 均通过
4. 交付物齐全，`APPLY.md` 可让他人独立应用补丁

---

## 备注：已知的环境问题（遇到别慌）

- **1425 端口冲突**：源项目占着该端口且 vite 设了 `strictPort`。验证前先停源项目前端，
  或用 `npm run dev -- --port 1426` 临时换端口（不要提交这个改动）。
- **npm 11 会拦 esbuild 的 postinstall**，必须 `npm rebuild esbuild`，否则 vite 起不来。
- **后端不需要在 app 里另起**：vite 的 `/api` 代理已指向 `127.0.0.1:8780`，复用源项目的后端即可。
- **Windows 中文路径**：调用 Windows 原生程序（cmd/robocopy）时中文路径可能乱码，
  用 PowerShell 或 Python 传 Path 对象。
