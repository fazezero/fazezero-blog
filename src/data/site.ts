import { defaultAuthorId } from './authors';
import { categories } from './categories';
import * as routes from '@/lib/routes';

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export const siteName = 'FazeZero';
export const siteDescription =
  'Institutional insights on stablecoin payments, tokenization, compliance, and digital finance implementation.';
export const siteUrl = import.meta.env.PUBLIC_SITE_URL ?? 'https://fazezero.com';
export const defaultSeoTitle = `${siteName} Blog`;
export const defaultSeoDescription = siteDescription;
export const defaultSocialImage = `${siteUrl}/social/default-og.png`;

export const author = defaultAuthorId;

export const navigation: NavItem[] = [
  { label: 'Home', href: routes.home() },
  { label: 'Blog', href: routes.blog() },
  ...categories.map((category) => ({
    label: category.title,
    href: routes.category(category.slug),
  })),
  { label: 'Archive', href: routes.archive() },
  { label: 'Series', href: routes.series() },
  { label: 'Tags', href: routes.tags() },
  { label: 'Search', href: routes.search() },
];

export const socialLinks: SocialLink[] = [
  { label: 'LinkedIn', url: 'https://linkedin.com/company/fazezero' },
  { label: 'X', url: 'https://x.com/fazezero' },
];
