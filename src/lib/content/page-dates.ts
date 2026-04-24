import type { Locale } from "@/types/content.types";
import { routing } from "@/i18n/routing";
import { getPageBySlug } from "@/lib/content";

const MDX_PAGE_SLUGS: Record<string, string> = {
  "/about": "about",
  "/contact": "contact",
  "/privacy": "privacy",
  "/terms": "terms",
  "/capabilities/bending-machines": "bending-machines",
  "/oem-custom-manufacturing": "oem-custom-manufacturing",
};

export function isMdxDrivenPage(path: string): boolean {
  return path in MDX_PAGE_SLUGS;
}

export async function getMdxPageLastModified(path: string): Promise<Date> {
  const slug = MDX_PAGE_SLUGS[path];
  if (slug === undefined) {
    throw new Error(`No MDX slug mapping for path: ${path}`);
  }

  let latest = new Date(0);

  for (const locale of routing.locales) {
    try {
      const page = await getPageBySlug(slug, locale as Locale);
      const dateStr = page.metadata.updatedAt ?? page.metadata.publishedAt;
      const date = new Date(dateStr);
      if (date > latest) {
        latest = date;
      }
    } catch {
      // A missing locale is allowed; all locales missing is a build error below.
    }
  }

  if (latest.getTime() === 0) {
    throw new Error(`No content found for slug: ${slug}`);
  }

  return latest;
}
