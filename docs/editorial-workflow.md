# Editorial Workflow

This document describes the GitHub-native editorial process for FazeZero blog content.

## Content statuses

| Status | Visible on site | Description |
|---|---|---|
| `draft` | No | Work in progress; incomplete fields allowed |
| `in_review` | No | Ready for editorial review; required fields must be complete |
| `published` | Yes | Live content; all gates must pass |
| `archived` | No | Retired content; excluded from listings and RSS |

## Workflow

### 1. Create a draft

Scaffold a new article:

```bash
npm run new:article -- --title "Article Title" --category digital-asset-compliance --date 2026-05-22
```

Write content in `src/content/articles/YYYY/MM/category/{slug}.mdx`. Keep `status: draft` while drafting.

Optional: use [`prompts/generate-article.md`](../prompts/generate-article.md) with Cursor to generate a first draft.

### 2. Move to review

Set `status: in_review` when the article is ready for editorial review.

**Gate requirements (draft → in_review):**

- All required frontmatter fields present
- Description 50–160 characters
- Valid category, author, and folder path (`YYYY/MM/category/slug.mdx`)
- Tags from approved list in `src/data/tags.ts`
- No error-level banned claims

Run locally:

```bash
npm run validate:content
npm run check:banned-claims -- --all
```

Open a pull request. CI runs the same checks automatically.

### 3. Editorial review

Reviewers use [`prompts/review-article.md`](../prompts/review-article.md) as a checklist.

Focus areas:

- Institutional tone and accuracy
- No investment advice or unverified claims
- Structure, readability, and SEO metadata
- Compliance with banned-claims rules in [`content/governance/banned-claims.yml`](../content/governance/banned-claims.yml)

### 4. Publish

After approval, set `status: published` and merge to `main`.

**Gate requirements (in_review → published):**

- At least one tag
- Recommended minimum 400 words (warning if shorter)
- All validation and banned-claims checks pass
- CI build succeeds

Merge triggers deployment to AWS via [`.github/workflows/deploy-aws.yml`](../.github/workflows/deploy-aws.yml).

## CI checks

Pull requests touching content run [`.github/workflows/content-ci.yml`](../.github/workflows/content-ci.yml):

1. `npm run validate:content`
2. `npm run check:banned-claims -- --all`
3. `npm run build`

Deploys to production on `main` also run validation before build.

## Banned claims

Rules are defined in [`content/governance/banned-claims.yml`](../content/governance/banned-claims.yml):

- **error** — blocks CI (guaranteed returns, investment advice, unverified regulatory claims)
- **warn** — flagged but does not block (hype language)

Edit the YAML file to adjust patterns without code changes.

## Commands reference

| Command | Purpose |
|---|---|
| `npm run new:article` | Scaffold new MDX file |
| `npm run validate:content` | Schema + editorial rules |
| `npm run check:banned-claims` | Scan published/in_review content |
| `npm run check:banned-claims -- --all` | Scan all statuses including drafts |
| `npm run build` | Build site + Pagefind index |
