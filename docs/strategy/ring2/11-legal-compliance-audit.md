# Legal/Compliance Audit — Tianze Website

> Ring 2, Task 11 | Status: Draft
> Inputs: Task 7 (information architecture), brand positioning (Option A certification language)

## 1. Existing Legal Page Audit

### 1.1 Privacy Policy (`content/pages/en/privacy.mdx`)

**Structure**: 10 sections with table of contents. Covers information collection, use, sharing, security, retention, rights, children's privacy, third-party links, changes, and contact.

**Findings:**

| Area | Status | Detail |
|------|--------|--------|
| Placeholder text | CRITICAL | `[Company Name]`, `[company-domain].com`, `[Company Address]`, `[EU Representative Contact]` — all unfilled throughout both EN and ZH versions |
| GDPR coverage | Partial | Legal basis section exists (consent, contract, legitimate interest, legal obligation). Data subject rights listed. BUT: no DPO named, no EU representative actually identified, no supervisory authority specified |
| CCPA coverage | Partial | Section exists listing CCPA rights (know, opt-out of sale, access, non-discrimination). BUT: no "Do Not Sell" mechanism described, no CCPA-specific data categories listed, no financial incentive disclosure |
| Australian Privacy Act | MISSING | No mention of APPs (Australian Privacy Principles), no cross-border disclosure notice specific to Australia, no reference to OAIC complaint rights |
| Cookie disclosure | Adequate | Cookie table with 4 categories (Essential, Preference, Analytics, Marketing) with purposes and durations. References consent banner |
| International transfers | Adequate | Mentions data transferred to China, lists safeguards (SCCs, DPAs, security measures) |
| Data retention | Adequate | Specific retention periods stated (5 years business, 2 years inquiry, 26 months analytics) |
| Children's privacy | Adequate | Age threshold 16, standard language |
| Dates | STALE | "Effective: January 1, 2024" and "Last Updated: April 1, 2024" — over 2 years old, no evidence of annual review |
| Chinese version | Exists | `content/pages/zh/privacy.mdx` — parallel structure, same placeholders unfilled |

### 1.2 Terms of Service (`content/pages/en/terms.mdx`)

**Structure**: 14 sections covering acceptance, services, orders, payment, shipping, warranty, liability, IP, confidentiality, termination, governing law, disputes, export compliance, general provisions.

**Findings:**

| Area | Status | Detail |
|------|--------|--------|
| Placeholder text | CRITICAL | Same `[Company Name]`, `[company-domain].com`, `[Company Address]`, `[Company Phone]` unfilled |
| B2B trade terms | Good | Incoterms 2020 (FOB, CIF, EXW), payment methods (T/T, L/C, D/P), lead times, deposit terms — appropriate for B2B export |
| Warranty | Adequate | 12-month warranty, claims process with 15-day window, remedies described |
| Limitation of liability | Adequate | Cap at purchase price, exclusion of consequential damages, force majeure clause |
| IP protection | Basic | Covers website content IP and customer specification confidentiality. Owner has deferred deeper IP/NDA content — acceptable for now |
| Confidentiality | Adequate | 5-year survival clause, mutual obligations |
| Export compliance | Present but generic | References EAR, ITAR, UN sanctions. ITAR is likely irrelevant (PVC pipe fittings are not defense articles). Buyer obligation clause exists |
| Governing law | Adequate | PRC law, CIETAC arbitration (Hong Kong/Beijing), English/Chinese options |
| Product liability disclaimer | MISSING | No explicit disclaimer that products must be installed per local codes, no limitation on fitness for particular purpose |
| Dates | STALE | Same stale dates as privacy policy |
| Chinese version | Exists | `content/pages/zh/terms.mdx` — parallel structure, same placeholders |

### 1.3 Cookie Consent Implementation

**Status: IMPLEMENTED and well-structured.**

The site has a full cookie consent system:

- **Banner**: `src/components/cookie/cookie-banner.tsx` — slide-in dialog with Accept All / Reject All / Manage Preferences
- **Categories**: 3 tiers (Necessary always-on, Analytics opt-in, Marketing opt-in)
- **Default**: Conservative — analytics and marketing default to `false` (opt-in, not opt-out)
- **Persistence**: localStorage with versioned schema (`CONSENT_VERSION = 1`)
- **Analytics gating**: `EnterpriseAnalyticsIsland` only loads in production when consent granted
- **i18n**: Full translation support via `cookie` namespace

This implementation is GDPR-aligned (opt-in default, granular control, reject-all option). The cookie consent banner is the one area where the site is ahead of the legal page text.

---

## 2. Gap Identification

### Gap A: Placeholder Text (All Legal Pages)

Both privacy and terms pages are templates with unfilled placeholders. This is the most urgent issue — the pages are live on the site showing `[Company Name]` to visitors.

**Placeholders to fill:**

| Placeholder | Correct value |
|-------------|--------------|
| `[Company Name]` | Lianyungang Tianze Pipe Industry Co., Ltd. (连云港天泽管业有限公司) |
| `[company-domain].com` | Actual domain (e.g., tianzepipe.com or equivalent) |
| `[Company Address]` | Factory address in Lianyungang, Jiangsu |
| `[Company Phone]` | Business phone number |
| `[EU Representative Contact]` | Either appoint one or remove this line (see Gap D) |

### Gap B: Australian Privacy Act Coverage

Australia is a primary target market. The Australian Privacy Principles (APPs) under the Privacy Act 1988 require:

1. **Cross-border disclosure notice** (APP 8): When personal info is transferred to China for processing, the privacy policy must disclose this specifically to Australian users
2. **OAIC complaint rights**: Australian users should know they can complain to the Office of the Australian Information Commissioner
3. **Collection notice** (APP 5): Must state why data is collected, consequences of not providing it, and entities it may be disclosed to

The current privacy policy's "International Data Transfers" section mentions China but doesn't frame it in APP-specific language. Adding 2-3 sentences in the "Your Privacy Rights" section would close this gap.

### Gap C: Cookie Consent Banner vs. Privacy Policy Alignment

The privacy policy mentions "our cookie consent banner" but the cookie categories in the policy (Essential, Preference, Analytics, Marketing) don't exactly match the implementation (Necessary, Analytics, Marketing — no "Preference" category). The privacy policy also lists "Preference" cookies with "1 year" duration that may not exist in the actual implementation.

**Fix**: Align the cookie table in the privacy policy with the actual 3-category implementation.

### Gap D: EU Representative Requirement

The privacy policy references an EU representative but none is appointed. Under GDPR Art. 27, a representative is required only if:
- The company is not established in the EU, AND
- It regularly offers goods/services to EU data subjects or monitors their behavior

**Assessment for Tianze**: The site targets Australia, North America, and Southeast Asia — not the EU. EU traffic would be incidental, not targeted. An EU representative is likely **not required** at this stage.

**Recommendation**: Remove the EU representative line rather than leaving a placeholder. If EU becomes a target market later, revisit.

### Gap E: CCPA "Do Not Sell" Implementation

CCPA requires a "Do Not Sell My Personal Information" link for California residents. The privacy policy mentions CCPA rights but:
- No "Do Not Sell" link exists in the footer or privacy page
- The policy states "We do not sell your personal information" — which is likely true for a B2B inquiry site

**Assessment**: Since Tianze does not sell personal data and doesn't operate an ad-supported model, the risk is low. Adding a clear statement "We do not sell or share your personal information as defined under the CCPA" is sufficient for now.

### Gap F: Product Liability / Fitness Disclaimer

The terms cover warranty and liability limitation but lack:
- **Disclaimer of fitness for particular purpose**: Important for pipe fittings that must meet local building/plumbing codes
- **Installation responsibility**: Buyer is responsible for ensuring products comply with local installation codes
- **Standards compliance ≠ certification language**: The site will use Option A language ("engineered to meet" standards with "certification in progress"). The terms should include a matching disclaimer

**Recommended language** (aligned with Option A from brand positioning):

> Products are manufactured to meet referenced standards. Where specific market certifications are noted as "in progress," buyers should verify current certification status before purchase for projects requiring certified products. Installation must comply with local building codes and regulations. Seller is not liable for non-compliance arising from improper installation or use outside specified applications.

### Gap G: Export Compliance — ITAR Reference

The terms reference ITAR (International Traffic in Arms Regulations), which governs defense articles and services. PVC pipe fittings are not ITAR-controlled items. Including ITAR creates a false impression of defense-industry involvement.

**Fix**: Remove ITAR reference. Keep EAR (which can apply to dual-use goods generally) and sanctions compliance. PVC fittings are likely EAR99 (no license required) but the general compliance clause is still good practice.

### Gap H: Stale Dates and Review Cycle

Both pages show "Document Version: 2.0 / Approved By: Legal Department / Review Cycle: Annual" but the last update was April 2024 — the annual review is overdue.

**Fix**: Update dates when placeholders are filled. Set a realistic review cycle (annual is fine, but it needs to actually happen).

### Gap I: Missing "Inquiry Data" Specificity

The privacy policy describes data collection generally. For a B2B inquiry site, it should specifically mention:
- Contact form data (name, email, company, message)
- Product inquiry data (product interest, quantity, specifications)
- Marketing consent checkbox data

The current "Information You Provide" section partially covers this but could be more specific to the actual forms on the site.

---

## 3. Prioritized Gap List

| Priority | Gap | Description | Recommendation | Effort |
|----------|-----|-------------|----------------|--------|
| **P0** | A: Placeholder text | All legal pages show `[Company Name]` etc. to live visitors | Fill all placeholders with actual company information. Owner must provide domain, address, phone | Low (content fill) |
| **P0** | H: Stale dates | Pages dated April 2024, annual review overdue | Update dates when filling placeholders | Trivial |
| **P1** | F: Product liability disclaimer | No fitness-for-purpose disclaimer, no installation responsibility language | Add disclaimer section to terms, aligned with Option A certification positioning | Low (add ~1 paragraph) |
| **P1** | C: Cookie policy alignment | Privacy policy cookie table doesn't match implementation | Update cookie table to match actual 3-category system (Necessary/Analytics/Marketing) | Trivial |
| **P1** | G: ITAR reference | Incorrect regulatory reference for PVC products | Remove ITAR, keep EAR + sanctions | Trivial |
| **P1** | D: EU representative placeholder | Unfillable placeholder — no EU representative needed for current markets | Remove EU representative line from privacy policy | Trivial |
| **P2** | B: Australian Privacy Act | No APP-specific language for primary target market | Add APP cross-border disclosure notice, OAIC complaint rights (2-3 sentences) | Low |
| **P2** | E: CCPA "Do Not Sell" clarity | CCPA section exists but lacks explicit "we do not sell" declaration | Strengthen existing CCPA section with explicit non-sale statement | Trivial |
| **P2** | I: Inquiry data specificity | Data collection section is generic, not tailored to actual site forms | Update "Information You Provide" to reference actual contact/inquiry forms | Low |

### Priority definitions for this audit

- **P0**: Currently visible to site visitors as broken/unprofessional. Fix before any marketing traffic.
- **P1**: Legal risk or misrepresentation that could erode buyer trust or create liability exposure. Fix before site launch.
- **P2**: Best-practice improvements for target market compliance. Fix within first quarter of operation.

---

## 4. What Is NOT Needed (Scope Boundaries)

These items were considered and determined unnecessary for Tianze's current situation:

| Item | Why not needed |
|------|---------------|
| Dedicated cookie policy page | Cookie disclosure in privacy policy + consent banner is sufficient for B2B site |
| GDPR Data Protection Officer | Not required — Tianze is not a public authority, doesn't do large-scale systematic monitoring, doesn't process special categories of data at scale |
| Separate CCPA opt-out page | Tianze doesn't sell personal data — statement in privacy policy is sufficient |
| ePrivacy Regulation compliance | EU-specific, not a target market |
| PDPA (Singapore/Thailand) compliance | Southeast Asia privacy laws are less prescriptive for B2B; general privacy policy covers the basics |
| Age verification mechanism | B2B site — children's privacy statement is sufficient, no mechanism needed |
| IP/NDA page | Owner deferred — revisit when OEM/custom manufacturing pages go live |

---

## 5. Implementation Sequence

**Phase 1 (P0 — before any traffic):**
1. Owner provides: company legal name, domain, address, phone
2. Fill all placeholders in EN and ZH versions of both privacy and terms
3. Update effective/review dates
4. Remove EU representative placeholder line

**Phase 2 (P1 — before site launch):**
1. Add product liability/fitness disclaimer to terms (use Option A-aligned language from Gap F)
2. Align cookie table in privacy policy with actual 3-category implementation
3. Remove ITAR from export compliance section

**Phase 3 (P2 — first quarter of operation):**
1. Add Australian Privacy Act language (APP 8 cross-border, OAIC rights)
2. Strengthen CCPA non-sale declaration
3. Tailor data collection section to actual site forms

---

**Note**: This audit covers website legal content only. It is not legal advice. For market-specific regulatory compliance (especially Australian building standards and product certification requirements), professional legal review is recommended before entering each market.
