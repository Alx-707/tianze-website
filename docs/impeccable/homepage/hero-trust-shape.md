# Homepage Hero + Trust Evidence Shape Brief

> Last updated: 2026-04-29
> Status: design brief for homepage pilot. Do not treat this as final public copy or final design-system freeze.
> Scope: homepage hero and the first trust evidence section only.
> Sharing: internal-only until proof gaps and source references are converted into a public-safe brief.

## 1. Gate 0 verdict

This is partly a design problem, but it is not only a design problem.

The current homepage can be shaped now because the buyer decision path, product lanes, and inquiry goal are clear. The hard limit is evidence: product photos, factory photos, certification files, spec tables, sample policy, MOQ, lead time, and packaging proof are still incomplete.

So the brief should not ask design to hide missing proof. It should make proof gaps visible, controlled, and easy to replace once assets arrive.

## 2. Source basis

Use these as the current inputs:

- `PRODUCT.md`
- `DESIGN.md`
- `docs/design-truth.md`
- `docs/impeccable/design-workflow.md`
- `docs/impeccable/research-brief.md`
- `docs/impeccable/claim-evidence-matrix.md`
- `docs/research/tianze-internal-evidence-inventory.md`
- `docs/impeccable/system/PAGE-PATTERNS.md`
- Private external design-input research packet

Current production risk to remember:

- `messages/en/critical.json` and `messages/zh/critical.json` already contain some strong claims such as "ISO 9001 Certified", "Free samples ship within 3 business days", "24/7 production", testimonials, and broad standards wording.
- This shape brief does not edit those strings. It marks which claims should be downgraded or held until proof exists.

## 3. Feature summary

The homepage hero and first trust evidence section should answer one fast procurement question:

> Is Tianze credible enough for an overseas buyer to keep evaluating and send a useful inquiry?

The section is for distributors, engineering contractors, OEM buyers, and PETG pneumatic system integrators who are comparing suppliers and trying to reduce sourcing risk. It should establish Tianze's product scope, manufacturing support, and next action without pretending the site already has final proof assets.

## 4. Page job contract

```text
页面目的：
建立第一信任，说明 Tianze 供应什么、支持什么制造能力，并把买家导向产品、OEM 或询盘路径。

询盘贡献模式：
信任铺垫 + 入口分发。次级作用是直接转化。

主目标买家：
海外分销商 / 进口商。

次目标买家：
工程承包商、品牌/OEM 采购、PETG 气动物流系统集成商。

内容平衡策略：
首屏先讲产品范围和制造支持，服务分销商的快速筛选。
信任证据区补标准、规格、质量文件、RFQ 输入项，服务工程承包商。
OEM 和 PETG 不在首屏讲深，但必须有明确入口，避免被 PVC 主线吞掉。

用户核心疑问：
这是工厂型供应商还是贸易包装？
有没有我需要的产品范围？
标准、规格、文件能不能支持采购判断？
如果我要样品、报价、图纸评审，下一步怎么做？

必须出现的证据：
产品范围、出口市场事实、ISO 9001 证书编号或谨慎说明、制造流程方向、RFQ 所需信息。

主 CTA：
Request quote / 获取报价。

次 CTA：
View product range / 查看产品范围。

失败时的退路：
Send drawing, request sample discussion, ask for certificate/spec documents during RFQ.

不该出现的干扰：
假证书、假客户评价、未经证实的 24/7 生产、免费样品 3 天发货、世界级/领先/最低价、强烈 SaaS 渐变、装饰性数字墙。
```

## 5. Primary user action

The buyer should do one of three things after the first screen:

1. Click `Request quote` if they already know product, size, standard, or quantity.
2. Click `View product range` if they still need to confirm PVC, PETG, market, or family.
3. Use the trust evidence section to understand what documents or inputs Tianze can review during RFQ.

Do not optimize the hero for passive admiration. Optimize it for buyer self-qualification.

## 6. Design direction

Register: brand. This is a marketing surface, but it must behave like a procurement aid.

Physical scene:

> An overseas buyer is reviewing supplier candidates on a laptop during working hours, with product specs and RFQ requirements open in nearby tabs. They are not looking for inspiration. They are checking whether this supplier is safe to contact.

This scene supports a light, clean, evidence-led layout. Use Vercel's order, grid discipline, and spacing control, but replace SaaS identity with manufacturing proof, product specificity, and procurement cues.

Color strategy:

- Restrained.
- Current steel blue remains the action and structure accent.
- Large saturated backgrounds, glow, and decorative gradients are not appropriate here.

Visual character:

- Precise
- Industrial
- Calm
- Specific
- Evidence-led

Do not use:

- gradient text
- hero metric template
- fake certificate badges
- fake customer logo wall
- rounded SaaS icon-card grid as the main proof
- generic factory stock-photo fantasy

## 7. Layout strategy

### Hero layout

Use a two-column hero on desktop and a single-column flow on mobile.

Left column:

1. Evidence-aware eyebrow
2. H1
3. short subtitle
4. primary and secondary CTA
5. compact trust line with only verified or carefully bounded facts

Right column:

Use an evidence board instead of a decorative image placeholder.

Recommended visual stack:

1. Product lane panel: PVC conduit fittings, PETG tubes, OEM/custom
2. Standards/context panel: UL/ASTM, AS/NZS, NOM, IEC, with "confirm document scope during RFQ" style wording
3. RFQ checklist panel: size, standard, quantity, destination, drawing/sample, packaging

If real product/factory photos are later supplied, the right column can become a mixed proof visual:

- one real product photo
- one process or QC photo
- one small spec/RFQ panel

Do not use blank card placeholders as if they were proof.

### Trust evidence section

Place immediately after the hero or as the first section after product entry paths. The better first pilot is directly after hero because it tests whether trust can be built without unsupported claims.

Use a structured evidence layout, not a badge wall.

Recommended section title:

```text
Evidence buyers can verify during RFQ
```

Recommended structure:

1. Product scope evidence
2. Manufacturing support evidence
3. Quality and documentation evidence
4. RFQ and sample discussion evidence

Each item should include:

- buyer question
- current answer
- proof status
- next action

## 8. Content wireframe

### Hero copy direction, not final copy

Eyebrow options:

```text
PVC conduit fittings + PETG tube manufacturing support
```

or:

```text
Export-focused PVC conduit and PETG tube supplier
```

Avoid making `ISO 9001 Certified` the eyebrow until the certificate scan/PDF and scope are available as a public or RFQ-ready proof asset.

H1 direction:

```text
PVC conduit fittings and PETG tubes for export procurement.
```

Alternative with stronger manufacturing emphasis:

```text
PVC conduit fittings, PETG tubes, and OEM support from one manufacturing workflow.
```

Subtitle direction:

```text
Help your team review product scope, market standards, custom requirements, and RFQ details before committing to a supplier conversation.
```

This is safer than saying all products are certified, globally proven, or ready for every market.

CTA set:

```text
Primary: Request quote
Secondary: View product range
Tertiary text link, optional: Send drawing or sample requirement
```

Hero proof line, safe version:

```text
Est. 2018 · 20+ export markets · ISO 9001 certificate #240021Q09730R0S available during RFQ review
```

Only include size range, 24/7 production, sample turnaround, or factory area if business proof is confirmed.

### Trust evidence content

| Evidence block | Buyer question | Current answer | Status | CTA/fallback |
| --- | --- | --- | --- | --- |
| Product scope | Do you supply my category? | PVC conduit fittings, conduit systems, PETG pneumatic transfer tubes, OEM/custom support. | Ready now | View product range |
| Standards context | Can this fit my market? | UL/ASTM, AS/NZS, NOM, IEC contexts can be discussed by product scope. | Must use cautious wording | Ask for document scope |
| Manufacturing support | Can you handle custom or repeat orders? | In-house forming, tooling, production, and QC are the intended proof direction. | Needs asset before strong claim | Send drawing |
| Quality documentation | Can I get documents? | ISO 9001 certificate number exists. Certificate copy should be available during RFQ review until public PDF exists. | Cautious wording | Request certificates |
| Sample / MOQ / lead time | Can I test and plan purchase? | Policy not confirmed. | Needs business input | Confirm during RFQ |
| Packaging / export | Can you pack for my market? | Packaging proof missing. | Needs asset | Ask packing requirement |

## 9. Proof dependency rules

| Module | Ready now | Needs asset | Must use cautious wording | Blocked until proof |
| --- | --- | --- | --- | --- |
| Product lane labels | Yes | No | No | No |
| Product photos | No | Yes | No | Final visual proof |
| Factory-backed headline | Partial | Yes | Yes | Strong "factory-direct manufacturer" claim |
| ISO 9001 trust line | Partial | Certificate scan/PDF | Yes | Public download block |
| UL/ASTM/AS/NZS/IEC/NOM claims | No | Product-specific reports/certificates | Yes | "Certified/compliant" wording |
| 20+ export countries | Yes, based on current config | Owner confirmation preferred | Slightly | No |
| 107 export countries | No | Verification | No | Yes |
| Size range 16-168mm | Partial | Verified spec table | Yes | Strong hero metric |
| 24/7 production | No | Business proof | No | Yes |
| Free samples in 3 business days | No | Sample policy | No | Yes |
| Testimonials / project quotes | No | Permission and source | No | Yes |

## 10. Key states

Default state:

- Hero shows product scope, cautious manufacturing support, CTAs, and verified proof line.
- Trust evidence section shows proof blocks with status-aware wording.

No-photo state:

- Use technical panels, product diagrams, RFQ checklist, and standards map.
- Do not show empty boxes pretending to be photos.

Photos supplied state:

- Replace one technical panel with one real product/process image.
- Keep copy and proof status unchanged unless the photo proves a specific claim.

Certificate supplied state:

- ISO certificate can become a stronger trust block with certificate number, validity, scope, and download or RFQ-copy path.
- Product-specific certificates may unlock standard-specific badges, but only by exact scope.

Mobile state:

- Copy first, visual second.
- CTAs stack cleanly.
- Proof line becomes wrapped chips or short rows, not a cramped metric strip.

Reduced-motion state:

- No essential information depends on motion.
- Any reveal or hover feedback must be transform/opacity based and safely removable.

## 11. Interaction model

Hero CTAs:

- `Request quote` routes to contact/inquiry.
- `View product range` routes to product overview.
- Optional text link `Send drawing` routes to contact/OEM context if implementation supports prefill.

Trust evidence section:

- Evidence blocks can link to product range, OEM, contact, or future downloads.
- Do not introduce a modal as first thought.
- If a future inquiry drawer is used, it must preserve page context and clearly show what the buyer should provide.

Hover and focus:

- Subtle shadow or ring feedback only.
- No large motion spectacle.
- Keyboard focus must be visible.

## 12. Content requirements before implementation

Minimum copy fields:

- Hero eyebrow
- Hero H1
- Hero subtitle
- Primary CTA
- Secondary CTA
- Optional tertiary CTA
- Proof line items
- Trust evidence title
- Trust evidence subtitle
- 4 to 6 evidence blocks
- RFQ helper list

Minimum business inputs still needed:

1. ISO 9001 certificate scan/PDF, registrar, validity, and scope.
2. Product-specific standard/certification inventory.
3. Top product size/spec tables.
4. Real product/factory/QC/packing photos.
5. Sample, MOQ, and lead-time policy.
6. Packaging/export requirement language.

## 13. Recommended references for implementation

Use these when moving from shape to code:

- `docs/impeccable/system/PAGE-PATTERNS.md`
- `docs/impeccable/system/TIANZE-DESIGN-TOKENS.md`
- `docs/impeccable/system/MOTION-PRINCIPLES.md`
- `docs/impeccable/claim-evidence-matrix.md`
- `docs/research/tianze-internal-evidence-inventory.md`

Relevant skills after confirmation:

- `impeccable` for page design and implementation direction
- `layout` if the hero rhythm feels generic
- `typeset` if the headline and proof line lack hierarchy
- `distill` or `quieter` if trust blocks become noisy
- `animate` only for purposeful CTA, hover, or form feedback

## 14. Open questions

These should not block shape, but they block final copy and final visual identity:

1. Can Tianze provide the ISO 9001 scan/PDF and certificate scope?
2. Which PVC products are certified, tested, made to standard, or only standard-oriented?
3. Is 16-168mm a verified current product range across public product lines?
4. Is 24/7 production true and worth saying publicly?
5. Is there a real sample policy, or should the CTA only say "request sample discussion"?
6. Can factory/workshop/QC/packing photos be supplied?
7. Should PETG be a first-screen equal product lane or a secondary lane after PVC?

## 15. Acceptance criteria

```text
Given an overseas buyer lands on the homepage,
When they scan the first screen,
Then they can identify Tianze's product scope, manufacturing support direction, and next action within 5 seconds.
```

```text
Given a claim appears in the hero or first trust section,
When the claim implies certification, factory capability, sample speed, production capacity, or customer proof,
Then it is either backed by a current proof asset or worded as an RFQ-confirmed discussion point.
```

```text
Given the site still lacks real photos and certificate files,
When the hero visual is designed,
Then it uses procurement panels, diagrams, and RFQ checklists rather than fake proof imagery.
```

```text
Given the buyer is not ready to request a quote,
When they look for a lower-commitment path,
Then they can view product range, ask for documents, send a drawing, or request sample discussion.
```

## 16. Decision

Proceed to a homepage pilot design using this brief, but do not freeze the final design system yet.

The pilot should prove whether Tianze can look like a credible manufacturer through evidence structure. If the pilot works, upgrade `DESIGN.md` and page patterns from provisional guidance into stronger stable rules. If the pilot still feels generic, the next fix should be evidence and content quality first, not more moodboards.
