import { getCollection, type CollectionEntry } from 'astro:content';

export type ArticleEntry = CollectionEntry<'articles'>;

export const ARTICLES_PER_PAGE = 12;

export function getEntrySlug(entry: ArticleEntry): string {
  const id = entry.id.replace(/\.(mdx|md)$/, '');
  const segments = id.split('/');
  return segments[segments.length - 1] ?? id;
}

export function getEntryPathSegments(entry: ArticleEntry): string[] {
  return entry.id.replace(/\.(mdx|md)$/, '').split('/');
}

function isPublished(article: ArticleEntry): boolean {
  return article.data.status === 'published';
}

function sortByDateDesc(a: ArticleEntry, b: ArticleEntry): number {
  return b.data.date.getTime() - a.data.date.getTime();
}

function sortBySeriesOrder(a: ArticleEntry, b: ArticleEntry): number {
  const orderA = a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  return a.data.date.getTime() - b.data.date.getTime();
}

async function loadArticles(): Promise<ArticleEntry[]> {
  try {
    return await getCollection('articles');
  } catch {
    return [];
  }
}

export async function getAllArticles(): Promise<ArticleEntry[]> {
  const articles = await loadArticles();
  return articles.sort(sortByDateDesc);
}

export async function getPublishedArticles(): Promise<ArticleEntry[]> {
  const articles = await loadArticles();
  return articles.filter(isPublished).sort(sortByDateDesc);
}

export async function getReviewArticles(): Promise<ArticleEntry[]> {
  const articles = await loadArticles();
  return articles
    .filter((article) => article.data.status === 'in_review')
    .sort(sortByDateDesc);
}

export async function getFeaturedArticles(): Promise<ArticleEntry[]> {
  const articles = await getPublishedArticles();
  return articles.filter((article) => article.data.featured);
}

export async function getArticlesByCategory(categorySlug: string): Promise<ArticleEntry[]> {
  const articles = await getPublishedArticles();
  return articles.filter((article) => article.data.category === categorySlug);
}

export async function getArticlesByTag(tag: string): Promise<ArticleEntry[]> {
  const normalizedTag = tag.toLowerCase();
  const articles = await getPublishedArticles();
  return articles.filter((article) =>
    (article.data.tags ?? []).some((item) => item.toLowerCase() === normalizedTag),
  );
}

export async function getArticlesByYear(year: number): Promise<ArticleEntry[]> {
  const articles = await getPublishedArticles();
  return articles.filter((article) => article.data.year === year);
}

export async function getArticlesByYearMonth(year: number, month: number): Promise<ArticleEntry[]> {
  const articles = await getPublishedArticles();
  return articles.filter(
    (article) => article.data.year === year && article.data.month === month,
  );
}

export async function getArticlesBySeries(series: string): Promise<ArticleEntry[]> {
  const normalizedSeries = series.toLowerCase();
  const articles = await getPublishedArticles();
  return articles
    .filter((article) => article.data.series?.toLowerCase() === normalizedSeries)
    .sort(sortBySeriesOrder);
}

export async function getAllYears(): Promise<number[]> {
  const articles = await getPublishedArticles();
  const years = new Set(articles.map((article) => article.data.year));
  return [...years].sort((a, b) => b - a);
}

export async function getAllMonthsForYear(year: number): Promise<number[]> {
  const articles = await getArticlesByYear(year);
  const months = new Set(articles.map((article) => article.data.month));
  return [...months].sort((a, b) => b - a);
}

export async function getAllTags(): Promise<string[]> {
  const articles = await getPublishedArticles();
  const tagSet = new Set<string>();

  for (const article of articles) {
    for (const tag of article.data.tags ?? []) {
      tagSet.add(tag.toLowerCase());
    }
  }

  return [...tagSet].sort();
}

export async function getAllSeries(): Promise<string[]> {
  const articles = await getPublishedArticles();
  const seriesSet = new Set<string>();

  for (const article of articles) {
    if (article.data.series) {
      seriesSet.add(article.data.series.toLowerCase());
    }
  }

  return [...seriesSet].sort();
}

export async function getArticleBySlug(slug: string): Promise<ArticleEntry | undefined> {
  const articles = await getPublishedArticles();
  return articles.find((article) => getEntrySlug(article) === slug);
}

export function paginate<T>(items: T[], page: number, pageSize = ARTICLES_PER_PAGE): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getTotalPages(itemCount: number, pageSize = ARTICLES_PER_PAGE): number {
  return Math.max(1, Math.ceil(itemCount / pageSize));
}

export function slugifyTag(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

export function formatTagLabel(tag: string): string {
  return tag
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function formatSeriesLabel(series: string): string {
  return formatTagLabel(series);
}

export function formatMonthLabel(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleDateString('en-US', { month: 'long' });
}

export function padMonth(month: number): string {
  return String(month).padStart(2, '0');
}

export function parseMonthParam(value: string): number {
  return Number.parseInt(value, 10);
}
