// Infrastructure data for GeoIndex planning overlays
// Sources: World Bank AICD, AfTS-Db (Oxford/nismod), Energydata.info, operator disclosures
// Coverage: 7 target countries + key regional context

export const INFRA_LAYERS = [
  { key: "none", label: "None" },
  { key: "ports", label: "Ports & Terminals", icon: "⚓", color: "#42a5f5" },
  { key: "airports", label: "Airports", icon: "✈", color: "#ab47bc" },
  { key: "pipelines", label: "Pipelines & LNG", icon: "⛽", color: "#ef5350" },
  { key: "power", label: "Power Grid", icon: "⚡", color: "#ffa726" },
  { key: "roads", label: "Major Roads", icon: "🛣", color: "#78909c" },
];

// ═══════════════════════════════════════════════════════════════
// PORTS — deepwater, LNG terminals, oil export terminals
// ═══════════════════════════════════════════════════════════════
export const PORTS = [
  // Kenya
  { id: "p_mombasa", name: "Mombasa Port", country: "Kenya", lat: -4.04, lng: 39.66, type: "deepwater", capacity_mt: 34, notes: "East Africa's largest port. Container & bulk." },
  { id: "p_lamu", name: "Lamu Port (LAPSSET)", country: "Kenya", lat: -2.27, lng: 40.90, type: "deepwater", capacity_mt: 5, notes: "New deepwater port, Phase 1 operational. LAPSSET corridor." },
  // Tanzania
  { id: "p_dar", name: "Dar es Salaam Port", country: "Tanzania", lat: -6.83, lng: 39.29, type: "deepwater", capacity_mt: 16, notes: "Tanzania's main port. Handles 90% of trade." },
  { id: "p_tanga", name: "Tanga Port", country: "Tanzania", lat: -5.07, lng: 39.10, type: "secondary", capacity_mt: 1, notes: "Secondary port, sisal/agricultural exports." },
  { id: "p_mtwara", name: "Mtwara Port", country: "Tanzania", lat: -10.27, lng: 40.18, type: "secondary", capacity_mt: 0.5, notes: "Southern Tanzania. Near Mnazi Bay gas." },
  // Mozambique
  { id: "p_maputo", name: "Maputo Port", country: "Mozambique", lat: -25.97, lng: 32.57, type: "deepwater", capacity_mt: 20, notes: "Major container & coal export terminal." },
  { id: "p_beira", name: "Beira Port", country: "Mozambique", lat: -19.84, lng: 34.87, type: "deepwater", capacity_mt: 12, notes: "Central Mozambique corridor hub." },
  { id: "p_nacala", name: "Nacala Port", country: "Mozambique", lat: -14.54, lng: 40.69, type: "deepwater", capacity_mt: 5, notes: "Natural deepwater harbor. Coal rail link." },
  { id: "p_pemba_mz", name: "Pemba Port", country: "Mozambique", lat: -12.97, lng: 40.52, type: "support_base", capacity_mt: 1, notes: "Rovuma LNG offshore support base." },
  { id: "p_palma", name: "Afungi LNG Terminal", country: "Mozambique", lat: -10.75, lng: 40.38, type: "lng", capacity_mt: 15, notes: "TotalEnergies/ENI Mozambique LNG site." },
  // Ethiopia (landlocked — uses Djibouti)
  { id: "p_djibouti", name: "Doraleh Port", country: "Djibouti", lat: 11.60, lng: 43.13, type: "deepwater", capacity_mt: 25, notes: "Ethiopia's primary maritime gateway. Multi-purpose." },
  { id: "p_djibouti_lng", name: "Djibouti LNG Terminal", country: "Djibouti", lat: 11.55, lng: 43.10, type: "lng", capacity_mt: 3, notes: "Planned LNG import/export facility." },
  // Somalia
  { id: "p_mogadishu", name: "Mogadishu Port", country: "Somalia", lat: 2.03, lng: 45.35, type: "secondary", capacity_mt: 3, notes: "Main Somali port. Limited capacity." },
  { id: "p_berbera", name: "Berbera Port", country: "Somalia", lat: 10.44, lng: 45.02, type: "deepwater", capacity_mt: 8, notes: "DP World modernized. Somaliland corridor." },
  { id: "p_bosaso", name: "Bosaso Port", country: "Somalia", lat: 11.28, lng: 49.18, type: "secondary", capacity_mt: 1, notes: "Puntland's main port." },
  // Eritrea
  { id: "p_massawa", name: "Massawa Port", country: "Eritrea", lat: 15.61, lng: 39.45, type: "secondary", capacity_mt: 2, notes: "Red Sea port. Limited modern infrastructure." },
  { id: "p_assab", name: "Assab Port", country: "Eritrea", lat: 13.01, lng: 42.74, type: "secondary", capacity_mt: 1, notes: "Southern Red Sea. UAE military base nearby." },
  // Rwanda (landlocked — nearest port context)
  { id: "p_kigali_dryport", name: "Kigali Dry Port", country: "Rwanda", lat: -1.97, lng: 30.10, type: "dry_port", capacity_mt: 0.5, notes: "Inland container depot. Links to Dar/Mombasa." },
];

// ═══════════════════════════════════════════════════════════════
// AIRPORTS — international & regional with paved runways
// ═══════════════════════════════════════════════════════════════
export const AIRPORTS = [
  // Kenya
  { id: "a_jkia", name: "Jomo Kenyatta Intl (NBO)", country: "Kenya", lat: -1.32, lng: 36.93, type: "international", runway_m: 4117, notes: "East Africa's primary hub." },
  { id: "a_moi", name: "Moi Intl (MBA)", country: "Kenya", lat: -4.03, lng: 39.59, type: "international", runway_m: 3350, notes: "Mombasa coastal hub." },
  { id: "a_lokichar", name: "Lokichar Airstrip", country: "Kenya", lat: 2.52, lng: 35.73, type: "airstrip", runway_m: 1500, notes: "Tullow Oil operations. Unpaved." },
  // Tanzania
  { id: "a_jnia", name: "Julius Nyerere Intl (DAR)", country: "Tanzania", lat: -6.88, lng: 39.20, type: "international", runway_m: 3660, notes: "Dar es Salaam main hub." },
  { id: "a_kia", name: "Kilimanjaro Intl (JRO)", country: "Tanzania", lat: -3.43, lng: 37.07, type: "international", runway_m: 3607, notes: "Northern Tanzania hub." },
  // Mozambique
  { id: "a_maputo", name: "Maputo Intl (MPM)", country: "Mozambique", lat: -26.04, lng: 32.57, type: "international", runway_m: 3700, notes: "Capital city main airport." },
  { id: "a_beira", name: "Beira Airport (BEW)", country: "Mozambique", lat: -19.80, lng: 34.91, type: "regional", runway_m: 2400, notes: "Central corridor access." },
  { id: "a_nacala", name: "Nacala Airport", country: "Mozambique", lat: -14.49, lng: 40.71, type: "regional", runway_m: 2000, notes: "Northern Mozambique." },
  // Ethiopia
  { id: "a_bole", name: "Bole Intl (ADD)", country: "Ethiopia", lat: 8.98, lng: 38.80, type: "international", runway_m: 3800, notes: "Ethiopian Airlines hub. Africa's busiest." },
  { id: "a_dire_dawa", name: "Dire Dawa (DIR)", country: "Ethiopia", lat: 9.62, lng: 41.85, type: "regional", runway_m: 2800, notes: "Eastern Ethiopia. Near Ogaden Basin." },
  // Somalia
  { id: "a_mogadishu", name: "Aden Abdulle Intl (MGQ)", country: "Somalia", lat: 2.01, lng: 45.30, type: "international", runway_m: 3200, notes: "Mogadishu. AMISOM secured." },
  { id: "a_hargeisa", name: "Egal Intl (HGA)", country: "Somalia", lat: 9.52, lng: 44.09, type: "regional", runway_m: 2800, notes: "Somaliland capital." },
  // Eritrea
  { id: "a_asmara", name: "Asmara Intl (ASM)", country: "Eritrea", lat: 15.29, lng: 38.91, type: "international", runway_m: 3000, notes: "Capital city. Limited international service." },
  // Rwanda
  { id: "a_kigali", name: "Kigali Intl (KGL)", country: "Rwanda", lat: -1.97, lng: 30.14, type: "international", runway_m: 3500, notes: "RwandAir hub." },
  // Djibouti
  { id: "a_djibouti", name: "Djibouti–Ambouli (JIB)", country: "Djibouti", lat: 11.55, lng: 43.16, type: "international", runway_m: 3200, notes: "Military & commercial. US/France/China bases." },
];

// ═══════════════════════════════════════════════════════════════
// PIPELINES — oil, gas, LNG, planned
// ═══════════════════════════════════════════════════════════════
export const PIPELINES = [
  { id: "pl_eacop", name: "EACOP (East African Crude Oil Pipeline)", status: "construction", type: "oil", length_km: 1443, diameter_in: 24, route: [[0.5,30.5],[0.2,31],[-1,33],[-3,35],[-5.1,39.1]], notes: "Uganda Albertine → Tanga Port. TotalEnergies/CNOOC. Expected 2025-26." },
  { id: "pl_moz_lng", name: "Rovuma Area 1 LNG Pipeline", status: "suspended", type: "gas", length_km: 45, diameter_in: 32, route: [[-13.5,42],[-12.5,40.5],[-10.8,40.4]], notes: "Offshore Rovuma → Afungi LNG. TotalEnergies. Force majeure 2021." },
  { id: "pl_coral_flng", name: "Coral Sul FLNG Riser", status: "operational", type: "gas", length_km: 20, diameter_in: 16, route: [[-14.2,42.5],[-14,42.2]], notes: "ENI Coral South FLNG. 3.4 MTPA. Producing since 2022." },
  { id: "pl_songo", name: "Songo Songo Gas Pipeline", status: "operational", type: "gas", length_km: 232, diameter_in: 16, route: [[-9.5,39.6],[-8.5,39.2],[-6.9,39.3]], notes: "Songo Songo Island → Dar es Salaam. Operational since 2004." },
  { id: "pl_mnazi", name: "Mnazi Bay Gas Pipeline", status: "operational", type: "gas", length_km: 36, diameter_in: 12, route: [[-10.3,40.2],[-10.27,40.18]], notes: "Mnazi Bay → Mtwara. Wentworth Resources." },
  { id: "pl_calub", name: "Calub-Hilala Gas Pipeline", status: "planned", type: "gas", length_km: 900, diameter_in: 20, route: [[6.5,44.5],[8,42],[11.5,43.1]], notes: "Ogaden → Djibouti. Planned export route. POLY-GCL." },
  { id: "pl_lapsset", name: "LAPSSET Oil Pipeline", status: "planned", type: "oil", length_km: 1200, diameter_in: 20, route: [[2.6,35.8],[2,36.5],[0,38],[-2.3,40.9]], notes: "Lokichar → Lamu. Tullow/Kenya. Stalled." },
  { id: "pl_pande", name: "Pande-Temane Gas Pipeline", status: "operational", type: "gas", length_km: 900, diameter_in: 26, route: [[-21.5,35],[-23,35.2],[-25.8,32.6]], notes: "Pande/Temane → Sasol Secunda (RSA). Cross-border." },
];

// ═══════════════════════════════════════════════════════════════
// POWER GRID — major transmission corridors (simplified)
// ═══════════════════════════════════════════════════════════════
export const POWER_LINES = [
  // Kenya backbone (220-400kV)
  { id: "pw_kenya_ns", name: "Kenya N-S Backbone", voltage_kv: 400, status: "existing", route: [[-1.3,36.9],[-0.1,36.2],[0.5,35.3],[1.5,37.5]], notes: "Nairobi-Naivasha-Eldoret 400kV." },
  { id: "pw_kenya_coast", name: "Kenya Coast Line", voltage_kv: 220, status: "existing", route: [[-1.3,36.9],[-3.5,38.5],[-4,39.6]], notes: "Nairobi-Voi-Mombasa 220kV." },
  // Tanzania
  { id: "pw_tz_backbone", name: "Tanzania Backbone", voltage_kv: 400, status: "existing", route: [[-6.8,39.3],[-6.2,37.5],[-3.4,37.1],[-5.1,34]], notes: "DSM-Morogoro-Dodoma-Arusha 400kV." },
  { id: "pw_tz_south", name: "Tanzania Southern", voltage_kv: 220, status: "planned", route: [[-6.8,39.3],[-9.5,39.2],[-10.3,40.2]], notes: "DSM-Lindi-Mtwara. Planned for LNG." },
  // Mozambique
  { id: "pw_moz_cahora", name: "Cahora Bassa-Maputo", voltage_kv: 533, status: "existing", route: [[-15.6,32.7],[-19,34],[-25.9,32.6]], notes: "533kV HVDC. Hydro export line." },
  { id: "pw_moz_north", name: "Mozambique Northern", voltage_kv: 220, status: "planned", route: [[-15.6,32.7],[-14.5,40.5],[-12.5,39]], notes: "Planned connection to Rovuma/Palma." },
  // Ethiopia
  { id: "pw_eth_backbone", name: "Ethiopia ICS", voltage_kv: 400, status: "existing", route: [[9,38.8],[8.5,38.5],[7,37],[6,37.5]], notes: "Interconnected system. 400kV backbone." },
  { id: "pw_eth_gerd", name: "GERD Transmission", voltage_kv: 500, status: "construction", route: [[11,35.1],[10.5,37],[9,38.8]], notes: "Grand Ethiopian Renaissance Dam 500kV." },
  { id: "pw_eth_dji", name: "Ethiopia-Djibouti Interconnect", voltage_kv: 230, status: "existing", route: [[9,38.8],[9.6,41.9],[11.5,43.1]], notes: "Cross-border interconnection. 230kV." },
  // Regional interconnects
  { id: "pw_ken_tz", name: "Kenya-Tanzania Interconnect", voltage_kv: 400, status: "existing", route: [[-1.3,36.9],[-2.5,37],[-3.4,37.1]], notes: "400kV interconnection via Namanga." },
  { id: "pw_ken_eth", name: "Kenya-Ethiopia HVDC", voltage_kv: 500, status: "existing", route: [[-1.3,36.9],[3,37.5],[6,37.5],[9,38.8]], notes: "500kV HVDC link. 2000MW capacity." },
];

// ═══════════════════════════════════════════════════════════════
// MAJOR ROADS — trunk corridors relevant to basin access
// ═══════════════════════════════════════════════════════════════
export const ROADS = [
  // Trans-African Highway corridors
  { id: "r_cairo_cape", name: "Cairo-Cape Town (TAH4)", type: "highway", status: "partial", route: [[9,38.8],[6,37],[1,36],[0,34],[-1.3,36.9],[-3.4,37.1],[-6.8,39.3]], notes: "TAH4 through East Africa corridor." },
  // Kenya
  { id: "r_nairobi_mombasa", name: "Nairobi-Mombasa", type: "highway", status: "paved", route: [[-1.3,36.9],[-2.5,37.8],[-4,39.6]], notes: "A109. Primary corridor. SGR parallel." },
  { id: "r_nairobi_lokichar", name: "Nairobi-Turkana", type: "trunk", status: "partial", route: [[-1.3,36.9],[0.3,36.1],[1.5,35.5],[2.6,35.8]], notes: "A1 to Lokichar basin. Partially unpaved north of Maralal." },
  { id: "r_lamu_road", name: "Lamu-Garissa", type: "trunk", status: "paved", route: [[-2.3,40.9],[-1,40],[-0.5,39.6]], notes: "LAPSSET corridor road. Recently paved." },
  // Tanzania
  { id: "r_dar_mtwara", name: "Dar es Salaam-Mtwara", type: "trunk", status: "paved", route: [[-6.8,39.3],[-8.5,39.2],[-10.3,40.2]], notes: "Coastal route. Links to Mnazi Bay gas." },
  { id: "r_tanzam", name: "TANZAM Highway", type: "highway", status: "paved", route: [[-6.8,39.3],[-7,37.5],[-8.5,36.5],[-8.9,32.9]], notes: "Dar-Iringa-Mbeya-Zambia corridor." },
  // Mozambique
  { id: "r_en1", name: "EN1 (Mozambique)", type: "highway", status: "paved", route: [[-25.9,32.6],[-23,35],[-19,34.5],[-15,40.5],[-12.5,39]], notes: "National north-south highway. 2500km." },
  // Ethiopia
  { id: "r_addis_djibouti", name: "Addis Ababa-Djibouti", type: "highway", status: "paved", route: [[9,38.8],[9.3,42.1],[11.5,43.1]], notes: "Primary trade corridor. Rail parallel." },
  { id: "r_addis_ogaden", name: "Addis-Harar-Jijiga", type: "trunk", status: "paved", route: [[9,38.8],[9.3,42.1],[9.4,42.8]], notes: "Route toward Ogaden Basin." },
];

// ═══════════════════════════════════════════════════════════════
// PROXIMITY SCORING — compute distance from basin to nearest infra
// ═══════════════════════════════════════════════════════════════
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function nearestPoint(lat, lng, points) {
  let minD = Infinity, nearest = null;
  for (const p of points) {
    const d = haversine(lat, lng, p.lat, p.lng);
    if (d < minD) { minD = d; nearest = p; }
  }
  return { distance_km: Math.round(minD), asset: nearest };
}

function nearestLinePoint(lat, lng, lines) {
  let minD = Infinity, nearest = null;
  for (const line of lines) {
    for (const pt of line.route) {
      const d = haversine(lat, lng, pt[0], pt[1]);
      if (d < minD) { minD = d; nearest = line; }
    }
  }
  return { distance_km: Math.round(minD), asset: nearest };
}

export function computeProximity(basin) {
  return {
    port: nearestPoint(basin.lat, basin.lng, PORTS),
    airport: nearestPoint(basin.lat, basin.lng, AIRPORTS),
    pipeline: nearestLinePoint(basin.lat, basin.lng, PIPELINES),
    power: nearestLinePoint(basin.lat, basin.lng, POWER_LINES),
    road: nearestLinePoint(basin.lat, basin.lng, ROADS),
  };
}

// Development readiness score: 0-100
export function devReadinessScore(basin) {
  const prox = computeProximity(basin);
  // Score each category: closer = higher score, max 20 pts each
  const portScore = Math.max(0, 20 - (prox.port.distance_km / 25));
  const airScore = Math.max(0, 20 - (prox.airport.distance_km / 25));
  const pipeScore = Math.max(0, 20 - (prox.pipeline.distance_km / 30));
  const powerScore = Math.max(0, 20 - (prox.power.distance_km / 25));
  const roadScore = Math.max(0, 20 - (prox.road.distance_km / 20));
  return {
    total: Math.round(portScore + airScore + pipeScore + powerScore + roadScore),
    breakdown: {
      port: { score: Math.round(portScore), distance_km: prox.port.distance_km, name: prox.port.asset?.name },
      airport: { score: Math.round(airScore), distance_km: prox.airport.distance_km, name: prox.airport.asset?.name },
      pipeline: { score: Math.round(pipeScore), distance_km: prox.pipeline.distance_km, name: prox.pipeline.asset?.name },
      power: { score: Math.round(powerScore), distance_km: prox.power.distance_km, name: prox.power.asset?.name },
      road: { score: Math.round(roadScore), distance_km: prox.road.distance_km, name: prox.road.asset?.name },
    }
  };
}
