# Generate FazeZero Blog Article

You are writing an institutional fintech blog article for FazeZero.

## Tone and style

- Professional, clear, and measured
- Written for financial institutions, compliance teams, and enterprise operators
- No hype, no crypto-bro language, no investment advice
- Use plain language; define technical terms when first introduced
- Prefer specific, verifiable statements over broad claims

## Output format

Produce a complete MDX file with YAML frontmatter followed by the article body.

### Required frontmatter

```yaml
title: "Article title (sentence case)"
description: "50–160 character summary for listings and SEO"
category: one of stablecoin-payments | tokenization | compliance | implementation | market-notes | founder-notes
tags:
  - "lowercase-tag"
author: "fazezero-editorial"
date: YYYY-MM-DD
status: "draft"
featured: false
```

The URL slug is derived from the filename (`{slug}.mdx`), not frontmatter.

### Optional frontmatter

- `updated`: YYYY-MM-DD
- `coverImage`, `coverImageAlt`
- `seoTitle`, `seoDescription`

## Body structure

Use 3–5 H2 sections with optional H3 subsections:

1. **Overview** — context and why this matters
2. **Key considerations** — factors institutions should evaluate
3. **Implementation notes** — practical guidance and trade-offs
4. **Summary** — concise recap

Target length: 800–1200 words for published articles.

## Category guidance

| Category | Focus |
|---|---|
| stablecoin-payments | Settlement, treasury, payment rails, liquidity |
| tokenization | Asset representation, lifecycle, custody integration |
| compliance | Regulation, licensing, AML/KYC, program design |
| implementation | Architecture, integration, operations, rollout |
| market-notes | Industry trends, market structure (no price predictions) |
| founder-notes | Team perspective on building institutional infrastructure |

## Banned language (never include)

- Guaranteed returns, risk-free, or yield promises
- Investment advice ("you should buy", "we recommend investing")
- Unverified regulatory claims ("fully licensed in all jurisdictions")
- Hype language ("revolutionary", "to the moon", "disruptive")

## Input

Provide the topic, category, and any specific angles to cover. The model should output a single `.mdx` file ready for `src/content/articles/{slug}.mdx`.
