import type { NextRequest } from "next/server";

import { API_ERROR_CODES } from "@/constants/api-error-codes";
import { logger } from "@/lib/logger";

export type SafeJsonParseSuccess<T> = { ok: true; data: T };
export type SafeJsonParseFailure = {
  ok: false;
  errorCode: typeof API_ERROR_CODES.INVALID_JSON_BODY;
};
export type SafeJsonParseResult<T> =
  | SafeJsonParseSuccess<T>
  | SafeJsonParseFailure;

/**
 * 安全解析 JSON 请求体，统一处理解析错误和非法结构。
 *
 * - 仅当解析结果为非 null 对象且不是数组时视为成功；
 * - 解析失败或结果不是对象时，返回 { ok: false, errorCode: API_ERROR_CODES.INVALID_JSON_BODY }；
 * - 不直接决定 HTTP 状态码，由调用方根据结果返回 400 等响应；
 * - 使用统一日志格式记录解析失败，便于观察和告警。
 */
export async function safeParseJson<T>(
  req: NextRequest,
  options?: {
    /** 日志上下文中的路由标识，如 `/api/contact` */
    route?: string;
  },
): Promise<SafeJsonParseResult<T>> {
  try {
    const raw = await req.json();

    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
      return { ok: false, errorCode: API_ERROR_CODES.INVALID_JSON_BODY };
    }

    return { ok: true, data: raw as T };
  } catch (error: unknown) {
    logger.warn("Failed to parse JSON body", {
      route: options?.route,
      error: error instanceof Error ? error.message : String(error),
    });

    return { ok: false, errorCode: API_ERROR_CODES.INVALID_JSON_BODY };
  }
}
