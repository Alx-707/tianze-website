import { vi } from "vitest";

// Mock CSS imports to avoid PostCSS processing in tests
vi.mock("@/app/globals.css", () => ({ default: {} }));

// Mock server-only to prevent import errors in test environment
vi.mock("server-only", () => ({}));

// Mock MDX importers to prevent Vite from resolving @content imports in test environment
// This is necessary because @content/* paths reference actual MDX files that may not exist
// or should not be loaded during unit/integration tests
vi.mock("@/lib/mdx-importers.generated", () => ({
  postImporters: {
    en: {},
    zh: {},
  },
  productImporters: {
    en: {},
    zh: {},
  },
  pageImporters: {
    en: {},
    zh: {},
  },
}));

// Mock next/font/local for Open Sans (Twitter theme migration)
vi.mock("next/font/local", () => ({
  default: vi.fn(() => ({
    variable: "--font-open-sans",
    className: "open-sans",
    style: { fontFamily: "Open Sans" },
  })),
}));
