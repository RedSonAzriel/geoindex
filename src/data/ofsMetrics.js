// OFS Metrics seed data.
// WELLS: well names, operators and discovery years are drawn from widely reported East African discoveries.
//        Years may be off by one and results are simplified. Verify before relying on them.
// SPENDING: PLACEHOLDER figures (USD millions) for layout and testing. They are NOT actual spend records.

export var OFS_CATEGORIES = ["Drilling", "Seismic", "Development", "Facilities"];

export var OFS_WELLS = [
  { id: "w01", name: "Ngamia-1", country: "Kenya", basin: "Lokichar Basin", operator: "Tullow Oil", year: 2012, type: "Exploration", result: "Oil discovery" },
  { id: "w02", name: "Twiga South-1", country: "Kenya", basin: "Lokichar Basin", operator: "Tullow Oil", year: 2012, type: "Exploration", result: "Oil discovery" },
  { id: "w03", name: "Ekales-1", country: "Kenya", basin: "Lokichar Basin", operator: "Tullow Oil", year: 2012, type: "Exploration", result: "Oil discovery" },
  { id: "w04", name: "Etuko-1", country: "Kenya", basin: "Lokichar Basin", operator: "Tullow Oil", year: 2012, type: "Exploration", result: "Oil discovery" },
  { id: "w05", name: "Amosing-1", country: "Kenya", basin: "Lokichar Basin", operator: "Tullow Oil", year: 2013, type: "Appraisal", result: "Oil discovery" },
  { id: "w06", name: "Prosperidade-1", country: "Mozambique", basin: "Rovuma Basin (Offshore)", operator: "Anadarko", year: 2010, type: "Exploration", result: "Gas discovery" },
  { id: "w07", name: "Windjammer-1", country: "Mozambique", basin: "Rovuma Basin (Offshore)", operator: "Anadarko", year: 2010, type: "Exploration", result: "Gas discovery" },
  { id: "w08", name: "Mamba South-1", country: "Mozambique", basin: "Rovuma Basin (Offshore)", operator: "Eni", year: 2011, type: "Exploration", result: "Gas discovery" },
  { id: "w09", name: "Mamba North-1", country: "Mozambique", basin: "Rovuma Basin (Offshore)", operator: "Eni", year: 2012, type: "Exploration", result: "Gas discovery" },
  { id: "w10", name: "Coral-1", country: "Mozambique", basin: "Rovuma Basin (Offshore)", operator: "Eni", year: 2012, type: "Exploration", result: "Gas discovery" },
  { id: "w11", name: "Golfinho-1", country: "Mozambique", basin: "Rovuma Basin (Offshore)", operator: "Anadarko", year: 2012, type: "Appraisal", result: "Gas discovery" },
  { id: "w12", name: "Agulha-1", country: "Mozambique", basin: "Rovuma Basin (Offshore)", operator: "Eni", year: 2012, type: "Exploration", result: "Gas discovery" },
  { id: "w13", name: "Pweza-1", country: "Tanzania", basin: "Offshore Tanzania", operator: "Ophir Energy", year: 2010, type: "Exploration", result: "Gas discovery" },
  { id: "w14", name: "Chewa-1", country: "Tanzania", basin: "Offshore Tanzania", operator: "Ophir Energy", year: 2011, type: "Exploration", result: "Gas discovery" },
  { id: "w15", name: "Jodari-1", country: "Tanzania", basin: "Offshore Tanzania", operator: "Ophir Energy", year: 2012, type: "Exploration", result: "Gas discovery" },
  { id: "w16", name: "Zafarani-1", country: "Tanzania", basin: "Offshore Tanzania", operator: "Equinor", year: 2012, type: "Exploration", result: "Gas discovery" },
  { id: "w17", name: "Lavani-1", country: "Tanzania", basin: "Offshore Tanzania", operator: "Equinor", year: 2012, type: "Exploration", result: "Gas discovery" },
  { id: "w18", name: "Mzia-1", country: "Tanzania", basin: "Offshore Tanzania", operator: "Eni", year: 2013, type: "Exploration", result: "Gas discovery" },
  { id: "w19", name: "Mronge-1", country: "Tanzania", basin: "Offshore Tanzania", operator: "Equinor", year: 2014, type: "Exploration", result: "Gas discovery" }
];

export var OFS_SPENDING = [
  { id: "s01", country: "Mozambique", year: 2011, category: "Drilling", parent: "Anadarko", usd_m: 410 },
  { id: "s02", country: "Mozambique", year: 2012, category: "Drilling", parent: "Eni", usd_m: 380 },
  { id: "s03", country: "Mozambique", year: 2012, category: "Seismic", parent: "Eni", usd_m: 95 },
  { id: "s04", country: "Mozambique", year: 2023, category: "Development", parent: "TotalEnergies", usd_m: 2100 },
  { id: "s05", country: "Mozambique", year: 2024, category: "Facilities", parent: "Eni", usd_m: 640 },
  { id: "s06", country: "Kenya", year: 2012, category: "Drilling", parent: "Tullow Oil", usd_m: 210 },
  { id: "s07", country: "Kenya", year: 2013, category: "Drilling", parent: "Tullow Oil", usd_m: 260 },
  { id: "s08", country: "Kenya", year: 2013, category: "Seismic", parent: "Tullow Oil", usd_m: 70 },
  { id: "s09", country: "Kenya", year: 2019, category: "Development", parent: "Tullow Oil", usd_m: 150 },
  { id: "s10", country: "Kenya", year: 2022, category: "Facilities", parent: "Tullow Oil", usd_m: 90 },
  { id: "s11", country: "Tanzania", year: 2011, category: "Drilling", parent: "Ophir Energy", usd_m: 190 },
  { id: "s12", country: "Tanzania", year: 2012, category: "Drilling", parent: "Equinor", usd_m: 320 },
  { id: "s13", country: "Tanzania", year: 2013, category: "Seismic", parent: "Equinor", usd_m: 85 },
  { id: "s14", country: "Tanzania", year: 2013, category: "Drilling", parent: "Eni", usd_m: 240 },
  { id: "s15", country: "Tanzania", year: 2022, category: "Facilities", parent: "Equinor", usd_m: 110 },
  { id: "s16", country: "Ethiopia", year: 2020, category: "Development", parent: "Poly-GCL", usd_m: 130 },
  { id: "s17", country: "Ethiopia", year: 2020, category: "Seismic", parent: "Poly-GCL", usd_m: 40 },
  { id: "s18", country: "Mozambique", year: 2022, category: "Seismic", parent: "TotalEnergies", usd_m: 60 }
];
