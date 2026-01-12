/**
 * requestIdleCallback工具函数
 * 提供类型安全的requestIdleCallback调用，自动fallback到setTimeout
 */

import {
  IDLE_CALLBACK_FALLBACK_DELAY,
  IDLE_CALLBACK_TIMEOUT,
} from "@/constants/time";

/**
 * 类型安全的requestIdleCallback调用
 * 如果浏览器不支持requestIdleCallback，自动fallback到setTimeout
 *
 * @param callback - 要执行的回调函数
 * @param options - 配置选项
 * @param options.timeout - 超时时间（毫秒），默认1200ms
 * @returns 清理函数，用于取消回调
 *
 * @example
 * ```tsx
 * useEffect(() => {
 *   const cleanup = requestIdleCallback(() => {
 *     // 空闲时执行的代码
 *   });
 *   return cleanup;
 * }, []);
 * ```
 */
export function requestIdleCallback(
  callback: () => void,
  options: { timeout?: number } = {},
): () => void {
  const { timeout = IDLE_CALLBACK_TIMEOUT } = options;

  if (typeof window === "undefined") {
    // SSR环境，立即执行
    callback();
    return () => {
      // no-op in SSR
    };
  }

  if (window.requestIdleCallback) {
    // 浏览器支持requestIdleCallback
    const id = window.requestIdleCallback(() => callback(), { timeout });
    return () => {
      if (window.cancelIdleCallback) {
        window.cancelIdleCallback(id);
      }
    };
  }

  // Fallback到setTimeout
  const id = setTimeout(callback, IDLE_CALLBACK_FALLBACK_DELAY);
  return () => clearTimeout(id);
}
