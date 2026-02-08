import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QualitySection } from "@/components/sections/quality-section";

describe("QualitySection", () => {
  it("renders without crashing", () => {
    render(<QualitySection />);
    expect(
      screen.getByRole("heading", { level: 2, name: "title" }),
    ).toBeInTheDocument();
  });

  it("renders section subtitle", () => {
    render(<QualitySection />);
    expect(screen.getByText("subtitle")).toBeInTheDocument();
  });

  it("renders 5 commitment cards with titles and descriptions", () => {
    render(<QualitySection />);

    const keys = [
      "commitment1",
      "commitment2",
      "commitment3",
      "commitment4",
      "commitment5",
    ];
    for (const key of keys) {
      expect(screen.getByText(`${key}.title`)).toBeInTheDocument();
      expect(screen.getByText(`${key}.desc`)).toBeInTheDocument();
    }
  });

  it("renders 4 certification badges", () => {
    render(<QualitySection />);

    expect(screen.getByText("cert1")).toBeInTheDocument();
    expect(screen.getByText("cert2")).toBeInTheDocument();
    expect(screen.getByText("cert3")).toBeInTheDocument();
    expect(screen.getByText("cert4")).toBeInTheDocument();
  });

  it("renders logo wall placeholder", () => {
    render(<QualitySection />);
    expect(screen.getByText("logoWall")).toBeInTheDocument();
  });
});
