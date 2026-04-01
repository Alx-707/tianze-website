# Inquiry Form Design — Tianze Website

> Ring 3, Task 2.4 | Status: Confirmed by owner (2026-03-30)
> Inputs: Task 2.3 (conversion paths), Ring 1 (personas)

## Form Philosophy

Fewer fields = more submissions. But B2B needs enough info to prepare a meaningful response. Balance: capture what's needed to START a conversation, not close a deal.

## Form Design: One Universal Form (4 Fields)

Owner decision: **all forms use the same 4 fields**. No detailed form, no file upload. Drawings and detailed specs are exchanged in the email conversation after initial contact.

### Universal Inquiry Form

Used everywhere: product pages, contact page, sample requests, equipment inquiries, OEM inquiries.

| Field | Type | Required | Why |
|-------|------|----------|-----|
| Name | Text | Yes | Who to address |
| Email | Email | Yes | Primary response channel |
| Product interest | Pre-selected dropdown | Yes | Auto-filled from page context (e.g., "PVC Conduit — Australia", "Bending Machines", "Custom Manufacturing") |
| Message | Textarea | No | Open for details, not required — lower friction |

**4 fields. ~30 seconds to complete. Maximum conversion.**

### Context-Aware Pre-Fill

The form is the same everywhere, but "Product interest" auto-fills based on where the buyer clicks:

| Page | Pre-filled value |
|------|-----------------|
| PVC Australia page → "Get Quote" | "PVC Conduit — Australian Standard" |
| PVC North America → "Request Samples" | "PVC Conduit — North American Standard" |
| PETG page → "Request Samples" | "PETG Pneumatic Tubes" |
| Equipment page → "Book Consultation" | "Bending Machines" |
| OEM page → "Submit Inquiry" | "Custom Manufacturing / OEM" |
| Homepage → "Get a Quote" | (blank — buyer selects) |
| Contact page | (blank — buyer selects) |

## Form Routing

All inquiries go to **one inbox** (owner confirmed). Split by business line later as volume grows.

| Business line selected | Email to | Auto-reply includes |
|----------------------|---------|-------------------|
| Any | Single company inbox | General acknowledgment + relevant product info link |

## Auto-Reply

Immediate auto-reply on submission:

```
Subject: We received your inquiry — Tianze Pipe Industry

Thank you for contacting Tianze. We've received your inquiry about [product line].

What happens next:
- Our team will review your request within 24 hours
- You'll receive a detailed response via email
- If you requested samples, we'll confirm shipping details

In the meantime, you can:
- Download our product catalog: [link]
- Learn about our manufacturing: [link to About]

Best regards,
Tianze Pipe Industry
Lianyungang, Jiangsu, China
```

## Form UX Rules

| Rule | Rationale |
|------|-----------|
| No CAPTCHA on initial submission | Friction kills B2B conversion. Use honeypot + rate limiting instead |
| Show "What happens next" after submit | Reduces post-submission anxiety |
| Pre-fill product context from page | If they click "Get Quote" on the Australia page, "PVC Conduit — Australia" is pre-selected |
| Mobile-friendly field sizing | B2B buyers sometimes browse on phone first |
| No phone number field required | Email is confirmed primary channel; phone is optional |

---

**Owner confirmed (2026-03-30):**
1. One universal 4-field form everywhere — no detailed variant, no file upload
2. File exchange (CAD/DWG) happens in email conversation, not on website
3. One inbox for all inquiries
4. Auto-reply content accepted as-is
