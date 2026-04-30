# Tianze Color System

## Current status

The role-based color architecture is current. The exact color values are provisional.

This means agents may rely on the role system, but must not treat `#004D9E` or the current steel blue as final brand identity.

## Runtime source

Browser runtime tokens live in `src/app/globals.css`.

Non-CSS surfaces, such as email templates, use the narrow sRGB bridge in `src/config/static-theme-colors.ts`.

That static bridge is one-way only. It exists for email and other non-CSS surfaces that cannot read CSS variables. Browser UI, including footer browser UI, must not import it or treat it as the color truth source.

## Token layers

### Primitive roles

- `--brand-1` to `--brand-12`: Tianze-owned Radix-style brand scale.
- `--neutral-1` to `--neutral-12`: lightly tinted neutral scale.

Use the scale by role:

| Steps | Role |
| --- | --- |
| 1-2 | App and subtle backgrounds |
| 3-5 | Component backgrounds, hover, selected states |
| 6-8 | Borders, interactive borders, focus rings |
| 9-10 | Solid action surfaces and action hover |
| 11-12 | Low and high emphasis brand text |

### Semantic roles

Components should consume semantic tokens:

- `--background`
- `--foreground`
- `--card`
- `--primary`
- `--primary-dark`
- `--accent`
- `--muted`
- `--muted-foreground`
- `--border`
- `--ring`
- `--success-*`
- `--warning-*`
- `--error-*`
- `--info-*`

## Surface boundaries

- Production browser UI uses semantic tokens and CSS variables from `src/app/globals.css`.
- Non-CSS and email surfaces use `src/config/static-theme-colors.ts`.
- The static bridge does not become the source of truth for browser rendering.
- If browser UI needs a new color state, add or remap a semantic token in `src/app/globals.css` instead of importing the static bridge.

## Rules for AI agents

- Do not write raw brand hex values in production components.
- Do not use Tailwind raw palette classes for production UI states.
- Do not import Radix Themes for this migration.
- Do not treat the current steel blue as final.
- If the owner asks for a brand color adjustment, change primitive values first and leave component code stable.

## Visual intent

Tianze should look like a credible B2B manufacturer: clear, restrained, precise, and procurement-friendly.

The color system should reduce owner decision load and keep AI-generated UI from drifting into generic SaaS or AI landing-page aesthetics.
