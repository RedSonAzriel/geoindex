import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import { INFRA, INFRA_LAYERS } from "../data/infrastructure";
import { InfraSelect, InfraLegend } from "./InfraOverlay";

// MapLibre 6 loads its worker from a separate file; point it at the bundled copy so GeoJSON layers work in dev and production.
maplibregl.setWorkerUrl(workerUrl);

var STATUS_CLR = { Frontier: "#a78bfa", Exploration: "#fbbf24", Appraisal: "#60a5fa", Development: "#34d399" };

// Free imagery: NASA GIBS Blue Marble (public domain) and OpenTopoMap (OSM-based).
var SAT_TILES = ["https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg"];
var TOPO_TILES = [
  "https://a.tile.opentopomap.org/{z}/{x}/{y}.png",
  "https://b.tile.opentopomap.org/{z}/{x}/{y}.png",
  "https://c.tile.opentopomap.org/{z}/{x}/{y}.png"
];

var HOME = { center: [37, 2], zoom: 2.6 };

function buildStyle() {
  return {
    version: 8,
    projection: { type: "globe" },
    glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
    sources: {
      sat: { type: "raster", tiles: SAT_TILES, tileSize: 256, maxzoom: 8, attribution: "Imagery: NASA GIBS / Blue Marble" },
      topo: { type: "raster", tiles: TOPO_TILES, tileSize: 256, maxzoom: 15, attribution: "© OpenTopoMap · © OpenStreetMap contributors" }
    },
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#07101f" } },
      { id: "sat", type: "raster", source: "sat" },
      { id: "topo", type: "raster", source: "topo", layout: { visibility: "none" } }
    ]
  };
}

function basinFeatures(data, sel) {
  return {
    type: "FeatureCollection",
    features: data.map(function (b) {
      var r = Math.max(6, Math.min(18, Math.sqrt(b.area_km2 / 800)));
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [b.lng, b.lat] },
        properties: { id: b.id, name: b.name, color: STATUS_CLR[b.status] || "#94a3b8", r: r, sel: sel && sel.id === b.id ? 1 : 0 }
      };
    })
  };
}

// Builds one layer's features, or every layer's when layerId is "all". Each feature carries its own colour.
function infraFeatures(layerId) {
  var feats = [];
  INFRA_LAYERS.forEach(function (def) {
    if (layerId !== "all" && layerId !== def.id) return;
    (INFRA[def.id] || []).forEach(function (it) {
      if (it.pos) {
        feats.push({ type: "Feature", geometry: { type: "Point", coordinates: [it.pos[1], it.pos[0]] }, properties: { name: it.name, country: it.country || "", kind: def.label, color: def.color } });
      } else if (it.pts) {
        feats.push({
          type: "Feature",
          geometry: { type: "LineString", coordinates: it.pts.map(function (p) { return [p[1], p[0]]; }) },
          properties: { name: it.name || "", kind: def.label, color: def.color, planned: it.status && it.status !== "Operating" ? 1 : 0 }
        });
      }
    });
  });
  return { type: "FeatureCollection", features: feats };
}

function popupHtml(title, lines) {
  return '<div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.5;"><strong style="color:#f1f5f9;">' + title + '</strong>' +
    lines.map(function (l) { return '<br/><span style="color:' + l[1] + ';">' + l[0] + '</span>'; }).join("") + '</div>';
}

var BTN = { width: 34, height: 34, borderRadius: 8, background: "rgba(15,23,42,0.88)", border: "1px solid #1e293b", color: "#94a3b8", cursor: "pointer", fontSize: 15, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 };

export default function MapPanel(props) {
  var data = props.data;
  var sel = props.sel;
  var height = props.height;
  var box = useRef(null);
  var mapRef = useRef(null);
  var onSelRef = useRef(props.onSel);
  var dataRef = useRef(data);
  var spinRef = useRef(true);
  var readyState = useState(false);
  var ready = readyState[0];
  var setReady = readyState[1];
  var spinState = useState(true);
  var spinning = spinState[0];
  var setSpinning = spinState[1];
  var baseState = useState("sat");
  var base = baseState[0];
  var setBase = baseState[1];
  var globeState = useState(true);
  var globe = globeState[0];
  var setGlobe = globeState[1];
  var infraState = useState("none");
  var infraLayer = infraState[0];
  var setInfraLayer = infraState[1];
  var noteState = useState("");
  var note = noteState[0];
  var setNote = noteState[1];

  onSelRef.current = props.onSel;
  dataRef.current = data;

  // Create the map once.
  useEffect(function () {
    if (!box.current || mapRef.current) return undefined;
    var map = new maplibregl.Map({
      container: box.current,
      style: buildStyle(),
      center: HOME.center,
      zoom: HOME.zoom,
      minZoom: 1.2,
      maxZoom: 12,
      attributionControl: { compact: true }
    });
    mapRef.current = map;

    var satErrors = 0;
    map.on("error", function (e) {
      if (e && e.sourceId === "sat") {
        satErrors++;
        if (satErrors === 4) {
          map.setLayoutProperty("sat", "visibility", "none");
          map.setLayoutProperty("topo", "visibility", "visible");
          setBase("topo");
          setNote("Satellite imagery did not load, showing terrain instead.");
        }
      }
    });

    function spin() {
      if (!spinRef.current || !mapRef.current) return;
      if (map.getZoom() > 4) return;
      var c = map.getCenter();
      c.lng -= 2;
      map.easeTo({ center: c, duration: 1000, easing: function (n) { return n; } });
    }
    function stopSpin() {
      if (spinRef.current) { spinRef.current = false; setSpinning(false); }
    }
    map.on("moveend", spin);
    map.on("mousedown", stopSpin);
    map.on("touchstart", stopSpin);
    map.on("wheel", stopSpin);

    map.on("load", function () {
      map.addSource("basins", { type: "geojson", data: basinFeatures(dataRef.current, null) });
      map.addLayer({
        id: "basins-halo", type: "circle", source: "basins", filter: ["==", ["get", "sel"], 1],
        paint: { "circle-radius": ["+", ["get", "r"], 10], "circle-color": "rgba(0,0,0,0)", "circle-stroke-color": ["get", "color"], "circle-stroke-width": 1.5, "circle-stroke-opacity": 0.5 }
      });
      map.addLayer({
        id: "basins-dot", type: "circle", source: "basins",
        paint: {
          "circle-radius": ["case", ["==", ["get", "sel"], 1], ["+", ["get", "r"], 4], ["get", "r"]],
          "circle-color": ["get", "color"],
          "circle-opacity": ["case", ["==", ["get", "sel"], 1], 0.9, 0.65],
          "circle-stroke-color": ["case", ["==", ["get", "sel"], 1], "#ffffff", ["get", "color"]],
          "circle-stroke-width": ["case", ["==", ["get", "sel"], 1], 3, 1.5]
        }
      });
      map.addLayer({
        id: "basins-label", type: "symbol", source: "basins", minzoom: 4.5,
        layout: { "text-field": ["get", "name"], "text-font": ["Open Sans Semibold"], "text-size": 11, "text-offset": [0, 1.6], "text-anchor": "top" },
        paint: { "text-color": "#e2e8f0", "text-halo-color": "#0b1120", "text-halo-width": 1.5 }
      });

      var popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: "geo-popup", offset: 12 });
      map.on("mousemove", "basins-dot", function (e) {
        map.getCanvas().style.cursor = "pointer";
        var f = e.features && e.features[0];
        if (!f) return;
        var b = null;
        var list = dataRef.current;
        for (var i = 0; i < list.length; i++) { if (list[i].id === f.properties.id) { b = list[i]; break; } }
        if (!b) return;
        popup.setLngLat([b.lng, b.lat]).setHTML(popupHtml(b.name, [
          [b.country + " · " + b.status, "#94a3b8"],
          ["Oil P50: " + b.estimated_oil_mmbo.p50.toLocaleString() + " MMBO", "#fbbf24"],
          ["Gas P50: " + b.estimated_gas_tcf.p50.toLocaleString() + " Tcf", "#60a5fa"]
        ])).addTo(map);
      });
      map.on("mouseleave", "basins-dot", function () {
        map.getCanvas().style.cursor = "";
        popup.remove();
      });
      map.on("click", "basins-dot", function (e) {
        var f = e.features && e.features[0];
        if (!f) return;
        var list = dataRef.current;
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === f.properties.id) { onSelRef.current(list[i]); return; }
        }
      });
      setReady(true);
      spin();
    });

    return function () { map.remove(); mapRef.current = null; };
  }, []);

  // Keep basin markers in sync with filters and selection.
  useEffect(function () {
    var map = mapRef.current;
    if (!ready || !map) return;
    var src = map.getSource("basins");
    if (src) src.setData(basinFeatures(data, sel));
  }, [ready, data, sel]);

  // Fly to the selected basin, leaving room for the drawer.
  useEffect(function () {
    var map = mapRef.current;
    if (!ready || !map || !sel) return;
    spinRef.current = false;
    setSpinning(false);
    map.flyTo({ center: [sel.lng, sel.lat], zoom: 5.5, duration: 1400, padding: { top: 0, bottom: 0, left: 0, right: 420 } });
  }, [ready, sel]);

  // Infrastructure overlay.
  useEffect(function () {
    var map = mapRef.current;
    if (!ready || !map) return undefined;
    function clear() {
      ["infra-pts", "infra-solid", "infra-dash"].forEach(function (id) { if (map.getLayer(id)) map.removeLayer(id); });
      if (map.getSource("infra")) map.removeSource("infra");
    }
    clear();
    if (infraLayer !== "all") {
      var known = false;
      INFRA_LAYERS.forEach(function (l) { if (l.id === infraLayer) known = true; });
      if (!known) return undefined;
    }
    map.addSource("infra", { type: "geojson", data: infraFeatures(infraLayer) });
    map.addLayer({ id: "infra-solid", type: "line", source: "infra", filter: ["all", ["==", ["geometry-type"], "LineString"], ["==", ["get", "planned"], 0]], paint: { "line-color": ["get", "color"], "line-width": 2.5, "line-opacity": 0.9 } }, "basins-halo");
    map.addLayer({ id: "infra-dash", type: "line", source: "infra", filter: ["all", ["==", ["geometry-type"], "LineString"], ["==", ["get", "planned"], 1]], paint: { "line-color": ["get", "color"], "line-width": 2.5, "line-opacity": 0.9, "line-dasharray": [2, 2] } }, "basins-halo");
    map.addLayer({ id: "infra-pts", type: "circle", source: "infra", filter: ["==", ["geometry-type"], "Point"], paint: { "circle-radius": 5, "circle-color": ["get", "color"], "circle-stroke-color": "#0b1120", "circle-stroke-width": 1.5 } }, "basins-halo");
    var tip = new maplibregl.Popup({ closeButton: false, closeOnClick: false, className: "geo-popup", offset: 8 });
    function over(e) {
      var f = e.features && e.features[0];
      if (!f) return;
      tip.setLngLat(f.geometry.coordinates).setHTML(popupHtml(f.properties.name, [[f.properties.kind + (f.properties.country ? " \u00B7 " + f.properties.country : ""), "#94a3b8"]])).addTo(map);
    }
    function out() { tip.remove(); }
    map.on("mouseenter", "infra-pts", over);
    map.on("mouseleave", "infra-pts", out);
    return function () {
      tip.remove();
      if (!mapRef.current) return;
      map.off("mouseenter", "infra-pts", over);
      map.off("mouseleave", "infra-pts", out);
      clear();
    };
  }, [ready, infraLayer]);

  function toggleSpin() {
    var next = !spinRef.current;
    spinRef.current = next;
    setSpinning(next);
    var map = mapRef.current;
    if (next && map) { if (map.getZoom() > 4) map.zoomTo(3, { duration: 800 }); map.fire("moveend"); }
  }
  function goHome() {
    var map = mapRef.current;
    if (map) map.flyTo({ center: HOME.center, zoom: HOME.zoom, duration: 1400, padding: { top: 0, bottom: 0, left: 0, right: 0 } });
  }
  function switchBase() {
    var map = mapRef.current;
    if (!map) return;
    var next = base === "sat" ? "topo" : "sat";
    map.setLayoutProperty("sat", "visibility", next === "sat" ? "visible" : "none");
    map.setLayoutProperty("topo", "visibility", next === "topo" ? "visible" : "none");
    setBase(next);
    setNote("");
  }
  function switchProjection() {
    var map = mapRef.current;
    if (!map) return;
    var next = !globe;
    map.setProjection({ type: next ? "globe" : "mercator" });
    setGlobe(next);
  }

  var card = { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 12, overflow: "hidden" };
  return (
    <div style={card}>
      <style>{`
        .geo-popup .maplibregl-popup-content{background:rgba(15,23,42,.94);border:1px solid rgba(51,65,85,.6);border-radius:8px;padding:8px 12px;box-shadow:0 8px 24px rgba(0,0,0,.4);color:#e2e8f0}
        .geo-popup .maplibregl-popup-tip{display:none}
        .maplibregl-ctrl-attrib{background:rgba(15,23,42,.7)!important;color:#64748b!important;font-size:9px}
        .maplibregl-ctrl-attrib a{color:#64748b!important}
      `}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid #1a2338" }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Basin Map</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <InfraSelect value={infraLayer} onChange={setInfraLayer} />
          <span style={{ fontSize: 10, fontWeight: 600, color: "#34d399", background: "#34d39912", padding: "3px 9px", borderRadius: 6, border: "1px solid #34d39920" }}>{data.length} results</span>
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <div ref={box} style={{ width: "100%", height: height || 520, background: "#07101f", isolation: "isolate", position: "relative", zIndex: 0 }} />
        <div style={{ position: "absolute", right: 12, bottom: 28, display: "flex", flexDirection: "column", gap: 6, zIndex: 1 }}>
          <button style={BTN} title="Zoom in" onClick={function () { if (mapRef.current) mapRef.current.zoomIn(); }}>+</button>
          <button style={BTN} title="Zoom out" onClick={function () { if (mapRef.current) mapRef.current.zoomOut(); }}>{"−"}</button>
          <button style={Object.assign({}, BTN, spinning ? { color: "#34d399", borderColor: "#34d39950" } : {})} title={spinning ? "Stop rotation" : "Rotate globe"} onClick={toggleSpin}>{"↻"}</button>
          <button style={BTN} title="Reset view" onClick={goHome}>{"⌂"}</button>
          <button style={BTN} title={globe ? "Switch to flat map" : "Switch to globe"} onClick={switchProjection}>{globe ? "□" : "○"}</button>
          <button style={Object.assign({}, BTN, { fontSize: 10, fontWeight: 600 })} title="Switch basemap" onClick={switchBase}>{base === "sat" ? "TOPO" : "SAT"}</button>
        </div>
        {note && <div style={{ position: "absolute", left: 12, top: 12, background: "rgba(15,23,42,.9)", border: "1px solid #1e293b", color: "#fbbf24", fontSize: 11, padding: "6px 10px", borderRadius: 8, zIndex: 1 }}>{note}</div>}
      </div>
      <div style={{ display: "flex", gap: 16, padding: "10px 18px", borderTop: "1px solid #1a2338", flexWrap: "wrap" }}>
        {Object.keys(STATUS_CLR).map(function (s) {
          var c = STATUS_CLR[s];
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: c, boxShadow: "0 0 6px " + c + "50" }} />
              <span style={{ fontSize: 10, color: "#94a3b8" }}>{s}</span>
            </div>
          );
        })}
      </div>
      <InfraLegend activeLayer={infraLayer} />
    </div>
  );
}
