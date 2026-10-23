# P7 未映射的后端错误消息

> 由 `tools/p7report.py` 生成：对比 backend 的 `detail=` 与 `app/src/i18n/errorMap.ts`。

## 概览

| 指标 | 数值 |
| --- | --- |
| 后端 detail 出现次数 | 346 |
| 去重后的唯一消息 | 194 |
| errorMap 精确映射条目 | 77 |
| errorMap 正则模板 | 18 |
| 唯一消息中精确命中 | 68 |
| 未精确命中的唯一消息 | 126 |

> 说明：带变量的消息大多已被 `PATTERNS` 里的正则覆盖（如 `Skill 'x' not found`），
> 本表按「精确匹配」统计，因此模板类消息仍会出现在下方清单中，属正常现象。

## 未精确命中的消息（按出现次数排序）

| 次数 | 消息 | 建议 |
| --- | --- | --- |
| 7 | `MCP server '{server_id}' not found` | 模板正则覆盖 |
| 7 | `Skill '{skill_id}' not found` | 模板正则覆盖 |
| 6 | `Custom tool '{tool_id}' not found` | 模板正则覆盖 |
| 4 | `Local model with ID {model_id} not found` | 模板正则覆盖 |
| 4 | `Profile {profile_id} not found` | 模板正则覆盖 |
| 3 | `Job {job_id} not found` | 模板正则覆盖 |
| 3 | `Task {task_id} not found` | 模板正则覆盖 |
| 3 | `Export failed: {str(e)}` | 模板正则覆盖 |
| 2 | `Model server with ID {server_id} not found` | 模板正则覆盖 |
| 2 | `Invalid cron expression: {validation['error']}` | 模板正则覆盖 |
| 2 | `Invalid JSON schema: {str(e)}` | 模板正则覆盖 |
| 2 | `Custom schema '{schema_name}' not found` | 模板正则覆盖 |
| 2 | `Checkpoint {checkpoint_id} not found` | 模板正则覆盖 |
| 1 | `Failed to retrieve schemas: {str(e)}` | 模板正则覆盖 |
| 1 | `Anthropic API error: {e}` | 模板正则覆盖 |
| 1 | `Failed to load agent templates: {str(e)}` | 模板正则覆盖 |
| 1 | `Agent template '{template_id}' not found` | 模板正则覆盖 |
| 1 | `Failed to load agent template: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to load workflow recipes: {str(e)}` | 模板正则覆盖 |
| 1 | `Workflow recipe '{recipe_id}' not found` | 模板正则覆盖 |
| 1 | `Failed to load workflow recipe: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to generate authorization URL: {str(e)}` | 模板正则覆盖 |
| 1 | `Token exchange failed: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to get connection status: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to disconnect: {str(e)}` | 模板正则覆盖 |
| 1 | `Token refresh failed: {str(e)}` | 模板正则覆盖 |
| 1 | `Checkpoint inspection is only supported for the 'langgraph' runtime` | 模板正则覆盖 |
| 1 | `Failed to preview context: {str(e)}` | 模板正则覆盖 |
| 1 | `Approval request not found: {approval.approval_id}` | 模板正则覆盖 |
| 1 | `Invalid request: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to delete document: {str(e)}` | 模板正则覆盖 |
| 1 | `Project {request.project_id} not found` | 模板正则覆盖 |
| 1 | `Search failed: {str(e)}` | 模板正则覆盖 |
| 1 | `Project {project_id} not found` | 模板正则覆盖 |
| 1 | `Failed to get storage stats: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to list memory items: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to get memory item: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to create memory item: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to create memory items: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to delete memory item: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to clear memory: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to retrieve MCP server information: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to start MCP server: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to stop MCP server: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to retrieve memories: {str(e)}` | 模板正则覆盖 |
| 1 | `Memory search failed: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to retrieve stats: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to delete memory: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to clear memories: {str(e)}` | 模板正则覆盖 |
| 1 | `A local model with name '{model_data.name}' already exists` | 模板正则覆盖 |
| 1 | `Provider must be one of: {', '.join(VALID_PROVIDERS)}` | 模板正则覆盖 |
| 1 | `Invalid output format. Must be one of: {', '.join(valid_formats)}` | 模板正则覆盖 |
| 1 | `Invalid theme. Must be one of: {', '.join(valid_themes)}` | 模板正则覆盖 |
| 1 | `Job is not completed. Current status: {job.status}` | 模板正则覆盖 |
| 1 | `Invalid category: {category}` | 模板正则覆盖 |
| 1 | `Invalid action_type: {action_type}` | 模板正则覆盖 |
| 1 | `Invalid risk_level: {risk_level}` | 模板正则覆盖 |
| 1 | `Action preset not found: {preset_id}` | 模板正则覆盖 |
| 1 | `Failed to delete project: {str(e)}` | 模板正则覆盖 |
| 1 | `Repository already linked to this project (id={existing.id})` | 模板正则覆盖 |
| 1 | `Repository is currently {repo.sync_status.value}` | 模板正则覆盖 |
| 1 | `Failed to list output schemas: {str(e)}` | 模板正则覆盖 |
| 1 | `Output schema '{schema_name}' not found` | 模板正则覆盖 |
| 1 | `Failed to get output schema: {str(e)}` | 模板正则覆盖 |
| 1 | `Schema name '{schema_data.name}' conflicts with a built-in schema` | 模板正则覆盖 |
| 1 | `Custom schema '{schema_data.name}' already exists` | 模板正则覆盖 |
| 1 | `Failed to create custom schema: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to update custom schema: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to delete custom schema: {str(e)}` | 模板正则覆盖 |
| 1 | `Schema '{schema_name}' not found` | 模板正则覆盖 |
| 1 | `Failed to validate: {str(e)}` | 模板正则覆盖 |
| 1 | `Skill '{skill_id}' already exists` | 模板正则覆盖 |
| 1 | `Failed to create skill: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to update skill: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to delete skill: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to reload skill '{skill_id}'` | 模板正则覆盖 |
| 1 | `Cannot cancel task with status {task.status}. Only PENDING tasks can be cancelled.` | 模板正则覆盖 |
| 1 | `Failed to cancel task {task_id}` | 模板正则覆盖 |
| 1 | `Cannot retry task with status {task.status}. Only FAILED tasks can be retried.` | 模板正则覆盖 |
| 1 | `Task has already been retried {task.retry_count} times (max: {task.max_retries})` | 模板正则覆盖 |
| 1 | `Workflow {workflow_id} not found` | 模板正则覆盖 |
| 1 | `Error browsing directory: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to list custom tools: {str(e)}` | 模板正则覆盖 |
| 1 | `Tool with ID '{tool_data.tool_id}' already exists` | 模板正则覆盖 |
| 1 | `Failed to create custom tool: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to get custom tool: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to update custom tool: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to delete custom tool: {str(e)}` | 模板正则覆盖 |
| 1 | `Tool with ID '{new_tool_id}' already exists` | 模板正则覆盖 |
| 1 | `Failed to duplicate custom tool: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to test custom tool: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to list tool templates: {str(e)}` | 模板正则覆盖 |
| 1 | `Tool template '{template_id}' not found` | 模板正则覆盖 |
| 1 | `Failed to get tool template: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to export custom tool: {str(e)}` | 模板正则覆盖 |
| 1 | `Unsupported tool schema version: {schema_version}` | 模板正则覆盖 |
| 1 | `Invalid import file: missing 'tool' data` | 模板正则覆盖 |
| 1 | `Invalid JSON file` | 待补 |
| 1 | `Failed to import custom tool: {str(e)}` | 模板正则覆盖 |
| 1 | `Invalid trigger type. Must be one of: {[t.value for t in TriggerType]}` | 模板正则覆盖 |
| 1 | `Only webhook triggers have secrets` | 待补 |
| 1 | `IP not allowed` | 待补 |
| 1 | `Missing signature` | 待补 |
| 1 | `Invalid signature` | 待补 |
| 1 | `Failed to process webhook` | 待补 |
| 1 | `Invalid checkpoint_id format` | 待补 |
| 1 | `No checkpoints found for workflow {workflow_id}` | 模板正则覆盖 |
| 1 | `Continuation task not found` | 待补 |
| 1 | `Can only continue from a completed task` | 待补 |
| 1 | `Continuation task has no message history` | 待补 |
| 1 | `File not found: {filename}` | 模板正则覆盖 |
| 1 | `Workflow with name '{workflow.name}' already exists (case-insensitive match)` | 模板正则覆盖 |
| 1 | `Failed to create workflow: {str(e)}` | 模板正则覆盖 |
| 1 | `Validation failed for field '{e.field}': {e.message}` | 模板正则覆盖 |
| 1 | `Permission denied for field '{e.field}': requires {e.permission.value} level` | 模板正则覆盖 |
| 1 | `Failed to update workflow: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to delete workflow: {str(e)}` | 模板正则覆盖 |
| 1 | `Failed to create workflow version: {str(e)}` | 模板正则覆盖 |
| 1 | `One or both versions not found` | 待补 |
| 1 | `Version {execution_data.version_id} not found for workflow {workflow_id}` | 模板正则覆盖 |

（共 126 条，仅列前 120 条）
