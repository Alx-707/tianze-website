import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResourcesSection } from "@/components/sections/resources-section";

describe("ResourcesSection", () => {
  it("renders without crashing", () => {
    render(<ResourcesSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: "resources.title" }),
    ).toBeInTheDocument();
  });

  it("renders section subtitle", () => {
    render(<ResourcesSection />);
    expect(screen.getByText("resources.subtitle")).toBeInTheDocument();
  });

  it("renders 4 resource cards with titles and descriptions", () => {
    render(<ResourcesSection />);

    for (let i = 1; i <= 4; i++) {
      const key = `item${i}`;
      expect(screen.getByText(`resources.${key}.title`)).toBeInTheDocument();
      expect(screen.getByText(`resources.${key}.desc`)).toBeInTheDocument();
    }
  });

  it("renders 4 resource card h3 headings", () => {
    render(<ResourcesSection />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(4);
  });

  it("renders 4 resource cards as navigable links", () => {
    render(<ResourcesSection />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
    for (const link of links) {
      expect(link).toHaveAttribute("href");
    }
  });
});
