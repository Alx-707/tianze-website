# Asset Processing Strategy — Tianze Website

> Ring 3, Task 2.6 | Status: Confirmed by owner (2026-03-30)
> Inputs: Ring 1 (brand positioning), design system (TIANZE-DESIGN-TOKENS.md)

## Available Raw Assets (Owner Confirmed)

7 types of assets available, all need enhancement:

| Type | Available | Enhancement needed |
|------|-----------|-------------------|
| Factory exterior/workshop photos | Yes | Color grading, brand alignment |
| Product photos (PVC fittings) | Yes | Background cleanup, consistent framing |
| Product photos (PETG tubes) | Yes | Transparency showcase, clean background |
| Equipment photos (bending machines) | Yes | In-context + isolated shots |
| Product spec sheets / data tables | Yes | Format into downloadable PDFs |
| Certification certificates (ISO) | Yes | High-res scan, consistent framing |
| Factory/production process video | Yes | Editing, brand overlay |

## Processing Standards

### Brand Visual Alignment

Reference: `docs/impeccable/system/TIANZE-DESIGN-TOKENS.md`
- Primary: Steel Blue #004d9e
- Aesthetic: Industrial Steel Blue + Vercel craft
- Personality: Precise. Substantial. Trustworthy.

**Core principle**: Photos should feel like "our factory, but polished" — not over-produced stock photography. Authenticity reinforces the manufacturing credibility narrative.

### Per-Asset-Type Standards

#### Product Photos (PVC Fittings)

| Aspect | Standard |
|--------|---------|
| Background | Clean white or light gray (#F5F5F5) |
| Lighting | Even, soft diffused, no harsh shadows |
| Angles | Front + 45-degree + detail (bell end/socket) — minimum 3 per product |
| Resolution | Minimum 2000px on longest edge |
| Format | WebP for web, original PNG/TIFF archived |
| Consistency | Same background, same lighting, same framing across all products |
| Annotation | Dimension callouts, material labels, standard compliance marks on product photos — owner wants rich information overlay, not bare product shots |

#### Product Photos (PETG Tubes)

| Aspect | Standard |
|--------|---------|
| Background | White or backlit (to showcase transparency) |
| Lighting | Backlit or side-lit to emphasize transparency and clarity |
| Special | Show cross-section for wall thickness visibility |
| Resolution | Minimum 2000px |

#### Equipment Photos (Bending Machines)

| Aspect | Standard |
|--------|---------|
| In-context shots | Machine on factory floor, operator visible (shows scale) |
| Isolated shots | Machine on clean background for product page |
| Detail shots | Control panel, heating element, bending mechanism |
| Action shots | Machine in operation (bending a pipe) — most powerful |
| Resolution | Minimum 2000px |

#### Factory Photos

| Aspect | Standard |
|--------|---------|
| Exterior | Factory building, signage, grounds — daylight |
| Workshop | Production lines, organized and clean |
| Team | Group photo or individual specialists at work |
| Color grading | Align to brand palette — slightly cool tones, not oversaturated |
| Authenticity | Real factory, not staged. Clean but not sterile |

#### Certification Scans

| Aspect | Standard |
|--------|---------|
| Resolution | 300 DPI minimum |
| Framing | Consistent border, white background |
| Format | PDF for download, WebP for display |

#### Spec Sheet PDFs

| Aspect | Standard |
|--------|---------|
| Template | Branded header (Steel Blue), company logo, contact info |
| Content | Product dimensions, tolerances, material specs, standards compliance |
| Format | A4 PDF, downloadable from product pages |
| One per | Product family × market standard |

## Processing Priority

| Priority | Assets | Why |
|----------|--------|-----|
| P0 | Product photos (PVC) — at least hero shots | Product pages need them to function |
| P0 | ISO certificate scan | Trust bar needs it |
| P1 | Equipment photos (bending machines) | Equipment page content depends on these |
| P1 | Factory photos (exterior + workshop) | About page credibility |
| P1 | Spec sheet PDF template | Product pages need downloadable specs |
| P2 | PETG product photos | New page, can launch with fewer photos initially |
| P2 | Production process video | High impact but higher production effort |
| P2 | Team photos | Nice-to-have for about page |

## Processing Workflow

```
Owner provides raw assets
    ↓
Claude reviews and categorizes
    ↓
Claude produces processing brief per asset
(specific crop, background, color adjustments described)
    ↓
Owner processes using image editing tools
(or outsources to image editing service)
    ↓
Claude reviews processed results against standards
    ↓
Assets deployed to website
```

**Note**: Claude can specify what needs to be done but cannot execute image processing. The processing brief serves as instructions for whoever does the actual editing.

---

**Owner confirmed (2026-03-30):**
1. Standards direction confirmed — add richer information annotations (dimensions, material labels, compliance marks)
2. Asset processing: owner + AI image generation tools. Claude provides asset requirements and processing briefs.
3. Priority order P0/P1/P2 confirmed
