"use client";

import { AnimatedCounter, formatters } from "@/components/ui/animated-counter";

const COUNTUP_DURATION = 1200;

interface HeroProofCounterProps {
  ariaLabel: string;
  suffix?: string;
  to: number;
}

export function HeroProofCounter({
  ariaLabel,
  suffix,
  to,
}: HeroProofCounterProps) {
  return (
    <AnimatedCounter
      to={to}
      duration={COUNTUP_DURATION}
      formatter={
        suffix
          ? (value: number) => `${formatters.default(value)}${suffix}`
          : formatters.default
      }
      triggerOnVisible
      role="text"
      aria-label={ariaLabel}
    />
  );
}
