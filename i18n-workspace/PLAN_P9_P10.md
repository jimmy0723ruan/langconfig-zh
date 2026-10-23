# 补充方案：P9 内容本地化 + P10 工程化提升

> 前置：P0–P7 已完成（覆盖率约 86%，剩余 384 条硬编码）。
> 本文档定义"把汉化做到更好"的两步：**内容补全**与**工程质量**。

## 0. 当前状态

| 指标 | 值 |
| --- | --- |
| 剩余硬编码 | 384 条 |
| 其中教学长文 | 约 100 条（LearnLangChainTab 46、BestPracticesTab 20、EmptyState 16、LibraryPanel 18） |
| 其余 | 图标名、模型标识、示例数据（不该翻） |
| 类型检查 / 构建 | 均通过 |
| 中文界面 | 仅切换后生效，默认仍英文 |

---

## P9 · 教学文档本地化（2–2.5 天）

### 9.1 为什么不能简单套 `t()`

`LearnLangChainTab.tsx` 是 **911 行纯 JSX 长文**：

```tsx
<h2>Learn LangChain & LangGraph</h2>
<p>Master the fundamentals of building production-ready AI agents</p>
<h3>Agent Fundamentals</h3>
<p>An agent is a system that uses an LLM to decide...</p>
```

直接给每段套 `t("很长的整段话...")` 有三个问题：

1. **翻译不可控**：一段 300 字整段翻，术语容易漂移；
2. **校对困难**：长 key 在 JSON 里难以对照；
3. **更新成本高**：内容一改，译文就失效。

### 9.2 采用「分段 + 结构保留」策略

**不改组件结构**，但按语义切分：

| 内容类型 | 处理 |
| --- | --- |
| 标题 / 小标题 | 独立 `t()`，短 key |
| 段落正文 | 按**句子或语义段**拆成多段，每段一个 `t()` |
| 列表项 | 每项独立 `t()` |
| 代码示例 | **不翻**，保持原样 |
| 链接文字 | `t()`，链接地址不动 |

示例：

```tsx
// 改前
<p>An agent is a system that uses an LLM to decide which actions to take.
   Unlike a simple prompt chain, an agent can loop, use tools, and adapt.</p>

// 改后（拆成两句，便于校对与复用）
<p>
  {t("An agent is a system that uses an LLM to decide which actions to take.")}{" "}
  {t("Unlike a simple prompt chain, an agent can loop, use tools, and adapt.")}
</p>
```

### 9.3 涉及文件

| 文件 | 行数 | 剩余条数 | 性质 |
| --- | --- | --- | --- |
| `LearnLangChainTab.tsx` | 911 | 46 | LangChain 教程（多章节，可折叠） |
| `BestPracticesTab.tsx` | 894 | 20 | 最佳实践清单 |
| `EmptyStateContent.tsx` | 329 | 16 | 空状态引导文案 |
| `LibraryContentPanel.tsx` | 343 | 18 | 库面板说明 |

### 9.4 翻译规范

1. **术语严格按 `GLOSSARY.md`**，其中 LangChain 相关术语补充：
   - Chain → 链
   - Tool / Tool Calling → 工具 / 工具调用
   - Memory → 记忆
   - Retriever → 检索器
   - Embedding → 向量
   - State Graph → 状态图
2. **代码标识符保留原样**：`StateGraph`、`add_node`、`compile()` 不译；
3. **英文专有名词首次出现可保留**：如 "LangGraph 的 StateGraph"；
4. **教程语气**：用"你"而不是"您"，保持简洁，不添加原文没有的内容；
5. **不臆造**：原文没有的例子、警告不要加。

### 9.5 验收

- [ ] 四个文件的中文覆盖率 100%（代码块除外）
- [ ] 折叠/展开交互不受影响
- [ ] 长段落中文换行正常，无溢出
- [ ] `typecheck` / `build` 通过
- [ ] 术语与 `GLOSSARY.md` 一致

---

## P10 · 工程质量提升（1.5 天）

按优先级排列，可分批做。

### 10.1 类型安全（0.5 天）★推荐

生成 `src/i18n/i18next.d.ts`，让 `t()` 的 key 有类型提示：

```ts
import 'i18next';
import type en from './locales/en.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
  }
}
```

**收益**：`t("Sav")` 这类拼写错误在编译期报错，而不是运行时静默显示英文。

> 注意：项目当前用英文原文作 key，`en.json` 是空的（靠回退）。
> 需先让 `en.json` 包含所有 key（值=key 自身），类型才有意义。

### 10.2 术语一致性检查（0.5 天）

`tools/check-glossary.mjs`：

- 读 `GLOSSARY.md` 的英文→中文映射；
- 扫描 `zh-CN.json`，检查同一英文是否出现多种译法；
- 报告冲突清单，人工裁决。

**收益**：防止 `Agent` 一会儿"智能体"、一会儿"代理"。

### 10.3 伪本地化复跑（0.3 天）

P6/P7 新增了 220+ 条文案，之前的伪本地化结论已过期。重跑一次：

- 生成加长 40% 的假语言包；
- 检查导航、按钮、对话框是否溢出；
- 输出 `report/pseudo-p6p7.md`。

### 10.4 首次访问自动中文（0.2 天）

当前默认 `en`。改为：

```ts
const detected = navigator.language.startsWith('zh') ? 'zh-CN' : 'en';
```

保留用户手动选择（localStorage 优先）。

**收益**：中文用户第一次打开就是中文，不用去设置里找。

### 10.5 覆盖率守门（0.5 天）

`tools/check-coverage.mjs` + `package.json` 脚本：

- 扫描 `src/**/*.tsx` 的硬编码文案；
- 超过阈值（如 450 条）时 CI/提交前报警；
- 防止新功能引入大量未翻译文案。

### 10.6 低频后端错误补齐（0.2 天）

`report/p7-untranslated.md` 里 15 条低频消息，补其中安全相关：

- `IP not allowed`
- `Invalid signature` / `Missing signature`
- `File not found or invalid path`
- `Continuation task not found`

---

## 11. 完成度分级

| 等级 | 含义 | 对应阶段 |
| --- | --- | --- |
| L1 | 能用：主界面中文，可切换 | P0–P7（已完成） |
| **L2** | 完整：教学文档也中文，首次访问自动中文 | P9 + 10.4 |
| L3 | 工程化：类型安全、术语一致、覆盖率守门 | L2 + 10.1/10.2/10.5 |

## 12. 工期

| 阶段 | 内容 | 工期 |
| --- | --- | --- |
| P9 | 四个文件的内容本地化 | 2–2.5 天 |
| P10.1 | 类型安全 | 0.5 天 |
| P10.2 | 术语检查 | 0.5 天 |
| P10.3 | 伪本地化复跑 | 0.3 天 |
| P10.4 | 首访自动中文 | 0.2 天 |
| P10.5 | 覆盖率守门 | 0.5 天 |
| P10.6 | 低频错误补齐 | 0.2 天 |
| **合计** | | **4.2–4.7 天** |

若只做 L2（P9 + 10.4）：**2.2–2.7 天**。
