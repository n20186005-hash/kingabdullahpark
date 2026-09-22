# King Abdullah Park Riyadh - 专业科普落地页全面升级 (PRD)

## Overview
- **Summary**: 在现有 Astro 单页站基础上，不删减任何既有内容，新增：实时天气 Server Component（Open-Meteo，前端不暴露任何技术细节）、季度游览策略表、三类人群定制路线（亲子/摄影/低体力无障碍）+ 半日/全日通用路线、访客服务与设施分类强化、科普与访客责任、历史背景与故事传说深度拓展、SEO title 统一为「景点名+城市+旅游指南」、补全 Cloudflare Workers 手动部署的忽略规则。
- **Purpose**: 使网站在内容、可用性、SEO 维度达到专业科普景点落地页的水准，覆盖普通游客在"查天气—选路线—看攻略—做计划—负责任旅游"完整决策链路的全部信息需求，同时保持非盈利中立立场，不推荐具体商户。
- **Target Users**: 计划前往利雅得 King Abdullah Park 的阿拉伯语/国际普通游客、家庭亲子出游、摄影爱好者、低体力老年人/残障游客、对历史文化有兴趣的科普读者。

## Goals
- G1: 天气模块具备"实时温度+体感+今日带伞/穿衣建议+未来多日温度/降水概率"，服务端取数并缓存，前端**完全不出现** Open-Meteo、免费、无需密钥、API 等技术词汇。
- G2: 补全 WC / 停车 / 餐饮 / 住宿 / 商超 / 加油充电 六类中立设施建议，不出现任何具体商户名。
- G3: 交通攻略涵盖机场→景点（KKIA）、公共交通（地铁/巴士）、出租车三种路径的详尽步骤与预期耗时/注意事项。
- G4: 新增"季度游览策略表"，基于 30 年气候平均给出每季度温度/衣着/人群适配度综合建议。
- G5: 新增 3 条人群定制路线（亲子家庭 / 摄影自然 / 低体力无障碍）+ 半日/全日通用路线。
- G6: 新增"访客服务与周边设施（类型中立）"与"科普与访客责任"两个内容板块。
- G7: 历史文化板块深度扩展：前公园时代（Al Malaz 赛马场）、2013 年重建、与沙特国家公共文化/绿色 Riyadh 项目的关联脉络、可追溯的轶事。
- G8: SEO 标题统一为「منتزه الملك عبدالله بالرياض - دليل سياحي شامل」，同时 JSON-LD `name`/`alternateName` 与中文/英文 SEO 模板联动。
- G9: 为 Cloudflare Workers 手动部署补全 `.gitignore` / `.cfignore` 忽略规则。

## Non-Goals
- 不引入后端数据库或 CMS；所有静态内容与 Astro server-side fetch 完成。
- 不新增订阅、登录、评论、用户上传等交互功能。
- 不推荐具体酒店/餐厅/旅行社/打车应用品牌名（仅推荐类别或"官方渠道"）。
- 不翻译为英文（站点保持 ar-SA 主语言，仅标题保留英文关键词做 SEO 锚点）。
- 不接入需要 API key 的天气服务（保持 Open-Meteo 无密钥方案）。
- 不做移动端 App（PWA 已存在，不再扩展 service worker 离线缓存）。

## Background & Context
- 当前仓库为 Astro 7.2.7 + Tailwind v4 静态构建，`output: static`，`site: https://kingabdullahpark.com`。
- 已包含：Hero、故事、特色、参观须知、交通、6 类服务、餐饮类型、周边 4 地标、地图、Sources、FAQ 7 条、CTA。
- 已做：TouristAttraction + FAQPage JSON-LD（含 @id/image/hasMap/sameAs）、TDK、OG 图片 alt、PWA manifest 等 SEO 实体绑定。
- 部署方式：用户声明"手动部署于 Cloudflare Workers"，需配 `wrangler.jsonc`（已存在）+ 忽略文件。
- 环境：本地 Node v18.14（低于 Astro 要求 >=22.12），故以静态代码检查 + GetDiagnostics + 独立数据结构验证（Node script）+ 抓包模拟 Open-Meteo 响应做证据，不直接 `astro build`。

## Functional Requirements
- **FR-1 (Weather)**: 新增 `WeatherPanel.astro` 组件，在服务器端用 `fetch()` 请求 Open-Meteo `/v1/forecast`（lat=24.6664, lon=46.7346, hourly t2m/apparent/precipitation_probability, daily tmax/tmin/precip_sum/sunshine_duration, timezone=Asia/Riyadh），响应做 JSON 解析后传给模板渲染；**前端 DOM 文本绝不能出现**「Open-Meteo」「API」「免费」「密钥」「无需 key」等技术性字样。
- **FR-2 (Weather UX)**: 天气模块显示：① 实时卡（当前温度°C、体感温度、天气短语如"晴朗/热/有风"、穿衣建议、伞建议）；② 未来 6–7 日预报卡（日期、最高/最低、降水概率 %、晴天图标）；③ 用颜色与图标（UTF-8 emoji 或纯 CSS 画）区分晴/多云/雨，动态渲染只展示当下相关建议（如 10% 降水不显示带伞建议）。
- **FR-3 (Neutral Amenities)**: 重写 `#services` 六个卡片，每类至少 3 条使用建议，全部保持「类型中立」无商户名，并新增卡片：无障碍设施 / 失物招领与安保服务点 / 哺乳与育婴 / 宠物政策，合计 ≥9 张。
- **FR-4 (Transport Deep Dive)**: 扩展 `#transport` 交通板块，每条交通方式下拆成「步骤 / 预计时长 / 费用区间（以"低/中/高"定性描述，不出具体 SAR 金额）/ 高峰注意」四要素，机场路线明确写 KKIA（King Khaled Intl.）→ Airport Metro Line → 换乘至 Orange Line → Al Malaz Station 的建议顺序。
- **FR-5 (Quarterly Strategy)**: 新增 `#seasonal` 板块，一张 4 行 × 5 列表格：季度（12–2月冬、3–5春、6–8夏、9–11秋）、平均气温范围、适合人群、穿着建议、备注（风沙/祷告时间/斋月等文化提醒）。
- **FR-6 (Custom Itineraries)**: 新增 `#itineraries` 板块：
  - ① 亲子家庭（2大1小）：3–4h 节奏，含休息/厕所/儿童游乐区节点顺序。
  - ② 摄影自然：日出/傍晚两时段推荐机位（仅按方位/水面描述，不写具体门牌）。
  - ③ 低体力无障碍：平缓路径、最短路径、遮荫休息节点数量。
  - ④ 通用半日（3h）与 ⑤ 全日（6h，含一餐+周边地标穿插）。
- **FR-7 (Visitor Services + Responsibility)**: 新增 `#visitor`（访客服务、周边设施类型概述）与 `#responsibility`（科普+责任）板块，责任板块含：节水/垃圾分类/祷告场所尊重/湖岸安全/儿童看护/拍照与隐私（沙特文化提醒）/不乱投喂 七条。
- **FR-8 (History Deep Dive)**: 扩展 `#story` 为 ≥5 段，分阶段：① 前 1950–2000：Al Malaz 赛马场与利雅得市东扩；② 2003–2010：项目规划与重新定位；③ 2013 开幕：规格（面积/喷泉高度/湖）；④ 与沙特"2030 愿景"和绿色 Riyadh 项目的联动；⑤ 轶事可追溯条目（命名来源：阿卜杜拉国王、喷泉系统采用的技术来源等——写清"公开资料显示/未找到官方单一说法"保持严谨）。
- **FR-9 (SEO Title)**: `BaseLayout` 接收 title 统一为「منتزه الملك عبدالله بالرياض - دليل سياحي شامل」，meta description 同时包含 "Tourist Attraction in Riyadh + Al Malaz + visitor guide"。检查其他页面（privacy/terms/cookies/404）的 title 同样更新。
- **FR-10 (Ignore Files)**: 检查/补充 `.gitignore` 新增：`dist/` `.astro/` `.wrangler/` `.env*` `node_modules/` `pnpm-lock.yaml`（若用 npm 则保留 package-lock，但此处原仓库无 lock）；新增 `.cfignore` 同样忽略这些目录，确保 `wrangler deploy` 产物干净。

## Non-Functional Requirements
- **NFR-1: 中立性（rubric）**: 所有设施/餐饮/住宿推荐不出现任何具体品牌名、APP 名、商场名，全部采用"类别/服务类型/官方渠道"表述。
- **NFR-2: 天气文本清洁度（rule）**: 全站 HTML 做 `Grep -i open-meteo\|api\|free\|key\|密钥\|免费`（英文+中文+阿拉伯语同义词）必须 0 命中。
- **NFR-3: 无技术暴露（rule）**: 不得出现 Astro / Component / Server-side / wrangler / build 等开发术语（除了 SourcesSection 引用来源时的正当说明）。
- **NFR-4: 性能**: 天气 fetch 在 Astro server 渲染时完成，不做客户端二次请求；使用 `Astro.request` 层 10min TTL 缓存（如不可得则缓存到全局 Map，键 = `om-{date}`，10min 过期）。
- **NFR-5: 可访问性**: 新增板块保持现有语义结构：每节 `<section>` + `<h2>`，表格用 `<table>` + `<caption>` + `<th scope>`；路线用有序列表；新增 ARIA label 对天气 icon（如 aria-label="الجو صافٍ"）。
- **NFR-6: SEO 覆盖率（rule）**: `<title>` 必须匹配「منتزه الملك عبدالله بالرياض - دليل سياحي شامل」；JSON-LD TouristAttraction 的 `name` 与 `alternateName` 包含阿拉伯 + 英文全名 + 「دليل سياحي」关键词。

## Constraints
- **Technical**: Astro 7.2.7 `output: static` 模式，静态构建期 `fetch` 可用（SSR 不可用，但 `export async function getStaticPaths` 或页面 frontmatter 顶层 await 可行）。如顶层 await 受限则天气数据以"**构建期 fetch 写入一个 const 并 fallback**（当网络不通时降级为"请参考官方气象台预报"的友好占位文本，同样无技术细节）"。
- **Business**: 非盈利科普中立。不引用任何付费合作链接、不写任何具体商户、不使用"推荐""最好""第一"等带主观商业倾向的词（可用"常见类型""适合""公共信息显示"等客观表述）。
- **Dependencies**: 不新增任何 npm 包（保持 `package.json` 不变）。Open-Meteo 为纯 HTTP GET，不依赖 SDK。
- **Locale**: 站点保持 ar-SA RTL 主文本；SEO 和实体锚点保留必要英文关键词；不做中英双语切换。

## Assumptions
- 构建环境在 Cloudflare/用户本机可联网访问 `api.open-meteo.com` 443。
- 利雅得气候：夏季 6–8 月常 >42°C；冬季 12–2 月最低 ~10°C；春季多风沙；斋月日期每年前移 10–11 天，需用"请查询当年官方历法"方式表述（不硬编码具体日期）。
- Al Malaz Stadium / King Abdullah Park / Riyadh Zoo 三者步行可达（≈1–2 km），可作为周边地标串联路线依据。
- 喷泉表演在日落后开始；开放时间 13:00–24:00 为公共导航平台常数值，但文中必须保留"以当日官方公告为准"的谨慎表述。

## Open Questions
- [ ] 季度表是否需要加上沙尘预警提醒？(默认：Yes，放到"备注"列)
- [ ] 低体力无障碍路径是否提供"推荐入口"？(默认：写"请向官方入口咨询无障碍通道位置"，因入口设置可能调整)
- [ ] 科普部分是否提及沙特水安全/中水浇灌绿地？(默认：Yes，作为"访客节水责任"的背景科普)

---

## Acceptance Criteria

### AC-1: 天气模块无技术暴露
- **Type**: `rule`
- **Given**: 网站最终渲染的 index.html
- **When**: 对 `dist/index.html` 与所有静态资源执行大小写不敏感搜索：`open-meteo\|api\|free\|no.?key\|密钥\|免费\|无需.*密钥\|接口`
- **Then**: 命中数 === 0（`manifest.webmanifest` 等 JSON 不在此规则内）
- **Pass Condition**: 0 matches，且天气模块存在"温度/体感/伞建议/6日+预报"四类 DOM
- **Evidence**: `Grep` 命令输出 + Read of rendered HTML weather section

### AC-2: 中立设施 ≥9 类零商户名
- **Type**: `rule`
- **Given**: `#services` 板块 DOM
- **When**: 统计 `card` 子卡片数量，并对正文执行关键词白名单：不得含有"McDonalds、Applebee's、Lulu、Carrefour、STC、Uber、Careem、Sheraton、Holiday Inn、IKEA"等常见商户名
- **Then**: 卡片数 ≥ 9，且商户关键词命中数 === 0
- **Pass Condition**: 9+ cards，0 brand names
- **Evidence**: DOM counts + grep

### AC-3: 交通攻略三要素覆盖
- **Type**: `rubric`
- **Dimension**: 交通攻略详实度（机场/公交/出租车/自驾）
- **Scale**: 1–5
- **Anchors**: 1 = 仅一句话概括；3 = 每条有 1–2 步骤且无时长/注意；5 = 4 种交通方式全部拆分"步骤/预计耗时定性/费用定性/高峰避坑"四要素，机场路线明确提及 KKIA Airport Metro → 橙线 → Malaz Station 换乘
- **Pass Threshold**: >= 4
- **Evidence**: `Read` 交通板块内容长度 + 四要素出现频率

### AC-4: 季度游览策略表完整
- **Type**: `rule`
- **Given**: `#seasonal` 板块
- **When**: 检查表头：季度 / 气温 / 适合人群 / 穿着 / 备注
- **Then**: 4 行 × 5 列齐全，且至少 3 条备注提及文化/环境因素（祷告、斋月、风沙）
- **Pass Condition**: Table shape(4,5) present & >=3 cultural/ecological notes
- **Evidence**: Read table

### AC-5: 人群+通用路线共 5 条
- **Type**: `rule`
- **Given**: `#itineraries` 板块
- **When**: 枚举子路线 section / article 标题
- **Then**: 包含「亲子家庭」「摄影自然」「低体力无障碍」「通用半日(3h)」「通用全日(6h)」五者齐全，每条路线有序列表节点 >= 3
- **Pass Condition**: 5 distinct itineraries; each has >=3 ordered steps
- **Evidence**: Read section

### AC-6: 访客责任 ≥7 条
- **Type**: `rule`
- **Given**: `#responsibility` 板块
- **When**: 枚举责任条目
- **Then**: 同时包含：节水 / 分类 / 文化尊重 / 湖岸安全 / 儿童看护 / 隐私与拍照 / 投喂禁令
- **Pass Condition**: 7 条齐全，每条 ≥1 句解释
- **Evidence**: Read responsibility list

### AC-7: 历史故事≥5阶段可追溯
- **Type**: `rubric`
- **Dimension**: 历史内容专业性与可追溯性
- **Scale**: 1–5
- **Anchors**: 1 = 仅一句"建成于 2013"；3 = 3 阶段但缺少可验证引用提示；5 = 5 阶段齐全、每阶段有"公开资料来源/谨慎说法"声明、对命名、喷泉技术、2030 联动有说明但不虚构
- **Pass Threshold**: >= 4
- **Evidence**: Read story section paragraphs count & statements about sourcing

### AC-8: SEO 标题与 JSON-LD 一致性
- **Type**: `rule`
- **Given**: `<title>` 与 `<script type=application/ld+json>` 两段
- **When**: 正则检查 title === `منتزه الملك عبدالله بالرياض - دليل سياحي شامل`，并 JSON-LD 中包含 `alternateName` "King Abdullah Park - Riyadh Travel Guide"
- **Then**: 全部命中
- **Pass Condition**: Title exact match + alternateName value present
- **Evidence**: Read `<head>` + grep JSON-LD block

### AC-9: 忽略文件到位
- **Type**: `rule`
- **Given**: 仓库根
- **When**: 存在 `.gitignore` 与 `.cfignore`；均包含 `dist/` `.astro/` `.wrangler/` `node_modules/` `.env*` 至少 5 条
- **Then**: 两文件均存在且 5+ patterns
- **Pass Condition**: LS shows both files; Grep confirms 5+ patterns in each
- **Evidence**: LS + Grep on files
