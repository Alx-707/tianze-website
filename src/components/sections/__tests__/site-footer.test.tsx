import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteFooter } from "@/components/sections/site-footer";

describe("SiteFooter", () => {
  it("renders without crashing", () => {
    render(<SiteFooter />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders about section with title and description", () => {
    render(<SiteFooter />);
    expect(screen.getByText("about.title")).toBeInTheDocument();
    expect(screen.getByText("about.desc")).toBeInTheDocument();
  });

  it("renders products column with 4 links", () => {
    render(<SiteFooter />);
    expect(screen.getByText("products.title")).toBeInTheDocument();
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByText(`products.items.item${i}`)).toBeInTheDocument();
    }
  });

  it("renders resources column with 4 links", () => {
    render(<SiteFooter />);
    expect(screen.getByText("resources.title")).toBeInTheDocument();
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByText(`resources.items.item${i}`)).toBeInTheDocument();
    }
  });

  it("renders contact column with 4 links", () => {
    render(<SiteFooter />);
    expect(screen.getByText("contact.title")).toBeInTheDocument();
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByText(`contact.items.item${i}`)).toBeInTheDocument();
    }
  });

  it("renders copyright and location in bottom bar", () => {
    render(<SiteFooter />);
    expect(screen.getByText("copyright")).toBeInTheDocument();
    expect(screen.getByText("location")).toBeInTheDocument();
  });

  it("renders 12 footer links total (4 per column x 3 columns)", () => {
    render(<SiteFooter />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(12);
  });
});
