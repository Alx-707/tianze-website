# Motion Polish — Findings (from Vercel Comparison)

## Source
`~/style-extractor/tianze-vs-vercel-motion/motion-comparison.md`

## Key Gaps

1. **Scroll reveal distance too large**: `20px` → should be `12px`
2. **No countUp on proof bar numbers**: Static `20+`, `16-168`, `24/7`, `2006`
3. **Grid decorative system not integrated**: Components exist but not in page.tsx / hero-section.tsx
4. **No continuous micro-animations**: Page is static after reveal completes
5. **Uniform scroll rhythm**: Every section uses identical 0.6s reveal
6. **Nav link transition too slow**: `0.15s` → should be `0.1s`

## Existing Assets
- `GridFrame` component: ready
- `HeroGuideOverlay` component: ready
- `ScrollReveal` supports `direction="scale"`: ready
- CSS tokens for motion: in globals.css
