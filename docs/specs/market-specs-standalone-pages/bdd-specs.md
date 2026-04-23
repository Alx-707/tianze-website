# BDD Specs: Market Spec Data + Standalone Pages

> Historical design doc retired from live docs surface; this BDD file is the active behavior contract.
> Date: 2026-03-23

---

## Feature: Market Spec Data Display

  As an overseas buyer evaluating PVC conduit fittings suppliers
  I want to see product specifications for my regional market
  So that I can verify the products meet my local standards

### Scenario: AU/NZ market page shows spec tables with metric sizes

    Given I am viewing the Australia / New Zealand market page
    When the page loads
    Then I see product spec tables grouped by "Medium Duty" and "Heavy Duty"
    And all sizes are displayed in millimeters
    And I see the AS/NZS 2053 certification badge

### Scenario: AU/NZ market shows bellmouths family (unique to this market)

    Given I am viewing the Australia / New Zealand market page
    When the page loads
    Then I see a "Bellmouths" product family section with spec tables
    And the bellmouths section includes highlights like "Flared Entry Protection"

### Scenario: Mexico market page shows spec tables with local grouping

    Given I am viewing the Mexico market page
    When the page loads
    Then I see product spec tables grouped by "Tipo Ligero" and "Tipo Pesado"
    And all sizes are displayed in millimeters
    And I see the NOM-001-SEDE certification badge

### Scenario: Europe market page shows spec tables with three duty ratings

    Given I am viewing the Europe market page
    When the page loads
    Then I see product spec tables grouped by "Light", "Medium", and "Heavy"
    And all sizes are displayed in millimeters
    And I see the IEC 61386 certification badge

### Scenario: Pneumatic tube systems page shows PETG specs grouped by outer diameter

    Given I am viewing the Pneumatic Tube Systems market page
    When the page loads
    Then I see spec tables for PETG tubes grouped by outer diameter (110mm, 160mm)
    And I see a fittings section (including diverters)
    And the trade information shows MOQ in meters (not pieces)

### Scenario: "Specs coming soon" message no longer appears on any market page

    Given spec data has been registered for all five markets
    When I visit any market page (AU/NZ, Mexico, Europe, Pneumatic, North America)
    Then I do not see a "specs coming soon" message
    And I see at least one product family with spec tables

### Scenario: Each market page shows trust signals (technical properties, certifications, trade info)

    Given I am viewing any market page that has spec data
    When I scroll past the product families
    Then I see a Technical Properties section
    And I see a Certifications & Compliance section
    And I see a Trade Information section with MOQ, lead time, and supply capacity

### Scenario: Sticky navigation shows only families that have spec data

    Given I am viewing a market page with spec data
    When the page loads
    Then the sticky family navigation lists only families that have spec tables
    And clicking a family name in the sticky nav scrolls to that family section

---

## Feature: Market Spec Data Integrity

  As a developer maintaining the product catalog
  I want spec data files to be type-safe and consistent with the catalog config
  So that invalid data is caught at compile time

### Scenario: Each spec data file satisfies the MarketSpecs interface

    Given a new market spec data file is created
    When it is compiled by TypeScript
    Then it passes type checking with `satisfies MarketSpecs`
    And every family slug in the spec matches a family slug in product-catalog.ts for that market

### Scenario: Product standards include all market-specific IDs

    Given the product-standards.ts file
    When I check the standard IDs
    Then it includes "nom" for Mexico, "iec" for Europe, and "petg" for Pneumatic
    And product-catalog.ts references these IDs in each market's standardIds array

### Scenario: Spec data file has correct structure per market

    Given a market spec data file (e.g., australia-new-zealand.ts)
    When I inspect its contents
    Then it has a technical properties object, certifications array, trade info object, and families array
    And each family has images, highlights (as raw English strings), and specGroups

---

## Feature: Bending Machines Capability Page

  As an overseas buyer evaluating supplier capabilities
  I want to see Tianze's bending machine technology
  So that I understand they are an upstream manufacturer, not just a trader

### Scenario: Buyer views the bending machines page

    Given I navigate to the bending machines page
    When the page loads
    Then I see a hero section explaining these are self-developed machines
    And I see value proposition cards explaining why this matters
    And I see specs for at least two machine models (full-auto and semi-auto)

### Scenario: Buyer views full-auto machine specifications

    Given I am on the bending machines page
    When I look at the Full-Auto machine section
    Then I see key specs including pipe diameter range, production speed, control system, and power supply
    And I see highlight points about the machine's advantages

### Scenario: Buyer views semi-auto machine specifications

    Given I am on the bending machines page
    When I look at the Semi-Auto machine section
    Then I see key specs including pipe diameter range, production speed, and power supply
    And the specs differ from the full-auto model (smaller diameter range, lower speed)

### Scenario: Buyer sees production capability numbers

    Given I am on the bending machines page
    When I scroll to the production capability section
    Then I see key numbers (monthly capacity, countries served, years of experience)
    And the numbers are displayed in a prominent engineering-style format

### Scenario: Buyer navigates to contact from bending machines page

    Given I am on the bending machines page
    When I click the CTA button
    Then I am taken to the contact page

### Scenario: Bending machines page is accessible from products overview

    Given I am on the products overview page
    When I look at the "Specialty & Equipment" section
    Then the Bending Machines card links to the bending machines page (not to /contact)

### Scenario: Bending machines page is accessible from homepage

    Given I am on the homepage
    When I look at the products section
    Then the Bending Machines card links to the bending machines page

---

## Feature: OEM Custom Manufacturing Page

  As a distributor or importer with my own brand
  I want to learn about Tianze's OEM manufacturing service
  So that I can evaluate them as a custom manufacturing partner

### Scenario: Buyer views the OEM service page

    Given I navigate to the OEM custom manufacturing page
    When the page loads
    Then I see a hero section about OEM and custom manufacturing
    And I see service scope modules (custom sizes, private label, mold development, quality assurance)

### Scenario: Buyer views the OEM collaboration process

    Given I am on the OEM page
    When I scroll to the process flow section
    Then I see 5 steps: Inquiry, Sample, Mold/Tooling, Trial Run, Mass Production
    And each step shows an approximate timeline

### Scenario: Buyer sees supported standards for OEM

    Given I am on the OEM page
    When I scroll to the supported standards section
    Then I see the major market standards listed (UL/ASTM, AS/NZS, NOM, IEC)
    And I see a note that custom standards are also supported

### Scenario: Buyer navigates to contact from OEM page

    Given I am on the OEM page
    When I click the "Start Your OEM Project" CTA
    Then I am taken to the contact page

### Scenario: OEM page is accessible from homepage

    Given I am on the homepage
    When I look at the products section
    Then the OEM & Custom Manufacturing card links to the OEM page (not to /contact)

---

## Feature: Infrastructure — Sitemap and SEO

  As a search engine crawler
  I want to discover all product and capability pages
  So that they can be indexed

### Scenario: New standalone pages appear in sitemap

    Given the sitemap is generated
    When I inspect the sitemap entries
    Then it includes /capabilities/bending-machines for all locales
    And it includes /oem-custom-manufacturing for all locales
    And both have priority 0.8 and changeFrequency monthly

### Scenario: All market pages appear in sitemap

    Given the sitemap is generated
    When I inspect the sitemap entries
    Then it includes entries for all 5 markets (north-america, australia-new-zealand, mexico, europe, pneumatic-tube-systems) for all locales

---

## Feature: Infrastructure — Route Configuration

  As a developer working on the site
  I want all routes properly configured
  So that navigation, language switching, and type safety work correctly

### Scenario: Route config includes new pages

    Given the paths configuration
    When I check PageType and PATHS_CONFIG
    Then "bendingMachines" maps to "/capabilities/bending-machines"
    And "oem" maps to "/oem-custom-manufacturing"

### Scenario: Language switching works on new pages

    Given I am on the bending machines page in English
    When I switch to Chinese
    Then I stay on the bending machines page in Chinese
    And the page content is displayed in Chinese

### Scenario: Language switching works on OEM page

    Given I am on the OEM page in English
    When I switch to Chinese
    Then I stay on the OEM page in Chinese

---

## Acceptance Criteria (supplementary)

### Data Integrity
- [ ] All 4 new spec files pass TypeScript compilation with `satisfies MarketSpecs`
- [ ] Every family slug in each spec file matches its corresponding entry in product-catalog.ts
- [ ] Mexico, Europe, and Pneumatic standardIds are no longer empty arrays
- [ ] FamilySpecs.highlights JSDoc updated (remove "Exactly 3" and "i18n keys" — they are variable-count raw strings)

### Accessibility
- [ ] Spec tables have proper semantic HTML (thead/tbody/th/td)
- [ ] Bending machines page has heading hierarchy (h1 → h2 → h3)
- [ ] OEM process flow is not reliant on visual-only cues (numbers + text labels)
- [ ] All placeholder images have meaningful alt text

### Performance
- [ ] New i18n namespaces (capabilities, oem) are in deferred.json, not critical.json
- [ ] No new client-side JavaScript introduced (both pages are Server Components)

### Build
- [ ] `pnpm build` succeeds with all new files
- [ ] `pnpm type-check` passes
- [ ] `pnpm lint:check` passes with zero warnings
- [ ] All existing tests continue to pass
