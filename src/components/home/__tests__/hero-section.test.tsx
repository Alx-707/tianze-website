import React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
// Import the re-exported static variant to avoid rendering Server Component in tests

import {
  HeroSectionStatic,
  type HeroSectionMessages,
} from "@/components/home/hero-section";

// Test static translation messages covering all HeroSectionStatic keys
// (now re-exports HeroSplitBlockStatic with new interface)
const mockMessages: HeroSectionMessages = {
  badge: "About Us →",
  title: { line1: "Equipment + Fittings", line2: "Integrated Manufacturer" },
  subtitle:
    "Self-developed bending machines, self-produced precision fittings. From equipment to finished products, full chain control.",
  scrollCta: "Learn More",
  stats: {
    factory: "Factory Direct",
    material: "100% Virgin Material",
    production: "Fully Automated",
    repurchase: "60% Repurchase Rate",
  },
  images: {
    bender: "Pipe Bending Machine",
    expander: "Pipe Expander",
    line: "Production Line",
  },
};

const renderHero = (props?: Partial<Parameters<typeof HeroSectionStatic>[0]>) =>
  render(<HeroSectionStatic messages={mockMessages} {...props} />);

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/image for ImageCarousel
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    fill,
    sizes,
    ...props
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    sizes?: string;
  }) => (
    <img
      src={src}
      alt={alt}
      data-fill={fill?.toString()}
      data-sizes={sizes}
      {...props}
    />
  ),
}));

// Mock Lucide React icons
vi.mock("lucide-react", () => ({
  ChevronDown: () => <div data-testid="chevron-down-icon">ChevronDown</div>,
}));

// Mock UI components
vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children, className, ...props }: React.ComponentProps<"span">) => (
    <span data-testid="badge" className={className} {...props}>
      {children}
    </span>
  ),
}));

// Mock ImageCarousel
vi.mock("@/components/blocks/shared/image-carousel", () => ({
  ImageCarousel: ({
    images,
  }: {
    images: Array<{ src: string; alt: string }>;
  }) => (
    <div data-testid="image-carousel">
      {images.map((img) => (
        <img key={img.src} src={img.src} alt={img.alt} />
      ))}
    </div>
  ),
}));

// Mock StatBar
vi.mock("@/components/blocks/shared/stat-bar", () => ({
  StatBar: ({ stats }: { stats: Array<{ label: string }> }) => (
    <div data-testid="stat-bar">
      {stats.map((stat) => (
        <span key={stat.label}>{stat.label}</span>
      ))}
    </div>
  ),
}));

describe("HeroSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render hero section without errors", () => {
      renderHero();
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should render badge with link to about page", () => {
      renderHero();
      const badge = screen.getByTestId("badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("About Us →");
      // Badge is wrapped in a Link
      const link = screen.getByRole("link", { name: /about us/i });
      expect(link).toHaveAttribute("href", "/about");
    });

    it("should render hero title with both lines", () => {
      renderHero();
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent("Equipment + Fittings");
      expect(heading).toHaveTextContent("Integrated Manufacturer");
    });

    it("should render subtitle", () => {
      renderHero();
      expect(
        screen.getByText(
          "Self-developed bending machines, self-produced precision fittings. From equipment to finished products, full chain control.",
        ),
      ).toBeInTheDocument();
    });

    it("should render image carousel", () => {
      renderHero();
      expect(screen.getByTestId("image-carousel")).toBeInTheDocument();
    });

    it("should render stat bar", () => {
      renderHero();
      expect(screen.getByTestId("stat-bar")).toBeInTheDocument();
    });

    it("should render scroll CTA with chevron icon", () => {
      renderHero();
      expect(screen.getByText("Learn More")).toBeInTheDocument();
      expect(screen.getByTestId("chevron-down-icon")).toBeInTheDocument();
    });
  });

  describe("Props Customization", () => {
    it("should accept custom className", () => {
      renderHero({ className: "custom-class" });
      const section = screen.getByTestId("hero-section");
      expect(section).toHaveClass("custom-class");
    });
  });

  describe("Statistics Section", () => {
    it("should render all stats", () => {
      renderHero();
      expect(screen.getByText("Factory Direct")).toBeInTheDocument();
      expect(screen.getByText("100% Virgin Material")).toBeInTheDocument();
      expect(screen.getByText("Fully Automated")).toBeInTheDocument();
      expect(screen.getByText("60% Repurchase Rate")).toBeInTheDocument();
    });
  });

  describe("Images Section", () => {
    it("should render all carousel images with correct alt text", () => {
      renderHero();
      expect(
        screen.getByRole("img", { name: "Pipe Bending Machine" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "Pipe Expander" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("img", { name: "Production Line" }),
      ).toBeInTheDocument();
    });
  });

  describe("Internationalization", () => {
    it("should use translations for all text content", () => {
      renderHero();
      expect(screen.getByText("About Us →")).toBeInTheDocument();
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent("Equipment + Fittings");
      expect(heading).toHaveTextContent("Integrated Manufacturer");
    });

    it("should handle missing translations gracefully with defaults", () => {
      expect(() =>
        render(
          <HeroSectionStatic messages={{ title: { line1: "", line2: "" } }} />,
        ),
      ).not.toThrow();
      expect(screen.getByTestId("hero-section")).toBeInTheDocument();
      // Should fall back to default values
      expect(screen.getByText("About Us →")).toBeInTheDocument();
    });
  });

  describe("Responsive Behavior", () => {
    it("should render with responsive classes", () => {
      renderHero();
      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveClass("text-4xl", "sm:text-5xl", "lg:text-6xl");
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic structure", () => {
      renderHero();
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      const section = screen.getByTestId("hero-section");
      expect(section).toHaveAttribute("aria-labelledby", "hero-heading");
    });

    it("should have accessible link for badge", () => {
      renderHero();
      const link = screen.getByRole("link", { name: /about us/i });
      expect(link).toHaveAttribute("href", "/about");
    });

    it("should have scroll CTA link to products section", () => {
      renderHero();
      const scrollLink = screen.getByRole("link", { name: /learn more/i });
      expect(scrollLink).toHaveAttribute("href", "#products");
    });
  });

  describe("Edge Cases", () => {
    it("should render with empty messages", () => {
      expect(() => render(<HeroSectionStatic messages={{}} />)).not.toThrow();
      expect(screen.getByTestId("hero-section")).toBeInTheDocument();
    });

    it("should use default values when messages are missing", () => {
      render(<HeroSectionStatic messages={{}} />);
      // Should show default title
      expect(screen.getByText("Equipment + Fittings")).toBeInTheDocument();
      expect(screen.getByText("Integrated Manufacturer")).toBeInTheDocument();
    });
  });
});
