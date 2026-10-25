import { WELLS_TZ_BLOCK2 } from "../data/wellsTanzania";

var ST = {
  card: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 12, padding: "14px 16px" },
  th: { textAlign: "left", fontSize: 10, color: "#475569", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", padding: "8px 10px", borderBottom: "1px solid #1a2338", whiteSpace: "nowrap" },
  td: { padding: "8px 10px", borderBottom: "1px solid #111a2c", fontSize: 12, color: "#cbd5e1", whiteSpace: "nowrap" }
};

export default function TanzaniaBlock2() {
  return (
    <div style={ST.card}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", marginBottom: 4 }}>Tanzania Block 2 discoveries</div>
      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12, lineHeight: 1.5 }}>
        Offshore gas wells operated by Statoil (now Equinor) for TPDC, from Equinor and trade-press announcements. Volumes are gas in place as announced, not reserves. Blank means the source did not state it.
        Block 1/4 and other Tanzanian wells are not yet included. Dates are announcement dates.
      </div>
      <div style={{ overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>{["Well", "Announced", "Result", "Water depth m", "In place Tcf", "Block 2 total Tcf", "Note", "Source"].map(function (h) { return <th key={h} style={ST.th}>{h}</th>; })}</tr>
          </thead>
          <tbody>
            {WELLS_TZ_BLOCK2.map(function (w) {
              return (
                <tr key={w.name}>
                  <td style={Object.assign({}, ST.td, { color: "#e2e8f0", fontWeight: 600 })}>{w.name}</td>
                  <td style={ST.td}>{w.date || "—"}</td>
                  <td style={Object.assign({}, ST.td, { color: "#34d399" })}>{w.outcome}</td>
                  <td style={ST.td}>{w.wd_m ? w.wd_m.toLocaleString() : "—"}</td>
                  <td style={ST.td}>{w.inplace_tcf || "—"}</td>
                  <td style={ST.td}>{w.block_total || "—"}</td>
                  <td style={Object.assign({}, ST.td, { whiteSpace: "normal", minWidth: 180 })}>{w.note}</td>
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
