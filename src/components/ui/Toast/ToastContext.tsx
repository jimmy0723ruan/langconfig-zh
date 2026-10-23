/**
 * Copyright (c) 2025 Cade Russell (Ghost Peony)
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/**
 * Toast Context
 *
 * Global state management for toast notifications using React Context.
 * Zero external dependencies - pure React solution.
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * Toast Provider Component
 * Wrap your app with this to enable toasts anywhere
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * 去重记录：同一 (type, message) 在 3 秒内只弹一次。
   *
   * 之前后端限流触发时，每个失败请求都会各弹一个 toast，
   * 几十个请求叠在一起会把屏幕铺满。这里按「内容 + 类型」去重。
   */
  const recentToastsRef = useRef<Map<string, number>>(new Map());
  const DEDUPE_WINDOW_MS = 3000;

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 4000) => {
      const now = Date.now();
      const dedupeKey = `${type}:${message}`;
      const lastShown = recentToastsRef.current.get(dedupeKey);

      if (lastShown !== undefined && now - lastShown < DEDUPE_WINDOW_MS) {
        return; // 窗口内重复，直接丢弃
      }
      recentToastsRef.current.set(dedupeKey, now);

      // 防止 Map 无限增长：超过 100 条时清理过期键
      if (recentToastsRef.current.size > 100) {
        for (const [key, ts] of recentToastsRef.current) {
          if (now - ts > 30_000) recentToastsRef.current.delete(key);
        }
      }

      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: Toast = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  // Bridge for non-React callers (e.g. the axios interceptor in api-client).
  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ message: string; type?: ToastType }>).detail;
      if (detail?.message) showToast(detail.message, detail.type ?? 'info');
    };
    window.addEventListener('app:toast', handler);
    return () => window.removeEventListener('app:toast', handler);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * useToast Hook
 * Use this hook to show toasts from any component
 *
 * @example
 * const { showToast } = useToast();
 * showToast('Success!', 'success');
 * showToast('Error occurred', 'error');
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
