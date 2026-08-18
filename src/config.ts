export const SITE = {
  name: 'Truth Drops',
  tagline: 'A private quarterly. Essays, notes, and dispatches from the periphery of the algorithm.',
  author: 'The Editor',
  email: 'editor@truthdrops.example',
  url: 'https://truth-drops.pages.dev',
  giscus: {
    enabled: false,
    repo: 'your-user/your-repo',
    repoId: '',
    category: 'Announcements',
    categoryId: '',
  },
};

export type SiteConfig = typeof SITE;
