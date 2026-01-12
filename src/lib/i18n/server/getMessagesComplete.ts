import { loadCompleteMessages } from "@/lib/load-messages";

/**
 * Get complete translation messages for a locale.
 *
 * This function loads both critical and deferred translation files from the
 * externalized public directory and merges them into a single object.
 *
 * This keeps translation files out of the JS bundle, reducing First Load JS.
 *
 * Use cases:
 * - Contact page
 * - About page
 * - Blog page
 * - Products page
 * - Any other page that needs full translation access
 *
 * @param locale - The locale to get messages for ('en' or 'zh')
 * @returns Promise resolving to complete translation messages object
 */
export function getMessagesComplete(
  locale: "en" | "zh",
): Promise<Record<string, unknown>> {
  return loadCompleteMessages(locale);
}
