"use client";

import { useEffect, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { FIVE_SECONDS_MS, THIRTY_SECONDS_MS } from "@/constants/time";
import { useIdleRender } from "@/hooks/use-idle-render";

interface LazyWhatsAppButtonProps {
  number: string;
}

type WhatsAppButtonModule = {
  Component: ComponentType<{ number: string }>;
};

/**
 * Client-side lazy loader for WhatsApp button
 * Uses ssr: false to avoid MISSING_MESSAGE errors during SSG
 */
export function LazyWhatsAppButton({ number }: LazyWhatsAppButtonProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/en" || pathname === "/zh";
  const shouldRenderOnOtherPages = useIdleRender({
    timeout: FIVE_SECONDS_MS,
    fallbackDelay: FIVE_SECONDS_MS,
  });
  const [homeDelayElapsed, setHomeDelayElapsed] = useState(false);
  const [module, setModule] = useState<WhatsAppButtonModule | null>(null);

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

    const loadWhatsAppButton = async () => {
      const importedModule =
        await import("@/components/whatsapp/whatsapp-floating-button");
      if (!cancelled) {
        setModule({ Component: importedModule.WhatsAppFloatingButton });
      }
    };

    loadWhatsAppButton().catch(() => {
      // Ignore lazy import failures; the floating contact shortcut is optional.
    });

    return () => {
      cancelled = true;
    };
  }, [module, shouldRender]);

  if (!shouldRender) return null;
  if (!module) return null;

  return <module.Component number={number} />;
}
