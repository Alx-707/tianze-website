/**
 * 计数与数值常量定义
 *
 * 这个文件包含基础计数和通用数值常量。
 * 领域特定的常量应该放在各自的文件中：
 * - WhatsApp 错误码 → ./whatsapp-errors.ts
 * - 验证限制 → ./validation-limits.ts
 * - 时间常量 → ./time.ts
 */

// ============================================================================
// 基础计数常量
// ============================================================================

export const COUNT_ZERO = 0 as const;
export const COUNT_ONE = 1 as const;
export const COUNT_TWO = 2 as const;
export const COUNT_THREE = 3 as const;
export const COUNT_4 = 4 as const;
export const COUNT_FIVE = 5 as const;
export const COUNT_SIX = 6 as const;
export const COUNT_SEVEN = 7 as const;
export const COUNT_EIGHT = 8 as const;
export const COUNT_NINE = 9 as const;
export const COUNT_TEN = 10 as const;

// ============================================================================
// 语义化计数别名
// ============================================================================

/** @deprecated Use COUNT_TWO instead */
export const COUNT_PAIR = 2 as const;
/** @deprecated Use COUNT_THREE instead */
export const COUNT_TRIPLE = 3 as const;
/** @deprecated Use COUNT_4 instead */
export const COUNT_QUAD = 4 as const;
/** @deprecated Use COUNT_4 instead */
export const COUNT_FOUR = COUNT_4;

// ============================================================================
// 常用数值常量 (按使用场景分组)
// ============================================================================

// -- 进制和编码相关 --
/** 十六进制基数 */
export const MAGIC_16 = 16 as const;
/** Base36 进制基数 (用于生成短 ID) */
export const MAGIC_36 = 36 as const;

// -- 安全相关 --
/** 安全 token 字节长度 (MAGIC_6) */
export const MAGIC_6 = 6 as const;
/** 安全相关 padding 长度 */
export const MAGIC_8 = 8 as const;
/** 短 ID 长度 */
export const MAGIC_9 = 9 as const;
/** 月份数 / IV 字节长度 */
export const MAGIC_12 = 12 as const;
/** Token 长度 */
export const MAGIC_32 = 32 as const;
/** 安全 token 长度 */
export const MAGIC_48 = 48 as const;
/** 安全 token 长度 */
export const MAGIC_64 = 64 as const;

// -- 验证相关 --
/** 验证限制 */
export const MAGIC_15 = 15 as const;
/** WhatsApp 按钮标题长度限制 */
export const MAGIC_20 = 20 as const;
/** WhatsApp 行描述长度限制 */
export const MAGIC_72 = 72 as const;

// -- 监控阈值 --
/** 性能监控阈值 (95%) */
export const MAGIC_95 = 95 as const;
/** 性能监控阈值 (99%) */
export const MAGIC_99 = 99 as const;

// -- 文件大小限制 --
/** 字节上限 (255 = 0xFF) */
export const MAGIC_255 = 255 as const;

// -- 时间相关 (毫秒) --
/** 延迟常量 (600ms) */
export const MAGIC_600 = 600 as const;
/** 时间间隔 (2000ms) */
export const MAGIC_2000 = 2000 as const;
/** 性能阈值 (2500ms) */
export const MAGIC_2500 = 2500 as const;

// -- 尺寸和数量限制 --
/** Logo 尺寸相关 */
export const COUNT_120 = 120 as const;
/** 内容截断长度 */
export const COUNT_160 = 160 as const;
/** 导航预加载延迟 */
export const COUNT_250 = 250 as const;
/** 组件模板尺寸 */
export const COUNT_700 = 700 as const;
/** Top Loader 尺寸 */
export const COUNT_1600 = 1600 as const;
/** 秒每小时 */
export const COUNT_3600 = 3600 as const;
/** 5分钟 (毫秒) */
export const COUNT_300000 = 300000 as const;

// ============================================================================
// 大容量数值 (文件大小和时间相关)
// ============================================================================

/** 1MB in bytes (1024 * 1024) */
export const MAGIC_1048576 = 1048576 as const;
/** 1 hour in milliseconds (60 * 60 * 1000) */
export const MAGIC_3600000 = 3600000 as const;
