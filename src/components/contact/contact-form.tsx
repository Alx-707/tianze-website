"use client";

import dynamic from "next/dynamic";

const EnhancedContactForm = dynamic(
  () =>
    import("@/components/forms/contact-form").then(
      (module) => module.ContactForm,
    ),
  {
    ssr: false,
    loading: () => (
      <div
        aria-busy="true"
        aria-live="polite"
        className="min-h-[420px] rounded-xl border border-border/50 bg-card"
        role="status"
      >
        <span className="sr-only">Loading contact form...</span>
      </div>
    ),
  },
);

/**
 * 联系表单组件
 * Contact form component using enhanced React Hook Form implementation
 */
export function ContactForm() {
  return <EnhancedContactForm />;
}
