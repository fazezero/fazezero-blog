#!/usr/bin/env npx tsx
import { loadArticlesFromDisk } from '../src/lib/content-loader.js';
import {
  formatBannedClaimsReport,
  hasBannedClaimErrors,
  loadBannedClaimRules,
  scanArticlesForBannedClaims,
} from '../src/lib/banned-claims.js';

const includeAll = process.argv.includes('--all');
const articles = loadArticlesFromDisk();
const rules = loadBannedClaimRules();
const matches = scanArticlesForBannedClaims(articles, rules, { includeAll });
const report = formatBannedClaimsReport(matches);

console.log(report);

if (hasBannedClaimErrors(matches)) {
  process.exit(1);
}
