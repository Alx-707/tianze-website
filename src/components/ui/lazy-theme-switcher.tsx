"use client";

import { useEffect, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { FIVE_SECONDS_MS, THIRTY_SECONDS_MS } from "@/constants/time";
import { useIdleRender } from "@/hooks/use-idle-render";
import type { ThemeSwitcherProps } from "@/components/ui/theme-switcher";

type ThemeSwitcherModule = {
  Component: ComponentType<ThemeSwitcherProps>;
};

export function LazyThemeSwitcher(props: ThemeSwitcherProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/en" || pathname === "/zh";
  const shouldRenderOnOtherPages = useIdleRender({
    timeout: FIVE_SECONDS_MS,
    fallbackDelay: FIVE_SECONDS_MS,
  });
  const [homeDelayElapsed, setHomeDelayElapsed] = useState(false);
  const [module, setModule] = useState<ThemeSwitcherModule | null>(null);

  useEffect(() => {
    if (!isHomePage) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setHomeDelayElapsed(true);
    }, THIRTY_SECONDS_MS);

    return () => clearTimeout(timer);
  }, [isHomePage]);

  const shouldRender = isHomePage ? homeDelayElapsed : shouldRenderOnOtherPages;

  useEffect(() => {
    if (!shouldRender || module) {
      return undefined;
    }

    let cancelled = false;

    const loadThemeSwitcher = async () => {
      const importedModule = await import("@/components/ui/theme-switcher");
      if (!cancelled) {
        setModule({ Component: importedModule.ThemeSwitcher });
      }
    };

    loadThemeSwitcher().catch(() => {
      // Ignore lazy import failures; theme switching is non-critical.
    });

    return () => {
      cancelled = true;
    };
  }, [module, shouldRender]);

  if (!shouldRender) return null;
  if (!module) return null;

  return <module.Component {...props} />;
}
