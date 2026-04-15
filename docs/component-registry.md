# Project Registry

> Before creating any new component, hook, or utility, check this registry first.
> Update this file when adding, renaming, or removing items.

## Quick Reference by Need

| I need to... | Use this | Location |
|--------------|----------|----------|
| **UI Primitives** | | |
| Card container | `Card` + subcomponents | `ui/card` |
| Button | `Button` (8 variants) | `ui/button` |
| Form fields | `Input`, `Textarea`, `Label` | `ui/` |
| Section wrapper | `Section` + `SectionHead` | `ui/section`, `ui/section-head` |
| Section header (centered) | `SectionHeader` (eyebrow+title) | `blocks/shared/section-header` |
| Badge/tag | `Badge` (4 variants) | `ui/badge` |
| Breadcrumbs | `Breadcrumb` + subcomponents | `ui/breadcrumb` |
| Tabs | `Tabs` + subcomponents | `ui/tabs` |
| Accordion/FAQ | `Accordion` + subcomponents | `ui/accordion` |
| FAQ section (contextual) | `FaqSection` (Server) + `FaqAccordion` (Client) | `sections/faq-section`, `sections/faq-accordion` |
| Dropdown menu | `DropdownMenu` + subcomponents | `ui/dropdown-menu` |
| Slide-out panel | `Sheet` + subcomponents | `ui/sheet` |
| Max-width container | `Container` (6 sizes) | `ui/container` |
| Divider | `Separator` | `ui/separator` |
| Animate numbers on scroll | `AnimatedCounter` | `ui/animated-counter` |
| Reveal on scroll | `ScrollReveal` | `ui/scroll-reveal` |
| Theme toggle | `LazyThemeSwitcher` / `ThemeSwitcher` | `ui/` |
| Social icons | `SocialIcons` | `ui/social-icons` |
| **Products** | | |
| Product card (catalog) | `ProductCard` | `products/product-card` |
| Product card (homepage) | `ProductCard` (blocks) | `blocks/shared/product-card` |
| Product images | `ProductGallery` | `products/product-gallery` |
| Spec table | `SpecTable` | `products/spec-table` |
| Product family section | `FamilySection` | `products/family-section` |
| Product grid | `ProductGrid` | `products/product-grid` |
| Product inquiry | `InquiryDrawer` → `ProductInquiryForm` | `products/` |
| Product CTA bar | `ProductActions` (sticky) | `products/product-actions` |
| Market series card | `MarketSeriesCard` | `products/market-series-card` |
| Catalog breadcrumb | `CatalogBreadcrumb` (with JSON-LD) | `products/catalog-breadcrumb` |
| **Content** | | |
| Blog post grid | `PostGrid` → `PostCard` | `blog/` |
| Blog newsletter | `BlogNewsletter` | `blog/blog-newsletter` |
| Image carousel | `ImageCarousel` | `blocks/shared/image-carousel` |
| Stat bar | `StatBar` | `blocks/shared/stat-bar` |
| Render MDX | `MDXContent` | `mdx/mdx-content` |
| **Trust** | | |
| Testimonials | `TestimonialsSection` → `TestimonialCard` | `trust/` |
| Trust stats | `TrustStats` → `AnimatedStatItem` | `trust/` |
| Certifications | `CertificationBadges` | `trust/certification-badges` |
| Partner logos | `PartnerLogos` | `trust/partner-logos` |
| **Infrastructure** | | |
| Cookie consent | `LazyCookieConsentIsland` | `cookie/` |
| Contact form | `ContactForm` | `forms/contact-form` |
| CAPTCHA | `LazyTurnstile` | `forms/lazy-turnstile` |
| JSON-LD | `JsonLdScript` | `seo/json-ld-script` |
| Defer until idle | `Idle` | `lazy/idle` |
| Page progress bar | `LazyTopLoader` | `lazy/lazy-top-loader` |
| **Hooks** | | |
| Detect viewport (desktop/mobile) | `useViewportMatch` | `hooks/use-viewport-match` |
| Scroll visibility detection | `useIntersectionObserver` | `hooks/use-intersection-observer` |
| Defer render until idle | `useIdleRender` | `hooks/use-idle-render` |
| Responsive breakpoints | `useBreakpoint` | `hooks/use-breakpoint` |
| Keyboard navigation | `useKeyboardNavigation` | `hooks/use-keyboard-navigation` |
| Prefer reduced motion | `useReducedMotion` | `hooks/use-reduced-motion` |
| Form rate limiting | `useRateLimit` | `forms/use-rate-limit` |
| Current time (interval) | `useCurrentTime` | `hooks/use-current-time` |
| Accessibility utilities | `useAccessibility` | `lib/accessibility-hooks` |
| **Utilities** | | |
| Merge CSS classes | `cn()` | `lib/utils` |
| Structured logging | `logger` | `lib/logger` |
| Env vars (validated) | `env`, `getEnvVar()` | `lib/env` |
| SEO metadata | `generateLocalizedMetadata()` | `lib/seo-metadata` |
| JSON-LD schemas | `generateArticleSchema()`, etc. | `lib/structured-data-helpers` |
| Spec table i18n keys | `mapColumnNameToKey()`, etc. | `lib/spec-table-translator` |
| API response format | `createApiSuccessResponse()`, etc. | `lib/api/api-response` |
| Safe JSON parse | `safeParseJson()` | `lib/api/safe-parse-json` |
| Server Action helpers | `createSuccessResult()`, etc. | `lib/server-action-utils` |
| Rate limiting (server) | `checkDistributedRateLimit()` | `lib/security/distributed-rate-limit` |
| Turnstile CAPTCHA verify | `verifyTurnstileDetailed()` | `lib/turnstile` |
| Idempotency | `withIdempotency()` | `lib/idempotency` |
| Client IP extraction | `getClientIP()` | `lib/security/client-ip` |
| UTM attribution | `captureUtmParams()`, etc. | `lib/utm` |
| Password hashing/crypto | `hashPassword()`, etc. | `lib/security-crypto` |
| Object guard (anti-pollution) | `safeGet()`, `safeMerge()` | `lib/security/object-guards` |
| Deep merge objects | `mergeObjects()` | `lib/merge-objects` |
| Idle callback polyfill | `requestIdleCallback()` | `lib/idle-callback` |
| Navigation config | `mainNavigation`, `isActivePath()` | `lib/navigation` |
| Content validation | `validateContentMetadata()` | `lib/content-validation` |
| Content paths/config | `CONTENT_DIR`, `validateFilePath()` | `lib/content-utils` |
| Sitemap last-modified | `getContentLastModified()` | `lib/sitemap-utils` |

---

## Components by Domain

All paths relative to `src/components/`. S = Server, C = Client.

### UI Primitives (`ui/`)

| Component | Type | Purpose | Common Pairing |
|-----------|------|---------|----------------|
| `Button` | S | 8 variants + sizes | Everywhere |
| `Card` | S | Container with Header/Title/Description/Action/Content/Footer | ProductCard, PostCard, forms |
| `Badge` | S | Label with 4 variants | ProductCard, PostCard |
| `Input` | S | Form text input | Forms with Label |
| `Textarea` | S | Form multiline input | Forms with Label |
| `Label` | C | Accessible form label | Input, Textarea |
| `Section` | S | Semantic wrapper with spacing/bg variants | Page sections |
| `SectionHead` | S | Title + optional action/subtitle | Section |
| `Container` | S | Max-width (sm/md/lg/xl/2xl/full) | Page layouts |
| `Separator` | C | Horizontal/vertical divider | Navigation, lists |
| `Breadcrumb` | S | Nav breadcrumb (Link, Page, Separator, Ellipsis) | Page headers |
| `Tabs` | C | Tab navigation (Radix) | Product details |
| `Accordion` | C | Expandable sections (Radix) | FAQ |
| `DropdownMenu` | C | Dropdown with items/checkbox/radio (Radix) | Navigation, settings |
| `Sheet` | C | Slide-out panel (Radix Dialog) | InquiryDrawer, MobileNav |
| `NavigationMenu` | S | Navigation structure (Radix) | Header |
| `ScrollReveal` | C | Animate-in on scroll with stagger | Homepage sections |
| `AnimatedCounter` | C | Number counter on scroll trigger | TrustStats |
| `ThemeSwitcher` | C | Light/dark/system toggle | Header |
| `LazyThemeSwitcher` | C | Deferred theme switcher | Header (production) |
| `Toaster` | C | Toast notifications (Sonner) | Form submissions |
| `SocialIcons` | S | Social media icon set + links | Footer |

### Grid System (`grid/`)

| Component | Type | Purpose | Common Pairing |
|-----------|------|---------|----------------|
| `GridSystem` | S | Outermost wrapper with border + crosshairs | Page-level |
| `GridSection` | S | CSS Grid container with guide lines | Within GridSystem |
| `GridBlock` | S | Content block with span control | Within GridSection |
| `GridFrame` | S | Decorative page frame | Page wrapper |
| `HeroGuideOverlay` | S | 12x8 fade-out grid for Hero | Hero sections |
| `DesktopDecorationGate` | C | Desktop-only rendering gate | GridFrame |

### Products (`products/`)

| Component | Type | Purpose | Common Pairing |
|-----------|------|---------|----------------|
| `ProductCard` | S | Catalog card with image, specs, trade info | ProductGrid |
| `ProductCardSkeleton` | S | Loading skeleton | ProductGrid loading |
| `ProductGrid` | S | Responsive product grid | Product listing pages |
| `ProductGallery` | C | Image gallery with thumbnails | Product detail page |
| `ProductSpecs` | S | Key-value spec table in Card | Product detail page |
| `SpecTable` | S | Multi-group scrollable spec table | FamilySection |
| `FamilySection` | S | Two-col family (image + specs + highlights) | Market landing pages |
| `MarketSeriesCard` | S | Market/series overview card | Products overview |
| `CatalogBreadcrumb` | S | Breadcrumb with JSON-LD | Product pages |
| `StickyFamilyNav` | S | Sticky anchor nav for families | Market landing pages |
| `ProductActions` | C | Sticky CTA bar (inquiry + download) | Product detail page |
| `InquiryDrawer` | C | Right-side inquiry form sheet | ProductActions |
| `ProductInquiryForm` | C | B2B inquiry form with Turnstile | InquiryDrawer |

### Blocks (`blocks/`)

| Component | Type | Purpose | Common Pairing |
|-----------|------|---------|----------------|
| `ProductMatrixBlock` | C | 4-category product hero grid | Homepage |
| `SectionHeader` | S | Centered eyebrow + title | Homepage sections |
| `ImageCarousel` | S | Scroll (mobile) / 3-col grid (desktop) | Homepage |
| `StatBar` | S | Horizontal stats with separators | Homepage |
| `ProductCard` (shared) | S | Feature card with image, features, CTA | ProductMatrixBlock |

### Layout (`layout/`)

| Component | Type | Purpose | Common Pairing |
|-----------|------|---------|----------------|
| `Header` | S | Main navigation header | Root layout |
| `HeaderClient` | C | Header interactive island | Header |
| `HeaderScrollChrome` | C | Scroll shadow effect | Header |
| `Logo` | S | Brand logo with size variants | Header |
| `VercelNavigation` | C | Desktop nav with hover dropdown | Header |
| `VercelDropdownContent` | C | Nav dropdown content | VercelNavigation |
| `NavSwitcher` | C | Lazy navigation loader | Header |
| `MobileNavigation` | C | Hamburger menu with Sheet | Header |
| `ViewportClientGate` | C | Conditional desktop/mobile render | Header, GridFrame |

### Blog (`blog/`)

| Component | Type | Purpose | Common Pairing |
|-----------|------|---------|----------------|
| `PostCard` | S | Post card with image, tags, meta | PostGrid |
| `PostCardSkeleton` | S | Loading skeleton | PostGrid loading |
| `PostGrid` | S | Responsive blog grid | Blog listing page |
| `BlogNewsletter` | C | Newsletter signup with Turnstile | Blog pages |

### Trust (`trust/`)

| Component | Type | Purpose | Common Pairing |
|-----------|------|---------|----------------|
| `TrustStats` | S | Key business metrics | Homepage |
| `AnimatedStatItem` | C | Single animated stat | TrustStats |
| `TestimonialsSection` | S | Testimonial grid | Homepage, About |
| `TestimonialCard` | S | Single testimonial | TestimonialsSection |
| `CertificationBadges` | S | Certification display | Homepage, About |
| `PartnerLogos` | S | Partner logo grid | Homepage |

### Forms (`forms/`)

| Component | Type | Purpose | Common Pairing |
|-----------|------|---------|----------------|
| `ContactForm` | C | Main contact form wrapper | Contact page |
| `ContactFormContainer` | C | Form with validation | ContactForm |
| `LazyTurnstile` | C | Lazy CAPTCHA widget | ContactForm, BlogNewsletter |

### Cookie (`cookie/`)

| Component | Type | Purpose | Common Pairing |
|-----------|------|---------|----------------|
| `LazyCookieConsentIsland` | C | Deferred consent provider | Root layout |
| `CookieConsentIsland` | C | Provider + banner | LazyCookieConsentIsland |
| `LazyCookieBanner` | C | Dynamic banner loader | CookieConsentIsland |
| `CookieBanner` | C | GDPR/CCPA consent UI | LazyCookieBanner |

### Other

| Component | Type | Purpose | Location |
|-----------|------|---------|----------|
| `JsonLdScript` | S | JSON-LD structured data | `seo/` |
| `MDXContent` | S | MDX renderer | `mdx/` |
| `Idle` | C | Defer render until idle/visible | `lazy/` |
| `LazyTopLoader` | C | Page progress bar | `lazy/` |
| `LazyToaster` | C | Deferred toast container | `lazy/` |
| `ThemeMenuItem` | C | Theme selector in dropdown | `theme/` |
| `ThemeProvider` | C | next-themes wrapper | root |
| `ErrorBoundary` | C | Graceful error fallback | root |
| `AttributionBootstrap` | C | UTM capture on load | root |

---

## Hooks

All paths relative to `src/`. P = Production use, T = Test-only.

| Hook | Status | Purpose | Location |
|------|--------|---------|----------|
| `useIntersectionObserver` | P | Scroll visibility detection (+ `WithDelay` variant for stagger) | `hooks/use-intersection-observer` |
| `useIdleRender` | P | Defer render until browser idle | `hooks/use-idle-render` |
| `useViewportMatch` | P | Desktop/mobile detection (hydration-safe) | `hooks/use-viewport-match` |
| `useRateLimit` | P | Form submission cooldown | `forms/use-rate-limit` |
| `useCurrentTime` | P | Timestamp at interval (used by useRateLimit) | `hooks/use-current-time` |
| `useBreakpoint` | T | Responsive breakpoint detection (superset of useViewportMatch) | `hooks/use-breakpoint` |
| `useKeyboardNavigation` | T | Arrow key / Tab nav for accessible components | `hooks/use-keyboard-navigation` |
| `useReducedMotion` | T | Detect prefers-reduced-motion | `hooks/use-reduced-motion` |
| `useOptimisticFormState` | T | React 19 useOptimistic wrapper | `forms/use-optimistic-form-state` |
| `useAccessibility` | T | A11y utilities facade | `lib/accessibility-hooks` |

---

## Utility Modules

All paths relative to `src/lib/`.

### Core

| Module | Key Exports | Purpose |
|--------|-------------|---------|
| `utils` | `cn()` | Tailwind class merging (clsx + tailwind-merge) |
| `logger` | `logger.error/warn/info/debug`, sanitizers | Structured logging with PII protection |
| `env` | `env`, `getEnvVar()`, `requireEnvVar()` | Type-safe env var validation (Zod) |
| `navigation` | `mainNavigation`, `isActivePath()` | Nav config and path matching |
| `idle-callback` | `requestIdleCallback()` | Polyfill for non-critical deferred work |
| `merge-objects` | `mergeObjects()` | Deep merge with prototype pollution guard |

### SEO & i18n

| Module | Key Exports | Purpose |
|--------|-------------|---------|
| `seo-metadata` | `generateLocalizedMetadata()` | Next.js metadata with locale support |
| `structured-data-helpers` | `generate*Schema()` | JSON-LD for Article, Product, FAQ, etc. |
| `spec-table-translator` | `mapColumnNameToKey()`, `mapRowValueToKey()` | Spec table display name → i18n key |

### Content

| Module | Key Exports | Purpose |
|--------|-------------|---------|
| `content-validation` | `validateContentMetadata()` | MDX frontmatter validation |
| `content-utils` | `CONTENT_DIR`, `validateFilePath()` | Content paths + directory traversal guard |
| `sitemap-utils` | `getContentLastModified()` | Sitemap date calculation |

### Security

| Module | Key Exports | Purpose |
|--------|-------------|---------|
| `security-crypto` | `hashPassword()`, `encryptData()`, etc. | Web Crypto API wrappers |
| `security/object-guards` | `safeGet()`, `safeMerge()` | Prototype pollution protection |
| `security/client-ip` | `getClientIP()` | Trusted proxy IP extraction |
| `security/distributed-rate-limit` | `checkDistributedRateLimit()` | Server-side rate limiting |
| `turnstile` | `verifyTurnstileDetailed()` | Cloudflare Turnstile CAPTCHA |

### API & Forms

| Module | Key Exports | Purpose |
|--------|-------------|---------|
| `api/api-response` | `createApiSuccessResponse()`, `createApiErrorResponse()` | Standardized API responses |
| `api/safe-parse-json` | `safeParseJson()` | Size-limited safe JSON parse |
| `server-action-utils` | `createSuccessResult()`, `withErrorHandling()` | Server Action helpers |
| `idempotency` | `withIdempotency()` | Duplicate request prevention |
| `idempotency-key` | `generateIdempotencyKey()` | Client-side key generation |
| `utm` | `captureUtmParams()`, `getAttributionSnapshot()` | UTM + click ID attribution |

---

## Naming Collisions

| Name | Context | Import from |
|------|---------|------------|
| `ProductCard` | Catalog/listing pages | `@/components/products/product-card` |
| `ProductCard` | Homepage matrix block | `@/components/blocks/shared/product-card` |
| `ContactForm` | Form implementation | `@/components/forms/contact-form` |
| `ContactForm` | Page-level wrapper | `@/components/contact/contact-form` |
