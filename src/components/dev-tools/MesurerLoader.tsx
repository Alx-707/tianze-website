"use client";

import { useSearchParams } from "next/navigation";
import { type ComponentType, useEffect, useState } from "react";

type MeasurerProps = {
  guideColor?: string;
  highlightColor?: string;
  hoverHighlightEnabled?: boolean;
  persistOnReload?: boolean;
};

export function MesurerLoader() {
  const searchParams = useSearchParams();
  const [Measurer, setMeasurer] = useState<ComponentType<MeasurerProps> | null>(
    null,
  );
  const shouldEnableMesurer = searchParams.get("mesurer") === "1";

  useEffect(() => {
    let active = true;

    if (!shouldEnableMesurer) {
      setMeasurer(null);
    } else {
      void import("mesurer")
        .then((mod) => {
          if (active) {
            setMeasurer(() => mod.Measurer);
          }
        })
        .catch((err) => {
          console.error("Failed to load mesurer:", err);
        });
    }

    return () => {
      active = false;
    };
  }, [shouldEnableMesurer]);

  if (!shouldEnableMesurer || !Measurer) {
    return null;
  }

  return <Measurer persistOnReload />;
}
