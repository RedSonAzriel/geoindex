import { useState, useMemo } from "react";
import { WELLS_KENYA, WELLS_KENYA_SOURCE } from "../data/wellsKenya";

var OUT_CLR = { Discovery: "#34d399", "Appraisal oil": "#fbbf24", "Appraisal dry": "#94a3b8", Shows: "#60a5fa", Dry: "#f87171", Unknown: "#475569" };
var OUTCOMES = ["All", "Discovery", "Appraisal oil", "Appraisal dry", "Shows", "Dry", "Unknown"];

var ST = {
  card: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 12, padding: "14px 16px" },
  title: { fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 },
  sub: { fontSize: 11, color: "#64748b", marginBottom: 12, lineHeight: 1.5 },
  sel: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 8, padding: "7px 12px", color: "#e2e8f0", fontSize: 12, outline: "none", fontFamily: "inherit" },
  th: { textAlign: "left", fontSize: 10, color: "#475569", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", padding: "8px 10px", borderBottom: "1px solid #1a2338", whiteSpace: "nowrap" },
  td: { padding: "8px 10px", borderBottom: "1px solid #111a2c", fontSize: 12, color: "#cbd5e1", whiteSpace: "nowrap" },
  kpi: { background: "#091019", border: "1px solid #1a2338", borderRadius: 10, padding: "10px 14px", flex: "1 1 130px" }
};

function pct(n, d) {
  return d ? Math.round((n / d) * 100) + "%" : "n/a";
}

export default function WellResults() {
  var bState = useState("All");
  var basin = bState[0];
  var setBasin = bState[1];
  var oState = useState("All");
  var outcome = oState[0];
  var setOutcome = oState[1];

  var basins = useMemo(function () {
    var seen = {};
    WELLS_KENYA.forEach(function (w) { seen[w.basin] = true; });
    return Object.keys(seen).sort();
  }, []);

  var stats = useMemo(function () {
    var by = {};
    WELLS_KENYA.forEach(function (w) {
      var s = by[w.basin] || (by[w.basin] = { basin: w.basin, wells: 0, expl: 0, disc: 0 });
      s.wells++;
      if (w.kind === "Exploration") {
        s.expl++;
        if (w.outcome === "Discovery") s.disc++;
      }
    });
    return Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.expl - a.expl; });
  }, []);

  var totals = stats.reduce(function (t, s) { return { wells: t.wells + s.wells, expl: t.expl + s.expl, disc: t.disc + s.disc }; }, { wells: 0, expl: 0, disc: 0 });

  var rows = WELLS_KENYA.filter(function (w) {
    return (basin === "All" || w.basin === basin) && (outcome === "All" || w.outcome === outcome);
  }).sort(function (a, b) { return b.year - a.year; });

  return (
    <div style={ST.card}>
      <div style={ST.title}>Kenya well record</div>
      <div style={ST.sub}>
        {WELLS_KENYA.length} wells, {WELLS_KENYA_SOURCE.coverage}, from the <a href={WELLS_KENYA_SOURCE.url} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>National Oil Corporation of Kenya well table</a>.
        Outcomes are normalised by hand from the source wording, so verify rows before relying on them. Success rate here means exploration wells that found oil or gas, as defined in this table, not commercial success.
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={ST.kpi}><div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase" }}>Wells</div><div style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>{totals.wells}</div></div>
        <div style={ST.kpi}><div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase" }}>Exploration wells</div><div style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>{totals.expl}</div></div>
        <div style={ST.kpi}><div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase" }}>Discoveries</div><div style={{ fontSize: 22, fontWeight: 700, color: "#34d399" }}>{totals.disc}</div></div>
        <div style={ST.kpi}><div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase" }}>Exploration success</div><div style={{ fontSize: 22, fontWeight: 700, color: "#fbbf24" }}>{pct(totals.disc, totals.expl)}</div></div>
      </div>

      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead><tr><th style={ST.th}>Basin</th><th style={ST.th}>Wells</th><th style={ST.th}>Exploration</th><th style={ST.th}>Discoveries</th><th style={ST.th}>Success</th></tr></thead>
          <tbody>
            {stats.map(function (s) {
              return (
                <tr key={s.basin}>
                  <td style={Object.assign({}, ST.td, { color: "#e2e8f0", fontWeight: 600 })}>{s.basin}</td>
                  <td style={ST.td}>{s.wells}</td>
                  <td style={ST.td}>{s.expl}</td>
                  <td style={ST.td}>{s.disc}</td>
                  <td style={ST.td}>{pct(s.disc, s.expl)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
        <select value={basin} onChange={function (e) { setBasin(e.target.value); }} style={ST.sel}>
          <option value="All" style={{ background: "#0f172a" }}>All basins</option>
          {basins.map(function (b) { return <option key={b} value={b} style={{ background: "#0f172a" }}>{b}</option>; })}
        </select>
        <select value={outcome} onChange={function (e) { setOutcome(e.target.value); }} style={ST.sel}>
          {OUTCOMES.map(function (o) { return <option key={o} value={o} style={{ background: "#0f172a" }}>{o === "All" ? "All outcomes" : o}</option>; })}
        </select>
        <span style={{ fontSize: 11, color: "#475569", alignSelf: "center" }}>{rows.length} wells</span>
      </div>
      <div style={{ overflow: "auto", maxHeight: 420 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Well", "Year", "Operator", "Block", "Basin", "Kind", "TD m", "Result (source)", "Outcome"].map(function (h) { return <th key={h} style={ST.th}>{h}</th>; })}</tr>
          </thead>
          <tbody>
            {rows.map(function (w) {
              var c = OUT_CLR[w.outcome] || "#94a3b8";
              return (
                <tr key={w.id}>
                  <td style={Object.assign({}, ST.td, { color: "#e2e8f0", fontWeight: 600 })}>{w.name}</td>
                  <td style={ST.td}>{w.year}</td>
                  <td style={ST.td}>{w.operator}</td>
                  <td style={ST.td}>{w.block}</td>
                  <td style={ST.td}>{w.basin}</td>
                  <td style={ST.td}>{w.kind}</td>
                  <td style={ST.td}>{w.td_m === null ? "—" : w.td_m.toLocaleString()}</td>
                  <td style={Object.assign({}, ST.td, { whiteSpace: "normal", minWidth: 200 })}>{w.result}</td>
                  <td style={ST.td}><span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6, color: c, background: c + "15", border: "1px solid " + c + "30" }}>{w.outcome}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
