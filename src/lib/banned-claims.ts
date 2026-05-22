import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { stripCodeBlocks, type ArticleStatus, type ParsedArticle } from '@/lib/content-loader';

export type ClaimSeverity = 'error' | 'warn';

export interface BannedClaimRule {
  id: string;
  severity: ClaimSeverity;
  message: string;
  patterns: string[];
}

export interface BannedClaimMatch {
  ruleId: string;
  severity: ClaimSeverity;
  message: string;
  pattern: string;
  file: string;
  line: number;
  column: number;
  excerpt: string;
}

interface BannedClaimsConfig {
  rules: BannedClaimRule[];
}

const DEFAULT_RULES_PATH = join(process.cwd(), 'content/governance/banned-claims.yml');

export function loadBannedClaimRules(rulesPath = DEFAULT_RULES_PATH): BannedClaimRule[] {
  const raw = readFileSync(rulesPath, 'utf-8');
  const config = parseYaml(raw) as BannedClaimsConfig;
  return config.rules ?? [];
}

export function scanTextForBannedClaims(
  text: string,
  file: string,
  rules: BannedClaimRule[],
): BannedClaimMatch[] {
  const matches: BannedClaimMatch[] = [];
  const cleanText = stripCodeBlocks(text);
  const lines = cleanText.split('\n');

  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      const regex = new RegExp(escapeRegex(pattern), 'gi');

      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex];
        let match: RegExpExecArray | null;

        while ((match = regex.exec(line)) !== null) {
          matches.push({
            ruleId: rule.id,
            severity: rule.severity,
            message: rule.message,
            pattern,
            file,
            line: lineIndex + 1,
            column: match.index + 1,
            excerpt: line.trim().slice(0, 120),
          });
        }
      }
    }
  }

  return matches;
}

export function scanArticleForBannedClaims(
  article: ParsedArticle,
  rules: BannedClaimRule[],
): BannedClaimMatch[] {
  const frontmatterText = Object.entries(article.frontmatter)
    .filter(([, value]) => typeof value === 'string')
    .map(([, value]) => value as string)
    .join('\n');

  const bodyMatches = scanTextForBannedClaims(article.body, article.fileName, rules);
  const frontmatterMatches = scanTextForBannedClaims(
    frontmatterText,
    article.fileName,
    rules,
  );

  return [...frontmatterMatches, ...bodyMatches];
}

export function scanArticlesForBannedClaims(
  articles: ParsedArticle[],
  rules: BannedClaimRule[],
  options: { includeAll?: boolean } = {},
): BannedClaimMatch[] {
  const { includeAll = false } = options;
  const statusesToScan: ArticleStatus[] = includeAll
    ? ['draft', 'in_review', 'published', 'archived']
    : ['published', 'in_review'];

  const matches: BannedClaimMatch[] = [];

  for (const article of articles) {
    if (statusesToScan.includes(article.status)) {
      matches.push(...scanArticleForBannedClaims(article, rules));
    }
  }

  return matches;
}

export function formatBannedClaimsReport(matches: BannedClaimMatch[]): string {
  if (matches.length === 0) {
    return 'Banned-claims check passed.';
  }

  return matches
    .map(
      (match) =>
        `[${match.severity.toUpperCase()}] ${match.file}:${match.line}:${match.column} (${match.ruleId}): ${match.message} — matched "${match.pattern}" in "${match.excerpt}"`,
    )
    .join('\n');
}

export function hasBannedClaimErrors(matches: BannedClaimMatch[]): boolean {
  return matches.some((match) => match.severity === 'error');
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
