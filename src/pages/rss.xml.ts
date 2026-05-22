import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPublishedArticles, getEntrySlug } from '@/lib/content';
import { siteDescription, siteName, siteUrl } from '@/data/site';
import { article } from '@/lib/routes';

export const GET: APIRoute = async () => {
  const articles = await getPublishedArticles();

  return rss({
    title: `${siteName} Blog`,
    description: siteDescription,
    site: siteUrl,
    items: articles.map((entry) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: article(getEntrySlug(entry)),
      categories: [entry.data.category, ...(entry.data.tags ?? [])],
    })),
  });
};
