"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";

type ContactFormComponent = ComponentType;
interface LoadedContactForm {
  Component: ContactFormComponent;
}

interface ContactFormIslandProps {
  fallback: ReactNode;
}

export function ContactFormIsland({ fallback }: ContactFormIslandProps) {
  const [loadedContactForm, setLoadedContactForm] =
    useState<LoadedContactForm>();

  useEffect(() => {
    let isMounted = true;

    async function loadContactForm() {
      const contactFormModule =
        await import("@/components/contact/contact-form");

      if (isMounted) {
        setLoadedContactForm({ Component: contactFormModule.ContactForm });
      }
    }

    // eslint-disable-next-line react-you-might-not-need-an-effect/no-initialize-state -- The real contact form imports a Server Action, so it must load after hydration for Cloudflare PPR.
    loadContactForm().catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  if (loadedContactForm === undefined) {
    return <>{fallback}</>;
  }

  const { Component: ContactFormComponent } = loadedContactForm;

  return <ContactFormComponent />;
}
