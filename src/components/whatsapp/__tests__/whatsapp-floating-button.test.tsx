/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WhatsAppFloatingButton } from "@/components/whatsapp/whatsapp-floating-button";

// Mock WhatsAppFabButton
vi.mock("@/components/whatsapp/whatsapp-fab-button", () => ({
  WhatsAppFabButton: React.forwardRef<
    HTMLButtonElement,
    {
      buttonLabel: string;
      isChatOpen: boolean;
      className?: string;
      onClick: () => void;
      "aria-controls"?: string;
      "aria-haspopup"?: string;
    }
  >(function MockWhatsAppFabButton(
    {
      buttonLabel,
      isChatOpen,
      className,
      onClick,
      "aria-controls": ariaControls,
      "aria-haspopup": ariaHaspopup,
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        aria-label={buttonLabel}
        aria-expanded={isChatOpen}
        aria-controls={ariaControls}
        aria-haspopup={ariaHaspopup}
        className={`text-emerald-600 ${className}`}
        onClick={onClick}
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "16px",
          borderWidth: "1px",
        }}
        data-testid="mock-fab-button"
      >
        {isChatOpen ? "Close" : "Open"}
      </button>
    );
  }),
}));

// Mock react-draggable
vi.mock("react-draggable", () => ({
  default: ({
    children,
    nodeRef: _nodeRef,
  }: {
    children: React.ReactNode;
    nodeRef: React.RefObject<HTMLElement>;
  }) => <div data-testid="draggable-wrapper">{children}</div>,
}));

// Mock useWhatsAppPosition hook
vi.mock("@/hooks/use-whatsapp-position", () => ({
  useWhatsAppPosition: vi.fn(() => ({
    position: { x: 0, y: 0 },
    setLocalPosition: vi.fn(),
    persistPosition: vi.fn(),
  })),
}));

// Mock useContextualMessage hook
vi.mock("@/hooks/use-contextual-message", () => ({
  useContextualMessage: vi.fn((msg: string) => msg),
}));

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      "common.whatsapp": {
        greeting: "Need help?",
        responseTime: "Team typically replies within 5 minutes.",
        placeholder: "Type your message...",
        startChat: "Start WhatsApp Chat",
        defaultMessage: "Hi! I'm interested in your products.",
        buttonLabel: "Chat with us on WhatsApp",
        supportChat: "Support chat",
      },
      common: {
        close: "Close",
      },
    };
    return (key: string) => translations[namespace]?.[key] ?? key;
  }),
}));

describe("WhatsAppFloatingButton", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders button with aria-label for WhatsApp chat", () => {
    render(<WhatsAppFloatingButton number="+1 (555) 123-4567" />);

    const button = screen.getByRole("button", {
      name: /chat with us on whatsapp/i,
    });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
    expect(button).toHaveAttribute("aria-controls", "whatsapp-chat-dialog");
  });

  it("skips rendering when number is invalid", () => {
    render(<WhatsAppFloatingButton number="invalid" />);
    expect(
      screen.queryByRole("button", { name: /chat with us on whatsapp/i }),
    ).toBeNull();
  });

  it("renders draggable wrapper", () => {
    render(<WhatsAppFloatingButton number="+1 (555) 123-4567" />);

    const draggableWrapper = screen.getByTestId("draggable-wrapper");
    expect(draggableWrapper).toBeInTheDocument();
  });

  it("renders circular FAB with WhatsApp brand color", () => {
    render(<WhatsAppFloatingButton number="+1 (555) 123-4567" />);

    const button = screen.getByRole("button", {
      name: /chat with us on whatsapp/i,
    });
    expect(button).toHaveStyle({
      width: "52px",
      height: "52px",
      borderRadius: "16px",
      borderWidth: "1px",
    });
    expect(button).toHaveClass("text-emerald-600");
  });

  it("renders FAB button component", () => {
    render(<WhatsAppFloatingButton number="+1 (555) 123-4567" />);

    const fabButton = screen.getByTestId("mock-fab-button");
    expect(fabButton).toBeInTheDocument();
  });

  it("renders with complementary role and support chat aria-label", () => {
    render(<WhatsAppFloatingButton number="+1 (555) 123-4567" />);

    const container = screen.getByRole("complementary", {
      name: /support chat/i,
    });
    expect(container).toBeInTheDocument();
  });

  it("renders an accessible chat dialog and returns focus when closed", async () => {
    render(<WhatsAppFloatingButton number="+1 (555) 123-4567" />);

    const trigger = screen.getByRole("button", {
      name: /chat with us on whatsapp/i,
    });

    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: /need help/i });
    expect(dialog).toHaveAttribute("id", "whatsapp-chat-dialog");
    expect(
      screen.getByRole("textbox", { name: /type your message/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: /need help/i }),
      ).not.toBeInTheDocument();
    });

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });
});
