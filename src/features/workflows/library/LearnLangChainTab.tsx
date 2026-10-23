/**
 * Copyright (c) 2025 Cade Russell (Ghost Peony)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function LearnLangChainTab() {
  const { t } = useTranslation();
  const [expandedSection, setExpandedSection] = useState<string | null>('agent-fundamentals');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            {t('Learn LangChain & LangGraph')}
          </h2>
          <p className="text-base" style={{ color: 'var(--color-text-muted)' }}>
            {t('Master the fundamentals of building production-ready AI agents')}
          </p>
        </div>

        {/* Official Documentation Link */}
        <a
          href="https://docs.langchain.com/oss/python/langchain/overview"
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-2xl text-primary">menu_book</span>
            <div>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {t('Official LangChain Documentation')}
              </h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {t('Comprehensive guides, API references, and tutorials')}
              </p>
            </div>
            <span className="material-symbols-outlined text-primary ml-auto">open_in_new</span>
          </div>
        </a>

        {/* Learning Sections */}
        <div className="space-y-3">
          {/* Section 1: Agent Fundamentals */}
          <div className="border border-gray-200 dark:border-border-dark rounded-lg overflow-hidden bg-white dark:bg-panel-dark">
            <button
              onClick={() => toggleSection('agent-fundamentals')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">psychology</span>
                <span className="font-semibold text-left" style={{ color: 'var(--color-text-primary)' }}>
                  {t('1. Agent Fundamentals')}
                </span>
              </div>
              <span
                className={`material-symbols-outlined transition-transform ${expandedSection === 'agent-fundamentals' ? 'rotate-180' : ''
                  }`}
                style={{ color: 'var(--color-text-muted)' }}
              >
                expand_more
              </span>
            </button>
            {expandedSection === 'agent-fundamentals' && (
              <div className="px-6 pb-6 space-y-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('What is a LangChain Agent?')}
                  </h4>
                  <p className="leading-relaxed mb-3">
                    {t("An agent uses a language model to determine which actions to take and in what order.")}{' '}{t("Unlike chains where the sequence is hardcoded, agents use an LLM as a reasoning engine to decide the control flow.")}
                  </p>
                  <a
                    href="https://python.langchain.com/docs/modules/agents/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    <span>{t('Read more in LangChain Agents docs')}</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Agent Types')}
                  </h4>
                  <ul className="space-y-3 ml-4">
                    <li>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{t('Tool Calling Agents:')}</strong> {t("The modern standard for most use cases.")}{' '}{t("Leverages native tool calling capabilities of models (like OpenAI or Anthropic) for reliable, structured execution.")}
                      <a
                        href="https://python.langchain.com/docs/modules/agents/agent_types/tool_calling/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:underline text-xs"
                      >
                        {t('Docs ↗')}
                      </a>
                    </li>
                    <li>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{t('Plan-and-Execute:')}</strong> {t("First plans the full sequence of steps, then executes them.")}{' '}{t("Better for complex tasks requiring upfront planning.")}
                      <a
                        href="https://python.langchain.com/docs/use_cases/plan_and_execute"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-primary hover:underline text-xs"
                      >
                        {t('Docs ↗')}
                      </a>
                    </li>
                    <li>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{t('Structured Output:')}</strong> {t('Agents designed specifically to return structured data (JSON/Pydantic) rather than free text, ideal for data extraction tasks.')}
                    </li>
                  </ul>
                </div>

                <div className="p-3 rounded bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30">
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">lightbulb</span>
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      <strong>{t('Tip:')}</strong> {t("Start with Tool Calling Agents.")}{' '}{t("They are more reliable and faster than legacy ReAct agents because they use the model's fine-tuned tool capabilities.")}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: LangGraph State Machines */}
          <div className="border border-gray-200 dark:border-border-dark rounded-lg overflow-hidden bg-white dark:bg-panel-dark">
            <button
              onClick={() => toggleSection('langgraph')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">account_tree</span>
                <span className="font-semibold text-left" style={{ color: 'var(--color-text-primary)' }}>
                  {t('2. LangGraph State Machines')}
                </span>
              </div>
              <span
                className={`material-symbols-outlined transition-transform ${expandedSection === 'langgraph' ? 'rotate-180' : ''
                  }`}
                style={{ color: 'var(--color-text-muted)' }}
              >
                expand_more
              </span>
            </button>
            {expandedSection === 'langgraph' && (
              <div className="px-6 pb-6 space-y-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('What is LangGraph?')}
                  </h4>
                  <p className="leading-relaxed mb-3">
                    {t("LangGraph is a library for building stateful, multi-actor applications with LLMs.")}{' '}{t("It extends LangChain with the ability to coordinate multiple chains (or actors) across multiple steps of computation in a cyclic manner.")}
                  </p>
                  <a
                    href="https://langchain-ai.github.io/langgraph/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    <span>{t('LangGraph Official Documentation')}</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Key Concepts')}
                  </h4>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li><strong>{t('State Graph:')}</strong> {t('Defines nodes (agents/functions) and edges (transitions) between them')}</li>
                    <li><strong>{t('State:')}</strong> {t('Shared data structure passed between nodes')}</li>
                    <li><strong>{t('Conditional Edges:')}</strong> {t('Dynamic routing based on state or outputs')}</li>
                    <li><strong>{t('Checkpointing:')}</strong> {t('Save and resume execution state for long-running workflows')}</li>
                    <li><strong>{t('Human-in-the-Loop:')}</strong> {t('Pause execution for human review and intervention')}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Why Use LangGraph?')}
                  </h4>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>{t('Coordinate multiple agents in complex workflows')}</li>
                    <li>{t('Implement cyclic logic (loops, retries, feedback)')}</li>
                    <li>{t('Persist conversation state across sessions')}</li>
                    <li>{t('Build production-ready multi-agent systems')}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Tools & Function Calling */}
          <div className="border border-gray-200 dark:border-border-dark rounded-lg overflow-hidden bg-white dark:bg-panel-dark">
            <button
              onClick={() => toggleSection('tools')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">build</span>
                <span className="font-semibold text-left" style={{ color: 'var(--color-text-primary)' }}>
                  {t('3. Tools & Function Calling')}
                </span>
              </div>
              <span
                className={`material-symbols-outlined transition-transform ${expandedSection === 'tools' ? 'rotate-180' : ''
                  }`}
                style={{ color: 'var(--color-text-muted)' }}
              >
                expand_more
              </span>
            </button>
            {expandedSection === 'tools' && (
              <div className="px-6 pb-6 space-y-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('What are Tools?')}
                  </h4>
                  <p className="leading-relaxed mb-3">
                    {t("Tools are interfaces that an agent can use to interact with the world.")}{' '}{t("They enable agents to perform actions like searching the web, querying databases, making API calls, or running code.")}
                  </p>
                  <a
                    href="https://python.langchain.com/docs/modules/tools/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    <span>{t('LangChain Tools Documentation')}</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Built-in Tools in LangConfig')}
                  </h4>
                  <ul className="space-y-2 ml-4">
                    <li><strong>{t('Web Search:')}</strong> {t('Search the internet for current information')}</li>
                    <li><strong>{t('File Operations:')}</strong> {t('Read/write files in your project')}</li>
                    <li><strong>{t('Code Execution:')}</strong> {t('Run Python code safely')}</li>
                    <li><strong>{t('RAG (Retrieval):')}</strong> {t('Search your knowledge base documents')}</li>
                    <li><strong>{t('GitHub Integration:')}</strong> {t('Interact with GitHub repositories')}</li>
                    <li><strong>{t('Browser Automation:')}</strong> {t('Control web browsers via Puppeteer')}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Tool Selection Strategy')}
                  </h4>
                  <p className="leading-relaxed">
                    {t("Give agents only the tools they need.")}{' '}{t("Too many tools can confuse the model and increase costs.")}{' '}{t("Start minimal and add tools as requirements emerge.")}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: RAG Implementation */}
          <div className="border border-gray-200 dark:border-border-dark rounded-lg overflow-hidden bg-white dark:bg-panel-dark">
            <button
              onClick={() => toggleSection('rag')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">database</span>
                <span className="font-semibold text-left" style={{ color: 'var(--color-text-primary)' }}>
                  {t('4. RAG (Retrieval Augmented Generation)')}
                </span>
              </div>
              <span
                className={`material-symbols-outlined transition-transform ${expandedSection === 'rag' ? 'rotate-180' : ''
                  }`}
                style={{ color: 'var(--color-text-muted)' }}
              >
                expand_more
              </span>
            </button>
            {expandedSection === 'rag' && (
              <div className="px-6 pb-6 space-y-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('What is RAG?')}
                  </h4>
                  <p className="leading-relaxed mb-3">
                    {t("RAG combines retrieval of relevant documents with generation.")}{' '}{t("Instead of relying solely on the LLM's training data, RAG retrieves relevant information from your documents and provides it as context for generation.")}
                  </p>
                  <a
                    href="https://python.langchain.com/docs/use_cases/question_answering/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    <span>{t('LangChain RAG Tutorial')}</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('RAG Pipeline Steps')}
                  </h4>
                  <ol className="space-y-2 ml-4 list-decimal">
                    <li><strong>{t('Indexing:')}</strong> {t('Load documents, split into chunks, create embeddings, store in vector DB')}</li>
                    <li><strong>{t('Retrieval:')}</strong> {t('Embed user query, find similar chunks via vector search')}</li>
                    <li><strong>{t('Generation:')}</strong> {t('Pass retrieved context + query to LLM for answer')}</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Using RAG in LangConfig')}
                  </h4>
                  <p className="leading-relaxed">
                    {t("Upload documents to the Knowledge Base, then enable the RAG tool on your agent.")}{' '}{t("The agent will automatically search your documents when relevant to the user's query.")}
                  </p>
                </div>

                <div className="p-3 rounded bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30">
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-sm">tips_and_updates</span>
                    <p className="text-xs text-purple-800 dark:text-purple-300">
                      <strong>{t('Pro Tip:')}</strong> {t('Chunk your documents into 500-1000 token pieces for optimal retrieval performance.')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Prompt Engineering */}
          <div className="border border-gray-200 dark:border-border-dark rounded-lg overflow-hidden bg-white dark:bg-panel-dark">
            <button
              onClick={() => toggleSection('prompts')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                <span className="font-semibold text-left" style={{ color: 'var(--color-text-primary)' }}>
                  {t('5. System Prompt Engineering')}
                </span>
              </div>
              <span
                className={`material-symbols-outlined transition-transform ${expandedSection === 'prompts' ? 'rotate-180' : ''
                  }`}
                style={{ color: 'var(--color-text-muted)' }}
              >
                expand_more
              </span>
            </button>
            {expandedSection === 'prompts' && (
              <div className="px-6 pb-6 space-y-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Effective System Prompts')}
                  </h4>
                  <p className="leading-relaxed mb-3">
                    {t("System prompts define your agent's role, capabilities, constraints, and output format.")}{' '}{t("A well-crafted system prompt is the foundation of reliable agent behavior.")}
                  </p>
                  <a
                    href="https://python.langchain.com/docs/modules/model_io/prompts/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    <span>{t('Prompt Templates Documentation')}</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Key Components')}
                  </h4>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li><strong>{t('Role:')}</strong> {t('Define who the agent is (e.g., "You are an expert Python developer")')}</li>
                    <li><strong>{t('Task:')}</strong> {t('Clearly state what they should do')}</li>
                    <li><strong>{t('Context:')}</strong> {t('Provide relevant background information')}</li>
                    <li><strong>{t('Constraints:')}</strong> {t('Set boundaries (what NOT to do)')}</li>
                    <li><strong>{t('Output Format:')}</strong> {t('Specify how to structure responses')}</li>
                    <li><strong>{t('Examples:')}</strong> {t('Show desired input/output pairs (few-shot learning)')}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Best Practices')}
                  </h4>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>{t('Be specific and explicit - avoid ambiguity')}</li>
                    <li>{t('Use clear, direct language')}</li>
                    <li>{t('Provide examples when possible')}</li>
                    <li>{t('Iterate based on agent behavior')}</li>
                    <li>{t('Test with edge cases')}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Section 6: Multi-Agent Workflows */}
          <div className="border border-gray-200 dark:border-border-dark rounded-lg overflow-hidden bg-white dark:bg-panel-dark">
            <button
              onClick={() => toggleSection('multi-agent')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">group_work</span>
                <span className="font-semibold text-left" style={{ color: 'var(--color-text-primary)' }}>
                  {t('6. Multi-Agent Workflows')}
                </span>
              </div>
              <span
                className={`material-symbols-outlined transition-transform ${expandedSection === 'multi-agent' ? 'rotate-180' : ''
                  }`}
                style={{ color: 'var(--color-text-muted)' }}
              >
                expand_more
              </span>
            </button>
            {expandedSection === 'multi-agent' && (
              <div className="px-6 pb-6 space-y-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('When to Use Multiple Agents')}
                  </h4>
                  <p className="leading-relaxed mb-3">
                    {t('Break complex tasks into specialized agents when:')}
                  </p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>{t('Different subtasks require different expertise')}</li>
                    <li>{t('You need separation of concerns')}</li>
                    <li>{t('Parallel execution can speed up workflows')}</li>
                    <li>{t('Different models are optimal for different steps')}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Common Patterns')}
                  </h4>
                  <ul className="space-y-3 ml-4">
                    <li>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{t('Sequential:')}</strong> {t('Agent A → Agent B → Agent C.')}{' '}{t('Output of one feeds into the next.')}
                    </li>
                    <li>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{t('Parallel:')}</strong> {t('Multiple agents process the same input simultaneously, results combined at the end.')}
                    </li>
                    <li>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{t('Supervisor:')}</strong> {t('One agent delegates tasks to specialized agents based on the request.')}
                    </li>
                    <li>
                      <strong style={{ color: 'var(--color-text-primary)' }}>{t('Hierarchical:')}</strong> {t('Agents organized in layers with higher-level agents coordinating lower-level ones.')}
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('State Management')}
                  </h4>
                  <p className="leading-relaxed">
                    {t("LangGraph manages shared state across agents.")}{' '}{t("Define your state schema carefully - it's how agents communicate.")}{' '}{t("Use typed dictionaries for clarity and validation.")}
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Section 7: Deep Agents */}
          <div className="border border-gray-200 dark:border-border-dark rounded-lg overflow-hidden bg-white dark:bg-panel-dark">
            <button
              onClick={() => toggleSection('deep-agents')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">psychology_alt</span>
                <span className="font-semibold text-left" style={{ color: 'var(--color-text-primary)' }}>
                  {t('7. Deep Agents (LangGraph)')}
                </span>
              </div>
              <span
                className={`material-symbols-outlined transition-transform ${expandedSection === 'deep-agents' ? 'rotate-180' : ''
                  }`}
                style={{ color: 'var(--color-text-muted)' }}
              >
                expand_more
              </span>
            </button>
            {expandedSection === 'deep-agents' && (
              <div className="px-6 pb-6 space-y-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('What is a Deep Agent?')}
                  </h4>
                  <p className="leading-relaxed mb-3">
                    {t("Deep Agents are advanced, stateful agents built on LangGraph.")}{' '}{t("Unlike regular agents that run a single chain of thought, Deep Agents maintain persistent state, support complex cyclic workflows, and can coordinate multiple sub-agents.")}
                  </p>
                  <a
                    href="https://langchain-ai.github.io/langgraph/concepts/agentic_patterns/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    <span>{t('LangGraph Agent Patterns')}</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Key Capabilities')}
                  </h4>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li><strong>{t('Subagents:')}</strong> {t('Delegate tasks to specialized agents (e.g., a "Coder" agent delegates to a "Tester" agent).')}</li>
                    <li><strong>{t('Compiled Workflows:')}</strong> {t('Agents are compiled into efficient state graphs for production execution.')}</li>
                    <li><strong>{t('Advanced Memory:')}</strong> {t('Persist conversation history and state across sessions using checkpoints.')}</li>
                    <li><strong>{t('Human-in-the-loop:')}</strong> {t('Pause execution for approval before critical actions (like deploying code).')}</li>
                  </ul>
                </div>

                <div className="p-3 rounded bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30">
                  <div className="flex gap-2">
                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-sm">tips_and_updates</span>
                    <p className="text-xs text-purple-800 dark:text-purple-300">
                      <strong>{t('When to use:')}</strong> {t('Switch to Deep Agents when you need long-running workflows, human approval steps, or multi-agent coordination.')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 8: Middleware */}
          <div className="border border-gray-200 dark:border-border-dark rounded-lg overflow-hidden bg-white dark:bg-panel-dark">
            <button
              onClick={() => toggleSection('middleware')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">layers</span>
                <span className="font-semibold text-left" style={{ color: 'var(--color-text-primary)' }}>
                  {t('8. Middleware & Interceptors')}
                </span>
              </div>
              <span
                className={`material-symbols-outlined transition-transform ${expandedSection === 'middleware' ? 'rotate-180' : ''
                  }`}
                style={{ color: 'var(--color-text-muted)' }}
              >
                expand_more
              </span>
            </button>
            {expandedSection === 'middleware' && (
              <div className="px-6 pb-6 space-y-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('What is Middleware?')}
                  </h4>
                  <p className="leading-relaxed mb-3">
                    {t("Middleware allows you to intercept and modify the inputs and outputs of your agents or tools.")}{' '}{t("It wraps the execution logic, enabling you to add cross-cutting concerns without changing the core agent logic.")}
                  </p>
                  <a
                    href="https://python.langchain.com/docs/expression_language/primitives/binding/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    <span>{t('RunnableBinding Documentation')}</span>
                    <span className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Common Use Cases')}
                  </h4>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li><strong>{t('Logging & Tracing:')}</strong> {t('Capture inputs/outputs for debugging or auditing.')}</li>
                    <li><strong>{t('Guardrails:')}</strong> {t('Validate inputs or outputs to ensure safety (e.g., PII filtering).')}</li>
                    <li><strong>{t('Rate Limiting:')}</strong> {t('Control the frequency of tool calls.')}</li>
                    <li><strong>{t('Context Injection:')}</strong> {t('Automatically add user context or metadata to prompts.')}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Section 9: Action Presets & Tool Safety */}
          <div className="border border-gray-200 dark:border-border-dark rounded-lg overflow-hidden bg-white dark:bg-panel-dark">
            <button
              onClick={() => toggleSection('action-presets')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">shield</span>
                <span className="font-semibold text-left" style={{ color: 'var(--color-text-primary)' }}>
                  {t('9. Action Presets & Tool Safety')}
                </span>
              </div>
              <span
                className={`material-symbols-outlined transition-transform ${expandedSection === 'action-presets' ? 'rotate-180' : ''
                  }`}
                style={{ color: 'var(--color-text-muted)' }}
              >
                expand_more
              </span>
            </button>
            {expandedSection === 'action-presets' && (
              <div className="px-6 pb-6 space-y-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('What are Action Presets?')}
                  </h4>
                  <p className="leading-relaxed mb-3">
                    {t("Action Presets are backend safety mechanisms that automatically enforce execution constraints on tools.")}{' '}{t("They provide automatic timeouts, retry logic, and human-in-the-loop (HITL) approval gates to ensure safe tool execution in production environments.")}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Automatic Timeouts')}
                  </h4>
                  <p className="leading-relaxed mb-2">
                    {t('Tools are automatically wrapped with timeout constraints to prevent runaway processes:')}
                  </p>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('Terminal Commands:')}</strong> {t('60-second timeout to prevent hanging processes')}</li>
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('Web Searches:')}</strong> {t('30-second timeout for API calls')}</li>
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('File Operations:')}</strong> {t('20-second timeout for I/O operations')}</li>
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('Retry Logic:')}</strong> {t('Configurable max retries with exponential backoff')}</li>
                  </ul>
                  <p className="leading-relaxed mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {t('If a tool exceeds its timeout, execution is immediately terminated and the agent receives an error message.')}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Human-in-the-Loop (HITL) Approvals')}
                  </h4>
                  <p className="leading-relaxed mb-2">
                    {t('High-risk tools require explicit human approval before execution:')}
                  </p>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('Terminal Access:')}</strong> {t('Any command line execution pauses for approval')}</li>
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('File System Writes:')}</strong> {t('Creating, modifying, or deleting files')}</li>
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('External API Calls:')}</strong> {t('POST/PUT/DELETE operations to external services')}</li>
                  </ul>
                  <p className="leading-relaxed mt-3">
                    {t("When a tool requires approval, the workflow pauses and displays the tool details, inputs, and recommended actions.")}{' '}{t("You can approve, reject, or modify the operation before it proceeds.")}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Recommended Middleware')}
                  </h4>
                  <p className="leading-relaxed mb-2">
                    {t('Action Presets suggest middleware patterns for each tool category:')}
                  </p>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('Logging:')}</strong> {t('Capture all tool inputs/outputs for debugging and audit trails')}</li>
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('Cost Tracking:')}</strong> {t('Monitor API usage and token consumption per tool')}</li>
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('PII Redaction:')}</strong> {t('Automatically scrub sensitive data from logs')}</li>
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('Rate Limiting:')}</strong> {t('Control execution frequency to prevent API abuse')}</li>
                  </ul>
                  <p className="leading-relaxed mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {t('Middleware is optional but highly recommended for production deployments.')}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Example Configuration')}
                  </h4>
                  <pre className="text-xs p-4 rounded-lg bg-gray-50 dark:bg-black/20 overflow-x-auto border border-gray-200 dark:border-border-dark font-mono leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
{`{
  "preset_id": "terminal_access",
  "name": "Terminal Access",
  "requires_approval": true,
  "constraints": {
    "max_duration_seconds": 60,
    "max_retries": 0,
    "timeout_strategy": "kill",
    "exclusive": true
  },
  "recommended_middleware": [
    "logging",
    "cost_tracking"
  ],
  "best_practices": [
    "Always validate commands",
    "Use absolute paths",
    "Avoid interactive commands"
  ]
}`}
                  </pre>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('How It Works')}
                  </h4>
                  <p className="leading-relaxed mb-2">
                    {t('When you enable a tool in your agent configuration, LangConfig automatically:')}
                  </p>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li>{t('Wraps the tool with execution constraints (timeouts, retries, exclusive locks)')}</li>
                    <li>{t('Injects HITL approval gates for operations that require human review')}</li>
                    <li>{t('Applies recommended middleware patterns if configured')}</li>
                    <li>{t('Logs execution metrics and error traces for monitoring')}</li>
                  </ul>
                  <p className="leading-relaxed mt-3">
                    <strong style={{ color: 'var(--color-text-primary)' }}>{t('Optional but recommended')}</strong> {t("- Action Presets are disabled by default to give you full control during development.")}{' '}{t("Enable them for production deployments to add automatic safety guardrails.")}
                  </p>
                </div>

                <div className="p-4 rounded border" style={{ backgroundColor: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                  <div className="flex gap-3">
                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 flex-shrink-0">info</span>
                    <div>
                      <h4 className="text-sm font-semibold mb-1 text-blue-800 dark:text-blue-400">
                        {t('Production Safety')}
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-400/80">
                        {t("Action Presets are essential for production deployments.")}{' '}{t("They prevent runaway processes, enforce approval workflows, and ensure tools execute within safe boundaries.")}{' '}{t("All constraints are enforced at the backend level, independent of the frontend UI.")}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Learn More')}
                  </h4>
                  <div className="space-y-2">
                    <a
                      href="https://python.langchain.com/docs/concepts/tools/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                    >
                      <span>{t('LangChain Tools Documentation')}</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 10: Dynamic Subagents */}
          <div className="border border-gray-200 dark:border-border-dark rounded-lg overflow-hidden bg-white dark:bg-panel-dark">
            <button
              onClick={() => toggleSection('dynamic-subagents')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">account_tree</span>
                <span className="font-semibold text-left" style={{ color: 'var(--color-text-primary)' }}>
                  {t('10. Dynamic Subagents')}
                </span>
              </div>
              <span
                className={`material-symbols-outlined transition-transform ${expandedSection === 'dynamic-subagents' ? 'rotate-180' : ''
                  }`}
                style={{ color: 'var(--color-text-muted)' }}
              >
                expand_more
              </span>
            </button>
            {expandedSection === 'dynamic-subagents' && (
              <div className="px-6 pb-6 space-y-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Eval as an Orchestration Layer')}
                  </h4>
                  <p className="leading-relaxed mb-3">
                    {t("DeepAgents can expose a QuickJS eval tool.")}{' '}{t("The agent writes a small JavaScript program, dispatches configured subagents with task(), and composes their typed results with normal control flow such as loops, branches, and Promise.all.")}
                  </p>
                  <div className="space-y-2">
                    <a
                      href="https://docs.langchain.com/oss/python/deepagents/dynamic-subagents"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline text-xs mr-4"
                    >
                      <span>{t('Dynamic subagents docs')}</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                    <a
                      href="https://docs.langchain.com/oss/python/deepagents/interpreters"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                    >
                      <span>{t('Interpreter docs')}</span>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </a>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Good Fit')}
                  </h4>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('Fan-out research:')}</strong> {t('run multiple analysts in parallel, then synthesize disagreements.')}</li>
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('Verification loops:')}</strong> {t('generate an answer, send it to critics, and revise from structured issues.')}</li>
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('Tournament patterns:')}</strong> {t('compare competing plans or implementations before selecting one.')}</li>
                    <li><strong style={{ color: 'var(--color-text-primary)' }}>{t('Typed reductions:')}</strong> {t('ask subagents for JSON-shaped outputs, then aggregate them in eval.')}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Safety Model')}
                  </h4>
                  <ul className="space-y-2 ml-4 list-disc">
                    <li>{t('Keep eval approval enabled unless the agent is fully sandboxed and low-risk.')}</li>
                    <li>{t('Use task() for dynamic subagents; keep direct host-tool PTC disabled unless a tool is explicitly safe.')}</li>
                    <li>{t('Subagent task calls from eval are not parent tool calls, so put approval rules inside subagents for sensitive work.')}</li>
                    <li>{t('Keep eval code short enough to review in the execution trace.')}</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    {t('Pattern')}
                  </h4>
                  <pre className="text-xs p-4 rounded-lg bg-gray-50 dark:bg-black/20 overflow-x-auto border border-gray-200 dark:border-border-dark font-mono leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
{`const docs = ["api.md", "workflows.md", "agents.md"];
const reviews = await Promise.all(
  docs.map((doc) =>
    task({
      subagentType: "analyzer",
      label: "Review " + doc,
      description: "Find risks and upgrade opportunities in " + doc,
      responseSchema: {
        summary: "string",
        findings: "string[]",
        confidence: "number"
      }
    })
  )
);

return await task({
  subagentType: "synthesizer",
  label: "Synthesize reviews",
  description: JSON.stringify(reviews)
});`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-8 p-4 rounded-lg border border-gray-200 dark:border-border-dark bg-gradient-to-br from-primary/5 to-transparent">
          <h3 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
            {t('Additional Resources')}
          </h3>
          <div className="space-y-2 text-sm">
            <a
              href="https://python.langchain.com/docs/expression_language/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
              <span>{t('LangChain Expression Language (LCEL)')}</span>
            </a>
            <a
              href="https://python.langchain.com/docs/modules/memory/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
              <span>{t('Memory & Conversation Management')}</span>
            </a>
            <a
              href="https://python.langchain.com/docs/use_cases/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
              <span>{t('Use Cases & Examples')}</span>
            </a>
          </div>
        </div>
      </div>
    </div >
  );
}
