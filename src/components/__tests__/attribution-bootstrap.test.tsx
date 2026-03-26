import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("AttributionBootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/en");
  });

  it("detects attribution-bearing search strings", async () => {
    const module = await import("../attribution-bootstrap");
    expect(module.shouldLoadAttribution("?utm_source=test")).toBe(true);
    expect(module.shouldLoadAttribution("?gclid=test-click")).toBe(true);
    expect(module.shouldLoadAttribution("?fbclid=test-click")).toBe(true);
    expect(module.shouldLoadAttribution("?msclkid=test-click")).toBe(true);
    expect(module.shouldLoadAttribution("?foo=bar")).toBe(false);
    expect(module.shouldLoadAttribution("")).toBe(false);
  });

  it("renders nothing (returns null)", async () => {
    const module = await import("../attribution-bootstrap");
    const { container } = render(<module.AttributionBootstrap />);

    expect(container).toBeEmptyDOMElement();
  });

  it("does not load attribution logic when there are no attribution params", async () => {
    const module = await import("../attribution-bootstrap");
    const loadSpy = vi.spyOn(module, "loadAttributionModule");
    render(<module.AttributionBootstrap />);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(loadSpy).not.toHaveBeenCalled();
  });

  it("still avoids loading attribution logic on re-render when no params exist", async () => {
    const module = await import("../attribution-bootstrap");
    const loadSpy = vi.spyOn(module, "loadAttributionModule");

    const { rerender } = render(<module.AttributionBootstrap />);

    rerender(<module.AttributionBootstrap />);
    rerender(<module.AttributionBootstrap />);

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(loadSpy).not.toHaveBeenCalled();
  });
});
