import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChainSection } from "@/components/sections/chain-section";

describe("ChainSection", () => {
  it("renders without crashing", () => {
    render(<ChainSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: "chain.title" }),
    ).toBeInTheDocument();
  });

  it("renders section subtitle", () => {
    render(<ChainSection />);
    expect(screen.getByText("chain.subtitle")).toBeInTheDocument();
  });

  it("renders 5 step cards with titles and descriptions", () => {
    render(<ChainSection />);

    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`chain.step${i}.title`)).toBeInTheDocument();
      expect(screen.getByText(`chain.step${i}.desc`)).toBeInTheDocument();
    }
  });

  it("renders step numbers 01 through 05", () => {
    render(<ChainSection />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(String(i).padStart(2, "0"))).toBeInTheDocument();
    }
  });

  it("renders 5 step h3 headings", () => {
    render(<ChainSection />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(5);
  });

  it("renders 3 stat cards", () => {
    render(<ChainSection />);
    expect(screen.getByText("chain.stat1")).toBeInTheDocument();
    expect(screen.getByText("chain.stat2")).toBeInTheDocument();
    expect(screen.getByText("chain.stat3")).toBeInTheDocument();
  });
});
