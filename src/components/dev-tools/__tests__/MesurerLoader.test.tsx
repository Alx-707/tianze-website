import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MesurerLoader } from "../MesurerLoader";

const mockGet = vi.fn<(key: string) => string | null>();

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: mockGet,
  }),
}));

vi.mock("mesurer", () => ({
  Measurer: ({ persistOnReload }: { persistOnReload?: boolean }) => (
    <div data-testid="mesurer" data-persist={String(persistOnReload)}>
      Mesurer Mock
    </div>
  ),
}));

describe("MesurerLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGet.mockReturnValue(null);
  });

  it("does not render when mesurer query is disabled", () => {
    render(<MesurerLoader />);

    expect(screen.queryByTestId("mesurer")).not.toBeInTheDocument();
  });

  it("loads and renders mesurer when mesurer=1", async () => {
    mockGet.mockImplementation((key: string) =>
      key === "mesurer" ? "1" : null,
    );

    render(<MesurerLoader />);

    await waitFor(() => {
      expect(screen.getByTestId("mesurer")).toBeInTheDocument();
    });
    expect(screen.getByTestId("mesurer")).toHaveAttribute(
      "data-persist",
      "true",
    );
  });
});
