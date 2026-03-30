#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, "reports", "translation-compat");

const PROTECTED_SURFACE_RULES = [
  {
    file: "src/app/[locale]/contact/page.tsx",
    markers: ["contact-page-content", "notranslate", 'translate="no"'],
  },
  {
    file: "src/app/[locale]/products/[market]/page.tsx",
    markers: ["market-page-content", "notranslate", 'translate="no"'],
  },
  {
    file: "src/components/language-toggle.tsx",
    markers: [
      "language-current-label",
      "language-option-label-en",
      "language-option-label-zh",
      'translate="no"',
    ],
  },
  {
    file: "src/components/layout/mobile-navigation.tsx",
    markers: [
      "mobile-language-switcher",
      "mobile-language-switcher-label",
      'translate="no"',
    ],
  },
  {
    file: "src/components/products/inquiry-drawer.tsx",
    markers: [
      "inquiry-drawer-product-header",
      "inquiry-drawer-product-title",
      "inquiry-drawer-product-sku",
      'translate="no"',
    ],
  },
  {
    file: "src/components/forms/contact-form-container.tsx",
    markers: [
      "contact-form-status-message",
      "contact-form-error-display",
      "contact-form-submit-label",
      'translate="no"',
    ],
  },
  {
    file: "src/components/products/product-inquiry-form.tsx",
    markers: [
      "product-inquiry-success-message",
      "product-inquiry-error-message",
      "product-inquiry-submit-label",
      'translate="no"',
    ],
  },
  {
    file: "src/components/blog/blog-newsletter.tsx",
    markers: [
      "blog-newsletter-success-message",
      "blog-newsletter-error-message",
      "blog-newsletter-submit-label",
      'translate="no"',
    ],
  },
  {
    file: "src/components/layout/header.tsx",
    markers: [
      "header-desktop-nav",
      "header-nav-label-",
      "header-contact-sales-label",
      'translate="no"',
    ],
  },
  {
    file: "src/components/layout/header-client.tsx",
    markers: ["header-mobile-menu-label", 'translate="no"'],
  },
  {
    file: "src/components/layout/vercel-navigation.tsx",
    markers: [
      "vercel-navigation-root",
      "vercel-navigation-trigger-label-",
      "vercel-navigation-link-label-",
      'translate="no"',
    ],
  },
  {
    file: "src/components/blocks/tech/tech-tabs-block.tsx",
    markers: [
      "tech-tabs-list",
      "tech-tab-label-",
      "tech-card-title-",
      "tech-card-version-",
      "tech-card-link-label-",
      'translate="no"',
    ],
  },
  {
    file: "src/components/sections/faq-accordion.tsx",
    markers: ["faq-accordion", "faq-question-"],
  },
  {
    file: "src/components/sections/final-cta.tsx",
    markers: [
      "final-cta-primary-label",
      "final-cta-secondary-label",
      'translate="no"',
    ],
  },
  {
    file: "src/components/sections/sample-cta.tsx",
    markers: ["sample-cta-label", 'translate="no"'],
  },
];

const RISK_SCAN_FILES = PROTECTED_SURFACE_RULES.map((rule) => rule.file).filter(
  (file) => file.endsWith(".tsx") && !file.startsWith("src/app/"),
);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function warnFileRead(repoPath, err) {
  const message = err instanceof Error ? err.message : String(err);
  console.warn(`translate-compat: failed to read ${repoPath}: ${message}`);
}

function readFile(repoPath) {
  try {
    return fs.readFileSync(path.join(ROOT, repoPath), "utf8");
  } catch (err) {
    warnFileRead(repoPath, err);
    return null;
  }
}

function isStringish(node) {
  if (!node) return false;

  if (node.type === "StringLiteral") return true;

  if (node.type === "TemplateLiteral") {
    return node.expressions.length === 0;
  }

  return false;
}

function isTextCarrier(node) {
  if (!node) return false;

  if (isStringish(node)) return true;

  return (
    node.type === "Identifier" ||
    node.type === "MemberExpression" ||
    node.type === "OptionalMemberExpression"
  );
}

function isNullable(node) {
  return (
    node?.type === "NullLiteral" ||
    (node?.type === "Identifier" && node.name === "undefined")
  );
}

function isDirectJsxChild(pathRef) {
  return (
    pathRef.parentPath?.isJSXExpressionContainer() &&
    (pathRef.parentPath.parentPath?.isJSXElement() ||
      pathRef.parentPath.parentPath?.isJSXFragment())
  );
}

function hasLiteralAttribute(openingElement, name, value) {
  return openingElement.attributes.some((attribute) => {
    if (
      attribute.type !== "JSXAttribute" ||
      attribute.name?.type !== "JSXIdentifier" ||
      attribute.name.name !== name
    ) {
      return false;
    }

    if (attribute.value?.type === "StringLiteral") {
      return attribute.value.value === value;
    }

    if (attribute.value?.type === "JSXExpressionContainer") {
      return (
        attribute.value.expression?.type === "StringLiteral" &&
        attribute.value.expression.value === value
      );
    }

    return false;
  });
}

function hasNotranslateClass(openingElement) {
  return openingElement.attributes.some((attribute) => {
    if (
      attribute.type !== "JSXAttribute" ||
      attribute.name?.type !== "JSXIdentifier" ||
      attribute.name.name !== "className"
    ) {
      return false;
    }

    if (attribute.value?.type === "StringLiteral") {
      return attribute.value.value.includes("notranslate");
    }

    return false;
  });
}

function hasProtectedAncestor(pathRef) {
  let current = pathRef.parentPath;

  while (current) {
    if (current.isJSXElement()) {
      const openingElement = current.node.openingElement;
      if (
        hasLiteralAttribute(openingElement, "translate", "no") ||
        hasNotranslateClass(openingElement)
      ) {
        return true;
      }
    }

    current = current.parentPath;
  }

  return false;
}

function scanForRiskPatterns(repoPath) {
  const source = readFile(repoPath);
  if (source === null) {
    return [
      {
        file: repoPath,
        line: null,
        kind: "unreadable-file",
        message:
          "Protected surface file could not be read, so risk pattern scanning was skipped.",
      },
    ];
  }

  const ast = parser.parse(source, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  const findings = [];

  traverse(ast, {
    LogicalExpression(logicalPath) {
      if (
        logicalPath.node.operator === "&&" &&
        isTextCarrier(logicalPath.node.right) &&
        isDirectJsxChild(logicalPath) &&
        !hasProtectedAncestor(logicalPath)
      ) {
        findings.push({
          file: repoPath,
          line: logicalPath.node.loc?.start.line ?? null,
          kind: "logical-direct-string",
          message:
            "Direct JSX conditional string render found. Wrap status text in a stable element instead of rendering a bare string branch.",
        });
      }
    },
    ConditionalExpression(condPath) {
      if (!isDirectJsxChild(condPath) || hasProtectedAncestor(condPath)) {
        return;
      }

      const { consequent, alternate } = condPath.node;
      const hasRiskyBranch =
        (isTextCarrier(consequent) &&
          (isTextCarrier(alternate) || isNullable(alternate))) ||
        (isTextCarrier(alternate) &&
          (isTextCarrier(consequent) || isNullable(consequent)));

      if (hasRiskyBranch) {
        findings.push({
          file: repoPath,
          line: condPath.node.loc?.start.line ?? null,
          kind: "ternary-direct-string",
          message:
            "Direct JSX ternary string render found. Keep state text inside a stable wrapper instead of swapping bare strings.",
        });
      }
    },
  });

  return findings;
}

function collectMissingMarkers() {
  const missing = [];

  for (const rule of PROTECTED_SURFACE_RULES) {
    const source = readFile(rule.file);
    if (source === null) {
      missing.push({
        file: rule.file,
        marker: "(file unreadable)",
        message:
          "Protected surface file is missing or unreadable, so marker checks could not be completed.",
      });
      continue;
    }

    for (const marker of rule.markers) {
      if (!source.includes(marker)) {
        missing.push({
          file: rule.file,
          marker,
          message:
            "Protected translation compatibility marker is missing from a guarded surface.",
        });
      }
    }
  }

  return missing;
}

function writeReports(result) {
  ensureDir(REPORT_DIR);
  const timestamp = Date.now();
  const jsonPath = path.join(REPORT_DIR, `translate-compat-${timestamp}.json`);
  const mdPath = path.join(REPORT_DIR, `translate-compat-${timestamp}.md`);
  const latestJson = path.join(REPORT_DIR, "translate-compat-latest.json");
  const latestMd = path.join(REPORT_DIR, "translate-compat-latest.md");

  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`);

  const lines = [
    "# Translate Compatibility Check",
    "",
    `- Generated at: ${result.generatedAt}`,
    `- Status: ${result.status}`,
    `- Missing markers: ${result.missingMarkers.length}`,
    `- Risk findings: ${result.riskFindings.length}`,
    "",
    "## Missing Markers",
    "",
    ...(result.missingMarkers.length === 0
      ? ["- none"]
      : result.missingMarkers.map(
          (item) => `- ${item.file}: missing marker \`${item.marker}\``,
        )),
    "",
    "## Risk Findings",
    "",
    ...(result.riskFindings.length === 0
      ? ["- none"]
      : result.riskFindings.map(
          (item) =>
            `- ${item.file}:${item.line ?? "?"} [${item.kind}] ${item.message}`,
        )),
    "",
  ];

  fs.writeFileSync(mdPath, `${lines.join("\n")}\n`);
  fs.copyFileSync(jsonPath, latestJson);
  fs.copyFileSync(mdPath, latestMd);
}

function main() {
  const missingMarkers = collectMissingMarkers();
  const riskFindings = RISK_SCAN_FILES.flatMap((file) =>
    scanForRiskPatterns(file),
  );

  const result = {
    generatedAt: new Date().toISOString(),
    status:
      missingMarkers.length === 0 && riskFindings.length === 0
        ? "passed"
        : "failed",
    missingMarkers,
    riskFindings,
  };

  writeReports(result);

  if (result.status === "passed") {
    console.log("translate-compat: passed");
    process.exit(0);
  }

  console.error("translate-compat: failed");

  for (const item of missingMarkers) {
    console.error(`- [missing-marker] ${item.file}: ${item.marker}`);
  }

  for (const item of riskFindings) {
    console.error(
      `- [${item.kind}] ${item.file}:${item.line ?? "?"}: ${item.message}`,
    );
  }

  process.exit(1);
}

main();
