# Lane 03 - UI / Performance / Accessibility

## Verdict

Local UI smoke and Lighthouse lab checks are strong. The site is not failing on basic rendering, navigation, no-JS HTML contract, contact smoke, or home-page lab performance.

The lane does not prove deployed Cloudflare performance or real-user field data.

## Runtime checks

| Check | Result |
| --- | --- |
| `CI=1 pnpm test:release-smoke` | 45 passed |
| `pnpm perf:lighthouse` | passed in the earlier run evidence; current `.lighthouseci` artifacts available |
| Local Lighthouse `/en` | performance 0.96-0.98, accessibility 1.00, best-practices 0.96, SEO 1.00 |
| Local Lighthouse `/zh` | performance 0.97-0.98, accessibility 1.00, best-practices 0.96, SEO 1.00 |

## Interpretation

This is enough to say the local user-facing shell is healthy. It is not enough to say the production site is fast for real buyers, because CrUX/Search Console/Cloudflare deployed proof was outside current credentials.

## Findings owned by this lane

No standalone UI/performance/accessibility finding was promoted from this lane.

Buyer-visible placeholder product assets are recorded under Lane 04 because the highest impact is conversion trust, not layout mechanics.

## Evidence artifacts

- `evidence/03-ui-performance-accessibility/lighthouse-en-run1.json`
- `evidence/03-ui-performance-accessibility/lighthouse-zh-run1.json`

