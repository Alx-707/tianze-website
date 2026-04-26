# Wave 1 业务资产交付清单

**日期**: 2026-04-26
**分支**: `wave1-release-blockers`
**状态**: 工程代码已就绪，等业务方交付后逐项落地

本文档列出上线前必须由业务方提供的 6 项资产/确认。每项标注了规格要求、当前线上表现、落地后的验收方式。

工程侧不能替代这些输入——没有真实资产就意味着网站继续展示模板痕迹或虚假声明。

---

## 交付优先级

按"买家发现概率 x 信任伤害"排序。前 4 项是硬阻断（上线即暴露），后 2 项是软阻断（需要点击才发现）。

---

### 1. 品牌 Logo（Task 8）

**当前表现**: header 无 logo 图片（broken image），JSON-LD Organization.logo 也指向不存在的文件。

**需要提供**:
- 横排 SVG（透明背景，至少 200x60）—— 用于网站 header
- 横排 PNG（透明背景，2x 高分辨率）—— fallback
- 方形 SVG（256x256）—— 用于 favicon / og:image

**来源建议**: 阿里国际站店铺 logo、名片设计稿、VI 手册。

**落地后验收**: 打开网站首页，header 左上角显示真实品牌 logo，不是空白或 Next.js 默认图标。

---

### 2. 真实联系电话（Task 11）

**当前表现**: footer、Terms 页、contact 页、JSON-LD 全部显示 `+86-518-0000-0000`。

**需要提供**:
- 一个可公开的真实电话号码
- E.164 格式（如 `+86-518-12345678`）
- 确认该号码同时用于 footer、contact 页、Terms 法律文本、JSON-LD schema

**来源建议**: 公司座机或业务手机号。

**落地后验收**: 在 footer / contact / Terms 三处看到的电话号码一致且真实，grep 全库无 `0000-0000`。

---

### 3. Privacy 政策（Task 12）

**当前表现**: 隐私政策声明网站收集"账号/密码/聊天记录"——本站没有账号系统也没有聊天功能。欧洲买家看到会有 GDPR 合规疑虑。

**需要提供**:
- en + zh 两个版本的 Privacy 政策正文
- 覆盖本站实际收集面即可：
  1. Contact 表单（姓名/邮箱/公司/留言）
  2. Newsletter 订阅（邮箱）
  3. 产品询盘抽屉（产品名/数量/需求/公司/邮箱）
  4. Cookie（必要 + 分析，经同意后启用）
  5. 服务器日志（IP/user-agent，Cloudflare 托管）
  6. 营销归因（UTM 参数，经 cookie 同意后存储）
- 删除任何关于"账号/密码/聊天/支付"的段落

**来源建议**: 可以让工程侧先按上述收集面起草一版，业务方审定后落地。如需法务审核请提前安排。

**落地后验收**: 打开 /en/privacy，正文只描述上述 6 类数据，无 account/password/chat 字样。

---

### 4. 标准声明确认（Task 13）

**当前表现**: about 页和 OEM 页声明"符合 AS/NZS 2053, ASTM D1785, IEC 61386, NOM"四项国际标准，但 public 没有任何证书或测试报告佐证。

**需要提供**:
- 逐项确认以下四个标准中，**当前能提供 PDF 测试报告或证书**的项目：
  - AS/NZS 2053
  - ASTM D1785
  - IEC 61386
  - NOM-001-SEDE
- 有 proof 的：保留声明 + 提供 PDF 上传
- 无 proof 的：工程侧自动将措辞从"comply with"降级为"manufactured to ... specifications, documentation available on request"

**影响范围**: 不只是 about 页，还包括 OEM 页 FAQ、messages 中的产品目录描述（涉及 en + zh 共 40+ 处）。

**落地后验收**: 有 proof 的标准旁有下载链接且 200；无 proof 的标准用降级措辞，不再出现"comply"/"compliant"。

---

### 5. Hero 图片（Task 10）

**当前表现**: 首页右侧 hero 区域是 3 个空的灰色占位 div，无任何视觉内容。

**需要提供**:
- 3 张真实工厂/设备/产线图片
- 建议主题：弯管机、扩口机、生产线
- 规格：1600x900 以上，JPG 或 WebP，工厂实拍优先
- 如暂时没有专业摄影，手机拍清晰的产线照也可以先用，后续再替换

**落地后验收**: 首页 hero 区显示 3 张真实图片，无空白 div、无 broken image。

---

### 6. ISO 9001 证书 PDF（Task 9）

**当前表现**: about 页声明持有 ISO 9001:2015 认证（证书号 240021Q09730R0S），但下载路径 `/certs/iso9001.pdf` 返回 404。

**需要提供**:
- ISO 9001:2015 证书的官方扫描件 PDF
- 确认证书号与 about 页声明一致
- 文件 < 5MB

**来源建议**: 质量部档案或认证机构电子副本。

**落地后验收**: 点击 about 页的 ISO 证书链接，浏览器正常打开/下载 PDF。

---

## 工程侧准备状态

| Task | 代码就绪 | 等什么 |
|------|---------|-------|
| Task 8 logo | brandAssets config 已建好，logo.tsx + JSON-LD 已改为读 config 路径 | 把文件放到 `public/images/logo.*` |
| Task 9 ISO PDF | about.mdx 已声明路径 `/certs/iso9001.pdf` | 把文件放到 `public/certs/iso9001.pdf` |
| Task 10 hero | hero-section.tsx 的 HeroVisual 函数已定位，替换代码在计划中 | 放图 + 改 HeroVisual 为 next/image |
| Task 11 电话 | single-site.ts:50 + terms.mdx:288 定位明确 | 全局替换 `+86-518-0000-0000` |
| Task 12 privacy | MDX frontmatter 已更新，正文待替换 | 替换 en + zh 正文 |
| Task 13 标准声明 | grep 已定位 about + OEM + messages 共 40+ 处 | 按确认结果批量降级 |

每项资产到位后，对应的工程落地预计 5-30 分钟。全部完成后跑一次 `pnpm ci:local` + `pnpm build:cf` 做最终验证，然后推分支开 PR。
