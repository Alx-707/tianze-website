import { getCanonicalPath } from "@/config/paths/utils";

export const SINGLE_SITE_ROUTE_HREFS = {
  home: getCanonicalPath("home"),
  about: getCanonicalPath("about"),
  contact: getCanonicalPath("contact"),
  products: getCanonicalPath("products"),
  blog: getCanonicalPath("blog"),
  privacy: getCanonicalPath("privacy"),
  terms: getCanonicalPath("terms"),
} as const;

export const SINGLE_SITE_HOME_LINK_TARGETS = {
  contact: SINGLE_SITE_ROUTE_HREFS.contact,
  products: SINGLE_SITE_ROUTE_HREFS.products,
} as const;
