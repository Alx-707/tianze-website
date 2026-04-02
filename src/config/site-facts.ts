/**
 * Site Facts - Non-translatable business data
 *
 * This file contains factual data about the business that does NOT change
 * based on language. Examples: company name, founding year, certifications,
 * contact info, social links.
 *
 * Translatable content (marketing copy, descriptions) belongs in messages/*.json
 *
 * Usage in components:
 * ```tsx
 * import { siteFacts } from '@/config/site-facts';
 * import { useTranslations } from 'next-intl';
 *
 * function HeroSection() {
 *   const t = useTranslations('home.hero');
 *   return (
 *     <p>{t('subtitle', {
 *       year: siteFacts.company.established,
 *       countries: siteFacts.stats.exportCountries
 *     })}</p>
 *   );
 * }
 * ```
 */

import { currentSite } from "@/sites";

export type {
  BusinessHours,
  BusinessStats,
  Certification,
  CompanyInfo,
  ContactInfo,
  SiteFacts,
  SocialLinks,
} from "@/sites";

export const siteFacts = currentSite.facts;
