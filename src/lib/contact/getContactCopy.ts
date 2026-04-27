import type { Locale } from "@/types/i18n";
import { loadCompleteMessages } from "@/lib/load-messages";
import {
  readMessagePath,
  type MessageRecord,
} from "@/lib/i18n/read-message-path";

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

export function getContactCopyFromMessages(
  messages: MessageRecord,
): ContactCopyModel {
  const pick = (key: string) =>
    readMessagePath(
      messages,
      ["underConstruction", "pages", "contact", ...key.split(".")],
      key,
    );

  return {
    header: {
      title: pick("title"),
      description: pick("description"),
    },
    panel: {
      contact: {
        title: pick("panel.contactTitle"),
        emailLabel: pick("panel.email"),
        phoneLabel: pick("panel.phone"),
      },
      hours: {
        title: pick("panel.hoursTitle"),
        weekdaysLabel: pick("panel.weekdays"),
        saturdayLabel: pick("panel.saturday"),
        sundayLabel: pick("panel.sunday"),
        closedLabel: pick("panel.closed"),
      },
      response: {
        title: pick("panel.responseTitle"),
        responseTimeLabel: pick("panel.responseTimeLabel"),
        responseTimeValue: pick("panel.responseTimeValue"),
        bestForLabel: pick("panel.bestForLabel"),
        bestForValue: pick("panel.bestForValue"),
        prepareLabel: pick("panel.prepareLabel"),
        prepareValue: pick("panel.prepareValue"),
      },
    },
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
  return getContactCopyFromMessages(await loadCompleteMessages(locale));
}
