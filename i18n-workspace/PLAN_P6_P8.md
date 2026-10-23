# 补充方案：P6–P8 收尾阶段

> 续接 `PLAN.md` 的 P1–P5。P1–P5 已交付（覆盖率 78.7%，typecheck/build 通过）。
> 本文件定义剩下的三块空间，优先级从高到低。

## 0. 起点状态（已核实）

| 项 | 值 |
| --- | --- |
| 基线 | `eb786cf`（源项目），`app/` 分支 `feat/i18n` |
| 当前剩余硬编码 | 604 条 |
| 其中真实可翻 | **230 条**（见 `report/p6-targets.md`） |
| 语言包 | 1577 条 |
| 覆盖率 | 78.7% |
| 验证 | `typecheck` / `build` 均通过 |

剩余 604 条的构成（不再重复统计）：

- 图标名 ≈332（`check_circle`、`save`、`lock` 等，**不翻**）
- 真实界面文案 **230**（本方案 P6 处理）
- 短符号/常量 ≈42（**不翻**）

---

## P6 · 前端剩余 230 条（0.5–1 天）

### 目标

覆盖率 78.7% → **约 88%**，并把插值句从"半英文"变成完整中文。

### 输入

`report/p6-targets.md` —— 已按文件分组、带行号的精确清单，共 61 个文件。

Top 文件：

| 文件 | 条数 |
| --- | --- |
| `features/tools/ui/CustomToolBuilder.tsx` | 16 |
| `features/agents/ui/AgentLoadouts.tsx` | 19 |
| `features/workflows/library/FilesLibraryTab.tsx` | 16 |
| `features/agents/ui/ModernAgentLibrary.tsx` | 11 |
| `features/agents/ui/DeepAgentBuilder.tsx` | 10 |
| `features/workflows/ui/ConflictDialog.tsx` | 9 |
| `features/knowledge/ui/KnowledgeBaseView.tsx` | 9 |
| `features/workflows/execution/AgentContextViewer.tsx` | 8 |
| 其余约 50 个文件 | ≤7 条/文件 |

### 处理规则

1. **直接用 `report/p6-targets.md` 的行号定位**；行号可能因前次改动偏移，以字符串内容为准搜索。
2. **先跑已有的 `tools/codemod.mjs`**，它只处理静态文本；剩余的需要手工。
3. **插值句必须手工改**，规范：

   ```tsx
   // 改前
   <span>Results {count}</span>

   // 改后
   <span>{t("Results {{count}}", { count })}</span>
   ```

   复数场景用 i18next 的 `_one` / `_other`：

   ```json
   {
     "{{count}} item_one": "{{count}} 个项目",
     "{{count}} item_other": "{{count}} 个项目"
   }
   ```

4. **以下内容即使出现在清单里也不要翻**（清单是机器过滤，仍有误报）：
   - `{variable}`、`{date}` 这类**代码示例占位符**
   - `GPT-Image-1.5 (Image)`、`text-embedding-3-*` 等模型标识
   - `Twitter API Rate Limits & Endpoints` 这类 API 文档标题，可按语境决定
   - 纯技术说明（`syntax for dynamic values`）—— 如果出现在输入框下方提示可翻，
     出现在代码示例说明中不翻

5. 拿不准的**一律记入 `report/manual.md`**，不要硬翻。

### 验收

- `npx i18next-cli lint` 剩余条数 **≤ 400**
- 剩余条目中不含"用户要点的位置"的英文（按钮、标签、空状态、提示）
- `npm run typecheck` 与 `npm run build` 通过
- 用 Playwright 打开以下页面截图，确认无中文断裂：
  - 智能体库（AgentLoadouts / ModernAgentLibrary）
  - 工具构建器（CustomToolBuilder）
  - 知识库（KnowledgeBaseView）
  - 工作流库文件标签页（FilesLibraryTab）

### 交付

- commit `i18n(P6): translate remaining UI copy`
- 更新 `report/coverage.md`
- 重新生成 `deliverables/i18n-mvp.patch` 与 `zh-CN.json`

---

## P7 · 后端 API 消息 221 条（0.5–1 天）

### 现状

`backend/api/*.py` 里 `HTTPException(detail="...")` 共 221 处，全是英文。
用户触发报错时，前端会直接显示这些英文（或 `Request failed with status code 500`）。

### 三个方案

| 方案 | 做法 | 优点 | 缺点 |
| --- | --- | --- | --- |
| **A（推荐）** | 前端建错误码映射表：`apiClient` 拦截器把常见英文 detail 映射为中文 | 不动后端、可随时扩展 | 只能覆盖常见消息，穷举不全 |
| B | 后端直接写中文 detail | 一次到位 | 破坏 API 的多语言能力，且要改 221 处 Python |
| C | 后端返回错误码，前端按码翻译 | 最规范 | 要改后端返回结构 + 前端映射，工作量翻倍 |

### 建议策略：A + 兜底

1. 在 `src/i18n/errorMap.ts` 建映射表，覆盖**高频 40–60 条**（404、校验失败、LLM 调用失败等）；
2. `src/lib/api-client.ts` 的响应拦截器里做一次转换：

   ```ts
   const KEY = "error." + detail;        // 或 detail 全文作为 key
   const msg = i18n.exists(KEY) ? i18n.t(KEY) : detail;
   ```

3. 未命中的保持英文——**但要记录到 `report/p7-untranslated.md`**，方便后续补。

### 如何选高频 40–60 条

```bash
cd app/../backend
grep -rhoE 'detail="[^"]+"' --include=*.py . | sort | uniq -c | sort -rn | head -60
```

出现次数多、且文案面向用户的优先。

### 验收

- 打开应用，故意触发 3 类错误（404 资源不存在、表单校验失败、模型调用失败），
  界面显示中文提示
- `typecheck` / `build` 通过
- `report/p7-untranslated.md` 列出未映射的 detail

### 交付

- commit `i18n(P7): map backend error messages`
- `report/p7-untranslated.md`

---

## P8 · 种子数据本地化（先统计，再决定）

### 问题

界面框架已经是中文，但**智能体卡片、模板、示例项目的名称与描述来自后端种子数据**，仍是英文。
这种"框架中文、内容英文"的割裂感，比剩余 230 条更明显。

### 第一步：只做统计，不改数据

```bash
cd backend
# 找种子数据位置
grep -rl "deep_agent_templates\|INSERT INTO\|seed" --include=*.py --include=*.sql . | head
# 统计条目
```

产出 `report/p8-seed-inventory.md`：

- 种子文件清单
- 每个文件包含的条目数
- 是否有中文字段支持（如 `name_zh`）

### 第二步：根据统计结果选方案

| 情况 | 方案 |
| --- | --- |
| 条目 < 50 且只有单语言字段 | 直接改种子为中文（简单） |
| 条目较多 | 加 `name_zh` / `description_zh` 字段，前端按语言取值 |
| 数据来自用户输入 | **不翻**（属于用户内容） |

### 本阶段范围

**只做统计与方案建议，不改数据**。等用户确认后再实施。

---

## 时间盒与优先级

| 阶段 | 内容 | 工期 | 收益 |
| --- | --- | --- | --- |
| P6 | 前端剩余 230 条 | 0.5–1 天 | 覆盖率 78.7% → 88% |
| P7 | 后端错误消息映射 | 0.5–1 天 | 报错不再突兀 |
| P8 | 种子数据统计 | 0.2 天 | 为下一步决策提供依据 |

建议顺序：**P6 → P7 → P8 统计**。P8 的实施需另行确认。

## 验收总标准（P6+P7 完成后）

1. `npx i18next-cli lint` 剩余 ≤ 400（且不含界面文案）
2. 主流程 + 智能体库 + 工具构建器 三个高频页面的按钮/标签/空状态全中文
3. 三类常见错误提示显示中文
4. `npm run typecheck`、`npm run build` 通过
5. `deliverables/i18n-mvp.patch` 重新生成且可应用
