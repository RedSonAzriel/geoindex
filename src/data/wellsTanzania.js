// Tanzania Block 2 (Statoil/Equinor operated for TPDC, with ExxonMobil) discovery wells, offshore.
// Source: Equinor news archive and Offshore magazine articles, linked per row.
// Dates are announcement dates; for some pages the date comes from the page's URL path, not the article text.
// Volumes are gas in place as announced (trillion cubic feet), not recoverable or reserves.
// Only facts stated in those sources are filled in. Blank means "not stated there".
// Not yet covered: Block 1/4 (Shell) and Block 7 (Ophir/Pavilion) wells, Ntorya, Mnazi Bay and Songo Songo.

var EQ = "https://www.equinor.com/news/archive/";

export var WELLS_TZ_BLOCK2 = [
  { name: "Zafarani-1", date: "2012", outcome: "Discovery", wd_m: null, inplace_tcf: "", block_total: "", note: "Play opener for the block", source: "https://offshore-mag.com/business-briefs/company-news/article/16772403/statoil-makes-fifth-natural-gas-discovery-offshore-tanzania" },
  { name: "Lavani-1", date: "", outcome: "Discovery", wd_m: null, inplace_tcf: "", block_total: "", note: "Date and size not given in the sources checked", source: "https://offshore-mag.com/business-briefs/company-news/article/16772403/statoil-makes-fifth-natural-gas-discovery-offshore-tanzania" },
  { name: "Lavani-2", date: "", outcome: "Discovery", wd_m: null, inplace_tcf: "", block_total: "", note: "Deeper discovery in a separate reservoir", source: "https://offshore-mag.com/business-briefs/company-news/article/16772403/statoil-makes-fifth-natural-gas-discovery-offshore-tanzania" },
  { name: "Tangawizi-1", date: "2013-03-18", outcome: "Discovery", wd_m: 2300, inplace_tcf: "4 to 6", block_total: "15 to 17", note: "", source: EQ + "2013/03/18/18MarTanzania" },
  { name: "Mronge-1", date: "2013-12-06", outcome: "Discovery", wd_m: 2500, inplace_tcf: "2 to 3", block_total: "17 to 20", note: "Fifth Block 2 discovery", source: EQ + "2013/12/06/06DecMronge" },
  { name: "Zafarani-2", date: "2014-03-03", outcome: "Test success", wd_m: 2400, inplace_tcf: "", block_total: "17 to 20", note: "Drill stem test via re-entry; flowed up to 66 MMscf/d, equipment-limited", source: EQ + "2014/03/03/03MarTazania" },
  { name: "Piri-1", date: "2014-06-18", outcome: "Discovery", wd_m: 2360, inplace_tcf: "2 to 3", block_total: "about 20", note: "Sixth Block 2 discovery", source: EQ + "2014/06/18/18JunTanzania" },
  { name: "Giligiliani-1", date: "2014-10-14", outcome: "Discovery", wd_m: 2500, inplace_tcf: "about 1.2", block_total: "about 21", note: "", source: EQ + "2014/10/14/14OctTanzania" }
];
