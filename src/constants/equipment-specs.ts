export interface EquipmentSpec {
  slug: string;
  name: string;
  /** Key-value specification pairs */
  params: Record<string, string>;
  /** Key selling points (raw English strings) */
  highlights: string[];
  /** Placeholder image path */
  image: string;
}

export const EQUIPMENT_SPECS = [
  {
    slug: "full-auto-bending-machine",
    name: "Full-Automatic PVC Pipe Bending Machine",
    params: {
      pipeDiameter: "DN25-DN160mm",
      bendingAngles: "15°-180° (Programmable)",
      heatingZones: "4-8 zones",
      powerSupply: "380V/50Hz 3-Phase",
      productionSpeed: "150-200 pcs/hour",
      machineWeight: "~1200kg",
      controlSystem: "PLC + HMI Touch Screen",
    },
    highlights: [
      "CNC Control System",
      "Automatic Feeding",
      "Multi-Station Design",
      "Remote Diagnostics",
    ],
    image: "/images/products/placeholder-conduit.svg",
  },
  {
    slug: "semi-auto-bending-machine",
    name: "Semi-Automatic PVC Pipe Bending Machine",
    params: {
      pipeDiameter: "DN20-DN110mm",
      bendingAngles: "45°, 90°, Custom",
      heatingMethod: "Infrared / Electric",
      powerSupply: "380V/50Hz 3-Phase",
      productionSpeed: "60-80 pcs/hour",
      machineWeight: "~500kg",
    },
    highlights: [
      "Precision Temperature Control",
      "Adjustable Bending Angles",
      "Quick-Swap Mold System",
      "Safety Features",
    ],
    image: "/images/products/placeholder-conduit.svg",
  },
] satisfies readonly EquipmentSpec[];

export function getEquipmentBySlug(slug: string): EquipmentSpec | undefined {
  return EQUIPMENT_SPECS.find((e) => e.slug === slug);
}
