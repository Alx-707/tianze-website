import type { ReactNode } from "react";
import Script from "next/script";
import type { Metadata } from "next";
import { getFontClassNames } from "@/app/[locale]/layout-fonts";
import { SITE_CONFIG } from "@/config/paths/site-config";
import { routing } from "@/i18n/routing";

interface RootLayoutProps {
  children: ReactNode;
}

// 基础 metadata 配置
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000",
  ),
  title: SITE_CONFIG.seo.defaultTitle,
  description: SITE_CONFIG.seo.defaultDescription,
};

// Root layout renders the document shell so that metadata can be injected into <head>.
// Note: We use the default locale for the root layout since getLocale() is a request-scoped
// API that's incompatible with Cache Components static generation. Pages under [locale]/
// will have the correct lang attribute set by their own layout.
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang={routing.defaultLocale}
      className={getFontClassNames()}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-screen flex-col antialiased"
        suppressHydrationWarning
      >
        {process.env.NODE_ENV === "development" && (
          <>
            {/* react-scan: must load before React hydrates (beforeInteractive) */}
            <Script
              src="https://unpkg.com/react-scan@0.5.3/dist/auto.global.js"
              crossOrigin="anonymous"
              strategy="beforeInteractive"
            />
            {/* react-grab + Claude Code integration */}
            <Script
              src="//unpkg.com/react-grab/dist/index.global.js"
              crossOrigin="anonymous"
              strategy="beforeInteractive"
            />
            <Script
              src="//unpkg.com/@react-grab/claude-code/dist/client.global.js"
              strategy="lazyOnload"
            />
          </>
        )}
        {children}
      </body>
    </html>
  );
}
