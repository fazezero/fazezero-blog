import { categorySlugs } from '@/data/categories';
import { authors } from '@/data/authors';
import { isApprovedTag } from '@/data/tags';
import {
  countWords,
  isKebabCase,
  parseArticlePath,
  type ParsedArticle,
  type ArticleStatus,
} from '@/lib/content-loader';

export type ValidationSeverity = 'error' | 'warn';

export interface ValidationIssue {
  severity: ValidationSeverity;
  file: string;
  message: string;
  gate?: string;
}

const VALID_STATUSES: ArticleStatus[] = ['draft', 'in_review', 'published', 'archived'];
const AUTHOR_IDS = authors.map((a) => a.id);
const MIN_DESCRIPTION_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 160;
const MIN_PUBLISHED_WORDS = 400;
const MAX_TAGS = 8;

export function validateArticles(articles: ParsedArticle[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const slugCounts = new Map<string, string[]>();

  for (const article of articles) {
    const { fileName, relativePath } = article;

    if (!VALID_STATUSES.includes(article.status)) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: `Invalid status "${article.status}". Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const pathParts = parseArticlePath(relativePath);
    if (!pathParts) {
      issues.push({
        severity: 'error',
        file: relativePath,
        message:
          'Article must live at src/content/articles/YYYY/MM/category/article-slug.mdx',
      });
    } else {
      if (pathParts.slug !== article.slug) {
        issues.push({
          severity: 'error',
          file: relativePath,
          message: `Filename slug "${pathParts.slug}" must match article slug "${article.slug}"`,
        });
      }

      if (pathParts.category !== article.category) {
        issues.push({
          severity: 'error',
          file: relativePath,
          message: `Folder category "${pathParts.category}" must match frontmatter category "${article.category}"`,
        });
      }

      if (article.date) {
        const dateYear = String(article.date.getFullYear());
        const dateMonth = String(article.date.getMonth() + 1).padStart(2, '0');

        if (pathParts.year !== dateYear) {
          issues.push({
            severity: 'error',
            file: relativePath,
            message: `Folder year "${pathParts.year}" must match article date year "${dateYear}"`,
          });
        }

        if (pathParts.month !== dateMonth) {
          issues.push({
            severity: 'error',
            file: relativePath,
            message: `Folder month "${pathParts.month}" must match article date month "${dateMonth}"`,
          });
        }
      }
    }

    if (!isKebabCase(article.slug)) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: `Slug "${article.slug}" must be kebab-case`,
      });
    }

    const slugEntries = slugCounts.get(article.slug) ?? [];
    slugEntries.push(relativePath);
    slugCounts.set(article.slug, slugEntries);

    if (article.date && article.date > new Date()) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: 'Date must not be in the future',
      });
    }

    if (article.updated && article.date && article.updated < article.date) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: 'Updated date must be greater than or equal to date',
      });
    }

    if (article.year && article.date && article.year !== article.date.getFullYear()) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: 'year must match date when explicitly set',
      });
    }

    if (article.month && article.date && article.month !== article.date.getMonth() + 1) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: 'month must match date when explicitly set',
      });
    }

    if (article.frontmatter.coverImage && !article.frontmatter.coverImageAlt) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: 'coverImageAlt is required when coverImage is set',
      });
    }

    if (article.tags.length > MAX_TAGS) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: `Maximum ${MAX_TAGS} tags allowed`,
      });
    }

    const tagSet = new Set<string>();
    for (const tag of article.tags) {
      if (tag !== tag.toLowerCase()) {
        issues.push({
          severity: 'error',
          file: fileName,
          message: `Tag "${tag}" must be lowercase`,
        });
      }

      if (!isApprovedTag(tag)) {
        issues.push({
          severity: 'error',
          file: fileName,
          message: `Tag "${tag}" is not in the approved tag list`,
        });
      }

      if (tagSet.has(tag)) {
        issues.push({
          severity: 'error',
          file: fileName,
          message: `Duplicate tag "${tag}"`,
        });
      }
      tagSet.add(tag);
    }

    if (article.category && !categorySlugs.includes(article.category as (typeof categorySlugs)[number])) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: `Invalid category "${article.category}"`,
      });
    }

    if (article.author && !AUTHOR_IDS.includes(article.author)) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: `Invalid author "${article.author}"`,
      });
    }

    if (article.series && !isKebabCase(article.series)) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: 'series must be kebab-case',
      });
    }

    if (article.status === 'published' || article.status === 'in_review') {
      issues.push(...validatePublishReady(article));
    }

    if (article.status === 'published') {
      issues.push(...validatePublishedGates(article));
    }
  }

  for (const [slug, files] of slugCounts) {
    if (files.length > 1) {
      issues.push({
        severity: 'error',
        file: files.join(', '),
        message: `Duplicate slug "${slug}" across files`,
      });
    }
  }

  return issues;
}

function validatePublishReady(article: ParsedArticle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { fileName } = article;

  const required = ['title', 'description', 'category', 'author', 'date'] as const;
  for (const field of required) {
    if (!article[field as keyof ParsedArticle]) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: `Missing required field "${field}" for status "${article.status}"`,
        gate: 'draft-to-review',
      });
    }
  }

  if (article.description) {
    const len = article.description.length;
    if (len < MIN_DESCRIPTION_LENGTH || len > MAX_DESCRIPTION_LENGTH) {
      issues.push({
        severity: 'error',
        file: fileName,
        message: `Description must be ${MIN_DESCRIPTION_LENGTH}–${MAX_DESCRIPTION_LENGTH} characters (got ${len})`,
        gate: 'draft-to-review',
      });
    }
  }

  return issues;
}

function validatePublishedGates(article: ParsedArticle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { fileName } = article;

  if (article.tags.length < 1) {
    issues.push({
      severity: 'error',
      file: fileName,
      message: 'Published articles must have at least one tag',
      gate: 'review-to-published',
    });
  }

  const wordCount = countWords(article.body);
  if (wordCount < MIN_PUBLISHED_WORDS) {
    issues.push({
      severity: 'warn',
      file: fileName,
      message: `Published article has ${wordCount} words (recommended minimum: ${MIN_PUBLISHED_WORDS})`,
      gate: 'review-to-published',
    });
  }

  return issues;
}

export function formatValidationReport(issues: ValidationIssue[]): string {
  if (issues.length === 0) {
    return 'Content validation passed.';
  }

  return issues
    .map((issue) => {
      const gate = issue.gate ? ` [${issue.gate}]` : '';
      return `[${issue.severity.toUpperCase()}] ${issue.file}${gate}: ${issue.message}`;
    })
    .join('\n');
}

export function hasValidationErrors(issues: ValidationIssue[]): boolean {
  return issues.some((issue) => issue.severity === 'error');
}
