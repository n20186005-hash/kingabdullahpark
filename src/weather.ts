// Model-derived suggestions for the existing visitor forecast. These are not official warnings.
function wmoIcon(code: number, precipProb: number): string {
  if (code >= 95) return '⛈️';
  if (precipProb >= 70 || (code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return '🌧️';
  if (code >= 95) return '⛈️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (precipProb >= 30 || (code >= 3 && code <= 4)) return '⛅';
  if (code >= 1 && code <= 2) return '🌤️';
  if (code === 0) return '☀️';
  return '☀️';
}
function wmoLabel(code: number, precipProb: number): string {
  if (code >= 95) return 'عواصف رعدية';
  if (precipProb >= 60 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'محتمل المطر';
  if (code >= 45 && code <= 48) return 'ضباب';
  if (precipProb >= 30 || (code >= 3 && code <= 4)) return 'غيوم متفرقة';
  if (code >= 1 && code <= 2) return 'شمس مع سحب خفيفة';
  if (code === 0) return 'صافٍ';
  return 'صافٍ بشكل عام';
}
// 降雨强度粗分（阿拉伯语游客口语）：弱 / 中 / 强
// ---------- 4. 建议生成器（满足条件才 push；空数组 → UI 整个区块不渲染） ----------

/** 4.1 风险警告（置顶红框，优先级最高，仅在触发时出现） */
function buildRiskAlerts(c: any, today: any): string[] {
  const alerts: string[] = [];
  const hasThunder = c.code >= 95;
  const heavyRain =
    (c.code >= 81 && c.code <= 82) ||
    (c.code >= 63 && c.code <= 67) ||
    today?.precipSumMm >= 10;
  const windVeryStrong = c.gustKph >= 50 || today?.gustMaxKph >= 50;
  const extremeHeat = c.tempC >= 42 || today?.tempMaxC >= 44;
  const badFog = c.code >= 45 && c.code <= 48 && c.visibilityKm <= 2;

  if (hasThunder) {
    alerts.push('توقعات رعدية في النموذج؛ راجع التنبيهات الرسمية وتعليمات إدارة الموقع قبل الخروج.');
  }
  if (heavyRain && !hasThunder) {
    alerts.push('يشير النموذج إلى مطر غزير؛ راجع التنبيهات الرسمية وحالة الممرات. لا يؤكد هذا تشغيل النافورة أو توقفها.');
  }
  if (windVeryStrong && !heavyRain && !hasThunder) {
    alerts.push('⚠️ رياح قوية: أبقِ معك قبعة وأشياء خفيفة ثابتة، وابتعد عن الألواح الإعلانية والأشجار الكبيرة.');
  }
  if (extremeHeat && !hasThunder) {
    alerts.push('حرارة مرتفعة في النموذج؛ أعد تقييم موعد المشي ومدته وراجع التنبيهات الرسمية. لا نضمن مكاناً مكيفاً داخل المنتزه.');
  }
  if (badFog && !hasThunder && !heavyRain) {
    alerts.push('رؤية محدودة في النموذج: انتبه عند السير على الأرصفة وحافة البحيرة، وخفّض سرعة السيارات في مواقف المنتزه.');
  }
  return alerts;
}

/** 4.2 出行穿搭（阿拉伯语口语，按温度+湿度+风力+降水概率组合） */
function buildOutfitAdvice(c: any, todayDelta: number): string[] {
  const list: string[] = [];
  const { tempC, apparentC, humidity, windKph, precipProbNow, code } = c;
  // 基础温度档位（按体感，不按温度计）
  if (apparentC >= 40) list.push('ملابس قطنية فاتحة وواسعة جداً؛ يفضّل تجنّب الألوان الداكنة والأقمشة الصوفية والجلدية.');
  else if (apparentC >= 32) list.push('ملابس خفيفة قصيرة أو طويلة قطنية تنفّس؛ مع واقٍ للشمس وغطاء للرأس.');
  else if (apparentC >= 22) list.push('أقمشة تنفّس مع قميص أو فستان طويل للوقاية من الشمس.');
  else if (apparentC >= 15) list.push('سترة خفيفة أو سترة قابلة للطيّ خصوصاً بعد غروب الشمس.');
  else list.push('سترة دافئة وسترة داخلية، مع شال أو كوفيّة عند الخروج في الليل.');

  // 湿度 —— 利雅得干燥常见，但春季有湿天
  if (tempC >= 30 && humidity >= 65) list.push('رطوبة عالية مع الحرارة: تجنّب الملابس الاصطناعية الغير قابلة للتنفّس، وخذ معك تغيير إضافي بسيط.');
  if (tempC <= 18 && humidity >= 70) list.push('جو بارد ورطب: ارتدي طبقات ثقيلة قليلة الامتصاص بدل طبقة واحدة سميكة.');

  // 昼夜温差
  if (todayDelta >= 9) list.push(`فرق حرارة اليوم والليل كبير (حوالي ${Math.round(todayDelta)} درجة)؛ خذ سترة قابلة للطيّ معك حتى لو كان الجو دافئاً نهاراً.`);

  // 降水 / 风雨
  const rainy = precipProbNow >= 40 || (code >= 51 && code <= 67) || (code >= 80 && code <= 82);
  const windy = windKph >= 28;
  if (rainy && windy) list.push('مطر مع رياح: ارتدي سترة مقاومة للماء بدل المظلة الطويلة (تقلبها الرياح سهلة).');
  else if (rainy) list.push('مطر متوقّع: أحذية مقاومة للبلل ستفيد كثيراً عند مشي الأرصفة حول البحيرة.');
  if (windy && !rainy) list.push('رياح متوسطة إلى قوية: لا ترتدي الفساتين الطويلة الرقيقة أو الأوشحة الفضفاضة.');

  return list;
}

/** 4.3 游玩安排（King Abdullah Park 专属场景：湖岸 / 音乐喷泉 / 儿童游乐场 / 步行道 / 傍晚野餐） */
function buildPlayPlan(c: any): string[] {
  const plan: string[] = [];
  const { apparentC, precipProbNow, uvNow, code, visibilityKm } = c;
  const rainNow = precipProbNow >= 40 || (code >= 51 && code <= 82);
  const thunder = code >= 95;

  // 基础时间建议
  if (apparentC >= 35) {
    plan.push('قارن توقيت الجولة بتوقعات الحرارة وساعات الدخول المؤكدة؛ لا يثبت النموذج تشغيل النافورة أو الإنارة.');
  } else if (apparentC >= 18 && !rainNow) {
    plan.push('جو ممتاز للتنزه المشي على مسارات البحيرة والجلوس في المساحات الخضراء.');
  }

  // 湖/喷泉/儿童专属
  if (rainNow || thunder) {
    plan.push('تحقق من تعليمات الموقع قبل أي نشاط خارج المباني؛ لا يستنتج النموذج إغلاق الألعاب أو النافورة.');
    plan.push('راقب أطفالك عن كثب عند ضفاف البحيرة والممرات الزلقة بعد المطر.');
  } else {
    plan.push('إذا كانت النافورة هدفك، تحقق من إعلان تشغيل حالي؛ لا يوجد موعد عرض مثبت في بيانات الطقس.');
  }
  if (!rainNow && visibilityKm >= 8 && (code <= 2 || precipProbNow < 20)) {
    plan.push('رؤية صافية اليوم، مناسبة جداً لالتقاط الصور في ممرات النخيل وحول البحيرة والمنحوتات الخضراء.');
  }

  // UV & 儿童
  if (uvNow >= 5 && !rainNow) {
    plan.push('مؤشر الأشعة مرتفع في النموذج؛ خطط للحماية من الشمس والاستراحات المناسبة للمجموعة دون افتراض توافر مطعم أو ظل.');
  }

  // 阴天柔和 = 适合久逛 + 拍照
  if ((code >= 3 && code <= 4) && precipProbNow < 30 && !rainNow) {
    plan.push('غيوم في النموذج؛ لا يضمن الغطاء السحابي الراحة الحرارية أو ملاءمة جولة طويلة.');
  }

  // 野餐友好
  if (!rainNow && apparentC >= 15 && apparentC <= 32 && !thunder) {
    plan.push('قد يناسبك الجلوس بحسب احتياجاتك؛ تحقق من قواعد الطعام والنزهات، ولا تفترض السماح بالشواء.');
  }

  return plan;
}

/** 4.4 随身物品（满足条件才推荐，不需要的不渲染；避免全显示） */
function buildCarryItems(c: any): string[] {
  const items: string[] = [];
  const { apparentC, humidity, precipProbNow, windKph, uvNow, code, visibilityKm } = c;
  const rainNow = precipProbNow >= 40 || (code >= 51 && code <= 82);
  const windy = windKph >= 28;

  // 水 —— 温度高或干燥必带
  if (apparentC >= 28 || humidity <= 30) {
    items.push('ماء يناسب احتياجات المجموعة؛ لا تفترض وجود نقطة تعبئة متاحة في الموقع.');
  }
  if (apparentC >= 35) items.push('جهّز احتياجاتك الشخصية للحرارة، واستشر مختصاً إذا كانت لديك احتياجات صحية خاصة.');

  // UV 组
  if (uvNow >= 5) {
    items.push('واقٍ شمس قوي، ونظارة شمسية، وغطاء رأس واسع الحواف.');
  }

  // 雨组（三档）
  if (precipProbNow >= 70 || (code >= 61 && code <= 67)) {
    items.push(windy ? 'معطف مطر قابل للطيّ (أفضل من مظلة طويلة مع الرياح)' : 'مظلة واقية كبيرة.');
  } else if (precipProbNow >= 40) {
    items.push('مظلة قابلة للطي كاحتياط يومي حتى لو لم يظهر المطر بعد.');
  }

  // 风组
  if (windy && !rainNow) {
    items.push('قبعة بشريط تحت الذقن أو قبعة رياضية لكي لا تُطيرها الرياح.');
  }

  // 冷组
  if (apparentC <= 15) {
    items.push('سترة دافئة إضافية وقفازات لليدين عند المشي ليلاً أو الانتظار طويلاً.');
  }

  // 干燥 + 沙尘
  if (humidity <= 25 || (code >= 45 && !(code <= 48 && code >= 45 && visibilityKm < 3))) {
    items.push('مناديل مبللة ومرطب للشفاه؛ جو الرياض الجاف يسبب تشققاً سريعاً.');
  }
  if (code >= 45 && c.visibilityKm <= 3) {
    items.push('كمامة للوجه لحماية من الغبار أو الرذاذ المتطاير مع الرياح.');
  }

  return items;
}


function weatherPhrase(t: number, p: number) {
  if (p >= 60) return 'فرصة مطر';
  if (p >= 30) return 'غيوم متفرقة مع احتمال مطر بسيط';
  if (t >= 40) return 'حار جداً';
  if (t >= 33) return 'حار';
  if (t >= 26) return 'لطيف دافئ';
  if (t >= 18) return 'لطيف';
  if (t >= 12) return 'بارد بسيط';
  return 'بارد';
}

export function transformWeather(raw: any, now = Date.now()) {
 const hourly=raw?.hourly, daily=raw?.daily;
 if(!Array.isArray(hourly?.time)||!hourly.time.length||!Array.isArray(daily?.time)||daily.time.length!==7)throw Error('Incomplete forecast');
 let index=0;for(let i=1;i<hourly.time.length;i++)if(Math.abs(hourly.time[i]*1000-now)<Math.abs(hourly.time[index]*1000-now))index=i;
 const value=(section:any,key:string,i:number)=>Number.isFinite(section?.[key]?.[i])?section[key][i]:null;
 const temp=value(hourly,'temperature_2m',index), code=value(hourly,'weather_code',index);
 if(temp===null||code===null)throw Error('Missing current model values');
 const current={tempC:temp,apparentC:value(hourly,'apparent_temperature',index),precipProbNow:value(hourly,'precipitation_probability',index),code,humidity:value(hourly,'relative_humidity_2m',index),windKph:value(hourly,'wind_speed_10m',index),gustKph:value(hourly,'wind_gusts_10m',index),uvNow:value(hourly,'uv_index',index),visibilityKm:value(hourly,'visibility',index)===null?null:value(hourly,'visibility',index)/1000};
 const days=daily.time.map((time:number,i:number)=>({time,tempMaxC:value(daily,'temperature_2m_max',i),tempMinC:value(daily,'temperature_2m_min',i),sunshineHrs:value(daily,'sunshine_duration',i)===null?null:value(daily,'sunshine_duration',i)/3600,precipProbMax:value(daily,'precipitation_probability_max',i),precipSumMm:value(daily,'precipitation_sum',i),uvMax:value(daily,'uv_index_max',i),windMaxKph:value(daily,'wind_speed_10m_max',i),gustMaxKph:value(daily,'wind_gusts_10m_max',i),code:value(daily,'weather_code',i)}));
 // Do not turn missing weather fields into apparent zeroes or safety advice.
 const complete=Object.values(current).every(v=>v!==null),today=days[0];
 return {updated:hourly.time[index],timezone:'Asia/Riyadh',current:{...current,phrase:weatherPhrase(temp,current.precipProbNow??0),glyph:wmoIcon(code,current.precipProbNow??0),label:wmoLabel(code,current.precipProbNow??0)},daily:days.map((d:any)=>({...d,glyph:wmoIcon(d.code,d.precipProbMax??0),label:wmoLabel(d.code,d.precipProbMax??0)})),advice:complete?{risk:buildRiskAlerts(current,today),outfit:buildOutfitAdvice(current,(today.tempMaxC??temp)-(today.tempMinC??temp)),play:buildPlayPlan(current),items:buildCarryItems(current)}:{risk:[],outfit:[],play:[],items:[]}};
}
export const weatherURL='https://api.open-meteo.com/v1/forecast?'+new URLSearchParams({latitude:'24.6663657',longitude:'46.7371594',hourly:'temperature_2m,apparent_temperature,precipitation_probability,weather_code,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,visibility,uv_index',daily:'weather_code,temperature_2m_max,temperature_2m_min,sunshine_duration,precipitation_probability_max,precipitation_sum,uv_index_max,wind_speed_10m_max,wind_gusts_10m_max',timezone:'Asia/Riyadh',forecast_days:'7',timeformat:'unixtime',wind_speed_unit:'kmh'});
export async function weatherResponse(ctx:{waitUntil:(p:Promise<unknown>)=>void}) {
 const cache=(caches as CacheStorage & {default:Cache}).default,key=new Request(weatherURL);const hit=await cache.match(key);if(hit)return hit;
 try{const upstream=await fetch(weatherURL,{signal:AbortSignal.timeout(10000)});if(!upstream.ok)throw Error('Unavailable');const response=Response.json(transformWeather(await upstream.json()),{headers:{'Cache-Control':'public, max-age=600'}});ctx.waitUntil(cache.put(key,response.clone()));return response;}
 catch{return Response.json({error:'forecast unavailable'},{status:502});}
}
