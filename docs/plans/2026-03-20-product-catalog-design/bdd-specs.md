# BDD Specifications: Product Catalog Page Structure

## Feature: Product Catalog Navigation

### Scenario: User views products overview page
Given the user navigates to /en/products/
Then they see 5 market series cards:
  | Label                  |
  | UL / ASTM Series       |
  | AS/NZS 2053 Series     |
  | NOM Series             |
  | IEC Series             |
  | PETG Pneumatic Tubes   |
And each card links to its market landing page

### Scenario: User navigates to a market series
Given the user clicks on "UL / ASTM Series"
Then they are navigated to /en/products/north-america/
And they see a breadcrumb: Home > Products > UL / ASTM Series
And they see 3 product family cards:
  | Label                      |
  | Conduit Sweeps & Elbows    |
  | Couplings                  |
  | Conduit Pipes              |

### Scenario: User navigates to AU market with unique product
Given the user clicks on "AS/NZS 2053 Series"
Then they are navigated to /en/products/australia-new-zealand/
And they see 4 product family cards including "Bellmouths"
And "Bellmouths" is not shown in other market series

### Scenario: User navigates to a product family page
Given the user is on /en/products/north-america/
When they click on "Conduit Sweeps & Elbows"
Then they are navigated to /en/products/north-america/conduit-sweeps-elbows/
And they see a breadcrumb: Home > Products > UL / ASTM Series > Conduit Sweeps & Elbows
And they see the product family heading and description
And they see an inquiry CTA

## Feature: Route Validation

### Scenario: Invalid market slug returns 404
Given the user navigates to /en/products/invalid-market/
Then they see the 404 page

### Scenario: Invalid market-family combination returns 404
Given the user navigates to /en/products/north-america/bellmouths/
Then they see the 404 page
Because bellmouths only exists in the australia-new-zealand market

### Scenario: Valid market-family combination renders correctly
Given the user navigates to /en/products/australia-new-zealand/bellmouths/
Then the page renders with the Bellmouths family information

## Feature: Locale Support

### Scenario: Products pages work in both locales
Given the user navigates to /zh/products/north-america/conduit-sweeps-elbows/
Then the page renders in Chinese locale context
And the breadcrumb uses translated labels
And the URL path segments remain in English

### Scenario: Locale switching preserves route
Given the user is on /en/products/north-america/
When they switch locale to Chinese
Then they are navigated to /zh/products/north-america/

## Feature: Static Generation

### Scenario: All market pages are statically generated
When running pnpm build
Then 10 market landing pages are generated (5 markets x 2 locales)

### Scenario: All family pages are statically generated
When running pnpm build
Then approximately 30 family pages are generated (~15 combos x 2 locales)

### Scenario: Existing product detail pages still work
Given the legacy route /en/products/pvc-conduit-bend exists
When running pnpm build
Then the legacy product detail page is generated successfully
And does not conflict with the new market routes

## Feature: Breadcrumb Navigation

### Scenario: Products overview has minimal breadcrumb
Given the user is on /en/products/
Then the breadcrumb shows: Home > Products (current)

### Scenario: Market page shows two-level breadcrumb
Given the user is on /en/products/north-america/
Then the breadcrumb shows: Home > Products > UL / ASTM Series (current)
And "Products" is a link to /en/products/

### Scenario: Family page shows three-level breadcrumb
Given the user is on /en/products/north-america/conduit-sweeps-elbows/
Then the breadcrumb shows: Home > Products > UL / ASTM Series > Conduit Sweeps & Elbows (current)
And "Products" links to /en/products/
And "UL / ASTM Series" links to /en/products/north-america/
