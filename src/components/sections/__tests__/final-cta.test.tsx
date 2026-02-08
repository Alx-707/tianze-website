import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FinalCTA } from "@/components/sections/final-cta";

describe("FinalCTA", () => {
  it("renders without crashing", () => {
    render(<FinalCTA />);
    expect(
      screen.getByRole("heading", { level: 2, name: "title" }),
    ).toBeInTheDocument();
  });

  it("renders description text", () => {
    render(<FinalCTA />);
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("renders primary and secondary buttons", () => {
    render(<FinalCTA />);
    expect(screen.getByText("primary")).toBeInTheDocument();
    expect(screen.getByText("secondary")).toBeInTheDocument();
  });

  it("renders trust text", () => {
    render(<FinalCTA />);
    expect(screen.getByText("trust")).toBeInTheDocument();
  });
});
