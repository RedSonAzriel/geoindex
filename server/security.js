'use strict';
// Security middleware: HTTPS redirect, response headers, Content-Security-Policy and a small rate limiter.
// No third-party packages. The CSP starts in report-only mode; set CSP_ENFORCE=1 on Heroku to enforce it
// once the browser console shows no violations on a normal visit.

var CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://gibs.earthdata.nasa.gov https://*.tile.opentopomap.org",
  "connect-src 'self' blob: data: https://gibs.earthdata.nasa.gov https://*.tile.opentopomap.org https://demotiles.maplibre.org",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'"
].join('; ');

function httpsRedirect(req, res, next) {
  var isProd = process.env.NODE_ENV === 'production';
  var proto = req.headers['x-forwarded-proto'];
  if (isProd && proto && proto !== 'https') {
    return res.redirect(301, 'https://' + req.headers.host + req.originalUrl);
  }
  next();
}

function headers(req, res, next) {
  res.removeHeader('X-Powered-By');
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('X-Frame-Options', 'DENY');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.set('Cross-Origin-Opener-Policy', 'same-origin');
  if (process.env.NODE_ENV === 'production') {
    res.set('Strict-Transport-Security', 'max-age=31536000');
  }
  res.set(process.env.CSP_ENFORCE === '1' ? 'Content-Security-Policy' : 'Content-Security-Policy-Report-Only', CSP);
  next();
}

// Fixed-window limiter per client address. Fine for one dyno; use a shared store if you scale out.
function rateLimit(options) {
  var windowMs = options.windowMs;
  var max = options.max;
  var hits = {};
  setInterval(function () { hits = {}; }, windowMs).unref();
  return function (req, res, next) {
    var key = req.ip || 'unknown';
    hits[key] = (hits[key] || 0) + 1;
    if (hits[key] > max) {
      res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({ error: 'Too many requests' });
    }
    next();
  };
}

module.exports = { httpsRedirect: httpsRedirect, headers: headers, rateLimit: rateLimit, CSP: CSP };
