import { env } from "@/lib/env";
import { resolveSiteBaseUrl } from "@/sites/base-url";
import { tianzeProductCatalog } from "@/sites/tianze/product-catalog";
import type { SiteDefinition } from "@/sites/types";

const baseUrl = resolveSiteBaseUrl("tianze", "https://tianze-pipe.com");

const social = {
  twitter: "https://x.com/tianzepipe",
  linkedin: "https://www.linkedin.com/company/tianze-pipe",
  github: "https://github.com/tianze-pipe",
} as const;

const contact = {
  phone: "+86-518-0000-0000",
  email: "sales@tianze-pipe.com",
  whatsappNumber: env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+86-518-0000-0000",
} as const;

const establishedYear = 2018;

export const tianzeSite: SiteDefinition = {
  key: "tianze",
  config: {
    baseUrl,
    name: "Tianze Pipe",
    description:
      "Pipe Bending Experts - Equipment, Process & Fittings Integrated Solutions",
    seo: {
      titleTemplate: "%s | Tianze Pipe - Pipe Bending Experts",
      defaultTitle: "Tianze Pipe - Pipe Bending Experts",
      defaultDescription:
        "Professional PVC pipe bending machinery and pipe fittings manufacturer. Equipment + Process + Fittings integrated solutions for global B2B customers.",
      keywords: [
        "pipe bending machine",
        "PVC pipe bending",
        "pipe bending equipment",
        "PVC conduit",
        "PETG pneumatic tube",
        "pipe fittings",
        "pipe manufacturer China",
        "industrial pipes",
        "Schedule 80 conduit",
        "hospital pneumatic tube system",
      ],
    },
    social,
    contact,
  },
  facts: {
    company: {
      name: "Lianyungang Tianze Pipe Industry Co., Ltd.",
      established: establishedYear,
      yearsInBusiness: new Date().getFullYear() - establishedYear,
      employees: 60,
      location: {
        country: "China",
        city: "Lianyungang, Jiangsu",
        address: "No.6 Yulong Road, Dongwangji Industrial Zone, Guanyun County",
      },
    },
    contact: {
      phone: contact.phone,
      email: contact.email,
      whatsapp: contact.whatsappNumber,
      businessHours: {
        weekdays: "8:00 - 17:30",
        saturday: "8:00 - 12:00",
        sundayClosed: true,
      },
    },
    certifications: [
      {
        name: "ISO 9001:2015",
        certificateNumber: "240021Q09730R0S",
        file: "/certs/iso9001.pdf",
        validUntil: "2027-03",
      },
    ],
    stats: {
      exportCountries: 20,
      annualCapacity: "Integrated pipe, fitting, and machine production",
      clientsServed: 60,
      factoryAreaAcres: 100,
      onTimeDeliveryRate: 98,
    },
    social: {
      linkedin: social.linkedin,
      twitter: social.twitter,
      github: social.github,
    },
  },
  productCatalog: tianzeProductCatalog,
  navigation: {
    main: [
      {
        key: "home",
        href: "/",
        translationKey: "navigation.home",
      },
      {
        key: "products",
        href: "/products",
        translationKey: "navigation.products",
      },
      {
        key: "blog",
        href: "/blog",
        translationKey: "navigation.blog",
      },
      {
        key: "about",
        href: "/about",
        translationKey: "navigation.about",
      },
      {
        key: "privacy",
        href: "/privacy",
        translationKey: "navigation.privacy",
      },
    ],
  },
  footerColumns: [
    {
      key: "navigation",
      title: "Navigation",
      translationKey: "footer.sections.navigation.title",
      links: [
        {
          key: "home",
          label: "Home",
          href: "/",
          external: false,
          translationKey: "footer.sections.navigation.home",
        },
        {
          key: "about",
          label: "About",
          href: "/about",
          external: false,
          translationKey: "footer.sections.navigation.about",
        },
        {
          key: "products",
          label: "Products",
          href: "/products",
          external: false,
          translationKey: "footer.sections.navigation.products",
        },
        {
          key: "blog",
          label: "Blog",
          href: "/blog",
          external: false,
          translationKey: "footer.sections.navigation.blog",
        },
        {
          key: "contact",
          label: "Contact",
          href: "/contact",
          external: false,
          translationKey: "footer.sections.navigation.contact",
        },
      ],
    },
    {
      key: "support",
      title: "Support",
      translationKey: "footer.sections.support.title",
      links: [
        {
          key: "privacy",
          label: "Privacy Policy",
          href: "/privacy",
          external: false,
          translationKey: "footer.sections.support.privacy",
        },
        {
          key: "terms",
          label: "Terms of Service",
          href: "/terms",
          external: false,
          translationKey: "footer.sections.support.terms",
        },
      ],
    },
    {
      key: "social",
      title: "Social",
      translationKey: "footer.sections.social.title",
      links: [
        {
          key: "twitter",
          label: "Twitter",
          href: social.twitter,
          external: true,
          translationKey: "footer.sections.social.twitter",
        },
        {
          key: "linkedin",
          label: "LinkedIn",
          href: social.linkedin,
          external: true,
          translationKey: "footer.sections.social.linkedin",
        },
        {
          key: "github",
          label: "GitHub",
          href: social.github,
          external: true,
          translationKey: "footer.sections.social.github",
        },
      ],
    },
  ],
};
