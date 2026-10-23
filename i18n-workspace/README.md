# LangConfig 汉化实施工作区

> 本目录是 LangConfig 中英切换与汉化改造的**唯一工作区**。
> 执行 agent 请先读完本文件与 `PLAN.md`，再动手。

## 一、给执行 Agent 的硬性约定

1. **所有工程文件必须放在本目录内**，不得写到源项目目录，也不得散落到桌面或其他工作区。
2. **源项目只读**：`D:\deepseek ojbect\projectA\langconfig` 是正在使用的运行目录，禁止在原地改代码、切分支、跑改写脚本。
3. **工作副本放在 `app/`**：从源项目 clone 一份到这里，在 `app/` 里开分支 `feat/i18n` 施工。
4. **每阶段结束提交一次**，commit message 用 `i18n(P0): ...` 格式，便于回滚。
5. **改动前先记录基线**：`git -C app status --short` 与 `git -C app rev-parse HEAD`，完成后立即比对。
6. **改写类工具先在 3 个文件上试跑**，确认 diff 质量再全量。
7. **不要相信工具自带的 dry-run 开关**（见 `PLAN.md` 的事故记录）。

## 二、目录结构

```
D:\cherry-work\langconfig汉化实施\
├─ README.md            ← 本文件：工作区约定
├─ PLAN.md              ← 完整实施方案（阶段、工具、验收）
├─ GLOSSARY.md          ← 术语表（翻译与代码 review 的唯一依据）
├─ app/                 ← 【生成】clone 的工作副本，改造在此进行
├─ tools/               ← 【生成】codemod、翻译、校验脚本
├─ report/              ← 【生成】扫描报告、覆盖率、批次清单
├─ assets/              ← 【生成】伪本地化截图、对比图
└─ deliverables/        ← 【生成】最终语言包与补丁
```

除三个说明文件外，其余目录由执行过程生成。

## 三、源项目事实（2026-10-23 核实）

| 项 | 值 |
| --- | --- |
| 源项目路径 | `D:\deepseek ojbect\projectA\langconfig`（注意 `ojbect` 是原始拼写，不是笔误） |
| 上游仓库 | `https://github.com/LangConfig/langconfig`（MIT） |
| 基线 commit | `eb786cf8efe0b6cc9e45d07362e66da6ec465424`（2026-10-01） |
| 技术栈 | Vite 7 + React 19 + TypeScript 5.8 + zustand 5 + react-router 7 |
| 规模 | 162 个 `.tsx` / 231 个 ts·tsx |
| 文案量 | **2856 条硬编码字符串 / 125 个文件**（i18next-cli 实测） |
| 现有 i18n | 无 |
| 后端 | FastAPI，8780 端口；前端 1425；Postgres 容器 5433 |

## 四、运行环境（本机）

- 启动方式：桌面 `AIAGENT tools\启动LangConfig.lnk`（会自动拉数据库 + 后端 + 前端）
- 访问地址：<http://localhost:1425>
- 后端入口：源项目 `_launcher/run_backend.py`（已修 Windows 的 reload 与事件循环问题）
- 日志：源项目 `logs/backend.log`、`logs/frontend.log`

改造期间如果要在 `app/` 里跑起来验证，需要：

```bash
cd app
npm install
# 后端沿用源项目的 .venv 与 _launcher，或复制一份（见 PLAN.md 的"本地验证"一节）
```

## 五、交付判定

完成 MVP 后，需要能回答"是"的四个问题：

1. 设置页能切换中英文，刷新后保持；
2. 主流程（打开项目 → 新建工作流 → 加节点 → 保存）全中文；
3. `npm run typecheck` 与 `npm run build` 通过；
4. 伪本地化测试下，主流程页面无"未国际化漏网"、无截断。

详细阶段与验收见 `PLAN.md`。
