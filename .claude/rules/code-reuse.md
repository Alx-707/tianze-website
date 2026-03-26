# Code Reuse

Before creating any new component, hook, or utility function, read `docs/component-registry.md` and check if an existing one already solves the need — either directly or with minor extension.

Rules:
- Prefer composing existing code over creating new
- If you must create something new, update the registry after creation
- Watch for naming collisions: `ProductCard` and `ContactForm` each exist in two locations (see registry)
- Use CSS custom properties (e.g. `var(--color-primary)`) from `globals.css` — never hardcode color hex values, spacing px, or font families. The design token source of truth is `src/app/globals.css`
