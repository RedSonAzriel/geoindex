import { useState, useMemo } from "react";
import { readinessScore } from "../data/infrastructure";
import { SignalBadge } from "./Signals";
import { Star } from "./Watchlist";

var STATUS_CLR = { Frontier: "#a78bfa", Exploration: "#fbbf24", Appraisal: "#60a5fa", Development: "#34d399" };
var STATUS_ORDER = ["Frontier", "Exploration", "Appraisal", "Development"];

var ST = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(360px,1fr))", gap: 18, alignItems: "start" },
  card: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 12, overflow: "hidden" },
  head: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid #1a2338" },
  title: { fontSize: 14, fontWeight: 600, color: "#e2e8f0" },
  sub: { fontSize: 10, color: "#475569" },
  body: { padding: "6px 18px 14px" },
  row: { display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #111a2c", cursor: "pointer" },
  empty: { padding: "18px 0", fontSize: 12, color: "#475569" },
  pill: { fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, display: "inline-block" },
  th: { textAlign: "left", padding: "10px 14px", fontSize: 10, fontWeight: 600, color: "#3d4f6a", textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #1a2338", background: "#091019", position: "sticky", top: 0, zIndex: 2, cursor: "pointer", whiteSpace: "nowrap", userSelect: "none" },
  td: { padding: "10px 14px", color: "#94a3b8", whiteSpace: "nowrap", fontSize: 12 },
  btn: { background: "#111b2e", border: "1px solid #1e2d45", color: "#94a3b8", padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }
};

function StatusPill(props) {
  var c = STATUS_CLR[props.status] || "#94a3b8";
  return <span style={Object.assign({}, ST.pill, { color: c, background: c + "15", border: "1px solid " + c + "28" })}>{props.status}</span>;
}

function Card(props) {
  return (
    <div style={ST.card}>
      <div style={ST.head}>
        <span style={ST.title}>{props.title}</span>
        {props.sub && <span style={ST.sub}>{props.sub}</span>}
      </div>
      <div style={ST.body}>{props.children}</div>
    </div>
  );
}

function Bars(props) {
  var rows = props.rows;
  var max = 0;
  rows.forEach(function (r) { if (r.value > max) max = r.value; });
  return (
    <div style={{ paddingTop: 8 }}>
      {rows.map(function (r) {
        return (
          <div key={r.label} style={{ marginBottom: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 3 }}>
              <span style={{ color: "#94a3b8" }}>{r.label}</span>
              <span style={{ color: props.color, fontWeight: 600 }}>{r.value.toLocaleString()} {props.unit}</span>
            </div>
            <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: (max ? (r.value / max) * 100 : 0) + "%", background: props.color, opacity: 0.7, borderRadius: 3 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function sumBy(data, key, valueFn) {
  var map = {};
  data.forEach(function (b) { map[b[key]] = (map[b[key]] || 0) + valueFn(b); });
  return Object.keys(map).map(function (k) { return { label: k, value: Math.round(map[k] * 10) / 10 }; })
    .sort(function (a, b) { return b.value - a.value; });
}

function fmtDate(d) {
  return d ? String(d).slice(0, 10) : "";
}

export function Dashboard(props) {
  var data = props.data;
  var all = props.all;
  var sig = props.sig;
  var wl = props.wl;
  var watched = all.filter(function (b) { return wl.names.indexOf(b.name) >= 0; });

  var moving = useMemo(function () {
    var surge = [];
    var quiet = [];
    Object.keys(sig.signals || {}).forEach(function (tag) {
      var s = sig.signals[tag];
      if (s.status === "surge") surge.push({ tag: tag, s: s });
      else if (s.status === "quiet") quiet.push({ tag: tag, s: s });
    });
    surge.sort(function (a, b) { return b.s.n7 - a.s.n7 || b.s.n30 - a.s.n30; });
    quiet.sort(function (a, b) { return b.s.daysSince - a.s.daysSince; });
    return { surge: surge, quiet: quiet };
  }, [sig.signals]);

  var statusCounts = STATUS_ORDER.map(function (s) {
    return { label: s, value: data.filter(function (b) { return b.status === s; }).length };
  });

  function openByTag(tag) {
    for (var i = 0; i < all.length; i++) {
      if (all[i].name.indexOf(tag) === 0) { props.onSel(all[i]); return; }
    }
  }

  return (
    <div style={ST.grid}>
      <Card title={"Watchlist"} sub={watched.length + " basins"}>
        {watched.length === 0 && <div style={ST.empty}>Star basins in the Data Library to follow them here.</div>}
        {watched.map(function (b) {
          var r = readinessScore(b.lat, b.lng);
          return (
            <div key={b.id} style={ST.row} onClick={function () { props.onSel(b); }}>
              <Star on={true} onClick={function () { wl.toggle(b.name); }} size={13} />
              <span style={{ flex: 1, color: "#e2e8f0", fontWeight: 600, fontSize: 12 }}>{b.name}</span>
              <StatusPill status={b.status} />
              <span title="Development Readiness" style={{ fontSize: 11, color: "#34d399", fontWeight: 600, minWidth: 28, textAlign: "right" }}>{r.score}</span>
              <SignalBadge basin={b} data={sig} />
            </div>
          );
        })}
      </Card>

      <Card title="Moving now" sub="from the live news feed">
        {!sig.ready && <div style={ST.empty}>News signals unavailable.</div>}
        {sig.ready && moving.surge.length === 0 && moving.quiet.length === 0 && <div style={ST.empty}>No surges or quiet basins right now.</div>}
        {moving.surge.map(function (m) {
          return (
            <div key={m.tag} style={ST.row} onClick={function () { openByTag(m.tag); }}>
              <span style={{ color: "#f59e0b", fontSize: 11 }}>{"▲"}</span>
              <span style={{ flex: 1, color: "#e2e8f0", fontSize: 12, fontWeight: 600 }}>{m.tag}</span>
              <span style={{ fontSize: 11, color: "#f59e0b" }}>{m.s.n7} this week {"·"} {m.s.n30} in 30d</span>
            </div>
          );
        })}
        {moving.quiet.map(function (m) {
          return (
            <div key={m.tag} style={ST.row} onClick={function () { openByTag(m.tag); }}>
              <span style={{ color: "#94a3b8", fontSize: 11 }}>{"○"}</span>
              <span style={{ flex: 1, color: "#cbd5e1", fontSize: 12 }}>{m.tag}</span>
              <span style={{ fontSize: 11, color: "#94a3b8" }}>quiet {m.s.daysSince}d</span>
            </div>
          );
        })}
      </Card>

      <Card title="Latest Field Notes" sub="live feed">
        {(!sig.items || sig.items.length === 0) && <div style={ST.empty}>Live feed unavailable.</div>}
        {(sig.items || []).slice(0, 6).map(function (n) {
          return (
            <div key={n.id} style={Object.assign({}, ST.row, { cursor: "default", alignItems: "flex-start", flexDirection: "column", gap: 2 })}>
              <a href={n.url} target="_blank" rel="noopener noreferrer" style={{ color: "#e2e8f0", fontSize: 12, textDecoration: "none", lineHeight: 1.4 }}>{n.title}</a>
              <span style={{ fontSize: 10, color: "#475569" }}>{fmtDate(n.date)} {"·"} {n.source}{n.country ? " · " + n.country : ""}{n.sourceCount > 1 ? " · " + n.sourceCount + " outlets" : ""}</span>
            </div>
          );
        })}
      </Card>

      <Card title="Oil P50 by country" sub="MMBO, current filters">
        <Bars rows={sumBy(data, "country", function (b) { return b.estimated_oil_mmbo.p50; })} color="#fbbf24" unit="MMBO" />
      </Card>

      <Card title="Gas P50 by country" sub="Tcf, current filters">
        <Bars rows={sumBy(data, "country", function (b) { return b.estimated_gas_tcf.p50; })} color="#60a5fa" unit="Tcf" />
      </Card>

      <Card title="Basins by status" sub="current filters">
        <Bars rows={statusCounts} color="#a78bfa" unit="" />
      </Card>
    </div>
  );
}

var COLS = [
  { key: "name", label: "Basin", get: function (b) { return b.name; } },
  { key: "country", label: "Country", get: function (b) { return b.country; } },
  { key: "type", label: "Type", get: function (b) { return b.type; } },
  { key: "status", label: "Status", get: function (b) { return STATUS_ORDER.indexOf(b.status); }, show: function (b) { return b.status; } },
  { key: "area", label: "Area km²", num: true, get: function (b) { return b.area_km2; } },
  { key: "depth", label: "Depth m", num: true, get: function (b) { return b.depth_m[1]; }, show: function (b) { return b.depth_m[0].toLocaleString() + "–" + b.depth_m[1].toLocaleString(); } },
  { key: "oil", label: "Oil P50 MMBO", num: true, get: function (b) { return b.estimated_oil_mmbo.p50; } },
  { key: "gas", label: "Gas P50 Tcf", num: true, get: function (b) { return b.estimated_gas_tcf.p50; } },
  { key: "wells", label: "Wells", num: true, get: function (b) { return b.wells_drilled; } },
  { key: "year", label: "Discovery", num: true, get: function (b) { return b.discovery_year || 0; }, show: function (b) { return b.discovery_year || "—"; } },
  { key: "ready", label: "Readiness", num: true, get: function (b) { return readinessScore(b.lat, b.lng).score; } }
];

function csvCell(v) {
  var s = String(v === null || v === undefined ? "" : v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

function downloadCsv(rows) {
  var header = ["Basin", "Country", "Type", "Status", "Area_km2", "Depth_min_m", "Depth_max_m", "Oil_P90_MMBO", "Oil_P50_MMBO", "Oil_P10_MMBO", "Gas_P90_Tcf", "Gas_P50_Tcf", "Gas_P10_Tcf", "Wells_drilled", "Discovery_year", "Readiness", "Lat", "Lng", "Source"];
  var lines = [header.join(",")];
  rows.forEach(function (b) {
    lines.push([b.name, b.country, b.type, b.status, b.area_km2, b.depth_m[0], b.depth_m[1],
      b.estimated_oil_mmbo.p90, b.estimated_oil_mmbo.p50, b.estimated_oil_mmbo.p10,
      b.estimated_gas_tcf.p90, b.estimated_gas_tcf.p50, b.estimated_gas_tcf.p10,
      b.wells_drilled, b.discovery_year, readinessScore(b.lat, b.lng).score, b.lat, b.lng, b.source].map(csvCell).join(","));
  });
  var blob = new Blob([lines.join("\n")], { type: "text/csv" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "geoindex-basins.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function Library(props) {
  var sortState = useState({ key: "oil", dir: -1 });
  var sort = sortState[0];
  var setSort = sortState[1];
  var sel = props.sel;
  var wl = props.wl;

  var rows = useMemo(function () {
    var col = COLS.filter(function (c) { return c.key === sort.key; })[0] || COLS[0];
    return props.data.slice().sort(function (a, b) {
      var x = col.get(a);
      var y = col.get(b);
      if (x < y) return -1 * sort.dir;
      if (x > y) return 1 * sort.dir;
      return 0;
    });
  }, [props.data, sort]);

  function clickHead(key) {
    setSort(function (s) { return s.key === key ? { key: key, dir: -s.dir } : { key: key, dir: key === "name" || key === "country" || key === "type" ? 1 : -1 }; });
  }

  return (
    <div style={ST.card}>
      <div style={ST.head}>
        <span style={ST.title}>Data Library</span>
        <span style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={ST.sub}>{rows.length} basins {"·"} click a header to sort</span>
          <button style={ST.btn} onClick={function () { downloadCsv(rows); }}>Export CSV</button>
        </span>
      </div>
      <div style={{ overflow: "auto", maxHeight: "calc(100vh - 200px)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {COLS.map(function (c) {
                var arrow = sort.key === c.key ? (sort.dir === 1 ? " ▲" : " ▼") : "";
                return <th key={c.key} style={ST.th} onClick={function () { clickHead(c.key); }}>{c.label}{arrow}</th>;
              })}
              <th style={Object.assign({}, ST.th, { cursor: "default" })}>News</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(function (b) {
              var is = sel && sel.id === b.id;
              return (
                <tr key={b.id} onClick={function () { props.onSel(b); }} style={{ background: is ? "#1a2540" : "transparent", cursor: "pointer", borderBottom: "1px solid #1e293b20" }}>
                  {COLS.map(function (c) {
                    if (c.key === "name") return <td key={c.key} style={ST.td}><Star on={wl.has(b.name)} onClick={function () { wl.toggle(b.name); }} size={13} /> <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{b.name}</span></td>;
                    if (c.key === "status") return <td key={c.key} style={ST.td}><StatusPill status={b.status} /></td>;
                    var v = c.show ? c.show(b) : c.get(b);
                    if (c.num && typeof v === "number") v = v.toLocaleString();
                    return <td key={c.key} style={Object.assign({}, ST.td, c.num ? { fontVariantNumeric: "tabular-nums" } : {})}>{v}</td>;
                  })}
                  <td style={ST.td}><SignalBadge basin={b} data={props.sig} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
