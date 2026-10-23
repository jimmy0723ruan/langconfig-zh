/**
 * Copyright (c) 2025 Cade Russell (Ghost Peony)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Backend error message translation (P7).
 *
 * The FastAPI backend returns English `detail` strings. Rather than rewriting
 * 346 Python call sites (and losing API-level language neutrality), the front
 * end maps the common messages to Chinese here.
 *
 * Resolution order:
 *   1. exact match in EXACT_ERRORS
 *   2. regex patterns in PATTERNS (for messages carrying ids / names)
 *   3. return the original text unchanged
 *
 * Only messages that reach the user belong here; internal ids are preserved
 * verbatim inside quotes.
 */

import i18n from './index';

export const EXACT_ERRORS: Record<string, string> = {
  'Workflow not found': '工作流不存在',
  'Task not found': '任务不存在',
  'Session not found': '会话不存在',
  'File not found': '文件不存在',
  'Trigger not found': '触发器不存在',
  'Repository not found': '仓库不存在',
  'Schedule not found': '计划不存在',
  'Project not found': '项目不存在',
  'Document not found': '文档不存在',
  'DeepAgent not found': 'DeepAgent 不存在',
  'Version not found': '版本不存在',
  'Message not found': '消息不存在',
  'Agent not found': '智能体不存在',
  'Image not found': '图片不存在',
  'Webhook trigger not found': 'Webhook 触发器不存在',
  'Source workflow not found': '源工作流不存在',
  'Result file not found': '结果文件不存在',
  'Result file no longer exists': '结果文件已不存在',
  'Store not available. Long-term memory is not initialized.': '长期记忆尚未初始化，无法使用该存储。',
  'Task has no associated workflow': '该任务没有关联的工作流',
  'Session is not active': '会话未激活',
  'Repository is not cloned yet': '仓库尚未克隆',
  'Repository directory missing': '仓库目录不存在',
  'Path is not a directory': '该路径不是目录',
  'Path escapes repository root': '路径超出仓库根目录',
  'Path not found in repo': '仓库中找不到该路径',
  'Invalid path': '路径无效',
  'File not found or could not be deleted': '文件不存在或无法删除',
  'File metadata not found': '文件元数据不存在',
  'File lives in an excluded directory': '文件位于被排除的目录中',
  'Error reading file': '读取文件出错',
  'Could not rename file. It may not exist, or target name already exists.':
    '无法重命名文件：文件可能不存在，或目标名称已存在。',
  'Project with this name already exists': '同名项目已存在',
  'Version conflict detected. Another version was created concurrently. Please retry.':
    '检测到版本冲突：另一版本被并发创建，请重试。',
  'Trigger is disabled': '触发器已禁用',
  'Task cannot be cancelled': '该任务无法取消',
  'Use /reject endpoint to reject HITL': '请使用 /reject 接口拒绝人工审批',
  'watch_path is required for file_watch triggers': '文件监视触发器必须提供 watch_path',
  'python-docx library not installed': '未安装 python-docx 库',
  'Resource not found': '资源不存在',
  'Resource was modified by another user': '资源已被其他用户修改',
  'Validation failed': '校验失败',
  'Access denied': '无权访问',
  'Server error. Please try again later.': '服务器错误，请稍后重试。',
  'Network error. Please check your connection.': '网络错误，请检查网络连接。',
  'Experimental local APIs are disabled': '实验性本地 API 已禁用',
  'Experimental APIs accept loopback requests only': '实验性 API 仅接受本机回环请求',
  'Export not found': '导出记录不存在',
  'Export file not found': '导出文件不存在',
  'Invalid .langconfig format': '.langconfig 格式无效',
  'Invalid JSON format': 'JSON 格式无效',
  'Failed to generate agent configuration': '生成智能体配置失败',
  'Failed to refresh token. Re-authentication may be required.': '刷新令牌失败，可能需要重新登录。',
  'Only user messages can be deleted': '只能删除用户消息',
  'Hermes draft not found': 'Hermes 草稿不存在',
  'Comment required for rejection': '拒绝时必须填写说明',
  'No files provided': '未提供文件',
  'Memory item not found': '记忆条目不存在',
  'Memory not found': '记忆不存在',
  'server_id in URL must match server_id in request body': 'URL 中的 server_id 必须与请求体中的一致',
  'Base URL should end with /v1': '基础 URL 应以 /v1 结尾',
  'Google account not connected. Please connect your Google account first.':
    '尚未连接 Google 账号，请先连接。',
  'Google Slides presentations cannot be downloaded. Use the result_url to access the presentation.':
    'Google Slides 演示文稿无法下载，请通过 result_url 访问。',
  'Failed to delete repository': '删除仓库失败',
  'Invalid file path': '文件路径无效',
  'File type is not ingestable': '该文件类型无法入库',
  'Cannot trigger disabled schedule': '无法触发已禁用的计划',
  'Cannot modify built-in schemas': '不能修改内置数据结构',
  'Cannot delete built-in schemas': '不能删除内置数据结构',
  'Cannot delete builtin skills': '不能删除内置技能',
  'Invalid provider': '供应商无效',
  'API key not found': 'API 密钥不存在',
  'Directory not found': '目录不存在',
  'Cannot delete a task in progress': '进行中的任务无法删除',
  'IP not allowed': 'IP 不在允许范围内',
  'Invalid signature': '签名无效',
  'Missing signature': '缺少签名',
  'File not found or invalid path': '文件不存在或路径无效',
  'Continuation task not found': '续接的任务不存在',
};

type PatternRule = { pattern: RegExp; build: (match: RegExpMatchArray) => string };

export const PATTERNS: PatternRule[] = [
  { pattern: /^(Skill|MCP server|Custom tool|Custom schema) '(.+)' not found$/, build: (m) => `${kindLabel(m[1])}「${m[2]}」不存在` },
  { pattern: /^(Task|Job|Checkpoint) (.+) not found$/, build: (m) => `${kindLabel(m[1])} ${m[2]} 不存在` },
  { pattern: /^Workflow recipe '(.+)' not found$/, build: (m) => `工作流配方「${m[1]}」不存在` },
  { pattern: /^Workflow (\d+) not found$/, build: (m) => `工作流 ${m[1]} 不存在` },
  { pattern: /^Profile (.+) not found$/, build: (m) => `配置 ${m[1]} 不存在` },
  { pattern: /^Local model with ID (.+) not found$/, build: (m) => `本地模型 ${m[1]} 不存在` },
  { pattern: /^Model server with ID (.+) not found$/, build: (m) => `模型服务器 ${m[1]} 不存在` },
  { pattern: /^Version (.+) not found for workflow (.+)$/, build: (m) => `工作流 ${m[2]} 中不存在版本 ${m[1]}` },
  { pattern: /^Invalid cron expression: (.+)$/, build: (m) => `Cron 表达式无效：${m[1]}` },
  { pattern: /^Invalid JSON schema: (.+)$/, build: (m) => `JSON 数据结构无效：${m[1]}` },
  { pattern: /^Export failed: (.+)$/, build: (m) => `导出失败：${m[1]}` },
  { pattern: /^Workflow with name '(.+)' already exists.*$/, build: (m) => `名为「${m[1]}」的工作流已存在` },
  { pattern: /^Tool with ID '(.+)' already exists$/, build: (m) => `ID 为「${m[1]}」的工具已存在` },
  { pattern: /^Validation failed for field '(.+)': (.+)$/, build: (m) => `字段「${m[1]}」校验失败：${m[2]}` },
  { pattern: /^Unsupported tool schema version: (.+)$/, build: (m) => `不支持的工具数据结构版本：${m[1]}` },
  { pattern: /^Rate limit exceeded\. Please wait (\d+) seconds\.$/, build: (m) => `请求过于频繁，请等待 ${m[1]} 秒后重试。` },
  { pattern: /^Rate limit exceeded\. Maximum (\d+) requests per minute\.$/, build: (m) => `请求过于频繁：每分钟最多 ${m[1]} 次。` },
  { pattern: /^Request failed with status (?:code )?(\d+)$/, build: (m) => `请求失败（状态码 ${m[1]}）` },
];

function kindLabel(kind: string): string {
  const map: Record<string, string> = {
    Skill: '技能',
    'MCP server': 'MCP 服务器',
    'Custom tool': '自定义工具',
    'Custom schema': '自定义数据结构',
    Task: '任务',
    Job: '作业',
    Checkpoint: '检查点',
  };
  return map[kind] ?? kind;
}

/** Translate one backend error message; unknown messages pass through. */
export function translateApiMessage(message: string | undefined | null): string {
  if (!message) return '';
  // Only translate while the UI is in Chinese; English uses the raw backend text.
  if (!i18n.resolvedLanguage?.startsWith('zh')) return message;

  const exact = EXACT_ERRORS[message];
  if (exact) return exact;

  for (const rule of PATTERNS) {
    const match = message.match(rule.pattern);
    if (match) return rule.build(match);
  }
  return message;
}

/** True when the message can be translated (used by the report tooling). */
export function isMapped(message: string): boolean {
  if (EXACT_ERRORS[message]) return true;
  return PATTERNS.some((rule) => rule.pattern.test(message));
}
