"use client";

import { useTranslations } from "next-intl";

interface FooterLink {
  label: string;
  href: string;
}

function FooterColumn({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--footer-heading)]">
        {heading}
      </h3>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}

function FooterLink({ href, label }: FooterLink) {
  return (
    <a
      href={href}
      className="block text-sm text-[var(--footer-link)] transition-colors hover:text-white"
    >
      {label}
    </a>
  );
}

const PRODUCT_KEYS = ["item1", "item2", "item3", "item4"] as const;
const RESOURCE_KEYS = ["item1", "item2", "item3", "item4"] as const;
const CONTACT_KEYS = ["item1", "item2", "item3", "item4"] as const;

export function SiteFooter() {
  const t = useTranslations("home.footer");

  return (
    <footer className="bg-[var(--footer-bg)] text-[var(--footer-text)]">
      <div className="mx-auto max-w-[1080px] px-6 py-14 md:py-[72px]">
        {/* Column grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          {/* About */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--footer-heading)]">
              {t("about.title")}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[var(--footer-link)]">
              {t("about.desc")}
            </p>
          </div>

          {/* Products */}
          <FooterColumn heading={t("products.title")}>
            {PRODUCT_KEYS.map((key) => (
              <FooterLink
                key={key}
                href="#"
                label={t(`products.items.${key}`)}
              />
            ))}
          </FooterColumn>

          {/* Resources */}
          <FooterColumn heading={t("resources.title")}>
            {RESOURCE_KEYS.map((key) => (
              <FooterLink
                key={key}
                href="#"
                label={t(`resources.items.${key}`)}
              />
            ))}
          </FooterColumn>

          {/* Contact */}
          <FooterColumn heading={t("contact.title")}>
            {CONTACT_KEYS.map((key) => (
              <FooterLink
                key={key}
                href="#"
                label={t(`contact.items.${key}`)}
              />
            ))}
          </FooterColumn>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-[var(--footer-link)]/20 pt-6 text-[13px] text-[var(--footer-link)] sm:flex-row">
          <span>{t("copyright")}</span>
          <span>{t("location")}</span>
        </div>
      </div>
    </footer>
  );
}
