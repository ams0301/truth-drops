import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../config';

export async function GET(context) {
  const posts = (await getCollection('articles', (p) => !p.data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: SITE.name,
    description: SITE.tagline,
    site: context.site ?? SITE.url,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.description,
      link: `/drops/${p.slug}/`,
      categories: p.data.tags,
    })),
    stylesheet: false,
  });
}
