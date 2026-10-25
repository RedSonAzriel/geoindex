import { useState } from "react";
import { WELLS_ROVUMA } from "../data/wellsRovuma";

var ST = {
  card: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 12, padding: "14px 16px" },
  sel: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 8, padding: "7px 12px", color: "#e2e8f0", fontSize: 12, outline: "none", fontFamily: "inherit" },
  th: { textAlign: "left", fontSize: 10, color: "#475569", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", padding: "8px 10px", borderBottom: "1px solid #1a2338", whiteSpace: "nowrap" },
  td: { padding: "8px 10px", borderBottom: "1px solid #111a2c", fontSize: 12, color: "#cbd5e1", verticalAlign: "top" }
};

export default function RovumaDiscoveries() {
  var cState = useState("All");
  var country = cState[0];
  var setCountry = cState[1];
  var rows = WELLS_ROVUMA.filter(function (w) { return country === "All" || w.country === country; });
  return (
    <div style={ST.card}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>Rovuma Basin gas discoveries</div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12, lineHeight: 1.5 }}>
        Mozambique Areas 1 and 4 and Tanzania Blocks 1 and 4, from operator releases and trade press, linked on each row. Volumes are as announced and use different bases
        (gas in place versus gross recoverable), so do not add them together. Blank means the source did not state it. Several wells (Windjammer, Lagosta, Golfinho, Coral and others) are not yet included.
      </div>
      <select value={country} onChange={function (e) { setCountry(e.target.value); }} style={Object.assign({}, ST.sel, { marginBottom: 10 })}>
        <option value="All" style={{ background: "#0f172a" }}>Both countries</option>
        <option value="Mozambique" style={{ background: "#0f172a" }}>Mozambique</option>
        <option value="Tanzania" style={{ background: "#0f172a" }}>Tanzania</option>
      </select>
      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Well", "Country", "Block", "Operator", "Announced", "Water depth m", "Pay", "Volume", "Basis", "Note", "Source"].map(function (h) { return <th key={h} style={ST.th}>{h}</th>; })}</tr>
          </thead>
          <tbody>
            {rows.map(function (w) {
              return (
                <tr key={w.name + w.date}>
                  <td style={Object.assign({}, ST.td, { color: "#e2e8f0", fontWeight: 600, whiteSpace: "nowrap" })}>{w.name}</td>
                  <td style={ST.td}>{w.country}</td>
                  <td style={Object.assign({}, ST.td, { whiteSpace: "nowrap" })}>{w.block}</td>
                  <td style={ST.td}>{w.operator}</td>
                  <td style={ST.td}>{w.date || "—"}</td>
                  <td style={ST.td}>{w.wd_m ? w.wd_m.toLocaleString() : "—"}</td>
                  <td style={Object.assign({}, ST.td, { minWidth: 160 })}>{w.pay || "—"}</td>
                  <td style={Object.assign({}, ST.td, { minWidth: 160 })}>{w.size || "—"}</td>
                  <td style={ST.td}>{w.basis || "—"}</td>
                  <td style={Object.assign({}, ST.td, { minWidth: 180 })}>{w.note}</td>
                  <td style={ST.td}><a href={w.source} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>link</a></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
