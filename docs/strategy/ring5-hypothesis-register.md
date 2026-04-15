# Ring 5 Hypothesis Register — Tianze Website

> Operations control document | Status: Prepared pre-launch (2026-03-30)
> Purpose: convert strategy assumptions into a trackable post-launch verification list.

## How to Use This File

- `Metric / signal` says what success or failure will be judged by.
- `Data source` says where the evidence comes from.
- `First review` is the first sensible checkpoint, not the final verdict.
- If a hypothesis is falsified, the next step is to update the originating strategy doc, not just note the result.

## Hypothesis Register

| ID | Ring | Hypothesis | Metric / signal | Data source | First review |
|----|------|------------|-----------------|-------------|--------------|
| H01 | Ring 1 | End distributors convert better on the website than trading-company-type leads | Quote rate and close rate by lead type | Inquiry log + CRM/manual deal tracking | After 15 qualified inquiries |
| H02 | Ring 1 | Transparent certification disclosure does not scare buyers away | Inquiry rate from pages using honest certification wording remains healthy | GA4 page-to-inquiry conversion + inquiry count | 30 days after launch |
| H03 | Ring 1 | Tianze's equipment-manufacturer differentiation remains largely uncontested | Competitor sites still do not claim the same machine-to-product story | Quarterly manual competitor review | First quarterly review |
| H04 | Ring 1 | Company-level value proposition works better than leading with line-specific value propositions | Homepage CTR into line pages and inquiry assists outperform alternative framing | GA4 homepage clicks + assisted conversions | 30 days |
| H05 | Ring 1 | Persona segmentation matches actual inquiry mix | Actual inquiries cluster around the 5 planned buyer types | Form context + manual lead tagging | 60 days |
| H06 | Ring 1 | Website form inquiries close better than email/phone-first contacts | Inquiry-to-quote / inquiry-to-order by entry channel | CRM/manual tracking | After 20 total inquiries |
| H07 | Ring 1 | Spec-sheet downloads indicate serious buying intent | Downloaders convert to inquiries/quotes above site average | GA4 download events + CRM/manual matching | 60 days after downloads exist |
| H08 | Ring 1 | Planned decision chains match real browsing behavior | Common user paths broadly match awareness/comparison/decision assumptions | GA4 path exploration | 60 days |
| H09 | Ring 2 | Pipe buyers usually inspect certification or standards content before pricing content | Certification/standards section views precede quote actions more often than price/trade-term views | GA4 events + path exploration | 60 days |
| H10 | Ring 2 | Equipment buyers arrive with high intent rather than needing broad education | Equipment traffic shows deep spec/CTA engagement and low shallow-bounce behavior | GA4 page engagement + CTA events | 60 days |
| H11 | Ring 2 | Organic Google traffic enters earlier in the decision journey than direct/referral traffic | Organic sessions consume more educational/comparison content first | GA4 source/medium + path analysis | 60 days |
| H12 | Ring 2 | Three-line structure does not confuse single-product buyers | Buyers still reach the correct line quickly without excessive cross-line bouncing | GA4 navigation paths + click depth | 30 days |
| H13 | Ring 2 | Buyers do not need heavy cross-guidance between lines | Low abandonment despite minimal cross-links | GA4 path data + heat/click review if available | 60 days |
| H14 | Ring 2 | Topic-cluster structure improves ranking for target keywords | Target pages and support articles gain impressions and rankings over time | Google Search Console | 90 days |
| H15 | Ring 2 | Blog content can drive meaningful qualified traffic in this niche | Blog-generated sessions produce product-page assists or direct inquiries | GSC + GA4 assisted conversions | 90 days |
| H16 | Ring 2 | Selective Chinese localization is sufficient at launch | `/zh/` traffic does not show strong unmet demand for market-specific export pages | GA4 locale/path analysis | 90 days |
| H17 | Ring 3 | Verifiable claims convert better than aspirational claims | Sections with proof-heavy copy drive stronger CTA engagement | GA4 section/CTA analysis, qualitative sales feedback | 45 days |
| H18 | Ring 3 | Per-line tone differences do not fragment the brand experience | No recurring confusion about what Tianze is or what it sells | Inquiry content review + owner feedback | After first 20 inquiries |
| H19 | Ring 3 | Transparent certification timelines do not reduce inquiry rate | Pages with explicit in-progress certification language still convert | GA4 page-to-inquiry conversion | 45 days |
| H20 | Ring 3 | Level 2-5 trust signals adequately compensate for missing Level 1 certifications in many cases | Buyers continue to request samples/quotes without dropping at the trust stage | Inquiry volume + sales conversation notes | 60 days |
| H21 | Ring 3 | The 2-click-to-inquiry rule improves conversion | High-intent pages show short paths to inquiry and low CTA friction | GA4 CTA funnels | 30 days |
| H22 | Ring 3 | Free-sample CTA is a better first step for pipes than direct quote CTA | Sample CTA generates more qualified first contacts than direct quote CTA on pipe pages | CTA split by entry point + later quote rate | 45 days |
| H23 | Ring 3 | Short 4-field form lifts submissions without hurting lead quality | Submission rate rises while qualified-inquiry rate stays acceptable | Form analytics + CRM/manual qualification | 30 days |
| H24 | Ring 3 | Product-interest routing improves response relevance and speed | Response time and owner-perceived relevance improve after routing is live | Inbox workflow + manual service review | 30 days |

## Review Cadence

| Time window | What to review |
|-------------|----------------|
| First 30 days | H02, H04, H12, H21, H23, H24 |
| First 45-60 days | H05, H08-H11, H17-H20, H22 |
| First 90 days | H14-H16 |
| Quarterly | H03 and any unresolved hypotheses |

## Required Tracking Before Launch

To make this register usable, Ring 4 should preserve or add:

- Inquiry source and page-context capture
- Product-interest context in the form
- CTA click events for sample, quote, consultation
- Download tracking for spec sheets
- Search Console coverage for target pages and blog posts
