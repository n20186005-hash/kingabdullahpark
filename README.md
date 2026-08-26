# دليل منتزه الملك عبدالله – الرياض

موقع عربي مستقل وغير ربحي عن منتزه الملك عبدالله في حي الملز. مبني بـ Astro + Tailwind CSS + TypeScript ويُخرج ملفات ثابتة قابلة للنشر على Cloudflare Workers عبر Wrangler.

## الإصدارات المثبتة

- Node.js: `24.19.0`
- pnpm: `11.24.0`
- Astro: `7.2.7`
- Tailwind CSS / Vite plugin: `4.3.3`
- TypeScript: `6.0.3`
- @astrojs/check: `0.9.10`
- @astrojs/sitemap: `3.7.3`
- Wrangler: `4.126.0`


## حالة حزمة التطوير

هذه النسخة جُهزت داخل بيئة تنفيذ معزولة لا تسمح باتصال خارجي. لذلك لم يمكن تنزيل مدير الحزم أو الصور الأصلية، ولم يُنشأ ملف القفل النهائي بعد. التفاصيل موثقة في `VALIDATION_STATUS.md`. لا تُعتبر الحزمة مجتازة لفحص التسليم النهائي قبل إنشاء `pnpm-lock.yaml` في بيئة متصلة ثم تنفيذ التثبيت المجمّد والفحص والبناء.

## التشغيل

عند توفر ملف القفل النهائي:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

ولتوطين الصور الحقيقية قبل البناء في بيئة متصلة:

```bash
pnpm media:fetch
```

للنشر:

```bash
pnpm deploy
```

## ضبط النطاق

يوجد النطاق في **موضع واحد فقط** داخل `astro.config.mjs`:

```js
const SITE_URL = '';
```

اتركه فارغاً قبل حسم النطاق. في هذه الحالة يبقى البناء صالحاً، وتُحذف روابط canonical / Open Graph المطلقة، ولا تعمل إضافة sitemap. بعد شراء النطاق، ضع القيمة الحقيقية في هذا السطر فقط ثم أعد البناء؛ جميع الروابط المطلقة وJSON-LD وsitemap تشتق من `Astro.site`.

## الصور

الصور المستخدمة حقيقية ومصادرها موثقة في `MEDIA_SOURCES.md`. يوفّر `scripts/fetch-media.mjs` طريقة لتوطين نسخ الصور داخل `public/images/` عند وجود اتصال بالشبكة.

## الخصوصية وGoogle Analytics

معرّف GA4 هو `G-HXM22WWPKP`. لا يتم تحميل Google Analytics إلا بعد موافقة صريحة من صفحة `/cookies/`. الموافقة محفوظة محلياً بالمفتاح `kap-consent-v1`.
