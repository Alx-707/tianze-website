import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SectionHeader } from "../section-header";

describe("SectionHeader", () => {
  it("renders eyebrow and title", () => {
    render(<SectionHeader eyebrow="产品中心" title="设备与管件 一站式供应" />);

    expect(screen.getByText("产品中心")).toBeInTheDocument();
    expect(screen.getByText("设备与管件 一站式供应")).toBeInTheDocument();
  });

  it("renders without eyebrow when not provided", () => {
    render(<SectionHeader title="测试标题" />);

    expect(screen.getByText("测试标题")).toBeInTheDocument();
  });
});
