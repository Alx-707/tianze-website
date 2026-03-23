import { describe, expect, it } from "vitest";
import {
  EQUIPMENT_SPECS,
  getEquipmentBySlug,
  type EquipmentSpec,
} from "../equipment-specs";

describe("Feature: Equipment Specs", () => {
  it("exports an array with 2 machines", () => {
    expect(EQUIPMENT_SPECS).toHaveLength(2);
  });

  it("includes full-auto bending machine", () => {
    const fullAuto = getEquipmentBySlug("full-auto-bending-machine");
    expect(fullAuto).toBeDefined();
    expect(fullAuto!.params).toHaveProperty("pipeDiameter");
    expect(fullAuto!.params).toHaveProperty("productionSpeed");
  });

  it("includes semi-auto bending machine", () => {
    const semiAuto = getEquipmentBySlug("semi-auto-bending-machine");
    expect(semiAuto).toBeDefined();
    expect(semiAuto!.params).toHaveProperty("pipeDiameter");
    expect(semiAuto!.params).toHaveProperty("productionSpeed");
  });

  it("full-auto has larger diameter range than semi-auto", () => {
    const fullAuto = getEquipmentBySlug("full-auto-bending-machine")!;
    const semiAuto = getEquipmentBySlug("semi-auto-bending-machine")!;
    expect(fullAuto.params.pipeDiameter).toMatch(/160/);
    expect(semiAuto.params.pipeDiameter).toMatch(/110/);
  });

  it("each machine has highlights", () => {
    for (const machine of EQUIPMENT_SPECS) {
      expect(machine.highlights.length).toBeGreaterThan(0);
    }
  });

  it("satisfies EquipmentSpec interface", () => {
    const machine: EquipmentSpec = EQUIPMENT_SPECS[0]!;
    expect(machine.slug).toBeDefined();
    expect(machine.name).toBeDefined();
    expect(machine.params).toBeDefined();
    expect(machine.highlights).toBeDefined();
  });
});
