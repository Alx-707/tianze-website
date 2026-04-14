import type { Locale } from "@/types/i18n";
import { getTranslationsCached } from "@/lib/i18n/server/getTranslationsCached";

export interface ContactHeaderCopy {
  title: string;
  description: string;
}

export interface ContactPanelContactCopy {
  title: string;
  emailLabel: string;
  phoneLabel: string;
}

export interface ContactPanelHoursCopy {
  title: string;
  weekdaysLabel: string;
  saturdayLabel: string;
  sundayLabel: string;
  closedLabel: string;
}

export interface ContactPanelWhatsAppCopy {
  label: string;
  chatNow: string;
  comingSoon: string;
}

export interface ContactCopyModel {
  header: ContactHeaderCopy;
  panel: {
    contact: ContactPanelContactCopy;
    hours: ContactPanelHoursCopy;
    whatsapp: ContactPanelWhatsAppCopy;
  };
}

/**
 * Server-side helper to build a structured copy model for the contact page.
 *
 * Depends only on the explicit `locale` parameter and the
 * `underConstruction.pages.contact` i18n namespace.
 */
export async function getContactCopy(
  locale: Locale,
): Promise<ContactCopyModel> {
  const t = await getTranslationsCached({
    locale,
    namespace: "underConstruction.pages.contact",
  });

  return {
    header: {
      title: t("title"),
      description: t("description"),
    },
    panel: {
      contact: {
        title: t("panel.contactTitle"),
        emailLabel: t("panel.email"),
        phoneLabel: t("panel.phone"),
      },
      hours: {
        title: t("panel.hoursTitle"),
        weekdaysLabel: t("panel.weekdays"),
        saturdayLabel: t("panel.saturday"),
        sundayLabel: t("panel.sunday"),
        closedLabel: t("panel.closed"),
      },
      whatsapp: {
        label: t("panel.whatsapp"),
        chatNow: t("panel.chatNow"),
        comingSoon: t("panel.comingSoon"),
      },
    },
  };
}
