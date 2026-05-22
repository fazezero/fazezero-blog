/**
 * CloudFront Function: rewrite directory URLs to index.html
 *
 * Attach to CloudFront distribution → Behaviors → Viewer request
 * Function name suggestion: fazezero-blog-index-rewrite
 *
 * Required because S3 REST origins do not resolve /path/ to /path/index.html.
 */
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  } else if (!uri.includes('.')) {
    request.uri += '/index.html';
  }

  return request;
}
