"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { COUNT_1600 } from "@/constants";
import { THIRTY_SECONDS_MS } from "@/constants/time";
import { useIdleRender } from "@/hooks/use-idle-render";
import { usePathname } from "next/navigation";

const NextTopLoader = dynamic(() => import("nextjs-toploader"), {
  ssr: false,
  loading: () => null,
});

interface LazyTopLoaderProps {
  nonce?: string | undefined;
}

export function LazyTopLoader({ nonce }: LazyTopLoaderProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/en" || pathname === "/zh";
  const shouldRenderOnOtherPages = useIdleRender();
  const [homeDelayElapsed, setHomeDelayElapsed] = useState(false);

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
  if (!shouldRender) return null;

  return (
    <NextTopLoader
      color="var(--primary)"
      height={2}
      showSpinner={false}
      easing="ease-in-out"
      speed={200}
      shadow="0 0 15px var(--primary),0 0 8px var(--primary)"
      zIndex={COUNT_1600}
      {...(nonce && { nonce })}
    />
  );
}
