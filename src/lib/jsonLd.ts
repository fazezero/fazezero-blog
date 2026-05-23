import { siteName, siteUrl } from '@/data/site';
import type { ArticleEntry } from '@/lib/content';
import { getEntrySlug } from '@/lib/content';
import { resolveCanonical } from '@/lib/seo';

interface BlogPostingJsonLdInput {
  entry: ArticleEntry;
  authorName: string;
  imageUrl: string;
}

export function buildBlogPostingJsonLd({
  entry,
  authorName,
  imageUrl,
}: BlogPostingJsonLdInput): Record<string, unknown> {
  const { data } = entry;
  const slug = getEntrySlug(entry);
  const url = resolveCanonical(`/blog/${slug}`);
  const dateModified = data.updated ?? data.date;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: data.title,
    description: data.description,
    datePublished: data.date.toISOString(),
    dateModified: dateModified.toISOString(),
    author: {
      '@type': 'Organization',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    image: imageUrl,
    url,
  };
}
