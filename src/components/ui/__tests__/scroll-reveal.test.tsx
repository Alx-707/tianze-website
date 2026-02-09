import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ScrollReveal } from "../scroll-reveal";

const mockUseIntersectionObserver = vi.fn();
const mockUseIntersectionObserverWithDelay = vi.fn();

vi.mock("@/hooks/use-intersection-observer", () => ({
  useIntersectionObserver: (...args: unknown[]) =>
    mockUseIntersectionObserver(...args),
  useIntersectionObserverWithDelay: (...args: unknown[]) =>
    mockUseIntersectionObserverWithDelay(...args),
}));

function setupMock(isVisible = false) {
  const ref = vi.fn();
  mockUseIntersectionObserver.mockReturnValue({
    ref,
    isVisible,
    hasBeenVisible: isVisible,
  });
  mockUseIntersectionObserverWithDelay.mockReturnValue({
    ref,
    isVisible,
    hasBeenVisible: isVisible,
  });
}

describe("ScrollReveal", () => {
  it("renders children", () => {
    setupMock(true);
    render(<ScrollReveal>Hello World</ScrollReveal>);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("applies hidden state via inline style when not visible", () => {
    setupMock(false);
    const { container } = render(<ScrollReveal>Content</ScrollReveal>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe("0");
    expect(wrapper.style.transform).toContain("translateY");
  });

  it("applies visible state via inline style when visible", () => {
    setupMock(true);
    const { container } = render(<ScrollReveal>Content</ScrollReveal>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe("1");
    expect(wrapper.style.transform).toContain("translateY(0)");
  });

  it("supports direction=fade (no translateY offset)", () => {
    setupMock(false);
    const { container } = render(
      <ScrollReveal direction="fade">Content</ScrollReveal>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe("0");
    expect(wrapper.style.transform).toContain("translateY(0)");
  });

  it("supports direction=scale", () => {
    setupMock(false);
    const { container } = render(
      <ScrollReveal direction="scale">Content</ScrollReveal>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.transform).toContain("scale(0.92)");
  });

  it("uses delay hook when delay > 0", () => {
    setupMock(false);
    render(<ScrollReveal delay={100}>Content</ScrollReveal>);
    expect(mockUseIntersectionObserverWithDelay).toHaveBeenCalled();
  });

  it("computes delay from staggerIndex (default interval 100ms)", () => {
    setupMock(false);
    render(<ScrollReveal staggerIndex={2}>Content</ScrollReveal>);
    expect(mockUseIntersectionObserverWithDelay).toHaveBeenCalledWith(
      expect.any(Object),
      200,
    );
  });

  it("renders as specified HTML tag", () => {
    setupMock(true);
    const { container } = render(
      <ScrollReveal as="section">Content</ScrollReveal>,
    );
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  it("passes className through", () => {
    setupMock(true);
    const { container } = render(
      <ScrollReveal className="custom-class">Content</ScrollReveal>,
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-class");
  });

  it("includes transition classes", () => {
    setupMock(false);
    const { container } = render(<ScrollReveal>Content</ScrollReveal>);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("transition-[opacity,transform]");
  });
});
