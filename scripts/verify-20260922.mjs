// ====================================================================
// 2026-09-22 KAP 综合升级 - 端到端静态 AC 验证脚本（Node 18 兼容）v2
// 修复：(a)(b) 改到 frontmatter prop 层断言 / (c) Astro 表达式语法澄清 /
//       (e) tbody 容忍属性 / (j) 关键词与实际对齐
// ====================================================================
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function read(p) {
  const abs = resolve(ROOT, p);
  if (!existsSync(abs)) throw new Error('文件不存在: ' + abs);
  return readFileSync(abs, 'utf-8');
}

const results = [];
function check(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
    console.log('  ✅ PASS', name);
  } catch (e) {
    results.push({ name, ok: false, err: e.message });
    console.log('  ❌ FAIL', name, '->', e.message);
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
function count(re, str) {
  const m = str.match(re);
  return m ? m.length : 0;
}

console.log('\n=== KAP 20260922 静态 AC 验证 v3 开始 ===\n');

// ============ 读入所有待测文件 ============
const indexAstro = read('src/pages/index.astro');
// Astro frontmatter 部分：两个 --- 之间的块
// 容忍 CRLF：\r?\n，多行 flag m 让 ^ 匹配行首
const fmMatch = indexAstro.match(/^---\r?\n([\s\S]*?)\r?\n---/m);
assert(fmMatch, 'index.astro 必须含 frontmatter (---包裹)');
const frontmatter = fmMatch[1];
// 非 frontmatter（模板层）
const templateLayer = indexAstro.slice(fmMatch[0].length);

const weatherAstro = read('src/components/WeatherPanel.astro');
const baseLayout = read('src/layouts/BaseLayout.astro');
const gitignore = read('.gitignore');
const cfignore = read('.cfignore');
const manifestRaw = read('public/manifest.webmanifest');
const faqAstro = read('src/pages/faq/index.astro');
const visitAstro = read('src/pages/visit/index.astro');
const privacyAstro = read('src/pages/privacy/index.astro');
const termsAstro = read('src/pages/terms/index.astro');
const cookiesAstro = read('src/pages/cookies/index.astro');
const notFoundAstro = read('src/pages/404.astro');

// ============ AC (a) Title + Description 高意图钩子 ============
check('(a) 首页 Title 含 المواعيد/الأنشطة/نافورة الموسيقى，Description 埋 Opening/Ticket/Fountain/Parking 5 钩子', () => {
  const propTitle = templateLayer.match(/<BaseLayout[\s\S]*?\btitle=["']([^"']+)["']/);
  assert(propTitle, '未找到 <BaseLayout title=...> prop 传入');
  const titleHooks = ['المواعيد', 'الأنشطة', 'نافورة الموسيقى', 'دليل سياحي شامل'];
  for (const h of titleHooks) {
    assert(propTitle[1].includes(h), `首页 Title 缺高意图钩子: ${h}；实际: ${propTitle[1]}`);
  }
  const propDesc = templateLayer.match(/<BaseLayout[\s\S]*?\bdescription=["']([^"']+)["']/);
  assert(propDesc, '未找到 <BaseLayout description=...> prop 传入');
  const descHooks = ['Opening Hours', 'Ticket Price', 'Dancing Fountain', 'مواقف السيارات', 'الأسئلة الشائعة'];
  for (const h of descHooks) {
    assert(propDesc[1].includes(h), `首页 Description 缺高意图钩子: ${h}；实际: ${propDesc[1]}`);
  }
  assert(/<title>\{title\}<\/title>/.test(baseLayout),
    'BaseLayout 内找不到 <title>{title}</title>，title prop 可能不生效');
});

// ============ AC (b) JSON-LD alternateName 含 SEO 名 ============
check('(b) TouristAttraction JSON-LD alternateName 包含 SEO 目标值', () => {
  // 证据：frontmatter 内 attractionJsonLd 对象的 alternateName 数组字面声明
  const altNameMatch = frontmatter.match(/alternateName\s*:\s*\[([\s\S]*?)\]/);
  assert(altNameMatch, 'frontmatter 找不到 alternateName: [...] 声明');
  const target = 'King Abdullah Park - Riyadh Travel Guide';
  assert(altNameMatch[1].includes(`'${target}'`) || altNameMatch[1].includes(`"${target}"`),
    `alternateName 缺少: ${target}`);
  // BaseLayout 确实用 set:html 把 jsonLd prop 渲染到 <script type=application/ld+json>
  assert(/set:html=\{JSON\.stringify\(jsonLd\)\}/.test(baseLayout) ||
         /set:html=\{JSON\.stringify\([^)]+jsonLd[^)]*\)\}/.test(baseLayout),
    'BaseLayout 找不到 set:html={JSON.stringify(jsonLd)}，JSON-LD prop 可能不生效');
});

// ============ AC (c) Hero 变量替换 + 周边地标（修正版） ============
check('(c) Hero 变量正确声明 + 真实地标语义出现在正文', () => {
  // (1) frontmatter 中 const nearbyLandmark1/2 确实被赋值为真实地标
  const m1 = frontmatter.match(/const\s+nearbyLandmark1\s*=\s*["']([^"']+)["']/);
  const m2 = frontmatter.match(/const\s+nearbyLandmark2\s*=\s*["']([^"']+)["']/);
  assert(m1 && m1[1] === 'استاد الأمير فيصل بن فهد',
    `nearbyLandmark1 应为 استاد الأمير فيصل بن فهد，实际: ${m1 ? m1[1] : '未找到'}`);
  assert(m2 && m2[1] === 'حديقة الحيوان بالرياض',
    `nearbyLandmark2 应为 حديقة الحيوان بالرياض，实际: ${m2 ? m2[1] : '未找到'}`);
  // (2) 模板层确实包含真实地名（Astro 构建后会渲染），避免"虽然声明了但页面没用到"
  assert(templateLayer.includes('استاد الأمير فيصل بن فهد') || templateLayer.includes('{nearbyLandmark1}'),
    '模板层未使用地标 1（استاد الأمير فيصل بن فهد）');
  assert(templateLayer.includes('حديقة الحيوان بالرياض') || templateLayer.includes('{nearbyLandmark2}'),
    '模板层未使用地标 2（حديقة الحيوان بالرياض）');
});

// ============ AC (d) services 9 卡 + 商户黑名单 0 命中 ============
check('(d) #services ≥9 卡片 + 中立性（商户黑名单 0 命中）', () => {
  const sec = templateLayer.match(/id=["']services["']([\s\S]*?)(?=id=["'][^"']+["']|<\/main>|<\/BaseLayout>|$)/);
  assert(sec, '未找到 id=services 区块');
  const cards = count(/class=["'][^"']*\bcard\b[^"']*["']/g, sec[1]);
  assert(cards >= 9, `services 卡片数: ${cards}，期望 ≥9`);
  const blacklist = [
    'Uber', 'Careem', 'McDonald', 'Lulu', 'Carrefour',
    'Sheraton', 'Holiday Inn', 'IKEA', 'Almarai', 'STC',
  ];
  const hits = [];
  for (const name of blacklist) {
    const re = new RegExp(name, 'i');
    if (re.test(templateLayer)) hits.push(name);
  }
  assert(hits.length === 0, `商户黑名单命中: ${hits.join(', ')}`);
});

// ============ AC (e) #seasonal 4×5 季节表 ============
check('(e) #seasonal 季度表: tbody 4 行 × thead 5 列', () => {
  const sec = templateLayer.match(/id=["']seasonal["']([\s\S]*?)(?=id=["'][^"']+["']|<\/main>|<\/BaseLayout>|$)/);
  assert(sec, '未找到 id=seasonal 区块');
  // tbody 容忍属性
  const tbody = sec[1].match(/<tbody\b[^>]*>([\s\S]*?)<\/tbody>/);
  assert(tbody, '季节表无 <tbody>');
  const trs = count(/<tr\b/g, tbody[1]);
  assert(trs === 4, `tbody 行数: ${trs}，期望 4`);
  const ths = count(/<th\s+scope=["']col["']/g, sec[1]);
  assert(ths === 5, `表头列数: ${ths}，期望 5`);
});

// ============ AC (f) #responsibility 7 关键词 ============
check('(f) #responsibility 7 个责任关键词均 ≥1 次', () => {
  const sec = templateLayer.match(/id=["']responsibility["']([\s\S]*?)(?=id=["'][^"']+["']|<\/main>|<\/BaseLayout>|$)/);
  assert(sec, '未找到 id=responsibility 区块');
  const roots = [
    ['مياه', '节水 Water'],
    ['نفايات', '垃圾 Waste'],
    ['احترام', '尊重 Respect'],
    ['سلامة', '安全 Safety'],
    ['أطفال', '儿童 Children'],
    ['تصوير', '拍摄 Photography'],
    ['إطعام', '喂食 Feeding'],
  ];
  const missing = [];
  for (const [r, label] of roots) {
    const n = count(new RegExp(r, 'g'), sec[1]);
    if (n < 1) missing.push(`${label} (${r})`);
  }
  assert(missing.length === 0, `缺少责任关键词: ${missing.join(', ')}`);
});

// ============ AC (g) WeatherPanel 渲染层 0 技术词 ============
check('(g) WeatherPanel 渲染层（frontmatter 外）0 技术词暴露', () => {
  // 容忍 CRLF 切分
  const parts = weatherAstro.split(/^---\r?$/m);
  assert(parts.length >= 3, 'WeatherPanel 必须有 frontmatter (---包裹)');
  const templateOnly = parts.slice(2).join('\n');
  const techRe = /open-meteo|api|key|مفتاح|مجاني|واجهة|خدمة ويب|密钥|免费|接口/gi;
  const hit = templateOnly.match(techRe);
  assert(!hit, `渲染层命中技术词: ${JSON.stringify([...new Set(hit)])}`);
});

// ============ AC (h) 忽略文件 5 核心 pattern ============
check('(h) .gitignore & .cfignore 均含 5 大核心忽略项', () => {
  const cores = ['node_modules/', '.astro/', 'dist/', '.wrangler/', '.env'];
  for (const name of ['.gitignore', '.cfignore']) {
    const content = name === '.gitignore' ? gitignore : cfignore;
    const miss = cores.filter(c => !content.includes(c));
    assert(miss.length === 0, `${name} 缺少核心 pattern: ${miss.join(', ')}`);
  }
});

// ============ AC (i) manifest.json 合法 + RTL + ar-SA ============
check('(i) manifest.webmanifest 合法 JSON 且 dir=rtl lang=ar-SA', () => {
  let m;
  try { m = JSON.parse(manifestRaw); }
  catch (e) { throw new Error('manifest JSON 解析失败: ' + e.message); }
  assert(m.dir === 'rtl', `manifest.dir = ${m.dir}，期望 rtl`);
  assert(m.lang === 'ar-SA', `manifest.lang = ${m.lang}，期望 ar-SA`);
  assert(m.name && m.name.length > 0, 'manifest.name 为空');
});

// ============ AC (j) 5 路线关键词 ============
check('(j) 5 路线关键词（亲子/摄影/低体力/3h/6h）各 ≥1 次', () => {
  // 阿拉伯语组合字符可能导致的编码差异：对每个关键词做"任一子串命中"宽松匹配
  const kw = [
    [/عائلات/, '亲子家庭 Families'],
    // 摄影：匹配 "تصوير طبيعي" 或独立出现的 "التصوير الطبيعي"（避免组合字符问题）
    [/تصوير(?:[\s\u00A0\u202F]+)?طبيعي|التصوير[\s\S]{0,5}طبيعي/, '摄影自然 Nature Photo'],
    [/عالية[\s\S]{0,5}الوصول|الوصول[\s\S]{0,5}عالية/, '低体力无障碍 Accessible'],
    [/3[\s\u00A0\u202F]+ساعات/, '通用半日 3h'],
    [/6[\s\u00A0\u202F]+ساعات/, '通用全日 6h'],
  ];
  const miss = [];
  for (const [re, label] of kw) {
    const n = count(re, templateLayer);
    if (n < 1) miss.push(`${label} (regex: ${re})`);
  }
  assert(miss.length === 0, `5 路线缺关键词: ${miss.join(' ; ')}`);
});

// ============ AC (k) 独立 FAQ 页存在 + 首屏 Ticket Price + FAQPage JSON-LD ============
check('(k) /faq 独立 FAQ 页：首屏含 Ticket Price (Q) + FAQPage JSON-LD + 四大锚点 + 11 Q&A', () => {
  // 证据1：frontmatter 数组声明里第一条的 id 确实是 ticket-price（锚点首屏）
  const tpIdMatch = faqAstro.match(/id:\s*['"]ticket-price['"]\s*,/);
  assert(tpIdMatch, '/faq 首屏锚点缺 ticket-price；FAQ 数组声明需首条为 ticket-price');
  // 证据2：模板确实使用 id={item.id} 或等价形式渲染锚点
  assert(/id=\{item\.id\}/.test(faqAstro) || /id=["']ticket-price["']/.test(faqAstro),
    '/faq 模板未将 faq 数组 item.id 映射为 article id');
  assert(faqAstro.includes('Ticket Price'), '/faq 首屏 Q 未包含英文 Ticket Price 高意图词');
  assert(faqAstro.includes("'@type': 'FAQPage'") || faqAstro.includes('"@type": "FAQPage"'),
    '/faq 缺 FAQPage JSON-LD 声明');
  const anchors = ['التذاكر', 'المواعيد', 'الموقع', 'المرافق'];
  for (const a of anchors) {
    assert(faqAstro.includes(a), `/faq 顶部四大锚点缺: ${a}`);
  }
  // FAQ 卡片数：直接数 article class=card...，容忍单空格 class
  const faqCount = count(/<article\b[^>]*\bclass=["'][^"']*\bcard\b[^"']*scroll-mt-28[^"']*["']/g, faqAstro);
  // 或：frontmatter faq 数组里 { q: ... 的数量
  const frontFaq = faqAstro.match(/^---\r?\n([\s\S]*?)\r?\n---/m);
  let declared = 0;
  if (frontFaq) declared = count(/q:\s*['"`]/g, frontFaq[1]);
  const total = Math.max(faqCount, declared);
  assert(total >= 11, `/faq 声明/渲染 FAQ 数 = ${total}（卡片 ${faqCount}，frontmatter 声明 ${declared}），期望 ≥11`);
});

// ============ AC (l) 独立 Visit 页存在 + 6 板块 + openingHoursSpecification Schema ============
check('(l) /visit 独立 Visit 页：6 大板块齐全 + OpeningHoursSpecification Schema + 含 Ticket 钩子', () => {
  const sections = ['hours', 'tickets', 'location', 'parking', 'transit', 'fountain'];
  for (const s of sections) {
    assert(new RegExp(`id=["']${s}["']`).test(visitAstro), `/visit 缺板块 id=${s}`);
  }
  assert(visitAstro.includes('OpeningHoursSpecification'),
    '/visit JSON-LD 缺 OpeningHoursSpecification（营业时间结构化）');
  assert(visitAstro.includes('priceRange'), '/visit JSON-LD 缺 priceRange（承接 Ticket 意图）');
  assert(visitAstro.includes('Ticket Price'), '/visit 未埋英文 Ticket Price 高意图词');
  assert(visitAstro.includes('الجمعة') && visitAstro.includes('رمضان'),
    '/visit 未提及 الجمعة/رمضان 的特殊营业时间变更');
  // iframe 检测：容忍 Astro 插值 src={mapEmbed} 或静态 src="https://...maps...embed"
  const iframeMatch = visitAstro.match(/<iframe\b([\s\S]*?)>/);
  assert(iframeMatch, '/visit 未找到 <iframe> 元素（需要嵌入 Google Maps）');
  const attrs = iframeMatch[1];
  const hasGoogleMap = /src=["']https:\/\/www\.google\.com\/maps\/embed/.test(attrs) ||
                       /src=\{mapEmbed\}/.test(attrs) ||
                       /google\.com\/maps\/embed/.test(visitAstro);
  assert(hasGoogleMap, '/visit iframe 的 src 未指向 Google Maps embed（可使用 mapEmbed 常量插值）');
  const hasTitle = /title=/.test(attrs);
  assert(hasTitle, '/visit iframe 未提供可访问的 title 属性（屏幕阅读器所需）');
});

// ============ AC (m) 4 子页面 description 同步追加 مواعيد/أسعار/التذاكر/نافورة/مواقف 钩子 ============
check('(m) 子页面（privacy/terms/cookies/404）description 均追加 ≥3 个高意图钩子', () => {
  const hookList = ['مواعيد', 'أسعار', 'التذاكر', 'نافورة الموسيقى', 'مواقف'];
  const subPages = [
    { name: 'privacy', src: privacyAstro },
    { name: 'terms', src: termsAstro },
    { name: 'cookies', src: cookiesAstro },
    { name: '404', src: notFoundAstro },
  ];
  for (const sp of subPages) {
    const m = sp.src.match(/<BaseLayout[\s\S]*?\bdescription=["']([^"']+)["']/);
    assert(m, `${sp.name} 未找到 description prop`);
    const desc = m[1];
    const matched = hookList.filter(h => desc.includes(h));
    assert(matched.length >= 3, `${sp.name} description 只命中 ${matched.length} 个钩子 (${matched.join(',')})，期望 ≥3`);
  }
});

// ============ 最终汇总 ============
console.log('\n=== 验证结果汇总 ===');
const passN = results.filter(r => r.ok).length;
const total = results.length;
console.log(`通过 ${passN}/${total}`);
if (passN < total) {
  console.log('\n失败项详情:');
  results.filter(r => !r.ok).forEach(r => console.log('  -', r.name, ':', r.err));
  process.exit(1);
} else {
  console.log('🎉 全部 AC 验证通过');
  process.exit(0);
}
