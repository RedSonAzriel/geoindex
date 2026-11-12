import { useState, useMemo } from "react";
import { SERVICE_CATEGORIES, OFS_WELLS, OFS_SPENDING } from "../data/ofsMetrics";

var YEARS = [2024, 2025, 2026];
var ALL_COUNTRIES = ["All", "Mozambique", "Kenya", "Tanzania", "Ethiopia", "Somalia", "Eritrea"];
var RESULT_CLR = {
  "Oil Discovery": "#fbbf24",
  "Gas Discovery": "#34d399",
  "Oil & Gas": "#60a5fa",
  "Dry": "#ef4444",
  "Suspended": "#94a3b8",
  "Drilling": "#38bdf8",
};

function fmtUSD(v) {
  if (v >= 1000) return "$" + (v / 1000).toFixed(1) + "M";
  return "$" + v + "K";
}

// Mini donut chart
function Donut(props) {
  var data = props.data;
  var size = props.size || 120;
  var r = size / 2 - 8;
  var cx = size / 2;
  var cy = size / 2;
  var total = data.reduce(function(a, d) { return a + d.value; }, 0);
  if (total === 0) return null;

  var paths = [];
  var angle = -Math.PI / 2;
  data.forEach(function(d, i) {
    if (d.value === 0) return;
    var sweep = (d.value / total) * 2 * Math.PI;
    var x1 = cx + r * Math.cos(angle);
    var y1 = cy + r * Math.sin(angle);
    var x2 = cx + r * Math.cos(angle + sweep);
    var y2 = cy + r * Math.sin(angle + sweep);
    var large = sweep > Math.PI ? 1 : 0;
    var inner = r * 0.55;
    var ix1 = cx + inner * Math.cos(angle + sweep);
    var iy1 = cy + inner * Math.sin(angle + sweep);
    var ix2 = cx + inner * Math.cos(angle);
    var iy2 = cy + inner * Math.sin(angle);
    var path = "M" + x1 + "," + y1 +
      " A" + r + "," + r + " 0 " + large + " 1 " + x2 + "," + y2 +
      " L" + ix1 + "," + iy1 +
      " A" + inner + "," + inner + " 0 " + large + " 0 " + ix2 + "," + iy2 +
      " Z";
    paths.push({ d: path, color: d.color, key: i });
    angle += sweep;
  });

  return (
    <svg width={size} height={size}>
      {paths.map(function(p) {
        return <path key={p.key} d={p.d} fill={p.color} opacity="0.85" />;
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#e2e8f0" fontSize="14" fontWeight="700">{fmtUSD(total)}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fill="#475569" fontSize="9">total</text>
    </svg>
  );
}

// Horizontal stacked bar
function StackBar(props) {
  var data = props.data;
  var total = data.reduce(function(a, d) { return a + d.value; }, 0);
  if (total === 0) return <div style={{ height: 18, background: "#1a2338", borderRadius: 4 }} />;
  return (
    <div style={{ display: "flex", height: 18, borderRadius: 4, overflow: "hidden" }}>
      {data.map(function(d, i) {
        if (d.value === 0) return null;
        var pct = (d.value / total) * 100;
        return (
          <div
            key={i}
            title={d.label + ": " + fmtUSD(d.value) + " (" + pct.toFixed(1) + "%)"}
            style={{ width: pct + "%", background: d.color, opacity: 0.75, minWidth: pct > 2 ? 2 : 0 }}
          />
        );
      })}
    </div>
  );
}

export default function OFSMetrics() {
  var _ctry = useState("All");
  var ctry = _ctry[0];
  var setCtry = _ctry[1];

  var _year = useState(2026);
  var year = _year[0];
  var setYear = _year[1];

  var _tab = useState("spending");
  var tab = _tab[0];
  var setTab = _tab[1];

  // Filter wells
  var wells = useMemo(function() {
    var r = OFS_WELLS;
    if (ctry !== "All") r = r.filter(function(w) { return w.country === ctry; });
    if (year) r = r.filter(function(w) { return w.year === year; });
    return r;
  }, [ctry, year]);

  // Filter spending
  var spending = useMemo(function() {
    var r = OFS_SPENDING;
    if (ctry !== "All") r = r.filter(function(s) { return s.country === ctry; });
    if (year) r = r.filter(function(s) { return s.year === year; });
    return r;
  }, [ctry, year]);

  // Aggregate spending by service category
  var catTotals = useMemo(function() {
    return SERVICE_CATEGORIES.map(function(cat) {
      var total = spending.reduce(function(a, s) { return a + (s[cat.key] || 0); }, 0);
      return { key: cat.key, label: cat.label, color: cat.color, value: total };
    });
  }, [spending]);

  // Aggregate spending by parent company
  var parentTotals = useMemo(function() {
    var map = {};
    spending.forEach(function(s) {
      if (!map[s.parent]) map[s.parent] = { parent: s.parent, total: 0, cats: {} };
      SERVICE_CATEGORIES.forEach(function(cat) {
        var v = s[cat.key] || 0;
        map[s.parent].total += v;
        map[s.parent].cats[cat.key] = (map[s.parent].cats[cat.key] || 0) + v;
      });
    });
    return Object.values(map).sort(function(a, b) { return b.total - a.total; });
  }, [spending]);

  // Wells KPIs
  var wellCount = wells.length;
  var discoveries = wells.filter(function(w) {
    return w.result === "Oil Discovery" || w.result === "Gas Discovery" || w.result === "Oil & Gas";
  }).length;
  var totalSpend = catTotals.reduce(function(a, c) { return a + c.value; }, 0);

  return (
    <div>
      {/* Header */}
      <div style={S.head}>
        <div>
          <h2 style={S.title}>OFS Metrics</h2>
          <p style={S.sub}>Oilfield services spending & drilling activity tracker</p>
        </div>
        <div style={S.filters}>
          <select value={ctry} onChange={function(e) { setCtry(e.target.value); }} style={S.sel}>
            {ALL_COUNTRIES.map(function(c) {
              return <option key={c} value={c} style={{ background: "#0f172a" }}>{c === "All" ? "All Countries" : c}</option>;
            })}
          </select>
          <div style={S.yearTabs}>
            {YEARS.map(function(y) {
              return (
                <button
                  key={y}
                  onClick={function() { setYear(y); }}
                  style={Object.assign({}, S.yearBtn, year === y ? S.yearBtnActive : {})}
                >
                  {y}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={S.kpiRow}>
        {[
          { label: "Wells Drilled", val: wellCount, unit: "", color: "#34d399" },
          { label: "Discoveries", val: discoveries, unit: "", color: "#fbbf24" },
          { label: "Total OFS Spend", val: fmtUSD(totalSpend), unit: "", color: "#60a5fa" },
          { label: "Avg/Well", val: wellCount > 0 ? fmtUSD(Math.round(totalSpend / wellCount)) : "--", unit: "", color: "#a78bfa" },
        ].map(function(k, i) {
          return (
            <div key={i} style={S.kpiCard}>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.val}</div>
            </div>
          );
        })}
      </div>

      {/* Tab toggle */}
      <div style={S.tabRow}>
        {[
          { key: "spending", label: "Spending by Category" },
          { key: "wells", label: "Wells Drilled" },
          { key: "parent", label: "By Parent Company" },
        ].map(function(t) {
          return (
            <button
              key={t.key}
              onClick={function() { setTab(t.key); }}
              style={Object.assign({}, S.viewTab, tab === t.key ? S.viewTabActive : {})}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* SPENDING BY CATEGORY */}
      {tab === "spending" && (
        <div style={S.panel}>
          <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 24, alignItems: "start" }}>
            {/* Donut */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <Donut data={catTotals} size={140} />
              <div style={{ fontSize: 10, color: "#475569" }}>Service Mix</div>
            </div>
            {/* Category bars */}
            <div>
              {catTotals.map(function(c) {
                var pct = totalSpend > 0 ? ((c.value / totalSpend) * 100).toFixed(1) : "0";
                return (
                  <div key={c.key} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                      <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{c.label}</span>
                      <span style={{ fontSize: 12, color: c.color, fontWeight: 600 }}>{fmtUSD(c.value)} <span style={{ color: "#475569", fontWeight: 400 }}>({pct}%)</span></span>
                    </div>
                    <div style={{ height: 6, background: "#1a2338", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: pct + "%", background: c.color, borderRadius: 3, opacity: 0.7 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* WELLS DRILLED TABLE */}
      {tab === "wells" && (
        <div style={S.panel}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["Well Name", "Country", "Basin", "Operator", "Type", "TD (ft)", "Result"].map(function(h) {
                    return <th key={h} style={S.th}>{h}</th>;
                  })}
                </tr>
              </thead>
              <tbody>
                {wells.map(function(w, i) {
                  var rc = RESULT_CLR[w.result] || "#94a3b8";
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #1a233830" }}>
                      <td style={S.td}><span style={{ fontWeight: 600, color: "#e2e8f0" }}>{w.well_name}</span></td>
                      <td style={S.td}>{w.country}</td>
                      <td style={S.td}>{w.basin_id}</td>
                      <td style={S.td}>{w.operator}</td>
                      <td style={S.td}><span style={Object.assign({}, S.pill, { color: "#94a3b8", background: "#1a2338", borderColor: "#2e3a4d" })}>{w.well_type}</span></td>
                      <td style={Object.assign({}, S.td, { fontVariantNumeric: "tabular-nums" })}>{w.td_ft ? w.td_ft.toLocaleString() : "--"}</td>
                      <td style={S.td}><span style={Object.assign({}, S.pill, { color: rc, background: rc + "12", borderColor: rc + "25" })}>{w.result}</span></td>
                    </tr>
                  );
                })}
                {wells.length === 0 && (
                  <tr><td colSpan="7" style={Object.assign({}, S.td, { textAlign: "center", color: "#334155", padding: 30 })}>No wells match filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BY PARENT COMPANY */}
      {tab === "parent" && (
        <div style={S.panel}>
          {parentTotals.map(function(p) {
            var barData = SERVICE_CATEGORIES.map(function(cat) {
              return { label: cat.label, color: cat.color, value: p.cats[cat.key] || 0 };
            });
            return (
              <div key={p.parent} style={S.parentRow}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{p.parent}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#60a5fa" }}>{fmtUSD(p.total)}</span>
                </div>
                <StackBar data={barData} />
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                  {barData.filter(function(d) { return d.value > 0; }).map(function(d) {
                    return (
                      <span key={d.label} style={{ fontSize: 10, color: d.color }}>
                        {d.label}: {fmtUSD(d.value)}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {parentTotals.length === 0 && (
            <div style={{ textAlign: "center", color: "#334155", padding: 30 }}>No spending data for this selection</div>
          )}
          {/* Legend */}
          <div style={S.legendRow}>
            {SERVICE_CATEGORIES.map(function(c) {
              return (
                <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color, opacity: 0.75 }} />
                  <span style={{ fontSize: 10, color: "#64748b" }}>{c.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

var S = {
  head: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-.01em" },
  sub: { margin: 0, marginTop: 4, fontSize: 12, color: "#475569" },
  filters: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  sel: { background: "#111b2e", border: "1px solid #1e2d45", color: "#94a3b8", padding: "7px 12px", borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer", outline: "none" },
  yearTabs: { display: "flex", gap: 0, border: "1px solid #1e2d45", borderRadius: 8, overflow: "hidden" },
  yearBtn: { padding: "7px 14px", border: "none", background: "transparent", color: "#64748b", fontSize: 12, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", borderRight: "1px solid #1e2d45" },
  yearBtnActive: { background: "#1e2d45", color: "#60a5fa" },

  kpiRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 },
  kpiCard: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 10, padding: "14px 18px" },

  tabRow: { display: "flex", gap: 0, marginBottom: 16, border: "1px solid #1a2338", borderRadius: 8, overflow: "hidden", width: "fit-content" },
  viewTab: { padding: "8px 18px", border: "none", background: "transparent", color: "#64748b", fontSize: 12, fontWeight: 500, fontFamily: "inherit", cursor: "pointer", borderRight: "1px solid #1a2338" },
  viewTabActive: { background: "#111b2e", color: "#e2e8f0" },

  panel: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 12, padding: 22 },

  th: { textAlign: "left", padding: "10px 12px", fontSize: 10, fontWeight: 600, color: "#3d4f6a", textTransform: "uppercase", letterSpacing: ".06em", borderBottom: "1px solid #1a2338", background: "#091019", position: "sticky", top: 0 },
  td: { padding: "10px 12px", color: "#94a3b8", whiteSpace: "nowrap" },
  pill: { fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 5, border: "1px solid", display: "inline-block" },

  parentRow: { padding: "14px 0", borderBottom: "1px solid #1a233840" },
  legendRow: { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: "1px solid #1a2338" },
};
