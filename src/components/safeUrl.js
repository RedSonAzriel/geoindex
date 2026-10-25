// Only http and https links from outside sources are allowed in href attributes.
// React does not block javascript: URLs, so feed links go through this first.
export function safeHref(u) {
  try {
    var p = new URL(String(u || ""));
    return p.protocol === "http:" || p.protocol === "https:" ? p.href : undefined;
  } catch (e) {
    return undefined;
  }
}
