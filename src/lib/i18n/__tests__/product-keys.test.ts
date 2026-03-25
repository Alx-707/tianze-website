import { describe, expect, it } from "vitest";
import { cellToKey, columnToKey } from "../product-keys";

describe("columnToKey", () => {
  it("converts display column header to camelCase key", () => {
    expect(columnToKey("Wall Thickness")).toBe("wallThickness");
    expect(columnToKey("End Type")).toBe("endType");
    expect(columnToKey("Size")).toBe("size");
    expect(columnToKey("Outer Diameter")).toBe("outerDiameter");
    expect(columnToKey("Bend Radius")).toBe("bendRadius");
  });
});

describe("cellToKey", () => {
  it("converts display cell text to camelCase key", () => {
    expect(cellToKey("Bell End")).toBe("bellEnd");
    expect(cellToKey("Plain End")).toBe("plainEnd");
    expect(cellToKey("Standard Coupling")).toBe("standardCoupling");
    expect(cellToKey("Push-fit")).toBe("pushFit");
    expect(cellToKey("Y-Diverter")).toBe("yDiverter");
    expect(cellToKey("Medium Duty")).toBe("mediumDuty");
  });
});
