import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomeStatic } from "@/components/home/home-static-page";

vi.mock("@/lib/i18n/extract-hero-messages", () => ({
  extractHeroMessages: vi.fn((messages: Record<string, unknown>) => messages),
}));

vi.mock("@/components/blocks/hero/hero-split-block", () => ({
  HeroSplitBlockStatic: ({
    messages,
  }: {
    messages: Record<string, unknown>;
  }) => (
    <div
      data-testid="hero-split-block-static"
      data-messages={JSON.stringify(messages)}
    >
      Hero Split Block Static
    </div>
  ),
}));

vi.mock("@/components/i18n/translations-boundary", () => ({
  default: ({
    children,
    locale,
  }: {
    children: React.ReactNode;
    locale: string;
  }) => (
    <div data-testid="translations-boundary" data-locale={locale}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/blocks/tech/tech-tabs-block", () => ({
  TechTabsBlock: () => <div data-testid="tech-tabs-block">Tech Tabs Block</div>,
}));

vi.mock("@/components/home/component-showcase", () => ({
  ComponentShowcase: () => (
    <div data-testid="component-showcase">Component Showcase</div>
  ),
}));

vi.mock("@/components/blocks/features/features-grid-block", () => ({
  FeaturesGridBlock: () => (
    <div data-testid="features-grid-block">Features Grid Block</div>
  ),
}));

vi.mock("@/components/blocks/cta/cta-banner-block", () => ({
  CTABannerBlock: () => (
    <div data-testid="cta-banner-block">CTA Banner Block</div>
  ),
}));

describe("HomeStatic", () => {
  const defaultMessages = {
    "home.hero": {
      title: "Test Title",
      subtitle: "Test Subtitle",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_FAST_LCP_ZH;
  });

  it("renders the main container with correct classes", () => {
    const { container } = render(<HomeStatic messages={defaultMessages} />);
    const mainDiv = container.firstChild as HTMLElement;

    expect(mainDiv).toHaveClass(
      "min-h-screen",
      "bg-background",
      "text-foreground",
    );
  });

  it("renders HeroSplitBlockStatic with messages", () => {
    render(<HomeStatic messages={defaultMessages} />);

    expect(screen.getByTestId("hero-split-block-static")).toBeInTheDocument();
  });

  it("renders below-the-fold content wrapped in Suspense and TranslationsBoundary", () => {
    render(<HomeStatic messages={defaultMessages} />);

    expect(screen.getByTestId("translations-boundary")).toBeInTheDocument();
  });

  it("uses default locale when not provided", () => {
    render(<HomeStatic messages={defaultMessages} />);

    const boundary = screen.getByTestId("translations-boundary");
    expect(boundary).toHaveAttribute("data-locale", "en");
  });

  it("uses provided locale", () => {
    render(<HomeStatic messages={defaultMessages} locale="zh" />);

    const boundary = screen.getByTestId("translations-boundary");
    expect(boundary).toHaveAttribute("data-locale", "zh");
  });

  describe("Fast LCP ZH experiment", () => {
    it("sets data-fast-lcp-zh attribute when experiment is enabled for zh locale", () => {
      process.env.NEXT_PUBLIC_FAST_LCP_ZH = "1";

      const { container } = render(
        <HomeStatic messages={defaultMessages} locale="zh" />,
      );
      const mainDiv = container.firstChild as HTMLElement;

      expect(mainDiv).toHaveAttribute("data-fast-lcp-zh", "1");
    });

    it("does not set data-fast-lcp-zh attribute for en locale even with experiment enabled", () => {
      process.env.NEXT_PUBLIC_FAST_LCP_ZH = "1";

      const { container } = render(
        <HomeStatic messages={defaultMessages} locale="en" />,
      );
      const mainDiv = container.firstChild as HTMLElement;

      expect(mainDiv).not.toHaveAttribute("data-fast-lcp-zh");
    });

    it("does not set data-fast-lcp-zh attribute when experiment is disabled", () => {
      process.env.NEXT_PUBLIC_FAST_LCP_ZH = "0";

      const { container } = render(
        <HomeStatic messages={defaultMessages} locale="zh" />,
      );
      const mainDiv = container.firstChild as HTMLElement;

      expect(mainDiv).not.toHaveAttribute("data-fast-lcp-zh");
    });
  });

  it("exports HomeStatic as named export", async () => {
    const module = await import("@/components/home/home-static-page");
    expect(module.HomeStatic).toBeDefined();
    expect(typeof module.HomeStatic).toBe("function");
  });
});
