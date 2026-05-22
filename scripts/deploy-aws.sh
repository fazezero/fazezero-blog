#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

: "${S3_BUCKET_NAME:?S3_BUCKET_NAME is required (set in .env)}"
: "${CLOUDFRONT_DISTRIBUTION_ID:?CLOUDFRONT_DISTRIBUTION_ID is required (set in .env)}"

AWS_REGION="${AWS_REGION:-us-east-1}"
OUTPUT_DIR="dist"

npm run build

test -d "$OUTPUT_DIR"
test -f "$OUTPUT_DIR/index.html"

echo "Deploying static assets (excluding HTML)..."
aws s3 sync "$OUTPUT_DIR" "s3://${S3_BUCKET_NAME}/" \
  --delete \
  --exact-timestamps \
  --cache-control "public, max-age=31536000, immutable" \
  --exclude "*.html" \
  --region "$AWS_REGION"

echo "Uploading HTML routes..."
bash scripts/sync-html-to-s3.sh "$OUTPUT_DIR" "$S3_BUCKET_NAME" "$AWS_REGION"

echo "Invalidating CloudFront..."
aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/*" \
  --region "$AWS_REGION"

echo "Deployment complete"
echo "Bucket: s3://${S3_BUCKET_NAME}/"
echo "Distribution: ${CLOUDFRONT_DISTRIBUTION_ID}"
