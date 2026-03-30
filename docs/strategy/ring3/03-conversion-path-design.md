# Conversion Path Design — Tianze Website

> Ring 3, Task 2.3 | Status: Confirmed by owner (2026-03-30)
> Inputs: Task 2.1 (trust system), Task 2.2 (copywriting strategy)

## Design Principle

Buyers arrive with some understanding (Ring 2 confirmed). Conversion paths should be **short**. Goal: inquiry form reachable within 2 clicks from any page.

## CTA Tier System

| Tier | Action | Commitment level | Where |
|------|--------|-----------------|-------|
| **Low** | Download spec sheet / View certification status | Information gathering | Product detail pages |
| **Medium** | Request free samples ("ships in 3 days") | Low-risk testing | All product pages, homepage |
| **High** | Submit inquiry / Book consultation | Ready to engage | All pages, contact page |

## CTA Deployment Matrix

| Page | Low CTA | Medium CTA | High CTA |
|------|---------|-----------|----------|
| Homepage | — | "Request Free Samples" | "Get a Quote" |
| Products hub | — | — | "Contact Us" (light) |
| PVC by market | "Download Spec Sheet" | "Request Free Samples" | "Get a Quote for [Market]" |
| PETG pneumatic | "Download Specs" | "Request Samples" | "Technical Consultation" |
| Equipment | "Request Specifications" | — | "Book Consultation" |
| Custom manufacturing | — | "Start with Trial Order" | "Submit Your Drawing" |
| About | — | "Request Samples" | "Visit Our Factory" |
| Contact | — | — | Full inquiry form (primary page purpose) |
| Blog | — | — | Sidebar: "Have Questions? Contact Us" |
| FAQ | — | "Request Samples" | "Still Have Questions? Contact Us" |

## Conversion Flows

### Flow 1: Sample-First (Pipes — Primary)

```
Homepage → Products/Pipes → PVC by Market
    ↓                            ↓
"Request Free Samples"     "Request Free Samples"
    ↓                            ↓
    └──────── Contact form (pre-filled: "Sample request") ────────┘
```

### Flow 2: Quote-First (Pipes — Direct)

```
Homepage → Products/Pipes → PVC by Market
    ↓                            ↓
"Get a Quote"              "Get a Quote for [Market]"
    ↓                            ↓
    └──────── Contact form (pre-filled: product line + market) ───┘
```

### Flow 3: Consultation-First (Equipment)

```
Homepage → Products/Equipment → Bending Machines
                                      ↓
                              "Book Technical Consultation"
                                      ↓
                              Contact form (pre-filled: "Equipment consultation")
```

### Flow 4: Drawing Submission (Custom/OEM)

```
Homepage → Products/Custom → Custom Manufacturing
                                   ↓
                            "Submit Your Drawing"
                                   ↓
                            Contact form (with file upload, pre-filled: "Custom inquiry")
```

## Persistent Elements

| Element | Behavior | Purpose |
|---------|----------|---------|
| Header CTA button | "Contact" — always visible in nav | 1-click to inquiry from anywhere |
| Floating WhatsApp | Bottom-right, persistent | Secondary channel for quick questions |
| Email in footer | Always visible | Lowest-friction contact for copy-paste |

## 2-Click Rule Verification

| Starting page | Click 1 | Click 2 | Reaches inquiry? |
|--------------|---------|---------|-----------------|
| Homepage | "Get a Quote" | — | Yes (1 click) |
| Homepage | "Products" | Any CTA on product page | Yes (2 clicks) |
| Products hub | Product line card | CTA on product page | Yes (2 clicks) |
| PVC by market | "Request Samples" | — | Yes (1 click) |
| Equipment | "Book Consultation" | — | Yes (1 click) |
| Blog article | Header "Contact" | — | Yes (1 click) |
| About | "Request Samples" | — | Yes (1 click) |

All pages pass the 2-click rule.

## CTA Copy Rules

| Rule | Example |
|------|---------|
| Use result language, not action language | "Get Your Custom Quote" not "Submit Form" |
| Include what happens next | "Request Samples — Ships in 3 Days" |
| Match to page context | "Get a Quote for Australian Standard" not generic "Contact Us" |
| Low-barrier CTA always available | Even on high-commitment pages, offer a lighter option |

---

**Owner confirmed (2026-03-30):**
1. Sample-first flow confirmed — samples are standard pre-order procedure
2. File upload on website NOT needed — drawing exchange happens in email conversation, not on the form
3. No unnatural flows flagged
