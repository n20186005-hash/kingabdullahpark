# King Abdullah Park Riyadh - 专业科普落地页全面升级 (Implementation Plan)
> **状态更新**: 2026-09-22 — 全部 11 个 Task 均已完成 (all completed)，Review R1 = PASS。

## Task 1: SEO Title 全站点统一 & BaseLayout 小调整
- **Status**: `completed` ✅
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 统一首页 title = `منتزه الملك عبدالله بالرياض - دليل سياحي شامل`，meta description 追加英文 SEO 关键词"Tourist Attraction in Riyadh, Al Malaz"。
  - 将 privacy / terms / cookies / 404 页面的 title 同步更新为"页面类型 + منتزه الملك عبدالله بالرياض - دليل سياحي شامل"结构。
  - JSON-LD TouristAttraction `alternateName` 增加一个英文 SEO 别名：`"King Abdullah Park - Riyadh Travel Guide"`。
- **Acceptance Criteria Addressed**: AC-8
- **Evidence**: `scripts/verify-20260922.mjs (a)(b)` 全通过；子页面 title 人工读取确认。

## Task 2: 创建天气组件 WeatherPanel.astro（Server-side Open-Meteo + 10min 缓存）
- **Status**: `completed` ✅
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 新建 `src/components/WeatherPanel.astro`（L1-273）。
  - frontmatter 使用 top-level await 调用 `fetch('https://api.open-meteo.com/v1/forecast?...')`（参数：latitude=24.6664, longitude=46.7346, hourly=temperature_2m,apparent_temperature,precipitation_probability, daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunshine_duration,precipitation_probability_max, timezone=Asia/Riyadh, forecast_days=7）。
  - 用模块级 Map 实现 10 分钟缓存：key = `Math.floor(Date.now() / 600000)`，value = ParsedWeather；过期自动刷新。
  - 网络失败时 fallback：显示温和提示「البيانات الحالية غير متاحة الآن. يرجى الرجوع إلى الأرصاد الرسمية قبل الذهاب.」（无技术字眼）。
  - 渲染：顶部实时卡（°C、体感、天气短语、5 档穿衣建议、仅 ≥40% 降水才显示伞建议）+ 下方 7 日 flex 小卡（日期/最高/最低/降水%/emoji 图标）。
  - **严禁**：渲染层零技术暴露；通过 `scripts/verify-20260922.mjs (g)`。
- **Acceptance Criteria Addressed**: AC-1, NFR-2, NFR-4
- **Evidence**: `scripts/verify-20260922.mjs (g)` PASS；`scripts/test-weather-panel.mjs` 6/6 全 PASS。

## Task 3: 历史文化板块深度扩展（5 阶段+科普轶事）
- **Status**: `completed` ✅
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 分 5 段时间轴：① 1950s–2003 赛马场与东扩 ② 2003–2010 重新定位 ③ 2013 开幕（面积/喷泉/湖 4 数据卡）④ 2030 愿景与利雅得绿 ⑤ 命名溯源+喷泉技术+方法论边界声明（对无来源传说明确说"拒绝虚构"）
  - 每段均有"公开资料显示/未核实/未找到官方单一可追溯依据"等严谨性声明。
- **Acceptance Criteria Addressed**: AC-7
- **Evidence**: Review R1 CP-U7 = 5/5 分。

## Task 4: 中立访客服务设施扩展至 ≥9 类 + 访客服务概述
- **Status**: `completed` ✅
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 9 张卡片：WC+清真寺 / 无障碍 / 母婴哺乳 / 安保&失物&急救 / 食品饮料 / 住宿 / 商超+药房 / 加油+EV 充电 / 宠物政策。
  - 每卡 ≥3 条有序建议，全部类型中立，0 商户名。
- **Acceptance Criteria Addressed**: AC-2
- **Evidence**: `scripts/verify-20260922.mjs (d)` ≥9 卡 + 黑名单 0 命中。

## Task 5: 交通攻略四要素扩展（机场/地铁/巴士/出租/自驾）
- **Status**: `completed` ✅
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 5 种交通方式，每种四要素齐全：① 3+ 条有序步骤 ② 右上 chip 时长定性（قصيرة / متوسطة / طويلة）③ 右上 chip 费用定性（منخفض / متوسط / مرتفع）④ 底部高峰避坑段落。
  - ✈️ 机场链路：KKIA → 机场地铁 → 换乘 Orange Line → Al Malaz Station → 步行/短程，完全命中 PRD 指定路径。
  - 全程 0 打车 App 名 / 0 地铁 App 名，只写「تطبيق النقل الرسمي」。
- **Acceptance Criteria Addressed**: AC-3
- **Evidence**: Review R1 CP-U3 = 5/5 分。

## Task 6: 季度游览策略表（4行×5列）
- **Status**: `completed` ✅
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - 插入 `#seasonal` 板块，table 结构：`<caption class=sr-only>` + `<thead>` 5 `<th scope=col>` + `<tbody>` 4 `<tr>`（冬/春/夏/秋）。
  - 五列：الربع / نطاق درجة الحرارة / الفئات المناسبة / ملابس مقترحة / ملاحظات بيئية وثقافية。
  - 备注列 ≥3 文化/生态提示：祷告时间规律 / 斋月回历前移 10-11 天 / 春末沙尘暴 / 夏季正午 11-17 禁步行 / 11 月利雅得季拥堵。
- **Acceptance Criteria Addressed**: AC-4
- **Evidence**: `scripts/verify-20260922.mjs (e)` 4×5 shape PASS。

## Task 7: 五类路线板块（3 人群+半日/全日）
- **Status**: `completed` ✅
- **Priority**: high
- **Depends On**: None
- **Description**:
  - 5 条独立卡：① 亲子家庭（3.5h，6 步）② 摄影自然（4h，6 步）③ 低体力无障碍（2-3h，6 步）④ 通用半日 3h（5 步）⑤ 通用全日 6h（含一餐+周边地标串联，4 步）。
  - 每张卡：时长 / 体力级别 / 步行量 三芯片 + ≥3 条有序步骤 + 末尾提醒段落。
- **Acceptance Criteria Addressed**: AC-5
- **Evidence**: `scripts/verify-20260922.mjs (j)` 5 关键词全命中。

## Task 8: 访客责任板块（7 条）+ 服务概述
- **Status**: `completed` ✅
- **Priority**: medium
- **Depends On**: Task 4
- **Description**:
  - `#visitor` 引导段说明"نوصي دائماً بنوع الخدمة والتصنيف العام لا باسم متجر..."。
  - `#responsibility` 板块：7 条责任清单（مياه/نفايات/احترام/سلامة/أطفال/تصوير/إطعام）+ 2 篇科普文（中水灌溉 & 水稀缺背景；沙特公园 50 年演进 & 2030 联动）+ 5 项出门清单小包建议。
- **Acceptance Criteria Addressed**: AC-6
- **Evidence**: `scripts/verify-20260922.mjs (f)` 7 词根全命中 ≥1。

## Task 9: 部署忽略文件（.gitignore + .cfignore）+ wrangler.jsonc 校验
- **Status**: `completed` ✅
- **Priority**: medium
- **Depends On**: None
- **Description**:
  - `.gitignore` 补齐：node_modules/ dist/ .astro/ .wrangler/ .env .env.* *.log download/ + 编辑器
  - `.cfignore` 与 `.gitignore` 内容同步（保证 `wrangler deploy` 不上传冗余文件）。
  - `wrangler.jsonc` 校验：Pages 模式 `assets.directory ./dist` 指向正确 ✅（对应 Astro static 输出）；无需 build.command。
- **Acceptance Criteria Addressed**: AC-9
- **Evidence**: `scripts/verify-20260922.mjs (h)` 双文件 5 核心 pattern 全命中；wrangler.jsonc L6 人工读取确认。

## Task 10: 组装 index.astro（插入天气/季度表/路线/责任板块顺序 + 变量 + alt 修正）
- **Status**: `completed` ✅
- **Priority**: high
- **Depends On**: Task 1–9 全部
- **Description**:
  - 板块最终顺序（从上到下）：
    Hero → `#story` → WeatherPanel → `#seasonal` 季度表 → 特色三卡（History & Significance）→ `#visit` 参观须知 → `#transport` 交通 → `#itineraries` 路线 → `#visitor` 服务引导 → `#services` 9 中立卡 → 餐饮 4 卡 → 周边 4 地标 → `#responsibility` 责任 7+2 科普 → 地图 + 官方外链 → `#sources` → FAQ → CTA。
  - Hero 正文 Astro 模板表达式 `{nearbyLandmark1}` / `{nearbyLandmark2}` 已正确声明（`const nearbyLandmark1 = 'استاد الأمير فيصل بن فهد'` 等），并追加了 حي الملز 语义。
  - 原特色 3 卡 / 餐饮 4 卡 / 周边 4 地标 / FAQ 7 条 / Sources 4 外链 / CTA **100% 保留无删减**。
- **Acceptance Criteria Addressed**: AC-1..AC-9 端到端
- **Evidence**: 人工对照原始文件骨架 + L2 正则验证 10/10。

## Task 11: 端到端独立验证与静态检查（无需 Node>=22 的 build）
- **Status**: `completed` ✅
- **Priority**: high
- **Depends On**: Task 10
- **Description**:
  - **11.A (LSP)**: `GetDiagnostics` 对 `index.astro` / `BaseLayout.astro` / `WeatherPanel.astro` → 全部 `[]` 0 错误。
  - **11.B (静态 AC)**: `scripts/verify-20260922.mjs` → 10/10 规则断言全通过，exit code 0。
  - **11.C (行为单元)**: `scripts/test-weather-panel.mjs` → 6/6 场景断言全通过（热天+高降水 / 冷天+低降水 / 5 档分档边界），exit code 0。
- **Acceptance Criteria Addressed**: 全部 AC 汇总验证
- **Evidence**: 三次命令行 exit 0 输出日志 + Review R1。

---

### 计划完成度
- 11 / 11 Tasks = **100%**
- Review R1 = **PASS**（见 [review.md](./review.md)）
- 交付物位置：
  - 代码：`src/pages/index.astro`, `src/components/WeatherPanel.astro`, `src/layouts/BaseLayout.astro`, `src/pages/{privacy,terms,cookies}/*`, `src/pages/404.astro`, `public/manifest.webmanifest`, `.gitignore`, `.cfignore`
  - 验证脚本：`scripts/verify-20260922.mjs`, `scripts/test-weather-panel.mjs`
  - Spec Artifacts：`spec.md` / `tasks.md` / `review.md`（本目录）
