/**
 * Header Component (Server)
 *
 * 服务端渲染的头部，交互部件以客户端小岛方式注入，减少首屏 JS 体积。
 */
import { SINGLE_SITE_HOME_LINK_TARGETS } from "@/config/single-site-page-expression";
import { Link } from "@/i18n/routing";
import { getRuntimeEnvString } from "@/lib/env";
import { NAVIGATION_ARIA } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import {
  MobileNavigationIsland,
  LanguageToggleIsland,
} from "@/components/layout/header-client";
import { HeaderScrollChrome } from "@/components/layout/header-scroll-chrome";
import { Logo } from "@/components/layout/logo";
import { ViewportClientGate } from "@/components/layout/viewport-client-gate";
import { Idle } from "@/components/lazy/idle";
import { Button } from "@/components/ui/button";

/**
 * Header Component
 *
 * Main navigation header with responsive design, logo, navigation menus,
 * and utility controls (language switcher, theme toggle).
 */

// Simplified header props interface
interface HeaderProps {
  className?: string;
  variant?: "default" | "minimal" | "transparent";
  sticky?: boolean;
  locale?: "en" | "zh";
  contactSalesLabel?: string;
  openMenuLabel?: string;
  closeMenuLabel?: string;
  mobileLanguageLabel?: string;
  mainNavItems?: Array<{
    key: string;
    href: string;
    label: string;
  }>;
}

function getHeaderState(
  variant: HeaderProps["variant"],
  sticky: boolean,
  locale: HeaderProps["locale"],
) {
  return {
    isSticky: variant === "transparent" ? false : sticky,
    isMinimal: variant === "minimal",
    isTransparent: variant === "transparent",
    isVercelNav: getRuntimeEnvString("NEXT_PUBLIC_NAV_VARIANT") !== "legacy",
    visibleMargin:
      getRuntimeEnvString("NEXT_PUBLIC_IDLE_ROOTMARGIN") ??
      "400px 0px 400px 0px",
    showTestIds: !locale,
  };
}

export function Header({
  className,
  variant = "default",
  sticky = true,
  locale,
  contactSalesLabel = "Contact Sales",
  openMenuLabel = "Open navigation menu",
  closeMenuLabel = "Close navigation menu",
  mobileLanguageLabel = "Language",
  mainNavItems = [],
}: HeaderProps) {
  const {
    isSticky,
    isMinimal,
    isTransparent,
    isVercelNav,
    visibleMargin,
    showTestIds,
  } = getHeaderState(variant, sticky, locale);

  return (
    <header
      className={cn(
        "w-full bg-background/80 backdrop-blur-md",
        isSticky && "sticky top-0 z-50",
        isTransparent && "border-transparent bg-transparent backdrop-blur-none",
        // Scroll shadow effect via data-scrolled attribute (8-12% border opacity)
        isVercelNav
          ? "border-b border-border/10 transition-[background-color,border-color,box-shadow] duration-200 data-[scrolled=true]:border-border/20 data-[scrolled=true]:bg-background/95 data-[scrolled=true]:shadow-sm"
          : !isTransparent && "border-b border-border/10",
        className,
      )}
    >
      {/* Scroll detection client island */}
      {isVercelNav && <HeaderScrollChrome />}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="header-nav-layout">
          {/* Left section: Logo */}
          <div
            className="header-nav-left"
            {...(showTestIds ? { "data-testid": "mobile-navigation" } : {})}
          >
            <Logo locale={locale} />
          </div>

          {/* Center section: Main Navigation (Desktop) */}
          <CenterNav
            isMinimal={isMinimal}
            locale={locale}
            mainNavItems={mainNavItems}
          />

          <HeaderUtilityControls
            contactSalesLabel={contactSalesLabel}
            locale={locale}
            openMenuLabel={openMenuLabel}
            closeMenuLabel={closeMenuLabel}
            mobileLanguageLabel={mobileLanguageLabel}
            rootMargin={visibleMargin}
          />
        </div>
      </div>
    </header>
  );
}

function CenterNav({
  isMinimal,
  locale,
  mainNavItems,
}: {
  isMinimal: boolean;
  locale?: "en" | "zh" | undefined;
  mainNavItems: Array<{
    key: string;
    href: string;
    label: string;
  }>;
}) {
  if (isMinimal || !locale || mainNavItems.length === 0) return null;

  return (
    <nav
      className="header-nav-center"
      aria-label={NAVIGATION_ARIA.mainNav}
      data-testid="header-desktop-nav"
    >
      <ul className="header-desktop-only items-center gap-1">
        {mainNavItems.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href as "/"}
              prefetch={false}
              className={cn(
                "relative inline-flex items-center rounded-full bg-transparent px-3 py-2 text-sm font-medium tracking-[0.01em]",
                "text-muted-foreground hover:text-foreground",
                "hover:bg-muted/40 dark:hover:bg-foreground/10",
                "transition-colors duration-100 ease-out",
              )}
            >
              <span data-testid={`header-nav-label-${item.key}`} translate="no">
                {item.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function HeaderUtilityControls({
  contactSalesLabel,
  locale,
  openMenuLabel,
  closeMenuLabel,
  mobileLanguageLabel,
  rootMargin,
}: {
  contactSalesLabel: string;
  locale: "en" | "zh" | undefined;
  openMenuLabel: string;
  closeMenuLabel: string;
  mobileLanguageLabel: string;
  rootMargin: string;
}) {
  return (
    <div
      className="header-nav-right"
      {...(!locale ? { "data-testid": "language-toggle-button" } : {})}
    >
      {locale ? (
        <>
          <div className="header-desktop-only h-10 w-28 items-center justify-end">
            <ViewportClientGate mode="desktop">
              <Idle strategy="visible" rootMargin={rootMargin}>
                <LanguageToggleIsland locale={locale} />
              </Idle>
            </ViewportClientGate>
          </div>
          <Button
            variant="default"
            size="sm"
            asChild
            className="header-cta-desktop-only"
          >
            <Link
              href={SINGLE_SITE_HOME_LINK_TARGETS.contact}
              prefetch={false}
              data-testid="header-cta"
            >
              <span data-testid="header-contact-sales-label" translate="no">
                {contactSalesLabel}
              </span>
            </Link>
          </Button>
          <div className="header-mobile-only h-10 w-10">
            <ViewportClientGate mode="mobile">
              <Idle strategy="visible" rootMargin={rootMargin}>
                <MobileNavigationIsland
                  openMenuLabel={openMenuLabel}
                  closeMenuLabel={closeMenuLabel}
                  languageLabel={mobileLanguageLabel}
                />
              </Idle>
            </ViewportClientGate>
          </div>
        </>
      ) : null}
    </div>
  );
}

// Simplified convenience components (only keep the most commonly used ones)
export function HeaderMinimal({ className }: { className?: string }) {
  return <Header variant="minimal" {...(className && { className })} />;
}

export function HeaderTransparent({ className }: { className?: string }) {
  return <Header variant="transparent" {...(className && { className })} />;
}
