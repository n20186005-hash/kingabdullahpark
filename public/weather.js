(() => {
 const get=id=>document.getElementById(id),fmt=n=>Number.isFinite(n)?new Intl.NumberFormat('ar-SA',{maximumFractionDigits:1}).format(n):'—';
 const time=n=>new Date(n*1000).toLocaleString('ar-SA',{timeZone:'Asia/Riyadh',dateStyle:'medium',timeStyle:'short'});
 function el(tag,text,className){const e=document.createElement(tag);e.textContent=text;if(className)e.className=className;return e;}
 function render(d){
  if(!Number.isFinite(d?.current?.tempC)||!Array.isArray(d.daily)||!d.daily.length||!Number.isFinite(d.updated))throw Error('Incomplete');
  if(Math.abs(Date.now()/1000-d.updated)>10800)throw Error('Stale model time');
  const c=d.current;get('weather-now').textContent=fmt(c.tempC)+' °C';get('weather-condition').textContent=(c.glyph||'')+' '+(c.label||'');get('weather-updated').textContent='وقت بيانات النموذج: '+time(d.updated)+' · توقيت الرياض';
  const details=get('weather-details');details.replaceChildren();
  for(const [label,value,unit] of [['المحسوسة',c.apparentC,'°C'],['الرطوبة',c.humidity,'%'],['الرياح',c.windKph,'كم/ساعة'],['هبات الرياح',c.gustKph,'كم/ساعة'],['احتمال المطر',c.precipProbNow,'%'],['مؤشر الأشعة',c.uvNow,''],['الرؤية',c.visibilityKm,'كم']]){const row=el('div','');row.append(el('dt',label,'weather-label'),el('dd',fmt(value)+' '+unit,'weather-value'));details.append(row);}
  for(const key of ['risk','outfit','play','items']){const list=get('weather-'+key);list.replaceChildren();const items=Array.isArray(d.advice?.[key])?d.advice[key]:[];get('weather-block-'+key).hidden=!items.length;for(const text of items)list.append(el('li','• '+text));}
  const days=get('weather-days');days.replaceChildren();for(const day of d.daily){const item=el('li','','weather-day');item.append(el('h4',new Date(day.time*1000).toLocaleDateString('ar-SA',{timeZone:'Asia/Riyadh',weekday:'long',day:'numeric',month:'short'})),el('p',(day.glyph||'')+' '+(day.label||'')),el('p',fmt(day.tempMaxC)+'° / '+fmt(day.tempMinC)+'°','weather-value'),el('p','احتمال المطر '+fmt(day.precipProbMax)+' %'),el('p','سطوع الشمس '+fmt(day.sunshineHrs)+' ساعة'));days.append(item);}
 }
 async function load(){try{const r=await fetch('/api/weather');if(!r.ok)throw Error('Unavailable');render(await r.json());get('weather-content').hidden=false;}catch{get('weather-content').hidden=true;get('weather-error').hidden=false;}finally{get('weather-loading')?.remove();}}
 load();
})();
