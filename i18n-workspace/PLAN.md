# LangConfig 汉化实施方案（MVP 优先）

> 目标：用最小代价先获得「中英可切换」的可用版本，再按批次补全。
> 阅读顺序：本文 → `GLOSSARY.md` → 开始 P0。

## 0. 策略

**MVP 优先 + 地基一次做对。**

| 策略 | 首个可用版本 | 达到全量 | 总投入 |
| --- | --- | --- | --- |
| 一次性全量 | 第 4.5–5.5 天 | 同期 | 4.5–5.5 天 |
| **MVP 优先（采用）** | **第 1.5–2 天** | 第 4.5–6 天 | 4.8–6 天 |

分批只多花 0.3–0.5 天，但让"能用上"的时间提前三天。

### MVP 的边界

**翻**：导航、菜单、按钮、标签页、空状态、加载提示、错误提示、主流程对话框、设置页项目名。

**不翻**（明确写入白名单，避免"半吊子"观感）：

- 长说明段落、帮助文本、示例数据
- Monaco / React Flow 等第三方组件自带文案
- 后端 API 的 `detail` 消息（221 条）
- 日志、注释、代码示例

判断标准：**这句英文出现在"用户要点的位置"就翻；出现在"用户要读的资料"里就不翻。**

## 1. 工具选型（已实测）

| 环节 | 工具 | 结论 |
| --- | --- | --- |
| 扫描 / 覆盖率 | `i18next-cli`（官方，2025+） | ✅ 在本项目跑通，输出 2856 条 / 125 文件 |
| 批量改写 | 自研 codemod（TypeScript Compiler API） | ✅ 无现成工具可用，见下 |
| 翻译管理 | Weblate（Docker 自托管，可选） | 需要时再启，MVP 阶段可先用 JSON |
| 伪本地化 / 回归 | Playwright 1.63（项目已装） | ✅ |
| 运行时 | `i18next` + `react-i18next` | 标准方案 |

### ❌ 已否决：i18nize-react

实测结论：

1. 使用 Babel 的 **Flow** parser，遇到 TypeScript 类型注解直接报 `Unexpected token`，125 个文件几乎全部失败；
2. 文档声称的 dry-run 参数**不生效**，一次运行改写了 124 个源文件；
3. 生成 `.js` 文件与 `k.STRING_1` 形式的 key，与"英文原文作 key"不兼容。

**事故记录**：2026-10-23 在源项目上误跑，已通过 `git show HEAD:<file>` 全部还原，未留残留。
此事故的教训已固化为本方案的执行准则（见第 8 节）。

### 扫描配置（已验证可用）

`i18next.config.ts`（放在 `app/` 根）：

```ts
export default {
  locales: ['en', 'zh-CN'],
  extract: {
    input: ['src/**/*.{ts,tsx}'],
    output: 'locales/{{language}}/{{namespace}}.json',
  },
};
```

```bash
npx i18next-cli lint    # 找硬编码，输出 文件:行号
npx i18next-cli status  # 覆盖率
npx i18next-cli extract # 抽取 key 到语言包
```

## 2. 技术方案

### 2.1 用英文原文作 key

```tsx
// 改造前
<button>Save</button>

// 改造后
const { t } = useTranslation();
<button>{t("Save")}</button>
```

```json
{ "Save": "保存", "Cancel": "取消" }
```

理由：

- 不用设计 key 命名，省掉最易返工的一步；
- 漏翻自动回退英文，界面不会出现 key 或空白；
- 重复文案自动共享译文；
- 上游更新时冲突面最小。

配置要点：`keySeparator: false`、`nsSeparator: false`（避免 `Status: Loading...` 被误当命名空间）。

### 2.2 接入点

- `src/i18n/index.ts`：i18next 初始化 + 语言检测
- `src/i18n/locales/zh-CN.json`：**语言包唯一位置**（i18next-cli 的 `output` 也指向这里，避免两处不一致）
- `main.tsx`：包 `<I18nextProvider>`
- 语言偏好存 `localStorage`（key：`langconfig.lang`），默认 `en`
- 设置页 `general` 分区加「Language / 语言」下拉（复用 `SettingsSection` 组件，
  位置放在 general 分区的**第一块**，便于找到）
- 切换语言时同步更新 `document.documentElement.lang`（`index.html` 目前写死 `lang="en"`）

### 2.3 几个容易踩的细节

| 细节 | 说明 |
| --- | --- |
| 命名空间 | MVP 用单个 `translation` 命名空间，P2 后再按模块拆 |
| TS 类型 | `t()` 返回 `string`，JSX 文本直接用；传给要求 `string` 的组件属性若报类型错，用 `t("X") as string` |
| JSON 导入 | `tsconfig.json` 已开 `resolveJsonModule`，可直接 `import zh from './locales/zh-CN.json'` |
| 已存在 `lang` 属性 | 只有 `index.html` 一处，切换时用 JS 更新，不必改 HTML |
| 第三方文案 | Monaco / React Flow 内部菜单不在本方案范围 |
| 后端消息 | API 返回的 `detail` 仍为英文，MVP 接受 |

### 2.3 codemod 规范（`tools/codemod.mjs`）

**只处理安全子集**：

- JSX 纯文本节点：`<button>Save</button>` → `<button>{t("Save")}</button>`
- 属性字面量：`placeholder="Search"` → `placeholder={t("Search")}`
- 跳过：含 `{expr}` 插值的节点、模板字符串、已在 `t(` 内、className/style/id 等非文案属性

**必须做到**：

1. 默认只输出 unified diff，`--write` 才落盘；
2. 幂等（已含 `t(` 的跳过）；
3. 自动补 `useTranslation` 导入与 `const { t } = useTranslation()`
   （函数组件内；类组件跳过并记入 `report/manual.md`）；
4. 输出统计：改动文件数、改写条数、跳过条数及原因。

## 3. 阶段计划

### P0 · 地基（0.5 天）

| 项 | 内容 |
| --- | --- |
| 前置 | clone 源项目到 `app/`，切分支 `feat/i18n`，记录基线 commit |
| 安装 | `npm i i18next react-i18next`；`npx i18next-cli`（首次自动缓存） |
| 产出 | `src/i18n/`、`main.tsx` 接入、设置页语言开关、`localStorage` 持久化 |
| 验收 | 设置页切中文 → 首页标题变中文 → 刷新仍中文 → 切回英文正常 |
| 提交 | `i18n(P0): bootstrap i18n and language switch` |

**P0 不可压缩**：key 策略、切换机制、回退兜底一旦做错，后面每批都要返工。

### P1 · MVP 可用（1–1.5 天）

**优先翻「出现 ≥3 次」的字符串**：这类词通常占条目 15–20%，却覆盖 50–60% 的界面文字。

| 步骤 | 命令 / 产出 |
| --- | --- |
| 生成频次表 | 读 `report/lint.txt`，统计字符串出现次数，输出 `report/frequency.csv` |
| 选范围 | 频次 ≥3 的条目 + 导航/通用组件/首页/设置页/主流程对话框 |
| 改写 | `node tools/codemod.mjs --only report/p1-files.txt`（先 3 个文件试跑） |
| 翻译 | 填 `locales/zh-CN.json`，术语严格按 `GLOSSARY.md` |
| 验收 | 主流程中文；`npm run typecheck`；`npm run build`；切换与刷新正常 |
| 提交 | `i18n(P1): MVP surface translated` |

**到此即为"可日常使用"的版本。**

### P2 · 工作流画布（1 天）

工具栏、属性面板、右键菜单、节点对话框。预计 600–800 条。

### P3 · 智能体库 + 知识库（1 天）

卡片、分类、创建表单、上传流程。预计 500–600 条。

### P4 · 其余模块（1 天）

chat / skills / memory / hermes / tools。预计 600–800 条。

### P5 · 质量收尾（0.5 天）

- 伪本地化测试（见第 5 节）
- 溢出修复（按钮换行、表头截断）
- 生成「已翻 / 未翻」清单到 `report/coverage.md`

## 4. 术语表

见 `GLOSSARY.md`。**P1 开始前必须定稿前 30 个词**，之后只能追加不能改义。

翻译时若术语表与语境冲突，以术语表为准并在 `report/term-conflicts.md` 记录。

## 5. 质量保障

### 5.1 伪本地化（P1 结束与 P5 各做一次）

思路：把 `zh-CN.json` 的译文临时替换为加长 40% 的假文本，跑一遍主流程。

1. 生成 `locales/pseudo.json`：每条译文 → `[!! 译文的伪变形 !!]`（长度 ×1.4）
2. 切到该语言，Playwright 打开主流程页面截图
3. 检查两类问题：
   - **仍是英文的文本** → 漏网硬编码（codemod 跳过的插值节点）
   - **被截断/溢出的元素** → `scrollWidth > clientWidth` 自动列出

Playwright 检测片段（示意）：

```js
const bad = await page.$$eval('*', els => els
  .filter(e => e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0)
  .map(e => e.textContent?.trim().slice(0, 40)));
```

产出：`assets/pseudo/*.png` + `report/pseudo-issues.md`

### 5.2 每批必做的三项检查

```bash
npm run typecheck      # 类型
npm run build          # 构建
npm run lint           # biome
```

### 5.3 可选：Weblate

若需要多人协作或长期维护，可用 Docker 自托管 Weblate：

- 免费开源，支持术语表强制、翻译记忆、73 项自动检查
- 可直接与 git 仓库同步语言包
- MVP 阶段**不强制**，用 JSON 手工维护即可

## 6. 本地验证

### 6.1 端口冲突（必读）

`vite.config.ts` 设置 `port: 1425, strictPort: true`——**端口被占用会直接启动失败**，
而源项目正在使用 1425。

验证前必须二选一：

```bash
# 方式 A（推荐）：先停掉源项目的前端
#   点桌面「停止LangConfig」图标，或手动结束 1425 的进程
#   然后只跑 app 的前端，后端继续复用源项目的 8780

# 方式 B：临时换端口（不要提交这个改动）
npm run dev -- --port 1426
```

### 6.2 前端

```bash
cd app
npm install
npm rebuild esbuild    # npm 11 会拦 postinstall，不跑则 vite 无法启动
npm run dev            # 1425
```

`app/` 的 vite 代理已指向 `http://127.0.0.1:8780`，**后端不需要在 app 里另起一份**。

### 6.3 后端

直接复用源项目已修好的运行入口：

```bash
cd "D:\deepseek ojbect\projectA\langconfig"
.venv\Scripts\python.exe _launcher\run_backend.py
```

或使用桌面 `启动LangConfig` 图标（它会同时拉起数据库、后端、源项目前端——
若与 app 的 1425 冲突，按 6.1 方式 A 处理）。

### 6.4 快速自检

```bash
curl -s http://127.0.0.1:8780/api/projects/ | head -c 80   # 后端通
curl -s -o /dev/null -w "%{http_code}" http://localhost:1425/  # 前端通
```

## 7. 工期与优先级

| 阶段 | 内容 | 人日 | 累计 |
| --- | --- | --- | --- |
| P0 | 地基 | 0.5 | 0.5 |
| P1 | MVP 可用 | 1–1.5 | 1.5–2 |
| P2 | 工作流画布 | 1 | 2.5–3 |
| P3 | 智能体 + 知识库 | 1 | 3.5–4 |
| P4 | 其余模块 | 1 | 4.5–5 |
| P5 | 质量收尾 | 0.5 | 5–5.5 |

## 8. 风险与教训

| 风险 / 教训 | 对策 |
| --- | --- |
| **改写工具 dry-run 不可信**（i18nize-react 事故） | 所有改写先在 3 个文件试跑；跑前存 `git status` 基线；跑完立即比对 |
| 中文比英文长 20–30% | P5 集中处理；按钮加 `whitespace-nowrap`；伪本地化提前暴露 |
| 动态拼接 `"Delete " + name` | 脚本跳过并记入 `report/manual.md`，改为 `t("Delete {{name}}", {name})` |
| 枚举 / 常量（节点类型、状态名） | 建 `labelMap` 映射，不改枚举值本身 |
| 第三方组件内置文案 | 白名单化，MVP 接受 |
| 上游更新冲掉改动 | 英文原文作 key；每次 `git pull` 后跑 `i18next-cli lint` 只补新增 |
| Windows 环境问题 | 见源项目 README 与 `_launcher/`；Python 3.13 若报写入错误，换 `%APPDATA%\uv\python` 的解释器 |
| 术语不一致 | 术语表先行；WeBlate 的"不遵循术语表"检查可自动拦截 |

## 9. 不做的范围（避免蔓延）

- 后端 API 文案（221 条）
- 日期/数字/货币本地化
- 第三方组件内部文案
- 除中英之外的语言
- 在源项目原地改造（必须走 `app/` 工作副本）

## 10. 交付物

1. `app/` 分支 `feat/i18n`（可生成的 patch）
2. `src/i18n/`（配置 + `zh-CN.json`）
3. `tools/codemod.mjs`、`tools/pseudo-localize.mjs`
4. `report/`：扫描、频次、覆盖率、伪本地化问题
5. `deliverables/`：最终补丁或语言包打包
6. 更新后的 `GLOSSARY.md`

---

## 11. 执行前检查清单（DoR）

开工前逐项确认，任何一项不满足先解决再动手：

- [ ] `app/` 已 clone，且 `git -C app rev-parse --short HEAD` 输出 `eb786cf`
- [ ] `app/` 分支为 `feat/i18n`，工作区干净
- [ ] `npm install` 完成，并执行过 `npm rebuild esbuild`
- [ ] 源项目前端已停（1425 空闲），后端 8780 可用
- [ ] `npx i18next-cli lint` 能跑出 ≥2000 条（低于此说明扫错目录）
- [ ] `GLOSSARY.md` 前 30 词已确认
- [ ] `report/baseline-lint.txt` 已读，知道总量

## 12. 主流程验收清单（P1 必过）

逐条人工点一遍，全部通过才算 MVP 完成：

1. 应用首屏加载，顶部导航为中文
2. 项目列表页：标题、空状态、按钮为中文
3. 「新建工作流」对话框：标题、输入框占位符、按钮为中文
4. 工作流画布工具栏：至少「运行 / 保存 / 删除」为中文
5. 设置页：左侧分类名为中文，语言下拉可切换
6. 切 `en → 中文`：以上全部立即变化，**刷新浏览器后仍为中文**
7. 切回 `en`：恢复英文，界面无残留中文（语言选项本身除外）
8. 控制台无 `react-i18next` 警告、无 `useTranslation` 相关报错

## 13. 阻塞处理与自主授权

执行 agent 遇到方案未覆盖的情况，**可以自行决定并继续**，但必须遵守：

- 决策写入 `report/decisions.md`，格式：`问题 / 可选方案 / 选择 / 影响 / 日期`
- 不允许的越界行为：
  - 修改源项目目录
  - 跳过第 12 节的任何一条验收
  - 未在 3 个文件上试跑就全量改写
  - 删除或篡改 `report/` 下的既有记录
- 单条文案若无法安全改写（含插值、动态拼接、模板字符串），
  记入 `report/manual.md` 后继续，不要卡住整体进度
- 若某阶段超出预估 50% 时间，先提交当前进度并在 `report/decisions.md` 说明，再继续

## 14. 交付格式

`deliverables/` 下必须包含：

| 文件 | 内容 |
| --- | --- |
| `i18n-mvp.patch` | `git -C app format-patch` 或 `git diff eb786cf..feat/i18n` 生成 |
| `APPLY.md` | 如何把补丁应用到源项目（含回滚步骤） |
| `README.md` | 变更摘要、覆盖范围、未覆盖清单、已知问题 |
| `zh-CN.json` | 最终语言包副本 |

`report/coverage.md` 需给出：

- 已翻译条数 / 总条数 / 覆盖率
- 按模块统计（workflows / agents / knowledge / 其他）
- 明确列出"故意不翻"的白名单条目

## 15. 长任务执行与子代理协作

本任务的执行方式为**长时间自主运行**，需要以下配套约定。

### 15.1 自主边界

| 情况 | 处理 |
| --- | --- |
| 方案未覆盖的小问题 | 自行决策，记入 `report/decisions.md`，继续 |
| 单条文案无法安全改写 | 记入 `report/manual.md`，跳过，继续 |
| 某阶段超预估 50% | 提交当前进度 + 记录决策，继续下一阶段 |
| 可能危及源项目 | **停下请示** |
| 验收反复失败（≥2 种方案） | **停下请示** |
| 需要凭据/账号 | **停下请示** |

### 15.2 子代理使用规则

允许启动子代理，适用场景与约束：

| 场景 | 类型 | 说明 |
| --- | --- | --- |
| 并行扫描模块文案 | 只读 | 各模块独立统计，主 agent 汇总 |
| codemod diff 独立复核 | 只读 | 抽查是否误改，结论写 `report/subagents/` |
| 分片翻译 | 只读产出 | 按模块切分，主 agent 合并进语言包 |

**红线**：

1. 同一文件同一时刻只能有一个执行者写入，子代理默认只读；
2. 子代理结论必须主 agent 复核后采用；
3. 子代理同样禁止触碰源项目。

### 15.3 断点恢复

每个阶段结束更新 `report/progress.md`：

```markdown
## 已完成
## 进行中
## 待办
## 已知问题 / 决策
```

新上下文或中断恢复时，先读该文件再继续，不要凭记忆重来。

## 16. 时间盒

| 阶段 | 预估 | 超时阈值 |
| --- | --- | --- |
| P0 | 0.5 天 | 超过 1 天必须记录决策并请示 |
| P1 | 1–1.5 天 | 超过 2.5 天同上 |

MVP 交付以 **P1 完成**为准，P2–P5 属于后续增量，不在本次 goal 范围内。
