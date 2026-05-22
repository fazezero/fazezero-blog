# CloudFront setup for S3 static hosting

S3 REST origins (used with `aws s3 sync`) do **not** automatically map:

- `/blog/category/tokenization` → `blog/category/tokenization/index.html`

That is why `/blog/category/tokenization/index.html` works but `/blog/category/tokenization` returns `AccessDenied`.

A **404 → index.html custom error** does not fix this — S3 returns **403 AccessDenied**, not 404.

## Required: Viewer request function

Attach [`cloudfront-index-rewrite.js`](cloudfront-index-rewrite.js) to the distribution.

1. AWS Console → **CloudFront** → **Functions** → **Create function**
2. Name: `fazezero-blog-index-rewrite`
3. Paste the script from `cloudfront-index-rewrite.js`
4. **Save** → **Publish**
5. Open your distribution → **Behaviors** → default behavior → **Edit**
6. **Function associations** → **Viewer request** → select the function
7. Save changes and wait for deployment (~2–5 minutes)

This rewrites:

| Request | S3 object fetched |
|---|---|
| `/blog/category/tokenization` | `/blog/category/tokenization/index.html` |
| `/blog/category/tokenization/` | `/blog/category/tokenization/index.html` |

## Deploy script (secondary)

`scripts/sync-html-to-s3.sh` also uploads extensionless HTML keys during deploy. The CloudFront function is still recommended so both slash and no-slash URLs work.

## Optional: custom error pages

- **403/404 → `/404.html`** with response code **404** — shows the Astro 404 page for missing URLs
- Do **not** use **404 → `/index.html`** — that serves the homepage for broken links on a multi-page site
