/**
 * Validation Limits and Constraints
 *
 * Centralized constants for input validation, character limits,
 * and size constraints throughout the application.
 *
 * Naming convention: MAX_[DOMAIN]_[DESCRIPTION] or MIN_[DOMAIN]_[DESCRIPTION]
 */

// ============================================================================
// WhatsApp Message Limits
// ============================================================================

/** Maximum length for WhatsApp text messages */
export const MAX_WA_MESSAGE_LENGTH = 4096 as const;

/** Maximum length for WhatsApp button ID */
export const MAX_WA_BUTTON_ID_LENGTH = 256 as const;

/** Maximum length for WhatsApp button title */
export const MAX_WA_BUTTON_TITLE_LENGTH = 20 as const;

/** Maximum number of buttons per message */
export const MAX_WA_BUTTONS_COUNT = 3 as const;

/** Maximum number of list rows per message */
export const MAX_WA_LIST_ROWS_COUNT = 10 as const;

/** Maximum length for list row ID */
export const MAX_WA_ROW_ID_LENGTH = 200 as const;

/** Maximum length for list row title */
export const MAX_WA_ROW_TITLE_LENGTH = 24 as const;

/** Maximum length for list row description */
export const MAX_WA_ROW_DESC_LENGTH = 72 as const;

/** Maximum length for template parameter */
export const MAX_WA_TEMPLATE_PARAM_LENGTH = 1024 as const;

// ============================================================================
// Cryptography Constants
// ============================================================================

/** AES-GCM key length in bits */
export const AES_KEY_LENGTH_BITS = 256 as const;

/** PBKDF2 iteration count for key derivation */
export const PBKDF2_ITERATIONS = 100000 as const;

/** Salt byte length for password hashing */
export const SALT_BYTE_LENGTH = 16 as const;

/** IV byte length for AES-GCM */
export const AES_IV_BYTE_LENGTH = 12 as const;
