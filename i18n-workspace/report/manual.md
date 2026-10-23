# 需人工处理 / 未自动改写清单

> codemod 只处理「纯静态、无插值」的 JSX 文本与白名单属性。
> 以下条目被主动跳过，保持英文或需后续手工改写。

## 一、含插值的句子（跳过，保持英文）

codemod 统计：batch A 25 条、batch B 8 条、batch C 150 条，合计 **183 处**。

典型形态：

| 文件 | 原文 | 建议改法 |
| --- | --- | --- |
| `src/features/workflows/canvas/toolbar/WorkflowToolbar.tsx` | `Results {count}` / `Files {count}` / `Artifacts {count}` | **已手工处理**：`{t('Results')} {count}` |
| `src/components/common/AgentChatTester.tsx` | `Chat Tester - {agentName}` | `t('Chat Tester - {{name}}', { name: agentName })` |
| `src/pages/HomePage.tsx` | `View all {n} projects →` | **已手工处理**：`t('View all {{count}} projects →', { count })` |

逐条清单可用以下命令重新生成：

```bash
cd app && npx i18next-cli lint > ../report/lint-current.txt
```

## 二、expression-body 组件（未处理）

形如 `const Foo = () => <div>...</div>;` 的组件（无函数体块）无法安全插入 hook，
codemod 记入 `unhandled` 统计后跳过。这些文件里的文案保持英文。

## 三、`t` 命名冲突的组件（未处理）

函数体内已存在名为 `t` 的变量或参数时，插 hook 会产生遮蔽错误，codemod 跳过整个组件。
batch A 1 处、batch B 2 处、batch C 4 处（共 7 处）。

## 四、故意不翻（白名单）

见 `report/coverage.md` 第四节。

## 五、已知未译但影响体验的项

| 位置 | 说明 |
| --- | --- |
| 左侧「智能体库」面板（Agents / History / Workflow Recipes / Create Custom Agent） | 属 `features/agents`，P3 范围 |
| 工作流名 `Untitled Workflow` | 是数据值（会写入后端），非 JSX 文本；建议后续用 `t()` 包裹显示层 |
| 后端 `detail` 错误消息 | PLAN §9 明确不翻 |
| Monaco / React Flow 自带菜单 | 第三方组件，PLAN 白名单 |
