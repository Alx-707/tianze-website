/**
 * WhatsApp API 完整类型定义文件
 *
 * 说明：此文件包含完整的 WhatsApp API 类型定义，用于保持与官方API的一致性。
 * 某些类型可能暂时未使用，但保留以备将来功能扩展时使用。
 *
 * ESLint禁用原因：API类型定义的完整性比当前使用状态更重要
 * 审查周期：每季度审查一次，评估是否有类型可以移除或需要新增
 */

/**
 * WhatsApp API 类型定义 - 主入口
 * WhatsApp API Type Definitions - Main Entry Point
 *
 * 统一的WhatsApp Business API类型入口，整合所有API相关类型定义
 */

// ==================== 请求类型 ====================
export type {
  SendMessageRequest,
  MediaUploadRequest,
  AnalyticsRequest,
  BatchRequest,
  BusinessProfileUpdateRequest,
  TemplateCreateRequest,
  TemplateDeleteRequest,
  TemplateStatusUpdateRequest,
  PhoneNumberRegistrationRequest,
  PhoneNumberVerificationRequest,
  WebhookSubscriptionRequest,
  MessageMarkRequest,
  UserBlockRequest,
  QualityRatingRequest,
  AccountInfoRequest,
  AppSettingsRequest,
  MessageReactionRequest,
  MessageForwardRequest,
  GroupMessageRequest,
  ApiRequestOptions,
  ApiRequest,
  WhatsAppApiRequest,
} from "@/types/whatsapp-api-requests";

export {
  isSendMessageRequest,
  isMediaUploadRequest,
  isAnalyticsRequest,
  isBatchRequest,
} from "@/types/whatsapp-api-requests";

// ==================== 响应类型 ====================
export type {
  SendMessageResponse,
  WhatsAppApiResponse,
  WhatsAppServiceResponse,
  MediaUploadResponse,
  MediaRetrieveResponse,
  PhoneNumberInfo,
  PhoneNumbersResponse,
  BusinessProfile,
  BusinessProfileResponse,
  TemplateStatus,
  TemplatesResponse,
  AnalyticsDataPoint,
  AnalyticsResponse,
  BatchResponse,
  RateLimitInfo,
  AccountInfoResponse,
  AppSettingsResponse,
  QualityRatingResponse,
  MessageStatusResponse,
  UserBlockStatusResponse,
  WebhookVerificationResponse,
  PaginationCursors,
  PaginationInfo,
  PaginatedResponse,
  WhatsAppApiResponseType,
  ApiResponse,
  WhatsAppApiError,
  WhatsAppApiErrorResponse,
  ResponseUtils,
} from "@/types/whatsapp-api-responses";

export {
  isSendMessageResponse,
  isMediaUploadResponse,
  isSuccessResponse,
  isErrorResponse,
} from "@/types/whatsapp-api-responses";

// ==================== 配置类型 ====================
export type {
  ApiConfig,
  ExtendedApiConfig,
  EnvironmentConfig,
  WebhookConfig,
  ClientConfig,
  ApiEndpoint,
  HttpMethod,
  ApiVersion,
  MessageType,
  MediaType,
  TemplateStatusType,
  TemplateCategory,
  QualityRating,
  ThroughputLevel,
  AnalyticsGranularity,
  AnalyticsMetricType,
  ErrorCode,
  ConfigUtils,
  API_ENDPOINTS,
  HTTP_METHODS,
  API_VERSIONS,
  MESSAGE_TYPES,
  MEDIA_TYPES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_STATUSES,
  QUALITY_RATINGS,
  THROUGHPUT_LEVELS,
  ANALYTICS_GRANULARITIES,
  ANALYTICS_METRIC_TYPES,
  DEFAULT_API_CONFIG,
  DEFAULT_WEBHOOK_CONFIG,
  DEFAULT_REQUEST_OPTIONS,
  ERROR_CODE_MESSAGES,
  RETRYABLE_ERROR_CODES,
} from "@/types/whatsapp-api-config";

export {
  validateApiConfig,
  validateWebhookConfig,
} from "@/types/whatsapp-api-config";

// ==================== 错误类型 ====================
export type {
  WhatsAppError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
  BusinessLogicError,
  ServerError,
  ErrorSeverity,
  ErrorCategory,
  ErrorContext,
  ErrorDetails,
  ErrorHandlingStrategy,
  ErrorStatistics,
  ErrorReport,
  ErrorHandlingConfig,
  ErrorUtils,
} from "@/types/whatsapp-api-errors";

export {
  isWhatsAppApiError as isApiError,
  isNetworkError,
  isValidationError,
  isAuthenticationError,
  isRateLimitError,
  isBusinessLogicError,
  isServerError,
} from "@/types/whatsapp-api-errors";

// ==================== 基础类型 ====================
export type {
  ContactData,
  LocationData,
  WhatsAppContact,
} from "@/types/whatsapp-base-types";

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 *
 * 注意：这些是通过 import/export 方式创建的别名，不是直接重导出
 */
import type {
  SendMessageRequest,
  MediaUploadRequest,
  AnalyticsRequest,
  BatchRequest,
  ApiRequest,
  ApiRequestOptions,
} from "@/types/whatsapp-api-requests";

import type {
  SendMessageResponse,
  WhatsAppApiResponse,
  WhatsAppServiceResponse,
  MediaUploadResponse,
  MediaRetrieveResponse,
  PhoneNumbersResponse,
  BusinessProfileResponse,
  TemplatesResponse,
  AnalyticsResponse,
  BatchResponse,
  ApiResponse,
  WhatsAppApiError,
  WhatsAppApiErrorResponse,
  PaginatedResponse,
  PaginationInfo,
  PaginationCursors,
} from "@/types/whatsapp-api-responses";

import type {
  ApiConfig,
  ExtendedApiConfig,
  WebhookConfig,
  ClientConfig,
  ApiEndpoint,
  HttpMethod,
  MessageType,
  MediaType,
  QualityRating,
  ErrorCode,
} from "@/types/whatsapp-api-config";

import type {
  WhatsAppError,
  NetworkError,
  ValidationError,
  AuthenticationError,
  RateLimitError,
  BusinessLogicError,
  ServerError,
} from "@/types/whatsapp-api-errors";

// 请求类型别名
export type { SendMessageRequest as SendRequest };
export type { MediaUploadRequest as UploadRequest };
export type { AnalyticsRequest as AnalyticsReq };
export type { BatchRequest as BatchReq };
export type { ApiRequest as Request };
export type { ApiRequestOptions as RequestOptions };

// 响应类型别名
export type { SendMessageResponse as SendResponse };
export type { WhatsAppApiResponse as WaApiResponse };
export type { WhatsAppServiceResponse as ServiceResponse };
export type { MediaUploadResponse as UploadResponse };
export type { MediaRetrieveResponse as RetrieveResponse };
export type { PhoneNumbersResponse as PhoneNumbersResp };
export type { BusinessProfileResponse as BusinessProfileResp };
export type { TemplatesResponse as TemplatesResp };
export type { AnalyticsResponse as AnalyticsResp };
export type { BatchResponse as BatchResp };
export type { ApiResponse as Response };

// 配置类型别名
export type { ApiConfig as Config };
export type { ExtendedApiConfig as ExtendedConfig };
export type { WebhookConfig as WebhookConf };
export type { ClientConfig as ClientConf };

// 错误类型别名
export type { WhatsAppApiError as ApiError };
export type { WhatsAppApiErrorResponse as ErrorResponse };
export type { WhatsAppError as Error };
export type { NetworkError as NetError };
export type { ValidationError as ValidError };
export type { AuthenticationError as AuthError };
export type { RateLimitError as RateLimitErr };
export type { BusinessLogicError as BusinessError };
export type { ServerError as ServError };

// 工具类型别名
export type { ApiEndpoint as Endpoint };
export type { HttpMethod as Method };
export type { MessageType as MsgType };
export type { MediaType as MediaT };
export type { QualityRating as Quality };
export type { ErrorCode as ErrCode };

// 分页类型别名
export type { PaginatedResponse as PagedResponse };
export type { PaginationInfo as PageInfo };
export type { PaginationCursors as PageCursors };
