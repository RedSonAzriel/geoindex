import { useState, useMemo, useEffect } from "react";
import { FIELD_NOTES, NOTE_CATEGORIES } from "../data/fieldNotes";

var CAT_CLR = {
  Discovery: "#fbbf24",
  Development: "#34d399",
  Infrastructure: "#60a5fa",
  Policy: "#a78bfa"
};

var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtDate(d) {
  var p = String(d).split("-");
  if (p.length < 2) return p[0];
  if (p.length === 2) return MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
  return parseInt(p[2], 10) + " " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
}

function timeAgo(iso) {
  if (!iso) return "never";
  var min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return min + " min ago";
  if (min < 1440) return Math.round(min / 60) + " h ago";
  return Math.round(min / 1440) + " d ago";
}

var ST = {
  wrap: { display: "flex", flexDirection: "column", gap: 14, maxWidth: 920 },
  banner: { background: "#0c1322", border: "1px solid #1a2338", borderLeft: "3px solid #fbbf24", borderRadius: 8, padding: "9px 12px", fontSize: 11, color: "#94a3b8" },
  bannerLive: { background: "#0c1322", border: "1px solid #1a2338", borderLeft: "3px solid #34d399", borderRadius: 8, padding: "9px 12px", fontSize: 11, color: "#94a3b8" },
  bar: { display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 },
  tabs: { display: "flex", flexWrap: "wrap", gap: 6 },
  search: { marginLeft: "auto", background: "#0c1322", border: "1px solid #1a2338", borderRadius: 8, padding: "7px 12px", color: "#e2e8f0", fontSize: 12, width: 230, outline: "none", fontFamily: "inherit" },
  card: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 12, padding: "14px 16px", cursor: "pointer" },
  top: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" },
  date: { fontSize: 11, color: "#475569", marginLeft: "auto" },
  title: { fontSize: 14, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.35 },
  summary: { fontSize: 12.5, color: "#94a3b8", marginTop: 5, lineHeight: 1.5 },
  detail: { fontSize: 12.5, color: "#cbd5e1", marginTop: 10, paddingTop: 10, borderTop: "1px solid #1a2338", lineHeight: 1.55 },
  meta: { fontSize: 11, color: "#475569", marginTop: 8 },
  link: { color: "#34d399", fontWeight: 600, textDecoration: "none" },
  empty: { padding: 30, textAlign: "center", color: "#475569", fontSize: 12 }
};

function tabStyle(active) {
  return {
    background: active ? "#34d399" : "#0c1322",
    color: active ? "#06281d" : "#94a3b8",
    border: "1px solid " + (active ? "#34d399" : "#1a2338"),
    borderRadius: 999,
    padding: "5px 13px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit"
  };
}

function pillStyle(color) {
  return {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: ".04em",
    textTransform: "uppercase",
    color: color,
    background: color + "1f",
    padding: "2px 8px",
    borderRadius: 4
  };
}

export default function FieldNotes() {
  var catState = useState("All");
  var cat = catState[0];
  var setCat = catState[1];
  var qState = useState("");
  var q = qState[0];
  var setQ = qState[1];
  var openState = useState(null);
  var openId = openState[0];
  var setOpenId = openState[1];
  var liveState = useState(null);
  var live = liveState[0];
  var setLive = liveState[1];
  var modeState = useState("live");
  var mode = modeState[0];
  var setMode = modeState[1];

  useEffect(function () {
    var cancelled = false;
    fetch("/api/field-intel")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!cancelled && data && data.items && data.items.length > 0) setLive(data);
      })
      .catch(function () {});
    return function () { cancelled = true; };
  }, []);

  var haveLive = !!live;
  var showLive = haveLive && mode === "live";
  var source = showLive ? live.items : FIELD_NOTES;

  var rows = useMemo(function () {
    var r = source.slice().sort(function (a, b) {
      return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
    });
    if (cat !== "All") {
      r = r.filter(function (n) { return n.category === cat; });
    }
    if (q) {
      var lq = q.toLowerCase();
      r = r.filter(function (n) {
        return (n.title + " " + (n.summary || "") + " " + (n.detail || "") + " " + n.country + " " + (n.basin || "")).toLowerCase().indexOf(lq) >= 0;
      });
    }
    return r;
  }, [source, cat, q]);

  return (
    <div style={ST.wrap}>
      {showLive ? (
        <div style={ST.bannerLive}>
          Live feed: {live.items.length} items, updated {timeAgo(live.meta && live.meta.fetchedAt)}. Headlines are auto-tagged by keyword and link to the original publisher. Tags can be wrong.
        </div>
      ) : (
        <div style={ST.banner}>
          {haveLive ? "Reference notes: " : "Live feed unavailable, showing reference notes. "}
          Seed entries for layout and testing. Verify figures and dates against primary sources before relying on them.
        </div>
      )}
      <div style={ST.bar}>
        {haveLive && (
          <div style={ST.tabs}>
            <button style={tabStyle(mode === "live")} onClick={function () { setMode("live"); setOpenId(null); }}>Live</button>
            <button style={tabStyle(mode === "ref")} onClick={function () { setMode("ref"); setOpenId(null); }}>Reference</button>
          </div>
        )}
        <div style={ST.tabs}>
          {NOTE_CATEGORIES.map(function (c) {
            return (
              <button key={c} style={tabStyle(cat === c)} onClick={function () { setCat(c); }}>
                {c}
              </button>
            );
          })}
        </div>
        <input
          value={q}
          onChange={function (e) { setQ(e.target.value); }}
          placeholder="Search field notes..."
          style={ST.search}
        />
      </div>
      {rows.length === 0 && <div style={ST.empty}>No field notes match your filters.</div>}
      {rows.map(function (n) {
        var open = openId === n.id;
        return (
          <div
            key={n.id}
            style={ST.card}
            onClick={function () { setOpenId(open ? null : n.id); }}
          >
            <div style={ST.top}>
              <span style={pillStyle(CAT_CLR[n.category] || "#94a3b8")}>{n.category}</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>{n.country}</span>
              <span style={ST.date}>{fmtDate(n.date)}</span>
            </div>
            <div style={ST.title}>{n.title}</div>
            {n.summary && <div style={ST.summary}>{n.summary}</div>}
            {open && (
              <div>
                {n.detail && <div style={ST.detail}>{n.detail}</div>}
                <div style={ST.meta}>
                  {n.basin ? "Basin: " + n.basin + " · " : ""}Source: {n.source}
                  {n.url && (
                    <span>
                      {" · "}
                      <a href={n.url} target="_blank" rel="noopener noreferrer" style={ST.link} onClick={function (e) { e.stopPropagation(); }}>Open original</a>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
