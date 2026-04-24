import { getPageBySlug } from "@/lib/content";
import { slugifyHeading } from "@/lib/content/render-legal-content";
import type { LegalPageMetadata, Locale } from "@/types/content.types";

interface HeadingItem {
  level: 2 | 3;
  text: string;
  id: string;
}

const H2_PREFIX = "## ";
const H3_PREFIX = "### ";
const EXPLICIT_ID_PATTERN = /\s*\{#([a-z0-9-]+)\}\s*$/;

function parseHeading(raw: string): { text: string; id: string } {
  const match = EXPLICIT_ID_PATTERN.exec(raw);
  if (match) {
    return { text: raw.slice(0, match.index).trim(), id: match[1] ?? "" };
  }
  return { text: raw, id: slugifyHeading(raw) };
}

export function extractHeadingsFromContent(content: string): HeadingItem[] {
  const headings: HeadingItem[] = [];

  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith(H3_PREFIX)) {
      const { text, id } = parseHeading(trimmed.slice(H3_PREFIX.length).trim());
      headings.push({ level: 3, text, id });
    } else if (trimmed.startsWith(H2_PREFIX)) {
      const { text, id } = parseHeading(trimmed.slice(H2_PREFIX.length).trim());
      headings.push({ level: 2, text, id });
    }
  }

  return headings;
}

interface LegalPageData {
  metadata: LegalPageMetadata;
  content: string;
  headings: HeadingItem[];
}

export async function loadLegalPage(
  slug: string,
  locale: string,
): Promise<LegalPageData> {
  const page = await getPageBySlug(slug, locale as Locale);

  const metadata: LegalPageMetadata = {
    ...page.metadata,
    layout: "legal",
    showToc: true,
    lastReviewed:
      page.metadata.lastReviewed ??
      page.metadata.updatedAt ??
      page.metadata.publishedAt,
  };

  const headings = extractHeadingsFromContent(page.content);

  return { metadata, content: page.content, headings };
}
