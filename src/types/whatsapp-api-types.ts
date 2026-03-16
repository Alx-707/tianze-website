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
