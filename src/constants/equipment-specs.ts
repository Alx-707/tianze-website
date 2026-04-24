import type { Locale } from "@/types/content.types";

export interface EquipmentSpec {
  slug: string;
  name: string;
  /** Key-value specification pairs */
  params: Record<string, string>;
  /** Locale-aware key selling points. */
  highlights: Record<Locale, string[]>;
  /** Product/equipment image path */
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
    highlights: {
      en: [
        "CNC Control System",
        "Automatic Feeding",
        "Multi-Station Design",
        "Remote Diagnostics",
      ],
      zh: ["CNC 控制系统", "自动送料", "多工位设计", "远程诊断"],
    },
    image: "/images/products/full-auto-bending-machine.svg",
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
    highlights: {
      en: [
        "Precision Temperature Control",
        "Adjustable Bending Angles",
        "Quick-Swap Mold System",
        "Safety Features",
      ],
      zh: ["精密温控", "可调弯管角度", "快换模具系统", "安全防护功能"],
    },
    image: "/images/products/semi-auto-bending-machine.svg",
  },
] satisfies readonly EquipmentSpec[];

export function getEquipmentBySlug(slug: string): EquipmentSpec | undefined {
  return EQUIPMENT_SPECS.find((e) => e.slug === slug);
}
