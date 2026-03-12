import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { QualitySection } from "@/components/sections/quality-section";

async function renderAsyncComponent(
  asyncComponent: React.JSX.Element | Promise<React.JSX.Element>,
) {
  const resolvedElement = await Promise.resolve(asyncComponent);
  return render(resolvedElement);
}

describe("QualitySection", () => {
  it("renders without crashing", async () => {
    await renderAsyncComponent(QualitySection());
    expect(
      screen.getByRole("heading", { level: 2, name: "title" }),
    ).toBeInTheDocument();
  });

  it("renders section subtitle", async () => {
    await renderAsyncComponent(QualitySection());
    expect(screen.getByText("subtitle")).toBeInTheDocument();
  });

  it("renders 5 commitment cards with titles and descriptions", async () => {
    await renderAsyncComponent(QualitySection());

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

  it("renders 4 certification badges", async () => {
    await renderAsyncComponent(QualitySection());

    expect(screen.getByText("cert1")).toBeInTheDocument();
    expect(screen.getByText("cert2")).toBeInTheDocument();
    expect(screen.getByText("cert3")).toBeInTheDocument();
    expect(screen.getByText("cert4")).toBeInTheDocument();
  });

  it("renders logo wall placeholder", async () => {
    await renderAsyncComponent(QualitySection());
    expect(screen.getByText("logoWall")).toBeInTheDocument();
  });
});
