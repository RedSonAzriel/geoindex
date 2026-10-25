import { useEffect, useRef } from "react";
import { INFRA, INFRA_LAYERS, readinessScore } from "../data/infrastructure";

function layerDef(id) {
  for (var i = 0; i < INFRA_LAYERS.length; i++) {
    if (INFRA_LAYERS[i].id === id) return INFRA_LAYERS[i];
  }
  return null;
}

function tipHtml(name, sub) {
  return '<div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.4;"><strong style="color:#1e293b;">' + name + '</strong>' +
    (sub ? '<br/><span style="color:#475569;">' + sub + '</span>' : '') + '</div>';
}

// Draws one infrastructure layer on the Leaflet map held in mapRef. Call after the map init effect.
export function useInfraLayer(mapRef, activeLayer, leafletReady) {
  var groupRef = useRef(null);
  useEffect(function () {
    var map = mapRef.current;
    var L = window.L;
    if (!leafletReady || !map || !L) return undefined;
    if (groupRef.current) {
      try { map.removeLayer(groupRef.current); } catch (e) { /* map already gone */ }
      groupRef.current = null;
    }
    var def = layerDef(activeLayer);
    if (!def || !INFRA[activeLayer]) return undefined;
    var group = L.layerGroup();
    var list = INFRA[activeLayer];
    for (var i = 0; i < list.length; i++) {
      var it = list[i];
      if (it.pos) {
        var dot = L.circleMarker(it.pos, {
          radius: activeLayer === "ports" ? 6 : 5,
          fillColor: def.color,
          color: "#0b1120",
          weight: 1.5,
          opacity: 1,
          fillOpacity: 0.9
        });
        dot.bindTooltip(tipHtml(it.name, it.country), { direction: "top", className: "geo-tooltip" });
        dot.addTo(group);
      } else {
        var planned = it.status && it.status !== "Operating";
        var line = L.polyline(it.pts, {
          color: def.color,
          weight: activeLayer === "power" ? 2 : 3,
          opacity: 0.85,
          dashArray: planned ? "6,6" : null,
          interactive: false
        });
        line.addTo(group);
      }
    }
    group.addTo(map);
    groupRef.current = group;
    return function () {
      if (groupRef.current) {
        try { map.removeLayer(groupRef.current); } catch (e) { /* map already gone */ }
        groupRef.current = null;
      }
    };
  }, [activeLayer, leafletReady]);
}

var SEL = { background: "#111b2e", border: "1px solid #1e2d45", color: "#94a3b8", padding: "5px 10px", borderRadius: 8, fontSize: 11, fontFamily: "inherit", cursor: "pointer", outline: "none" };

export function InfraSelect(props) {
  return (
    <select value={props.value} onChange={function (e) { props.onChange(e.target.value); }} style={SEL} title="Infrastructure layer">
      <option value="none" style={{ background: "#0f172a" }}>Infrastructure: none</option>
      {INFRA_LAYERS.map(function (l) {
        return <option key={l.id} value={l.id} style={{ background: "#0f172a" }}>{l.label}</option>;
      })}
    </select>
  );
}

export function InfraLegend(props) {
  var def = layerDef(props.activeLayer);
  if (!def) return null;
  var isLine = props.activeLayer !== "ports" && props.activeLayer !== "airports";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 18px", borderTop: "1px solid #1a2338", flexWrap: "wrap" }}>
      <span style={{ display: "inline-block", width: isLine ? 18 : 8, height: isLine ? 3 : 8, borderRadius: isLine ? 2 : 4, background: def.color }}></span>
      <span style={{ fontSize: 10, color: "#94a3b8" }}>{def.label}</span>
      {isLine && <span style={{ fontSize: 10, color: "#475569" }}>dashed = planned or proposed</span>}
      <span style={{ fontSize: 10, color: "#475569", marginLeft: "auto" }}>Approximate and schematic. Verify before use.</span>
    </div>
  );
}

function scoreColor(s) {
  if (s >= 66) return "#34d399";
  if (s >= 33) return "#fbbf24";
  return "#f87171";
}

export function DevReadiness(props) {
  var b = props.basin;
  if (!b || typeof b.lat !== "number" || typeof b.lng !== "number") return null;
  var r = readinessScore(b.lat, b.lng);
  var col = scoreColor(r.score);
  return (
    <div style={{ background: "#091019", borderRadius: 10, padding: 16, border: "1px solid #1a2338", marginBottom: 18 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#3d4f6a", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12 }}>Development Readiness</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 28, fontWeight: 800, color: col }}>{r.score}</span>
        <span style={{ fontSize: 12, color: "#475569" }}>/ 100</span>
      </div>
      <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: r.score + "%", background: col, borderRadius: 3 }}></div>
      </div>
      {r.parts.map(function (p) {
        return (
          <div key={p.key} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11, marginBottom: 6 }}>
            <span style={{ color: "#94a3b8" }}>{p.label}: <span style={{ color: "#cbd5e1" }}>{p.name}</span></span>
            <span style={{ color: "#475569", whiteSpace: "nowrap" }}>{p.dist.toLocaleString()} km · {p.pts}/{p.weight}</span>
          </div>
        );
      })}
      <div style={{ fontSize: 10, color: "#334155", marginTop: 10, lineHeight: 1.5 }}>
        Coarse screening score from the basin centroid to the nearest regional infrastructure. Not a site assessment.
      </div>
    </div>
  );
}
