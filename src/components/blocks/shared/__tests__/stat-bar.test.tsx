import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatBar } from "../stat-bar";

describe("StatBar", () => {
  const stats = [
    { label: "工厂直供" },
    { label: "100% 新料" },
    { label: "全自动生产" },
    { label: "60% 复购率" },
  ];

  it("renders all stat items", () => {
    render(<StatBar stats={stats} />);

    expect(screen.getByText("工厂直供")).toBeInTheDocument();
    expect(screen.getByText("100% 新料")).toBeInTheDocument();
    expect(screen.getByText("全自动生产")).toBeInTheDocument();
    expect(screen.getByText("60% 复购率")).toBeInTheDocument();
  });

  it("renders separators between items", () => {
    const { container } = render(<StatBar stats={stats} />);

    // 4 items = 3 separators
    const separators = container.querySelectorAll('[aria-hidden="true"]');
    expect(separators.length).toBe(3);
  });
});
