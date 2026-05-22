#!/usr/bin/env npx tsx
import { loadArticlesFromDisk } from '../src/lib/content-loader.js';
import {
  formatValidationReport,
  hasValidationErrors,
  validateArticles,
} from '../src/lib/editorial-rules.js';

const articles = loadArticlesFromDisk();
const issues = validateArticles(articles);
const report = formatValidationReport(issues);

console.log(report);

if (hasValidationErrors(issues)) {
  process.exit(1);
}
