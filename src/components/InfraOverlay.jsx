// Infrastructure planning overlay for Leaflet MapPanel
// Renders ports, airports, pipelines, power lines, roads as Leaflet layers

import { useState, useMemo, useEffect, useRef } from "react";
import { PORTS, AIRPORTS, PIPELINES, POWER_LINES, ROADS, INFRA_LAYERS, computeProximity, devReadinessScore } from "../data/infrastructure";

var LAYER_STYLES = {
  ports: { color: "#42a5f5" },
  airports: { color: "#ab47bc" },
  pipelines: { color: "#ef5350" },
  power: { color: "#ffa726" },
  roads: { color: "#78909c" },
};

// Adds infrastructure markers/lines to a Leaflet map
export function useInfraLayer(mapRef, activeLayer, leafletReady) {
  var layerGroupRef = useRef(null);

  useEffect(function() {
    if (!mapRef.current || !leafletReady || !window.L) return;
    var L = window.L;
    var map = mapRef.current;

    // Clear previous infra layer
    if (layerGroupRef.current) {
      map.removeLayer(layerGroupRef.current);
      layerGroupRef.current = null;
    }

    if (!activeLayer || activeLayer === "none") return;

    var group = L.layerGroup().addTo(map);
    layerGroupRef.current = group;

    if (activeLayer === "ports") {
      PORTS.forEach(function(p) {
        var r = p.type === "deepwater" ? 7 : p.type === "lng" ? 6 : 4;
        var marker = L.circleMarker([p.lat, p.lng], {
          radius: r,
          fillColor: "#42a5f5",
          color: "#fff",
          weight: 1,
          fillOpacity: 0.85,
        }).addTo(group);
        marker.bindTooltip(
          '<div style="font-size:11px;line-height:1.4;">' +
          '<strong>' + p.name + '</strong><br/>' +
          '<span style="color:#64748b;">' + p.type + (p.capacity_mt ? ' · ' + p.capacity_mt + ' MT' : '') + '</span></div>',
          { direction: "top", offset: [0, -r] }
        );
      });
    }

    if (activeLayer === "airports") {
      AIRPORTS.forEach(function(a) {
        var r = a.type === "international" ? 6 : a.type === "regional" ? 5 : 3;
        var marker = L.circleMarker([a.lat, a.lng], {
          radius: r,
          fillColor: "#ab47bc",
          color: "#fff",
          weight: 1,
          fillOpacity: 0.8,
        }).addTo(group);
        var label = a.name.match(/\((\w+)\)/);
        label = label ? label[1] : a.name.slice(0, 10);
        marker.bindTooltip(
          '<div style="font-size:11px;line-height:1.4;">' +
          '<strong>' + a.name + '</strong><br/>' +
          '<span style="color:#64748b;">' + a.type + (a.runway_m ? ' · Runway: ' + a.runway_m + 'm' : '') + '</span></div>',
          { direction: "top", offset: [0, -r] }
        );
      });
    }

    if (activeLayer === "pipelines") {
      PIPELINES.forEach(function(pl) {
        var color = pl.status === "operational" ? "#4caf82" : pl.status === "construction" ? "#ffa726" : pl.status === "suspended" ? "#ef5350" : "#78909c";
        var dash = pl.status === "planned" ? "8 6" : pl.status === "suspended" ? "12 4" : null;
        var line = L.polyline(pl.route, {
          color: color,
          weight: 3,
          opacity: 0.7,
          dashArray: dash,
        }).addTo(group);
        line.bindTooltip(
          '<div style="font-size:11px;line-height:1.4;">' +
          '<strong>' + pl.name + '</strong><br/>' +
          '<span style="color:#64748b;">' + pl.status + (pl.capacity_bpd ? ' · ' + (pl.capacity_bpd / 1000).toFixed(0) + 'k bpd' : '') + '</span></div>'
        );
      });
    }

    if (activeLayer === "power") {
      POWER_LINES.forEach(function(pw) {
        var color = pw.status === "existing" ? "#ffa726" : pw.status === "construction" ? "#ffd54f" : "#78909c";
        var dash = pw.status === "planned" ? "6 6" : null;
        var line = L.polyline(pw.route, {
          color: color,
          weight: 2,
          opacity: 0.6,
          dashArray: dash,
        }).addTo(group);
        line.bindTooltip(
          '<div style="font-size:11px;">' +
          '<strong>' + pw.name + '</strong><br/>' +
          '<span style="color:#64748b;">' + pw.voltage_kv + ' kV · ' + pw.status + '</span></div>'
        );
      });
    }

    if (activeLayer === "roads") {
      ROADS.forEach(function(rd) {
        var color = rd.type === "highway" ? "#b0bec5" : "#78909c";
        var weight = rd.type === "highway" ? 3 : 2;
        var dash = rd.status === "partial" ? "6 4" : null;
        var line = L.polyline(rd.route, {
          color: color,
          weight: weight,
          opacity: 0.5,
          dashArray: dash,
        }).addTo(group);
        line.bindTooltip(
          '<div style="font-size:11px;">' +
          '<strong>' + rd.name + '</strong><br/>' +
          '<span style="color:#64748b;">' + rd.type + ' · ' + rd.status + '</span></div>'
        );
      });
    }

    return function() {
      if (layerGroupRef.current) {
        map.removeLayer(layerGroupRef.current);
        layerGroupRef.current = null;
      }
    };
  }, [mapRef, activeLayer, leafletReady]);
}

// Infrastructure legend for the map footer
export function InfraLegend(props) {
  var activeLayer = props.activeLayer;
  if (!activeLayer || activeLayer === "none") return null;

  var legends = {
    ports: [
      { label: "Deepwater", color: "#42a5f5" },
      { label: "LNG Terminal", color: "#42a5f5" },
      { label: "Secondary", color: "#42a5f5" },
    ],
    airports: [
      { label: "International", color: "#ab47bc" },
      { label: "Regional", color: "#ab47bc" },
    ],
    pipelines: [
      { label: "Operational", color: "#4caf82" },
      { label: "Construction", color: "#ffa726" },
      { label: "Planned", color: "#78909c" },
      { label: "Suspended", color: "#ef5350" },
    ],
    power: [
      { label: "Existing", color: "#ffa726" },
      { label: "Under Construction", color: "#ffd54f" },
      { label: "Planned", color: "#78909c" },
    ],
    roads: [
      { label: "Highway", color: "#b0bec5" },
      { label: "Trunk Road", color: "#78909c" },
      { label: "Partially Paved", color: "#78909c" },
    ],
  };

  var items = legends[activeLayer] || [];

  return (
    <div style={{ display: "flex", gap: 12, padding: "9px 16px", borderTop: "1px solid #1a2338", flexWrap: "wrap" }}>
      {items.map(function(item) {
        return (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: item.color }} />
            <span style={{ fontSize: 10, color: "#64748b" }}>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// Development Readiness panel for basin detail drawer
export function DevReadiness(props) {
  var basin = props.basin;
  var score = useMemo(function() { return devReadinessScore(basin); }, [basin]);
  var categories = [
    { key: "port", label: "Nearest Port", icon: "⚓", color: "#42a5f5" },
    { key: "airport", label: "Nearest Airport", icon: "✈", color: "#ab47bc" },
    { key: "pipeline", label: "Nearest Pipeline", icon: "⛽", color: "#ef5350" },
    { key: "power", label: "Power Grid", icon: "⚡", color: "#ffa726" },
    { key: "road", label: "Major Road", icon: "🛣", color: "#78909c" },
  ];

  var scoreColor = score.total >= 60 ? "#34d399" : score.total >= 35 ? "#fbbf24" : "#ef4444";

  return (
    <div style={{ background: "#091019", borderRadius: 10, padding: 14, border: "1px solid #1a2338", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: "#3d4f6a", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Development Readiness
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: scoreColor }}>{score.total}</span>
          <span style={{ fontSize: 9, color: "#475569" }}>/100</span>
        </div>
      </div>
      {/* Score bar */}
      <div style={{ height: 4, background: "#1a2338", borderRadius: 2, marginBottom: 12, overflow: "hidden" }}>
        <div style={{ height: "100%", width: score.total + "%", background: scoreColor, borderRadius: 2 }} />
      </div>
      {/* Category breakdown */}
      {categories.map(function(cat) {
        var d = score.breakdown[cat.key];
        return (
          <div key={cat.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 11 }}>
            <span style={{ width: 16, textAlign: "center" }}>{cat.icon}</span>
            <span style={{ flex: 1, color: "#64748b" }}>{cat.label}</span>
            <span style={{ color: "#e2e8f0", fontWeight: 600, fontVariantNumeric: "tabular-nums", minWidth: 50, textAlign: "right" }}>{d.distance_km} km</span>
            <span style={{ fontSize: 9, color: "#475569", minWidth: 60, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {d.name ? d.name.replace(/ Port| Intl| Airport/g, "").slice(0, 12) : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}
