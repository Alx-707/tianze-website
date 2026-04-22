# Single-Site Mainline Closeout 2026-04

## 一句话结论

当前这条“第一轮整库审查主线问题收口”到这里可以停线了。

现在已经明确成三层：

- `src/config/single-site.ts`
- `src/config/single-site-page-expression.ts`
- `src/config/single-site-seo.ts`

后面不要再把“继续抽常量”当默认动作。

## 当前 canonical truth

### 1. 站点身份层

`src/config/single-site.ts`

负责：

- 品牌
- 联系方式
- 默认 SEO 基线
- 站点级导航 / 页脚输入
- 站点身份与市场结构入口

### 2. 页面表达层

`src/config/single-site-page-expression.ts`

负责：

- FAQ item keys
- CTA targets
- section/card order
- display mapping
- fallback copy
- reusable page expression inputs

### 3. 公共静态 SEO 层

`src/config/single-site-seo.ts`

负责：

- sitemap static page list
- sitemap priority / changeFrequency defaults
- robots disallow defaults
- public static page SEO authoring inputs

## 故意不再继续抽的东西

下面这些现在故意留在页面或 helper 层，视为实现细节：

- `contact/page.tsx` 里的 `MERGED_MESSAGES`
- `products/[market]/page.tsx` 里的 `SPECS_BY_MARKET`
- `privacy` / `terms` 的 heading-prefix constants
- `slugify`
- heading parser
- JSON-LD object literals
- page-local render helpers

规则很简单：

只有“未来类似项目最可能替换的输入”才继续往三层真相层里收。
如果只是为了让文件看起来更干净，而把实现细节抽出去，就到此为止，不继续做。

## 当前完成标准

这条主线当前算完成，基于下面四点：

1. 活跃 docs / rules / scripts 已经回到同一套单站三层真相
2. `bending-machines` 的 why cards 和 capability stats 已进入页面表达层
3. sitemap / robots / public static page SEO 默认值已经由 `src/config/single-site-seo.ts` 统一承接
4. `truth:check` / `review:docs-truth` / targeted Vitest 已经覆盖这条线

## 下一条主线

下一条主线不再是“再抽更多常量”。

默认转去：

- 真实业务页面质量
- 内容 / SEO 资产持续清理
- Cloudflare / release proof 的当前阻塞
- 未来 derivative project 的替换效率
