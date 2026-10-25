// Rovuma Basin gas discovery wells: Mozambique Offshore Areas 1 and 4, and Tanzania Blocks 1 and 4.
// Each row cites the operator press release or trade-press article it came from.
// Only facts stated in those sources are filled in; blank means the source did not state it.
// Dates are announcement or publication dates, not drilling dates. Where an article gave a day and month
// but no year, the year is left out and the note says so.
// Volumes: "in place" is gas initially in place, "recoverable" is gross recoverable. They are not comparable.
// Not yet covered: Windjammer, Lagosta, Golfinho/Atum, Coral, Agulha, Pweza-1 details, Tanzania Block 7 and Block 3.

var AAPG = "https://www.aapg.org/news-and-media/explorer/deep-waters-off-mozambique-yield-big-gas-finds/";
var EGYPT = "https://egyptoil-gas.com/news/anadarko-successfully-completes-planned-appraisal-drilling-program-in-discovery-area-offshore-mozambique/";
var ENI1 = "https://www.eni.com/en-IT/media/press-release/2011/10/eni-announces-a-giant-gas-discovery-offshore-mozambique.html";
var ENI2 = "https://www.eni.com/en-IT/media/press-release/2011/10/eni-increases-the-mamba-south-gas-discovery-in-mozambique-by-50.html";
var OFF = "https://www.offshore-mag.com/drilling-completion/article/";
var OGJ = "https://www.ogj.com/";

export var WELLS_ROVUMA = [
  { name: "Mamba South-1", country: "Mozambique", block: "Area 4", operator: "Eni", date: "2011-10-20", wd_m: 1585, pay: "", size: "At least 15 Tcf (area-wide Eni estimate)", basis: "in place", note: "Discovery well for Area 4. Eni 70%, Galp 10%, KOGAS 10%, ENH 10%", source: ENI1 },
  { name: "Mamba South-1 (update)", country: "Mozambique", block: "Area 4", operator: "Eni", date: "2011-10-27", wd_m: null, pay: "", size: "Up to 22.5 Tcf in Mamba South area; new Eocene pool up to 7.5 Tcf", basis: "in place", note: "Eni says the discovery is about 50% larger than first announced", source: ENI2 },
  { name: "Camarao", country: "Mozambique", block: "Area 1", operator: "Anadarko", date: "early October (year not stated)", wd_m: null, pay: "About 240 ft net gas pay, plus about 140 ft in shallower Miocene and Oligocene sands", size: "", basis: "", note: "Pressure-connected to Windjammer and Lagosta", source: AAPG },
  { name: "Barquentine-3", country: "Mozambique", block: "Area 1", operator: "Anadarko", date: "28 November (year not stated)", wd_m: null, pay: "More than 662 ft net gas pay in two Oligocene fan systems", size: "Recoverable raised from 10 to 15 to 30+ Tcf; 30 to 50+ Tcf in place", basis: "recoverable and in place", note: "Sixth successful penetration in the complex", source: AAPG },
  { name: "Tubarao", country: "Mozambique", block: "Area 1", operator: "Anadarko", date: "February (year not stated)", wd_m: 900, pay: "More than 110 ft net gas pay, no water, Eocene", size: "", basis: "", note: "Water depth about 2,950 ft, total depth about 13,900 ft. Described as the fourth significant Rovuma discovery", source: AAPG },
  { name: "Barquentine-4", country: "Mozambique", block: "Area 1", operator: "Anadarko", date: "2012-04-04", wd_m: 1650, pay: "About 525 ft (160 m) net gas pay", size: "Prosperidade complex: 17 to 30+ Tcf", basis: "recoverable", note: "Ninth successful well in the complex, about 30 km north of Lagosta", source: EGYPT },

  { name: "Chewa-1", country: "Tanzania", block: "Block 4", operator: "Ophir (BG 60%)", date: "2010-12-01", wd_m: 1300, pay: "", size: "", basis: "", note: "Size and pay not stated. About 80 km offshore. Ophir 40%", source: OFF + "16794687/bg-group-hits-gas-with-second-well-off-tanzania" },
  { name: "Pweza-1", country: "Tanzania", block: "Block 4", operator: "Ophir (BG 60%)", date: "", wd_m: null, pay: "", size: "", basis: "", note: "Earlier Block 4 discovery, named in the Chaza-1 report. Details not yet verified", source: OFF + "16776903/third-gas-strike-for-ophirbg-off-tanzania" },
  { name: "Chaza-1", country: "Tanzania", block: "Block 1", operator: "Ophir (BG 60%)", date: "2011-04-04", wd_m: 952, pay: "", size: "", basis: "", note: "Total depth 4,895 m subsea, about 200 km south of Pweza and Chewa. Size not disclosed", source: OGJ + "home/article/17266543/ophirbg-has-rovuma-gas-find-off-tanzania" },
  { name: "Jodari-1", country: "Tanzania", block: "Block 1", operator: "BG (60%, Ophir 40%)", date: "2012-03-26", wd_m: 1150, pay: "", size: "2.5 to 4.4 Tcf (Jodari-1); nearly 7 Tcf mean across four wells", basis: "gross recoverable", note: "About 39 km off the coast", source: OGJ + "exploration-development/article/17272831/bg-ophir-hit-fourth-gas-find-off-tanzania-see-7-tcf" },
  { name: "Ngisi-1", country: "Tanzania", block: "Block 4", operator: "BG (60%, Ophir 40%)", date: "2013-07-03", wd_m: null, pay: "Gas pay in a high net-to-gross interval", size: "Chewa-Pweza-Ngisi hub mean raised from 3.7 to 4.5 Tcf", basis: "recoverable", note: "About 5 km northeast of Chewa-1, two sidetracks", source: "https://offshore-energy.biz/2013/07/03/ophir-ngisi-well-shows-good-results-tanzania" }
];
