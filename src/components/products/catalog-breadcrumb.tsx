import { Link, routing } from "@/i18n/routing";
import { SITE_CONFIG } from "@/config/paths";
import type {
  MarketDefinition,
  ProductFamilyDefinition,
} from "@/constants/product-catalog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type CatalogBreadcrumbProps =
  | { market?: undefined; family?: undefined }
  | { market: MarketDefinition; family?: undefined }
  | { market: MarketDefinition; family: ProductFamilyDefinition };

interface BreadcrumbEntry {
  name: string;
  url: string;
}

function buildJsonLd(items: BreadcrumbEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** Escape JSON string for safe embedding in <script> tags */
function safeJsonLd(data: ReturnType<typeof buildJsonLd>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function CatalogBreadcrumb({ market, family }: CatalogBreadcrumbProps) {
  const { baseUrl } = SITE_CONFIG;

  // JSON-LD URLs use default locale for canonical representation
  const canonicalBase = `${baseUrl}/${routing.defaultLocale}`;

  const entries: BreadcrumbEntry[] = [
    { name: "Home", url: canonicalBase },
    { name: "Products", url: `${canonicalBase}/products` },
  ];

  if (market) {
    entries.push({
      name: market.label,
      url: `${canonicalBase}/products/${market.slug}`,
    });
  }

  if (family) {
    entries.push({
      name: family.label,
      url: `${canonicalBase}/products/${market.slug}/${family.slug}`,
    });
  }

  return (
    <>
      <Breadcrumb>
        <BreadcrumbList>
          {/* Home */}
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />

          {/* Products */}
          <BreadcrumbItem>
            {market ? (
              <BreadcrumbLink asChild>
                <Link href="/products">Products</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Products</BreadcrumbPage>
            )}
          </BreadcrumbItem>

          {/* Market */}
          {market && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {family ? (
                  <BreadcrumbLink asChild>
                    <Link
                      href={{
                        pathname: "/products/[market]",
                        params: { market: market.slug },
                      }}
                    >
                      {market.label}
                    </Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{market.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </>
          )}

          {/* Family */}
          {family && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{family.label}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(buildJsonLd(entries)),
        }}
      />
    </>
  );
}
