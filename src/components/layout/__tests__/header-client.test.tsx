/**
 * @vitest-environment jsdom
 * Tests for header client components (Island components)
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  LanguageToggleIsland,
  MobileNavigationIsland,
  NavSwitcherIsland,
} from "../header-client";

// Mock next/dynamic
vi.mock("next/dynamic", () => ({
  default: (
    loader: () => Promise<Record<string, unknown>>,
    options?: { ssr?: boolean },
  ) => {
    // Return a component that renders a placeholder
    const DynamicComponent = (props: Record<string, unknown>) => (
      <div
        data-testid="dynamic-component"
        data-ssr={String(options?.ssr ?? true)}
        {...props}
      >
        {props.children as React.ReactNode}
      </div>
    );
    DynamicComponent.displayName = "DynamicComponent";

    // Trigger loader to avoid unused warnings
    loader();
    return DynamicComponent;
  },
}));

// Mock MobileNavigation server shell
vi.mock("@/components/layout/mobile-navigation", () => ({
  MobileNavigationLinks: () => (
    <nav data-testid="mobile-navigation-links">
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  ),
}));

vi.mock("@/components/layout/mobile-navigation-interactive", () => ({
  MobileNavigationInteractive: ({
    children,
  }: {
    children?: React.ReactNode;
  }) => <div data-testid="mobile-navigation-interactive">{children}</div>,
}));

// Mock NavSwitcher
vi.mock("@/components/layout/nav-switcher", () => ({
  NavSwitcher: () => <div data-testid="nav-switcher">Nav Switcher</div>,
}));

// Mock LanguageToggle
vi.mock("@/components/language-toggle", () => ({
  LanguageToggle: ({ locale }: { locale: string }) => (
    <div data-testid="language-toggle" data-locale={locale}>
      Language Toggle
    </div>
  ),
}));

describe("MobileNavigationIsland", () => {
  it("renders deferred trigger before loading dynamic component", () => {
    render(<MobileNavigationIsland />);

    const trigger = screen.getByTestId("header-mobile-menu-button");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-controls", "mobile-navigation");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("dynamic-component")).not.toBeInTheDocument();
  });

  it("passes localized labels to the hydrated mobile navigation", () => {
    render(
      <MobileNavigationIsland
        openMenuLabel="打开导航菜单"
        closeMenuLabel="关闭导航菜单"
        languageLabel="选择语言"
      />,
    );

    fireEvent.click(screen.getByTestId("header-mobile-menu-button"));

    const dynamicComponent = screen.getByTestId("dynamic-component");
    expect(dynamicComponent).toHaveAttribute("openMenuLabel", "打开导航菜单");
    expect(dynamicComponent).toHaveAttribute("closeMenuLabel", "关闭导航菜单");
    expect(dynamicComponent).toHaveAttribute("languageLabel", "选择语言");
  });

  it("loads dynamic component after trigger click", () => {
    render(<MobileNavigationIsland />);

    fireEvent.click(screen.getByTestId("header-mobile-menu-button"));

    const dynamicComponent = screen.getByTestId("dynamic-component");
    expect(dynamicComponent).toHaveAttribute("data-ssr", "false");
    expect(screen.getByTestId("mobile-navigation-links")).toBeInTheDocument();
  });

  it("marks the deferred menu label as notranslate", () => {
    render(<MobileNavigationIsland openMenuLabel="Open navigation menu" />);

    expect(screen.getByTestId("header-mobile-menu-label")).toHaveAttribute(
      "translate",
      "no",
    );
  });
});

describe("NavSwitcherIsland", () => {
  it("renders dynamic component with ssr false", () => {
    render(<NavSwitcherIsland />);

    const dynamicComponent = screen.getByTestId("dynamic-component");
    expect(dynamicComponent).toHaveAttribute("data-ssr", "false");
  });
});

describe("LanguageToggleIsland", () => {
  it("renders LanguageToggle with en locale", () => {
    render(<LanguageToggleIsland locale="en" />);

    const toggle = screen.getByTestId("dynamic-component");
    expect(toggle).toHaveAttribute("data-ssr", "false");
  });

  it("renders LanguageToggle with zh locale", () => {
    render(<LanguageToggleIsland locale="zh" />);

    const toggle = screen.getByTestId("dynamic-component");
    expect(toggle).toBeInTheDocument();
  });

  it("passes locale prop to LanguageToggle", () => {
    render(<LanguageToggleIsland locale="zh" />);

    // The dynamic component receives the locale prop
    const toggle = screen.getByTestId("dynamic-component");
    expect(toggle).toHaveAttribute("locale", "zh");
  });

  it("does not wrap in extra i18n provider", () => {
    render(<LanguageToggleIsland locale="en" />);

    // Should not have extra i18n-provider wrapper
    expect(screen.queryByTestId("i18n-provider")).not.toBeInTheDocument();
  });
});

describe("Island components integration", () => {
  it("all islands can render together", () => {
    const { container } = render(
      <>
        <MobileNavigationIsland />
        <NavSwitcherIsland />
        <LanguageToggleIsland locale="en" />
      </>,
    );

    const dynamicComponents = container.querySelectorAll(
      '[data-testid="dynamic-component"]',
    );
    expect(dynamicComponents.length).toBe(2);
    expect(screen.getByTestId("header-mobile-menu-button")).toBeInTheDocument();
  });

  it("all islands accept zh locale", () => {
    render(
      <>
        <MobileNavigationIsland />
        <NavSwitcherIsland />
        <LanguageToggleIsland locale="zh" />
      </>,
    );
  });
});
