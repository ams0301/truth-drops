# Truth Drops — deployment guide

Your site builds cleanly (14 pages in ~2s) and is ready to deploy on Cloudflare Pages' free tier. There are two ways:

## A) Push-to-deploy with GitHub (recommended — automatic rebuilds)

1. Initialize a git repo and push it to GitHub:
   ```bash
   git init
   git add -A
   git commit -m "init: truth-drops site"
   # create an empty repo on github.com first, then:
   git remote add origin https://github.com/<you>/<repo>.git
   git branch -M main
   git push -u origin main
   ```

2. Go to **dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git**
   - Pick your repo
   - Build settings:
      - **Framework preset:** Astro
      - **Build command:** `npm run build`
      - **Build output directory:** `dist`
      - **Node version (env var):** `NODE_VERSION = 20`
   - Click **Save and Deploy**. First deploy takes ~30s. Future `git push`es redeploy automatically.

3. Your site is now live at `https://<project-name>.pages.dev`. Update `astro.config.mjs` (`SITE` const) and `src/config.ts` (`SITE.url`) and `public/robots.txt` to whatever final domain you settle on, then redeploy.

## B) Wrangler CLI direct upload (no GitHub account required)

```bash
npm install -g wrangler
npm run build
wrangler pages deploy dist --project-name truth-drops
```
First run prompts you to log into Cloudflare once. Re-deploy by re-running the last two commands anytime you change content.

## Custom domain (free, optional)

In **Cloudflare Pages → your project → Custom domains → Set up a custom domain**.
Add your domain, point the DNS records Cloudflare suggests, and you're done — they auto-provision TLS via Let's Encrypt.

## Writing new articles (no rebuild config needed)

Drop a new `src/content/articles/<slug>.md` file with this frontmatter:

```md
---
title: 'Your title here'
subtitle: 'optional one-liner'
description: 'short standfirst shown on the cards and used for SEO.'
date: 2026-09-01
tags: ['work', 'contrarian']
controversial: true    # shows the "uncut" badge + warning banner
uncool: false          # shows the lime "uncool truth" badge
draft: false           # drafts are excluded from build automatically
---
Your markdown here.
```

Then `git push` (option A) or `npm run build && wrangler pages deploy dist` (option B).
Categories, tags, archive, RSS, and sitemap all regenerate automatically.

## Enabling comments (optional, free)

1. Make sure your repo is public on GitHub (the Astro site, not the comments repo).
2. Go to https://giscus.app and fill in the form — it generates `data-repo`, `data-repo-id`, `data-category`, `data-category-id`.
3. Paste those into `src/config.ts` under `SITE.giscus`, set `enabled: true`, redeploy.

Comments show up at the bottom of every article. They live in GitHub Discussions — spam-resistant, portable, free.

## Switching your email / author name

Edit `src/config.ts`:
```ts
export const SITE = {
  name: 'Truth Drops',
  author: 'Your Real Name',
  email: 'you@yourdomain.com',
  ...
};
```

## Local dev
```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # outputs to dist/
npm run preview  # serve dist/ on http://localhost:4321
```

## Costs

- **Cloudflare Pages free tier:** unlimited sites, unlimited requests, 500 builds/month, free custom domains with TLS. This site is fully static (~one article = ~one HTML file) — you will not hit any paid limit.
- **Domain:** keep `.pages.dev` free forever, or grab any TLD (~$1 to $15/year for `.xyz`, `.me`, `.dev`).
- **No analytics / no comments cost / no email cost** unless you choose to add them.
