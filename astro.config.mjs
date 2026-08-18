import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Update this to your final domain when you deploy. Leave as-is for local dev.
// On Cloudflare Pages you'll get a `https://<project>.pages.dev` URL automatically.
const SITE = 'https://truth-drops.pages.dev';

export default defineConfig({
  site: SITE,
  output: 'static',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true,
    },
  },
});
