/**
 * Copyright (c) 2025 Cade Russell (Ghost Peony)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { getModelDisplayName, getModelProvider } from '@/lib/modelDisplayNames';
import type { LocalModel } from '@/types/api';

/**
 * Hook for fetching available models (cloud + local)
 *
 * This hook combines cloud models from the settings API with validated local models
 * from the local-models API, providing a unified list for model selection dropdowns.
 *
 * Usage:
 * ```typescript
 * const { models, isLoading, error, refetch } = useAvailableModels({
 *   includeLocal: true,
 *   onlyValidated: true,
 *   refreshInterval: 30000 // Auto-refresh every 30s
 * });
 * ```
 */

export interface ModelOption {
  id: string;                    // Model identifier (e.g., "gpt-4", "local-ollama-llama3")
  name: string;                  // Display name (e.g., "GPT-4", "Llama 3.2 (Ollama - Local)")
  provider: string;              // Provider name (e.g., "openai", "anthropic", "ollama")
  type: 'cloud' | 'local';       // Model type
  is_validated?: boolean;        // Only for local models
  capabilities?: {
    streaming?: boolean;
    tools?: boolean;
    max_context?: number;
    [key: string]: any;
  };
}

export interface UseAvailableModelsOptions {
  includeLocal?: boolean;         // Whether to include local models (default: true)
  onlyValidated?: boolean;        // Only include validated local models (default: true)
  refreshInterval?: number;       // Auto-refresh interval in ms (default: disabled)
}

export interface UseAvailableModelsResult {
  models: ModelOption[];          // Combined list of cloud + local models
  cloudModels: ModelOption[];     // Cloud models only
  localModels: ModelOption[];     // Local models only
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;   // Manual refresh function
}

/**
 * 共享请求缓存。
 *
 * 上游实现里每个调用方（尤其是画布上的每个 CustomNode）都会独立请求
 * `/api/settings/models`。一个 20 节点的工作流一次渲染就是 20 次请求，
 * 两三次刷新就会撞上后端 60 次/分钟的限流，导致全站 429。
 *
 * 这里做两件事：
 * 1. 并发去重：同一组参数同时只发一个请求，其余等待同一个 Promise；
 * 2. 短期缓存：30 秒内复用结果，避免重复请求。
 */
const CACHE_TTL_MS = 30_000;

let cache: {
  key: string;
  cloudModelOptions: ModelOption[];
  localModelOptions: ModelOption[];
  at: number;
} | null = null;

let inflight: {
  key: string;
  promise: Promise<{
    cloudModelOptions: ModelOption[];
    localModelOptions: ModelOption[];
  }>;
} | null = null;

async function loadModels(
  includeLocal: boolean,
  onlyValidated: boolean,
): Promise<{ cloudModelOptions: ModelOption[]; localModelOptions: ModelOption[] }> {
  const key = `${includeLocal}|${onlyValidated}`;

  if (cache && cache.key === key && Date.now() - cache.at < CACHE_TTL_MS) {
    return {
      cloudModelOptions: cache.cloudModelOptions,
      localModelOptions: cache.localModelOptions,
    };
  }

  if (inflight && inflight.key === key) {
    return inflight.promise;
  }

  const promise = (async () => {
    const settingsResponse = await apiClient.listAvailableModels();
    const availableModels = settingsResponse.data.models || [];
    const localModelsList = settingsResponse.data.local_models || [];

    const cloudModelOptions: ModelOption[] = availableModels
      .filter((modelId: string) => !modelId.startsWith('local-'))
      .map((modelId: string) => ({
        id: modelId,
        name: getModelDisplayName(modelId) || modelId,
        provider: getModelProvider(modelId),
        type: 'cloud' as const,
      }));

    let localModelOptions: ModelOption[] = [];
    if (includeLocal) {
      localModelOptions = localModelsList
        .filter((model: any) => !onlyValidated || model.is_validated)
        .map((model: any) => ({
          id: model.name,
          name: `${model.display_name} (${model.provider.charAt(0).toUpperCase() + model.provider.slice(1)} - Local)`,
          provider: model.provider,
          type: 'local' as const,
          is_validated: model.is_validated,
          capabilities: model.capabilities,
        }));
    }

    cache = { key, cloudModelOptions, localModelOptions, at: Date.now() };
    return { cloudModelOptions, localModelOptions };
  })().finally(() => {
    if (inflight?.key === key) inflight = null;
  });

  inflight = { key, promise };
  return promise;
}

/** 手动失效缓存（例如保存新模型后）。 */
export function invalidateAvailableModelsCache(): void {
  cache = null;
  inflight = null;
}

export function useAvailableModels(
  options: UseAvailableModelsOptions = {}
): UseAvailableModelsResult {
  const {
    includeLocal = true,
    onlyValidated = true,
    refreshInterval
  } = options;

  const [models, setModels] = useState<ModelOption[]>([]);
  const [cloudModels, setCloudModels] = useState<ModelOption[]>([]);
  const [localModels, setLocalModels] = useState<ModelOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 统一走共享缓存：并发去重 + 30s 复用，避免多组件各自请求造成 429
      const { cloudModelOptions, localModelOptions } = await loadModels(
        includeLocal,
        onlyValidated,
      );

      setCloudModels(cloudModelOptions);
      setLocalModels(localModelOptions);
      setModels([...cloudModelOptions, ...localModelOptions]);

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch available models:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch models';
      setError(errorMsg);
      setIsLoading(false);
    }
  }, [includeLocal, onlyValidated]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchModels();

    // Set up auto-refresh if interval provided
    if (refreshInterval && refreshInterval > 0) {
      const intervalId = setInterval(() => {
        fetchModels();
      }, refreshInterval);

      return () => clearInterval(intervalId);
    }
  }, [fetchModels, refreshInterval]);

  return {
    models,
    cloudModels,
    localModels,
    isLoading,
    error,
    refetch: fetchModels
  };
}
