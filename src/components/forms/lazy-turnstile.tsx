"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { requestIdleCallback } from "@/lib/idle-callback";

// 懒加载 Turnstile 组件（进入视口或空闲时）
const DynamicTurnstile = dynamic(
  () =>
    import("@/components/security/turnstile").then((m) => m.TurnstileWidget),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-12 w-full animate-pulse rounded-md bg-muted"
        aria-hidden="true"
      />
    ),
  },
);

interface LazyTurnstileProps {
  onSuccess: (token: string) => void;
  onError: (reason?: string) => void;
  onExpire: () => void;
  onLoad: () => void;
}

/**
 * 延迟渲染逻辑
 * - 优先：进入视口（IntersectionObserver）
 * - 退化：空闲时加载（requestIdleCallback timeout）
 */
function useLazyRender(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let io: IntersectionObserver | null = null;
    let cancelled = false;
    let cleanupIdle: () => void = () => undefined;

    const enableRender = () => {
      if (cancelled) return;
      setShouldRender(true);
      io?.disconnect();
      io = null;
    };

    if (!shouldRender) {
      const el = containerRef.current;

      if (typeof IntersectionObserver !== "undefined" && el) {
        io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                enableRender();
                break;
              }
            }
          },
          { rootMargin: "200px" },
        );

        io.observe(el);
      }

      cleanupIdle = requestIdleCallback(enableRender, { timeout: 1500 });
    }

    return () => {
      cancelled = true;
      cleanupIdle();
      io?.disconnect();
    };
  }, [containerRef, shouldRender]);

  return shouldRender;
}

/**
 * 延迟加载 Turnstile CAPTCHA 组件
 * 优先在进入视口时加载，退化为空闲时加载
 */
export function LazyTurnstile({
  onSuccess,
  onError,
  onExpire,
  onLoad,
}: LazyTurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const shouldRender = useLazyRender(containerRef);

  return (
    <div className="space-y-2" ref={containerRef}>
      {shouldRender ? (
        <DynamicTurnstile
          onSuccess={onSuccess}
          onError={onError}
          onExpire={onExpire}
          onLoad={onLoad}
          className="w-full"
          action="contact_form"
          theme="auto"
          size="normal"
        />
      ) : (
        <div
          className="h-12 w-full animate-pulse rounded-md bg-muted"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
