# 执行提示词 · 第二轮（P6 + P7）

> 直接复制分隔线内的内容发送。这是上一轮 P0–P5 的续作。

---

## 任务：LangConfig 汉化收尾（P6 + P7）

上一轮已完成 P0–P5（覆盖率 78.7%，`typecheck`/`build` 通过）。
本轮目标是把剩下的**真实界面文案**和**后端错误提示**补完，覆盖率提到约 88%。

### 第一步：读这三个文件

1. `D:\cherry-work\langconfig汉化实施\PLAN_P6_P8.md` —— 本轮方案
2. `D:\cherry-work\langconfig汉化实施\report\p6-targets.md` —— 待翻清单（230 条 / 61 文件，带行号）
3. `D:\cherry-work\langconfig汉化实施\report\progress.md` —— 上一轮进度

工作副本已存在：`D:\cherry-work\langconfig汉化实施\app`，分支 `feat/i18n`，**不要重新 clone**。

### 工作模式（与上一轮相同）

长时间自主执行，一次做完 P6 → P7，不要中途请示。
只有三种情况必须停：**危及源项目**、**验收反复失败（≥2 种方案）**、**需要账号凭据**。
其余自行决策，记入 `report/decisions.md`。

允许启动子代理协助，规则不变：**子代理只读**，同一文件同一时刻只有一个写入者，
子代理结论必须你复核后才能合入。

### 硬性约束

1. 所有产物留在 `D:\cherry-work\langconfig汉化实施` 内。
2. **源项目 `D:\deepseek ojbect\projectA\langconfig` 只读**。
3. 每阶段提交一次：`i18n(P6): ...` / `i18n(P7): ...`。
4. `report/p6-targets.md` 是机器过滤的结果，**仍有误报**——拿不准的记入 `report/manual.md`，不要硬翻。
5. 每阶段结束更新 `report/progress.md`。

### P6 · 前端剩余 230 条

1. 先跑 `node tools/codemod.mjs` 处理其中的静态文本部分
2. 剩余的手工改，**插值句规范**：

   ```tsx
   // 改前
   <span>Results {count}</span>
   // 改后
   <span>{t("Results {{count}}", { count })}</span>
   ```

3. **清单里这些不要翻**（机器误报）：
   - `{variable}`、`{date}` 等代码示例占位符
   - `GPT-Image-1.5 (Image)`、`text-embedding-3-*` 等模型标识
   - 纯技术说明若出现在代码示例旁则不翻，出现在输入框提示旁则翻
4. 重点文件（条数最多）：`CustomToolBuilder`、`AgentLoadouts`、`FilesLibraryTab`、
   `ModernAgentLibrary`、`DeepAgentBuilder`、`ConflictDialog`、`KnowledgeBaseView`

**P6 验收**：`npx i18next-cli lint` 剩余 ≤ 400；`typecheck` + `build` 通过；
四个高频页面截图无中文断裂。

### P7 · 后端错误消息（前端映射，不改后端）

1. 统计高频错误：

   ```bash
   cd "D:\deepseek ojbect\projectA\langconfig\backend"
   grep -rhoE 'detail="[^"]+"' --include=*.py . | sort | uniq -c | sort -rn | head -60
   ```

2. 在 `app/src/i18n/errorMap.ts` 建映射（**不要改后端任何文件**）
3. 在 `app/src/lib/api-client.ts` 的响应拦截器里转换：命中映射用中文，未命中保留英文
4. 未命中的记入 `report/p7-untranslated.md`

**P7 验收**：故意触发三种错误（404、表单校验失败、模型调用失败），界面显示中文；
`typecheck` + `build` 通过。

### 交付

- 更新 `deliverables/i18n-mvp.patch`（从 `eb786cf` 到当前 `feat/i18n`）
- 更新 `deliverables/zh-CN.json` 与 `deliverables/README.md`
- 更新 `report/coverage.md`、`report/progress.md`
- 新增 `report/p7-untranslated.md`

### 完成判定

1. `i18next-cli lint` 剩余 ≤ 400，且剩余不含"按钮/标签/空状态"类文案
2. 智能体库、工具构建器、知识库、工作流库四个页面的可见文案为中文
3. 三类常见错误提示为中文
4. `npm run typecheck` 与 `npm run build` 通过
5. 交付物已重新生成

---

## 环境提示

- app 前端用 **1426** 端口（1425 被源项目占用，`strictPort` 会冲突）
- 后端复用源项目的 8780，不要在 app 里另起
- 后端有 60 req/min 限流，连续跑 Playwright 会 429，脚本需重试
