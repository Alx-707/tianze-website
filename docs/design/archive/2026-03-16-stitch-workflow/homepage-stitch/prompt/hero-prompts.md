# Hero 设计方案 - Stitch Prompts

> 基于 `docs/design/` 文档生成
> 日期: 2026-02-02

---

## 共享设计上下文

以下内容将注入到每个 prompt 中：

```
CONTEXT:
- Company: Tianze Pipe - PVC conduit fittings manufacturer
- Differentiation: Not just a pipe seller — upstream bending machine manufacturer
- Target: B2B overseas buyers (distributors, importers)
- Vibe: Industrial-modern, professional, trustworthy, NOT cheap trader look

CONTENT:
- Badge: "About Us →" (links to about page)
- Title Line 1: "Equipment + Fittings"
- Title Line 2: "Integrated Manufacturer" (accent color)
- Subtitle: "Self-developed bending machines, self-produced precision fittings. From equipment to finished products, full chain control."
- Stats (4): Factory Direct | 100% Virgin Material | Fully Automated | 60% Repurchase Rate
- Equipment images: Bending machine, Expander, Production line (carousel)
- CTA: "Learn More" with scroll indicator

DESIGN SYSTEM:
- Primary: Industrial Steel Blue (oklch 0.672 0.161 245)
- Background: Clean white with subtle blue tint
- Typography: Clean sans-serif, bold headlines
- Radius: Micro precision (4-8px)
- Shadows: Slate-toned, subtle
- Style: Linear/Vercel inspired minimalism meets industrial precision
```

---

## 版本 A: 居中堆叠（现有布局优化）

**布局特点**: 内容居中，图片轮播在中间，统计栏在下方

```markdown
Hero section for a PVC pipe fittings manufacturer. Centered layout, industrial-modern aesthetic.

**Layout: Centered Stack**
- Badge at top center (subtle, clickable)
- Two-line headline centered, second line in accent blue
- Single-line subtitle below
- Equipment image carousel in center (3 images rotating)
- Stats bar below carousel (4 items, horizontal with subtle dividers)
- Scroll indicator at bottom (animated down arrow + "Learn More")

**Visual Style:**
- Clean white background with very subtle gradient (top to bottom, hint of blue-gray)
- Generous whitespace around headline
- Stats bar: minimal style, no heavy borders, subtle separators
- Image area: floating effect with soft shadow
- Typography: Bold headline (48-60px), medium subtitle, clean stats

**Avoid:**
- Generic SaaS template look
- Heavy gradients or loud colors
- Cluttered layout
- Stock photo feel

**Device:** Desktop-first, responsive
```

---

## 版本 B: 左文右图（经典分栏）

**布局特点**: 左侧文案，右侧设备图片突出展示

```markdown
Hero section for a PVC pipe fittings manufacturer. Split layout with text left, equipment imagery right.

**Layout: Left-Right Split (60-40 or 50-50)**
- LEFT SIDE:
  - Badge at top left
  - Two-line headline, left-aligned, second line in accent blue
  - Subtitle paragraph below
  - Stats in 2x2 grid or horizontal row
  - Optional: Primary CTA button

- RIGHT SIDE:
  - Large equipment image (bending machine as hero shot)
  - Image can extend beyond container edge for dynamic feel
  - Subtle floating elements or secondary equipment images in background
  - Soft shadow or glow effect on main equipment

**Visual Style:**
- Asymmetric balance: text anchored left, image creates visual weight right
- Equipment image should feel premium, industrial, precise
- Background: clean white left side, subtle gradient or pattern right side
- Consider geometric shapes or grid lines as subtle background elements (industrial feel)

**Key Emphasis:**
- Equipment image is THE differentiator - make it prominent
- Convey "we make the machines" through visual hierarchy

**Avoid:**
- Centered text in split layout
- Image feeling disconnected from content
- Generic stock machinery photos

**Device:** Desktop-first, stacks vertically on mobile
```

---

## 版本 C: 创意方案（沉浸式工业）

**布局特点**: 打破传统布局，强调"设备制造商"的技术深度

```markdown
Hero section for a PVC pipe fittings manufacturer. Immersive industrial showcase emphasizing engineering DNA.

**Concept: "Engineering Command Center"**
Show that this company BUILDS the machines, not just sells pipes. Create a sense of looking into a precision manufacturing environment.

**Layout: Layered Depth**
- BACKGROUND LAYER:
  - Subtle blueprint grid pattern or isometric factory floor visualization
  - Very light, doesn't distract from content

- MIDDLE LAYER:
  - Equipment images arranged in an asymmetric composition
  - Bending machine prominent, expander and production line as supporting elements
  - Images have depth - some larger/closer, some smaller/further
  - Subtle parallax or floating effect

- FOREGROUND LAYER:
  - Headline overlays the visual, large and bold
  - "Equipment + Fittings" in white or dark depending on contrast
  - "Integrated Manufacturer" in accent blue, slightly offset
  - Subtitle and stats anchored to bottom left or right

**Stats Treatment:**
- Stats as "data readout" style - monospace font, minimal frames
- Could include subtle icons (factory, checkmark, gear, percentage)
- Arranged vertically on one side or as floating badges

**Visual Style:**
- Dark section at top fading to light, or vice versa
- Industrial color accents: steel blue, slate gray
- Precision feel: thin lines, micro borders, exact spacing
- Motion hint: animated scan line, subtle particle effect, or pulsing glow on equipment

**Scroll Indicator:**
- Integrated into the design, perhaps a "scroll to explore products" with animated arrow

**Avoid:**
- Feeling like a gaming or tech startup
- Over-complicated animations that slow page load
- Losing the B2B professional credibility

**Device:** Desktop-first, simplified version for mobile (stacked, less layering)
```

---

## Prompt 对比

| 版本 | 布局 | 特点 | 风险 |
|------|------|------|------|
| A: 居中堆叠 | 传统安全 | 内容清晰，易于扫描 | 可能显得普通 |
| B: 左文右图 | 经典有效 | 设备图突出，差异化明显 | 需要好的设备图 |
| C: 沉浸式 | 创意突破 | 独特，令人印象深刻 | 可能过于复杂，需平衡 |

---

## 生成顺序建议

1. **先生成 B（左文右图）** — 最能体现差异化
2. **再生成 A（居中堆叠）** — 作为保守备选
3. **最后生成 C（创意方案）** — 看是否有惊喜

---

## 下一步

确认这三个 prompt 方向后，我将：
1. 调用 Stitch MCP 生成三个版本
2. 获取截图和 HTML
3. 对比评估

是否需要调整任何版本的方向？
