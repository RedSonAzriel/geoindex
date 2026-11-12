// ══════════════════════════════════════════════════════════════════
// GeoIndex — Well Log Viewer
// Canvas-based multi-track well log display showing procedural
// petrophysical curves (TOC, Porosity, Resistivity, GR, Density)
// vs depth — inspired by standard composite log presentations
// ══════════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";

// ── Seeded random
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

// ── Generate realistic well log curve with geological character
function generateLogCurve(numSamples, seed, opts) {
  var baseline = opts.baseline || 0.5;
  var amplitude = opts.amplitude || 0.3;
  var noiseLevel = opts.noiseLevel || 0.05;
  var trend = opts.trend || 0;         // linear depth trend
  var spikiness = opts.spikiness || 0; // sharp formation boundaries
  var numZones = opts.numZones || 4;

  // Create formation zone boundaries
  var zones = [];
  for (var z = 0; z < numZones; z++) {
    zones.push({
      start: z / numZones,
      end: (z + 1) / numZones,
      value: baseline + (seededRandom(seed + z * 137) - 0.5) * amplitude * 2,
    });
  }

  var curve = [];
  for (var i = 0; i < numSamples; i++) {
    var t = i / numSamples; // 0-1 depth fraction

    // Find which zone we're in
    var zoneIdx = Math.min(Math.floor(t * numZones), numZones - 1);
    var zone = zones[zoneIdx];
    var nextZone = zones[Math.min(zoneIdx + 1, numZones - 1)];

    // Position within zone
    var zt = (t - zone.start) / (zone.end - zone.start);

    // Smooth transition between zones
    var val = zone.value;
    if (zt > 0.85 && zoneIdx < numZones - 1) {
      var blend = (zt - 0.85) / 0.15;
      blend = blend * blend * (3 - 2 * blend); // smoothstep
      val = zone.value + (nextZone.value - zone.value) * blend;
    }

    // Add depth trend
    val += trend * t;

    // Add medium-frequency geological variation
    var geo1 = Math.sin(t * 15 + seededRandom(seed + 1000) * 10) * amplitude * 0.2;
    var geo2 = Math.sin(t * 37 + seededRandom(seed + 2000) * 10) * amplitude * 0.1;
    val += geo1 + geo2;

    // Add high-frequency noise (tool noise)
    val += (seededRandom(seed + i * 7 + 5000) - 0.5) * noiseLevel;

    // Sharp spikes at formation boundaries
    if (spikiness > 0) {
      var distFromBoundary = 999;
      for (var b = 1; b < numZones; b++) {
        distFromBoundary = Math.min(distFromBoundary, Math.abs(t - b / numZones));
      }
      if (distFromBoundary < 0.02) {
        val += spikiness * (1 - distFromBoundary / 0.02) * (seededRandom(seed + i * 3) > 0.5 ? 1 : -1);
      }
    }

    // Clamp to 0-1
    curve.push(Math.max(0, Math.min(1, val)));
  }

  return curve;
}

// ── Well log track definitions
var TRACKS = [
  {
    name: "GR",
    fullName: "Gamma Ray",
    unit: "API",
    min: 0,
    max: 150,
    color: "#34d399",
    seedOffset: 100,
    opts: { baseline: 0.4, amplitude: 0.25, noiseLevel: 0.04, spikiness: 0.15, numZones: 6 },
  },
  {
    name: "Resistivity",
    fullName: "Deep Resistivity",
    unit: "ohm·m",
    min: 0.1,
    max: 1000,
    color: "#f97316",
    seedOffset: 200,
    logScale: true,
    opts: { baseline: 0.35, amplitude: 0.3, noiseLevel: 0.03, spikiness: 0.2, numZones: 5 },
  },
  {
    name: "Porosity",
    fullName: "Neutron Porosity",
    unit: "%",
    min: 0,
    max: 45,
    color: "#60a5fa",
    seedOffset: 300,
    opts: { baseline: 0.35, amplitude: 0.2, noiseLevel: 0.03, trend: -0.1, numZones: 5 },
  },
  {
    name: "Density",
    fullName: "Bulk Density",
    unit: "g/cc",
    min: 1.8,
    max: 2.9,
    color: "#a78bfa",
    seedOffset: 400,
    opts: { baseline: 0.55, amplitude: 0.2, noiseLevel: 0.02, trend: 0.08, numZones: 5 },
  },
  {
    name: "TOC",
    fullName: "Total Organic Carbon",
    unit: "wt.%",
    min: 0,
    max: 6,
    color: "#ef4444",
    seedOffset: 500,
    opts: { baseline: 0.25, amplitude: 0.25, noiseLevel: 0.02, spikiness: 0.1, numZones: 4 },
    // Also draw a "measured" dashed version
    hasMeasured: true,
    measuredSeedOffset: 550,
  },
];


export default function WellLogViewer(props) {
  var basin = props.basin;
  var canvasRef = useRef(null);

  useEffect(function () {
    var canvas = canvasRef.current;
    if (!canvas || !basin) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var rect = canvas.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;
    canvas.width = w * dpr;
    canvas.height = h * dpr;

    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    var baseSeed = hashString(basin.id + "_welllog");
    var numSamples = 200;

    // Layout
    var headerH = 48;
    var footerH = 24;
    var depthTrackW = 48;
    var trackCount = TRACKS.length;
    var trackW = (w - depthTrackW) / trackCount;
    var plotTop = headerH;
    var plotH = h - headerH - footerH;

    // Depth range
    var depthTop = basin.depth_m[0];
    var depthBot = basin.depth_m[1];

    // Background
    ctx.fillStyle = "#080e1a";
    ctx.fillRect(0, 0, w, h);

    // ── Draw depth track (left side)
    ctx.fillStyle = "#0a1018";
    ctx.fillRect(0, plotTop, depthTrackW, plotH);
    ctx.strokeStyle = "#1a2338";
    ctx.lineWidth = 1;
    ctx.strokeRect(0, plotTop, depthTrackW, plotH);

    // Depth header
    ctx.fillStyle = "#0c1322";
    ctx.fillRect(0, 0, depthTrackW, headerH);
    ctx.strokeStyle = "#1a2338";
    ctx.strokeRect(0, 0, depthTrackW, headerH);
    ctx.font = "bold 9px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("DEPTH", depthTrackW / 2, 16);
    ctx.font = "8px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#334155";
    ctx.fillText("(m)", depthTrackW / 2, 32);

    // Depth ticks
    var depthInterval = Math.round((depthBot - depthTop) / 10 / 100) * 100;
    if (depthInterval < 100) depthInterval = 100;
    ctx.font = "9px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (var d = depthTop; d <= depthBot; d += depthInterval) {
      var y = plotTop + ((d - depthTop) / (depthBot - depthTop)) * plotH;
      var isMajor = (d - depthTop) % (depthInterval * 2) === 0;

      // Horizontal grid line across all tracks
      ctx.strokeStyle = isMajor ? "#1a2338" : "#111827";
      ctx.lineWidth = isMajor ? 0.8 : 0.3;
      ctx.beginPath();
      ctx.moveTo(depthTrackW, y);
      ctx.lineTo(w, y);
      ctx.stroke();

      // Depth label
      ctx.fillStyle = isMajor ? "#94a3b8" : "#334155";
      ctx.font = isMajor ? "bold 9px Inter, system-ui, sans-serif" : "8px Inter, system-ui, sans-serif";
      ctx.fillText(d.toString(), depthTrackW / 2, y);
    }

    // ── Formation zone shading
    var formSeed = hashString(basin.id + "_form_zones");
    var formations = basin.formations || [];
    var numFormations = formations.length || 3;
    var formColors = [
      "rgba(194,154,107,0.04)", "rgba(160,120,90,0.04)", "rgba(107,142,107,0.04)",
      "rgba(123,143,161,0.04)", "rgba(107,91,79,0.04)", "rgba(74,85,104,0.04)",
    ];

    for (var fi = 0; fi < numFormations; fi++) {
      var fy0 = plotTop + (fi / numFormations) * plotH;
      var fy1 = plotTop + ((fi + 1) / numFormations) * plotH;
      ctx.fillStyle = formColors[fi % formColors.length];
      ctx.fillRect(depthTrackW, fy0, w - depthTrackW, fy1 - fy0);

      // Formation label (rotated, in depth track)
      if (formations[fi]) {
        var midY = (fy0 + fy1) / 2;
        ctx.save();
        ctx.translate(6, midY);
        ctx.rotate(-Math.PI / 2);
        ctx.font = "7px Inter, system-ui, sans-serif";
        ctx.fillStyle = "#293548";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        var label = formations[fi];
        if (label.length > 18) label = label.substring(0, 16) + "…";
        ctx.fillText(label, 0, 0);
        ctx.restore();
      }
    }

    // ── Draw each log track
    for (var ti = 0; ti < trackCount; ti++) {
      var track = TRACKS[ti];
      var tx = depthTrackW + ti * trackW;

      // Track header
      ctx.fillStyle = "#0c1322";
      ctx.fillRect(tx, 0, trackW, headerH);
      ctx.strokeStyle = "#1a2338";
      ctx.lineWidth = 0.5;
      ctx.strokeRect(tx, 0, trackW, headerH);

      // Track name
      ctx.font = "bold 10px Inter, system-ui, sans-serif";
      ctx.fillStyle = track.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(track.name, tx + trackW / 2, 14);

      // Scale range
      ctx.font = "8px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#475569";
      var scaleLabel = track.min + " — " + track.max + " " + track.unit;
      ctx.fillText(scaleLabel, tx + trackW / 2, 30);

      // Sub-label
      ctx.font = "7px Inter, system-ui, sans-serif";
      ctx.fillStyle = "#293548";
      ctx.fillText(track.fullName, tx + trackW / 2, 42);

      // Track vertical border
      ctx.strokeStyle = "#1a2338";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(tx, plotTop);
      ctx.lineTo(tx, plotTop + plotH);
      ctx.stroke();

      // Generate curve data
      var curve = generateLogCurve(numSamples, baseSeed + track.seedOffset, track.opts);

      // Draw curve fill (shaded area under curve)
      ctx.beginPath();
      ctx.moveTo(tx + 3, plotTop);
      for (var si = 0; si < numSamples; si++) {
        var sy = plotTop + (si / numSamples) * plotH;
        var sx = tx + 3 + curve[si] * (trackW - 6);
        if (si === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.lineTo(tx + 3, plotTop + plotH);
      ctx.closePath();
      ctx.fillStyle = track.color + "08";
      ctx.fill();

      // Draw main curve line
      ctx.beginPath();
      ctx.strokeStyle = track.color;
      ctx.lineWidth = 1.5;
      for (var si = 0; si < numSamples; si++) {
        var sy = plotTop + (si / numSamples) * plotH;
        var sx = tx + 3 + curve[si] * (trackW - 6);
        if (si === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();

      // Draw measured curve (dashed) for TOC track
      if (track.hasMeasured) {
        var measured = generateLogCurve(numSamples, baseSeed + track.measuredSeedOffset, {
          baseline: track.opts.baseline + 0.05,
          amplitude: track.opts.amplitude * 1.2,
          noiseLevel: track.opts.noiseLevel * 2,
          spikiness: 0,
          numZones: track.opts.numZones,
        });

        ctx.beginPath();
        ctx.setLineDash([4, 3]);
        ctx.strokeStyle = "#60a5fa";
        ctx.lineWidth = 1.2;
        for (var si = 0; si < numSamples; si++) {
          var sy = plotTop + (si / numSamples) * plotH;
          var sx = tx + 3 + measured[si] * (trackW - 6);
          if (si === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Cutoff / reference lines
      if (track.name === "GR") {
        // Sand/shale cutoff at ~75 API
        var cutoffX = tx + 3 + (75 / 150) * (trackW - 6);
        ctx.strokeStyle = "#fbbf2430";
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cutoffX, plotTop);
        ctx.lineTo(cutoffX, plotTop + plotH);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // ── Footer
    ctx.fillStyle = "#0c1322";
    ctx.fillRect(0, h - footerH, w, footerH);
    ctx.strokeStyle = "#1a2338";
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, h - footerH);
    ctx.lineTo(w, h - footerH);
    ctx.stroke();

    ctx.font = "9px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#293548";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(
      basin.name + " — Composite Well Log  |  " + basin.wells_drilled + " wells  |  Procedural model",
      8,
      h - footerH / 2
    );

    ctx.textAlign = "right";
    ctx.fillText(basin.source, w - 8, h - footerH / 2);

  }, [basin]);

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "#080e1a",
      borderRadius: 10,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 16px",
        borderBottom: "1px solid #1a2338",
        background: "#0c1322",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>Composite Well Log</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontSize: 11, color: "#64748b" }}>
            Depth: <strong style={{ color: "#e2e8f0" }}>{basin.depth_m[0]}–{basin.depth_m[1]}m</strong>
          </span>
          <span style={{ fontSize: 11, color: "#64748b" }}>
            <strong style={{ color: "#e2e8f0" }}>{TRACKS.length}</strong> tracks
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ flex: "1 1 0%", minHeight: 440, position: "relative" }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>

      {/* Legend */}
      <div style={{
        padding: "8px 16px 10px",
        borderTop: "1px solid #1a2338",
        background: "#091019",
        display: "flex",
        flexWrap: "wrap",
        gap: 12,
        alignItems: "center",
      }}>
        {TRACKS.map(function (t) {
          return (
            <div key={t.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 14, height: 2, background: t.color, borderRadius: 1 }} />
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{t.name}</span>
            </div>
          );
        })}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 14, height: 0, borderTop: "2px dashed #60a5fa" }} />
          <span style={{ fontSize: 10, color: "#94a3b8" }}>Measured</span>
        </div>
      </div>
    </div>
  );
}
