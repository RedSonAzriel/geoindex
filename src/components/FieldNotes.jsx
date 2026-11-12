import { useState, useMemo } from "react";
import { FIELD_NOTES, CATEGORIES } from "../data/fieldNotes";

function formatDate(d) {
  var dt = new Date(d + "T00:00:00");
  var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return months[dt.getMonth()] + " " + dt.getDate() + ", " + dt.getFullYear();
}

function catColor(cat) {
  var c = CATEGORIES.find(function(x) { return x.key === cat; });
  return c ? c.color : "#94a3b8";
}

export default function FieldNotes() {
  var _cat = useState("all");
  var cat = _cat[0];
  var setCat = _cat[1];

  var _q = useState("");
  var q = _q[0];
  var setQ = _q[1];

  var _exp = useState(null);
  var exp = _exp[0];
  var setExp = _exp[1];

  var notes = useMemo(function() {
    var r = FIELD_NOTES;
    if (cat !== "all") {
      r = r.filter(function(n) { return n.category === cat; });
    }
    if (q) {
      var lq = q.toLowerCase();
      r = r.filter(function(n) {
        return n.title.toLowerCase().indexOf(lq) >= 0 ||
          n.body.toLowerCase().indexOf(lq) >= 0 ||
          n.countries.some(function(c) { return c.toLowerCase().indexOf(lq) >= 0; }) ||
          n.tags.some(function(t) { return t.toLowerCase().indexOf(lq) >= 0; });
      });
    }
    return r.sort(function(a, b) {
      return b.published_at.localeCompare(a.published_at);
    });
  }, [cat, q]);

  return (
    <div>
      {/* Header */}
      <div style={S.head}>
        <div>
          <h2 style={S.title}>Field Notes</h2>
          <p style={S.sub}>Curated Africa E&P industry intelligence</p>
        </div>
        <div style={S.headRight}>
          <div style={S.searchWrap}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>
            </svg>
            <input
              value={q}
              onChange={function(e) { setQ(e.target.value); }}
              placeholder="Search notes, countries, tags..."
              style={S.searchIn}
            />
          </div>
          <span style={S.count}>{notes.length} note{notes.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Category tabs */}
      <div style={S.tabs}>
        {CATEGORIES.map(function(c) {
          var isActive = cat === c.key;
          var count = c.key === "all"
            ? FIELD_NOTES.length
            : FIELD_NOTES.filter(function(n) { return n.category === c.key; }).length;
          return (
            <button
              key={c.key}
              onClick={function() { setCat(c.key); }}
              style={Object.assign({}, S.tab, isActive ? { background: c.color + "18", color: c.color, borderColor: c.color + "40" } : {})}
            >
              {c.label}
              <span style={Object.assign({}, S.tabCount, isActive ? { background: c.color + "22", color: c.color } : {})}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Notes list */}
      <div style={S.list}>
        {notes.length === 0 && (
          <div style={S.empty}>No field notes match your filters.</div>
        )}
        {notes.map(function(n) {
          var isOpen = exp === n.id;
          var cc = catColor(n.category);
          return (
            <div
              key={n.id}
              style={Object.assign({}, S.card, isOpen ? { borderColor: cc + "40" } : {})}
              onClick={function() { setExp(isOpen ? null : n.id); }}
            >
              {/* Top row: date + category */}
              <div style={S.cardTop}>
                <span style={S.date}>{formatDate(n.published_at)}</span>
                <span style={Object.assign({}, S.catPill, { color: cc, background: cc + "12", borderColor: cc + "25" })}>
                  {n.category}
                </span>
              </div>

              {/* Title */}
              <h3 style={S.cardTitle}>{n.title}</h3>

              {/* Body — collapsed or expanded */}
              <p style={Object.assign({}, S.cardBody, isOpen ? {} : S.cardBodyClamp)}>
                {n.body}
              </p>

              {/* Countries */}
              {n.countries.length > 0 && (
                <div style={S.tagRow}>
                  {n.countries.map(function(c) {
                    return <span key={c} style={S.countryTag}>{c}</span>;
                  })}
                </div>
              )}

              {/* Tags */}
              {n.tags.length > 0 && (
                <div style={S.tagRow}>
                  {n.tags.map(function(t) {
                    return <span key={t} style={S.tag}>{t}</span>;
                  })}
                </div>
              )}

              {/* Source */}
              <div style={S.cardFooter}>
                <span style={S.source}>
                  {n.source_name || "Internal"}
                  {n.source_url && (
                    <a
                      href={n.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={S.sourceLink}
                      onClick={function(e) { e.stopPropagation(); }}
                    >
                      {" "}View source
                    </a>
                  )}
                </span>
                <span style={S.author}>{n.author}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

var S = {
  head: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-.01em" },
  sub: { margin: 0, marginTop: 4, fontSize: 12, color: "#475569" },
  headRight: { display: "flex", alignItems: "center", gap: 12 },
  searchWrap: { display: "flex", alignItems: "center", gap: 7, background: "#111b2e", border: "1px solid #1e2d45", borderRadius: 8, padding: "7px 12px", minWidth: 220 },
  searchIn: { background: "transparent", border: "none", outline: "none", color: "#e2e8f0", fontSize: 12, fontFamily: "inherit", width: "100%" },
  count: { fontSize: 11, color: "#475569", whiteSpace: "nowrap" },

  tabs: { display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid #1a2338" },
  tab: { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid #1e2d45", background: "transparent", color: "#64748b", fontSize: 12, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", transition: "all .15s" },
  tabCount: { fontSize: 10, fontWeight: 600, background: "#1a2338", color: "#475569", padding: "1px 6px", borderRadius: 4 },

  list: { display: "flex", flexDirection: "column", gap: 12 },
  empty: { textAlign: "center", padding: 40, color: "#334155", fontSize: 13 },

  card: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 12, padding: "18px 22px", cursor: "pointer", transition: "border-color .15s, box-shadow .15s" },
  cardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  date: { fontSize: 11, color: "#475569", fontWeight: 500 },
  catPill: { fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 6, border: "1px solid" },
  cardTitle: { margin: 0, fontSize: 15, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.4, marginBottom: 8 },
  cardBody: { margin: 0, fontSize: 13, color: "#94a3b8", lineHeight: 1.7, marginBottom: 10 },
  cardBodyClamp: { overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" },

  tagRow: { display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 },
  countryTag: { fontSize: 10, padding: "3px 8px", borderRadius: 5, background: "#111b2e", color: "#60a5fa", border: "1px solid #1e3a5f", fontWeight: 500 },
  tag: { fontSize: 10, padding: "3px 8px", borderRadius: 5, background: "#111b2e", color: "#64748b", border: "1px solid #1e2d4530", fontWeight: 500 },

  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, paddingTop: 10, borderTop: "1px solid #1a233850" },
  source: { fontSize: 11, color: "#334155" },
  sourceLink: { color: "#60a5fa", textDecoration: "none", fontSize: 11 },
  author: { fontSize: 10, color: "#293548" },
};
