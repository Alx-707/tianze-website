"use client";

import type { ReactNode } from "react";
import {
  useIntersectionObserver,
  useIntersectionObserverWithDelay,
} from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import { ZERO } from "@/constants";

const DEFAULT_STAGGER_INTERVAL = 80;
const DEFAULT_THRESHOLD = 0.15;

interface ScrollRevealProps {
  children: ReactNode;
  direction?: "up" | "down" | "fade" | "scale";
  delay?: number;
  staggerIndex?: number;
  staggerInterval?: number;
  threshold?: number;
  as?: "div" | "section" | "article";
  className?: string;
}

const HIDDEN_CLASSES: Record<string, string> = {
  up: "opacity-0 translate-y-5",
  down: "opacity-0 -translate-y-5",
  fade: "opacity-0",
  scale: "opacity-0 scale-[0.97]",
};

const VISIBLE_CLASSES: Record<string, string> = {
  up: "opacity-100 translate-y-0",
  down: "opacity-100 translate-y-0",
  fade: "opacity-100",
  scale: "opacity-100 scale-100",
};

export function ScrollReveal({
  children,
  direction = "up",
  delay,
  staggerIndex,
  staggerInterval = DEFAULT_STAGGER_INTERVAL,
  threshold = DEFAULT_THRESHOLD,
  as: Tag = "div",
  className,
}: ScrollRevealProps) {
  const computedDelay =
    delay ??
    (staggerIndex !== undefined ? staggerIndex * staggerInterval : ZERO);

  const observerOptions = { threshold, triggerOnce: true };

  /* eslint-disable react-hooks/rules-of-hooks -- branch is stable per render (computedDelay is derived from props) */
  const { ref, isVisible } =
    computedDelay > ZERO
      ? useIntersectionObserverWithDelay(observerOptions, computedDelay)
      : useIntersectionObserver(observerOptions);
  /* eslint-enable react-hooks/rules-of-hooks */

  return (
    <Tag
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[600ms] ease-out",
        isVisible ? VISIBLE_CLASSES[direction] : HIDDEN_CLASSES[direction],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
