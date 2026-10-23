# 执行提示词 · 第三轮（P9 内容本地化 + P10 提升）

> 复制分隔线内的内容发送。这是 P0–P7 的续作。

---

## 任务：LangConfig 汉化收尾（P9 教学文档 + P10 工程化）

前两轮已完成 P0–P7：主界面中文覆盖率约 86%，`typecheck`/`build` 通过。
本轮要做的两件事：**把库里的教学文档汉化**，**把工程健壮性补上**。

### 第一步：读这两个文件

1. `D:\cherry-work\langconfig汉化实施\PLAN_P9_P10.md` —— 本轮方案
2. `D:\cherry-work\langconfig汉化实施\report\progress.md` —— 上一轮进度

工作副本：`D:\cherry-work\langconfig汉化实施\app`，分支 `feat/i18n`，**不要重新 clone**。

### 工作模式

长时间自主执行，一次做完 P9 → P10，不要中途请示。
只有三种情况必须停：**危及源项目**、**验收反复失败（≥2 种方案）**、**需要账号凭据**。
其余自行决策，记入 `report/decisions.md`。

允许子代理：**只读**，同一文件同一时刻只允许一个写入者，结论须你复核。

### 硬性约束

1. 所有产物留在 `D:\cherry-work\langconfig汉化实施` 内；
2. **源项目 `D:\deepseek ojbect\projectA\langconfig` 只读**；
3. 每阶段提交一次：`i18n(P9): ...` / `i18n(P10): ...`；
4. 长文改造**不能改动组件结构**，只加 `t()`；
5. 代码块、示例代码**一律不翻**。

### P9 · 教学文档本地化（核心任务）

涉及四个文件：

| 文件 | 行数 | 剩余条数 |
| --- | --- | --- |
| `src/features/workflows/library/LearnLangChainTab.tsx` | 911 | 46 |
| `src/features/workflows/library/BestPracticesTab.tsx` | 894 | 20 |
| `src/features/workflows/library/EmptyStateContent.tsx` | 329 | 16 |
| `src/features/workflows/library/LibraryContentPanel.tsx` | 343 | 18 |

**翻译方式**（重要）：

- 标题、列表项：独立 `t()`
- **长段落要按句子拆开**，一句一个 `t()`，不要整段一个 key；
- 代码块、`<pre>`、示例代码：跳过；
- 链接文字翻译，href 不动。

示例：

```tsx
// 改前
<p>An agent is a system that uses an LLM to decide which actions to take.
   Unlike a simple prompt chain, an agent can loop, use tools, and adapt.</p>

// 改后
<p>
  {t("An agent is a system that uses an LLM to decide which actions to take.")}{" "}
  {t("Unlike a simple prompt chain, an agent can loop, use tools, and adapt.")}
</p>
```

**术语**：严格按 `GLOSSARY.md`；LangChain 相关补充：
Chain→链、Tool Calling→工具调用、Retriever→检索器、Embedding→向量、State Graph→状态图。
`StateGraph`、`add_node`、`compile()` 等代码标识符不译。

**语气**：教程用"你"，简洁，不添加原文没有的内容。

**P9 验收**：四个文件中文覆盖率 100%（代码除外）；折叠展开正常；无溢出；`typecheck`/`build` 通过。

### P10 · 工程化提升（按优先级）

**必做（小改动大收益）**：

1. **首访自动中文**（10.4）：默认语言改为按 `navigator.language` 判断，
   `zh*` 用 `zh-CN`，其余 `en`；localStorage 里已有选择时优先用用户的。
2. **低频错误补齐**（10.6）：给 `src/i18n/errorMap.ts` 补充这几条：
   `IP not allowed`、`Invalid signature`、`Missing signature`、
   `File not found or invalid path`、`Continuation task not found`。

**推荐（工程化）**：

3. **类型安全**（10.1）：生成 `src/i18n/i18next.d.ts`。
   注意：当前 `en.json` 是空的（靠英文原文回退），需要先让 `en.json` 包含全部 key
   （值 = key 自身），类型才有意义。**如果这一步会导致大量改动，可跳过并记录原因。**
4. **术语一致性检查**（10.2）：写 `tools/check-glossary.mjs`，
   扫描 `zh-CN.json` 找出同一英文的多种译法，输出 `report/glossary-conflicts.md`。
5. **覆盖率守门**（10.5）：写 `tools/check-coverage.mjs`，
   统计硬编码文案数，超过阈值（450）时非零退出。
6. **伪本地化复跑**（10.3）：P6/P7 新增了 220+ 条，重跑一次，
   输出 `report/pseudo-p6p7.md`。

### 交付

- 更新 `deliverables/i18n-mvp.patch`、`zh-CN.json`、`README.md`
- 更新 `report/coverage.md`、`report/progress.md`
- 新增：`report/glossary-conflicts.md`（若做 10.2）、`report/pseudo-p6p7.md`（若做 10.3）

### 完成判定

1. 四个教学文档文件的中文覆盖率 100%（代码块除外）
2. 首次打开应用（浏览器语言为中文）默认显示中文
3. `npm run typecheck` 与 `npm run build` 通过
4. 交付物已重新生成

---

## 环境提示

- app 前端用 **1426** 端口（1425 被源项目占用）
- 后端复用源项目 8780，不要在 app 里另起
- 后端有 60 req/min 限流，连续跑 Playwright 会 429
