import { z } from "zod";

/**
 * API响应验证模式
 * API response validation schema for legacy/test-side validation.
 */
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  messageId: z.string().optional(),
});

export type ApiResponse = z.infer<typeof apiResponseSchema>;
