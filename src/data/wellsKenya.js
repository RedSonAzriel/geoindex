// Kenya exploration and appraisal wells, 1960 to 2017.
// Source: National Oil Corporation of Kenya, "Wells Drilled" table (nationaloil.co.ke/website_11ab3dee/pdf/Wells__Drilled.pdf).
// Transcribed into structured rows; the outcome and kind columns are normalised by hand from the source wording.
// Verify individual rows against the original PDF before relying on them. The source has no coordinates.
//
// Columns: name, year, operator, kind (Exploration | Appraisal), block, basin, td_m, result (source wording), outcome, status
// outcome: Discovery | Appraisal oil | Appraisal dry | Shows | Dry | Unknown

export var WELLS_KENYA_SOURCE = {
  name: "National Oil Corporation of Kenya, Wells Drilled",
  url: "https://nationaloil.co.ke/website_11ab3dee/pdf/Wells__Drilled.pdf",
  coverage: "1960 to 2017",
  note: "Well-level results for Kenya. No coordinates. Later wells (2018 onward) are not in this table."
};

var ROWS = [
  ["Meri-1", 1961, "BP/Shell", "Exploration", "3B", "Anza", 1937.6, "Dry hole", "Dry", "P&A"],
  ["Anza-1", 1976, "Chevron", "Exploration", "3A", "Anza", 3662, "Oil stains in Cretaceous", "Shows", "P&A"],
  ["Bahati-1", 1976, "Chevron", "Exploration", "3B", "Anza", 3420, "Oil stains in Cretaceous", "Shows", "P&A"],
  ["Bellatrix-1", 1988, "Amoco", "Exploration", "10A", "Anza", 3479, "Dry hole", "Dry", "P&A"],
  ["Ndovu-1", 1988, "Total Kenya", "Exploration", "9", "Anza", 4267, "Gas shows in Cretaceous", "Shows", "P&A"],
  ["Sirius-1", 1988, "Amoco", "Exploration", "10A", "Anza", 2638, "Dry hole", "Dry", "P&A"],
  ["Chalbi-3", 1989, "Amoco", "Exploration", "10A", "Anza", 3643.1, "Dry hole", "Dry", "P&A"],
  ["Duma", 1989, "Total Kenya", "Exploration", "9", "Anza", 3333, "Gas shows in Cretaceous", "Shows", "P&A"],
  ["Endela-1", 1989, "Amoco", "Exploration", "3A", "Anza", 2778, "Gas shows in Paleogene", "Shows", "P&A"],
  ["Kaisut", 1990, "Total Kenya", "Exploration", "9", "Anza", 1450, "Dry hole", "Dry", "P&A"],
  ["Bogal-1", 2010, "CNOOC", "Exploration", "9", "Anza", 5085, "Minor gas shows", "Shows", "P&A"],
  ["Sala-1", 2014, "Africa Oil", "Exploration", "9", "Anza", 3030, "Gas discovery and oil shows", "Discovery", "Discovery"],
  ["Sala-2", 2014, "Africa Oil", "Exploration", "9", "Anza", null, "Dry hole", "Dry", ""],
  ["Bahasi", 2013, "Africa Oil", "Exploration", "9", "Anza", 2900, "Minor gas shows", "Shows", "P&A"],
  ["Paipai-1", 2013, "Tullow Kenya", "Exploration", "10A", "Anza", 4255, "Oil shows", "Shows", "Suspended"],

  ["Pandangua-1", 1960, "BP/Shell", "Exploration", "L-4", "Lamu", 1981.2, "Gas shows in Tertiary", "Shows", "P&A"],
  ["Walu-1", 1960, "BP/Shell", "Exploration", "L-4", "Lamu", 1768, "Dry hole", "Dry", "P&A"],
  ["Mararani-1", 1962, "BP/Shell", "Exploration", "L-3", "Lamu", 1991, "Fluorescence in Tertiary (dry well)", "Dry", "P&A"],
  ["Ria Kalui", 1962, "Mehta & Co.", "Exploration", "L-19", "Lamu", 1538, "Oil stains", "Shows", "P&A"],
  ["Walu-2", 1963, "BP/Shell", "Exploration", "L-5", "Lamu", 3728, "Fluorescence in Cretaceous", "Shows", "P&A"],
  ["Dodori-1", 1964, "BP/Shell", "Exploration", "L-13", "Lamu", 4311, "Gas shows in Tertiary/Cretaceous", "Shows", "P&A"],
  ["Wal Merer", 1967, "BP/Shell", "Exploration", "L-1A", "Lamu", 3793.5, "Gas shows in Cretaceous", "Shows", "P&A"],
  ["Garissa-1", 1968, "BP/Shell", "Exploration", "L-1A", "Lamu", 2438.4, "Dry hole", "Dry", "P&A"],
  ["Kipini-1", 1971, "BP/Shell", "Exploration", "L-6", "Lamu", 3661.9, "Fluorescence and gas shows in Tertiary/Cretaceous", "Shows", "P&A"],
  ["Pate-1", 1971, "BP/Shell", "Exploration", "L-4", "Lamu", 4186.7, "Gas shows in Eocene", "Shows", "P&A"],
  ["Hargaso-1", 1975, "Texas Pacific Kenya", "Exploration", "L-1B", "Lamu", 3091.1, "Gas shows in Cretaceous", "Shows", "P&A"],
  ["Simba-1", 1978, "Total Kenya", "Exploration", "L-9", "Lamu", 3604, "Gas shows in Tertiary and Cretaceous", "Shows", "P&A"],
  ["Maridadi-1", 1981, "Kenya Cities Service", "Exploration", "L-6", "Lamu", 607, "Dry hole", "Dry", "P&A"],
  ["Maridadi-1A", 1981, "Kenya Cities Service", "Exploration", "L-6", "Lamu", 610.5, "Dry hole", "Dry", "P&A"],
  ["Maridadi-1B", 1982, "Kenya Cities Service", "Exploration", "L-6", "Lamu", 4197, "Gas shows in Tertiary (source also lists this well as dry)", "Shows", "P&A"],
  ["Kofia-1", 1985, "Union Oil of Kenya", "Exploration", "L-15", "Lamu", 3629, "Fluorescence and gas shows in Tertiary/Cretaceous", "Shows", "P&A"],
  ["Kencan-1", 1986, "Petro-Canada", "Exploration", "L-1A", "Lamu", 3863, "Gas shows", "Shows", "P&A"],
  ["Pomboo-1", 2007, "Woodside Energy", "Exploration", "L-5", "Lamu", 4887, "Dry hole", "Dry", "P&A"],
  ["Mbawa-1", 2012, "Apache", "Exploration", "L-8", "Lamu", 3275, "Gas shows in Cretaceous sandstones", "Discovery", "Discovery"],
  ["Kiboko-1", 2013, "Anadarko Kenya", "Exploration", "L-11B", "Lamu", null, "Dry hole", "Dry", ""],
  ["Kubwa-1", 2013, "Anadarko Kenya", "Exploration", "L-7", "Lamu", 5858, "Non-commercial oil shows", "Shows", ""],
  ["Sunbird-1", 2014, "Africa Oil (BG Group)", "Exploration", "L-10A", "Lamu", 2952, "Oil and gas shows, Miocene", "Discovery", "Discovery"],

  ["Elgal-1", 1987, "Amoco", "Exploration", "2A", "Mandera", 1280, "Dry hole", "Dry", "P&A"],
  ["Elgal-2", 1987, "Amoco", "Exploration", "2A", "Mandera", 1907, "Dry hole", "Dry", "P&A"],
  ["Hothori-1", 1989, "Amoco", "Exploration", "2B", "Mandera", 4392, "Fluorescence and gas shows in Tertiary/Cretaceous", "Shows", "P&A"],
  ["Badada-1", 2015, "Lion Petroleum", "Exploration", "2B", "Mandera", 3500, "Dry hole", "Dry", "P&A"],

  ["Eliye Spring", 1992, "Shell", "Exploration", "10BA", "Tertiary Rift", 2965, "Dry hole", "Dry", "P&A"],
  ["Loperot-1", 1992, "Shell", "Exploration", "10BB", "Tertiary Rift", 2950, "Gas and oil shows", "Shows", "P&A"],
  ["Ngamia-1/1A", 2012, "Tullow Kenya", "Exploration", "10BB", "Tertiary Rift", 2232, "Oil discovery", "Discovery", "Discovery"],
  ["Twiga South-1", 2012, "Tullow & Africa Oil", "Exploration", "13T", "Tertiary Rift", 3250, "30 m net oil pay", "Discovery", "Discovery"],
  ["Agete-1", 2013, "Tullow Kenya", "Exploration", "13T", "Tertiary Rift", 1930, "100 m net oil pay", "Discovery", "Discovery"],
  ["Ekales-1", 2013, "Tullow Kenya", "Exploration", "13T", "Tertiary Rift", 2554, "Oil discovery", "Discovery", "Discovery"],
  ["Ekales-2", 2013, "Tullow & Africa Oil", "Appraisal", "13T", "Tertiary Rift", 4059, "60 to 100 m net oil pay", "Appraisal oil", "Suspended"],
  ["Etuko-1", 2013, "Tullow & Africa Oil", "Exploration", "10BB", "Tertiary Rift", 3100, "Oil discovery (source lists as appraisal)", "Discovery", "Discovery"],
  ["Amosing-1", 2013, "Tullow Kenya", "Exploration", "10BB", "Tertiary Rift", 2531, "160 to 200 m net oil pay", "Discovery", "Discovery"],
  ["Agete-2", 2014, "Tullow Kenya", "Appraisal", "13T", "Tertiary Rift", 2024, "Dry hole", "Appraisal dry", "P&A"],
  ["Amosing-2", 2014, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 2878, "Oil", "Appraisal oil", "P&A"],
  ["Amosing-2A", 2014, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 2165, "Oil", "Appraisal oil", ""],
  ["Ekosowan-1", 2014, "Tullow Kenya", "Exploration", "10BB", "Tertiary Rift", 2029, "Oil shows", "Shows", "P&A"],
  ["Ekunyuk-1", 2014, "Tullow Kenya", "Exploration", "10BB", "Tertiary Rift", 1802, "5 m net oil pay", "Shows", ""],
  ["Emong-1", 2014, "Tullow Kenya", "Exploration", "10BB", "Tertiary Rift", 1354, "Dry hole", "Dry", ""],
  ["Etom-1", 2014, "Tullow Kenya", "Exploration", "13T", "Tertiary Rift", 2000, "Oil discovery", "Discovery", "Suspended"],
  ["Etuko-2/2A", 2014, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 650, "10 m net oil pay", "Appraisal oil", ""],
  ["Ewoi-1", 2014, "Tullow Kenya", "Exploration", "10BB", "Tertiary Rift", 1911, "20 to 80 m net oil pay", "Discovery", "Discovery"],
  ["Kodos-1", 2014, "Tullow Kenya", "Exploration", "10BB", "Tertiary Rift", 2500, "Minor oil shows", "Shows", "P&A"],
  ["Ngamia-2", 2014, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 1924, "Oil and gas shows", "Appraisal oil", ""],
  ["Ngamia-3", 2014, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 2700, "150 m net oil pay", "Appraisal oil", "Suspended"],
  ["Ngamia-4", 2014, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 1814, "Oil", "Appraisal oil", "Suspended"],
  ["Ngamia-5", 2014, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 2317, "160 to 200 m net oil pay", "Appraisal oil", "Suspended"],
  ["Ngamia-6", 2014, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 2480, "135 m net oil pay", "Appraisal oil", "Suspended"],
  ["Twiga-2", 2014, "Tullow Kenya", "Appraisal", "13T", "Tertiary Rift", 2103, "18 m net oil pay", "Appraisal oil", "Abandoned (technical)"],
  ["Twiga-2A", 2014, "Tullow Kenya", "Appraisal", "13T", "Tertiary Rift", 2886, "62 m vertical net oil pay", "Appraisal oil", ""],
  ["Amosing-3", 2014, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 2403, "107 m net oil pay (source lists as exploration)", "Appraisal oil", "Suspended"],
  ["Amosing-4", 2015, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 2500, "27 m net oil pay", "Appraisal oil", ""],
  ["Amosing-5", 2015, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 2475, "Oil shows", "Appraisal oil", ""],
  ["Amosing-5A", 2015, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 1868, "Oil", "Appraisal oil", ""],
  ["Emesek-1", 2015, "Tullow Kenya", "Exploration", "13T", "Tertiary Rift", 3000, "No commercial hydrocarbons", "Dry", "P&A"],
  ["Engomo-1/1A", 2015, "Tullow Kenya", "Exploration", "10BA", "Tertiary Rift", 2353, "Dry hole", "Dry", "P&A"],
  ["Epir-1", 2015, "Tullow Kenya", "Exploration", "10BB", "Tertiary Rift", 3057, "Shows of oil and wet gas", "Shows", "P&A"],
  ["Etom-2", 2015, "Tullow Kenya", "Appraisal", "13T", "Tertiary Rift", 1655, "102 m net oil pay", "Appraisal oil", ""],
  ["Ngamia-7", 2015, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 2914, "130 m net oil pay", "Appraisal oil", "Suspended"],
  ["Ngamia-8", 2015, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 1730, "200 m net oil pay", "Appraisal oil", ""],
  ["Twiga-3", 2015, "Tullow Kenya", "Appraisal", "13T", "Tertiary Rift", 2575, "Oil shows", "Appraisal oil", "Suspended"],
  ["Cheptuket-1", 2016, "Tullow Kenya", "Exploration", "12A", "Tertiary Rift", 3083, "Good oil shows", "Shows", "P&A"],
  ["Tarach-1", 2016, "CEPSA & ERHC", "Exploration", "11A", "Tertiary Rift", 3000, "Dry hole", "Dry", "P&A"],
  ["Ngamia-9", 2016, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 2595, "Oil", "Appraisal oil", ""],
  ["Erut-1", 2017, "Tullow Kenya", "Exploration", "13T", "Tertiary Rift", 1317, "Oil discovery", "Discovery", "Discovery"],
  ["Ngamia-10", 2017, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 2596, "Oil", "Appraisal oil", ""],
  ["Emekuya-1", 2017, "Tullow Kenya", "Exploration", "13T", "Tertiary Rift", 1356, "75 m net oil pay, Miocene sandstones", "Discovery", "Discovery"],
  ["Amosing-6", 2017, "Tullow Kenya", "Appraisal", "10BB", "Tertiary Rift", 1868, "Oil", "Appraisal oil", ""],
  ["Etete", 2017, "Tullow Kenya", "Exploration", "13T", "Tertiary Rift", null, "Result not given in source", "Unknown", ""]
];

// Which GeoIndex basin record each source basin maps to.
var BASIN_MAP = { "Anza": "Anza Graben", "Lamu": "Lamu Basin", "Mandera": "Mandera-Lugh Basin", "Tertiary Rift": "Lokichar Basin" };

export var WELLS_KENYA = ROWS.map(function (r, i) {
  return {
    id: "ke-" + i,
    country: "Kenya",
    name: r[0], year: r[1], operator: r[2], kind: r[3], block: r[4],
    sourceBasin: r[5], basin: BASIN_MAP[r[5]] || r[5],
    td_m: r[6], result: r[7], outcome: r[8], status: r[9]
  };
});
