# Corporate Information

> **Purpose**: Single source of truth for Tianze company data.
> **Audience**: AI agents designing/building website pages.

## File Index

| File | Format | Content | When to Use |
|------|--------|---------|-------------|
| `company-facts.yaml` | YAML | Structured company data (name, location, certs, scale) | Any page needing company info |
| `products.yaml` | YAML | Product catalog with specs, categories, standards | Product pages, navigation |
| `value-copy.md` | Markdown | Marketing copy, value propositions, differentiators | Homepage, About, landing pages |
| `customers.md` | Markdown | Buyer personas, application scenarios, pain points | Solutions pages, targeting |
| `content-gaps.md` | Markdown | Missing content checklist, action items | Before designing any page |

## AI Retrieval Guide

### Quick Lookups

```yaml
# Company name
company-facts.yaml → identity.name_en

# Main products
products.yaml → categories.[category].items

# Value proposition
value-copy.md → Value Propositions section

# Target customer
customers.md → Customer Segments section

# What's missing
content-gaps.md → Status tables
```

### Design Workflow

1. **Before designing a page**: Check `content-gaps.md` for missing content
2. **Need company facts**: Query `company-facts.yaml`
3. **Need product info**: Query `products.yaml`
4. **Need marketing copy**: Query `value-copy.md`
5. **Need user context**: Query `customers.md`

## Data Principles

1. **Single source**: Each fact appears in exactly one file
2. **Structured first**: Use YAML for queryable data, Markdown for prose
3. **Explicit gaps**: Unknown info marked explicitly, not guessed
4. **Bilingual**: CN and EN where applicable

## Maintenance

When updating corporate info:
1. Update the relevant YAML/MD file
2. If adding new content type, update this README
3. If filling a gap, update status in `content-gaps.md`
