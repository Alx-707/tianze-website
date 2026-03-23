import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StickyFamilyNav } from "../sticky-family-nav";

const mockFamilies = [
  { slug: "conduit-sweeps-elbows", label: "Conduit Sweeps & Elbows" },
  { slug: "couplings", label: "Couplings" },
  { slug: "conduit-pipes", label: "Conduit Pipes" },
];

describe("Feature: Market Page — Sticky Navigation", () => {
  describe("Scenario: Buyer jumps between product families", () => {
    it("renders a nav link for each family", () => {
      render(<StickyFamilyNav families={mockFamilies} />);
      expect(screen.getByText("Conduit Sweeps & Elbows")).toBeInTheDocument();
      expect(screen.getByText("Couplings")).toBeInTheDocument();
      expect(screen.getByText("Conduit Pipes")).toBeInTheDocument();
    });

    it("each link points to the correct anchor", () => {
      render(<StickyFamilyNav families={mockFamilies} />);
      const sweepsLink = screen
        .getByText("Conduit Sweeps & Elbows")
        .closest("a");
      expect(sweepsLink).toHaveAttribute("href", "#conduit-sweeps-elbows");
      const couplingsLink = screen.getByText("Couplings").closest("a");
      expect(couplingsLink).toHaveAttribute("href", "#couplings");
    });

    it("renders as a nav element for accessibility", () => {
      render(<StickyFamilyNav families={mockFamilies} />);
      expect(screen.getByRole("navigation")).toBeInTheDocument();
    });
  });
});
