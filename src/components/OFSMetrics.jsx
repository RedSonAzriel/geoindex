import { useState, useMemo } from "react";
import { OFS_WELLS, OFS_SPENDING, OFS_CATEGORIES } from "../data/ofsMetrics";
import WellResults from "./WellResults";
import TanzaniaBlock2 from "./TanzaniaBlock2";

var CAT_CLR = { Drilling: "#34d399", Seismic: "#60a5fa", Development: "#fbbf24", Facilities: "#a78bfa" };

function uniqSorted(list) {
  var seen = {};
  var out = [];
  for (var i = 0; i < list.length; i++) {
    if (!seen[list[i]]) { seen[list[i]] = true; out.push(list[i]); }
  }
  return out.sort();
}

function fmtMoney(n) {
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "B";
  return "$" + Math.round(n) + "M";
}

var ST = {
  wrap: { display: "flex", flexDirection: "column", gap: 16 },
  banner: { background: "#0c1322", border: "1px solid #1a2338", borderLeft: "3px solid #fbbf24", borderRadius: 8, padding: "9px 12px", fontSize: 11, color: "#94a3b8" },
  filters: { display: "flex", gap: 10, flexWrap: "wrap" },
  sel: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 8, padding: "7px 12px", color: "#e2e8f0", fontSize: 12, outline: "none", fontFamily: "inherit" },
  kpis: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 12 },
  kpi: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 12, padding: "14px 16px" },
  kpiLabel: { fontSize: 11, color: "#475569", fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase" },
  kpiVal: { fontSize: 24, fontWeight: 700, color: "#e2e8f0", marginTop: 4 },
  row2: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 16 },
  card: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 12, padding: "14px 16px" },
  cardTitle: { fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 12 },
  empty: { padding: 20, textAlign: "center", color: "#475569", fontSize: 12 },
  th: { textAlign: "left", fontSize: 10, color: "#475569", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", padding: "8px 10px", borderBottom: "1px solid #1a2338", whiteSpace: "nowrap" },
  td: { padding: "9px 10px", borderBottom: "1px solid #111a2c", fontSize: 12, color: "#cbd5e1", whiteSpace: "nowrap" },
  legendRow: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94a3b8", marginBottom: 6 },
  dot: { width: 9, height: 9, borderRadius: 3, display: "inline-block" }
};

function Donut(props) {
  var parts = props.parts;
  var total = 0;
  var i;
  for (i = 0; i < parts.length; i++) total += parts[i].value;
  var R = 50;
  var C = 2 * Math.PI * R;
  var offset = 0;
  var arcs = [];
  for (i = 0; i < parts.length; i++) {
    var len = total > 0 ? (parts[i].value / total) * C : 0;
    arcs.push(
      <circle
        key={parts[i].label}
        cx="70" cy="70" r={R}
        fill="none"
        stroke={parts[i].color}
        strokeWidth="18"
        strokeDasharray={len + " " + (C - len)}
        strokeDashoffset={-offset}
      />
    );
    offset += len;
  }
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <g transform="rotate(-90 70 70)">
          <circle cx="70" cy="70" r={R} fill="none" stroke="#1a2338" strokeWidth="18" />
          {arcs}
        </g>
        <text x="70" y="66" textAnchor="middle" fill="#e2e8f0" fontSize="16" fontWeight="700">{fmtMoney(total)}</text>
        <text x="70" y="82" textAnchor="middle" fill="#475569" fontSize="9">total spend</text>
      </svg>
      <div>
        {parts.map(function (p) {
          return (
            <div key={p.label} style={ST.legendRow}>
              <span style={{ width: 9, height: 9, borderRadius: 3, display: "inline-block", background: p.color }}></span>
              <span>{p.label}</span>
              <span style={{ color: "#e2e8f0", fontWeight: 600, marginLeft: 6 }}>{fmtMoney(p.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OFSMetrics() {
  var cS = useState("All");
  var country = cS[0];
  var setCountry = cS[1];
  var yS = useState("All");
  var year = yS[0];
  var setYear = yS[1];

  var countries = useMemo(function () {
    return uniqSorted(OFS_WELLS.map(function (w) { return w.country; }).concat(OFS_SPENDING.map(function (s) { return s.country; })));
  }, []);
  var years = useMemo(function () {
    return uniqSorted(OFS_WELLS.map(function (w) { return w.year; }).concat(OFS_SPENDING.map(function (s) { return s.year; })));
  }, []);

  var wells = useMemo(function () {
    return OFS_WELLS.filter(function (w) {
      return (country === "All" || w.country === country) && (year === "All" || String(w.year) === year);
    }).sort(function (a, b) { return b.year - a.year; });
  }, [country, year]);

  var spend = useMemo(function () {
    return OFS_SPENDING.filter(function (s) {
      return (country === "All" || s.country === country) && (year === "All" || String(s.year) === year);
    });
  }, [country, year]);

  var totals = useMemo(function () {
    var byCat = {};
    var byParent = {};
    var total = 0;
    var i;
    for (i = 0; i < spend.length; i++) {
      var s = spend[i];
      total += s.usd_m;
      byCat[s.category] = (byCat[s.category] || 0) + s.usd_m;
      if (!byParent[s.parent]) byParent[s.parent] = { total: 0, cats: {} };
      byParent[s.parent].total += s.usd_m;
      byParent[s.parent].cats[s.category] = (byParent[s.parent].cats[s.category] || 0) + s.usd_m;
    }
    var parents = Object.keys(byParent).sort(function (a, b) { return byParent[b].total - byParent[a].total; });
    return { total: total, byCat: byCat, byParent: byParent, parents: parents };
  }, [spend]);

  var operators = uniqSorted(wells.map(function (w) { return w.operator; })).length;
  var maxParent = totals.parents.length ? totals.byParent[totals.parents[0]].total : 0;

  var parts = [];
  for (var i = 0; i < OFS_CATEGORIES.length; i++) {
    var c = OFS_CATEGORIES[i];
    if (totals.byCat[c]) parts.push({ label: c, value: totals.byCat[c], color: CAT_CLR[c] });
  }

  return (
    <div style={ST.wrap}>
      <div style={ST.banner}>
        Well names, operators and years come from widely reported discoveries (verify before relying on them).
        Spending figures are placeholders for layout and testing and are not actual spend records.
      </div>

      <div style={ST.filters}>
        <select value={country} onChange={function (e) { setCountry(e.target.value); }} style={ST.sel}>
          <option value="All">All Countries</option>
          {countries.map(function (c) { return <option key={c} value={c}>{c}</option>; })}
        </select>
        <select value={year} onChange={function (e) { setYear(e.target.value); }} style={ST.sel}>
          <option value="All">All Years</option>
          {years.map(function (y) { return <option key={y} value={String(y)}>{y}</option>; })}
        </select>
      </div>

      <div style={ST.kpis}>
        <div style={ST.kpi}><div style={ST.kpiLabel}>Wells</div><div style={ST.kpiVal}>{wells.length}</div></div>
        <div style={ST.kpi}><div style={ST.kpiLabel}>Operators</div><div style={ST.kpiVal}>{operators}</div></div>
        <div style={ST.kpi}><div style={ST.kpiLabel}>Total spend</div><div style={ST.kpiVal}>{fmtMoney(totals.total)}</div></div>
        <div style={ST.kpi}><div style={ST.kpiLabel}>Spend records</div><div style={ST.kpiVal}>{spend.length}</div></div>
      </div>

      <div style={ST.row2}>
        <div style={ST.card}>
          <div style={ST.cardTitle}>Spend by category</div>
          {parts.length === 0 ? <div style={ST.empty}>No spend records for this filter.</div> : <Donut parts={parts} />}
        </div>
        <div style={ST.card}>
          <div style={ST.cardTitle}>Spend by parent company</div>
          {totals.parents.length === 0 && <div style={ST.empty}>No spend records for this filter.</div>}
          {totals.parents.map(function (p) {
            var rec = totals.byParent[p];
            return (
              <div key={p} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#cbd5e1" }}>{p}</span>
                  <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{fmtMoney(rec.total)}</span>
                </div>
                <div style={{ display: "flex", height: 10, background: "#1a2338", borderRadius: 5, overflow: "hidden", width: (maxParent ? (rec.total / maxParent) * 100 : 0) + "%" }}>
                  {OFS_CATEGORIES.map(function (c) {
                    var v = rec.cats[c] || 0;
                    if (!v) return null;
                    return <div key={c} title={c + ": " + fmtMoney(v)} style={{ width: (v / rec.total) * 100 + "%", background: CAT_CLR[c] }}></div>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={ST.card}>
        <div style={ST.cardTitle}>Wells</div>
        {wells.length === 0 ? (
          <div style={ST.empty}>No wells for this filter.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={ST.th}>Well</th>
                  <th style={ST.th}>Country</th>
                  <th style={ST.th}>Basin</th>
                  <th style={ST.th}>Operator</th>
                  <th style={ST.th}>Year</th>
                  <th style={ST.th}>Type</th>
                  <th style={ST.th}>Result</th>
                </tr>
              </thead>
              <tbody>
                {wells.map(function (w) {
                  return (
                    <tr key={w.id}>
                      <td style={Object.assign({}, ST.td, { color: "#e2e8f0", fontWeight: 600 })}>{w.name}</td>
                      <td style={ST.td}>{w.country}</td>
                      <td style={ST.td}>{w.basin}</td>
                      <td style={ST.td}>{w.operator}</td>
                      <td style={ST.td}>{w.year}</td>
                      <td style={ST.td}>{w.type}</td>
                      <td style={Object.assign({}, ST.td, { color: w.result.indexOf("Oil") >= 0 ? "#fbbf24" : "#34d399" })}>{w.result}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <WellResults />
      <TanzaniaBlock2 />
    </div>
  );
}
