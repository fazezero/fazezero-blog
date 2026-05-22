export function home(): string {
  return '/';
}

export function blog(page = 1): string {
  return page === 1 ? '/blog' : `/blog/page/${page}`;
}

export function article(slug: string): string {
  return `/blog/${slug}`;
}

export function category(slug: string, page = 1): string {
  return page === 1 ? `/blog/category/${slug}` : `/blog/category/${slug}/page/${page}`;
}

export function tag(slug: string, page = 1): string {
  return page === 1 ? `/blog/tag/${slug}` : `/blog/tag/${slug}/page/${page}`;
}

export function tags(): string {
  return '/blog/tags';
}

export function archive(): string {
  return '/blog/archive';
}

export function archiveYear(year: number | string): string {
  return `/blog/archive/${year}`;
}

export function archiveMonth(year: number | string, month: number | string): string {
  const monthValue = String(month).padStart(2, '0');
  return `/blog/archive/${year}/${monthValue}`;
}

export function archiveMonthPage(year: number | string, month: number | string, page: number): string {
  const base = archiveMonth(year, month);
  return page === 1 ? base : `${base}/page/${page}`;
}

export function series(page = 1): string {
  return page === 1 ? '/blog/series' : `/blog/series/page/${page}`;
}

export function seriesDetail(seriesSlug: string, page = 1): string {
  return page === 1 ? `/blog/series/${seriesSlug}` : `/blog/series/${seriesSlug}/page/${page}`;
}

export function search(): string {
  return '/search';
}

export function absoluteUrl(path: string, siteUrl: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, siteUrl).toString();
}
