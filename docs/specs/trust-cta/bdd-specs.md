# Batch 2: Trust Enhancement + CTA Optimization — Behavioral Specifications

> Design doc: `docs/superpowers/specs/2026-03-25-trust-cta-design.md`
> Implementation plan: `docs/superpowers/plans/2026-03-25-trust-cta-optimization.md`
> Date: 2026-03-25

---

## Feature 1: Hero Positioning Statement (H-1)

  As a B2B buyer landing on the homepage
  I want the hero to immediately communicate what makes this manufacturer different
  So that I can decide within seconds whether this supplier is worth evaluating further

### Scenario 1.1: Hero title leads with bending machine differentiator (English)

    Given I am viewing the homepage in English
    Then the hero title reads "We Build the Machines That Make the Pipes."
    And the subtitle reads "PVC conduit bends & fittings, factory direct from a bending equipment manufacturer. Full vertical integration from R&D to finished product."

### Scenario 1.2: Hero title leads with bending machine differentiator (Chinese)

    Given I am viewing the homepage in Chinese
    Then the hero title reads "造设备的人，做管件。"
    And the subtitle reads "PVC电工套管弯头及配件，从弯管设备研发到成品管件的垂直整合制造商。"

### Scenario 1.3: Eyebrow adds founding year alongside ISO certification

    Given I am viewing the homepage in English
    Then the eyebrow text reads "ISO 9001 Certified · Est. 2018"

    Given I am viewing the homepage in Chinese
    Then the eyebrow text reads "ISO 9001 认证 · 始于 2018"

### Scenario 1.4: CTA buttons remain unchanged

    Given I am viewing the homepage
    Then the primary CTA still reads "Get a Quote" (en) / "获取报价" (zh)
    And the secondary CTA still reads "View Product Catalog" (en) / "查看产品目录" (zh)
    And the primary CTA links to the contact page
    And the secondary CTA links to the products page

### Scenario 1.5: Proof strip values reflect corrected data

    Given I am viewing the hero proof strip
    Then the countries stat shows "20+" (not "100+")
    And the Est. stat shows "2018" (not "2006")

### Scenario 1.6: Existing hero tests pass without modification

    Given the hero tests use translation key names (not literal strings)
    When I run the hero test suite
    Then all tests pass because the component renders keys, and only the translation values changed

---

## Feature 2: Two-Tier Certification Display (M-7)

  As an informed B2B buyer
  I want certifications clearly separated from standards compliance
  So that I know which claims are verified by certificate and which are product compliance statements

### Scenario 2.1: ISO 9001 displays as a verified certification with certificate number

    Given I am viewing the quality section on the homepage
    Then I see an ISO 9001:2015 entry with a checkmark icon
    And I see the certificate number "240021Q09730R0S"
    And I see a "Certified" badge

### Scenario 2.2: Four standards display as compliance labels (not certifications)

    Given I am viewing the quality section on the homepage
    Then I see 4 standards compliance labels: ASTM D1785 / UL 651, AS/NZS 61386, IEC 61386, NOM-001-SEDE
    And these labels have lighter visual weight than the ISO 9001 certification
    And they do not have a checkmark icon

### Scenario 2.3: AS/NZS 61386 shows "Applying" status

    Given I am viewing the standards compliance labels
    Then AS/NZS 61386 has an amber "Applying" badge
    And the other 3 standards show a "Compliant" label

### Scenario 2.4: Certification display is translated in Chinese

    Given I am viewing the quality section in Chinese
    Then the section heading reads "认证与标准"
    And the ISO 9001 badge reads "已认证"
    And the compliance label reads "符合标准"
    And the AS/NZS applying label reads "申请中"

### Scenario 2.5: Old flat cert badges no longer render

    Given the QualitySection component has been updated
    Then the old `cert1`, `cert2`, `cert3`, `cert4` translation keys are no longer referenced
    And the old `CERT_KEYS` constant no longer exists in the component

### Scenario 2.6: Logo wall placeholder remains unchanged

    Given I am viewing the quality section
    Then the partner logo placeholder area still displays as before

---

## Feature 3: Contact Page WhatsApp Entry (C-1)

  As a B2B buyer ready to inquire
  I want a WhatsApp contact option on the contact page
  So that I can use my preferred communication channel for initial contact

### Scenario 3.1: WhatsApp row appears in the contact info card

    Given I am viewing the contact page
    Then I see a WhatsApp entry below the phone entry
    And it has a WhatsApp icon, a label, and a number or status message
    And its visual weight matches the email and phone entries

### Scenario 3.2: Placeholder state shows "Coming Soon" with no chat link

    Given the WhatsApp number is the placeholder value (+86-518-0000-0000)
    When I view the contact page
    Then the WhatsApp row shows "Coming Soon" (en) / "即将开通" (zh)
    And there is no "Chat Now" link

### Scenario 3.3: Configured state shows number and chat link

    Given a real WhatsApp number is configured via NEXT_PUBLIC_WHATSAPP_NUMBER
    When I view the contact page
    Then the WhatsApp row shows the configured number
    And a "Chat Now" (en) / "立即聊天" (zh) link appears
    And the link opens wa.me/{number} in a new tab

### Scenario 3.4: WhatsApp translations are served through getContactCopy helper

    Given the contact page consumes translations through getContactCopy.ts
    When the page renders
    Then WhatsApp label, chatNow, and comingSoon texts come from the copy model
    And the copy model exposes a `panel.whatsapp` object with those 3 fields

### Scenario 3.5: WhatsApp row is translated in Chinese

    Given I am viewing the contact page in Chinese
    Then the WhatsApp label shows "WhatsApp"
    And the "Chat Now" link reads "立即聊天"
    And the "Coming Soon" placeholder reads "即将开通"

---

## Feature 4: Product Page Inquiry Pre-fill (C-3) — No Action Required

  As a buyer viewing a product page
  I want the inquiry drawer to pre-fill the product I am viewing
  So that I do not have to re-enter the product name when requesting a quote

### Scenario 4.1: InquiryDrawer pre-fills product name (already implemented)

    Given the InquiryDrawer component already exists on product pages
    And it pre-fills the product name and slug from context
    Then no additional work is required for this scenario
    And this feature is documented as already satisfied

---

## Acceptance Criteria (Cross-cutting)

### Accessibility
- [ ] ISO 9001 checkmark icon has `aria-hidden` (decorative)
- [ ] Standards compliance labels are readable by screen readers
- [ ] WhatsApp "Chat Now" link has accessible text that conveys it opens WhatsApp
- [ ] WhatsApp icon has appropriate `aria-hidden` or alt text treatment
- [ ] Contact page WhatsApp row follows the same heading/structure pattern as email and phone

### Design System Compliance
- [ ] ISO 9001 badge uses `bg-primary/10` and `text-primary` (project design tokens)
- [ ] AS/NZS "Applying" badge uses amber scale (`bg-amber-100`, `text-amber-700` light / `bg-amber-900/30`, `text-amber-400` dark)
- [ ] Standards compliance labels use `bg-muted/50` (lighter weight than certification)
- [ ] WhatsApp contact row uses the same icon container pattern (`h-10 w-10 rounded-lg bg-primary/10`) as email and phone
- [ ] No hardcoded color hex values; all from design tokens or Tailwind scale

### i18n
- [ ] All new user-facing strings use translation keys (no hardcoded English)
- [ ] Translation keys are added to both `messages/en/critical.json` and `messages/zh/critical.json`
- [ ] Legacy flat files (`messages/en.json`, `messages/zh.json`) are auto-regenerated by pre-commit hook
- [ ] `pnpm i18n:full` passes after all keys are added

### Regression Safety
- [ ] Existing hero tests pass without modification (they test key names, not literal copy)
- [ ] Existing quality section tests are updated to match the new two-tier structure
- [ ] Existing contact page tests continue to pass with the new WhatsApp row
- [ ] No hydration mismatches introduced by the changes

### Business Accuracy
- [ ] Founded year shows 2018, not 2006
- [ ] Export countries shows 20+, not 100+
- [ ] Only ISO 9001 is labeled "Certified"; other standards are "Compliant" or "Applying"
- [ ] No unverified claims are presented as certifications

---

## Scenario-to-Task Traceability

| Scenario | Plan Task | Type |
|----------|-----------|------|
| 1.1–1.6 | Task 1: Update Hero Copy (H-1) | Green (translation-only, existing tests cover) |
| 2.1–2.6 | Task 2: Replace Certification Badges (M-7) | Red + Green |
| 3.1–3.5 | Task 3: Add WhatsApp Entry (C-1) | Red + Green |
| 4.1 | — | Already satisfied, no task |
| Cross-cutting | Task 4: Dev Server Verification + Final CI | Verification |
