import { hasOwn } from "@/lib/security/object-guards";

/**
 * Deep merge plain objects.
 *
 * - Prefers `source` values when they are defined.
 * - Recursively merges nested plain objects (not arrays).
 */
export function mergeObjects<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T {
  // nosemgrep: object-injection-sink-spread-operator -- 仅复制受控 target 对象
  const result = { ...target };

  for (const key in source) {
    if (!hasOwn(source, key)) continue;
    // eslint-disable-next-line security/detect-object-injection -- hasOwn 已校验 key 来自 source 自身属性
    const sourceValue = source[key];
    if (sourceValue === undefined) continue;
    // eslint-disable-next-line security/detect-object-injection -- hasOwn 已校验，result 由 target 浅拷贝
    const targetValue = result[key];

    const isSourcePlain =
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      !Array.isArray(sourceValue);
    const isTargetPlain =
      typeof targetValue === "object" &&
      targetValue !== null &&
      !Array.isArray(targetValue);

    if (isSourcePlain && isTargetPlain) {
      // eslint-disable-next-line security/detect-object-injection -- 递归合并已校验的嵌套对象
      result[key] = mergeObjects(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      ) as T[Extract<keyof T, string>];
      continue;
    }

    // eslint-disable-next-line security/detect-object-injection -- hasOwn 已校验 key
    result[key] = sourceValue as T[Extract<keyof T, string>];
  }

  return result;
}
