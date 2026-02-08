"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  useIntersectionObserver,
  useIntersectionObserverWithDelay,
} from "@/hooks/use-intersection-observer";
import { cn } from "@/lib/utils";
import { ZERO } from "@/constants";

const DEFAULT_STAGGER_INTERVAL = 100;
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

/**
 * Hidden/visible transforms per direction.
 * "up"/"down" use CSS variable --scroll-reveal-distance for translateY.
 * "scale" uses a noticeable scale(0.92) start.
 */
function getTransformStyle(
  direction: string,
  isVisible: boolean,
): CSSProperties {
  if (isVisible) {
    return { opacity: 1, transform: "translateY(0) scale(1)" };
  }

  switch (direction) {
    case "down":
      return {
        opacity: 0,
        transform:
          "translateY(calc(-1 * var(--scroll-reveal-distance, 24px))) scale(1)",
      };
    case "fade":
      return { opacity: 0, transform: "translateY(0) scale(1)" };
    case "scale":
      return { opacity: 0, transform: "translateY(0) scale(0.92)" };
    case "up":
    default:
      return {
        opacity: 0,
        transform: "translateY(var(--scroll-reveal-distance, 24px)) scale(1)",
      };
  }
}

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

  const transformStyle = getTransformStyle(direction, isVisible);

  return (
    <Tag
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-[var(--scroll-reveal-duration,700ms)] ease-[var(--ease-spring)]",
        className,
      )}
      style={transformStyle}
    >
      {children}
    </Tag>
  );
}
