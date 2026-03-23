import Image from "next/image";
import { Link } from "@/i18n/routing";
import type { MarketDefinition } from "@/constants/product-catalog";

interface MarketSeriesCardProps {
  market: MarketDefinition;
  familyCount: number;
}

export function MarketSeriesCard({
  market,
  familyCount,
}: MarketSeriesCardProps) {
  return (
    <Link
      href={{ pathname: "/products/[market]", params: { market: market.slug } }}
      className="group block rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative mb-4 aspect-[16/9] w-full overflow-hidden rounded-md bg-muted">
        <Image
          src="/images/products/placeholder-conduit.svg"
          alt={market.label}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <span className="mb-2 inline-block rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
        {market.standardLabel}
      </span>
      <h2 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary">
        {market.label}
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">{market.description}</p>
      <span className="text-sm text-muted-foreground">
        {familyCount} product families
      </span>
    </Link>
  );
}
