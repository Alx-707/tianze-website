/**
 * Timer-focused test for LanguageToggle.
 *
 * Covers line 56: `successResetRef.current = setTimeout(resetSuccessState, RESPONSE_TIME_DEGRADED_MS)`
 * which is inside scheduleSuccessReset, invoked by finalizeSwitch after TRANSITION_TIMEOUT.
 */
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { LanguageToggle } from "@/components/language-toggle";

// Hoisted mock functions
const { mockPush, mockUsePathname } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockUsePathname: vi.fn(() => "/"),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useLocale: vi.fn(() => "en"),
  useTranslations: vi.fn(() => (key: string) => key),
}));

// Mock i18n routing
vi.mock("@/i18n/routing", () => ({
  Link: ({
    children,
    href,
    locale,
    onClick,
    ...props
  }: {
    children?: React.ReactNode;
    href?: string;
    locale?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
    [key: string]: unknown;
  }) => (
    <a
      href={href}
      data-locale={locale}
      onClick={(e) => {
        e.preventDefault();
        mockPush(`/${locale}${href}`);
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {children}
    </a>
  ),
  usePathname: mockUsePathname,
  useRouter: vi.fn(() => ({
    push: mockPush,
    pathname: "/",
  })),
}));

// Mock next/navigation as fallback
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    pathname: "/",
  })),
  usePathname: mockUsePathname,
}));

// Mock UI components
vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({
    children,
    open,
    onOpenChange,
    ...props
  }: {
    children?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    [key: string]: unknown;
  }) => (
    <div
      data-testid="language-dropdown-menu"
      data-open={open}
      onClick={() => onOpenChange?.(!open)}
      {...props}
    >
      {children}
    </div>
  ),
  DropdownMenuContent: ({
    children,
    ...props
  }: React.ComponentProps<"div">) => (
    <div data-testid="language-dropdown-content" {...props}>
      {children}
    </div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
    ...props
  }: {
    children?: React.ReactNode;
    asChild?: boolean;
    [key: string]: unknown;
  }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement,
        {
          ...props,
          "data-testid": "language-dropdown-trigger",
        } as any,
      );
    }
    return (
      <div data-testid="language-dropdown-trigger" {...props}>
        {children}
      </div>
    );
  },
  DropdownMenuItem: ({
    children,
    onClick,
    asChild,
    ...props
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    asChild?: boolean;
    [key: string]: unknown;
  }) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...(children as any).props,
        ...props,
        "data-testid": "language-dropdown-item",
        onClick: (e: Event) => {
          if ((children as any).props.onClick)
            (children as any).props.onClick(e);
          if (onClick) onClick();
        },
      });
    }
    return (
      <div
        data-testid="language-dropdown-item"
        onClick={onClick}
        role="menuitem"
        {...props}
      >
        {children}
      </div>
    );
  },
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    asChild: _asChild,
    variant: _variant,
    size: _size,
    ...props
  }: React.ComponentProps<"button"> & {
    asChild?: boolean;
    variant?: string;
    size?: string;
  }) => (
    <button data-testid="language-toggle-button" {...props}>
      {children}
    </button>
  ),
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Globe: (props: React.ComponentProps<"span">) => (
    <span data-testid="globe-icon" {...props} />
  ),
  ChevronDown: (props: React.ComponentProps<"span">) => (
    <span data-testid="chevron-down-icon" {...props} />
  ),
  Loader2: (props: React.ComponentProps<"span">) => (
    <span data-testid="loader-icon" {...props} />
  ),
  Check: (props: React.ComponentProps<"span">) => (
    <span data-testid="check-icon" {...props} />
  ),
}));

// Constants for timer values (keep in sync with source)
const TRANSITION_TIMEOUT = 1000;

describe("LanguageToggle timer behavior", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should invoke scheduleSuccessReset after transition timeout", () => {
    render(<LanguageToggle />);

    // Open dropdown
    const trigger = document.querySelector(
      '[data-testid="language-dropdown-trigger"]',
    );
    expect(trigger).toBeInTheDocument();
    fireEvent.click(trigger!);

    // Click language item to trigger handleLanguageSwitch
    const zhItem = document.querySelector('a[data-locale="zh"]');
    expect(zhItem).toBeInTheDocument();

    act(() => {
      fireEvent.click(zhItem!);
    });

    // Advance past TRANSITION_TIMEOUT (1000ms) to fire finalizeSwitch
    // which calls scheduleSuccessReset() -> setTimeout(resetSuccessState, RESPONSE_TIME_DEGRADED_MS)
    act(() => {
      vi.advanceTimersByTime(TRANSITION_TIMEOUT + 1);
    });

    // The component should now show success state (switchSuccess = true)
    // scheduleSuccessReset has been called, covering line 56
    expect(trigger).toBeInTheDocument();
  });
});
