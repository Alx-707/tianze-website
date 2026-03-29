import fc from "fast-check";
import { describe, expect, it, vi } from "vitest";

import {
  CONTACT_SUBJECTS,
  contactLeadSchema,
  isContactLead,
  isNewsletterLead,
  isProductLead,
  LEAD_TYPES,
  type LeadInput,
} from "../lead-schema";

vi.unmock("zod");

const contactLeadArb = fc.record({
  type: fc.constant(LEAD_TYPES.CONTACT),
  fullName: fc.string({ minLength: 1, maxLength: 24 }),
  email: fc.emailAddress(),
  subject: fc.constantFrom(...Object.values(CONTACT_SUBJECTS)),
  message: fc.string({ minLength: 20, maxLength: 120 }),
  turnstileToken: fc.string({ minLength: 1, maxLength: 48 }),
  company: fc.option(fc.string({ minLength: 1, maxLength: 32 }), {
    nil: undefined,
  }),
  marketingConsent: fc.option(fc.boolean(), { nil: undefined }),
  submittedAt: fc.option(
    fc.date().map((value) => value.toISOString()),
    {
      nil: undefined,
    },
  ),
});

const productLeadArb = fc.record({
  type: fc.constant(LEAD_TYPES.PRODUCT),
  fullName: fc.string({ minLength: 1, maxLength: 24 }),
  email: fc.emailAddress(),
  productSlug: fc.stringMatching(/^[a-z0-9-]{1,24}$/),
  productName: fc.string({ minLength: 1, maxLength: 32 }),
  quantity: fc.oneof(
    fc.integer({ min: 1, max: 10000 }),
    fc.string({ minLength: 1, maxLength: 24 }),
  ),
  company: fc.option(fc.string({ minLength: 1, maxLength: 32 }), {
    nil: undefined,
  }),
  requirements: fc.option(fc.string({ minLength: 1, maxLength: 80 }), {
    nil: undefined,
  }),
  marketingConsent: fc.option(fc.boolean(), { nil: undefined }),
});

const newsletterLeadArb = fc.record({
  type: fc.constant(LEAD_TYPES.NEWSLETTER),
  email: fc.emailAddress(),
});

const leadInputArb: fc.Arbitrary<LeadInput> = fc.oneof(
  contactLeadArb,
  productLeadArb,
  newsletterLeadArb,
);

describe("lead-schema property tests", () => {
  it("type guards are mutually exclusive for any valid LeadInput", () => {
    fc.assert(
      fc.property(leadInputArb, (lead) => {
        const matches = [
          isContactLead(lead),
          isProductLead(lead),
          isNewsletterLead(lead),
        ].filter(Boolean);

        expect(matches).toHaveLength(1);
      }),
    );
  });

  it("contactLeadSchema.safeParse never throws for fuzzed input", () => {
    fc.assert(
      fc.property(
        fc.anything({ maxDepth: 2, maxKeys: 5, maxLength: 5 }),
        (value) => {
          expect(() => contactLeadSchema.safeParse(value)).not.toThrow();
        },
      ),
    );
  });

  it("contactLeadSchema rejects strings that are not email-shaped", () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[a-z]{1,48}$/), (invalidEmail) => {
        const result = contactLeadSchema.safeParse({
          type: LEAD_TYPES.CONTACT,
          fullName: "Jane Doe",
          email: invalidEmail,
          subject: CONTACT_SUBJECTS.OTHER,
          message: "This message is definitely long enough.",
          turnstileToken: "token",
        });

        expect(result.success).toBe(false);
      }),
    );
  });
});
