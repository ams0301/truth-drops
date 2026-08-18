import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    description: z.string(),                       // short standfirst for cards / SEO
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    controversial: z.boolean().default(false),     // shows the "uncut" badge
    uncool: z.boolean().default(false),            // shows the lime "uncool truth" badge
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
