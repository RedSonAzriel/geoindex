// Regional infrastructure for development-readiness screening.
// ALL COORDINATES ARE APPROXIMATE and pipeline, power and road routes are SCHEMATIC polylines.
// Status values reflect general knowledge and may be out of date. Verify before relying on them.

export var INFRA_LAYERS = [
  { id: "ports", label: "Ports", color: "#60a5fa" },
  { id: "airports", label: "Airports", color: "#e2e8f0" },
  { id: "pipelines", label: "Pipelines", color: "#fbbf24" },
  { id: "power", label: "Power lines", color: "#f472b6" },
  { id: "roads", label: "Road corridors", color: "#34d399" }
];

export var INFRA = {
  ports: [
    { name: "Mombasa", country: "Kenya", pos: [-4.05, 39.67] },
    { name: "Lamu", country: "Kenya", pos: [-2.27, 40.90] },
    { name: "Kisumu", country: "Kenya", pos: [-0.10, 34.75] },
    { name: "Dar es Salaam", country: "Tanzania", pos: [-6.82, 39.29] },
    { name: "Tanga", country: "Tanzania", pos: [-5.07, 39.10] },
    { name: "Mtwara", country: "Tanzania", pos: [-10.27, 40.18] },
    { name: "Pemba", country: "Mozambique", pos: [-12.97, 40.52] },
    { name: "Nacala", country: "Mozambique", pos: [-14.54, 40.69] },
    { name: "Beira", country: "Mozambique", pos: [-19.83, 34.84] },
    { name: "Maputo", country: "Mozambique", pos: [-25.97, 32.57] },
    { name: "Afungi (LNG site)", country: "Mozambique", pos: [-10.80, 40.50] },
    { name: "Berbera", country: "Somalia", pos: [10.44, 45.01] },
    { name: "Mogadishu", country: "Somalia", pos: [2.03, 45.34] },
    { name: "Bosaso", country: "Somalia", pos: [11.28, 49.18] },
    { name: "Kismayo", country: "Somalia", pos: [-0.36, 42.55] },
    { name: "Djibouti (serves Ethiopia)", country: "Djibouti", pos: [11.59, 43.15] },
    { name: "Massawa", country: "Eritrea", pos: [15.61, 39.45] },
    { name: "Assab", country: "Eritrea", pos: [13.01, 42.74] },
    { name: "Walvis Bay", country: "Namibia", pos: [-22.95, 14.50] },
    { name: "Luderitz", country: "Namibia", pos: [-26.65, 15.16] },
    { name: "Saldanha Bay", country: "South Africa", pos: [-33.03, 17.95] },
    { name: "Cape Town", country: "South Africa", pos: [-33.91, 18.43] },
    { name: "Mossel Bay", country: "South Africa", pos: [-34.18, 22.14] },
    { name: "Ngqura (Coega)", country: "South Africa", pos: [-33.80, 25.68] },
    { name: "Durban", country: "South Africa", pos: [-29.87, 31.03] },
    { name: "Richards Bay", country: "South Africa", pos: [-28.80, 32.08] },
    { name: "Toamasina", country: "Madagascar", pos: [-18.15, 49.42] },
    { name: "Toliara", country: "Madagascar", pos: [-23.35, 43.67] },
    { name: "Mahajanga", country: "Madagascar", pos: [-15.72, 46.31] }
  ],
  airports: [
    { name: "Nairobi (JKIA)", country: "Kenya", pos: [-1.32, 36.93] },
    { name: "Mombasa (Moi)", country: "Kenya", pos: [-4.03, 39.59] },
    { name: "Lodwar", country: "Kenya", pos: [3.12, 35.61] },
    { name: "Lamu (Manda)", country: "Kenya", pos: [-2.25, 40.91] },
    { name: "Dar es Salaam (Nyerere)", country: "Tanzania", pos: [-6.88, 39.20] },
    { name: "Kilimanjaro", country: "Tanzania", pos: [-3.43, 37.07] },
    { name: "Mtwara", country: "Tanzania", pos: [-10.34, 40.18] },
    { name: "Pemba", country: "Mozambique", pos: [-12.99, 40.52] },
    { name: "Maputo", country: "Mozambique", pos: [-25.92, 32.57] },
    { name: "Beira", country: "Mozambique", pos: [-19.80, 34.91] },
    { name: "Addis Ababa (Bole)", country: "Ethiopia", pos: [8.98, 38.80] },
    { name: "Mogadishu (Aden Adde)", country: "Somalia", pos: [2.01, 45.31] },
    { name: "Hargeisa", country: "Somalia", pos: [9.52, 44.09] },
    { name: "Kigali", country: "Rwanda", pos: [-1.97, 30.14] },
    { name: "Asmara", country: "Eritrea", pos: [15.29, 38.91] },
    { name: "Windhoek (Hosea Kutako)", country: "Namibia", pos: [-22.48, 17.47] },
    { name: "Walvis Bay", country: "Namibia", pos: [-22.98, 14.65] },
    { name: "Rundu", country: "Namibia", pos: [-17.96, 19.72] },
    { name: "Cape Town", country: "South Africa", pos: [-33.97, 18.60] },
    { name: "George", country: "South Africa", pos: [-34.00, 22.38] },
    { name: "Johannesburg (O. R. Tambo)", country: "South Africa", pos: [-26.13, 28.24] },
    { name: "Durban (King Shaka)", country: "South Africa", pos: [-29.61, 31.12] },
    { name: "Gaborone", country: "Botswana", pos: [-24.56, 25.92] },
    { name: "Maun", country: "Botswana", pos: [-19.97, 23.43] },
    { name: "Harare", country: "Zimbabwe", pos: [-17.93, 31.09] },
    { name: "Antananarivo (Ivato)", country: "Madagascar", pos: [-18.80, 47.48] }
  ],
  pipelines: [
    { name: "EACOP (Hoima to Tanga)", status: "Construction or commissioning", pts: [[1.43, 31.35], [0.0, 31.6], [-1.5, 31.9], [-3.2, 33.2], [-4.8, 35.0], [-5.0, 37.0], [-5.07, 39.10]] },
    { name: "Lokichar to Lamu crude (LAPSSET)", status: "Planned", pts: [[2.38, 35.64], [0.35, 37.58], [-0.45, 39.65], [-2.27, 40.90]] },
    { name: "Mombasa to Kisumu products (KPC)", status: "Operating", pts: [[-4.05, 39.67], [-2.5, 38.0], [-1.29, 36.82], [0.52, 35.27], [-0.10, 34.75]] },
    { name: "Mtwara to Dar es Salaam gas", status: "Operating", pts: [[-10.27, 40.18], [-8.5, 39.6], [-6.82, 39.29]] },
    { name: "Songo Songo to Dar es Salaam gas", status: "Operating", pts: [[-8.5, 39.5], [-6.82, 39.29]] },
    { name: "Calub to Djibouti gas", status: "Proposed", pts: [[6.9, 44.0], [9.6, 42.0], [11.59, 43.15]] },
    { name: "Temane to Secunda gas (ROMPCO)", status: "Operating", pts: [[-21.9, 35.1], [-23.5, 32.5], [-25.0, 30.5], [-26.5, 29.2]] },
    { name: "Tazama (Dar es Salaam to Ndola)", status: "Operating", pts: [[-6.82, 39.29], [-8.0, 36.0], [-9.0, 33.5], [-12.97, 28.64]] },
    { name: "Lily gas pipeline (Durban to Gauteng)", status: "Operating", pts: [[-29.87, 31.03], [-28.6, 30.4], [-27.4, 29.6], [-26.3, 28.4]] },
    { name: "Durban to Gauteng products (NMPP)", status: "Operating", pts: [[-29.87, 31.03], [-29.0, 30.2], [-27.6, 29.3], [-26.2, 28.2]] },
    { name: "Beira to Feruka products", status: "Operating", pts: [[-19.83, 34.84], [-19.3, 33.6], [-18.97, 32.67]] },
    { name: "Offshore gas to Mossel Bay GTL", status: "Operating", pts: [[-34.75, 22.15], [-34.45, 22.12], [-34.18, 22.14]] },
    { name: "Kudu gas to power (Oranjemund)", status: "Proposed", pts: [[-28.55, 14.95], [-28.55, 16.43]] }
  ],
  power: [
    { name: "Ethiopia to Kenya HVDC", status: "Operating", pts: [[6.85, 37.75], [3.52, 39.05], [0.35, 37.58], [-1.07, 36.35]] },
    { name: "Isinya to Arusha 400 kV", status: "Operating", pts: [[-1.9, 36.85], [-3.37, 36.68]] },
    { name: "Tanzania backbone 400 kV", status: "Operating", pts: [[-7.77, 35.7], [-6.17, 35.74], [-4.8, 34.75], [-3.66, 33.42]] },
    { name: "Cahora Bassa to Apollo HVDC", status: "Operating", pts: [[-15.6, 32.7], [-17.8, 31.0], [-22.2, 30.0], [-26.0, 28.2]] },
    { name: "GERD to Holeta 500 kV", status: "Operating", pts: [[11.21, 35.09], [10.2, 36.8], [9.06, 38.5]] },
    { name: "Tororo to Lessos 220 kV", status: "Operating", pts: [[0.69, 34.18], [0.1, 35.2]] },
    { name: "Lake Turkana wind to Suswa 220 kV", status: "Operating", pts: [[2.75, 36.72], [0.5, 36.5], [-1.07, 36.35]] },
    { name: "Tanzania to Zambia (TAZA) 330 kV", status: "Operating", pts: [[-8.9, 33.46], [-10.2, 31.2]] },
    { name: "Ethiopia to Djibouti 230 kV", status: "Operating", pts: [[9.6, 41.86], [11.59, 43.15]] },
    { name: "Ethiopia to Sudan 230 kV", status: "Operating", pts: [[11.6, 37.4], [12.95, 36.2], [14.03, 35.4]] },
    { name: "Caprivi Link HVDC (Zambezi to Gerus)", status: "Operating", pts: [[-17.5, 24.25], [-17.9, 21.5], [-18.6, 19.0], [-20.2, 16.9]] },
    { name: "Namibia to South Africa 400 kV", status: "Operating", pts: [[-22.6, 17.1], [-25.5, 18.0], [-28.5, 19.7], [-29.6, 20.6]] },
    { name: "Zimbabwe to Botswana to South Africa 400 kV", status: "Operating", pts: [[-20.15, 28.6], [-21.2, 27.5], [-22.5, 27.2], [-23.7, 27.6]] }
  ],
  roads: [
    { name: "Northern Corridor (Mombasa to Malaba)", status: "Operating", pts: [[-4.05, 39.67], [-1.29, 36.82], [0.52, 35.27], [0.63, 34.28]] },
    { name: "Central Corridor (Dar to Mwanza)", status: "Operating", pts: [[-6.82, 39.29], [-6.82, 37.66], [-6.17, 35.74], [-3.66, 33.42], [-2.52, 32.9]] },
    { name: "Tanga to Arusha", status: "Operating", pts: [[-5.07, 39.10], [-5.15, 38.45], [-3.35, 37.34], [-3.37, 36.68]] },
    { name: "LAPSSET (Lamu to Lodwar)", status: "Partly built", pts: [[-2.27, 40.90], [-0.45, 39.65], [0.35, 37.58], [1.1, 36.7], [2.38, 35.64], [3.12, 35.6]] },
    { name: "Beira Corridor", status: "Operating", pts: [[-19.83, 34.84], [-19.1, 33.5], [-18.97, 32.67]] },
    { name: "Nacala Corridor", status: "Operating", pts: [[-14.54, 40.69], [-15.12, 39.27], [-14.8, 36.54]] },
    { name: "Pemba to Palma", status: "Operating", pts: [[-12.97, 40.52], [-12.26, 40.12], [-11.35, 40.35], [-10.78, 40.47]] },
    { name: "Djibouti to Addis Ababa", status: "Operating", pts: [[11.59, 43.15], [9.6, 41.86], [8.99, 40.17], [9.03, 38.74]] },
    { name: "Trans-Kalahari Corridor", status: "Operating", pts: [[-22.95, 14.50], [-22.57, 17.08], [-22.4, 20.0], [-24.65, 25.91], [-25.75, 28.19]] },
    { name: "Trans-Caprivi Corridor", status: "Operating", pts: [[-22.95, 14.50], [-19.6, 17.0], [-17.92, 19.77], [-17.5, 24.27]] },
    { name: "Maputo Corridor", status: "Operating", pts: [[-25.97, 32.57], [-25.47, 30.97], [-26.2, 28.04]] },
    { name: "N2 coastal (Cape Town to Durban)", status: "Operating", pts: [[-33.92, 18.42], [-34.18, 22.14], [-33.96, 25.6], [-32.98, 27.87], [-29.86, 31.0]] },
    { name: "RN7 (Antananarivo to Toliara)", status: "Operating", pts: [[-18.88, 47.51], [-21.45, 47.08], [-23.35, 43.67]] }
  ]
};

// ---------- proximity and readiness scoring ----------
var SCORE_CFG = [
  { key: "ports", label: "Port", weight: 30, maxKm: 600 },
  { key: "pipelines", label: "Pipeline", weight: 25, maxKm: 400 },
  { key: "power", label: "Power grid", weight: 20, maxKm: 300 },
  { key: "roads", label: "Road corridor", weight: 15, maxKm: 200 },
  { key: "airports", label: "Airport", weight: 10, maxKm: 300 }
];

function toRad(d) { return d * Math.PI / 180; }

export function haversineKm(a, b) {
  var dLat = toRad(b[0] - a[0]);
  var dLng = toRad(b[1] - a[1]);
  var h = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Point-to-segment distance using a local equirectangular projection (fine for a few hundred km at these latitudes).
function segDistKm(p, a, b) {
  var kx = 111.32 * Math.cos(toRad(p[0]));
  var ky = 110.57;
  var ax = (a[1] - p[1]) * kx;
  var ay = (a[0] - p[0]) * ky;
  var bx = (b[1] - p[1]) * kx;
  var by = (b[0] - p[0]) * ky;
  var dx = bx - ax;
  var dy = by - ay;
  var len2 = dx * dx + dy * dy;
  var t = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2));
  var cx = ax + t * dx;
  var cy = ay + t * dy;
  return Math.sqrt(cx * cx + cy * cy);
}

export function nearestInfra(lat, lng, key) {
  var p = [lat, lng];
  var list = INFRA[key];
  var best = { dist: Infinity, name: "" };
  var i;
  var j;
  var d;
  for (i = 0; i < list.length; i++) {
    var it = list[i];
    if (it.pos) {
      d = haversineKm(p, it.pos);
      if (d < best.dist) best = { dist: d, name: it.name };
    } else {
      for (j = 0; j < it.pts.length - 1; j++) {
        d = segDistKm(p, it.pts[j], it.pts[j + 1]);
        if (d < best.dist) best = { dist: d, name: it.name };
      }
    }
  }
  return best;
}

// Development readiness 0-100 from distance to the nearest port, pipeline, grid line, road corridor and airport.
// Uses the basin centroid, so it is a coarse screening score and not a site assessment.
export function readinessScore(lat, lng) {
  var total = 0;
  var parts = [];
  for (var i = 0; i < SCORE_CFG.length; i++) {
    var c = SCORE_CFG[i];
    var n = nearestInfra(lat, lng, c.key);
    var pts = c.weight * Math.max(0, 1 - n.dist / c.maxKm);
    total += pts;
    parts.push({ key: c.key, label: c.label, name: n.name, dist: Math.round(n.dist), pts: Math.round(pts), weight: c.weight });
  }
  return { score: Math.round(total), parts: parts };
}
