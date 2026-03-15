import { getRequestConfig } from "next-intl/server";
import { I18nPerformanceMonitor } from "@/lib/i18n-performance";
import {
  loadCompleteMessages,
  loadCompleteMessagesFromSource,
} from "@/lib/load-messages";
import { COUNT_FIVE, ONE } from "@/constants";
import { routing } from "@/i18n/routing";

// 辅助函数：获取格式配置
function getFormats(locale: string) {
  return {
    dateTime: {
      short: {
        day: "numeric" as const,
        month: "short" as const,
        year: "numeric" as const,
      },
      long: {
        day: "numeric" as const,
        month: "long" as const,
        year: "numeric" as const,
        weekday: "long" as const,
      },
    },
    number: {
      precise: {
        maximumFractionDigits: COUNT_FIVE,
      },
      currency: {
        style: "currency" as const,
        currency: locale === "zh" ? "CNY" : "USD",
      },
      percentage: {
        style: "percent" as const,
        minimumFractionDigits: ONE,
      },
    },
    list: {
      enumeration: {
        style: "long" as const,
        type: "conjunction" as const,
      },
    },
  };
}

// 辅助函数：记录请求级消息加载指标
function recordRequestMetrics(loadTime: number) {
  I18nPerformanceMonitor.recordLoadTime(loadTime);
}

// 辅助函数：创建成功响应
interface SuccessResponseArgs {
  locale: string;
  messages: Record<string, unknown>;
  loadTime: number;
}

function createSuccessResponse({
  locale,
  messages,
  loadTime,
}: SuccessResponseArgs) {
  if (
    process.env.I18N_DEBUG_BUILD === "1" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    const topLevelKeys = Object.keys(messages);
    // eslint-disable-next-line no-console -- build-only debug snapshot guarded by I18N_DEBUG_BUILD and NEXT_PHASE
    console.error("[i18n-debug] createSuccessResponse snapshot", {
      locale,
      loadTime,
      topLevelKeys,
      hasProducts: Object.prototype.hasOwnProperty.call(messages, "products"),
      hasFaq: Object.prototype.hasOwnProperty.call(messages, "faq"),
      hasPrivacy: Object.prototype.hasOwnProperty.call(messages, "privacy"),
    });
  }

  return {
    locale,
    messages,
    timeZone: locale === "zh" ? "Asia/Shanghai" : "UTC",
    formats: getFormats(locale),
    strictMessageTypeSafety: true,
    metadata: {
      loadTime,
    },
  };
}

// 辅助函数：创建错误回退响应
async function createFallbackResponse(locale: string, startTime: number) {
  if (
    process.env.I18N_DEBUG_BUILD === "1" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    // eslint-disable-next-line no-console -- build-only debug snapshot guarded by I18N_DEBUG_BUILD and NEXT_PHASE
    console.error("[i18n-debug] createFallbackResponse triggered", {
      locale,
      phase: process.env.NEXT_PHASE,
    });
  }

  return {
    locale,
    messages: await loadCompleteMessagesFromSource(locale),
    timeZone: locale === "zh" ? "Asia/Shanghai" : "UTC",
    formats: getFormats(locale),
    strictMessageTypeSafety: true,
    metadata: {
      loadTime: performance.now() - startTime,
      error: true,
    },
  };
}

export default getRequestConfig(async ({ requestLocale }) => {
  const startTime = performance.now();
  let locale = await requestLocale;

  // 如果没有明确的语言偏好，使用默认语言
  // next-intl middleware会自动处理语言检测和cookie
  if (!locale || !routing.locales.includes(locale as "en" | "zh")) {
    locale = routing.defaultLocale;
  }

  try {
    const messages = await loadCompleteMessages(locale as "en" | "zh");
    const loadTime = performance.now() - startTime;
    recordRequestMetrics(loadTime);

    return createSuccessResponse({
      locale,
      messages,
      loadTime,
    });
  } catch {
    I18nPerformanceMonitor.recordError();
    return createFallbackResponse(locale, startTime);
  }
});
