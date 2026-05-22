export interface ApprovedTag {
  slug: string;
  label: string;
}

export const approvedTags: ApprovedTag[] = [
  { slug: 'stablecoins', label: 'Stablecoins' },
  { slug: 'settlement', label: 'Settlement' },
  { slug: 'treasury', label: 'Treasury' },
  { slug: 'tokenization', label: 'Tokenization' },
  { slug: 'custody', label: 'Custody' },
  { slug: 'compliance', label: 'Compliance' },
  { slug: 'aml', label: 'AML' },
  { slug: 'kyc', label: 'KYC' },
  { slug: 'licensing', label: 'Licensing' },
  { slug: 'governance', label: 'Governance' },
  { slug: 'implementation', label: 'Implementation' },
  { slug: 'integration', label: 'Integration' },
  { slug: 'operations', label: 'Operations' },
  { slug: 'market-structure', label: 'Market Structure' },
  { slug: 'regulation', label: 'Regulation' },
  { slug: 'payments', label: 'Payments' },
  { slug: 'enterprise', label: 'Enterprise' },
  { slug: 'infrastructure', label: 'Infrastructure' },
];

export const approvedTagSlugs = approvedTags.map((tag) => tag.slug) as [string, ...string[]];

export function getApprovedTagBySlug(slug: string): ApprovedTag | undefined {
  return approvedTags.find((tag) => tag.slug === slug);
}

export function isApprovedTag(slug: string): boolean {
  return approvedTagSlugs.includes(slug as (typeof approvedTagSlugs)[number]);
}

export function getTagLabel(slug: string): string {
  return getApprovedTagBySlug(slug)?.label ?? slug;
}
