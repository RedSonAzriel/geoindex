// ══════════════════════════════════════════════════════════════════
// GeoIndex — 3D Isometric Basin Viewer
// Three.js loaded from CDN (same pattern as Leaflet in MapPanel)
// Renders geological cross-section cutaway with formation layers,
// terrain surface, well pins, and depth markers
// ══════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef, useMemo } from "react";

var STATUS_CLR = { Frontier: "#a78bfa", Exploration: "#fbbf24", Appraisal: "#60a5fa", Development: "#34d399" };

// Formation colors — geological period color conventions
var FORMATION_PALETTE = [
  { color: "#8B7355", label: "Overburden / Recent" },
  { color: "#C19A6B", label: "Tertiary" },
  { color: "#A0785A", label: "Cretaceous" },
  { color: "#6B8E6B", label: "Jurassic" },
  { color: "#7B8FA1", label: "Triassic" },
  { color: "#6B5B4F", label: "Permian" },
  { color: "#4A5568", label: "Paleozoic" },
  { color: "#2D3748", label: "Basement" },
];

// Seeded pseudo-random for consistent terrain per basin
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

// Load Three.js + OrbitControls from CDN
function loadThreeJS(callback) {
  if (window.THREE && window.THREE.OrbitControls) {
    callback();
    return;
  }

  // Load Three.js core
  if (!document.getElementById("three-js-cdn")) {
    var script = document.createElement("script");
    script.id = "three-js-cdn";
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r152/three.min.js";
    script.onload = function () {
      // Load OrbitControls after Three.js is ready
      var ctrlScript = document.createElement("script");
      ctrlScript.id = "three-orbit-cdn";
      ctrlScript.src = "https://cdn.jsdelivr.net/npm/three@0.152.0/examples/js/controls/OrbitControls.js";
      ctrlScript.onload = function () {
        callback();
      };
      document.head.appendChild(ctrlScript);
    };
    document.head.appendChild(script);
  } else if (window.THREE && !window.THREE.OrbitControls) {
    var ctrlScript = document.createElement("script");
    ctrlScript.id = "three-orbit-cdn";
    ctrlScript.src = "https://cdn.jsdelivr.net/npm/three@0.152.0/examples/js/controls/OrbitControls.js";
    ctrlScript.onload = function () { callback(); };
    document.head.appendChild(ctrlScript);
  }
}

// Generate terrain heightmap for the block surface
function generateTerrain(segments, basin) {
  var seed = hashString(basin.id);
  var heights = [];
  var isRift = basin.type.indexOf("Rift") >= 0;
  var isPassive = basin.type.indexOf("Passive") >= 0;

  for (var i = 0; i <= segments; i++) {
    heights[i] = [];
    for (var j = 0; j <= segments; j++) {
      var nx = i / segments;
      var ny = j / segments;

      // Base terrain
      var h = 0;

      // Rift basins get a central valley
      if (isRift) {
        var cx = nx - 0.5;
        var cy = ny - 0.5;
        var dist = Math.sqrt(cx * cx + cy * cy);
        h = dist * 0.4 - 0.1;
      }
      // Passive margin basins slope toward one side (simulating continental shelf)
      else if (isPassive) {
        h = (1 - nx) * 0.3 - 0.05;
      }
      // Intracratonic basins are bowl-shaped
      else {
        var cx2 = nx - 0.5;
        var cy2 = ny - 0.5;
        h = (cx2 * cx2 + cy2 * cy2) * 0.6;
      }

      // Add noise
      h += seededRandom(seed + i * 37 + j * 91) * 0.08;
      h += seededRandom(seed + i * 13 + j * 47 + 1000) * 0.04;

      heights[i][j] = h;
    }
  }
  return heights;
}

export default function BasinViewer3D(props) {
  var basin = props.basin;
  var containerRef = useRef(null);
  var rendererRef = useRef(null);
  var sceneRef = useRef(null);
  var cameraRef = useRef(null);
  var controlsRef = useRef(null);
  var frameRef = useRef(null);
  var _ready = useState(false);
  var ready = _ready[0];
  var setReady = _ready[1];
  var _loading = useState(true);
  var loading = _loading[0];
  var setLoading = _loading[1];

  // Load Three.js
  useEffect(function () {
    loadThreeJS(function () {
      setReady(true);
      setLoading(false);
    });
  }, []);

  // Build and run the 3D scene
  useEffect(function () {
    if (!ready || !containerRef.current || !basin) return;

    var THREE = window.THREE;
    var container = containerRef.current;
    var w = container.clientWidth;
    var h = container.clientHeight;

    // ── Renderer
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x080e1a, 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ── Scene
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x080e1a, 0.08);
    sceneRef.current = scene;

    // ── Camera — isometric-style orthographic
    var aspect = w / h;
    var frustum = 5;
    var camera = new THREE.OrthographicCamera(
      -frustum * aspect, frustum * aspect,
      frustum, -frustum,
      0.1, 100
    );
    // Isometric angle
    camera.position.set(6, 5, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // ── Controls
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minPolarAngle = 0.2;
    controlsRef.current = controls;

    // ── Lighting
    var ambLight = new THREE.AmbientLight(0x334155, 0.6);
    scene.add(ambLight);

    var dirLight = new THREE.DirectionalLight(0xf1f5f9, 0.9);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    var rimLight = new THREE.DirectionalLight(0x60a5fa, 0.3);
    rimLight.position.set(-4, 3, -5);
    scene.add(rimLight);

    // ── Build the basin block
    var blockW = 6;
    var blockD = 6;
    var surfaceY = 1.5;

    // Normalize depth range to scene units
    var maxDepthM = basin.depth_m[1];
    var minDepthM = basin.depth_m[0];
    var totalDepthUnits = 3.5; // total height for the subsurface block

    // ── Terrain surface
    var segments = 32;
    var heights = generateTerrain(segments, basin);
    var terrainGeo = new THREE.PlaneGeometry(blockW, blockD, segments, segments);
    var positions = terrainGeo.attributes.position.array;

    for (var i = 0; i <= segments; i++) {
      for (var j = 0; j <= segments; j++) {
        var idx = (i * (segments + 1) + j) * 3;
        positions[idx + 2] = heights[i][j]; // Z is up for plane, we'll rotate
      }
    }
    terrainGeo.computeVertexNormals();

    var terrainMat = new THREE.MeshStandardMaterial({
      color: 0x5a7a5a,
      roughness: 0.85,
      metalness: 0.05,
      flatShading: true,
    });
    var terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.position.y = surfaceY;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // ── Formation layers (stacked boxes with cutaway)
    var formations = basin.formations || [];
    var numLayers = Math.max(formations.length, 3);
    var layerHeight = totalDepthUnits / numLayers;

    // Cutaway — remove a quarter to show internals
    var cutawayShape = new THREE.Shape();
    cutawayShape.moveTo(-blockW / 2, -blockD / 2);
    cutawayShape.lineTo(blockW / 2, -blockD / 2);
    cutawayShape.lineTo(blockW / 2, blockD / 2);
    cutawayShape.lineTo(0, blockD / 2);
    cutawayShape.lineTo(0, 0);
    cutawayShape.lineTo(-blockW / 2, 0);
    cutawayShape.closePath();

    for (var li = 0; li < numLayers; li++) {
      var palette = FORMATION_PALETTE[Math.min(li + 1, FORMATION_PALETTE.length - 1)];
      var hexColor = parseInt(palette.color.replace("#", ""), 16);

      // Vary brightness slightly per layer
      var brightness = 1 - (li / numLayers) * 0.3;

      var extrudeSettings = {
        depth: layerHeight * 0.95,
        bevelEnabled: false,
      };
      var layerGeo = new THREE.ExtrudeGeometry(cutawayShape, extrudeSettings);
      var layerMat = new THREE.MeshStandardMaterial({
        color: hexColor,
        roughness: 0.9,
        metalness: 0.02,
        flatShading: false,
        transparent: true,
        opacity: 0.92,
      });

      var layerMesh = new THREE.Mesh(layerGeo, layerMat);
      layerMesh.rotation.x = -Math.PI / 2;
      layerMesh.position.y = surfaceY - (li + 1) * layerHeight;
      layerMesh.receiveShadow = true;
      layerMesh.castShadow = true;
      scene.add(layerMesh);

      // Formation label on the cut face — using a small plane with canvas texture
      if (li < formations.length) {
        var labelCanvas = document.createElement("canvas");
        labelCanvas.width = 256;
        labelCanvas.height = 32;
        var ctx = labelCanvas.getContext("2d");
        ctx.fillStyle = "transparent";
        ctx.fillRect(0, 0, 256, 32);
        ctx.font = "bold 14px Inter, sans-serif";
        ctx.fillStyle = "#e2e8f0";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        var labelText = formations[li];
        if (labelText.length > 28) labelText = labelText.slice(0, 26) + "…";
        ctx.fillText(labelText, 4, 16);

        var labelTex = new THREE.CanvasTexture(labelCanvas);
        labelTex.minFilter = THREE.LinearFilter;
        var labelMat = new THREE.MeshBasicMaterial({
          map: labelTex,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        var labelGeo = new THREE.PlaneGeometry(2.8, 0.35);
        var labelMesh = new THREE.Mesh(labelGeo, labelMat);
        // Position on the cut face
        labelMesh.position.set(-blockW / 2 + 1.5, surfaceY - li * layerHeight - layerHeight / 2, 0.02);
        labelMesh.rotation.y = 0;
        scene.add(labelMesh);
      }
    }

    // ── Basement layer
    var basementGeo = new THREE.ExtrudeGeometry(cutawayShape, { depth: 0.3, bevelEnabled: false });
    var basementMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 1.0,
      metalness: 0.1,
    });
    var basement = new THREE.Mesh(basementGeo, basementMat);
    basement.rotation.x = -Math.PI / 2;
    basement.position.y = surfaceY - totalDepthUnits - 0.3;
    scene.add(basement);

    // ── Well pins
    var wellCount = Math.min(basin.wells_drilled, 8); // cap visual wells
    var seed = hashString(basin.id);
    for (var wi = 0; wi < wellCount; wi++) {
      var wx = (seededRandom(seed + wi * 73) - 0.5) * (blockW * 0.6);
      var wz = (seededRandom(seed + wi * 37 + 500) - 0.5) * (blockD * 0.4) - blockD * 0.15;
      var wellDepthFrac = 0.4 + seededRandom(seed + wi * 19 + 200) * 0.5;
      var wellH = totalDepthUnits * wellDepthFrac;

      // Well shaft
      var shaftGeo = new THREE.CylinderGeometry(0.03, 0.03, wellH, 6);
      var shaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.3 });
      var shaft = new THREE.Mesh(shaftGeo, shaftMat);
      shaft.position.set(wx, surfaceY - wellH / 2 + 0.3, wz);
      scene.add(shaft);

      // Well head (small sphere on top)
      var headGeo = new THREE.SphereGeometry(0.08, 8, 6);
      var statusColor = parseInt(STATUS_CLR[basin.status].replace("#", ""), 16);
      var headMat = new THREE.MeshStandardMaterial({ color: statusColor, emissive: statusColor, emissiveIntensity: 0.3 });
      var head = new THREE.Mesh(headGeo, headMat);
      head.position.set(wx, surfaceY + 0.38, wz);
      scene.add(head);
    }

    // ── Depth scale bar on the side
    var scaleGeo = new THREE.CylinderGeometry(0.02, 0.02, totalDepthUnits, 4);
    var scaleMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
    var scaleBar = new THREE.Mesh(scaleGeo, scaleMat);
    scaleBar.position.set(blockW / 2 + 0.5, surfaceY - totalDepthUnits / 2, -blockD / 2 - 0.3);
    scene.add(scaleBar);

    // Depth tick marks
    var ticks = [0, 0.25, 0.5, 0.75, 1];
    ticks.forEach(function (t) {
      var tickGeo = new THREE.BoxGeometry(0.15, 0.02, 0.02);
      var tickMat = new THREE.MeshBasicMaterial({ color: 0x475569 });
      var tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.set(blockW / 2 + 0.5, surfaceY - t * totalDepthUnits, -blockD / 2 - 0.3);
      scene.add(tick);

      // Depth label
      var depthVal = Math.round(minDepthM + t * (maxDepthM - minDepthM));
      var depthCanvas = document.createElement("canvas");
      depthCanvas.width = 96;
      depthCanvas.height = 24;
      var dctx = depthCanvas.getContext("2d");
      dctx.font = "bold 12px Inter, monospace";
      dctx.fillStyle = "#64748b";
      dctx.textAlign = "left";
      dctx.textBaseline = "middle";
      dctx.fillText(depthVal + "m", 2, 12);
      var depthTex = new THREE.CanvasTexture(depthCanvas);
      depthTex.minFilter = THREE.LinearFilter;
      var depthLabelMat = new THREE.MeshBasicMaterial({ map: depthTex, transparent: true, side: THREE.DoubleSide });
      var depthLabelGeo = new THREE.PlaneGeometry(0.8, 0.2);
      var depthLabel = new THREE.Mesh(depthLabelGeo, depthLabelMat);
      depthLabel.position.set(blockW / 2 + 1.1, surfaceY - t * totalDepthUnits, -blockD / 2 - 0.3);
      scene.add(depthLabel);
    });

    // ── Grid lines on the ground beneath
    var gridHelper = new THREE.GridHelper(8, 16, 0x1a2338, 0x111b2e);
    gridHelper.position.y = surfaceY - totalDepthUnits - 0.35;
    scene.add(gridHelper);

    // ── Basin name label floating above
    var titleCanvas = document.createElement("canvas");
    titleCanvas.width = 512;
    titleCanvas.height = 48;
    var tctx = titleCanvas.getContext("2d");
    tctx.font = "bold 22px Inter, sans-serif";
    tctx.fillStyle = "#f1f5f9";
    tctx.textAlign = "center";
    tctx.textBaseline = "middle";
    tctx.fillText(basin.name, 256, 24);
    var titleTex = new THREE.CanvasTexture(titleCanvas);
    titleTex.minFilter = THREE.LinearFilter;
    var titleMat = new THREE.MeshBasicMaterial({ map: titleTex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
    var titleGeo = new THREE.PlaneGeometry(4, 0.4);
    var titleMesh = new THREE.Mesh(titleGeo, titleMat);
    titleMesh.position.set(0, surfaceY + 1.2, 0);
    titleMesh.rotation.y = -Math.PI / 4; // face the camera
    scene.add(titleMesh);

    // ── Animate
    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // ── Handle resize
    function onResize() {
      if (!containerRef.current) return;
      var nw = containerRef.current.clientWidth;
      var nh = containerRef.current.clientHeight;
      var na = nw / nh;
      camera.left = -frustum * na;
      camera.right = frustum * na;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    }
    window.addEventListener("resize", onResize);

    return function () {
      window.removeEventListener("resize", onResize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
      // Dispose geometries and materials
      scene.traverse(function (obj) {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      });
    };
  }, [ready, basin]);

  // ── Stats overlay
  var depthRange = basin ? (basin.depth_m[0] + "–" + basin.depth_m[1] + "m") : "";
  var formationCount = basin ? basin.formations.length : 0;

  return (
    <div style={VS.wrapper}>
      {/* Header bar */}
      <div style={VS.header}>
        <div style={VS.headerLeft}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            <path d="M3.27 6.96L12 12.01l8.73-5.05"/>
            <path d="M12 22.08V12"/>
          </svg>
          <span style={VS.headerTitle}>3D Cross-Section</span>
        </div>
        <div style={VS.headerRight}>
          <span style={VS.stat}>{formationCount} formations</span>
          <span style={VS.statDivider}>·</span>
          <span style={VS.stat}>{depthRange} depth</span>
          <span style={VS.statDivider}>·</span>
          <span style={VS.stat}>{basin ? basin.wells_drilled : 0} wells</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div ref={containerRef} style={VS.canvas}>
        {loading && (
          <div style={VS.loadingOverlay}>
            <div style={VS.spinner} />
            <span style={VS.loadingText}>Loading 3D engine...</span>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <div style={VS.controls}>
        <span style={VS.controlHint}>Drag to rotate</span>
        <span style={VS.controlDot}>·</span>
        <span style={VS.controlHint}>Scroll to zoom</span>
        <span style={VS.controlDot}>·</span>
        <span style={VS.controlHint}>Right-drag to pan</span>
      </div>

      {/* Formation legend */}
      <div style={VS.legend}>
        <div style={VS.legendTitle}>Formations</div>
        {(basin ? basin.formations : []).map(function (f, i) {
          var palette = FORMATION_PALETTE[Math.min(i + 1, FORMATION_PALETTE.length - 1)];
          return (
            <div key={f} style={VS.legendItem}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: palette.color, flexShrink: 0 }} />
              <span style={VS.legendLabel}>{f}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

var VS = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    background: "#080e1a",
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #1a2338",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 16px",
    borderBottom: "1px solid #1a2338",
    background: "#0c1322",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#e2e8f0",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  stat: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 500,
  },
  statDivider: {
    color: "#334155",
    fontSize: 10,
  },
  canvas: {
    flex: 1,
    minHeight: 360,
    position: "relative",
    background: "#080e1a",
    cursor: "grab",
  },
  loadingOverlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    background: "#080e1a",
    zIndex: 10,
  },
  spinner: {
    width: 28,
    height: 28,
    border: "2px solid #1a2338",
    borderTopColor: "#34d399",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingText: {
    fontSize: 12,
    color: "#475569",
  },
  controls: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    borderTop: "1px solid #1a2338",
    background: "#0c1322",
  },
  controlHint: {
    fontSize: 10,
    color: "#475569",
    fontWeight: 500,
  },
  controlDot: {
    color: "#293548",
    fontSize: 10,
  },
  legend: {
    padding: "10px 16px 12px",
    borderTop: "1px solid #1a2338",
    background: "#091019",
  },
  legendTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: "#3d4f6a",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: 8,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: "#94a3b8",
  },
};
