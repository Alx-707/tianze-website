"use client";

import { MessageCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";

import type { WhatsAppStyleTokens } from "@/config/footer-links";

export interface WhatsAppFabButtonProps {
  isChatOpen: boolean;
  isDragging: boolean;
  buttonLabel: string;
  tokens: WhatsAppStyleTokens;
  className?: string;
  onClick: (_e: React.MouseEvent) => void;
}

export function WhatsAppFabButton({
  isChatOpen,
  isDragging,
  buttonLabel,
  tokens,
  className = "",
  onClick,
}: WhatsAppFabButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick(e);
  };

  return (
    <button
      type="button"
      aria-label={buttonLabel}
      aria-expanded={isChatOpen}
      className={cn(
        "group relative flex items-center justify-center",
        tokens.transition,
        tokens.focusRing,
        tokens.light.background,
        tokens.light.foreground,
        tokens.light.border,
        tokens.light.hoverBackground,
        tokens.light.hoverBorder,
        tokens.light.hoverForeground,
        tokens.light.shadow,
        tokens.dark.background,
        tokens.dark.foreground,
        tokens.dark.border,
        tokens.dark.hoverBackground,
        tokens.dark.hoverBorder,
        tokens.dark.hoverForeground,
        tokens.dark.shadow,
        className,
      )}
      onClick={handleClick}
      style={{
        width: `${tokens.sizePx}px`,
        height: `${tokens.sizePx}px`,
        borderRadius: `${tokens.borderRadiusPx}px`,
        borderWidth: tokens.borderWidthPx,
      }}
    >
      {isChatOpen ? (
        <X
          className="transition-colors duration-150"
          style={{
            width: `${tokens.iconSizePx}px`,
            height: `${tokens.iconSizePx}px`,
          }}
          aria-hidden="true"
        />
      ) : (
        <MessageCircle
          className="transition-colors duration-150"
          style={{
            width: `${tokens.iconSizePx}px`,
            height: `${tokens.iconSizePx}px`,
          }}
          aria-hidden="true"
        />
      )}

      {!isChatOpen && (
        <span
          className={cn(
            "pointer-events-none absolute bottom-full mb-2 w-max rounded-lg px-3 py-1.5 text-xs font-medium opacity-0 shadow-lg transition-opacity group-hover:opacity-100",
            tokens.tooltip.background,
            tokens.tooltip.text,
          )}
        >
          {buttonLabel}
        </span>
      )}
    </button>
  );
}
