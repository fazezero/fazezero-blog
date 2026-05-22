# FazeZero Blog (Astro)

Production-ready static blog for [FazeZero](https://fazezero.com) with a content-heavy publishing model, structured categorization, archive browsing, series support, and GitHub-native MDX workflow.

**Repository:** [github.com/fazezero/fazezero-blog](https://github.com/fazezero/fazezero-blog)

## Content-heavy publishing model

This blog is designed for **one article per day** publishing at scale. Content lives in dated folder paths, with primary categories, approved tags, archive browsing, and optional multi-part series.

### Folder structure

Articles must be placed at:

```
src/content/articles/YYYY/MM/category/article-slug.mdx
```

Example:

```
src/content/articles/2026/05/stablecoin-payments/stablecoin-payment-orchestration.mdx
```

The URL slug is derived from the filename (`article-slug`). The folder path must match the article `date` and `category` frontmatter.

### Frontmatter fields

| Field | Required | Notes |
|---|---|---|
| `title` | Yes | Article title |
| `description` | Yes | 50–160 characters for SEO |
| `category` | Yes | Primary category slug (see below) |
| `tags` | Published | From approved tag list only |
| `author` | Yes | Author id (`fazezero-editorial`) |
| `date` | Yes | ISO date (`YYYY-MM-DD`) |
| `year` | No | Auto-calculated from `date` |
| `month` | No | Auto-calculated from `date` |
| `quarter` | No | Auto-calculated from `date` |
| `status` | Yes | `draft`, `in_review`, `published`, `archived` |
| `featured` | No | Boolean, default `false` |
| `series` | No | Kebab-case series slug |
| `seriesOrder` | No | Integer order within series |
| `coverImage` | No | Requires `coverImageAlt` if set |
| `seoTitle` | No | Overrides default SEO title |
| `seoDescription` | No | Overrides default SEO description |

Note: `slug` is derived from the filename, not stored in frontmatter (Astro content collections reserve this field).

## Primary categories

Six fixed primary categories:

| Title | Slug |
|---|---|
| Stablecoin Payments | `stablecoin-payments` |
| Tokenization | `tokenization` |
| Digital Asset Compliance | `digital-asset-compliance` |
| Enterprise Implementation | `enterprise-implementation` |
| Market Notes | `market-notes` |
| Founder Notes | `founder-notes` |

Every article belongs to exactly one primary category. Category pages pre-render with empty states when no articles exist.

## Tag rules

Tags must come from the central approved list in [`src/data/tags.ts`](src/data/tags.ts). Flexible tagging is supported within this list — articles may have multiple approved tags.

Browse all tags at `/blog/tags`. Validation rejects tags not in the approved list.

## Archive rules

Archive routes:

| Route | Description |
|---|---|
| `/blog/archive` | All years with published articles |
| `/blog/archive/[year]` | Months within a year |
| `/blog/archive/[year]/[month]` | Articles published in that month |

Month URLs use zero-padded months (`/blog/archive/2026/05`). Archive pages support pagination when article count exceeds 12 per page.

## Series rules

Series routes:

| Route | Description |
|---|---|
| `/blog/series` | All series with published articles |
| `/blog/series/[series]` | Articles in a series, ordered by `seriesOrder` then `date` |

Set `series` and optional `seriesOrder` in frontmatter to group multi-part content.

## One-article-per-day workflow

1. **Scaffold** — `npm run new:article -- --title "..." --category stablecoin-payments --date 2026-05-22`
2. **Write** — complete the MDX body; assign approved tags
3. **Validate** — `npm run validate:content && npm run check:banned-claims -- --all`
4. **Review** — set `status: in_review`, open PR
5. **Publish** — set `status: published`, merge to `main`

Each article gets a unique dated folder path. One article per day maps to one file per date per category.

### Recommended weekly editorial rotation

| Day | Category |
|---|---|
| Monday | Stablecoin Payments |
| Tuesday | Tokenization |
| Wednesday | Digital Asset Compliance |
| Thursday | Enterprise Implementation |
| Friday | Market Notes |
| Saturday | Founder Notes |
| Sunday | Flexible (repeat highest-priority theme) |

This rotation keeps category coverage balanced at ~4 articles per category per month.

## Routing

| Route | Description |
|---|---|
| `/blog` | Main blog index (paginated) |
| `/blog/[slug]` | Individual article |
| `/blog/category/[category]` | Category listing (paginated) |
| `/blog/tag/[tag]` | Tag listing (paginated) |
| `/blog/tags` | All tags index |
| `/blog/archive` | Archive year index |
| `/blog/archive/[year]/[month]` | Monthly archive (paginated) |
| `/blog/series` | Series index |
| `/blog/series/[series]` | Series detail (paginated) |
| `/search` | Pagefind search |
| `/rss.xml` | RSS feed |

Pagination: 12 articles per page.

## Local development

```bash
npm install
npm run dev
npm run build
npm run preview
```

### Content commands

```bash
npm run new:article -- --title "Article Title" --category digital-asset-compliance --date 2026-05-22
npm run validate:content
npm run check:banned-claims -- --all
```

Pagefind search requires a production build: `npm run build && npm run preview`.

## Tech stack

- Astro 5 (static output)
- TypeScript, Tailwind CSS, MDX
- Astro Content Collections with glob loader
- Pagefind search, RSS, sitemap
- AWS S3 + CloudFront via GitHub Actions

## AWS deployment

See [docs/editorial-workflow.md](docs/editorial-workflow.md) for the full editorial process and [docs/deploy.yml](docs/deploy.yml) for the workflow reference.

Deploy uses **OIDC** (no long-lived AWS keys). Copy [`.env.example`](.env.example) to `.env` for local deployment.

### GitHub secrets

| Secret | Description |
|---|---|
| `AWS_ROLE_ARN` | IAM role for GitHub OIDC (e.g. `fazezero-FrontEnd_DevRole`) |
| `S3_BUCKET_NAME` | Target S3 bucket (e.g. `blog.fazezero.com`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront distribution ID |

`AWS_REGION` (`us-east-1`) and `PUBLIC_SITE_URL` are set in the workflow env block.

### Local deployment

Configure `.env` from `.env.example`, authenticate with AWS (via SSO or assumed role), then:

```bash
npm run deploy:aws
```

The script loads `.env`, builds the site, syncs `dist/` to S3 (immutable assets + no-cache HTML), and invalidates CloudFront.

### CloudFront URL rewrite (required)

S3 REST origins do not map `/blog/category/foo/` to `/blog/category/foo/index.html`. Attach the CloudFront Function in [`infrastructure/cloudfront-index-rewrite.js`](infrastructure/cloudfront-index-rewrite.js):

1. CloudFront → **Functions** → Create function (copy script from repo)
2. Publish the function
3. Distribution → **Behaviors** → Default → **Edit**
4. **Viewer request** → associate `fazezero-blog-index-rewrite`
5. Save and wait for deployment

Without this function, nested routes return S3 `AccessDenied` while `/` works.

## Project structure

```
src/content/articles/YYYY/MM/category/   Dated MDX articles
src/data/categories.ts                   Primary categories
src/data/tags.ts                         Approved tag list
src/lib/content.ts                       Content query helpers
content/governance/banned-claims.yml     Banned-claims rules
templates/article.mdx                    Article template
scripts/new-article.ts                   Scaffold CLI
docs/editorial-workflow.md               Editorial process
```
