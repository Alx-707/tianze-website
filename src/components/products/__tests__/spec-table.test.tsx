import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpecTable } from "../spec-table";
import type { SpecGroup } from "@/constants/product-specs/types";

const mockGroups: SpecGroup[] = [
  {
    groupLabel: "Schedule 40",
    columns: ["Size", "Angle", "Wall", "End Type"],
    rows: [
      ['1/2"', "90°", '0.060"', "Bell End"],
      ['3/4"', "90°", '0.060"', "Plain End"],
    ],
  },
  {
    groupLabel: "Schedule 80",
    columns: ["Size", "Angle", "Wall", "End Type"],
    rows: [['1/2"', "90°", '0.084"', "Bell End"]],
  },
];

describe("Feature: Market Page — Spec Matrix", () => {
  describe("Scenario: Buyer reads specification matrix for a product family", () => {
    it("renders group labels as subheadings", () => {
      render(<SpecTable specGroups={mockGroups} />);
      expect(screen.getByText("Schedule 40")).toBeInTheDocument();
      expect(screen.getByText("Schedule 80")).toBeInTheDocument();
    });

    it("renders column headers in table head", () => {
      render(<SpecTable specGroups={mockGroups} />);
      const headers = screen.getAllByRole("columnheader");
      expect(headers.map((h) => h.textContent)).toEqual(
        expect.arrayContaining(["Size", "Angle", "Wall", "End Type"]),
      );
    });

    it("renders data rows with correct values", () => {
      render(<SpecTable specGroups={mockGroups} />);
      // Values appear across multiple groups — use getAllByText
      expect(screen.getAllByText('1/2"').length).toBeGreaterThan(0);
      expect(screen.getAllByText("90°").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Bell End").length).toBeGreaterThan(0);
    });

    it("uses semantic table elements", () => {
      const { container } = render(<SpecTable specGroups={mockGroups} />);
      expect(container.querySelector("table")).toBeInTheDocument();
      expect(container.querySelector("thead")).toBeInTheDocument();
      expect(container.querySelector("tbody")).toBeInTheDocument();
    });

    it("wraps table in horizontally scrollable container", () => {
      const { container } = render(<SpecTable specGroups={mockGroups} />);
      const wrapper = container.querySelector('[class*="overflow"]');
      expect(wrapper).toBeInTheDocument();
    });
  });
});
