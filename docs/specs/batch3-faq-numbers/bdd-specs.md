# Behavioral Specifications: Batch 3 — Distributed FAQ + Core Numbers

> Design spec: `docs/superpowers/specs/2026-03-25-batch3-faq-numbers-design.md` (v2 — distributed)
> Each scenario maps to 1 Red task (failing test) + 1 Green task (implementation).

---

## Feature 1: FaqSection Reusable Component

```
As a developer
I want a reusable FaqSection component
So that I can add contextual FAQ to any page without duplicating code
```

### Scenario 1.1: FaqSection renders title via SectionHead

```gherkin
Given a FaqSection component with a title prop
When the section renders
Then the title is displayed using the SectionHead pattern
And the section has a divider border at the top
```

### Scenario 1.2: FaqSection renders accordion items from translation keys

```gherkin
Given a FaqSection with 5 FAQ item keys
When the section renders
Then 5 accordion items are displayed
And each item shows the question text
And all items are initially collapsed
```

### Scenario 1.3: Buyer expands a question

```gherkin
Given a FaqSection is displayed on a page
And all questions are collapsed
When I click on a question
Then the answer expands and becomes visible
And a chevron icon rotates to indicate open state
```

### Scenario 1.4: Multiple questions can be open simultaneously

```gherkin
Given one question is already expanded
When I click on a different question
Then both questions remain expanded
```

### Scenario 1.5: Buyer navigates accordion via keyboard

```gherkin
Given a FaqSection is displayed
When I use Tab to focus on a question
And I press Enter or Space
Then the question expands or collapses
```

### Scenario 1.6: FaqSection generates FAQ Schema for its items

```gherkin
Given a FaqSection with FAQ items
When the page renders
Then the page contains JSON-LD structured data of type "FAQPage"
And the structured data contains all questions and answers from the section
```

---

## Feature 2: Contact Page FAQ

```
As a buyer ready to inquire
I want ordering FAQ on the contact page
So that I can understand MOQ, payment, and lead time before submitting
```

### Scenario 2.1: Contact page shows ordering FAQ

```gherkin
Given I am on the contact page
When I scroll to the FAQ section
Then I see questions about MOQ, lead time, payment, samples, and OEM
And the FAQ section title is visible
```

### Scenario 2.2: Contact FAQ contains real business data

```gherkin
Given I am on the contact page
When I expand the MOQ question
Then the answer mentions "500" and "1,000"
```

---

## Feature 3: About Page FAQ

```
As a buyer evaluating supplier credibility
I want qualification FAQ on the about page
So that I can verify this is a real manufacturer
```

### Scenario 3.1: About page shows factory qualification FAQ

```gherkin
Given I am on the about page
When I scroll to the FAQ section
Then I see questions about manufacturer identity, factory location, export experience, and certifications
```

### Scenario 3.2: About FAQ confirms manufacturer identity

```gherkin
Given I am on the about page
When I expand the question about manufacturer vs trading company
Then the answer confirms direct manufacturer status
And the answer mentions bending machine manufacturing
```

---

## Feature 4: Product Page FAQ

```
As a buyer researching conduit specifications
I want technical FAQ on the product page
So that I can make informed product selection decisions
```

### Scenario 4.1: Product page shows technical FAQ

```gherkin
Given I am on a product market page
When I scroll to the FAQ section
Then I see questions about Schedule 40 vs 80, conduit sizing, bending radius, strength grades, LSZH, and standards
```

### Scenario 4.2: Product FAQ explains Schedule 40 vs 80

```gherkin
Given I am on a product market page
When I expand the Schedule 40 vs 80 question
Then the answer explains the difference in wall thickness and use cases
```

---

## Feature 5: FAQ i18n

```
As a Chinese-speaking buyer
I want FAQ content in my language
So that I can understand the information without translation
```

### Scenario 5.1: Chinese locale shows Chinese FAQ

```gherkin
Given my locale is set to Chinese
When I view a page with a FAQ section
Then the FAQ title is in Chinese
And the questions and answers are in Chinese
```

### Scenario 5.2: English locale shows English FAQ

```gherkin
Given my locale is set to English
When I view a page with a FAQ section
Then all FAQ content is in English
```

---

## Feature 6: FAQ Route Cleanup

```
As the site maintainer
I want the old standalone FAQ route removed
So that there are no orphaned pages or dead links
```

### Scenario 6.1: Old FAQ route no longer exists

```gherkin
Given the standalone /faq page has been removed
When I navigate to /faq
Then I receive a 404 or am redirected to /contact
```

### Scenario 6.2: No dead FAQ links in navigation

```gherkin
Given the FAQ route has been removed
When I check the site header and footer navigation
Then there are no links pointing to /faq
```

### Scenario 6.3: Sitemap does not contain /faq

```gherkin
Given the FAQ route has been removed
When the sitemap is generated
Then it does not contain any /faq URL
```

---

## Feature 7: Core Numbers Unification

```
As the site owner
I want all company numbers to come from a single data source
So that updating one value keeps the entire site consistent
```

### Scenario 7.1: Homepage displays numbers from siteFacts

```gherkin
Given siteFacts contains exportCountries = 20
When I view the homepage
Then the proof/trust elements display "20+" for countries
And the "+" suffix comes from the translation template, not the data
```

### Scenario 7.2: About page displays numbers from siteFacts

```gherkin
Given siteFacts contains established = 2018 and employees = 60
When I view the about page
Then the stats section shows the correct years in business
And the stats section shows "60+" for employees
```

### Scenario 7.3: Translation strings use ICU interpolation

```gherkin
Given a translation string contains "{countries}" placeholder
When the component renders with siteFacts.stats.exportCountries = 20
Then the rendered text shows "20" in place of the placeholder
```

### Scenario 7.4: No hardcoded company numbers remain in source code

```gherkin
Given the codebase under src/ and messages/
When I search for hardcoded instances of key company numbers
Then no TSX component contains literal "2018", "20+", or "60+" as company data
And no translation file contains literal company numbers outside of ICU context
```

---

## Acceptance Criteria (Non-functional)

### FaqSection Design Token Alignment

- [ ] Section uses page container (inherits `max-w-[1080px] px-6`)
- [ ] Section spacing is `py-14 md:py-[72px]` with `section-divider` border-top
- [ ] Title uses `SectionHead` component
- [ ] Accordion container uses `shadow-card` system (not `border`)
- [ ] Individual items have no shadow hover — only open/close interaction
- [ ] Answer text uses `text-sm leading-relaxed text-muted-foreground`

### Accessibility

- [ ] Accordion items are focusable via Tab
- [ ] Enter/Space toggles accordion open/close
- [ ] Radix Accordion provides aria-expanded, aria-controls, role="region"
- [ ] Multi-expand mode (type="multiple")

### Performance

- [ ] FaqSection is a Server Component (accordion is the only Client boundary)
- [ ] No layout shift when accordion expands

### Mobile

- [ ] Accordion displays in single-column on mobile
- [ ] Touch targets for accordion headers meet 44px minimum
- [ ] Tables inside answers scroll horizontally on narrow screens

---

## Scenario-to-Test Mapping Summary

| Scenario | Test Type | Key Assertion |
|----------|-----------|---------------|
| 1.1 | Unit (render) | SectionHead + divider present |
| 1.2 | Unit (render) | N accordion items from translation keys |
| 1.3 | Unit (interaction) | Click expands item |
| 1.4 | Unit (interaction) | Multiple items open |
| 1.5 | Unit (a11y) | Keyboard triggers accordion |
| 1.6 | Unit (SEO) | JSON-LD FAQPage schema generated |
| 2.1 | Integration (render) | Contact page has FAQ section with ordering questions |
| 2.2 | Integration (render) | MOQ answer contains "500" and "1,000" |
| 3.1 | Integration (render) | About page has FAQ section with qualification questions |
| 3.2 | Integration (render) | Manufacturer answer mentions bending machines |
| 4.1 | Integration (render) | Product page has FAQ section with technical questions |
| 4.2 | Integration (render) | Sch 40/80 answer explains wall thickness |
| 5.1 | Unit (i18n) | Chinese locale renders Chinese |
| 5.2 | Unit (i18n) | English locale renders English |
| 6.1 | Integration (routing) | /faq returns 404 or redirects |
| 6.2 | Static (grep) | No /faq links in navigation components |
| 6.3 | Unit (sitemap) | Sitemap excludes /faq |
| 7.1 | Unit (render) | Homepage numbers match siteFacts |
| 7.2 | Unit (render) | About page numbers match siteFacts |
| 7.3 | Unit (render) | ICU interpolation works |
| 7.4 | Static (grep) | No hardcoded company numbers |
