# Project Context

## Purpose

Tianze Pipe Industry (天泽管业) Official Website - A professional corporate website for Lianyungang Tianze Pipe Industry Co., Ltd., a specialized manufacturer of PVC electrical conduits, PVC bend pipes, and PETG pneumatic tube systems serving global markets.

## Business Profile

- **Company**: Lianyungang Tianze Pipe Industry Co., Ltd. (连云港天泽管业有限公司)
- **Location**: Guanyun County, Lianyungang, Jiangsu, China
- **Established**: 2018 (operations), 2023 (formal registration)
- **Scale**: ~100 acres factory, 60 employees, 10-person core technical team
- **Certification**: ISO 9001:2015 (Certificate: 240021Q09730R0S, March 2024)

## Core Business

### Product Categories
1. **Equipment**: PVC bending machines (semi-auto/full-auto), expanders, cutting machines, custom molds
2. **PVC Pipes**: Bend pipes (bell-end, double-socket), straight pipes, elbows, expansion connectors, electrical conduits
3. **Specialty Tubes**: Pneumatic logistics tubes (PVC/PMMA/PETG) for medical/industrial systems

### Core Competencies
1. Bend pipe manufacturing system capability (equipment → mold → process → fittings)
2. Bending equipment R&D and manufacturing
3. Non-standard customization and rapid prototyping (AS/NZS, UL, GB standards)
4. Pneumatic logistics tube services
5. Integrated in-house manufacturing system

### Markets
- **Export Countries**: 100+ countries/regions
- **Primary Markets**: Eastern Europe, North America, South America, Middle East, Oceania, Africa, Southeast Asia
- **Customer Types**: Engineering contractors, electrical pipe companies, OEM factories, hospital logistics system integrators

## Tech Stack

- **Framework**: Next.js 16 (App Router, Cache Components enabled)
- **React**: 19 (with Server Components)
- **TypeScript**: 5 (strict mode)
- **Styling**: Tailwind CSS 4
- **i18n**: next-intl (en/zh bilingual)
- **Testing**: Vitest + React Testing Library + Playwright
- **Package Manager**: pnpm
- **CI/CD**: GitHub Actions

## Project Conventions

### Code Style

- **TypeScript strict mode**: No `any`, prefer `interface` over `type`
- **Naming**: PascalCase (components), camelCase (utils), SCREAMING_SNAKE (constants)
- **Imports**: Use `@/` path aliases, no deep relative imports
- **No magic numbers**: All constants in `src/constants/`
- **No `console.log` in production**: Only `console.error`, `console.warn` allowed

### Architecture Patterns

- **Server Components first**: Use `"use client"` only when interactivity required
- **Cache Components**: `cacheLife()` for cache duration control
- **Async Request APIs**: `params`, `searchParams`, `cookies()`, `headers()` must be awaited
- **Locale routing**: `/[locale]/page-name` pattern with `en`, `zh` support

### Testing Strategy

- **Coverage target**: 85% global threshold
- **Stack**: Vitest + React Testing Library (unit/integration), Playwright (E2E)
- **Patterns**: See `TESTING_STANDARDS.md` for canonical patterns
- **ESM mocks**: Must use `vi.hoisted()` pattern
- **Server Component testing**: Use `Promise.resolve(params)` for async props

### Git Workflow

- **Conventional Commits**: `type(scope): description`
- **Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`
- **Branch strategy**: Feature branches from `main`

## Domain Context

- **Target audience**: Global B2B buyers, engineering contractors, OEM factories, system integrators
- **Content types**: Products (MDX), Blog posts (MDX), Static pages (About, FAQ, Contact)
- **Locales**: English (en) as default, Chinese (zh) supported
- **Forms**: Contact/Inquiry form with Cloudflare Turnstile CSRF protection

## Important Constraints

- **Complexity limits**: Function ≤120 lines, File ≤500 lines
- **Quality gates**: Zero TypeScript errors, Zero ESLint warnings
- **Performance**: Lighthouse score ≥0.85, TBT ≤200ms, CLS ≤0.15
- **Security**: All user input validated with Zod, no unfiltered `dangerouslySetInnerHTML`

## External Dependencies

- **Airtable**: Form submission storage
- **Resend**: Email notifications
- **Cloudflare Turnstile**: CAPTCHA/CSRF protection
- **Vercel**: Deployment platform
