import { describe, expect, it } from "vitest";
import { SINGLE_SITE_FACTS } from "@/config/single-site";
import { siteFacts } from "@/config/site-facts";

describe("site-facts", () => {
  it("exports site facts with expected shape", () => {
    expect(siteFacts).toBeTruthy();
    expect(siteFacts).toBe(SINGLE_SITE_FACTS);

    expect(typeof siteFacts.company.name).toBe("string");
    expect(typeof siteFacts.company.established).toBe("number");
    expect(typeof siteFacts.company.yearsInBusiness).toBe("number");
    expect(siteFacts.company.yearsInBusiness).toBeGreaterThan(0);
    expect(typeof siteFacts.company.location.country).toBe("string");
    expect(typeof siteFacts.company.location.city).toBe("string");

    expect(typeof siteFacts.contact.phone).toBe("string");
    expect(typeof siteFacts.contact.email).toBe("string");

    expect(Array.isArray(siteFacts.certifications)).toBe(true);
    expect(typeof siteFacts.stats).toBe("object");
    expect(typeof siteFacts.social).toBe("object");
  });
});
