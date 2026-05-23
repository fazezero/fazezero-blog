import { defaultSeoDescription, defaultSeoTitle, defaultSocialImage, siteName, siteUrl, twitterSite } from '@/data/site';
import { absoluteUrl } from '@/lib/routes';

export type OgType = 'website' | 'article';

export interface PaginationSeoInput {
  currentPage: number;
  totalPages: number;
  getPagePath: (page: number) => string;
}

export interface SeoInput {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: OgType;
  ogSiteName?: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  twitterSite?: string;
  noindex?: boolean;
  paginationPrev?: string;
  paginationNext?: string;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: OgType;
  ogSiteName: string;
  articlePublishedTime?: string;
  articleModifiedTime?: string;
  articleAuthor?: string;
  twitterSite: string;
  noindex: boolean;
  paginationPrev?: string;
  paginationNext?: string;
}

export function resolveSeo(input: SeoInput = {}): ResolvedSeo {
  const title = input.title?.trim() || defaultSeoTitle;
  const description = input.description?.trim() || defaultSeoDescription;
  const canonical = input.canonical?.trim() || siteUrl;
  const ogTitle = input.ogTitle?.trim() || title;
  const ogDescription = input.ogDescription?.trim() || description;
  const ogImage = input.ogImage?.trim() || defaultSocialImage;

  return {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogType: input.ogType ?? 'website',
    ogSiteName: input.ogSiteName?.trim() || siteName,
    articlePublishedTime: input.articlePublishedTime,
    articleModifiedTime: input.articleModifiedTime,
    articleAuthor: input.articleAuthor,
    twitterSite: input.twitterSite?.trim() || twitterSite,
    noindex: input.noindex ?? false,
    paginationPrev: input.paginationPrev,
    paginationNext: input.paginationNext,
  };
}

export function resolveCanonical(path: string): string {
  return absoluteUrl(path, siteUrl);
}

export function resolvePaginationSeo(pagination: PaginationSeoInput): Pick<
  SeoInput,
  'noindex' | 'paginationPrev' | 'paginationNext'
> {
  const { currentPage, totalPages, getPagePath } = pagination;

  return {
    noindex: currentPage > 1,
    paginationPrev: currentPage > 1 ? resolveCanonical(getPagePath(currentPage - 1)) : undefined,
    paginationNext:
      currentPage < totalPages ? resolveCanonical(getPagePath(currentPage + 1)) : undefined,
  };
}
