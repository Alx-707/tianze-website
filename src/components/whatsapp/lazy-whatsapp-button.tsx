"use client";

import dynamic from "next/dynamic";

const WhatsAppFloatingButton = dynamic(
  () =>
    import("@/components/whatsapp/whatsapp-floating-button").then(
      (mod) => mod.WhatsAppFloatingButton,
    ),
  {
    ssr: false,
    loading: () => null,
  },
);

interface LazyWhatsAppButtonProps {
  number: string;
}

/**
 * Client-side lazy loader for WhatsApp button
 * Uses ssr: false to avoid MISSING_MESSAGE errors during SSG
 */
export function LazyWhatsAppButton({ number }: LazyWhatsAppButtonProps) {
  return <WhatsAppFloatingButton number={number} />;
}
