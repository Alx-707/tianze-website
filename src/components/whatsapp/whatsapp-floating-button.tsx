"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Draggable from "react-draggable";

import { WhatsAppChatWindow } from "@/components/whatsapp/whatsapp-chat-window";
import { WhatsAppFabButton } from "@/components/whatsapp/whatsapp-fab-button";

import { WHATSAPP_STYLE_TOKENS } from "@/config/footer-links";
import { useContextualMessage } from "@/hooks/use-contextual-message";
import { useWhatsAppPosition } from "@/hooks/use-whatsapp-position";

export interface WhatsAppFloatingButtonProps {
  number: string;
  className?: string;
}

const DRAG_RESET_DELAY_MS = 100;

const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/[^0-9]/g, "");
  if (!digits) return null;
  return digits;
};

export function WhatsAppFloatingButton({
  number,
  className = "",
}: WhatsAppFloatingButtonProps) {
  const t = useTranslations("common.whatsapp");
  const tCommon = useTranslations("common");
  const tokens = WHATSAPP_STYLE_TOKENS;
  const normalizedNumber = normalizePhoneNumber(number);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { position, persistPosition } = useWhatsAppPosition();
  const [isDragging, setIsDragging] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const defaultMessage = t("defaultMessage");
  const contextualMessage = useContextualMessage(defaultMessage);

  const translations = {
    greeting: t("greeting"),
    responseTime: t("responseTime"),
    placeholder: t("placeholder"),
    startChat: t("startChat"),
    close: tCommon("close"),
  };

  const buttonLabel = t("buttonLabel");
  const supportChatLabel = t("supportChat");

  // Handle click outside to close chat window
  useEffect(() => {
    if (!isChatOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (nodeRef.current && nodeRef.current.contains(event.target as Node)) {
        return;
      }
      setIsChatOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isChatOpen]);

  if (!normalizedNumber) return null;

  const handleStart = () => setIsDragging(false);
  const handleDrag = () => setIsDragging(true);

  const handleStop = (_e: unknown, data: { x: number; y: number }) => {
    persistPosition(data.x, data.y);
    setTimeout(() => setIsDragging(false), DRAG_RESET_DELAY_MS);
  };

  const handleButtonClick = () => setIsChatOpen((prev) => !prev);

  return (
    <Draggable
      nodeRef={nodeRef}
      bounds="body"
      position={position}
      onStart={handleStart}
      onDrag={handleDrag}
      onStop={handleStop}
      cancel=".whatsapp-chat-window"
    >
      <div
        ref={nodeRef}
        role="complementary"
        aria-label={supportChatLabel}
        className="fixed right-6 z-[1100]"
        style={{
          cursor: isDragging ? "grabbing" : "grab",
          bottom: "24px",
          translate: "0 calc(-1 * var(--cookie-banner-height, 0px))",
        }}
      >
        {isChatOpen && (
          <WhatsAppChatWindow
            number={normalizedNumber}
            defaultMessage={contextualMessage}
            onClose={() => setIsChatOpen(false)}
            translations={translations}
          />
        )}

        <WhatsAppFabButton
          isChatOpen={isChatOpen}
          isDragging={isDragging}
          buttonLabel={buttonLabel}
          tokens={tokens}
          className={className}
          onClick={handleButtonClick}
        />
      </div>
    </Draggable>
  );
}
