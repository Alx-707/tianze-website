# Phase A Structural Migration — Behavioral Specifications

> Source: `docs/strategy/ring4-implementation-handoff.md` (Phase A)
> Status: Ready for writing-plans
> Date: 2026-03-30

---

## Feature 1: Products Hub — Three Business Line Entry

As a B2B buyer evaluating suppliers,
I want the products page to clearly show all business lines,
So that I can quickly navigate to the product category I need.

### Scenario 1.1: Buyer discovers three business lines from products hub

```gherkin
Given a buyer visits the products page
When the page loads
Then the buyer sees entry points for Pipes, Equipment, and Custom Manufacturing
And each entry point links to its respective overview page
```

### Scenario 1.2: Buyer navigates from products hub to pipes overview

```gherkin
Given a buyer is on the products page
When the buyer selects the Pipes business line
Then the buyer arrives at the pipes overview page
And the URL path includes "/products/pipes"
```

### Scenario 1.3: Buyer navigates from products hub to equipment overview

```gherkin
Given a buyer is on the products page
When the buyer selects the Equipment business line
Then the buyer arrives at the equipment overview page
And the URL path includes "/products/equipment"
```

### Scenario 1.4: Buyer navigates from products hub to custom manufacturing

```gherkin
Given a buyer is on the products page
When the buyer selects the Custom Manufacturing business line
Then the buyer arrives at the custom manufacturing page
And the URL path includes "/products/custom-manufacturing"
```

### Scenario 1.5: Products hub works in both locales

```gherkin
Given a buyer visits the products page in Chinese locale
When the page loads
Then the buyer sees the same three business line entry points
And the page content is in Chinese
```

---

## Feature 2: Pipes Overview Page

As a B2B buyer looking for PVC conduit or PETG pneumatic tubes,
I want an overview page showing all pipe product categories,
So that I can find the right product line for my market.

### Scenario 2.1: Buyer sees market-specific pipe categories

```gherkin
Given a buyer visits the pipes overview page
When the page loads
Then the buyer sees market-specific PVC conduit categories
And the buyer sees the PETG pneumatic tubes category
And each category links to its detail page
```

### Scenario 2.2: Buyer navigates to a market page from pipes overview

```gherkin
Given a buyer is on the pipes overview page
When the buyer selects the North America market
Then the buyer arrives at the North America market page
And the URL path includes "/products/pipes/north-america"
```

### Scenario 2.3: Buyer navigates to PETG pneumatic tubes

```gherkin
Given a buyer is on the pipes overview page
When the buyer selects PETG pneumatic tubes
Then the buyer arrives at the pneumatic tubes page
And the URL path includes "/products/pipes/pneumatic-tubes"
```

---

## Feature 3: Equipment Overview Page

As a B2B buyer interested in bending machines,
I want an equipment overview that frames machines as purchasable products,
So that I understand these are products I can buy, not just factory capabilities.

### Scenario 3.1: Buyer sees equipment as purchasable products

```gherkin
Given a buyer visits the equipment overview page
When the page loads
Then the buyer sees bending machines presented as products for sale
And there is a clear path to request equipment information
```

### Scenario 3.2: Buyer navigates to bending machines detail

```gherkin
Given a buyer is on the equipment overview page
When the buyer selects bending machines
Then the buyer arrives at the bending machines detail page
And the URL path includes "/products/equipment/bending-machines"
```

---

## Feature 4: Route Migration — 301 Redirects

As a buyer with a bookmarked or search-indexed old URL,
I want old links to automatically take me to the correct new page,
So that I never see a broken page.

### Scenario 4.1: Old market page URLs redirect to pipes

```gherkin
Given a buyer has a bookmarked URL "/en/products/north-america"
When the buyer visits that URL
Then the buyer is permanently redirected to "/en/products/pipes/north-america"
And the redirect uses HTTP 301 status
```

### Scenario 4.2: Old pneumatic tubes URL redirects

```gherkin
Given a buyer visits "/en/products/pneumatic-tube-systems"
When the request is processed
Then the buyer is permanently redirected to "/en/products/pipes/pneumatic-tubes"
And the redirect uses HTTP 301 status
```

### Scenario 4.3: Old bending machines URL redirects

```gherkin
Given a buyer visits "/en/capabilities/bending-machines"
When the request is processed
Then the buyer is permanently redirected to "/en/products/equipment/bending-machines"
And the redirect uses HTTP 301 status
```

### Scenario 4.4: Old OEM page URL redirects

```gherkin
Given a buyer visits "/en/oem-custom-manufacturing"
When the request is processed
Then the buyer is permanently redirected to "/en/products/custom-manufacturing"
And the redirect uses HTTP 301 status
```

### Scenario 4.5: Redirects work for both locales

```gherkin
Given a buyer visits "/zh/products/north-america"
When the request is processed
Then the buyer is permanently redirected to "/zh/products/pipes/north-america"
```

### Scenario 4.6: Redirect preserves query parameters

```gherkin
Given a buyer visits an old URL with query parameters
When the request is processed
Then the buyer is redirected to the new URL with query parameters preserved
```

---

## Feature 5: Navigation Update

As a buyer browsing the site,
I want the navigation to show the new product structure,
So that I can reach any product page from anywhere on the site.

### Scenario 5.1: Desktop navigation shows three-line product structure

```gherkin
Given a buyer is on any page of the site
When the buyer opens the products navigation
Then the buyer sees links to Pipes, Equipment, and Custom Manufacturing
And no links point to legacy paths (capabilities, oem-custom-manufacturing)
```

### Scenario 5.2: Mobile navigation shows three-line product structure

```gherkin
Given a buyer is using a mobile device on any page
When the buyer opens the mobile navigation menu
Then the buyer sees the same three business line links as desktop
```

### Scenario 5.3: No navigation link points to a legacy path

```gherkin
Given the site navigation is rendered
When all navigation links are checked
Then no link href contains "/capabilities/" or "/oem-custom-manufacturing"
And no link href matches the pattern "/products/[market]" without "/pipes/" segment
```

---

## Feature 6: Sitemap and SEO Alignment

As a search engine crawler,
I want the sitemap to reflect the new URL structure,
So that new pages are indexed and old pages are properly dereferenced.

### Scenario 6.1: Sitemap includes all new routes

```gherkin
Given the sitemap is generated
When the sitemap XML is inspected
Then it includes URLs for "/products/pipes/"
And it includes URLs for "/products/equipment/"
And it includes URLs for "/products/custom-manufacturing/"
And it includes URLs for each market under "/products/pipes/[market]"
And it includes URLs for "/products/equipment/bending-machines/"
```

### Scenario 6.2: Sitemap excludes old routes

```gherkin
Given the sitemap is generated
When the sitemap XML is inspected
Then it does not include "/products/north-america" (without /pipes/ segment)
And it does not include "/capabilities/bending-machines"
And it does not include "/oem-custom-manufacturing"
```

### Scenario 6.3: Sitemap includes locale alternates

```gherkin
Given the sitemap is generated
When any new product page entry is inspected
Then it includes hreflang alternates for both "en" and "zh" locales
```

---

## Feature 7: Internal Link Integrity

As a buyer navigating between pages,
I want all internal links to use new paths,
So that I never encounter redirect chains or broken links.

### Scenario 7.1: Homepage product links use new paths

```gherkin
Given a buyer is on the homepage
When the buyer sees product-related links
Then all product links use the new path structure
And no links point to legacy paths
```

### Scenario 7.2: Cross-page links use new paths

```gherkin
Given a buyer is on any product detail page
When the buyer sees links to other product pages
Then all links use the new path structure
```

---

## Acceptance Criteria (Non-Functional)

### Route Configuration

- [ ] `paths-config.ts` defines all new routes with correct path patterns
- [ ] `types.ts` includes new page types (pipes, equipment, customManufacturing)
- [ ] Dynamic route pattern updated from `/products/[market]` to `/products/pipes/[market]`
- [ ] `generateStaticParams` produces correct params for all new routes

### Performance

- [ ] Redirects respond within 50ms (middleware-level, no page render)
- [ ] New pages pass existing Lighthouse thresholds

### Backward Compatibility

- [ ] All 4 legacy redirect paths tested in both locales (8 total redirect scenarios)
- [ ] Google Search Console coverage can be monitored after deploy
- [ ] No 404 errors for any previously indexed URL

---

## Scenario-to-Task Mapping (for writing-plans)

| Scenario | Red Task (failing test) | Green Task (implementation) |
|----------|------------------------|-----------------------------|
| 1.1-1.5 | Test products hub renders 3 lines | Rebuild products hub page |
| 2.1-2.3 | Test pipes overview page and navigation | Create pipes overview page + route |
| 3.1-3.2 | Test equipment overview page | Create equipment overview page + route |
| 4.1-4.6 | Test all 301 redirects (8 locale variants) | Implement redirect rules |
| 5.1-5.3 | Test navigation links point to new paths | Update navigation components |
| 6.1-6.3 | Test sitemap generation | Update sitemap.ts |
| 7.1-7.2 | Test internal link integrity | Update all internal links |
