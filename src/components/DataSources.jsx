import { useState, useEffect } from "react";

var STATUS_CLR = { Live: "#34d399", Reference: "#60a5fa", Approximate: "#fbbf24", Placeholder: "#f87171" };

var DATASETS = [
  {
    name: "Basin library",
    status: "Reference",
    records: "24 basins",
    where: "Basin Map, Data Library, Dashboard",
    origin: "Compiled from public sources named on each basin record (USGS 2012 assessments, national geological surveys and ministries, operator disclosures).",
    caveat: "Resource estimates are P90/P50/P10 ranges from public assessments, not proprietary evaluations. Basin positions are centroids."
  },
  {
    name: "Field Notes (live feed)",
    status: "Live",
    live: true,
    where: "Field Notes, basin News badges",
    origin: "Google News RSS queries for East Africa and Horn of Africa oil and gas, filtered and tagged by country, basin and category, then de-duplicated by headline similarity.",
    caveat: "Headlines and links only. Tags are keyword-based and can be wrong. Outlet counts reflect only what the feed returned."
  },
  {
    name: "Field Notes (reference)",
    status: "Reference",
    records: "10 entries",
    where: "Field Notes, Reference toggle",
    origin: "Hand-written summaries of major regional milestones, 2010 to 2024.",
    caveat: "Seeded entries. Verify dates and figures against primary sources before relying on them."
  },
  {
    name: "OFS wells",
    status: "Approximate",
    records: "19 discoveries",
    where: "OFS Metrics",
    origin: "Real regional discoveries compiled from public announcements.",
    caveat: "Operators and years are approximate and not yet checked well by well."
  },
  {
    name: "Kenya well record",
    status: "Reference",
    records: "86 wells, 1960 to 2017",
    where: "OFS Metrics (Kenya well record)",
    origin: "Transcribed from the National Oil Corporation of Kenya \"Wells Drilled\" table.",
    caveat: "Outcomes are normalised by hand from the source wording, and one duplicate row in the source is omitted. No coordinates, and wells after 2017 are not included. Verify rows against the original PDF."
  },
  {
    name: "Tanzania Block 2 discoveries",
    status: "Reference",
    records: "8 wells",
    where: "OFS Metrics (Tanzania Block 2)",
    origin: "Equinor news archive and Offshore magazine announcements, linked on each row.",
    caveat: "Gas in place as announced, not reserves. Some dates come from the page address, not the article text. Block 1/4 and other Tanzanian wells are not yet included."
  },
  {
    name: "Rovuma Basin gas discoveries",
    status: "Reference",
    records: "11 wells",
    where: "OFS Metrics (Rovuma Basin)",
    origin: "Operator press releases (Eni) and trade-press articles (OGJ, Offshore magazine, AAPG Explorer), linked on each row.",
    caveat: "Gas in place and gross recoverable volumes use different bases and must not be added. Some dates have no year in the source. Windjammer, Lagosta, Golfinho, Coral and others are not yet included."
  },
  {
    name: "Forecast model assumptions",
    status: "Placeholder",
    records: "3 play types, 4 status levels",
    where: "Forecasts",
    origin: "Illustrative screening inputs set by basin type (area fraction, net pay, porosity, water saturation, recovery) and chance of success by exploration status.",
    caveat: "Not measured data. Outputs are screening ranges, not reserves. Inputs should be replaced with analog and well data as it is collected."
  },
  {
    name: "OFS spending",
    status: "Placeholder",
    records: "18 records",
    where: "OFS Metrics",
    origin: "Illustrative figures to demonstrate the charts.",
    caveat: "Not real data. Do not use for any decision."
  },
  {
    name: "Infrastructure layers",
    status: "Approximate",
    records: "18 ports, 15 airports, 8 pipelines, 10 power sites, 8 roads",
    where: "Map overlay, Development Readiness score",
    origin: "Hand-placed points and schematic lines from public knowledge.",
    caveat: "Positions are approximate and lines are schematic. Planned assets currently count the same as operating ones. Readiness is measured from the basin centroid, so it is coarse."
  }
];

var ST = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  banner: { background: "#0c1322", border: "1px solid #1a2338", borderLeft: "3px solid #34d399", borderRadius: 8, padding: "9px 12px", fontSize: 11, color: "#94a3b8" },
  card: { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 12, padding: "14px 16px" },
  head: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 },
  name: { fontSize: 14, fontWeight: 600, color: "#e2e8f0" },
  label: { fontSize: 10, color: "#475569", fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginTop: 8 },
  text: { fontSize: 12, color: "#94a3b8", marginTop: 2, lineHeight: 1.5 }
};

function Pill(props) {
  var c = STATUS_CLR[props.status];
  return <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10, color: c, background: c + "15", border: "1px solid " + c + "30" }}>{props.status}</span>;
}

function ago(iso) {
  if (!iso) return "never";
  var m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 60) return m + " min ago";
  if (m < 2880) return Math.round(m / 60) + " hours ago";
  return Math.round(m / 1440) + " days ago";
}

export default function DataSources() {
  var st = useState(null);
  var health = st[0];
  var setHealth = st[1];
  useEffect(function () {
    fetch("/api/health").then(function (r) { return r.json(); }).then(setHealth).catch(function () {});
  }, []);

  return (
    <div style={ST.wrap}>
      <div style={ST.banner}>
        Every dataset in GeoIndex, where it comes from, and how far to trust it. Labels: Live (refreshed automatically), Reference (compiled from public sources), Approximate (positions or details not verified), Placeholder (illustrative only).
      </div>
      {DATASETS.map(function (d) {
        var records = d.records;
        var updated = "Static, updated with each release";
        if (d.live) {
          var f = health && health.fieldIntel;
          records = f ? f.recordCount + " stories" : "loading";
          updated = f ? "Refreshed " + ago(f.fetchedAt) + " · feed status " + health.status : "Status unavailable";
        }
        return (
          <div key={d.name} style={ST.card}>
            <div style={ST.head}>
              <span style={ST.name}>{d.name}</span>
              <Pill status={d.status} />
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{records} {"·"} {updated}</div>
            <div style={ST.label}>Origin</div>
            <div style={ST.text}>{d.origin}</div>
            <div style={ST.label}>Limits</div>
            <div style={ST.text}>{d.caveat}</div>
            <div style={ST.label}>Used in</div>
            <div style={ST.text}>{d.where}</div>
          </div>
        );
      })}
    </div>
  );
}
