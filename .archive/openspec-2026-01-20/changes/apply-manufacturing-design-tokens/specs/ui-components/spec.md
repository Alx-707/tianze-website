## ADDED Requirements

> Note: `openspec/specs/ui-components/spec.md` does not currently define a "Design Token System" requirement. This change adds the requirements below.

### Requirement: Design Token System

The design system SHALL use a Manufacturing-First token architecture with three layers:

1. **Primitive Tokens**: Raw color scales (Graphite hue 250, Amber hue 75)
2. **Semantic Tokens**: Purpose-driven mappings (primary, accent, background, foreground)
3. **Component Tokens**: UI-specific values (button-primary-bg, card-radius)

All tokens SHALL use OKLCH color space for perceptual uniformity.

#### Scenario: Light theme token application
- **WHEN** the page loads without `.dark` class
- **THEN** `--primary` SHALL be Industrial Amber `oklch(0.75 0.160 75)`
- **AND** `--accent` SHALL be Deep Graphite `oklch(0.20 0.015 250)`
- **AND** `--background` SHALL be Precision White `oklch(0.98 0.005 250)`
- **AND** `--foreground` SHALL be Deep Graphite `oklch(0.15 0.010 250)`

#### Scenario: Dark theme token application
- **WHEN** the page has `.dark` class applied
- **THEN** `--primary` SHALL be Brighter Amber `oklch(0.80 0.160 75)`
- **AND** `--accent` SHALL be Light Graphite `oklch(0.94 0.010 250)`
- **AND** `--background` SHALL be Deep Workshop `oklch(0.12 0.010 250)`
- **AND** `--foreground` SHALL be Light Graphite `oklch(0.94 0.010 250)`

#### Scenario: Focus ring visibility
- **WHEN** an interactive element receives focus
- **THEN** `--ring` SHALL be Industrial Amber for unmistakable visibility
- **AND** the focus ring SHALL have 2px width and 2px offset

#### Scenario: WCAG AA compliance
- **WHEN** any text is rendered on its background
- **THEN** the contrast ratio SHALL be at least 4.5:1 for normal text
- **AND** the contrast ratio SHALL be at least 3:1 for large text (≥18px or ≥14px bold)

### Requirement: Typography System

The design system SHALL use IBM Plex Sans as the primary font family for Latin text, with appropriate fallbacks for CJK characters.

#### Scenario: Font loading
- **WHEN** the page loads
- **THEN** IBM Plex Sans SHALL be loaded with `font-display: swap`
- **AND** the Chinese font stack SHALL remain as fallback for CJK characters

#### Scenario: Monospace text
- **WHEN** code or technical specifications are displayed
- **THEN** IBM Plex Mono or system monospace stack SHALL be used

### Requirement: Border Radius System

The design system SHALL use sharp, precision-machined radius values reflecting manufacturing aesthetics.

#### Scenario: Radius token values
- **WHEN** radius tokens are applied
- **THEN** `--radius` (base) SHALL be `4px`
- **AND** `--radius-sharp` SHALL be `2px` for buttons and inputs
- **AND** `--radius-none` SHALL be `0` for tables and technical data
- **AND** `--radius-round` SHALL be `9999px` for pills and avatars

### Requirement: Animation System

The design system SHALL use mechanical, precision-based animation timing without bounce or spring effects.

#### Scenario: Animation duration
- **WHEN** UI transitions occur
- **THEN** `--duration-fast` SHALL be `100ms`
- **AND** `--duration-normal` SHALL be `150ms`
- **AND** `--duration-slow` SHALL be `250ms`

#### Scenario: Animation easing
- **WHEN** UI transitions occur
- **THEN** `--ease-snap` SHALL be `cubic-bezier(0, 0, 0.2, 1)`
- **AND** `--ease-mechanical` SHALL be `cubic-bezier(0.4, 0, 0.2, 1)`
- **AND** NO spring or bounce easing functions SHALL be used

#### Scenario: Reduced motion preference
- **WHEN** user has `prefers-reduced-motion: reduce` enabled
- **THEN** all animation durations SHALL be reduced to `0.01ms`
- **AND** all transitions SHALL be effectively instant

### Requirement: Shadow System

The design system SHALL use graphite-toned shadows with a 5-tier scale.

#### Scenario: Shadow application
- **WHEN** elevation is needed
- **THEN** shadows SHALL use HSL color derived from graphite hue 250
- **AND** shadow tiers SHALL be: xs, sm, md, lg, xl

#### Scenario: Dark mode shadows
- **WHEN** dark theme is active
- **THEN** shadow opacity SHALL be increased for visibility
- **AND** shadow color SHALL remain graphite-toned

### Requirement: Manufacturing Visual Elements

The design system SHALL provide utility classes for manufacturing-specific visual patterns.

#### Scenario: Precision grid background
- **WHEN** `.precision-grid` class is applied
- **THEN** a subtle 24px engineering grid SHALL be displayed
- **AND** grid lines SHALL use graphite border color

#### Scenario: Technical callout
- **WHEN** `.technical-callout` class is applied
- **THEN** a 3px amber left border SHALL be displayed
- **AND** a subtle amber gradient background SHALL fade from left to right

#### Scenario: Specification box
- **WHEN** `.spec-box` class is applied
- **THEN** a 3px graphite left border SHALL be displayed
- **AND** monospace font SHALL be applied
- **AND** border radius SHALL be `0` (sharp corners)

#### Scenario: Measurement scale pattern
- **WHEN** `.measurement-scale` class is applied
- **THEN** a repeating measurement/ruler mark pattern SHALL be displayed
- **AND** the mark color SHALL be derived from `--border`
