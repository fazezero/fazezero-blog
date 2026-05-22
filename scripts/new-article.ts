#!/usr/bin/env npx tsx
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ARTICLES_DIR = join(process.cwd(), 'src/content/articles');
const TEMPLATE_PATH = join(process.cwd(), 'templates/article.mdx');

const VALID_CATEGORIES = [
  'stablecoin-payments',
  'tokenization',
  'digital-asset-compliance',
  'enterprise-implementation',
  'market-notes',
  'founder-notes',
];

function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2);
  const parsed: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        parsed[key] = value;
        i++;
      }
    }
  }

  return parsed;
}

function toKebabCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function printUsage(): void {
  console.log(`
Usage: npm run new:article -- --title "Article Title" --category stablecoin-payments [--slug article-slug] [--date YYYY-MM-DD] [--tag tag-name]

Options:
  --title       Article title (required)
  --category    Category slug (required)
  --slug        URL slug / filename (defaults to kebab-case title)
  --date        Publish date (defaults to today)
  --tag         Primary tag from approved list (defaults to first category-related tag)
  --description Short description (defaults to placeholder)
  --series      Optional series slug
  --seriesOrder Optional order within series
`);
}

const args = parseArgs();

if (!args.title || !args.category) {
  printUsage();
  process.exit(1);
}

if (!VALID_CATEGORIES.includes(args.category)) {
  console.error(`Invalid category "${args.category}". Valid: ${VALID_CATEGORIES.join(', ')}`);
  process.exit(1);
}

const slug = args.slug ?? toKebabCase(args.title);
const date = args.date ?? todayISO();
const [year, month] = date.split('-');
const tag = args.tag ?? 'enterprise';
const description =
  args.description ??
  `An institutional perspective on ${args.title.toLowerCase()} for enterprise teams.`;

const outputDir = join(ARTICLES_DIR, year, month, args.category);
const outputPath = join(outputDir, `${slug}.mdx`);

if (existsSync(outputPath)) {
  console.error(`Article already exists: ${outputPath}`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

const template = readFileSync(TEMPLATE_PATH, 'utf-8');
let content = template
  .replace(/\{\{TITLE\}\}/g, args.title)
  .replace(/\{\{DESCRIPTION\}\}/g, description)
  .replace(/\{\{CATEGORY\}\}/g, args.category)
  .replace(/\{\{TAG\}\}/g, tag)
  .replace(/\{\{DATE\}\}/g, date);

if (args.series) {
  content = content.replace(
    'featured: false',
    `featured: false\nseries: "${args.series}"${args.seriesOrder ? `\nseriesOrder: ${args.seriesOrder}` : ''}`,
  );
}

writeFileSync(outputPath, content, 'utf-8');
console.log(`Created: ${outputPath}`);
