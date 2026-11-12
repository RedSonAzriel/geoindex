// ══════════════════════════════════════════════════════════════════
// GeoIndex — Basin Isopach / Structure Contour Map
// Canvas-based 2D contour map with color ramp, isolines, and
// basin-type-aware procedural thickness distributions
// ══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useMemo } from "react";

// ── Color ramp — geological isopach convention (thin→thick)
var COLOR_STOPS = [
  { t: 0.00, r: 68,  g: 2,   b: 86  },  // deep purple (thinnest)
  { t: 0.10, r: 72,  g: 36,  b: 117 },  // purple
  { t: 0.20, r: 65,  g: 68,  b: 135 },  // blue-purple
  { t: 0.30, r: 42,  g: 120, b: 142 },  // teal
  { t: 0.40, r: 32,  g: 144, b: 141 },  // cyan-teal
  { t: 0.50, r: 53,  g: 183, b: 121 },  // green
  { t: 0.60, r: 109, g: 206, b: 89  },  // lime
  { t: 0.65, r: 180, g: 222, b: 44  },  // yellow-green
  { t: 0.75, r: 223, g: 199, b: 31  },  // yellow
  { t: 0.85, r: 253, g: 165, b: 10  },  // orange
  { t: 0.92, r: 246, g: 89,  b: 31  },  // red-orange
  { t: 1.00, r: 189, g: 0,   b: 38  },  // deep red (thickest)
];

function lerpColor(t) {
  if (t <= 0) return COLOR_STOPS[0];
  if (t >= 1) return COLOR_STOPS[COLOR_STOPS.length - 1];
  for (var i = 1; i < COLOR_STOPS.length; i++) {
    if (t <= COLOR_STOPS[i].t) {
      var prev = COLOR_STOPS[i - 1];
      var next = COLOR_STOPS[i];
      var f = (t - prev.t) / (next.t - prev.t);
      return {
        r: Math.round(prev.r + (next.r - prev.r) * f),
        g: Math.round(prev.g + (next.g - prev.g) * f),
        b: Math.round(prev.b + (next.b - prev.b) * f),
      };
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1];
}

// ── Seeded random for reproducible per-basin data
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

// ── Smooth noise via bilinear interpolation of coarse grid
function generateNoiseGrid(size, seed) {
  var coarse = 8;
  var grid = [];
  var coarseGrid = [];

  // Generate coarse control points
  for (var ci = 0; ci <= coarse; ci++) {
    coarseGrid[ci] = [];
    for (var cj = 0; cj <= coarse; cj++) {
      coarseGrid[ci][cj] = seededRandom(seed + ci * 137 + cj * 311);
    }
  }

  // Bilinear interpolation to full grid
  for (var i = 0; i < size; i++) {
    grid[i] = [];
    var fi = (i / size) * coarse;
    var ci0 = Math.floor(fi);
    var ci1 = Math.min(ci0 + 1, coarse);
    var ft = fi - ci0;

    for (var j = 0; j < size; j++) {
      var fj = (j / size) * coarse;
      var cj0 = Math.floor(fj);
      var cj1 = Math.min(cj0 + 1, coarse);
      var fs = fj - cj0;

      // Bilinear interp
      var v00 = coarseGrid[ci0][cj0];
      var v10 = coarseGrid[ci1][cj0];
      var v01 = coarseGrid[ci0][cj1];
      var v11 = coarseGrid[ci1][cj1];
      var top = v00 + (v01 - v00) * fs;
      var bot = v10 + (v11 - v10) * fs;
      grid[i][j] = top + (bot - top) * ft;
    }
  }
  return grid;
}

// ── Generate isopach thickness field based on basin type
function generateThicknessField(size, basin) {
  var seed = hashString(basin.id);
  var isRift = basin.type.indexOf("Rift") >= 0;
  var isPassive = basin.type.indexOf("Passive") >= 0;
  var isIntra = basin.type.indexOf("Intracratonic") >= 0;

  // Base noise layers (multi-octave)
  var noise1 = generateNoiseGrid(size, seed);
  var noise2 = generateNoiseGrid(size, seed + 7777);
  var noise3 = generateNoiseGrid(size, seed + 15551);

  var field = [];
  var minVal = 999;
  var maxVal = -999;

  // Basin-type structural trend
  var trendAngle = seededRandom(seed + 42) * Math.PI * 2;
  var cosA = Math.cos(trendAngle);
  var sinA = Math.sin(trendAngle);

  // Depocenters (thickness maxima) — 2-4 per basin
  var numDepo = 2 + Math.floor(seededRandom(seed + 99) * 3);
  var depocenters = [];
  for (var d = 0; d < numDepo; d++) {
    depocenters.push({
      x: 0.15 + seededRandom(seed + d * 31 + 200) * 0.7,
      y: 0.15 + seededRandom(seed + d * 47 + 300) * 0.7,
      strength: 0.3 + seededRandom(seed + d * 67 + 400) * 0.5,
      radius: 0.15 + seededRandom(seed + d * 23 + 500) * 0.2,
    });
  }

  for (var i = 0; i < size; i++) {
    field[i] = [];
    for (var j = 0; j < size; j++) {
      var nx = i / size;
      var ny = j / size;
      var cx = nx - 0.5;
      var cy = ny - 0.5;

      // Structural trend — linear gradient along trend axis
      var trend = (cx * cosA + cy * sinA + 0.5) * 0.4;

      // Basin-type specific shape
      var shape = 0;
      if (isRift) {
        // Rift: thickest along central graben axis, thinning to flanks
        var distFromAxis = Math.abs(cx * sinA - cy * cosA);
        shape = Math.max(0, 1.0 - distFromAxis * 4.0);
        shape = shape * shape * 0.6;
      } else if (isPassive) {
        // Passive margin: thickens toward one edge (shelf to deepwater)
        shape = (cx * cosA + cy * sinA + 0.5) * 0.5;
      } else if (isIntra) {
        // Intracratonic: bowl-shaped, thickest in center
        var distFromCenter = Math.sqrt(cx * cx + cy * cy);
        shape = Math.max(0, 0.5 - distFromCenter * 1.2);
      } else {
        shape = 0.3;
      }

      // Depocenter contributions
      var depoVal = 0;
      for (var d = 0; d < depocenters.length; d++) {
        var dc = depocenters[d];
        var dx = nx - dc.x;
        var dy = ny - dc.y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        depoVal += dc.strength * Math.exp(-(dist * dist) / (2 * dc.radius * dc.radius));
      }

      // Combine: structural + basin shape + depocenters + noise
      var val = trend * 0.2 +
        shape * 0.35 +
        depoVal * 0.25 +
        noise1[i][j] * 0.12 +
        noise2[i][j] * 0.06 +
        noise3[i][j] * 0.02;

      field[i][j] = val;
      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;
    }
  }

  // Normalize to 0-1
  var range = maxVal - minVal || 1;
  for (var i = 0; i < size; i++) {
    for (var j = 0; j < size; j++) {
      field[i][j] = (field[i][j] - minVal) / range;
    }
  }

  return field;
}

// ── Marching squares contour extraction
function traceContours(field, size, levels) {
  var contours = [];

  for (var li = 0; li < levels.length; li++) {
    var level = levels[li];
    var segments = [];

    for (var i = 0; i < size - 1; i++) {
      for (var j = 0; j < size - 1; j++) {
        var v00 = field[i][j];
        var v10 = field[i + 1][j];
        var v01 = field[i][j + 1];
        var v11 = field[i + 1][j + 1];

        // Marching squares case index
        var idx = 0;
        if (v00 >= level) idx |= 1;
        if (v10 >= level) idx |= 2;
        if (v11 >= level) idx |= 4;
        if (v01 >= level) idx |= 8;

        if (idx === 0 || idx === 15) continue;

        // Interpolate edge crossings
        function interp(va, vb, pa, pb) {
          var t = (level - va) / (vb - va);
          return { x: pa.x + t * (pb.x - pa.x), y: pa.y + t * (pb.y - pa.y) };
        }

        var p00 = { x: i, y: j };
        var p10 = { x: i + 1, y: j };
        var p01 = { x: i, y: j + 1 };
        var p11 = { x: i + 1, y: j + 1 };

        var top = interp(v00, v10, p00, p10);
        var right = interp(v10, v11, p10, p11);
        var bottom = interp(v01, v11, p01, p11);
        var left = interp(v00, v01, p00, p01);

        // Generate line segments for each case
        if (idx === 1 || idx === 14) segments.push([top, left]);
        else if (idx === 2 || idx === 13) segments.push([top, right]);
        else if (idx === 3 || idx === 12) segments.push([left, right]);
        else if (idx === 4 || idx === 11) segments.push([right, bottom]);
        else if (idx === 5) { segments.push([top, right]); segments.push([left, bottom]); }
        else if (idx === 6 || idx === 9) segments.push([top, bottom]);
        else if (idx === 7 || idx === 8) segments.push([left, bottom]);
        else if (idx === 10) { segments.push([top, left]); segments.push([right, bottom]); }
      }
    }

    contours.push({ level: level, segments: segments });
  }

  return contours;
}


export default function BasinContourMap(props) {
  var basin = props.basin;
  var canvasRef = useRef(null);

  // Scale thickness values to real depth range
  var depthRange = basin.depth_m || [500, 5000];
  var thicknessMax = depthRange[1] - depthRange[0];

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

    // Map area with margins for legend/labels
    var margin = { top: 36, right: 60, bottom: 36, left: 16 };
    var mapW = w - margin.left - margin.right;
    var mapH = h - margin.top - margin.bottom;

    // Generate thickness field
    var gridSize = 128;
    var field = generateThicknessField(gridSize, basin);

    // ── Draw color-coded thickness raster
    var cellW = mapW / gridSize;
    var cellH = mapH / gridSize;

    for (var i = 0; i < gridSize; i++) {
      for (var j = 0; j < gridSize; j++) {
        var c = lerpColor(field[i][j]);
        ctx.fillStyle = "rgb(" + c.r + "," + c.g + "," + c.b + ")";
        ctx.fillRect(
          margin.left + j * cellW,
          margin.top + i * cellH,
          cellW + 0.5,
          cellH + 0.5
        );
      }
    }

    // ── Draw contour lines
    var numContours = 12;
    var contourLevels = [];
    for (var k = 1; k < numContours; k++) {
      contourLevels.push(k / numContours);
    }

    var contours = traceContours(field, gridSize, contourLevels);

    for (var ci = 0; ci < contours.length; ci++) {
      var contour = contours[ci];
      var isMajor = (ci + 1) % 3 === 0;

      ctx.strokeStyle = isMajor ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.2)";
      ctx.lineWidth = isMajor ? 1.2 : 0.5;

      var segs = contour.segments;
      for (var si = 0; si < segs.length; si++) {
        var seg = segs[si];
        ctx.beginPath();
        ctx.moveTo(
          margin.left + (seg[0].y / gridSize) * mapW,
          margin.top + (seg[0].x / gridSize) * mapH
        );
        ctx.lineTo(
          margin.left + (seg[1].y / gridSize) * mapW,
          margin.top + (seg[1].x / gridSize) * mapH
        );
        ctx.stroke();
      }

      // Label major contours
      if (isMajor && segs.length > 0) {
        var labelSeg = segs[Math.floor(segs.length / 3)];
        var lx = margin.left + (labelSeg[0].y / gridSize) * mapW;
        var ly = margin.top + (labelSeg[0].x / gridSize) * mapH;
        var thicknessVal = Math.round(contour.level * thicknessMax);

        // Background for label
        var labelText = thicknessVal + "m";
        ctx.font = "bold 9px Inter, system-ui, sans-serif";
        var tw = ctx.measureText(labelText).width;
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(lx - tw / 2 - 3, ly - 6, tw + 6, 12);
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(labelText, lx, ly);
      }
    }

    // ── Structure lines (dashed, simulating structural contours)
    var structSeed = hashString(basin.id + "_struct");
    var structNoise = generateNoiseGrid(gridSize, structSeed + 5000);
    var structLevels = [0.25, 0.5, 0.75];
    var structContours = traceContours(structNoise, gridSize, structLevels);

    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = "rgba(200,180,220,0.3)";
    ctx.lineWidth = 0.8;
    for (var sci = 0; sci < structContours.length; sci++) {
      var sSegs = structContours[sci].segments;
      for (var ssi = 0; ssi < sSegs.length; ssi++) {
        var ss = sSegs[ssi];
        ctx.beginPath();
        ctx.moveTo(
          margin.left + (ss[0].y / gridSize) * mapW,
          margin.top + (ss[0].x / gridSize) * mapH
        );
        ctx.lineTo(
          margin.left + (ss[1].y / gridSize) * mapW,
          margin.top + (ss[1].x / gridSize) * mapH
        );
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);

    // ── Well locations as markers
    var wells = basin.wells_drilled || 0;
    var wellSeed = hashString(basin.id + "_wells");
    var wellCount = Math.min(wells, 15);
    var STATUS_CLR = { Frontier: "#a78bfa", Exploration: "#fbbf24", Appraisal: "#60a5fa", Development: "#34d399" };
    var wellColor = STATUS_CLR[basin.status] || "#ffffff";

    for (var wi = 0; wi < wellCount; wi++) {
      var wx = margin.left + (0.1 + seededRandom(wellSeed + wi * 31) * 0.8) * mapW;
      var wy = margin.top + (0.1 + seededRandom(wellSeed + wi * 47 + 100) * 0.8) * mapH;

      // Well symbol — crosshair
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(wx, wy, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(wx - 6, wy);
      ctx.lineTo(wx + 6, wy);
      ctx.moveTo(wx, wy - 6);
      ctx.lineTo(wx, wy + 6);
      ctx.stroke();

      // Colored center dot
      ctx.fillStyle = wellColor;
      ctx.beginPath();
      ctx.arc(wx, wy, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Basin title
    ctx.font = "bold 13px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#e2e8f0";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(basin.name + " — Isopach Map", margin.left, 8);

    // Formation label
    var formLabel = basin.formations && basin.formations[0] ? basin.formations[0] : "Primary Formation";
    ctx.font = "10px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Formation: " + formLabel + "  |  Isopach CI: " + Math.round(thicknessMax / numContours) + "m", margin.left, 22);

    // ── Color bar legend (right side)
    var barX = w - margin.right + 12;
    var barY = margin.top;
    var barW = 14;
    var barH = mapH;

    for (var bi = 0; bi < barH; bi++) {
      var t = 1 - (bi / barH);
      var bc = lerpColor(t);
      ctx.fillStyle = "rgb(" + bc.r + "," + bc.g + "," + bc.b + ")";
      ctx.fillRect(barX, barY + bi, barW, 1.5);
    }

    // Legend border
    ctx.strokeStyle = "#1a2338";
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    // Legend tick labels
    ctx.font = "9px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    var numTicks = 6;
    for (var ti = 0; ti <= numTicks; ti++) {
      var tickT = ti / numTicks;
      var tickY = barY + (1 - tickT) * barH;
      var tickVal = Math.round(tickT * thicknessMax);

      // Tick mark
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(barX + barW, tickY);
      ctx.lineTo(barX + barW + 3, tickY);
      ctx.stroke();

      ctx.fillText(tickVal + "m", barX + barW + 5, tickY);
    }

    // Legend title
    ctx.save();
    ctx.translate(barX - 4, barY + barH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = "bold 9px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("THICKNESS", 0, 0);
    ctx.restore();

    // ── Footer info
    ctx.font = "9px Inter, system-ui, sans-serif";
    ctx.fillStyle = "#334155";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText(
      "CI: " + Math.round(thicknessMax / numContours) + "m  |  Structure: dashed  |  " + wellCount + " illustrative well spots",
      margin.left, h - 6
    );

    ctx.textAlign = "right";
    ctx.fillText("Synthetic surface", w - margin.right, h - 6);

  }, [basin]);


  // ── Legend items for formations
  var formations = basin.formations || [];

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "#080e1a",
      borderRadius: 10,
      overflow: "hidden",
    }}>
      {/* Header stats bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 16px",
        borderBottom: "1px solid rgb(26, 35, 56)",
        background: "rgb(12, 19, 34)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
          </svg>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>Isopach Contour Map</span>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ fontSize: 11, color: "#64748b" }}>
            <strong style={{ color: "#e2e8f0" }}>{formations.length}</strong> formations
          </span>
          <span style={{ fontSize: 11, color: "#64748b" }}>
            <strong style={{ color: "#e2e8f0" }}>{basin.depth_m[0]}–{basin.depth_m[1]}m</strong> depth
          </span>
          <span style={{ fontSize: 11, color: "#64748b" }}>
            <strong style={{ color: "#e2e8f0" }}>{basin.wells_drilled == null ? "\u2014" : basin.wells_drilled}</strong> wells
          </span>
        </div>
      </div>

      <div style={{ padding: "8px 16px", background: "#fbbf240d", borderBottom: "1px solid #fbbf2430", fontSize: 11, color: "#fbbf24", lineHeight: 1.5 }}>
        <strong>Illustrative only.</strong> This thickness surface and the well positions are generated from the basin's type and depth range. They are not mapped data.
      </div>

      {/* Canvas area */}
      <div style={{ flex: "1 1 0%", minHeight: 360, position: "relative", background: "#080e1a" }}>
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "100%", display: "block" }}
        />
      </div>

      {/* Formations legend */}
      <div style={{
        padding: "10px 16px 12px",
        borderTop: "1px solid #1a2338",
        background: "#091019",
      }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#3d4f6a", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          Formations
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {formations.map(function (f, idx) {
            var colors = ["#C19A6B", "#A0785A", "#6B8E6B", "#7B8FA1", "#6B5B4F", "#4A5568", "#8B7355", "#2D3748"];
            return (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: colors[idx % colors.length] }} />
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{f}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
