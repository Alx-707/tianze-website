import { generateLocaleMetadata } from "@/app/[locale]/layout-metadata";
import { generatePageStructuredData } from "@/app/[locale]/layout-structured-data";
import "@/app/globals.css";
import { type ReactNode } from "react";
import Script from "next/script";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFontClassNames } from "@/app/[locale]/layout-fonts";
import { loadCompleteMessages } from "@/lib/load-messages";
import { pickClientMessages } from "@/lib/i18n/client-messages";
import { generateJSONLD } from "@/lib/structured-data";
import { AttributionBootstrap } from "@/components/attribution-bootstrap";
import { LazyCookieConsentIsland } from "@/components/cookie/lazy-cookie-consent-island";
import { Footer } from "@/components/footer";
import { Header } from "@/components/layout/header";
import { LazyTopLoader } from "@/components/lazy/lazy-top-loader";
import { ThemeProvider } from "@/components/theme-provider";
import { LazyThemeSwitcher } from "@/components/ui/lazy-theme-switcher";
import { LazyWhatsAppButton } from "@/components/whatsapp/lazy-whatsapp-button";
import { getAppConfig } from "@/config/app";
import { FOOTER_COLUMNS, FOOTER_STYLE_TOKENS } from "@/config/footer-links";
import { SITE_CONFIG, isWhatsAppConfigured } from "@/config/paths/site-config";
import { coerceLocale, isLocale } from "@/i18n/locale-utils";
import { mainNavigation } from "@/lib/navigation";

// Client analytics are rendered as an island to avoid impacting LCP

// 重新导出元数据生成函数
export const generateMetadata = generateLocaleMetadata;

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}
interface AsyncLocaleLayoutContentProps {
  locale: "en" | "zh";
  children: ReactNode;
}

async function AsyncLocaleLayoutContent({
  locale,
  children,
}: AsyncLocaleLayoutContentProps) {
  const appConfig = getAppConfig();
  const showWhatsAppButton =
    appConfig.features.ENABLE_WHATSAPP_CHAT &&
    isWhatsAppConfigured(SITE_CONFIG.contact.whatsappNumber);

  // Note: Removed headers() call for CSP nonce to enable Cache Components static generation.
  // JSON-LD scripts are data-only and don't require nonce for CSP compliance.
  // For client-side scripts that need nonce, consider using a dynamic island component.

  const [
    tFooter,
    tNavigation,
    tAccessibility,
    tLanguage,
    messages,
    structuredData,
  ] = await Promise.all([
    getTranslations({
      locale,
      namespace: "footer",
    }),
    getTranslations({
      locale,
      namespace: "navigation",
    }),
    getTranslations({
      locale,
      namespace: "accessibility",
    }),
    getTranslations({
      locale,
      namespace: "language",
    }),
    // Load complete messages for root provider (eliminates need for nested providers)
    loadCompleteMessages(locale),
    generatePageStructuredData(locale),
  ]);

  const footerSystemStatus = tFooter("systemStatus");
  const contactSalesLabel = tNavigation("contactSales");
  const openMenuLabel = tAccessibility("openMenu");
  const closeMenuLabel = tAccessibility("closeMenu");
  const mobileLanguageLabel = tLanguage("selectLanguage");
  const mainNavItems = mainNavigation.map((item) => ({
    key: item.key,
    href: item.href,
    label: tNavigation(item.translationKey.replace(/^navigation\./, "")),
  }));
  const clientMessages = pickClientMessages(messages);
  const { organizationData, websiteData } = structuredData;

  return (
    <>
      {/*
        JSON-LD Structured Data for SEO
        --------------------------------
        CSP nonce is NOT required for these scripts because:
        1. type="application/ld+json" declares data-only content (not executable JavaScript)
        2. Per CSP Level 3 spec, script-src restrictions apply only to executable scripts
        3. Reference: https://www.w3.org/TR/CSP3/#should-block-inline
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateJSONLD(organizationData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateJSONLD(websiteData),
        }}
      />
      <NextIntlClientProvider locale={locale} messages={clientMessages}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* P1-1 Fix: Single attribution initialization for UTM tracking */}
          <AttributionBootstrap />

          {/* 页面导航进度条 - P1 优化：懒加载，减少 vendors chunk */}
          <LazyTopLoader />

          {/* 导航栏 */}
          <Header
            locale={locale}
            contactSalesLabel={contactSalesLabel}
            openMenuLabel={openMenuLabel}
            closeMenuLabel={closeMenuLabel}
            mobileLanguageLabel={mobileLanguageLabel}
            mainNavItems={mainNavItems}
          />

          {/* 主要内容 */}
          <main id="main-content" className="flex-1">
            {children}
          </main>

          {/* 页脚：使用新 Footer 组件与配置数据，附加主题切换与状态插槽 */}
          <Footer
            columns={FOOTER_COLUMNS}
            tokens={FOOTER_STYLE_TOKENS}
            statusSlot={
              <span className="text-xs font-medium text-muted-foreground sm:text-sm">
                {footerSystemStatus}
              </span>
            }
            themeToggleSlot={
              <LazyThemeSwitcher data-testid="footer-theme-toggle" />
            }
          />

          {showWhatsAppButton && (
            <LazyWhatsAppButton number={SITE_CONFIG.contact.whatsappNumber} />
          )}

          {/* P0-3 Fix: Cookie Consent Island - scoped provider for consent consumers only */}
          {/* TBT Optimization: Deferred until main thread is idle */}
          <LazyCookieConsentIsland />
        </ThemeProvider>
      </NextIntlClientProvider>
    </>
  );
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!isLocale(locale)) {
    notFound();
  }

  const typedLocale = coerceLocale(locale);
  setRequestLocale(typedLocale);
  const disableDevTools =
    process.env.PLAYWRIGHT_TEST === "true" ||
    process.env.NEXT_PUBLIC_DISABLE_DEV_TOOLS === "true";
  const disableReactScan =
    disableDevTools || process.env.NEXT_PUBLIC_DISABLE_REACT_SCAN === "true";
  const shouldLoadDevScripts = process.env.NODE_ENV === "development";
  const skipToContentLabel =
    typedLocale === "zh" ? "跳转到主要内容" : "Skip to main content";

  return (
    <html
      lang={typedLocale}
      className={getFontClassNames()}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col antialiased">
        <a href="#main-content" className="skip-link">
          {skipToContentLabel}
        </a>
        {/* Dev-only scripts: never loaded in production (NODE_ENV gate).
            SRI omitted intentionally — versioned CDN URLs would break on update if integrity drifts.
            Security note: these scripts have zero production attack surface. */}
        {shouldLoadDevScripts && (
          <>
            {!disableReactScan && (
              <Script
                src="https://unpkg.com/react-scan@0.5.3/dist/auto.global.js"
                crossOrigin="anonymous"
                strategy="afterInteractive"
              />
            )}
            {!disableDevTools && (
              <>
                <Script
                  src="https://unpkg.com/react-grab@0.1.28/dist/index.global.js"
                  crossOrigin="anonymous"
                  strategy="afterInteractive"
                />
                <Script
                  // Track the same release line as `react-grab` until this client is
                  // versioned from a locally-managed dependency instead of CDN.
                  src="https://unpkg.com/@react-grab/claude-code@0.1.28/dist/client.global.js"
                  strategy="lazyOnload"
                />
              </>
            )}
          </>
        )}
        <AsyncLocaleLayoutContent locale={typedLocale}>
          {children}
        </AsyncLocaleLayoutContent>
      </body>
    </html>
  );
}
