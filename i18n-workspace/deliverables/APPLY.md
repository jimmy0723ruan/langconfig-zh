# 如何把 i18n 补丁应用到 LangConfig

本补丁基于上游基线 `eb786cf8efe0b6cc9e45d07362e66da6ec465424`（2026-10-01）。
目标仓库：`D:\deepseek ojbect\projectA\langconfig`。

---

## 0. 先备份

补丁涉及 135 个源文件。应用前先留一个还原点：

```bash
cd "D:\deepseek ojbect\projectA\langconfig"
git status --short > ../langconfig-status-before-i18n.txt
git branch backup/pre-i18n HEAD      # 零成本还原点
```

> 源项目当前有几个**未跟踪**文件（`.venv/`、`i18next.config.ts`、`langgraph.json`、
> `studio_entry.py`）和一处 `.gitignore` 修改，补丁**不包含**它们，也不会覆盖它们。

---

## 1. 检查基线

```bash
git rev-parse HEAD
# 必须输出 eb786cf8efe0b6cc9e45d07362e66da6ec465424
```

若 HEAD 不是 `eb786cf`：

```bash
git checkout eb786cf
# 或者：在更新的 HEAD 上试运行（见第 2 步的 --check）
```

---

## 2. 试运行（不落盘）

```bash
git apply --check "D:\cherry-work\langconfig汉化实施\deliverables\i18n-mvp.patch"
```

- 无输出 = 可以应用。
- 报 `patch does not apply` = 基线不匹配，转第 6 节「手动降级方案」。

---

## 3. 应用

方式 A（保留为一个未提交改动，推荐）：

```bash
git apply "D:\cherry-work\langconfig汉化实施\deliverables\i18n-mvp.patch"
```

方式 B（保留 git 历史，拆成 4 个提交）：

```bash
git am --3way "D:\cherry-work\langconfig汉化实施\deliverables\i18n-mvp.patch"
```

方式 C（只想要语言包和 i18n 骨架，不要全部改造）：

```bash
git apply --include='src/i18n/**' --include='src/main.tsx' \
          --include='package.json' --include='package-lock.json' \
          --include='i18next.config.ts' \
          "D:\cherry-work\langconfig汉化实施\deliverables\i18n-mvp.patch"
```

---

## 4. 安装依赖

补丁给 `package.json` 增加了两个运行时依赖（`i18next`、`react-i18next`）：

```bash
cd "D:\deepseek ojbect\projectA\langconfig"
npm install
npm rebuild esbuild          # npm 11 会拦 postinstall，不跑则 vite 起不来
```

---

## 5. 启动并验证

```bash
# 后端
.venv\Scripts\python.exe _launcher\run_backend.py

# 前端（另开一个终端）
npm run dev
```

打开 <http://localhost:1425>，依次确认：

| 检查项 | 期望 |
| --- | --- |
| 顶部导航 | Studio / Spatial / Agents … 默认英文 |
| 设置 → 通用 → 第一块「语言」 | 下拉可选 English / 简体中文 |
| 选「简体中文」 | 首页、设置页、工作流画布立即变中文 |
| 刷新浏览器 | 仍是中文（`localStorage.langconfig.lang = "zh-CN"`） |
| 切回 English | 恢复英文，无中文残留（语言选项本身除外） |
| 浏览器控制台 | 无 `react-i18next` 警告 |

命令行复核：

```bash
npm run typecheck
npm run build
```

---

## 6. 回滚

### 6.1 未提交时（第 3 步方式 A）

```bash
git checkout -- .
git clean -fd src/i18n        # 删除新增的 src/i18n 目录
```

### 6.2 已提交时（第 3 步方式 B）

```bash
git reset --hard backup/pre-i18n
```

### 6.3 只想关掉中文显示

把浏览器 `localStorage` 的 `langconfig.lang` 删掉，或设置为 `en`：

```js
localStorage.removeItem('langconfig.lang'); location.reload();
```

### 6.4 手动降级方案（基线不匹配）

若 `git apply` 失败：

1. 只复制语言包：`deliverables/zh-CN.json` → `src/i18n/locales/zh-CN.json`
2. 只复制骨架：`src/i18n/index.ts`、`src/main.tsx` 的 Provider 改动
3. 其余文件改动按 `deliverables/i18n-mvp.patch` 中的 hunk 逐块手工合并

---

## 7. 常见问题

| 现象 | 原因 / 处理 |
| --- | --- |
| 启动报 `Port 1425 is already in use` | 源项目已在运行；先停旧进程，或 `npm run dev -- --port 1426` |
| 页面白屏、控制台报 `Failed to resolve import "i18next"` | 忘记 `npm install` |
| vite 启动报 `esbuild` 二进制缺失 | 执行 `npm rebuild esbuild` |
| 设置页一直转圈 | 后端 8780 未启动 |
| 中文界面仍有英文 | `report/coverage.md` 的白名单与未覆盖模块（P2–P4） |
