import { getTranslations } from "next-intl/server";
import {
  generateOrganizationData,
  generateWebSiteData,
} from "@/lib/structured-data-generators";
import type { Locale } from "@/lib/structured-data";

/**
 * 页面结构化数据接口
 */
export interface PageStructuredData {
  organizationData: Record<string, unknown>;
  websiteData: Record<string, unknown>;
}

/**
 * 生成页面结构化数据
 * 包含组织信息和网站信息的JSON-LD数据
 */
export async function generatePageStructuredData(
  locale: Locale,
): Promise<PageStructuredData> {
  const t = await getTranslations({
    locale,
    namespace: "structured-data",
  });

  const organizationData = generateOrganizationData(t, {});
  const websiteData = generateWebSiteData(t, {});

  return { organizationData, websiteData };
}
