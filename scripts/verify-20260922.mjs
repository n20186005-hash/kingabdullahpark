import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const pages=walk('dist').filter(f=>f.endsWith('.html'));assert.equal(pages.length,7);
const canonical=new Set();let faqPairs=0;
for(const file of pages){const s=fs.readFileSync(file,'utf8');assert(s.includes('<html lang="ar-SA" dir="rtl"'));assert.equal((s.match(/<h1(?:\s|>)/g)||[]).length,1,file);assert.match(s,/<title>[^<]+<\/title>/);assert.match(s,/<meta name="description" content="[^"]+"/);
 if(file.endsWith('404.html')){assert(s.includes('noindex'));assert(!s.includes('rel="canonical"'));}else{const url=s.match(/rel="canonical" href="([^"]+)"/)?.[1];assert(url?.startsWith('https://kingabdullahpark.com/'));canonical.add(url);for(const lang of ['ar','x-default'])assert(s.includes(`hreflang="${lang}"`));}
 for(const m of s.matchAll(/(?:href|src)="(\/[^"?#]*)(?:[^"]*)"/g)){const ref=decodeURI(m[1]);assert(fs.existsSync('dist'+ref)||fs.existsSync('dist'+ref+'/index.html'),file+' '+ref);}
 for(const m of s.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)){const data=JSON.parse(m[1]);for(const j of Array.isArray(data)?data:[data]){for(const key of ['aggregateRating','openingHours','openingHoursSpecification','priceRange','isAccessibleForFree'])assert(!(key in j),file+' unsupported '+key);if(j['@type']==='FAQPage')for(const item of j.mainEntity){const text=decode(s);assert(text.includes(item.name)&&text.includes(item.acceptedAnswer.text));faqPairs++;}}}
 assert(!/<script[^>]*src="https:\/\/www.googletagmanager/.test(s));assert.equal((s.match(/src="\/consent.js"/g)||[]).length,1);
}
assert.equal(canonical.size,6);assert.equal(faqPairs,22);
const home=fs.readFileSync('dist/index.html','utf8');for(const id of ['story','weather','seasonal','visit','transport','services','visitor','food','nearby','source-title','itineraries','responsibility','map','faq'])assert(home.includes('id="'+id+'"'));
assert(home.includes('2026')&&home.includes('13:00')&&home.includes('44,359'));
assert(home.includes('creativecommons.org/licenses/by-sa/4.0/')&&home.includes('creativecommons.org/publicdomain/zero/1.0/'));assert(!home.includes('upload.wikimedia.org'));
const cookies=fs.readFileSync('dist/cookies/index.html','utf8');assert(cookies.includes('id="analytics"'));for(const id of ['preferences','marketing'])assert(!cookies.includes('id="'+id+'"'));
const sitemap=fs.readFileSync('dist/sitemap-0.xml','utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,6);assert(!sitemap.includes('404'));
console.log('PASS 7 built Arabic RTL pages, 6 original canonical/sitemap routes, 22 matching FAQ pairs, all local resource references, all original topic families, current dated source/credit scope, no recurring hours/price/rating guarantees, usable existing analytics-only controls and noindex error page. Static inspection, not browser or production.');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function decode(s){return s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&#x27;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');}
