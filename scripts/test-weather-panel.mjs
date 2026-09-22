// ====================================================================
// 2026-09-22 KAP Weather Panel helpers 单元测试 v2
// 对照用户文档「天气模块｜面向普通游客的智能建议逻辑」
// 断言 5 大典型场景全部命中对应文案数组关键词
// ====================================================================

// --------- 以下代码与 WeatherPanel.astro L143-L366 helper 同步 ---------
function wmoLabel(code, precipProb) {
  if (code >= 95) return 'عواصف رعدية';
  if (precipProb >= 60 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'محتمل المطر';
  if (code >= 45 && code <= 48) return 'ضباب أو دخان';
  if (precipProb >= 30 || (code >= 3 && code <= 4)) return 'غيوم متفرقة';
  if (code >= 1 && code <= 2) return 'شمس مع سحب خفيفة';
  if (code === 0) return 'صافٍ';
  return 'صافٍ بشكل عام';
}
function rainIntensityLabel(code, precipProb, precipMmNow = 0) {
  if (code >= 95) return 'عاصفة رعدية';
  if ((code >= 81 && code <= 82) || (code >= 63 && code <= 67)) return 'مطر متوسط إلى غزير';
  if (code >= 51 || code === 61 || code === 80 || precipMmNow > 0.1) return 'مطر خفيف أو رذاذ';
  if (precipProb >= 60) return 'فرصة عالية للمطر';
  return '';
}

function buildRiskAlerts(c, today) {
  const alerts = [];
  const hasThunder = c.code >= 95;
  const heavyRain =
    (c.code >= 81 && c.code <= 82) ||
    (c.code >= 63 && c.code <= 67) ||
    (today && today.precipSumMm >= 10);
  const windVeryStrong = c.gustKph >= 50 || (today && today.gustMaxKph >= 50);
  const extremeHeat = c.tempC >= 42 || (today && today.tempMaxC >= 44);
  const badFog = c.code >= 45 && c.visibilityKm <= 2;

  if (hasThunder) {
    alerts.push('⚠️ تحذير صحّة وسلامة: هطل رعدي متوقّع. ابتعد عن الأشجار العالية وحدائق البحيرات والمرتفعات، واغلق النوافذ في المقاهي المفتوحة داخل المنتزه.');
  }
  if (heavyRain && !hasThunder) {
    alerts.push('⚠️ هطول غزير متوقّع: تجنّب المناطق المنخفضة، واحرص على ألا تقترب من ضفاف بحيرة المنتزه. قد تتوقف نافورة الموسيقى المؤقتة مؤقتاً.');
  }
  if (windVeryStrong && !heavyRain && !hasThunder) {
    alerts.push('⚠️ رياح قوية: أبقِ معك قبعة وأشياء خفيفة ثابتة، وابتعد عن الألواح الإعلانية وأشجار النخيل الكبيرة داخل الملاعب.');
  }
  if (extremeHeat && !hasThunder) {
    alerts.push('⚠️ حرارة قصوى: لا تمشِ في الفترة من 11 صباحاً حتى 5 مساءً في المسارات المفتوحة. استخدم المظلات والكنائس المظللة والمطاعم المكيفة داخل المنتزه.');
  }
  if (badFog && !hasThunder && !heavyRain) {
    alerts.push('⚠️ ضباب كثيف أو تراب: انتبه عند السير على الأرصفة وبحافز البحيرة، وخفّض سرعة السيارات في مواقف المنتزه.');
  }
  return alerts;
}

function buildOutfitAdvice(c, todayDelta) {
  const list = [];
  const { tempC, apparentC, humidity, windKph, precipProbNow, code } = c;
  if (apparentC >= 40) list.push('ملابس قطنية فاتحة وواسعة جداً؛ يفضّل تجنّب الألوان الداكنة والأقمشة الصوفية والجلدية.');
  else if (apparentC >= 32) list.push('ملابس خفيفة قصيرة أو طويلة قطنية تنفّس؛ مع واقٍ للشمس وغطاء للرأس.');
  else if (apparentC >= 22) list.push('أقمشة تنفّس مع قميص أو فستان طويل للوقاية من الشمس.');
  else if (apparentC >= 15) list.push('سترة خفيفة أو سترة قابلة للطيّ خصوصاً بعد غروب الشمس.');
  else list.push('سترة دافئة وسترة داخلية، مع شال أو كوفيّة عند الخروج في الليل.');

  if (tempC >= 30 && humidity >= 65) list.push('رطوبة عالية مع الحرارة: تجنّب الملابس الاصطناعية الغير قابلة للتنفّس، وخذ معك تغيير إضافي بسيط.');
  if (tempC <= 18 && humidity >= 70) list.push('جو بارد ورطب: ارتدي طبقات ثقيلة قليلة الامتصاص بدل طبقة واحدة سميكة.');
  if (todayDelta >= 9) list.push(`فرق حرارة اليوم والليل كبير (حوالي ${Math.round(todayDelta)} درجة)؛ خذ سترة قابلة للطيّ معك حتى لو كان الجو دافئاً نهاراً.`);

  const rainy = precipProbNow >= 40 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
  const windy = windKph >= 28;
  if (rainy && windy) list.push('مطر مع رياح: ارتدي سترة مقاومة للماء بدل المظلة الطويلة (تقلبها الرياح سهلة).');
  else if (rainy) list.push('مطر متوقّع: أحذية مقاومة للبلل ستفيد كثيراً عند مشي الأرصفة حول البحيرة.');
  if (windy && !rainy) list.push('رياح متوسطة إلى قوية: لا ترتدي الفساتين الطويلة الرقيقة أو الأوشحة الفضفاضة.');
  return list;
}

function buildPlayPlan(c) {
  const plan = [];
  const { apparentC, precipProbNow, uvNow, code, visibilityKm } = c;
  const rainNow = precipProbNow >= 40 || (code >= 51 && code <= 82);
  const thunder = code >= 95;

  if (apparentC >= 35) {
    plan.push('أقصر وقت المشي في الفترة الحارة؛ يفضّل زيارة المنتزه بعد العصر أو ليلاً عندما تنخفض الحرارة، وتعمل نافورة الموسيقى والإضاءة الليلية.');
  } else if (apparentC >= 18 && !rainNow) {
    plan.push('جو ممتاز للتنزه المشي على مسارات البحيرة والجلوس في المساحات الخضراء.');
  }

  if (rainNow || thunder) {
    plan.push('توقّف مؤقت لنافورة الموسيقى والمشاريع المفتوحة على الماء محتمل؛ أغلق أنشطة الألعاب المائية للأطفال عند ظهور أول هطول.');
    plan.push('راقب أطفالك عن كثب عند ضفاف البحيرة والممرات الزلقة بعد المطر.');
  } else {
    plan.push('نافورة الموسيقى وعروض الإضاءة الليلية تعمل عادةً بعد المغرب؛ تحقق من جداول المنتزه الرسمية عند الوصول.');
  }
  if (!rainNow && visibilityKm >= 8 && (code <= 2 || precipProbNow < 20)) {
    plan.push('رؤية صافية اليوم، مناسبة جداً لالتقاط الصور في ممرات النخيل وحول البحيرة والمنحوتات الخضراء.');
  }
  if (uvNow >= 5 && !rainNow) {
    plan.push('أشعة الشمس القادوة اليوم؛ خذ فترات راحة في المناطق المظللة والمطاعم كل ٣٠-٤٥ دقيقة، ولا تدع الأطفال يلعبون مباشرة تحت الشمس لفترات طويلة.');
  }
  if ((code >= 3 && code <= 4) && precipProbNow < 30 && !rainNow) {
    plan.push('غيوم خفيفة اليوم، الظلّ طبيعي ومناسب لجولة طويلة أو نزهة عائلية بدون إرهاق حراري.');
  }
  if (!rainNow && apparentC >= 15 && apparentC <= 32 && !thunder) {
    plan.push('جو مناسب للنزهة العائلية في المساحات الخضراء؛ لا تنسَ مفرش ناعم وطفاية للنار إذا استخدمت شواء محمول (في أماكنه المخصصة فقط).');
  }
  return plan;
}

function buildCarryItems(c) {
  const items = [];
  const { apparentC, humidity, precipProbNow, windKph, uvNow, code, visibilityKm } = c;
  const rainNow = precipProbNow >= 40 || (code >= 51 && code <= 82);
  const windy = windKph >= 28;

  if (apparentC >= 28 || humidity <= 30) {
    items.push('كمية ماء كافية لكل فرد (نصف لتر على الأقل لكل ساعتين مشي)؛ تعبئة من المياه تعيد ملء القنينة في مواقع المنتزه إن توفرت.');
  }
  if (apparentC >= 35) items.push('مرطّبات فموية ومسحوق أملاح بسيط أو مشروب مع أملاح لإعادة التوازن عند التعرّق الكثير.');
  if (uvNow >= 5) {
    items.push('واقٍ شمس قوي، ونظارة شمسية، وغطاء رأس واسع الحواف.');
  }

  if (precipProbNow >= 70 || (code >= 61 && code <= 67)) {
    items.push(windy ? 'معطف مطار قابل للطيّ (أفضل من مظلة طويلة مع الرياح)' : 'مظلة واقية كبيرة.');
  } else if (precipProbNow >= 40) {
    items.push('مظلة طيّبة صغيرة كاحتياط يومي حتى لو لم يظهر المطر بعد.');
  }
  if (windy && !rainNow) {
    items.push('قبعة بشريط تحت الذقن أو قبعة رياضية لكي لا تُطيرها الرياح.');
  }
  if (apparentC <= 15) {
    items.push('سترة دافئة إضافية وكمّامات لليدين عند المشي ليلاً أو الانتظار طويلاً.');
  }
  if (humidity <= 25 || (code >= 45 && !(code <= 48 && code >= 45 && visibilityKm < 3))) {
    items.push('مناديل مبللة ومرطب للشفاه؛ جو الرياض الجاف يسبب تشققاً سريعاً.');
  }
  if (code >= 45 && c.visibilityKm <= 3) {
    items.push('كمامة للوجه لحماية من الغبار أو الرذاذ المتطاير مع الرياح.');
  }
  return items;
}
// ----------- 以上 helper 与 WeatherPanel.astro 同步 -----------

let pass = 0; let fail = 0;
function test(name, fn) {
  try { fn(); console.log('  ✅', name); pass++; }
  catch (e) { console.log('  ❌', name, '->', e.message); fail++; }
}
const any = (arr, sub) => arr.some(s => s.includes(sub));
const none = (arr, sub) => arr.every(s => !s.includes(sub));
function assert(c, m) { if (!c) throw new Error(m); }

console.log('\n=== WeatherPanel v2 — 5 典型场景单元测试 ===\n');

// ---------- 场景 A：利雅得夏天典型（晴 38°C 体感 42°C / UV 7 / 湿度 20% / 无风）----------
test('A-夏日烈阳 38°C UV7 出行穿搭 含 قطنية فاتحة + واقٍ للشمس', () => {
  const c = { tempC: 38, apparentC: 42, precipProbNow: 5, code: 0, humidity: 20, windKph: 6, gustKph: 10, uvNow: 7, visibilityKm: 15 };
  const today = { tempMaxC: 43, tempMinC: 30, precipSumMm: 0, uvMax: 9, windMaxKph: 12, gustMaxKph: 20 };
  const outfit = buildOutfitAdvice(c, today.tempMaxC - today.tempMinC); // delta = 13
  assert(any(outfit, 'قطنية فاتحة وواسعة جداً'), '缺极热宽松衣物建议');
  assert(any(outfit, 'فرق حرارة اليوم والليل كبير'), '缺昼夜温差 >=9 的外套建议');
  assert(any(outfit, 'سترة قابلة للطيّ'), '温差应该带外套');
});
test('A-夏日烈阳 风险预警：含「حرارة قصوى」极端高温红框', () => {
  const c = { tempC: 42, apparentC: 46, precipProbNow: 0, code: 0, humidity: 18, windKph: 8, gustKph: 14, uvNow: 10, visibilityKm: 12 };
  const today = { tempMaxC: 45, tempMinC: 32, precipSumMm: 0, uvMax: 11, windMaxKph: 15, gustMaxKph: 25 };
  const r = buildRiskAlerts(c, today);
  assert(r.length >= 1, '极端高温应有风险预警');
  assert(any(r, 'حرارة قصوى'), '红框应有「حرارة قصوى」关键词');
  assert(any(r, '11 صباحاً حتى 5 مساءً'), '应明确中午时间禁令');
});
test('A-夏日烈阳 游玩安排 含「بعد العصر أو ليلاً」 + 「نافورة الموسيقى」', () => {
  const c = { tempC: 39, apparentC: 44, precipProbNow: 10, code: 1, humidity: 15, windKph: 5, gustKph: 9, uvNow: 8, visibilityKm: 18 };
  const plan = buildPlayPlan(c);
  assert(any(plan, 'بعد العصر أو ليلاً'), '酷热应推荐夜逛');
  assert(any(plan, 'نافورة الموسيقى'), '应提喷泉灯光秀');
  assert(any(plan, 'أشعة الشمس القادوة اليوم'), 'UV>=5 应有儿童防晒休息建议');
});
test('A-夏日烈阳 随身物品 含 「كمية ماء كافية」 + 「واقٍ شمس」 + 「مناديل مبللة」(干燥)', () => {
  const c = { tempC: 38, apparentC: 44, precipProbNow: 5, code: 0, humidity: 18, windKph: 6, gustKph: 10, uvNow: 7, visibilityKm: 15 };
  const i = buildCarryItems(c);
  assert(any(i, 'كمية ماء كافية'), '高温必须带水');
  assert(any(i, 'واقٍ شمس قوي'), 'UV>=5 必须防晒');
  assert(any(i, 'مناديل مبللة ومرطب للشفاه'), '干燥<=25% 必须润唇湿巾');
  assert(any(i, 'مسحوق أملاح بسيط'), '>=35°C 必须补液盐');
  assert(none(i, 'مظلة'), '高温但几乎无雨不应带伞');
});

// ---------- 场景 B：雷暴大风 19°C / code=96 / p=85% / gust 58 kph ----------
test('B-雷暴大雨 风险预警含「هطل رعدي」 + 避树避湖', () => {
  const c = { tempC: 19, apparentC: 17, precipProbNow: 85, code: 96, humidity: 90, windKph: 38, gustKph: 58, uvNow: 1, visibilityKm: 1 };
  const today = { tempMaxC: 22, tempMinC: 17, precipSumMm: 18, uvMax: 2, windMaxKph: 42, gustMaxKph: 60 };
  const r = buildRiskAlerts(c, today);
  assert(any(r, 'هطل رعدي متوقّع'), '雷暴应有雷暴警告');
  assert(any(r, 'حدائق البحيرات'), '雷暴应提醒远离湖边');
  assert(any(r, 'الأشجار العالية'), '雷暴应提醒远离高树');
});
test('B-雷暴大雨 穿搭：含 سترة مقاومة للماء بدل المظلة', () => {
  const c = { tempC: 19, apparentC: 17, precipProbNow: 85, code: 96, humidity: 90, windKph: 38, gustKph: 58, uvNow: 1, visibilityKm: 1 };
  const outfit = buildOutfitAdvice(c, 22 - 17);
  assert(any(outfit, 'سترة مقاومة للماء بدل المظلة الطويلة'), '雨+风必须推雨衣不推长柄伞');
});
test('B-雷暴大雨 游玩安排：含「توقف مؤقت لنافورة الموسيقى」 + 「راقب أطفالك عن كثب عند ضفاف البحيرة」', () => {
  const c = { tempC: 19, apparentC: 17, precipProbNow: 80, code: 95, humidity: 92, windKph: 40, gustKph: 60, uvNow: 0, visibilityKm: 1 };
  const plan = buildPlayPlan(c);
  assert(any(plan, 'توقّف مؤقت لنافورة الموسيقى'), '暴雨应提喷泉可能关停');
  assert(any(plan, 'راقب أطفالك عن كثب عند ضفاف البحيرة'), '雨天地滑应提醒儿童湖边看护');
});
test('B-雷暴大雨 随身物品：含 「معطف مطار قابل للطيّ」', () => {
  const c = { tempC: 19, apparentC: 17, precipProbNow: 85, code: 96, humidity: 90, windKph: 45, gustKph: 65, uvNow: 0, visibilityKm: 0.5 };
  const i = buildCarryItems(c);
  assert(any(i, 'معطف مطار قابل للطيّ'), '雨+大风推雨衣而非伞');
  assert(none(i, 'واقٍ شمس'), '雷暴不应推防晒');
});
test('B-雷暴大雨 标签：wmoLabel code=96 = عواصف رعدية | rainIntensityLabel = عاصفة رعدية', () => {
  assert(wmoLabel(96, 0) === 'عواصف رعدية');
  assert(rainIntensityLabel(96, 0) === 'عاصفة رعدية');
});

// ---------- 场景 C：秋季温和晴天 26°C / UV 4 / 阴天 / 湿度 45%（好逛 + 野餐）----------
test('C-秋高气爽 游玩安排含「جو مناسب للنزهة العائلية」 + 「المنحوتات الخضراء」', () => {
  const c = { tempC: 26, apparentC: 26, precipProbNow: 10, code: 2, humidity: 45, windKph: 10, gustKph: 15, uvNow: 4, visibilityKm: 14 };
  const plan = buildPlayPlan(c);
  assert(any(plan, 'جو ممتاز للتنزه'), '好天气应肯定步行');
  assert(any(plan, 'رؤية صافية اليوم'), '好能见度+>=8km+晴应提摄影');
  assert(any(plan, 'جو مناسب للنزهة العائلية'), '适合野餐的天气必须 picnic');
  assert(any(plan, 'مفرش ناعم وطفاية للنار'), 'picnic 应提野餐毯+灭火器');
});
test('C-秋高气爽 随身物品 应空的保持空：无 مظلة + 无 معطف', () => {
  const c = { tempC: 26, apparentC: 26, precipProbNow: 10, code: 2, humidity: 45, windKph: 10, gustKph: 15, uvNow: 4, visibilityKm: 14 };
  const i = buildCarryItems(c);
  assert(none(i, 'مظلة'), 'p=10% 不应带伞（动态隐藏）');
  assert(none(i, 'معطف'), '不应带雨衣');
  assert(none(i, 'كمّامات لليدين'), '不应带手套');
  // 水 <=30 humidity 不触发；UV 4<5 不触发防晒；故只有 非空的必要提醒：
  // 注意：apparent=26 <28，humidity 45>30 → 水的条件不触发 ✓（动态隐藏）
});

// ---------- 场景 D：低温 + 大昼夜温差（冬季：10°C / 夜间 1°C / 温差 14°C）----------
test('D-冬季低温 10°C 昼夜 14°C 穿搭：含 سترة دافئة + 温差大 كبار', () => {
  const c = { tempC: 10, apparentC: 8, precipProbNow: 15, code: 3, humidity: 75, windKph: 14, gustKph: 22, uvNow: 3, visibilityKm: 12 };
  const o = buildOutfitAdvice(c, 14);
  assert(any(o, 'سترة دافئة وسترة داخلية'), '8°C 应推厚外套+内衬');
  assert(any(o, 'فرق حرارة اليوم والليل كبير'), '温差 14>=9 必须提');
  assert(any(o, 'جو بارد ورطب'), '10°C+75%湿度应提冷湿');
});
test('D-冬季低温 随身物品：含 سترة دافئة إضافية وكمّامات لليدين', () => {
  const c = { tempC: 9, apparentC: 6, precipProbNow: 10, code: 3, humidity: 75, windKph: 16, gustKph: 26, uvNow: 2, visibilityKm: 12 };
  const i = buildCarryItems(c);
  assert(any(i, 'سترة دافئة إضافية وكمّامات لليدين'), '冬季必须手套');
});

// ---------- 场景 E：大雾 / 浮尘 code=45 / visibility=1.5 / 风 32 kph ----------
test('E-大雾 风险预警 含「ضباب كثيف أو تراب」 + 「بحافز البحيرة」', () => {
  const c = { tempC: 22, apparentC: 22, precipProbNow: 10, code: 45, humidity: 88, windKph: 32, gustKph: 40, uvNow: 2, visibilityKm: 1.5 };
  const today = { tempMaxC: 25, tempMinC: 19, precipSumMm: 0, uvMax: 3, windMaxKph: 35, gustMaxKph: 48 };
  const r = buildRiskAlerts(c, today);
  assert(any(r, 'ضباب كثيف أو تراب'), '能见度<=2km 应红框大雾');
  assert(any(r, 'بحافز البحيرة'), '大雾湖边危险');
  assert(any(r, 'مواقف المنتزه'), '应提醒停车场减速');
});
test('E-大雾+风 随身物品：含 「كمامة للوجه」 + 「قبعة بشريط تحت الذقن」', () => {
  const c = { tempC: 22, apparentC: 22, precipProbNow: 10, code: 45, humidity: 88, windKph: 32, gustKph: 40, uvNow: 2, visibilityKm: 1.5 };
  const i = buildCarryItems(c);
  assert(any(i, 'كمامة للوجه'), '沙尘应推口罩');
  assert(any(i, 'قبعة بشريط تحت الذقن'), '风>=28 应推绑带帽');
});
test('E-大雾 标签：wmoLabel code=45 / p=10 应返回 ضباب أو دخان', () => {
  assert(wmoLabel(45, 10) === 'ضباب أو دخان');
});

// ---------- 场景 F：动态隐藏空数组确认（不该显示的绝不出现在结果里）----------
test('F-动态空数组隐藏 · 天气晴好 24°C p=5% · riskAlerts.length === 0', () => {
  const c = { tempC: 24, apparentC: 24, precipProbNow: 5, code: 0, humidity: 40, windKph: 9, gustKph: 14, uvNow: 4, visibilityKm: 16 };
  const today = { tempMaxC: 28, tempMinC: 20, precipSumMm: 0, uvMax: 5, windMaxKph: 12, gustMaxKph: 20 };
  const r = buildRiskAlerts(c, today);
  assert(r.length === 0, `晴好天不应有风险红框，实际 ${r.length} 条：${r.join(' | ')}`);
});

console.log('\n=== 单元测试汇总 ===');
console.log(`通过: ${pass}   失败: ${fail}`);
if (fail > 0) process.exit(1);
console.log('🎉 WeatherPanel v2 helpers 多场景断言全部通过');
process.exit(0);
