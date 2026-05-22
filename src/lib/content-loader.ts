import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, basename, relative } from 'node:path';
import matter from 'gray-matter';

export type ArticleStatus = 'draft' | 'in_review' | 'published' | 'archived';

export interface ParsedArticle {
  filePath: string;
  relativePath: string;
  fileName: string;
  frontmatter: Record<string, unknown>;
  body: string;
  status: ArticleStatus;
  slug: string;
  title: string;
  description: string;
  category: string;
  author: string;
  date: Date | null;
  updated: Date | null;
  year: number | null;
  month: number | null;
  quarter: number | null;
  series: string | null;
  seriesOrder: number | null;
  tags: string[];
}

const ARTICLES_DIR = join(process.cwd(), 'src/content/articles');

function walkMdxFiles(dir: string): string[] {
  const results: string[] = [];

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return results;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      results.push(...walkMdxFiles(fullPath));
      continue;
    }

    if (entry.endsWith('.mdx') || entry.endsWith('.md')) {
      results.push(fullPath);
    }
  }

  return results;
}

function resolveDateFields(date: Date | null): {
  year: number | null;
  month: number | null;
  quarter: number | null;
} {
  if (!date) {
    return { year: null, month: null, quarter: null };
  }

  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const quarter = Math.ceil(month / 3);

  return { year, month, quarter };
}

export function loadArticlesFromDisk(): ParsedArticle[] {
  const files = walkMdxFiles(ARTICLES_DIR);

  return files.map((filePath) => {
    const relativePath = relative(ARTICLES_DIR, filePath);
    const fileName = basename(filePath);
    const raw = readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    const status = (data.status as ArticleStatus) ?? 'draft';
    const tags = Array.isArray(data.tags) ? (data.tags as string[]) : [];
    const date = data.date ? new Date(String(data.date)) : null;
    const computed = resolveDateFields(date);

    return {
      filePath,
      relativePath,
      fileName,
      frontmatter: data as Record<string, unknown>,
      body: content,
      status,
      slug: basename(filePath, filePath.endsWith('.mdx') ? '.mdx' : '.md'),
      title: String(data.title ?? ''),
      description: String(data.description ?? ''),
      category: String(data.category ?? ''),
      author: String(data.author ?? ''),
      date,
      updated: data.updated ? new Date(String(data.updated)) : null,
      year: typeof data.year === 'number' ? data.year : computed.year,
      month: typeof data.month === 'number' ? data.month : computed.month,
      quarter: typeof data.quarter === 'number' ? data.quarter : computed.quarter,
      series: data.series ? String(data.series) : null,
      seriesOrder: typeof data.seriesOrder === 'number' ? data.seriesOrder : null,
      tags,
    };
  });
}

export function countWords(text: string): number {
  const stripped = stripCodeBlocks(text).trim();
  if (!stripped) return 0;
  return stripped.split(/\s+/).length;
}

export function stripCodeBlocks(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .replace(/<[^>]+>/g, '');
}

export function isKebabCase(value: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value);
}

export function parseArticlePath(relativePath: string): {
  year: string;
  month: string;
  category: string;
  slug: string;
} | null {
  const match = relativePath.match(
    /^(\d{4})\/(\d{2})\/([a-z0-9-]+)\/([a-z0-9-]+)\.(mdx|md)$/,
  );

  if (!match) {
    return null;
  }

  return {
    year: match[1],
    month: match[2],
    category: match[3],
    slug: match[4],
  };
}
