/**
 * @vitest-environment jsdom
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ContactPageFallback } from "@/app/[locale]/contact/contact-page-shell";

describe("ContactPageFallback", () => {
  it("renders single-site fallback copy for english", () => {
    render(<ContactPageFallback locale="en" />);

    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText("Send us a message")).toBeInTheDocument();
  });

  it("renders single-site fallback copy for chinese", () => {
    render(<ContactPageFallback locale="zh" />);

    expect(screen.getByText("联系我们")).toBeInTheDocument();
    expect(screen.getByText("给我们留言")).toBeInTheDocument();
    expect(screen.getByText("发送消息")).toBeInTheDocument();
  });
});
