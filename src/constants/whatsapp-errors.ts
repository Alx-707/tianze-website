/**
 * WhatsApp Business API Error Codes
 *
 * Reference: https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
 *
 * Error code naming convention: WA_ERR_[CATEGORY]_[DESCRIPTION]
 * - Generic errors: WA_ERR_[DESCRIPTION]
 * - API-specific errors: WA_ERR_API_[DESCRIPTION]
 * - Message errors: WA_ERR_MSG_[DESCRIPTION]
 * - Media errors: WA_ERR_MEDIA_[DESCRIPTION]
 */

// ============================================================================
// Generic Error Codes (100-199)
// ============================================================================

/** Generic user error - indicates a problem with the request parameters */
export const WA_ERR_GENERIC_USER = 100 as const;

/** Generic temporary error - retry the request */
export const WA_ERR_TEMPORARY = 131 as const;

/** Generic limit reached - rate or quota limit exceeded */
export const WA_ERR_LIMIT_REACHED = 132 as const;

/** Generic permission error - insufficient permissions */
export const WA_ERR_PERMISSION = 133 as const;

/** Generic authentication error - invalid or expired credentials */
export const WA_ERR_AUTH = 136 as const;

/** Access token error - invalid or expired access token */
export const WA_ERR_ACCESS_TOKEN = 190 as const;

// ============================================================================
// Policy Violation Codes (300-399)
// ============================================================================

/** Temporarily blocked for policy violations */
export const WA_ERR_POLICY_BLOCK = 368 as const;

// ============================================================================
// HTTP Status Codes (400-599)
// ============================================================================

/** Too many requests - rate limit exceeded */
export const WA_ERR_RATE_LIMIT = 429 as const;

// ============================================================================
// API Error Codes (131000-131999)
// ============================================================================

/** API: Generic temporary error - retry the request */
export const WA_ERR_API_TEMPORARY = 131000 as const;

/** API: Request limit reached - rate limit exceeded */
export const WA_ERR_API_RATE_LIMIT = 131005 as const;

/** API: Required parameter is missing */
export const WA_ERR_API_MISSING_PARAM = 131008 as const;

/** API: Parameter value is not valid */
export const WA_ERR_API_INVALID_PARAM = 131009 as const;

/** API: Request timeout - the request took too long */
export const WA_ERR_API_TIMEOUT = 131014 as const;

/** API: Service temporarily unavailable */
export const WA_ERR_API_UNAVAILABLE = 131016 as const;

/** API: Recipient phone number not valid */
export const WA_ERR_API_INVALID_PHONE = 131021 as const;

/** API: Message undeliverable - recipient cannot receive */
export const WA_ERR_API_UNDELIVERABLE = 131026 as const;

/** API: Re-engagement message - 24-hour window expired */
export const WA_ERR_API_REENGAGEMENT = 131047 as const;

/** API: Unsupported message type */
export const WA_ERR_API_UNSUPPORTED_MSG = 131051 as const;

/** API: Media download error - failed to download media */
export const WA_ERR_MEDIA_DOWNLOAD = 131052 as const;

/** API: Media upload error - failed to upload media */
export const WA_ERR_MEDIA_UPLOAD = 131053 as const;

// ============================================================================
// Error Code Collections
// ============================================================================

/**
 * Error codes that indicate the request can be retried
 */
export const RETRYABLE_WA_ERRORS = [
  WA_ERR_TEMPORARY,
  WA_ERR_API_TEMPORARY,
  WA_ERR_API_TIMEOUT,
  WA_ERR_API_UNAVAILABLE,
  WA_ERR_MEDIA_DOWNLOAD,
  WA_ERR_MEDIA_UPLOAD,
] as const;

/**
 * Error codes related to authentication
 */
export const AUTH_WA_ERRORS = [WA_ERR_AUTH, WA_ERR_ACCESS_TOKEN] as const;

/**
 * Error codes related to rate limiting
 */
export const RATE_LIMIT_WA_ERRORS = [
  WA_ERR_LIMIT_REACHED,
  WA_ERR_RATE_LIMIT,
  WA_ERR_API_RATE_LIMIT,
] as const;
