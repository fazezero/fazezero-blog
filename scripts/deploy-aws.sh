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

if [ -n "${AWS_PROFILE:-}" ]; then
  export AWS_PROFILE
  echo "Using AWS profile: ${AWS_PROFILE}"
fi

verify_aws_credentials() {
  if aws sts get-caller-identity --region "$AWS_REGION" >/dev/null 2>&1; then
    echo "AWS credentials valid: $(aws sts get-caller-identity --query Arn --output text --region "$AWS_REGION")"
    return 0
  fi

  cat <<'EOF' >&2
AWS credentials are missing or invalid.

Local deploy requires an authenticated AWS CLI session with S3 and CloudFront access.

Options:
  1. SSO (recommended):
       aws sso login --profile YOUR_PROFILE
       Add to .env: AWS_PROFILE=YOUR_PROFILE

  2. Clear stale access keys if you use SSO/role-based auth:
       unset AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY AWS_SESSION_TOKEN

  3. Let GitHub Actions deploy instead — push to main uses OIDC via AWS_ROLE_ARN.

EOF
  return 1
}

npm run build

test -d "$OUTPUT_DIR"
test -f "$OUTPUT_DIR/index.html"

verify_aws_credentials

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
