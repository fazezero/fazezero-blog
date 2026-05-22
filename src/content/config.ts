import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { categorySlugs } from '@/data/categories';
import { approvedTagSlugs } from '@/data/tags';
import { authors } from '@/data/authors';

const authorIds = authors.map((author) => author.id) as [string, ...string[]];

const articles = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/articles' }),
  schema: z
    .object({
      title: z.string(),
      description: z.string(),
      category: z.enum(categorySlugs),
      tags: z.array(z.enum(approvedTagSlugs)).optional(),
      author: z.enum(authorIds),
      date: z.coerce.date(),
      year: z.number().int().optional(),
      month: z.number().int().min(1).max(12).optional(),
      quarter: z.number().int().min(1).max(4).optional(),
      updated: z.coerce.date().optional(),
      status: z.enum(['draft', 'in_review', 'published', 'archived']),
      featured: z.boolean().optional().default(false),
      series: z.string().optional(),
      seriesOrder: z.number().int().optional(),
      coverImage: z.string().optional(),
      coverImageAlt: z.string().optional(),
      socialImage: z.string().optional(),
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
    })
    .transform((data) => {
      const year = data.year ?? data.date.getFullYear();
      const month = data.month ?? data.date.getMonth() + 1;
      const quarter = data.quarter ?? Math.ceil(month / 3);

      return {
        ...data,
        year,
        month,
        quarter,
      };
    }),
});

export const collections = { articles };
