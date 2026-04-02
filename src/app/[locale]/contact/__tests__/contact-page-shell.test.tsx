/**
 * @vitest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContactPageFallback } from "@/app/[locale]/contact/contact-page-shell";

describe("ContactPageFallback", () => {
  it("renders default-site fallback copy for the main site", () => {
    render(<ContactPageFallback locale="en" siteKey="tianze" />);

    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText("Send us a message")).toBeInTheDocument();
  });

  it("renders site-aware fallback copy for the equipment site", () => {
    render(<ContactPageFallback locale="en" siteKey="tianze-equipment" />);

    expect(screen.getByText("Contact Tianze Equipment")).toBeInTheDocument();
    expect(screen.getByText("Talk to the Equipment Team")).toBeInTheDocument();
    expect(screen.getByText("Send Equipment Request")).toBeInTheDocument();
  });
});
