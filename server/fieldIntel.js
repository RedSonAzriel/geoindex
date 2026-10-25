'use strict';
// Field Intelligence: scheduled RSS pull -> filter and tag -> cached JSON -> /api/field-intel.
// Pattern: a refresh job writes a cache with a freshness stamp, and requests only ever read the cache.
var fs = require('fs');
var path = require('path');
var cfg = require('./feeds.config');

var CACHE_DIR = path.join(__dirname, '..', 'data-cache');
var CACHE_FILE = path.join(CACHE_DIR, 'field-intel.json');

var state = { items: [], meta: { fetchedAt: null, recordCount: 0, feeds: [], lastError: null } };
var refreshing = null;

// ---------- parsing ----------
function decode(s) {
  return String(s || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(parseInt(n, 10)); })
    .replace(/&amp;/g, '&');
}

function clean(s) {
  return decode(s).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function pick(block, tag) {
  var m = new RegExp('<' + tag + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + tag + '>', 'i').exec(block);
  return m ? m[1] : '';
}

function pickLink(block) {
  var m = /<link>([\s\S]*?)<\/link>/i.exec(block);
  if (m && clean(m[1])) return clean(m[1]);
  var alt = /<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i.exec(block);
  if (alt) return decode(alt[1]);
  var any = /<link[^>]*href=["']([^"']+)["']/i.exec(block);
  return any ? decode(any[1]) : '';
}

function parseFeed(xml, fallbackSource) {
  var out = [];
  var re = /<(item|entry)[\s>][\s\S]*?<\/\1>/gi;
  var m;
  while ((m = re.exec(xml)) !== null) {
    var block = m[0];
    var title = clean(pick(block, 'title'));
    var link = pickLink(block);
    var dateRaw = clean(pick(block, 'pubDate') || pick(block, 'published') || pick(block, 'updated') || pick(block, 'dc:date'));
    var d = new Date(dateRaw);
    var source = clean(pick(block, 'source')) || fallbackSource || '';
    if (source && title.slice(-(source.length + 3)) === ' - ' + source) {
      title = title.slice(0, title.length - source.length - 3);
    }
    var excerpt = clean(pick(block, 'description') || pick(block, 'summary'));
    var ex = excerpt.toLowerCase();
    var tl = title.toLowerCase();
    if (ex && (tl.indexOf(ex.slice(0, 40)) === 0 || ex.indexOf(tl.slice(0, 40)) === 0)) excerpt = '';
    if (excerpt.length > 240) excerpt = excerpt.slice(0, 237).replace(/\s+\S*$/, '') + '...';
    if (!title || !link || isNaN(d.getTime())) continue;
    out.push({ title: title, link: link, date: d, source: source, excerpt: excerpt });
  }
  return out;
}

// ---------- tagging ----------
function hasAny(text, words) {
  for (var i = 0; i < words.length; i++) {
    if (text.indexOf(words[i]) >= 0) return true;
  }
  return false;
}

function tagCountry(text) {
  for (var i = 0; i < cfg.countryKeywords.length; i++) {
    if (hasAny(text, cfg.countryKeywords[i][1])) return cfg.countryKeywords[i][0];
  }
  return null;
}

function tagBasin(text) {
  for (var i = 0; i < cfg.basinKeywords.length; i++) {
    if (text.indexOf(cfg.basinKeywords[i][0]) >= 0) return cfg.basinKeywords[i][1];
  }
  return '';
}

function tagCategory(text) {
  for (var i = 0; i < cfg.categoryKeywords.length; i++) {
    if (hasAny(text, cfg.categoryKeywords[i][1])) return cfg.categoryKeywords[i][0];
  }
  return 'Development';
}

function hashId(s) {
  var h = 5381;
  for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return 'live-' + h.toString(36);
}

function toNote(raw) {
  var text = (raw.title + ' ' + raw.excerpt).toLowerCase();
  var country = tagCountry(text);
  if (!country || !hasAny(text, cfg.energyTerms)) return null;
  return {
    id: hashId(raw.link),
    date: raw.date.toISOString().slice(0, 10),
    category: tagCategory(text),
    country: country,
    basin: tagBasin(text),
    title: raw.title,
    summary: raw.excerpt,
    detail: '',
    source: raw.source,
    url: raw.link,
    live: true,
    sourceCount: 1,
    others: []
  };
}

// ---------- fetching ----------
function hostAllowed(url) {
  var host;
  try { host = new URL(url).hostname; } catch (e) { return false; }
  return cfg.allowedHosts.indexOf(host) >= 0;
}

async function fetchOne(feed) {
  var res = { name: feed.name, ok: false, count: 0, error: null, raw: [] };
  if (!hostAllowed(feed.url)) { res.error = 'host not allowed'; return res; }
  var ctl = new AbortController();
  var timer = setTimeout(function () { ctl.abort(); }, cfg.timeoutMs);
  try {
    var r = await fetch(feed.url, { signal: ctl.signal, headers: { 'User-Agent': 'GeoIndex-FieldIntel/1.0' } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    var xml = await r.text();
    if (xml.length > cfg.maxBytes) throw new Error('response too large');
    res.raw = parseFeed(xml, feed.name);
    res.count = res.raw.length;
    res.ok = true;
  } catch (e) {
    res.error = e && e.name === 'AbortError' ? 'timeout' : String(e && e.message ? e.message : e);
  } finally {
    clearTimeout(timer);
  }
  return res;
}

var STOP = { the: 1, and: 1, for: 1, with: 1, from: 1, after: 1, over: 1, new: 1, its: 1, are: 1, has: 1, will: 1, into: 1, amid: 1 };

function titleTokens(title) {
  var words = title.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/);
  var set = {};
  var size = 0;
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    if (w.length > 2 && !STOP[w] && !set[w]) { set[w] = 1; size++; }
  }
  return { set: set, size: size };
}

// Two headlines count as the same story when they share most of their significant words.
function similarTitles(a, b) {
  if (!a.size || !b.size) return false;
  var inter = 0;
  for (var k in a.set) { if (b.set[k]) inter++; }
  var jaccard = inter / (a.size + b.size - inter);
  var overlap = inter / Math.min(a.size, b.size);
  return jaccard >= 0.55 || (overlap >= 0.8 && inter >= 5);
}

// Record another outlet covering the same story (one entry per distinct outlet, capped to keep the payload small).
function noteOutlet(base, extra) {
  if (!extra.source || extra.source === base.source) return;
  for (var k = 0; k < base.others.length; k++) {
    if (base.others[k].source === extra.source) return;
  }
  if (base.others.length < 8) base.others.push({ source: extra.source, url: extra.url });
  base.sourceCount = 1 + base.others.length;
}

function build(results) {
  var cutoff = Date.now() - cfg.maxAgeDays * 86400000;
  var cands = [];
  results.forEach(function (r) {
    r.raw.forEach(function (raw) {
      if (raw.date.getTime() < cutoff) return;
      var note = toNote(raw);
      if (note) cands.push(note);
    });
  });
  cands.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  var kept = [];
  var keptTok = [];
  for (var i = 0; i < cands.length; i++) {
    var t = titleTokens(cands[i].title);
    var dup = false;
    for (var j = 0; j < keptTok.length; j++) {
      if (similarTitles(t, keptTok[j])) { dup = true; noteOutlet(kept[j], cands[i]); break; }
    }
    if (!dup) { kept.push(cands[i]); keptTok.push(t); }
  }
  return kept.slice(0, cfg.maxItems);
}

function refresh() {
  if (refreshing) return refreshing;
  refreshing = (async function () {
    var results = await Promise.all(cfg.feeds.map(fetchOne));
    var feedsMeta = results.map(function (r) { return { name: r.name, ok: r.ok, count: r.count, error: r.error }; });
    var anyOk = results.some(function (r) { return r.ok; });
    if (!anyOk) {
      state.meta.feeds = feedsMeta;
      state.meta.lastError = 'all feeds failed';
      console.warn('[field-intel] all feeds failed; keeping previous cache');
      return;
    }
    var items = build(results);
    state = { items: items, meta: { fetchedAt: new Date().toISOString(), recordCount: items.length, feeds: feedsMeta, lastError: null } };
    try {
      if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
      fs.writeFileSync(CACHE_FILE + '.tmp', JSON.stringify(state));
      fs.renameSync(CACHE_FILE + '.tmp', CACHE_FILE);
    } catch (e) {
      console.warn('[field-intel] cache write failed: ' + e.message);
    }
    console.log('[field-intel] refreshed: ' + items.length + ' items');
  })().finally(function () { refreshing = null; });
  return refreshing;
}

function loadCache() {
  try {
    var parsed = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    if (parsed && Array.isArray(parsed.items) && parsed.meta) state = parsed;
  } catch (e) { /* no cache yet */ }
}

function start() {
  loadCache();
  refresh().catch(function (e) { console.warn('[field-intel] refresh error: ' + e.message); });
  setInterval(function () {
    refresh().catch(function (e) { console.warn('[field-intel] refresh error: ' + e.message); });
  }, cfg.refreshMinutes * 60000);
}

// ---------- handlers ----------
function handleFieldIntel(req, res) {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ items: state.items, meta: state.meta });
}

function handleHealth(req, res) {
  var fetchedAt = state.meta.fetchedAt;
  var ageMin = fetchedAt ? Math.round((Date.now() - new Date(fetchedAt).getTime()) / 60000) : null;
  var status = 'OK';
  if (!fetchedAt || state.items.length === 0) status = 'EMPTY';
  else if (ageMin > cfg.maxStaleMinutes) status = 'STALE';
  res.set('Cache-Control', 'no-store');
  res.json({
    status: status,
    fieldIntel: { fetchedAt: fetchedAt, ageMin: ageMin, maxStaleMin: cfg.maxStaleMinutes, recordCount: state.items.length, lastError: state.meta.lastError, feeds: state.meta.feeds }
  });
}

module.exports = { start: start, refresh: refresh, handleFieldIntel: handleFieldIntel, handleHealth: handleHealth, parseFeed: parseFeed, toNote: toNote, build: build };
