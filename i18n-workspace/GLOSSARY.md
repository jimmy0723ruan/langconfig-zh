# LangConfig 汉化术语表

> **P1 开始前必须定稿前 30 个词，之后只能追加、不能改义。**
> 出现术语与语境冲突时，以本表为准，并在 `report/term-conflicts.md` 记录。

## 一、翻译原则

1. **专有名词保留英文**：LangGraph、LangChain、LangSmith、OpenAI、Anthropic、Ollama、LM Studio、Hermes、Docker、React、Monaco。
2. **术语全站唯一**，同一概念不允许两种译法。
3. **按钮/菜单用动词原形**：保存、取消、删除、新建、编辑、关闭、刷新、运行、停止。
4. **中英文混排加空格**：`API 密钥`、`Token 数量`、`RAG 检索`。
5. **标点用全角**：中文句子内使用 `，。：；？！`；省略号用 `…`（一个字符）。
6. **技术标识符不翻**：变量名、状态值、文件路径、代码片段。

## 二、核心术语（前 30 条，P1 前定稿）

| 英文 | 中文 | 备注 |
| --- | --- | --- |
| Agent | 智能体 | 不使用"代理" |
| Subagent | 子智能体 | |
| Tool | 工具 | |
| Tool Call | 工具调用 | |
| Workflow | 工作流 | |
| Node | 节点 | 画布元素 |
| Edge | 连线 | 不使用"边" |
| Project | 项目 | |
| Session | 会话 | 聊天会话 |
| Run | 运行 | 动词与名词同形 |
| Execution | 执行 | 与 Run 区分：Execution 指过程 |
| Checkpoint | 检查点 | |
| Knowledge Base | 知识库 | |
| Repository | 仓库 | Git 仓库 |
| Embedding | 向量 | 名词优先用"向量" |
| Vector | 向量 | |
| Template | 模板 | |
| Skill | 技能 | |
| Memory | 记忆 | |
| Supervisor | 主管 | 多智能体调度 |
| Prompt | 提示词 | |
| Provider | 供应商 | 模型供应商 |
| Model | 模型 | |
| API Key | API 密钥 | |
| Cost | 费用 | |
| Log | 日志 | |
| Trace | 追踪 | |
| Stream | 流式 | 如"流式输出" |
| Middleware | 中间件 | |
| Workspace | 工作区 | |

## 三、扩展术语

| 英文 | 中文 | 备注 |
| --- | --- | --- |
| Canvas | 画布 | |
| Palette | 面板 | 节点面板 |
| Library | 库 | 如"工作流库" |
| Community | 社区 | |
| Sandbox | 沙箱 | |
| HITL (Human-in-the-loop) | 人工介入 | 首次出现可注英文 |
| RAG | RAG 检索 | 保留 RAG |
| PII | 敏感信息 | 个人身份信息 |
| Fine-tune | 微调 | |
| Token | Token | 保留英文，前后加空格 |
| Streaming | 流式输出 | |
| Debug | 调试 | |
| Metric | 指标 | |
| Dataset | 数据集 | |
| Cron Schedule | 定时计划 | |
| Webhook | Webhook | 保留英文 |
| Import / Export | 导入 / 导出 | |
| Schema | 数据结构 | 首次出现可注 Schema |

## 四、固定按钮译法

| 英文 | 中文 |
| --- | --- |
| Save | 保存 |
| Cancel | 取消 |
| Delete | 删除 |
| Remove | 移除 |
| Create | 新建 |
| Edit | 编辑 |
| Close | 关闭 |
| Refresh | 刷新 |
| Run | 运行 |
| Stop | 停止 |
| Retry | 重试 |
| Confirm | 确认 |
| Dismiss | 忽略 |
| Browse | 浏览 |
| Upload | 上传 |
| Download | 下载 |
| Sync | 同步 |
| Apply | 应用 |
| Reset | 重置 |
| Copy | 复制 |
| Duplicate | 复制副本 |

## 五、状态类文案

| 英文 | 中文 |
| --- | --- |
| Loading… | 加载中… |
| Saving… | 保存中… |
| Running… | 运行中… |
| Completed | 已完成 |
| Failed | 失败 |
| Pending | 待处理 |
| Cancelled | 已取消 |
| No results | 没有结果 |
| No project selected | 未选择项目 |
| Select a project to continue | 请先选择一个项目 |

## 六、维护规则

1. 新增术语先加本表，再进入语言包；
2. 每周检查一次 `report/coverage.md` 中术语表未覆盖的高频词；
3. 若发现全站译法不一致，以本表为准批量修正，并记录到 `report/term-conflicts.md`。
