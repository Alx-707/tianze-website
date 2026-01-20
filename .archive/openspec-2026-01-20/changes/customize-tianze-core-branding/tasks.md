# Tasks: Customize Core Branding for Tianze Pipe Industry

## Prerequisites
- [ ] Ensure on feature branch (not `main`)

## Phase 1: Schema Updates (Sequential, First)

### 1.0 Update Certification Interface
- [ ] Edit `src/config/site-facts.ts`
  - Add `certificateNumber?: string` to `Certification` interface
- **Validation**: `pnpm type-check`

## Phase 2: Core Configuration (Sequential)

### 2.1 Update Site Configuration
- [ ] Edit `src/config/paths/site-config.ts`
  - Replace `name`: `B2B Web Template` → `Tianze Pipe`
  - Update `description` to reflect PVC/PETG manufacturer
  - Update `seo.titleTemplate`: `%s | Tianze Pipe`
  - Update `seo.defaultTitle` and `seo.defaultDescription`
  - Replace `seo.keywords` with industry-relevant terms
  - Update `social.twitter` → `https://x.com/tianzepipe`
  - Update `social.linkedin` → `https://www.linkedin.com/company/tianze-pipe`
  - Update `social.github` → `https://github.com/tianze-pipe`
  - Update `contact.phone` → `+86-518-0000-0000`
  - Update `contact.email` → `contact@tianze-pipe.example`
  - Update `contact.whatsappNumber` → `+86-518-0000-0000`
- **Validation**: `pnpm type-check`

### 2.2 Update Site Facts
- [ ] Edit `src/config/site-facts.ts`
  - Set `company.established`: `2018`
  - Set `company.employees`: `60`
  - Update `company.location`: `{ country: 'China', city: 'Lianyungang, Jiangsu', address: '江苏省连云港市灌云县东王集工业集中区玉龙路6号' }`
  - Update `certifications`: `[{ name: 'ISO 9001:2015', certificateNumber: '240021Q09730R0S', file: '/certs/iso9001.pdf', validUntil: '2027-03' }]`
  - Set `stats.exportCountries`: `100`
- **Validation**: `pnpm type-check`

## Phase 3: i18n Messages (Parallelizable)

### 3.1 Update English Critical Messages
- [ ] Edit `messages/en/critical.json`
  - Update `seo.*` namespace (all "B2B Web Template" → "Tianze Pipe")
  - Update `structured-data.organization.name` → `Tianze Pipe`
  - Update `structured-data.organization.description` → PVC/PETG manufacturer description
  - Update `structured-data.organization.phone` → `+86-518-0000-0000`
  - Update `structured-data.organization.social.twitter` → `https://x.com/tianzepipe`
  - Update `structured-data.organization.social.linkedin` → `https://www.linkedin.com/company/tianze-pipe`
  - Update `structured-data.organization.social.github` → `https://github.com/tianze-pipe`
  - Update `structured-data.website.*`
  - Update `structured-data.article.defaultAuthor` → `Tianze Pipe`
- **Validation**: `pnpm validate:translations`

### 3.2 Update Chinese Critical Messages
- [ ] Edit `messages/zh/critical.json`
  - Mirror all changes from 3.1 with Chinese translations
  - `seo.title`: `天泽管业`
  - `seo.description`: 专业PVC管道与PETG气动传输管制造商
  - `structured-data.organization.name` → `天泽管业`
  - `structured-data.organization.description` → Chinese description
  - `structured-data.organization.phone` → `+86-518-0000-0000`
  - `structured-data.organization.social.*` → same URLs as 3.1
  - `structured-data.article.defaultAuthor` → `天泽管业`
- **Validation**: `pnpm validate:translations`

### 3.3 Update English Deferred Messages
- [ ] Edit `messages/en/deferred.json`
  - Update `footer.copyright` company name
  - Update `footer.description`
  - Update `organization.*` and `website.*`
  - Update `article.defaultAuthor`
- **Validation**: `pnpm validate:translations`

### 3.4 Update Chinese Deferred Messages
- [ ] Edit `messages/zh/deferred.json`
  - Mirror all changes from 3.3 with Chinese translations
- **Validation**: `pnpm validate:translations`

## Phase 4: Test Updates (Sequential after Phase 2-3)

### 4.1 Update Test Mocks
- [ ] Search for affected test files: `rg "B2B Web Template" src/ --type ts -l`
- [ ] Update mock data in each affected test file to use new values
- [ ] Update snapshot files if any
- **Validation**: `pnpm test`

### 4.2 Update Vitest Mock Messages
- [ ] Sync `messages/en.json` with `messages/en/critical.json` + `messages/en/deferred.json` changes
- [ ] Sync `messages/zh.json` with `messages/zh/critical.json` + `messages/zh/deferred.json` changes
- **Validation**: `pnpm test`

## Phase 5: Final Verification

### 5.1 Full CI Check
- [ ] Run `pnpm ci:local:quick`
- [ ] Verify no "B2B Web Template" in config: `rg "B2B Web Template" src/config/`
- [ ] Verify SEO namespace updated (JSON-aware):
  ```bash
  node -e "const m=require('./messages/en/critical.json'); process.exit(JSON.stringify(m.seo).includes('B2B Web Template')?1:0)"
  node -e "const m=require('./messages/zh/critical.json'); process.exit(JSON.stringify(m.seo).includes('B2B Web Template')?1:0)"
  ```
- [ ] Verify structured-data namespace updated (JSON-aware):
  ```bash
  node -e "const m=require('./messages/en/critical.json'); process.exit(JSON.stringify(m['structured-data']).includes('B2B Web Template')?1:0)"
  node -e "const m=require('./messages/zh/critical.json'); process.exit(JSON.stringify(m['structured-data']).includes('B2B Web Template')?1:0)"
  ```
- [ ] Verify placeholder values searchable: `rg "tianze-pipe.example|0000-0000" src/config/`
- [ ] Verify build succeeds: `pnpm build`

### 5.2 Visual Verification (Manual)
- [ ] Start dev server: `pnpm dev`
- [ ] Check browser tab title shows "Tianze Pipe"
- [ ] Verify no console errors

## Completion Criteria

- [ ] All `pnpm ci:local:quick` checks pass
- [ ] Zero occurrences of "B2B Web Template" in `src/config/`
- [ ] Zero occurrences of "B2B Web Template" in `seo.*` and `structured-data.*` namespaces in `messages/`
- [ ] All temporary placeholder values use valid formats (no `[PLACEHOLDER_*]`)
- [ ] Placeholder values are searchable via `rg "tianze-pipe.example|0000-0000"`
- [ ] Build completes without errors
- [ ] `Certification` interface includes `certificateNumber` field
