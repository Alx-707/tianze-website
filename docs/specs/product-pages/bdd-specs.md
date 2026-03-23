# Product Pages Redesign — Behavioral Specifications

> Design doc: `docs/superpowers/specs/2026-03-23-product-pages-design.md`
> Date: 2026-03-23

---

## Feature 1: Market Page — Spec-Driven Product Catalog

  As a B2B buyer (distributor/importer)
  I want to see all product families and their specifications on one market page
  So that I can verify the manufacturer carries the exact sizes I need and decide whether to inquire

### Scenario 1.1: Buyer navigates to a market page

    Given I am on the product overview page
    When I select the "UL / ASTM Series" market
    Then I see a page titled "UL / ASTM Series"
    And I see the standard label "UL 651 / ASTM D1785"
    And I see a description of the North American conduit market

### Scenario 1.2: Buyer sees all product families on one page

    Given I am on the North America market page
    Then I see sections for "Conduit Sweeps & Elbows", "Couplings", and "Conduit Pipes"
    And each section has a product image area, a brief overview, and a specification table

### Scenario 1.3: Buyer jumps between product families using sticky navigation

    Given I am on the North America market page
    And I have scrolled past the page header
    Then I see a sticky navigation bar with links to each product family
    When I select "Couplings" from the sticky navigation
    Then the page scrolls to the Couplings section

### Scenario 1.4: Buyer reads specification matrix for a product family

    Given I am viewing the "Conduit Sweeps & Elbows" section
    Then I see a specification table grouped by Schedule (40, 80)
    And each row shows Size, Angle, Wall Thickness, End Type, and Radius
    And the values use inch measurements (North America standard)

### Scenario 1.5: Buyer views product images (placeholder phase)

    Given I am viewing a product family section
    Then I see a product image area with a placeholder illustration
    And the image area is laid out beside the product overview on desktop
    And the image area stacks above the overview on mobile

### Scenario 1.6: Buyer sees shared trust signals for the market

    Given I am on the North America market page
    When I scroll past all product family sections
    Then I see technical properties (material, surface, protection, temperature range)
    And I see certification badges (UL 651, ASTM D1785, ISO 9001:2015)
    And I see trade information (MOQ, lead time, supply capacity, port, packaging)

### Scenario 1.7: Buyer reaches inquiry CTA naturally

    Given I am on the North America market page
    When I scroll to the bottom
    Then I see a non-aggressive call-to-action suggesting to request a quote
    And the CTA links to the contact page

### Scenario 1.8: Buyer views market page on mobile

    Given I am on the North America market page on a mobile device
    Then product family sections stack vertically (image above text)
    And specification tables are horizontally scrollable
    And the sticky family navigation remains accessible

### Scenario 1.9: Breadcrumb reflects two-level hierarchy

    Given I am on the North America market page
    Then the breadcrumb shows "Products > UL / ASTM Series"
    And "Products" links back to the product overview page

### Scenario 1.10: Invalid market slug returns not found

    Given I navigate to a product market URL with an invalid slug
    Then I see a not-found page

---

## Feature 2: Product Overview Page — Market Selection

  As a B2B buyer
  I want to see all available product lines organized by market standard
  So that I can quickly find products matching my regional compliance requirements

### Scenario 2.1: Buyer sees PVC conduit fittings by market standard

    Given I am on the product overview page
    Then I see a "By Market Standard" section
    And it contains cards for UL/ASTM, AS/NZS, NOM, and IEC series
    And each card shows a placeholder image, standard tag, market label, description, and family count

### Scenario 2.2: Buyer sees specialty and equipment products

    Given I am on the product overview page
    Then I see a "Specialty & Equipment" section
    And it contains cards for "PETG Pneumatic Tubes" and "Bending Machines"

### Scenario 2.3: Buyer navigates to a market from overview

    Given I am on the product overview page
    When I select the "UL / ASTM Series" card
    Then I am taken to the North America market page

### Scenario 2.4: Equipment card links to placeholder

    Given I am on the product overview page
    When I select the "Bending Machines" card
    Then I am taken to the contact page (placeholder until capabilities page exists)

### Scenario 2.5: Breadcrumb shows root level

    Given I am on the product overview page
    Then the breadcrumb shows "Products" as the current page (no link)

---

## Feature 3: Homepage Product Section — Updated Content

  As a visitor on the homepage
  I want to see an overview of the manufacturer's product lines
  So that I understand what they offer and can navigate to relevant products

### Scenario 3.1: Homepage shows four product category cards

    Given I am on the homepage
    When I scroll to the products section
    Then I see four cards: "PVC Conduit Fittings", "PETG Pneumatic Tubes", "Bending Machines", and "OEM & Custom Mfg"

### Scenario 3.2: PVC Conduit Fittings card reflects market-standard classification

    Given I am viewing the homepage products section
    Then the PVC Conduit Fittings card mentions multiple market standards (UL/ASTM, AS/NZS, etc.)
    And it links to the product overview page

### Scenario 3.3: Each card links to the correct destination

    Given I am viewing the homepage products section
    Then PVC Conduit Fittings links to /products
    And PETG Pneumatic Tubes links to /products/pneumatic-tube-systems
    And Bending Machines links to /contact (placeholder)
    And OEM & Custom Mfg links to /contact

### Scenario 3.4: Section header has a "View All Products" action

    Given I am viewing the homepage products section
    Then I see a "View All Products" button that links to /products

---

## Feature 4: Route Cleanup — Remove Family Sub-pages

  As a site maintainer
  I want the family-level route removed
  So that the URL structure matches the two-level catalog hierarchy

### Scenario 4.1: Family URLs no longer exist

    Given the family-level route has been removed
    When I navigate to /products/north-america/conduit-sweeps-elbows
    Then I see a not-found page

### Scenario 4.2: Product catalog data still defines families

    Given the family-level route has been removed
    Then the product catalog configuration still lists families per market
    And the market page uses this data to render family sections

---

## Feature 5: Internationalization

  As a buyer viewing the site in Chinese
  I want all page framework text to be translated
  So that I can understand the product offering in my language

### Scenario 5.1: Market page displays translated framework text

    Given I am viewing the North America market page in Chinese
    Then page titles, descriptions, section headers, and button labels are in Chinese
    And specification data values (1/2", 90°, etc.) remain unchanged
    And certification names (UL 651, ASTM D1785) remain unchanged

### Scenario 5.2: Product overview page displays translated text

    Given I am viewing the product overview page in Chinese
    Then market card labels, descriptions, and section headings are in Chinese

### Scenario 5.3: Homepage product section displays translated text

    Given I am viewing the homepage in Chinese
    Then the products section card titles, descriptions, and CTA are in Chinese

---

## Feature 6: Specification Data Architecture

  As a developer maintaining the product catalog
  I want spec data stored in typed constants with clear structure
  So that adding new markets or updating specs is safe and predictable

### Scenario 6.1: North America spec data is available

    Given the spec data for North America has been defined
    Then it includes technical properties, certifications, and trade information
    And it includes spec groups for each product family (sweeps, couplings, pipes)
    And each spec group has labeled columns and data rows grouped by schedule

### Scenario 6.2: Spec data types enforce completeness

    Given the spec data type definitions exist
    When a new market's spec data is created
    Then the TypeScript compiler verifies all required fields are present

---

## Acceptance Criteria (Cross-cutting)

### Responsive Design
- [ ] All product pages follow mobile-first responsive breakpoints (sm/md/lg)
- [ ] Spec tables scroll horizontally on narrow screens without breaking layout
- [ ] Sticky family navigation works on both desktop and mobile

### Performance
- [ ] Market page is a Server Component (no unnecessary client-side JS)
- [ ] Sticky navigation is the only client component on the market page
- [ ] Placeholder images use optimized SVG, not heavy raster formats

### Accessibility
- [ ] Spec tables use semantic `<table>` with proper `<thead>`/`<tbody>`
- [ ] Sticky navigation supports keyboard navigation
- [ ] Anchor links update browser URL for shareability
- [ ] All images have meaningful alt text

### SEO
- [ ] Market pages have proper metadata (title, description, OpenGraph)
- [ ] Each family section has a heading element for indexability
- [ ] Breadcrumb renders JSON-LD structured data

### Design System Compliance
- [ ] Pages follow PAGE-PATTERNS.md container convention (max-w-[1080px] px-6)
- [ ] Section spacing follows established rhythm (py-14 md:py-[72px])
- [ ] Cards use project shadow-border technique
