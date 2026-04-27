import { describe, expect, it } from "vitest";
import { createJsonLdGraphData } from "@/components/seo/json-ld-script";
import { generateJSONLD } from "@/lib/structured-data";

function graphTypes(graphData: unknown) {
  if (
    typeof graphData !== "object" ||
    graphData === null ||
    !("@graph" in graphData)
  ) {
    return [];
  }

  const graph = (graphData as { "@graph": unknown })["@graph"];
  if (!Array.isArray(graph)) {
    return [];
  }

  return graph
    .map((node) =>
      typeof node === "object" && node !== null && "@type" in node
        ? (node as { "@type": unknown })["@type"]
        : undefined,
    )
    .filter((type): type is string => typeof type === "string");
}

describe("createJsonLdGraphData", () => {
  it("keeps page-level schema node types in the merged graph", () => {
    const graphData = createJsonLdGraphData([
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Tianze",
      },
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Tianze Website",
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [],
      },
    ]);

    expect(graphData["@context"]).toBe("https://schema.org");
    expect(graphTypes(graphData)).toEqual([
      "Organization",
      "WebSite",
      "FAQPage",
    ]);
  });

  it("flattens nested graph inputs instead of nesting @graph nodes", () => {
    const graphData = createJsonLdGraphData([
      {
        "@context": "https://schema.org",
        "@graph": [
          { "@type": "BreadcrumbList", itemListElement: [] },
          { "@type": "ProductGroup", name: "PVC conduit fittings" },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [],
      },
    ]);

    expect(graphTypes(graphData)).toEqual([
      "BreadcrumbList",
      "ProductGroup",
      "FAQPage",
    ]);
    expect(
      (graphData["@graph"] as Array<Record<string, unknown>>).some(
        (node) => "@graph" in node,
      ),
    ).toBe(false);
  });

  it("uses shared JSON-LD escaping for script-injection text", () => {
    const graphData = createJsonLdGraphData([
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: '</script><script>alert("xss")</script>',
          },
        ],
      },
    ]);

    const scriptContent = generateJSONLD(graphData);

    expect(scriptContent).not.toContain("</script>");
    expect(scriptContent).not.toContain("<script>");
    expect(scriptContent).toContain("\\u003c/script\\u003e");
    expect(() => JSON.parse(scriptContent)).not.toThrow();
  });
});
