/**
 * WhatsApp Webhook 完整类型定义文件
 *
 * 说明：此文件包含完整的 WhatsApp Webhook 类型定义，用于保持与官方API的一致性。
 * 某些类型可能暂时未使用，但保留以备将来功能扩展时使用。
 *
 * ESLint禁用原因：API类型定义的完整性比当前使用状态更重要
 * 审查周期：每季度审查一次，评估是否有类型可以移除或需要新增
 */

/**
 * WhatsApp Webhook 类型定义 - 主入口
 * WhatsApp Webhook Type Definitions - Main Entry Point
 *
 * 统一的WhatsApp Business API webhook类型入口，整合所有webhook相关类型定义
 */

// ==================== 基础 Webhook 类型 ====================
export type {
  WebhookEntry,
  WebhookPayload,
  MessageStatusUpdate,
  WebhookError,
  MessageContext,
  WebhookVerificationRequest,
  WebhookVerificationResponse,
  WebhookConfig,
  WebhookSubscription,
  WebhookProcessingResult,
  WebhookSecurityConfig,
  WebhookRetryConfig,
  WebhookMonitoringConfig,
  WebhookStatus,
  WebhookMetadata,
  WebhookBatchConfig,
  WebhookFilterConfig,
  WebhookTransformConfig,
  CompleteWebhookConfig,
  WebhookField,
  WebhookObjectType,
  WebhookChangeField,
} from "@/types/whatsapp-webhook-base";

export {
  WEBHOOK_FIELDS,
  WEBHOOK_OBJECT_TYPES,
  WEBHOOK_CHANGE_FIELDS,
  isWebhookPayload,
  isWebhookEntry,
  isMessageStatusUpdate,
  isWebhookError,
  isWebhookVerificationRequest,
} from "@/types/whatsapp-webhook-base";

// ==================== 消息类型 ====================
export type {
  IncomingTextMessage,
  IncomingImageMessage,
  IncomingDocumentMessage,
  IncomingAudioMessage,
  IncomingVideoMessage,
  IncomingLocationMessage,
  IncomingContactsMessage,
  IncomingInteractiveMessage,
  IncomingReactionMessage,
  IncomingStickerMessage,
  IncomingOrderMessage,
  IncomingSystemMessage,
  IncomingButtonMessage,
  IncomingTemplateReply,
  IncomingWhatsAppMessage,
  IncomingMessageType,
  MediaMessageType,
  InteractiveMessageType,
} from "@/types/whatsapp-webhook-messages";

export {
  INCOMING_MESSAGE_TYPES,
  MEDIA_MESSAGE_TYPES,
  INTERACTIVE_MESSAGE_TYPES,
  isTextMessage,
  isImageMessage,
  isDocumentMessage,
  isAudioMessage,
  isVideoMessage,
  isLocationMessage,
  isContactsMessage,
  isInteractiveMessage,
  isReactionMessage,
  isStickerMessage,
  isOrderMessage,
  isSystemMessage,
  isButtonMessage,
  isTemplateReply,
  isMediaMessage,
  isInteractiveMessageType,
  getMessageText,
  getMessageMediaId,
  hasMessageContext,
} from "@/types/whatsapp-webhook-messages";

// ==================== 事件类型 ====================
export type {
  MessageReceivedEvent,
  MessageStatusEvent,
  WebhookErrorEvent,
  MessageReadEvent,
  MessageDeliveryEvent,
  UserStatusChangeEvent,
  AccountUpdateEvent,
  TemplateStatusEvent,
  PhoneNumberQualityEvent,
  SecurityEvent,
  WebhookEvent,
  WebhookProcessor,
  EventFilter,
  EventProcessingConfig,
  EventStatistics,
  EventBatch,
  WebhookEventType,
  MessageEventType,
  SystemEventType,
} from "@/types/whatsapp-webhook-events";

export {
  WEBHOOK_EVENT_TYPES,
  MESSAGE_EVENT_TYPES,
  SYSTEM_EVENT_TYPES,
  isMessageReceivedEvent,
  isMessageStatusEvent,
  isMessageReadEvent,
  isMessageDeliveryEvent,
  isUserStatusChangeEvent,
  isAccountUpdateEvent,
  isTemplateStatusEvent,
  isPhoneNumberQualityEvent,
  isSecurityEvent,
  isWebhookErrorEvent,
  isMessageEvent,
  isSystemEvent,
  getEventPriority,
  shouldRetryEvent,
  getEventTimestamp,
  isEventExpired,
} from "@/types/whatsapp-webhook-events";

// ==================== 工具类型 ====================
export type {
  WebhookParsingResult,
  WebhookValidationResult,
  SignatureVerificationConfig,
  WebhookProcessingContext,
  WebhookResponseConfig,
  DeduplicationConfig,
  RateLimitConfig,
  WebhookHealthCheck,
  WebhookDebugInfo,
  EventAggregationResult,
  WebhookUtils,
} from "@/types/whatsapp-webhook-utils";

export {
  createWebhookVerificationResponse,
  createWebhookError,
  isRetryableError,
  isTimestampValid,
} from "@/types/whatsapp-webhook-utils";

// ==================== 基础消息类型 ====================
export type {
  MessageStatus,
  WhatsAppContact,
  WhatsAppError,
  WhatsAppMessage,
} from "@/types/whatsapp-base-types";

// ==================== 向后兼容的类型别名 ====================

/**
 * 向后兼容的类型别名
 * Backward compatible type aliases
 */
import type {
  WebhookPayload,
  WebhookEntry,
  MessageStatusUpdate,
  WebhookError,
  WebhookVerificationRequest,
  WebhookVerificationResponse,
  WebhookConfig,
  WebhookSubscription,
  WebhookProcessingResult,
} from "@/types/whatsapp-webhook-base";

import type {
  IncomingWhatsAppMessage,
  IncomingTextMessage,
  IncomingImageMessage,
  IncomingDocumentMessage,
  IncomingAudioMessage,
  IncomingVideoMessage,
  IncomingLocationMessage,
  IncomingContactsMessage,
  IncomingInteractiveMessage,
  IncomingStickerMessage,
  IncomingReactionMessage,
} from "@/types/whatsapp-webhook-messages";

import type {
  MessageReceivedEvent,
  MessageStatusEvent,
  WebhookErrorEvent,
  WebhookEvent,
  WebhookProcessor,
} from "@/types/whatsapp-webhook-events";

// 基础类型别名
export type { WebhookPayload as Webhook };
export type { WebhookEntry as Entry };
export type { MessageStatusUpdate as StatusUpdate };
export type { WebhookError as Error };

// 消息类型别名
export type { IncomingWhatsAppMessage as IncomingMessage };
export type { IncomingTextMessage as TextMessage };
export type { IncomingImageMessage as ImageMessage };
export type { IncomingDocumentMessage as DocumentMessage };
export type { IncomingAudioMessage as AudioMessage };
export type { IncomingVideoMessage as VideoMessage };
export type { IncomingLocationMessage as LocationMessage };
export type { IncomingContactsMessage as ContactsMessage };
export type { IncomingInteractiveMessage as InteractiveMessage };
export type { IncomingReactionMessage as ReactionMessage };
export type { IncomingStickerMessage as StickerMessage };

// 事件类型别名
export type { MessageReceivedEvent as MessageEvent };
export type { MessageStatusEvent as StatusEvent };
export type { WebhookErrorEvent as ErrorEvent };
export type { WebhookEvent as Event };

// 配置类型别名
export type { WebhookConfig as Config };
export type { WebhookSubscription as Subscription };
export type { WebhookProcessor as Processor };
export type { WebhookProcessingResult as ProcessingResult };

// 验证类型别名
export type { WebhookVerificationRequest as VerificationRequest };
export type { WebhookVerificationResponse as VerificationResponse };
