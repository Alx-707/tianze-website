import { describe, expect, it } from "vitest";

import {
  getGapClass,
  getLgColumnClass,
  getMdColumnClass,
  getSmColumnClass,
} from "../grid-utils";

describe("grid-utils", () => {
  describe("getSmColumnClass", () => {
    it("returns sm:grid-cols-1 for 1", () => {
      expect(getSmColumnClass(1)).toBe("sm:grid-cols-1");
    });

    it("returns sm:grid-cols-2 for 2", () => {
      expect(getSmColumnClass(2)).toBe("sm:grid-cols-2");
    });
  });

  describe("getMdColumnClass", () => {
    it("returns md:grid-cols-2 for 2", () => {
      expect(getMdColumnClass(2)).toBe("md:grid-cols-2");
    });

    it("returns md:grid-cols-3 for 3", () => {
      expect(getMdColumnClass(3)).toBe("md:grid-cols-3");
    });
  });

  describe("getLgColumnClass", () => {
    it("returns lg:grid-cols-3 for 3", () => {
      expect(getLgColumnClass(3)).toBe("lg:grid-cols-3");
    });

    it("returns lg:grid-cols-4 for 4", () => {
      expect(getLgColumnClass(4)).toBe("lg:grid-cols-4");
    });
  });

  describe("getGapClass", () => {
    it("returns gap-4 for 4", () => {
      expect(getGapClass(4)).toBe("gap-4");
    });

    it("returns gap-6 for 6", () => {
      expect(getGapClass(6)).toBe("gap-6");
    });

    it("returns gap-8 for 8", () => {
      expect(getGapClass(8)).toBe("gap-8");
    });
  });
});
