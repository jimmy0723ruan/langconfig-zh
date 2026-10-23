# LangConfig 中文版（汉化分支）

> 基于 [LangConfig](https://github.com/LangConfig/langconfig)（MIT）的中文化与国际化改造。
> 上游英文说明见 [`README.upstream.md`](README.upstream.md)。

本仓库是一个**汉化成果快照**：可直接构建运行的 LangConfig 中文版，
外加完整的汉化工具链、过程报告与可应用的补丁包。

---

## 一、做了什么

| 指标 | 数值 |
| --- | --- |
| 硬编码文案（基线 → 现在） | 2856 → **373**（中文化 **86.9%**） |
| 中文语言包 | **2131 条** |
| 涉及文件 | 136 个 |
| 后端错误映射 | 77 条精确 + 18 条正则模板 |

剩余 373 条几乎全部是**不该翻译**的内容：`material-symbols` 图标名、模型标识
（`GPT-5.4 Mini`、`text-embedding-*`）、代码示例占位符（`{variable}`）、技术常量。

### 功能特性

- **中英切换**：设置 → 通用 → 第一块「语言」，切换后写入 `localStorage`，刷新保持
- **首访自动中文**：浏览器语言为 `zh*` 时首次打开即中文；用户手动选择优先
- **完整主流程中文**：首页 → 项目 → 工作流画布 → 节点配置 → 设置，全链路
- **教学文档中文**：库内的 LangChain 教程、最佳实践、空状态引导全部本地化
- **后端错误中文**：`Workflow not found` → 「工作流不存在」，带变量的消息走模板匹配
- **类型安全**：`i18next.d.ts` + 完整 `en.json`，拼错 key 在编译期报错

---

## 二、效果预览

| 首页 | 工作流画布 |
| --- | --- |
| ![首页](docs/screenshots/home.png) | ![画布](docs/screenshots/studio.png) |

| 智能体库 | 教学文档 |
| --- | --- |
| ![智能体](docs/screenshots/agents.png) | ![教学](docs/screenshots/docs.png) |

![设置](docs/screenshots/settings.png)

---

## 三、技术方案要点

1. **英文原文即 key**：`t("Save")` → `{"Save": "保存"}`，不用设计 key 命名；
   漏翻只会回退显示英文，不会出现 key 名或空白。
2. **`keySeparator: false` / `nsSeparator: false`**：key 里可以出现 `.`、`:` 等标点。
3. **插值句统一占位符**：`{t('Results {{count}}', { count })}`。
4. **组件内已有 `t` 变量时**自动改用 `i18nT` 别名，避免遮蔽。
5. **后端不改**：错误消息在前端 `api-client` 拦截器里映射，API 保持语言中立。

---

## 四、目录结构

```
.
├─ src/i18n/                 # i18n 初始化、语言包、错误映射、类型声明
│  ├─ index.ts               # 初始化 / 持久化 / 浏览器语言检测
│  ├─ errorMap.ts            # 后端错误 → 中文
│  ├─ i18next.d.ts           # 类型化 key
│  └─ locales/{en,zh-CN}.json
├─ src/…                     # LangConfig 前端源码（已接入 t()）
├─ backend/                  # LangConfig 后端（未改动）
└─ i18n-workspace/           # 汉化工程资产，不参与构建
   ├─ tools/                 # codemod、合并、检查、验收脚本
   ├─ report/                # 覆盖率、决策、进度、扫描数据
   ├─ deliverables/          # 补丁、应用指南、语言包副本
   └─ *.md                   # 方案与术语表
```

---

## 五、快速开始

```bash
npm install
npm rebuild esbuild          # npm 11 会拦 esbuild 的 postinstall

# 后端（需要 PostgreSQL + pgvector，保姆级步骤见 docs/INSTALL.zh-CN.md）
cd backend && python run_local.py

# 前端
npm run dev                  # http://localhost:1425
```

首次打开若浏览器语言是中文，界面直接为中文；否则到 **设置 → 通用 → 语言** 切换。

---

## 六、把汉化应用到你的 LangConfig

不需要整个仓库，只要补丁文件：

```
i18n-workspace/deliverables/i18n-mvp.patch
```

基于上游基线 `eb786cf`，完整步骤（含验证与回滚）见
[`i18n-workspace/deliverables/APPLY.md`](i18n-workspace/deliverables/APPLY.md)。

```bash
git checkout eb786cf
git apply --check i18n-workspace/deliverables/i18n-mvp.patch   # 先试
git apply i18n-workspace/deliverables/i18n-mvp.patch
npm install && npm rebuild esbuild
```

---

## 七、验证

```bash
npm run typecheck                  # 类型（含 i18next key 类型检查）
npm run build                      # 构建

# 需要 dev server 运行在 1426
node i18n-workspace/tools/verify-p0.mjs   # 语言链路 10 条
node i18n-workspace/tools/verify-p1.mjs   # 主流程 12 条

node i18n-workspace/tools/check-coverage.mjs   # 覆盖率守门（阈值 450）
node i18n-workspace/tools/check-glossary.mjs   # 术语一致性
```

当前结果：`verify-p0` 10/10、`verify-p1` 12/12、`typecheck`/`build` 通过、
覆盖率守门 373 ≤ 450。

---

## 八、开发阶段

| 阶段 | 内容 |
| --- | --- |
| P0 | i18n 地基：Provider、语言包、语言切换 |
| P1–P5 | 主流程 → 全站铺开（画布、智能体、知识库、工具、对话…） |
| P6 | 剩余文案：插值句 183 处、三元表达式 74 处、类组件 |
| P7 | 后端错误消息前端映射 + Toast 桥接 |
| P8 | DeepAgent 模板名称/描述中文化 |
| P9 | 四个教学文档全量本地化（长段落按句拆分） |
| P10 | 工程化：首访检测、类型化 key、术语/覆盖率检查、伪本地化 |

过程记录：`i18n-workspace/report/progress.md`、`decisions.md`、`coverage.md`。

---

## 九、已知限制

- **工作流默认名** `Untitled Workflow` 是数据值（会写入后端），未翻译。
- **模型标识、图标名、示例占位符**保持英文，属有意保留。
- **后端未映射的错误**（约 126 条低频消息）仍显示英文，清单见
  `i18n-workspace/report/p7-untranslated.md`。
- **导航栏**在超长文本下会横向滚动（已加 `overflow-x-auto`）。
- 本仓库为**成果快照**，不含逐阶段提交历史；完整变更以补丁文件为准。

---

## 十、许可

沿用上游 MIT 许可，见 [`LICENSE`](LICENSE)。上游版权归 Cade Russell (Ghost Peony)。
