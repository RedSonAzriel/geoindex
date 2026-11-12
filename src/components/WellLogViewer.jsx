// ══════════════════════════════════════════════════════════════════
// GeoIndex — Well Log Viewer
// Shows digitized logs from published well figures when a basin has
// them; otherwise an illustrative synthetic log, clearly labelled.
// ══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";
import { DIGITIZED_WELLS, CURVE_SPECS } from "../data/realWellLogs";

// ── Seeded random (synthetic mode)
function seededRandom(seed) {
  var x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hashString(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// 0..1 synthetic curve with zoned character
function generateLogCurve(numSamples, seed, opts) {
  var baseline = opts.baseline, amplitude = opts.amplitude;
  var noiseLevel = opts.noiseLevel || 0.05, trend = opts.trend || 0;
  var spikiness = opts.spikiness || 0, numZones = opts.numZones || 4;
  var zones = [];
  for (var z = 0; z < numZones; z++) {
    zones.push(baseline + (seededRandom(seed + z * 137) - 0.5) * amplitude * 2);
  }
  var curve = [];
  for (var i = 0; i < numSamples; i++) {
    var t = i / numSamples;
    var zi = Math.min(Math.floor(t * numZones), numZones - 1);
    var zt = t * numZones - zi;
    var val = zones[zi];
    if (zt > 0.85 && zi < numZones - 1) {
      var bl = (zt - 0.85) / 0.15; bl = bl * bl * (3 - 2 * bl);
      val = zones[zi] + (zones[zi + 1] - zones[zi]) * bl;
    }
    val += trend * t;
    val += Math.sin(t * 15 + seededRandom(seed + 1000) * 10) * amplitude * 0.2;
    val += Math.sin(t * 37 + seededRandom(seed + 2000) * 10) * amplitude * 0.1;
    val += (seededRandom(seed + i * 7 + 5000) - 0.5) * noiseLevel;
    if (spikiness > 0) {
      var dmin = 999;
      for (var b = 1; b < numZones; b++) dmin = Math.min(dmin, Math.abs(t - b / numZones));
      if (dmin < 0.02) val += spikiness * (1 - dmin / 0.02) * (seededRandom(seed + i * 3) > 0.5 ? 1 : -1);
    }
    curve.push(Math.max(0, Math.min(1, val)));
  }
  return curve;
}

var TRACK_STYLE = {
  GR:   { label: "GR",   fullName: "Gamma Ray",        color: "#34d399" },
  DT:   { label: "DT",   fullName: "Sonic",            color: "#60a5fa" },
  VSH:  { label: "Vsh",  fullName: "Shale Volume",     color: "#fbbf24" },
  PHIT: { label: "PHIT", fullName: "Total Porosity",   color: "#a78bfa" },
  SW:   { label: "Sw",   fullName: "Water Saturation", color: "#f97316" },
};
var TRACK_ORDER = ["GR", "DT", "VSH", "PHIT", "SW"];

var SYNTH_OPTS = {
  GR:   { baseline: 0.4,  amplitude: 0.25, noiseLevel: 0.04, spikiness: 0.15, numZones: 6 },
  DT:   { baseline: 0.45, amplitude: 0.2,  noiseLevel: 0.03, trend: -0.1, numZones: 5 },
  VSH:  { baseline: 0.4,  amplitude: 0.3,  noiseLevel: 0.04, spikiness: 0.1, numZones: 6 },
  PHIT: { baseline: 0.45, amplitude: 0.2,  noiseLevel: 0.03, trend: -0.15, numZones: 5 },
  SW:   { baseline: 0.4,  amplitude: 0.3,  noiseLevel: 0.03, numZones: 4 },
};

// Build a synthetic dataset in the same shape as a digitized well
function buildSynthetic(basin) {
  var n = 300, seed = hashString(basin.id + "_welllog");
  var top = basin.depth_m[0], bot = basin.depth_m[1];
  var depth = [];
  for (var i = 0; i < n; i++) depth.push(top + (i / (n - 1)) * (bot - top));
  var curves = {};
  TRACK_ORDER.forEach(function (c, k) {
    var spec = CURVE_SPECS[c];
    var raw = generateLogCurve(n, seed + (k + 1) * 100, SYNTH_OPTS[c]);
    curves[c] = raw.map(function (f) { return spec[1] + f * (spec[2] - spec[1]); });
  });
  return { well: "Synthetic", depth: depth, curves: curves, synthetic: true };
}

function drawLog(canvas, data, basin) {
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var rect = canvas.getBoundingClientRect();
  var w = rect.width, h = rect.height;
  if (w < 10 || h < 10) return;
  canvas.width = w * dpr; canvas.height = h * dpr;
  var ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);

  var headerH = 48, depthW = 48;
  var tracks = TRACK_ORDER.filter(function (c) { return data.curves[c]; });
  var trackW = (w - depthW) / tracks.length;
  var plotTop = headerH, plotH = h - headerH - 4;
  var dTop = data.depth[0], dBot = data.depth[data.depth.length - 1];
  function yOf(d) { return plotTop + ((d - dTop) / (dBot - dTop)) * plotH; }

  ctx.fillStyle = "#080e1a"; ctx.fillRect(0, 0, w, h);

  // Formation zone shading (synthetic only — real wells have no zone picks here)
  if (data.synthetic && basin.formations) {
    var nf = basin.formations.length;
    for (var fi = 0; fi < nf; fi++) {
      var y0 = plotTop + (fi / nf) * plotH, y1 = plotTop + ((fi + 1) / nf) * plotH;
      ctx.fillStyle = fi % 2 ? "rgba(148,163,184,0.03)" : "rgba(194,154,107,0.04)";
      ctx.fillRect(depthW, y0, w - depthW, y1 - y0);
    }
  }

  // Depth track
  ctx.fillStyle = "#0c1322"; ctx.fillRect(0, 0, depthW, headerH);
  ctx.strokeStyle = "#1a2338"; ctx.lineWidth = 1; ctx.strokeRect(0, 0, depthW, headerH);
  ctx.fillStyle = "#0a1018"; ctx.fillRect(0, plotTop, depthW, plotH);
  ctx.font = "bold 9px Inter, system-ui, sans-serif"; ctx.fillStyle = "#64748b";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("DEPTH", depthW / 2, 16);
  ctx.font = "8px Inter, system-ui, sans-serif"; ctx.fillStyle = "#334155";
  ctx.fillText(data.synthetic ? "(m)" : "MD (m)", depthW / 2, 32);

  var span = dBot - dTop;
  var step = span > 2000 ? 500 : span > 800 ? 200 : span > 300 ? 50 : 20;
  for (var d = Math.ceil(dTop / step) * step; d <= dBot; d += step) {
    var y = yOf(d);
    var major = (d / step) % 2 === 0;
    ctx.strokeStyle = major ? "#1a2338" : "#111827"; ctx.lineWidth = major ? 0.8 : 0.4;
    ctx.beginPath(); ctx.moveTo(depthW, y); ctx.lineTo(w, y); ctx.stroke();
    ctx.fillStyle = major ? "#94a3b8" : "#475569";
    ctx.font = (major ? "bold " : "") + "9px Inter, system-ui, sans-serif";
    ctx.fillText(String(d), depthW / 2, y);
  }

  tracks.forEach(function (c, ti) {
    var st = TRACK_STYLE[c], spec = CURVE_SPECS[c];
    var lo = spec[1], hi = spec[2];
    var tx = depthW + ti * trackW;
    ctx.fillStyle = "#0c1322"; ctx.fillRect(tx, 0, trackW, headerH);
    ctx.strokeStyle = "#1a2338"; ctx.lineWidth = 0.5; ctx.strokeRect(tx, 0, trackW, headerH);
    ctx.textAlign = "center";
    ctx.font = "bold 10px Inter, system-ui, sans-serif"; ctx.fillStyle = st.color;
    ctx.fillText(st.label, tx + trackW / 2, 14);
    ctx.font = "8px Inter, system-ui, sans-serif"; ctx.fillStyle = "#475569";
    ctx.fillText(lo + " — " + hi + " " + spec[0], tx + trackW / 2, 30);
    ctx.font = "7px Inter, system-ui, sans-serif"; ctx.fillStyle = "#293548";
    ctx.fillText(st.fullName, tx + trackW / 2, 42);
    ctx.beginPath(); ctx.moveTo(tx, plotTop); ctx.lineTo(tx, plotTop + plotH); ctx.stroke();

    // vertical grid
    ctx.strokeStyle = "#0f1726"; ctx.lineWidth = 0.5;
    for (var g = 1; g < 4; g++) {
      var gx = tx + 3 + (g / 4) * (trackW - 6);
      ctx.beginPath(); ctx.moveTo(gx, plotTop); ctx.lineTo(gx, plotTop + plotH); ctx.stroke();
    }
    if (c === "GR") {
      var cx = tx + 3 + ((75 - lo) / (hi - lo)) * (trackW - 6);
      ctx.strokeStyle = "#fbbf2430"; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(cx, plotTop); ctx.lineTo(cx, plotTop + plotH); ctx.stroke();
      ctx.setLineDash([]);
    }

    // curve — gaps (null) break the line
    var vals = data.curves[c];
    ctx.strokeStyle = st.color; ctx.lineWidth = 1.3; ctx.beginPath();
    var pen = false;
    for (var i = 0; i < vals.length; i++) {
      var v = vals[i];
      if (v === null || v === undefined || isNaN(v)) { pen = false; continue; }
      var f = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
      var x = tx + 3 + f * (trackW - 6), yy = yOf(data.depth[i]);
      if (pen) ctx.lineTo(x, yy); else { ctx.moveTo(x, yy); pen = true; }
    }
    ctx.stroke();
  });

  // Watermark for synthetic data
  if (data.synthetic) {
    ctx.save();
    ctx.translate(depthW + (w - depthW) / 2, plotTop + plotH / 2);
    ctx.rotate(-Math.PI / 2.6);
    ctx.font = "bold 34px Inter, system-ui, sans-serif";
    ctx.fillStyle = "rgba(251,191,36,0.07)"; ctx.textAlign = "center";
    ctx.fillText("ILLUSTRATIVE", 0, 0);
    ctx.restore();
  }
}

export default function WellLogViewer(props) {
  var basin = props.basin;
  var canvasRef = useRef(null);
  var realWells = DIGITIZED_WELLS.filter(function (w) { return w.basin === basin.id; });
  var [choice, setChoice] = useState(realWells.length ? realWells[0].well : "Synthetic");

  useEffect(function () {
    setChoice(realWells.length ? realWells[0].well : "Synthetic");
  }, [basin.id]);

  var data = choice === "Synthetic"
    ? buildSynthetic(basin)
    : (realWells.filter(function (w) { return w.well === choice; })[0] || buildSynthetic(basin));

  useEffect(function () {
    if (canvasRef.current) drawLog(canvasRef.current, data, basin);
  }, [basin.id, choice]);

  var pill = function (label, active, onClick, accent) {
    return (
      <button key={label} onClick={onClick} style={{
        padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, fontFamily: "inherit",
        cursor: "pointer", border: "1px solid " + (active ? accent + "60" : "#1e2d45"),
        background: active ? accent + "18" : "#111b2e", color: active ? accent : "#64748b",
      }}>{label}</button>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#080e1a", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid #1a2338", background: "#0c1322" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>Well Log</span>
          </div>
          <span style={{ fontSize: 11, color: "#64748b" }}>
            {data.synthetic ? "Depth " : "Interval "}
            <strong style={{ color: "#e2e8f0" }}>{Math.round(data.depth[0])}–{Math.round(data.depth[data.depth.length - 1])} m</strong>
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {realWells.map(function (w) { return pill(w.well, choice === w.well, function () { setChoice(w.well); }, "#34d399"); })}
          {pill("Synthetic", choice === "Synthetic", function () { setChoice("Synthetic"); }, "#fbbf24")}
        </div>
      </div>

      {data.synthetic ? (
        <div style={{ padding: "8px 14px", background: "#fbbf240d", borderBottom: "1px solid #fbbf2430", fontSize: 11, color: "#fbbf24", lineHeight: 1.5 }}>
          <strong>Illustrative only.</strong> These curves are generated from the basin's depth range and type. They are not measured data.
          {realWells.length === 0 && " No published well logs are available for this basin yet."}
        </div>
      ) : (
        <div style={{ padding: "8px 14px", background: "#34d3990d", borderBottom: "1px solid #34d39930", fontSize: 11, color: "#94a3b8", lineHeight: 1.5 }}>
          <strong style={{ color: "#34d399" }}>Digitized from a published figure.</strong>{" "}
          Traced from {data.source.figure}, <a href={data.source.url} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>{data.source.title}</a>, p. {data.source.page}.
          {" "}Approximate: ~0.5 m per sample from a low-resolution image, gaps under 3 m interpolated, longer gaps left blank. Not the operator's LAS data.
        </div>
      )}

      <div style={{ flex: "1 1 0%", minHeight: 400, position: "relative" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      <div style={{ padding: "8px 14px 10px", borderTop: "1px solid #1a2338", background: "#091019", display: "flex", flexWrap: "wrap", gap: 12 }}>
        {TRACK_ORDER.map(function (c) {
          return (
            <div key={c} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 14, height: 2, background: TRACK_STYLE[c].color, borderRadius: 1 }} />
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{TRACK_STYLE[c].fullName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
