import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SampleCTA } from "@/components/sections/sample-cta";

describe("SampleCTA", () => {
  it("renders without crashing", () => {
    render(<SampleCTA />);
    expect(
      screen.getByRole("heading", { level: 2, name: "sample.title" }),
    ).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<SampleCTA />);
    expect(screen.getByText("sample.description")).toBeInTheDocument();
  });

  it("renders CTA button linking to contact page", () => {
    render(<SampleCTA />);
    const link = screen.getByRole("link", { name: "sample.cta" });
    expect(link).toHaveAttribute("href", "/contact");
  });
});
