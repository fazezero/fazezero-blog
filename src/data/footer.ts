import { categories } from './categories';
import * as routes from '@/lib/routes';
import type { FooterLink, SocialLink } from './footer';

export const footerBlogLinks: FooterLink[] = [
  { label: 'Home', href: routes.home() },
  { label: 'Blog', href: routes.blog() },
  { label: 'Archive', href: routes.archive() },
  { label: 'Series', href: routes.series() },
  { label: 'Tags', href: routes.tags() },
  { label: 'Search', href: routes.search() },
  { label: 'RSS Feed', href: '/rss.xml' },
];

export const footerTopicLinks: FooterLink[] = categories.map((category) => ({
  label: category.title,
  href: routes.category(category.slug),
}));

export const footerCompanyLinks: FooterLink[] = [
  { label: 'Platform', href: 'https://fazezero.com/platform', external: true },
  { label: 'Solutions', href: 'https://fazezero.com/solutions', external: true },
  { label: 'Services', href: 'https://fazezero.com/services', external: true },
  { label: 'Company', href: 'https://fazezero.com/company', external: true },
  { label: 'Contact', href: 'https://fazezero.com/contact', external: true },
];

export const footerLegalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: 'https://fazezero.com/legal/privacy-policy', external: true },
  { label: 'Terms of Use', href: 'https://fazezero.com/legal/terms', external: true },
];

export const socialLinks: SocialLink[] = [
  {
    label: 'LinkedIn',
    url: 'https://linkedin.com/company/fazezero',
    icon: 'linkedin',
  },
  {
    label: 'X',
    url: 'https://twitter.com/fazezero_',
    icon: 'x',
  },
  {
    label: 'GitHub',
    url: 'https://github.com/fazezero',
    icon: 'github',
  },
  {
    label: 'Instagram',
    url: 'https://instagram.com/fazezero',
    icon: 'instagram',
  },
  {
    label: 'RSS Feed',
    url: '/rss.xml',
    icon: 'rss',
  },
];
