# Behavioral Specifications: Batch 3 — FAQ Redesign + Core Numbers

> Design spec: `docs/superpowers/specs/2026-03-25-batch3-faq-numbers-design.md`
> Each scenario maps to 1 Red task (failing test) + 1 Green task (implementation).

---

## Feature 1: FAQ Page Content

```
As a B2B buyer evaluating PVC conduit suppliers
I want answers to common purchasing, technical, and qualification questions
So that I can make an informed decision without waiting for a sales reply
```

### Scenario 1.1: Buyer sees five PVC-specific categories

```gherkin
Given I am on the FAQ page
When the page loads
Then I see exactly 5 category sections:
  | Category                         |
  | Ordering & Purchasing            |
  | Certifications & Standards       |
  | Technical Selection              |
  | Installation & Application       |
  | Factory & Supplier Qualifications|
```

### Scenario 1.2: Buyer reads ordering FAQ with real business data

```gherkin
Given I am on the FAQ page
When I expand the question "What is the minimum order quantity (MOQ)?"
Then the answer mentions "500" and "1000"
And the answer mentions the quantity depends on pipe type
```

### Scenario 1.3: Buyer reads certification FAQ

```gherkin
Given I am on the FAQ page
When I expand the question about certifications held
Then the answer mentions "ISO 9001:2015"
And the answer mentions the certificate number "240021Q09730R0S"
```

### Scenario 1.4: Buyer reads technical FAQ about conduit selection

```gherkin
Given I am on the FAQ page
When I expand the question about Schedule 40 vs Schedule 80
Then the answer explains the difference in wall thickness
And the answer explains when each type is appropriate
```

### Scenario 1.5: Buyer reads factory qualification FAQ

```gherkin
Given I am on the FAQ page
When I expand the question "Are you a manufacturer or trading company?"
Then the answer confirms direct manufacturer status
And the answer mentions bending machine manufacturing capability
```

---

## Feature 2: FAQ Page Navigation & Interaction

```
As a B2B buyer
I want to quickly find relevant questions
So that I don't waste time scrolling through unrelated content
```

### Scenario 2.1: Buyer jumps to category via index

```gherkin
Given I am on the FAQ page
When I click a category label in the category index
Then the page scrolls to the corresponding category section
```

### Scenario 2.2: Buyer expands a question

```gherkin
Given I am on the FAQ page
And all questions are initially collapsed
When I click on a question
Then the answer expands and becomes visible
And a visual indicator shows the question is open
```

### Scenario 2.3: Buyer collapses an expanded question

```gherkin
Given I am on the FAQ page
And a question is expanded
When I click on the same question again
Then the answer collapses and is no longer visible
```

### Scenario 2.4: Multiple questions can be open simultaneously

```gherkin
Given I am on the FAQ page
And I have expanded one question
When I click on a different question
Then both questions remain expanded
```

### Scenario 2.5: Buyer navigates accordion via keyboard

```gherkin
Given I am on the FAQ page
When I use Tab to focus on a question
And I press Enter or Space
Then the question expands or collapses
```

### Scenario 2.6: Buyer clicks FAQ CTA to contact

```gherkin
Given I am on the FAQ page
When I scroll to the bottom
Then I see a call-to-action section with a contact button
And the contact button links to the contact page
```

---

## Feature 3: FAQ Page i18n

```
As a buyer who reads Chinese
I want to view FAQ content in my language
So that I can understand the information without translation
```

### Scenario 3.1: Chinese buyer views FAQ in Chinese

```gherkin
Given my locale is set to Chinese
When I visit the FAQ page
Then the page title is displayed in Chinese
And the category names are displayed in Chinese
And the questions and answers are in Chinese
```

### Scenario 3.2: English buyer views FAQ in English

```gherkin
Given my locale is set to English
When I visit the FAQ page
Then the page title is "Frequently Asked Questions"
And all content is in English
```

---

## Feature 4: FAQ Schema Structured Data

```
As a search engine crawler
I want FAQ structured data on the page
So that FAQ rich results appear in search listings
```

### Scenario 4.1: FAQ page generates FAQPage schema

```gherkin
Given I am on the FAQ page
When the page renders
Then the page contains JSON-LD structured data of type "FAQPage"
And the structured data contains all questions and answers from the page
```

---

## Feature 5: Core Numbers Unification

```
As the site owner
I want all company numbers (founding year, export countries, employees)
  to come from a single data source
So that updating one value keeps the entire site consistent
```

### Scenario 5.1: Homepage displays numbers from siteFacts

```gherkin
Given siteFacts contains exportCountries = 20
When I view the homepage
Then the proof/trust elements display "20+" for countries
And the "+" suffix comes from the translation template, not the data
```

### Scenario 5.2: About page displays numbers from siteFacts

```gherkin
Given siteFacts contains established = 2018 and employees = 60
When I view the about page
Then the stats section shows the correct years in business (calculated from 2018)
And the stats section shows "60+" for employees
```

### Scenario 5.3: Translation strings use ICU interpolation

```gherkin
Given a translation string contains "{countries}" placeholder
When the component renders with siteFacts.stats.exportCountries = 20
Then the rendered text shows "20" in place of the placeholder
And no literal company numbers are hardcoded in the translation string
```

### Scenario 5.4: Chinese pages use same data source

```gherkin
Given my locale is set to Chinese
When I view pages that display company numbers
Then the numbers match the English version exactly
And the numbers come from the same siteFacts source
```

### Scenario 5.5: No hardcoded company numbers remain in source code

```gherkin
Given the codebase under src/ and messages/
When I search for hardcoded instances of key company numbers
Then no TSX component contains literal "2018", "20+", or "60+" as company data
And no translation file contains literal company numbers outside of ICU context
```

---

## Acceptance Criteria (Non-functional)

### Layout & Design Token Alignment

- [ ] FAQ page container uses `max-w-[1080px] px-6` (not `container px-4`)
- [ ] Section spacing is `py-14 md:py-[72px]`
- [ ] H1 uses precise typography params (36/48px extrabold with tracking)
- [ ] Section titles use `SectionHead` component
- [ ] Q&A groups use `shadow-card` system (not `border`)
- [ ] Bottom CTA uses full-width dark pattern (`bg-primary`, `on-dark` buttons)
- [ ] No GridFrame decoration (content page)
- [ ] Loading skeleton matches new layout structure

### Accessibility

- [ ] Accordion items are focusable via Tab
- [ ] Enter/Space toggles accordion open/close
- [ ] Accordion uses appropriate ARIA attributes (expanded/collapsed state)
- [ ] Category index links are keyboard-navigable

### Performance

- [ ] FAQ page loads without layout shift (CLS < 0.1)
- [ ] Accordion interactions respond within 100ms

### Mobile

- [ ] All 5 categories display in single-column layout on mobile
- [ ] Category index wraps gracefully on narrow screens
- [ ] Touch targets for accordion headers meet 44px minimum

---

## Scenario-to-Test Mapping Summary

| Scenario | Test Type | Key Assertion |
|----------|-----------|---------------|
| 1.1 | Unit (render) | 5 category sections present |
| 1.2 | Unit (render) | MOQ answer contains "500" and "1000" |
| 1.3 | Unit (render) | Cert answer contains ISO number |
| 1.4 | Unit (render) | Sch 40/80 answer has comparison content |
| 1.5 | Unit (render) | Manufacturer answer mentions bending machines |
| 2.1 | Unit (link) | Category index href matches section id |
| 2.2 | Unit (interaction) | Click expands accordion item |
| 2.3 | Unit (interaction) | Click collapses expanded item |
| 2.4 | Unit (interaction) | Multiple items open simultaneously |
| 2.5 | Unit (a11y) | Keyboard triggers accordion |
| 2.6 | Unit (link) | CTA button href = /contact |
| 3.1 | Unit (i18n) | Chinese locale renders Chinese content |
| 3.2 | Unit (i18n) | English locale renders English content |
| 4.1 | Unit (SEO) | JSON-LD contains FAQPage type + all Q&As |
| 5.1 | Unit (render) | Homepage numbers match siteFacts values |
| 5.2 | Unit (render) | About page numbers match siteFacts values |
| 5.3 | Unit (render) | Translation interpolation works correctly |
| 5.4 | Unit (i18n) | Chinese numbers match English numbers |
| 5.5 | Static analysis | Grep finds no hardcoded company numbers |
