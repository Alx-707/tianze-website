# Site Configuration Specification

This capability defines the core site configuration and branding requirements.

## ADDED Requirements

### Requirement: Tianze Brand Identity Configuration

The site MUST be configured with Tianze Pipe Industry's brand identity, including company name, description, and SEO metadata.

#### Scenario: Site displays Tianze brand name

**Given** a user visits any page on the site
**When** the page loads
**Then** the browser tab title MUST include "Tianze Pipe"
**And** the meta description MUST reference PVC conduit and PETG pneumatic tube manufacturing

#### Scenario: SEO metadata reflects Tianze business

**Given** a search engine crawls the site
**When** it parses the homepage metadata
**Then** the title MUST contain "Tianze Pipe"
**And** the keywords MUST include: `PVC conduit`, `PETG tube`, `pipe manufacturer`, `electrical conduit`, `pneumatic tube`

### Requirement: Company Facts Configuration

The site MUST display accurate Tianze company information including establishment year, location, and certifications.

#### Scenario: Company facts are configured correctly

**Given** the site configuration is loaded
**When** `siteFacts` values are accessed
**Then** `company.established` MUST equal `2018`
**And** `company.location.city` MUST equal `Lianyungang, Jiangsu`
**And** `company.location.country` MUST equal `China`
**And** `company.employees` MUST equal `60`
**And** `stats.exportCountries` MUST equal `100`

#### Scenario: Certification information includes certificate number

**Given** the certifications array is accessed
**When** the ISO 9001:2015 certification is retrieved
**Then** `name` MUST equal `ISO 9001:2015`
**And** `certificateNumber` MUST equal `240021Q09730R0S`

### Requirement: Temporary Placeholder Values for Pending Information

Contact information and social links not yet provided MUST use temporary valid values that pass production validation while being clearly identifiable as placeholders.

#### Scenario: Placeholder values pass production validation

**Given** the site is built for production
**When** `validateSiteConfig()` runs
**Then** validation MUST pass (no errors)
**And** placeholder values MUST NOT use `[PLACEHOLDER_*]` bracket format

#### Scenario: Placeholder values are searchable

**Given** a developer needs to find and replace placeholder values
**When** they search the codebase
**Then** `rg "tianze-pipe.example|0000-0000"` MUST return all placeholder locations
**And** contact email MUST use `.example` TLD (reserved per RFC 2606)
**And** phone numbers MUST use `0000-0000` pattern

### Requirement: Social Links Use Valid URLs

Social links MUST use valid URLs that pass production validation, even if they are temporary placeholders.

#### Scenario: Social links are valid URLs

**Given** the site configuration is loaded
**When** `SITE_CONFIG.social.*` values are accessed
**Then** all social URLs MUST be valid HTTPS URLs
**And** all social URLs MUST NOT be empty strings
**And** all social URLs MUST NOT use `[PLACEHOLDER_*]` format

## Schema Changes

### Certification Interface Extension

The `Certification` interface in `src/config/site-facts.ts` MUST include an optional `certificateNumber` field:

```typescript
export interface Certification {
  name: string;
  certificateNumber?: string;  // ADDED
  file?: string;
  validUntil?: string;
}
```
