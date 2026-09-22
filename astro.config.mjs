import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// النطاق يُضبط هنا فقط. اتركه فارغاً أثناء التطوير إن لم يُحسم بعد.
const SITE_URL = 'https://kingabdullahpark.com';
const site = SITE_URL.trim() || undefined;

export default defineConfig({
  site,
  output: 'static',
  integrations: site ? [sitemap()] : [],
  vite: {
    plugins: [tailwindcss()],
  },
});
