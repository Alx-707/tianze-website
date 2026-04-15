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

export interface ContactPanelResponseCopy {
  title: string;
  responseTimeLabel: string;
  responseTimeValue: string;
  bestForLabel: string;
  bestForValue: string;
  prepareLabel: string;
  prepareValue: string;
}

export interface ContactCopyModel {
  header: ContactHeaderCopy;
  panel: {
    contact: ContactPanelContactCopy;
    hours: ContactPanelHoursCopy;
    response: ContactPanelResponseCopy;
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
      response: {
        title: t("panel.responseTitle"),
        responseTimeLabel: t("panel.responseTimeLabel"),
        responseTimeValue: t("panel.responseTimeValue"),
        bestForLabel: t("panel.bestForLabel"),
        bestForValue: t("panel.bestForValue"),
        prepareLabel: t("panel.prepareLabel"),
        prepareValue: t("panel.prepareValue"),
      },
    },
  };
}
