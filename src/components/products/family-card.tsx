import { Link } from "@/i18n/routing";
import type { ProductFamilyDefinition } from "@/constants/product-catalog";

interface FamilyCardProps {
  family: ProductFamilyDefinition;
  marketSlug: string;
}

export function FamilyCard({ family, marketSlug }: FamilyCardProps) {
  return (
    <Link
      href={{
        pathname: "/products/[market]/[family]",
        params: { market: marketSlug, family: family.slug },
      }}
      className="group block rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <h2 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary">
        {family.label}
      </h2>
      <p className="text-sm text-muted-foreground">{family.description}</p>
    </Link>
  );
}
