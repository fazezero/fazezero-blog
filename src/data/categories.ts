export interface Category {
  title: string;
  slug: string;
  description: string;
}

export const categories: Category[] = [
  {
    title: 'Stablecoin Payments',
    slug: 'stablecoin-payments',
    description:
      'Analysis and guidance on stablecoin payment infrastructure, settlement, and treasury operations.',
  },
  {
    title: 'Tokenization',
    slug: 'tokenization',
    description:
      'Insights on asset tokenization, on-chain representation, and institutional digital asset workflows.',
  },
  {
    title: 'Digital Asset Compliance',
    slug: 'digital-asset-compliance',
    description:
      'Regulatory frameworks, licensing considerations, and compliance program design for digital finance.',
  },
  {
    title: 'Enterprise Implementation',
    slug: 'enterprise-implementation',
    description:
      'Practical guidance on deploying blockchain and digital asset solutions in enterprise environments.',
  },
  {
    title: 'Market Notes',
    slug: 'market-notes',
    description:
      'Market structure, industry trends, and institutional developments in digital assets.',
  },
  {
    title: 'Founder Notes',
    slug: 'founder-notes',
    description:
      'Perspectives from the FazeZero team on building institutional-grade digital finance infrastructure.',
  },
];

export function getAllCategories(): Category[] {
  return categories;
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export const categorySlugs = categories.map((category) => category.slug) as [
  string,
  ...string[],
];
