import { defaultSeoDescription, defaultSeoTitle, defaultSocialImage, siteUrl } from '@/data/site';
import { absoluteUrl } from '@/lib/routes';

export interface SeoInput {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noindex?: boolean;
}

export interface ResolvedSeo {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  noindex: boolean;
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
    noindex: input.noindex ?? false,
  };
}

export function resolveCanonical(path: string): string {
  return absoluteUrl(path, siteUrl);
}
