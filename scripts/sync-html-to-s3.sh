#!/usr/bin/env bash
# Upload HTML so S3 REST origins resolve routes without a CloudFront rewrite.
# For each dist/**/index.html, also publish extensionless and trailing-slash keys.
set -euo pipefail

OUTPUT_DIR="${1:?output dir required}"
BUCKET="${2:?bucket required}"
REGION="${3:-us-east-1}"

CACHE="no-cache, must-revalidate"
CONTENT_TYPE="text/html"

upload_file() {
  local file="$1"
  local key="$2"
  aws s3 cp "$file" "s3://${BUCKET}/${key}" \
    --content-type "$CONTENT_TYPE" \
    --cache-control "$CACHE" \
    --region "$REGION"
}

while IFS= read -r file; do
  rel="${file#"${OUTPUT_DIR}/"}"

  if [ "$rel" = "index.html" ]; then
    upload_file "$file" "index.html"
    continue
  fi

  if [[ "$rel" == */index.html ]]; then
    route_key="${rel%/index.html}"
    upload_file "$file" "${route_key}/index.html"
    upload_file "$file" "${route_key}"
    upload_file "$file" "${route_key}/"
    continue
  fi

  upload_file "$file" "$rel"
done < <(find "$OUTPUT_DIR" -name '*.html' -type f | sort)

echo "HTML routes uploaded (index, extensionless, and trailing-slash keys)"
