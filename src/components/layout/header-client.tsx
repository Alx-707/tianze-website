"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const MobileNavigation = dynamic(
  () =>
    import("@/components/layout/mobile-navigation").then(
      (m) => m.MobileNavigation,
    ),
  { ssr: false },
);

const NavSwitcher = dynamic(
  () => import("@/components/layout/nav-switcher").then((m) => m.NavSwitcher),
  { ssr: false },
);

const LanguageToggle = dynamic(
  () => import("@/components/language-toggle").then((m) => m.LanguageToggle),
  { ssr: false },
);

export function MobileNavigationIsland({
  openMenuLabel = "Open navigation menu",
  closeMenuLabel = "Close navigation menu",
  languageLabel = "Language",
}: {
  openMenuLabel?: string;
  closeMenuLabel?: string;
  languageLabel?: string;
}) {
  const [isActivated, setIsActivated] = useState(false);

  if (isActivated) {
    return (
      <MobileNavigation
        initialOpen
        openMenuLabel={openMenuLabel}
        closeMenuLabel={closeMenuLabel}
        languageLabel={languageLabel}
      />
    );
  }

  return (
    <button
      type="button"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-[6px] text-foreground transition-colors duration-150 hover:bg-accent"
      aria-label={openMenuLabel}
      aria-controls="mobile-navigation"
      aria-expanded="false"
      aria-haspopup="dialog"
      data-testid="header-mobile-menu-button"
      onClick={() => setIsActivated(true)}
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M4 7h16M4 12h16M4 17h16"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <span
        className="sr-only"
        data-testid="header-mobile-menu-label"
        translate="no"
      >
        {openMenuLabel}
      </span>
    </button>
  );
}

export function NavSwitcherIsland() {
  return <NavSwitcher />;
}

export function LanguageToggleIsland({ locale }: { locale: "en" | "zh" }) {
  // Pass current locale down to avoid next-intl dependency in this island
  return <LanguageToggle locale={locale} />;
}
