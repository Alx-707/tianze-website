/**
 * Mobile Navigation Component
 *
 * Responsive mobile navigation with hamburger menu and slide-out sidebar.
 * Features smooth animations, keyboard navigation, and accessibility.
 */
"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Check, Globe, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  isActivePath,
  mobileNavigation,
  NAVIGATION_ARIA,
} from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Link, usePathname } from "@/i18n/routing";

interface MobileNavigationProps {
  className?: string;
  initialOpen?: boolean;
  openMenuLabel?: string;
  closeMenuLabel?: string;
  languageLabel?: string;
}

interface MobileMenuButtonProps extends ComponentProps<"button"> {
  isOpen: boolean;
  openMenuLabel?: string;
  closeMenuLabel?: string;
  labelTestId?: string;
}

export function MobileMenuButton({
  isOpen,
  className,
  onClick,
  openMenuLabel,
  closeMenuLabel,
  labelTestId = "mobile-menu-button-label",
  ...props
}: MobileMenuButtonProps) {
  const t = useTranslations();
  const label = isOpen
    ? (closeMenuLabel ?? t("accessibility.closeMenu"))
    : (openMenuLabel ?? t("accessibility.openMenu"));

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative", className)}
      aria-label={label}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      data-state={isOpen ? "open" : "closed"}
      data-testid="header-mobile-menu-button"
      onClick={onClick}
      {...props}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      <span className="sr-only" data-testid={labelTestId} translate="no">
        {label}
      </span>
    </Button>
  );
}

function useCloseMenuOnPathChange(
  pathname: string,
  isOpen: boolean,
  onClose: () => void,
) {
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname && isOpen) {
      queueMicrotask(onClose);
    }

    previousPathnameRef.current = pathname;
  }, [isOpen, onClose, pathname]);
}

export function MobileNavigation({
  className,
  initialOpen = false,
  openMenuLabel,
  closeMenuLabel,
  languageLabel = "Language",
}: MobileNavigationProps) {
  const t = useTranslations();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(initialOpen);

  useCloseMenuOnPathChange(pathname, isOpen, () => setIsOpen(false));

  return (
    <div className={cn("header-mobile-only", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={
              isOpen
                ? (closeMenuLabel ?? t("accessibility.closeMenu"))
                : (openMenuLabel ?? t("accessibility.openMenu"))
            }
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
            aria-haspopup="dialog"
            data-state={isOpen ? "open" : "closed"}
            data-testid="header-mobile-menu-button"
          >
            <Menu className="h-5 w-5" />
            <span
              className="sr-only"
              data-testid="mobile-menu-toggle-label"
              translate="no"
            >
              {isOpen
                ? t("accessibility.closeMenu")
                : t("accessibility.openMenu")}
            </span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[300px] sm:w-[350px]"
          id="mobile-navigation"
          aria-label={NAVIGATION_ARIA.mobileMenu}
          data-testid="mobile-menu-content"
          onEscapeKeyDown={() => setIsOpen(false)}
        >
          <SheetHeader className="text-left">
            <SheetTitle className="sr-only">
              {NAVIGATION_ARIA.mobileMenu}
            </SheetTitle>
            <div className="text-lg font-semibold" aria-hidden="true">
              {t("seo.siteName")}
            </div>
            <SheetDescription className="text-sm text-muted-foreground">
              {t("seo.description")}
            </SheetDescription>
          </SheetHeader>
          <Separator className="my-4" />
          <nav
            className="flex flex-col space-y-1"
            aria-label={NAVIGATION_ARIA.mobileMenu}
          >
            {mobileNavigation.map((item) => {
              const isActive = isActivePath(pathname, item.href);
              return (
                <SheetClose key={item.key} asChild>
                  <Link
                    href={item.href as "/"}
                    prefetch={false}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsOpen(false)}
                  >
                    {t(item.translationKey)}
                  </Link>
                </SheetClose>
              );
            })}
            <div className="pt-4">
              <Button
                variant="default"
                size="sm"
                asChild
                className="w-full justify-start"
              >
                <SheetClose asChild>
                  <Link
                    href={{
                      pathname: "/contact",
                      query: { source: "mobile_nav_cta" },
                    }}
                    prefetch={false}
                    onClick={() => setIsOpen(false)}
                  >
                    {t("navigation.contactSales")}
                  </Link>
                </SheetClose>
              </Button>
            </div>
            <Separator className="my-4" />
            <MobileLanguageSwitcher
              languageLabel={languageLabel}
              pathname={pathname}
              onNavigate={() => setIsOpen(false)}
            />
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/**
 * Mobile Language Switcher
 * Simple two-link list to avoid nested portal/focus issues with DropdownMenu inside Sheet.
 */
function MobileLanguageSwitcher({
  languageLabel,
  pathname,
  onNavigate,
}: {
  languageLabel: string;
  pathname: string;
  onNavigate?: () => void;
}) {
  const currentLocale = useLocale() === "zh" ? "zh" : "en";

  const languages = [
    { locale: "en" as const, label: "English" },
    { locale: "zh" as const, label: "简体中文" },
  ];

  return (
    <div
      className="notranslate space-y-1"
      data-testid="mobile-language-switcher"
      translate="no"
    >
      <div
        className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground"
        data-testid="mobile-language-switcher-label"
      >
        <Globe className="h-4 w-4" />
        <span translate="no">{languageLabel}</span>
      </div>
      {languages.map(({ locale, label }) => {
        const isActive = currentLocale === locale;
        return (
          <SheetClose key={locale} asChild>
            <Link
              href={(pathname || "/") as "/"}
              locale={locale}
              prefetch={false}
              className={cn(
                "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
              onClick={onNavigate}
              translate="no"
            >
              <span
                data-testid={`mobile-language-option-label-${locale}`}
                translate="no"
              >
                {label}
              </span>
              {isActive && <Check className="h-4 w-4" />}
            </Link>
          </SheetClose>
        );
      })}
    </div>
  );
}
