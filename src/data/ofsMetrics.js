// ══════════════════════════════════════════════════════════════════
// GeoIndex — OFS (Oilfield Services) Metrics Seed Data
// Modeled after DrillSource by Spears & Associates
// ══════════════════════════════════════════════════════════════════

export var SERVICE_CATEGORIES = [
  { key: "cement", label: "Cement", color: "#94a3b8" },
  { key: "casing_wh", label: "Casing/WH", color: "#60a5fa" },
  { key: "directional", label: "Directional", color: "#34d399" },
  { key: "driller", label: "Driller", color: "#fbbf24" },
  { key: "frac", label: "Frac", color: "#f472b6" },
  { key: "mud", label: "Mud", color: "#a78bfa" },
  { key: "pipe", label: "Pipe", color: "#fb923c" },
  { key: "logging", label: "Logging", color: "#38bdf8" },
  { key: "completion", label: "Completion", color: "#e879f9" },
];

// Wells drilled per country/year with operator info
export var OFS_WELLS = [
  // Mozambique
  { country: "Mozambique", basin_id: "rovuma_off", year: 2024, operator: "ENI", parent: "ENI SpA", well_name: "Coral North-1", well_type: "Appraisal", td_ft: 14200, result: "Gas Discovery" },
  { country: "Mozambique", basin_id: "rovuma_off", year: 2024, operator: "TotalEnergies", parent: "TotalEnergies SE", well_name: "Prosperidade-4", well_type: "Appraisal", td_ft: 15600, result: "Gas Discovery" },
  { country: "Mozambique", basin_id: "rovuma_off", year: 2025, operator: "ENI", parent: "ENI SpA", well_name: "Coral North-2A", well_type: "Development", td_ft: 13800, result: "Gas Discovery" },
  { country: "Mozambique", basin_id: "rovuma_off", year: 2025, operator: "TotalEnergies", parent: "TotalEnergies SE", well_name: "Golfinho-6", well_type: "Development", td_ft: 16100, result: "Gas Discovery" },
  { country: "Mozambique", basin_id: "moz_chan", year: 2025, operator: "ExxonMobil", parent: "ExxonMobil Corp", well_name: "Mamba Deep-1", well_type: "Exploration", td_ft: 18500, result: "Dry" },
  { country: "Mozambique", basin_id: "rovuma_off", year: 2026, operator: "ENI", parent: "ENI SpA", well_name: "Agulha-1", well_type: "Exploration", td_ft: 14900, result: "Gas Discovery" },
  { country: "Mozambique", basin_id: "rovuma_off", year: 2026, operator: "TotalEnergies", parent: "TotalEnergies SE", well_name: "Area1-Dev-7", well_type: "Development", td_ft: 15200, result: "Gas Discovery" },
  // Kenya
  { country: "Kenya", basin_id: "lokichar", year: 2024, operator: "Africa Oil Corp", parent: "Africa Oil Corp", well_name: "Ngamia-15", well_type: "Appraisal", td_ft: 7200, result: "Oil Discovery" },
  { country: "Kenya", basin_id: "lokichar", year: 2025, operator: "Africa Oil Corp", parent: "Africa Oil Corp", well_name: "Amosing-8", well_type: "Appraisal", td_ft: 6800, result: "Oil Discovery" },
  { country: "Kenya", basin_id: "lamu", year: 2025, operator: "ENI", parent: "ENI SpA", well_name: "Lamu Deep-2", well_type: "Exploration", td_ft: 12400, result: "Dry" },
  { country: "Kenya", basin_id: "lokichar", year: 2026, operator: "Africa Oil Corp", parent: "Africa Oil Corp", well_name: "Twiga South-3", well_type: "Appraisal", td_ft: 7500, result: "Oil Discovery" },
  // Tanzania
  { country: "Tanzania", basin_id: "tz_deep", year: 2024, operator: "Equinor", parent: "Equinor ASA", well_name: "Zafarani-4", well_type: "Appraisal", td_ft: 16200, result: "Gas Discovery" },
  { country: "Tanzania", basin_id: "tz_deep", year: 2025, operator: "Shell", parent: "Shell plc", well_name: "Lindi-1ST", well_type: "Appraisal", td_ft: 15800, result: "Gas Discovery" },
  { country: "Tanzania", basin_id: "mandawa", year: 2026, operator: "Dodsal Group", parent: "Dodsal Group", well_name: "Ntorya-4", well_type: "Appraisal", td_ft: 8900, result: "Gas Discovery" },
  // Ethiopia
  { country: "Ethiopia", basin_id: "ogaden", year: 2024, operator: "POLY-GCL", parent: "POLY-GCL Petroleum", well_name: "Calub-12", well_type: "Development", td_ft: 9500, result: "Gas Discovery" },
  { country: "Ethiopia", basin_id: "ogaden", year: 2025, operator: "New Age Energy", parent: "New Age Energy", well_name: "Ogaden East-1", well_type: "Exploration", td_ft: 11200, result: "Dry" },
  { country: "Ethiopia", basin_id: "ogaden", year: 2026, operator: "POLY-GCL", parent: "POLY-GCL Petroleum", well_name: "Hilala-7", well_type: "Development", td_ft: 10100, result: "Gas Discovery" },
  // Somalia
  { country: "Somalia", basin_id: "nogal", year: 2025, operator: "Genel Energy", parent: "Genel Energy plc", well_name: "Nogal-2X", well_type: "Exploration", td_ft: 9800, result: "Suspended" },
  // Eritrea
  { country: "Eritrea", basin_id: "red_sea_er", year: 2026, operator: "CNPC", parent: "CNPC", well_name: "Dahlak-1", well_type: "Exploration", td_ft: 11500, result: "Suspended" },
];

// OFS spending by country/year/operator (USD thousands)
export var OFS_SPENDING = [
  // Mozambique 2024
  { country: "Mozambique", year: 2024, parent: "ENI SpA", cement: 2800, casing_wh: 5200, directional: 8400, driller: 12500, frac: 0, mud: 4100, pipe: 3200, logging: 3800, completion: 6200 },
  { country: "Mozambique", year: 2024, parent: "TotalEnergies SE", cement: 3100, casing_wh: 6800, directional: 11200, driller: 18400, frac: 0, mud: 5600, pipe: 4500, logging: 4200, completion: 8100 },
  // Mozambique 2025
  { country: "Mozambique", year: 2025, parent: "ENI SpA", cement: 3200, casing_wh: 6100, directional: 9800, driller: 14200, frac: 0, mud: 4800, pipe: 3600, logging: 4100, completion: 7500 },
  { country: "Mozambique", year: 2025, parent: "TotalEnergies SE", cement: 4500, casing_wh: 9200, directional: 15600, driller: 24800, frac: 0, mud: 7200, pipe: 5800, logging: 5400, completion: 11200 },
  { country: "Mozambique", year: 2025, parent: "ExxonMobil Corp", cement: 2200, casing_wh: 4800, directional: 7500, driller: 11200, frac: 0, mud: 3600, pipe: 2800, logging: 3200, completion: 4800 },
  // Mozambique 2026
  { country: "Mozambique", year: 2026, parent: "ENI SpA", cement: 3800, casing_wh: 7200, directional: 11500, driller: 16800, frac: 0, mud: 5400, pipe: 4200, logging: 4800, completion: 8800 },
  { country: "Mozambique", year: 2026, parent: "TotalEnergies SE", cement: 5200, casing_wh: 10800, directional: 18200, driller: 28500, frac: 0, mud: 8400, pipe: 6500, logging: 6200, completion: 13500 },
  // Kenya 2024-2026
  { country: "Kenya", year: 2024, parent: "Africa Oil Corp", cement: 1200, casing_wh: 2400, directional: 3200, driller: 5800, frac: 800, mud: 1800, pipe: 1400, logging: 1600, completion: 2800 },
  { country: "Kenya", year: 2025, parent: "Africa Oil Corp", cement: 1400, casing_wh: 2800, directional: 4100, driller: 6500, frac: 900, mud: 2200, pipe: 1600, logging: 1800, completion: 3200 },
  { country: "Kenya", year: 2025, parent: "ENI SpA", cement: 1800, casing_wh: 3600, directional: 5800, driller: 9200, frac: 0, mud: 2800, pipe: 2200, logging: 2400, completion: 4500 },
  { country: "Kenya", year: 2026, parent: "Africa Oil Corp", cement: 1600, casing_wh: 3200, directional: 4800, driller: 7200, frac: 1100, mud: 2600, pipe: 1800, logging: 2000, completion: 3600 },
  // Tanzania
  { country: "Tanzania", year: 2024, parent: "Equinor ASA", cement: 2400, casing_wh: 4800, directional: 7800, driller: 11500, frac: 0, mud: 3800, pipe: 2800, logging: 3400, completion: 5800 },
  { country: "Tanzania", year: 2025, parent: "Shell plc", cement: 2600, casing_wh: 5200, directional: 8400, driller: 12800, frac: 0, mud: 4200, pipe: 3200, logging: 3600, completion: 6200 },
  { country: "Tanzania", year: 2026, parent: "Dodsal Group", cement: 800, casing_wh: 1600, directional: 2200, driller: 3800, frac: 0, mud: 1200, pipe: 900, logging: 1100, completion: 1800 },
  // Ethiopia
  { country: "Ethiopia", year: 2024, parent: "POLY-GCL Petroleum", cement: 900, casing_wh: 1800, directional: 2400, driller: 4200, frac: 0, mud: 1400, pipe: 1100, logging: 1200, completion: 2200 },
  { country: "Ethiopia", year: 2025, parent: "New Age Energy", cement: 1100, casing_wh: 2200, directional: 3200, driller: 5100, frac: 0, mud: 1600, pipe: 1300, logging: 1400, completion: 2800 },
  { country: "Ethiopia", year: 2026, parent: "POLY-GCL Petroleum", cement: 1000, casing_wh: 2000, directional: 2800, driller: 4600, frac: 0, mud: 1500, pipe: 1200, logging: 1300, completion: 2400 },
  // Somalia
  { country: "Somalia", year: 2025, parent: "Genel Energy plc", cement: 800, casing_wh: 1600, directional: 2600, driller: 4000, frac: 0, mud: 1200, pipe: 1000, logging: 1100, completion: 1800 },
  // Eritrea
  { country: "Eritrea", year: 2026, parent: "CNPC", cement: 1200, casing_wh: 2400, directional: 3600, driller: 5500, frac: 0, mud: 1800, pipe: 1400, logging: 1600, completion: 2800 },
];
