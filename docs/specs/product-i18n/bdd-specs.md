# Product Data i18n — Behavioral Specifications

> Design doc: `docs/superpowers/specs/2026-03-24-product-i18n-design.md`
> Implementation plan: `docs/superpowers/plans/2026-03-24-product-i18n.md`
> Date: 2026-03-24

---

## Feature 1: Translation Key Completeness

  As a developer maintaining the product catalog
  I want every user-facing data string to have a matching translation key in both locales
  So that Chinese visitors see fully translated product content and no raw English leaks through

### Scenario 1.1: Every market has label and description keys in both locales

    Given the product catalog defines 5 markets
    When I check the translation files
    Then each market slug has a `catalog.markets.{slug}.label` key in en and zh
    And each market slug has a `catalog.markets.{slug}.description` key in en and zh

### Scenario 1.2: Every product family has label and description keys in both locales

    Given the product catalog defines families under each market
    When I check the translation files
    Then each family has a `catalog.families.{marketSlug}.{familySlug}.label` key in en and zh
    And each family has a `catalog.families.{marketSlug}.{familySlug}.description` key in en and zh

### Scenario 1.3: Every technical property key has a shared label translation

    Given the 5 market spec files use various technical property keys (material, surface, etc.)
    When I collect all unique technical property keys across all markets
    Then each key has a `catalog.technicalLabels.{key}` entry in en and zh

### Scenario 1.4: Every family highlight count matches translation key count

    Given a market spec file defines N highlights for a product family
    When I check the translation files
    Then there are exactly N `catalog.specs.{market}.families.{family}.highlights.{0..N-1}` keys in en and zh

### Scenario 1.5: Every spec group label has a translation key

    Given a market spec file defines spec groups with groupLabel values
    When I check the translation files
    Then each group has a `catalog.specs.{market}.families.{family}.groups.{idx}.label` key in en and zh

### Scenario 1.6: Every translatable row cell value has a shared rowValues key

    Given spec tables contain text values like "Bell End", "Plain End", "Standard Coupling"
    When I scan all 5 market spec files for non-numeric row cell values
    Then each unique text value has a matching `catalog.rowValues.{camelCaseKey}` entry in en and zh

### Scenario 1.7: Equipment specs have name, param labels, and highlights in both locales

    Given equipment-specs.ts defines 2 bending machines
    When I check the translation files
    Then each machine slug has `capabilities.equipment.{slug}.name` in en and zh
    And each param key has `capabilities.equipment.{slug}.params.{key}` in en and zh
    And each highlight index has `capabilities.equipment.{slug}.highlights.{idx}` in en and zh

### Scenario 1.8: Spec table column headers include all used columns

    Given spec tables use columns like "Wall Thickness", "Bend Radius", "Connection"
    When I check the translation files
    Then each column display string maps to a `catalog.specTable.{camelCaseKey}` entry in en and zh

---

## Feature 2: Product Overview Page i18n

  As a buyer viewing the product overview page in Chinese
  I want market card labels and descriptions in Chinese
  So that I understand which product line matches my regional standard

### Scenario 2.1: Market cards display translated labels

    Given I am viewing the product overview page in Chinese
    Then each market card shows its label in Chinese (e.g. "UL / ASTM 系列")
    And each market card shows its description in Chinese

### Scenario 2.2: Market cards still link to the correct market page

    Given I am viewing the product overview page in Chinese
    When I select a market card
    Then I am taken to the correct market detail page under the zh locale

### Scenario 2.3: Specialty cards display translated labels

    Given I am viewing the product overview page in Chinese
    Then the "PETG Pneumatic Tubes" card shows its Chinese label
    And the "Bending Machines" card shows its Chinese label

---

## Feature 3: Market Detail Page i18n

  As a buyer viewing a market page in Chinese
  I want the page header, metadata, and breadcrumb in Chinese
  So that the page feels native and search engines index it correctly for Chinese queries

### Scenario 3.1: Page header shows translated market label and description

    Given I am viewing the North America market page in Chinese
    Then the page title shows the Chinese market label
    And the page description paragraph shows the Chinese market description

### Scenario 3.2: HTML metadata uses translated content

    Given I am viewing the North America market page in Chinese
    Then the `<title>` tag contains the Chinese market label
    And the meta description contains the Chinese market description

### Scenario 3.3: Breadcrumb displays translated market label

    Given I am viewing the North America market page in Chinese
    Then the breadcrumb shows the Chinese market label
    And the JSON-LD structured data uses the Chinese market label

### Scenario 3.4: Sticky family navigation uses translated family labels

    Given I am viewing a market page in Chinese
    Then the sticky navigation links show Chinese family labels

### Scenario 3.5: CTA section uses translated text

    Given I am viewing a market page in Chinese
    When I scroll to the bottom CTA
    Then the CTA heading and button text are in Chinese

---

## Feature 4: Family Section i18n

  As a buyer viewing a product family section in Chinese
  I want family labels, descriptions, and highlights in Chinese
  So that I understand each product line without needing English

### Scenario 4.1: Family section header shows translated label and description

    Given I am viewing a family section on a market page in Chinese
    Then the family section heading shows the Chinese family label
    And the family description paragraph shows the Chinese text

### Scenario 4.2: Family highlights display in Chinese

    Given a family section has 3 highlights (e.g. "UL 651 Certified", "100% Virgin PVC", "45/90/Custom Angles")
    When I view the section in Chinese
    Then all 3 highlights show their Chinese translations

### Scenario 4.3: English locale still displays English family content

    Given I am viewing the same family section in English
    Then the family label, description, and highlights remain in English

---

## Feature 5: Specification Table i18n

  As a buyer reading a spec table in Chinese
  I want column headers, group labels, and text cell values in Chinese
  So that I can evaluate product specifications in my language

### Scenario 5.1: Column headers display in Chinese

    Given I am viewing a spec table on a market page in Chinese
    Then column headers like "Wall Thickness" appear as their Chinese translations (e.g. "壁厚")

### Scenario 5.2: Group labels translate descriptive terms but keep universal codes

    Given a spec table has groups labeled "Schedule 40" and "Heavy Duty"
    When I view it in Chinese
    Then "Schedule 40" remains "Schedule 40" (universal grade code)
    And "Heavy Duty" shows as "重型"

### Scenario 5.3: Text row cell values translate with fallback

    Given a spec table has a row cell with text "Bell End"
    When I view it in Chinese
    Then it shows "承口" (from the rowValues lookup)

### Scenario 5.4: Numeric row cell values remain unchanged

    Given a spec table has a row cell with "16mm" or "90°"
    When I view it in any locale
    Then the numeric value displays exactly as-is (no translation lookup)

### Scenario 5.5: Unknown text values fall back to raw data

    Given a spec table has a row cell with text not in the rowValues lookup
    When I view it in Chinese
    Then the raw English text displays as fallback
    And no error or missing-key warning is thrown

---

## Feature 6: Technical Specs and Trade Info i18n

  As a buyer viewing the trust signals section on a market page in Chinese
  I want technical property labels, values, and trade info in Chinese
  So that I can assess material quality and ordering terms in my language

### Scenario 6.1: Technical property labels display in Chinese

    Given I am viewing the trust signals section in Chinese
    Then property labels like "Material", "Surface", "UV Resistance" show as their Chinese translations

### Scenario 6.2: Technical property values display in Chinese

    Given I am viewing the North America trust signals in Chinese
    Then values like "Smooth interior, reduces wire pulling friction" show in Chinese
    And certification names like "UL 651" remain unchanged

### Scenario 6.3: Trade info values display in Chinese

    Given I am viewing the trade info section in Chinese
    Then values like "15-20 days" show as "15-20 天"
    And "Lianyungang, China" shows as the Chinese translation

---

## Feature 7: Bending Machines Equipment i18n

  As a buyer viewing the bending machines page in Chinese
  I want equipment names, parameter labels, and highlights in Chinese
  So that I can evaluate machine capabilities in my language

### Scenario 7.1: Equipment names display in Chinese

    Given I am viewing the bending machines page in Chinese
    Then "Full-Automatic PVC Pipe Bending Machine" shows as "全自动 PVC 弯管机"
    And "Semi-Automatic PVC Pipe Bending Machine" shows as "半自动 PVC 弯管机"

### Scenario 7.2: Parameter labels display in Chinese

    Given I am viewing a machine card in Chinese
    Then parameter labels like "Pipe Diameter" show as "管径"
    And parameter values like "DN25-DN160mm" remain as-is (numeric specs)

### Scenario 7.3: Equipment highlights display in Chinese

    Given I am viewing a machine card in Chinese
    Then highlights like "CNC Control System" show as "CNC 控制系统"

### Scenario 7.4: formatParamKey utility is removed

    Given the bending machines page has been updated for i18n
    Then the old `formatParamKey` function no longer exists in the codebase
    And parameter labels are sourced from translation keys instead

---

## Feature 8: Translation Key Helpers

  As a developer wiring product data to translation keys
  I want utility functions that convert display strings to camelCase keys
  So that the key derivation convention is consistent and testable

### Scenario 8.1: columnToKey converts column headers to camelCase

    Given the column header display string "Wall Thickness"
    When I call columnToKey("Wall Thickness")
    Then it returns "wallThickness"

    Given the column header display string "Size"
    When I call columnToKey("Size")
    Then it returns "size"

    Given the column header display string "Outer Diameter"
    When I call columnToKey("Outer Diameter")
    Then it returns "outerDiameter"

### Scenario 8.2: cellToKey converts cell text to camelCase, normalizing hyphens

    Given the cell text "Bell End"
    When I call cellToKey("Bell End")
    Then it returns "bellEnd"

    Given the cell text "Push-fit"
    When I call cellToKey("Push-fit")
    Then it returns "pushFit"

    Given the cell text "Y-Diverter"
    When I call cellToKey("Y-Diverter")
    Then it returns "yDiverter"

---

## Acceptance Criteria (Cross-cutting)

### Translation Parity
- [ ] Every `catalog.*` key in `messages/en/critical.json` has a matching key in `messages/zh/critical.json`
- [ ] Every `capabilities.equipment.*` key in `messages/en/deferred.json` has a matching key in `messages/zh/deferred.json`
- [ ] `pnpm i18n:full` passes with zero errors after all keys are added

### Data File Integrity
- [ ] `src/constants/product-catalog.ts` is NOT modified (structure unchanged)
- [ ] `src/constants/product-specs/*.ts` are NOT modified (structure unchanged)
- [ ] `src/constants/equipment-specs.ts` is NOT modified (structure unchanged)
- [ ] English values in data files continue to serve as dev-readable references

### Namespace Discipline
- [ ] Product catalog keys go into `catalog.*` in `critical.json`
- [ ] Equipment keys go into `capabilities.equipment.*` in `deferred.json`
- [ ] No equipment keys leak into `catalog.*`; no catalog keys leak into `capabilities.*`

### Fallback Safety
- [ ] Numeric spec values (16mm, 90°, 1.2mm) never enter the translation lookup
- [ ] Unknown text row values display as raw English (graceful fallback, no error)
- [ ] Universal grade codes (Schedule 40, Schedule 80) remain untranslated

### Performance
- [ ] No new client components added (all translation wiring happens in Server Components)
- [ ] `critical.json` size increase is proportional (~9KB, from ~40KB to ~49KB)
- [ ] No unnecessary re-renders from translation prop changes

### SEO
- [ ] `generateMetadata` for market pages outputs locale-correct title and description
- [ ] Breadcrumb JSON-LD uses translated market labels
- [ ] Homepage product section metadata follows existing i18n pattern

---

## Scenario-to-Task Traceability

| Scenario | Plan Task | Type |
|----------|-----------|------|
| 8.1, 8.2 | Task 1: Translation key helpers | Red + Green |
| 1.1–1.8 | Task 2: English keys + Task 3: Chinese keys + Task 4: Parity test | Red + Green |
| 2.1–2.3 | Task 5: Wire MarketSeriesCard + overview page | Red + Green |
| 3.1–3.5 | Task 6: Wire market detail page | Red + Green |
| 4.1–4.3 | Task 7: Wire FamilySection | Red + Green |
| 5.1–5.5 | Task 8: Wire SpecTable | Red + Green |
| 6.1–6.3 | Task 9: Wire ProductSpecs + TrustSignalsSection | Red + Green |
| 7.1–7.4 | Task 10: Wire bending machines page | Red + Green |
| Cross-cutting | Task 11: Full validation | Verification |
