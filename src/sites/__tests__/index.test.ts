import { afterEach, describe, expect, it, vi } from "vitest";
import { FOOTER_COLUMNS } from "@/config/footer-links";
import { SITE_CONFIG } from "@/config/paths/site-config";
import { siteFacts } from "@/config/site-facts";
import { PRODUCT_CATALOG } from "@/constants/product-catalog";
import { mainNavigation } from "@/lib/navigation";
import {
  currentSite,
  currentSiteKey,
  DEFAULT_SITE_KEY,
  resolveSiteDefinition,
  resolveSiteKey,
} from "@/sites";

describe("site registry", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses tianze as the default site key", () => {
    expect(DEFAULT_SITE_KEY).toBe("tianze");
    expect(currentSiteKey).toBe("tianze");
  });

  it("falls back to tianze for unknown site keys", () => {
    expect(resolveSiteKey()).toBe("tianze");
    expect(resolveSiteKey("unknown")).toBe("tianze");
  });

  it("resolves the current site definition", () => {
    expect(currentSite.key).toBe("tianze");
    expect(resolveSiteDefinition("tianze")).toBe(currentSite);
    expect(resolveSiteDefinition("tianze-equipment").config.name).toBe(
      "Tianze Equipment",
    );
    expect(resolveSiteDefinition("tianze-equipment").config.name).not.toBe(
      currentSite.config.name,
    );
  });

  it("keeps wrapper exports aligned with the site definition", () => {
    expect(SITE_CONFIG).toBe(currentSite.config);
    expect(siteFacts).toBe(currentSite.facts);
    expect(PRODUCT_CATALOG).toBe(currentSite.productCatalog);
    expect(FOOTER_COLUMNS).toBe(currentSite.footerColumns);
    expect(mainNavigation).toBe(currentSite.navigation.main);
  });

  it("keeps site identity values internally consistent", () => {
    expect(SITE_CONFIG.name).toBe("Tianze Pipe");
    expect(siteFacts.contact.email).toBe(SITE_CONFIG.contact.email);
    expect(siteFacts.social.linkedin).toBe(SITE_CONFIG.social.linkedin);
    expect(siteFacts.stats.exportCountries).toBe(20);
    expect(siteFacts.stats.factoryAreaAcres).toBe(100);
    expect(PRODUCT_CATALOG.markets.length).toBeGreaterThan(0);
  });

  it("switches wrapper exports to the equipment site when NEXT_PUBLIC_SITE_KEY changes", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({
      env: {
        NEXT_PUBLIC_SITE_KEY: "tianze-equipment",
        NEXT_PUBLIC_BASE_URL: "http://localhost:3000",
        NEXT_PUBLIC_WHATSAPP_NUMBER: "+86-518-0000-0000",
      },
    }));

    const [
      siteModule,
      siteConfigModule,
      siteFactsModule,
      navigationModule,
      footerModule,
      productCatalogModule,
    ] = await Promise.all([
      import("@/sites"),
      import("@/config/paths/site-config"),
      import("@/config/site-facts"),
      import("@/lib/navigation"),
      import("@/config/footer-links"),
      import("@/constants/product-catalog"),
    ]);

    expect(siteModule.currentSiteKey).toBe("tianze-equipment");
    expect(siteModule.currentSite.config.name).toBe("Tianze Equipment");
    expect(siteConfigModule.SITE_CONFIG.name).toBe("Tianze Equipment");
    expect(siteConfigModule.SITE_CONFIG.baseUrl).toBe(
      "https://equipment.tianze-pipe.com",
    );
    expect(siteFactsModule.siteFacts.company.name).toContain("Equipment");
    expect(siteFactsModule.siteFacts.contact.email).toBe(
      "sales@tianze-pipe.com",
    );
    expect(navigationModule.mainNavigation).toBe(
      siteModule.currentSite.navigation.main,
    );
    expect(footerModule.FOOTER_COLUMNS).toBe(
      siteModule.currentSite.footerColumns,
    );
    expect(productCatalogModule.PRODUCT_CATALOG).toBe(
      siteModule.currentSite.productCatalog,
    );

    vi.doUnmock("@/lib/env");
  });

  it("does not let the equipment site inherit the default site base URL", async () => {
    vi.resetModules();
    vi.doMock("@/lib/env", () => ({
      env: {
        NEXT_PUBLIC_SITE_KEY: "tianze-equipment",
        NEXT_PUBLIC_BASE_URL: "https://tianze-pipe.com",
        NEXT_PUBLIC_WHATSAPP_NUMBER: "+86-518-0000-0000",
      },
    }));

    const [siteModule, siteConfigModule] = await Promise.all([
      import("@/sites"),
      import("@/config/paths/site-config"),
    ]);

    expect(siteModule.currentSiteKey).toBe("tianze-equipment");
    expect(siteConfigModule.SITE_CONFIG.baseUrl).toBe(
      "https://equipment.tianze-pipe.com",
    );
    expect(siteConfigModule.SITE_CONFIG.baseUrl).not.toBe(
      "https://tianze-pipe.com",
    );

    vi.doUnmock("@/lib/env");
  });
});
