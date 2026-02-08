import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ScenariosSection } from "@/components/sections/scenarios-section";

describe("ScenariosSection", () => {
  it("renders without crashing", () => {
    render(<ScenariosSection />);
    expect(
      screen.getByRole("heading", { level: 2, name: "title" }),
    ).toBeInTheDocument();
  });

  it("renders section subtitle", () => {
    render(<ScenariosSection />);
    expect(screen.getByText("subtitle")).toBeInTheDocument();
  });

  it("renders 3 scenario cards with title, desc, and quote", () => {
    render(<ScenariosSection />);

    const keys = ["item1", "item2", "item3"];
    for (const key of keys) {
      expect(screen.getByText(`${key}.title`)).toBeInTheDocument();
      expect(screen.getByText(`${key}.desc`)).toBeInTheDocument();
      expect(screen.getByText(`${key}.quote`)).toBeInTheDocument();
    }
  });

  it("renders exactly 3 h3 headings for scenario cards", () => {
    render(<ScenariosSection />);
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(3);
  });
});
