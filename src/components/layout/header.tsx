/**
 * Header Component (Server)
 *
 * 服务端渲染的头部，交互部件以客户端小岛方式注入，减少首屏 JS 体积。
 */
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import {
  LanguageToggleIsland,
  MobileNavigationIsland,
  NavSwitcherIsland,
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
}

export function Header({
  className,
  variant = "default",
  sticky = true,
  locale,
  contactSalesLabel = "Contact Sales",
}: HeaderProps) {
  const isSticky = variant === "transparent" ? false : sticky;
  const isMinimal = variant === "minimal";
  const isTransparent = variant === "transparent";
  const isVercelNav = process.env.NEXT_PUBLIC_NAV_VARIANT !== "legacy";
  const VISIBLE_MARGIN =
    process.env.NEXT_PUBLIC_IDLE_ROOTMARGIN ?? "400px 0px 400px 0px";

  return (
    <header
      className={cn(
        "w-full bg-background/80 backdrop-blur-md",
        isSticky && "sticky top-0 z-50",
        isTransparent && "border-transparent bg-transparent backdrop-blur-none",
        // Scroll shadow effect via data-scrolled attribute (8-12% border opacity)
        isVercelNav
          ? "border-b border-border/10 transition-all duration-200 data-[scrolled=true]:border-border/20 data-[scrolled=true]:bg-background/95 data-[scrolled=true]:shadow-sm"
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
            {...(!locale ? { "data-testid": "mobile-navigation" } : {})}
          >
            <Logo locale={locale} />
          </div>

          {/* Center section: Main Navigation (Desktop) */}
          <CenterNav
            isMinimal={isMinimal}
            locale={locale}
            VISIBLE_MARGIN={VISIBLE_MARGIN}
          />

          <HeaderUtilityControls
            contactSalesLabel={contactSalesLabel}
            locale={locale}
            rootMargin={VISIBLE_MARGIN}
          />
        </div>
      </div>
    </header>
  );
}

function CenterNav({
  isMinimal,
  locale,
  VISIBLE_MARGIN,
}: {
  isMinimal: boolean;
  locale?: "en" | "zh" | undefined;
  VISIBLE_MARGIN: string;
}) {
  if (isMinimal) return null;
  return (
    <div
      className="header-nav-center"
      {...(!locale ? { "data-testid": "nav-switcher" } : {})}
    >
      {/* 客户端：导航切换器（更晚加载，避免首屏竞争） */}
      <ViewportClientGate mode="desktop">
        <Idle strategy="visible" rootMargin={VISIBLE_MARGIN}>
          {locale ? <NavSwitcherIsland /> : null}
        </Idle>
      </ViewportClientGate>
    </div>
  );
}

function HeaderUtilityControls({
  contactSalesLabel,
  locale,
  rootMargin,
}: {
  contactSalesLabel: string;
  locale: "en" | "zh" | undefined;
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
            <Link href="/contact" prefetch={false} data-testid="header-cta">
              {contactSalesLabel}
            </Link>
          </Button>
          <div className="header-mobile-only h-10 w-10">
            <ViewportClientGate mode="mobile">
              <Idle strategy="visible" rootMargin={rootMargin}>
                <MobileNavigationIsland />
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
