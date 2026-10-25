'use strict';
// Field Intelligence feed configuration. Edit this file to add feeds or tune tagging.
// Feeds are fetched by the server only (never from user-supplied URLs), and only from allowedHosts.

function googleNews(query) {
  return 'https://news.google.com/rss/search?q=' + encodeURIComponent(query + ' when:30d') + '&hl=en-US&gl=US&ceid=US:en';
}

module.exports = {
  refreshMinutes: 60,
  maxStaleMinutes: 180,
  maxAgeDays: 120,
  maxItems: 120,
  timeoutMs: 12000,
  maxBytes: 3 * 1024 * 1024,

  // Add the host of any direct RSS feed you add below.
  allowedHosts: ['news.google.com'],

  feeds: [
    { name: 'Kenya', url: googleNews('Kenya (oil OR gas OR exploration) (Lokichar OR Turkana OR Lamu OR upstream)') },
    { name: 'Mozambique', url: googleNews('Mozambique (LNG OR Rovuma OR "Cabo Delgado") gas') },
    { name: 'Tanzania', url: googleNews('Tanzania (gas OR LNG OR offshore OR exploration) energy') },
    { name: 'Ethiopia', url: googleNews('Ethiopia (gas OR Ogaden OR oil exploration)') },
    { name: 'Somalia', url: googleNews('Somalia (oil OR gas) (exploration OR licensing OR seismic)') },
    { name: 'Rwanda and Eritrea', url: googleNews('(Rwanda OR Eritrea) (methane OR oil OR gas OR exploration)') },
    { name: 'East Africa', url: googleNews('"East Africa" (oil OR gas) exploration') },
    { name: 'EACOP', url: googleNews('EACOP pipeline') }
  ],

  // Items must mention a country keyword AND an energy term to be kept.
  countryKeywords: [
    ['Kenya', ['kenya', 'lokichar', 'turkana', 'lamu', 'anza graben']],
    ['Mozambique', ['mozambique', 'rovuma', 'cabo delgado']],
    ['Tanzania', ['tanzania', 'mandawa']],
    ['Ethiopia', ['ethiopia', 'ogaden', 'calub']],
    ['Somalia', ['somalia', 'somaliland', 'puntland']],
    ['Eritrea', ['eritrea']],
    ['Rwanda', ['rwanda', 'lake kivu', 'kivuwatt']]
  ],

  energyTerms: [
    'oil', 'gas', 'lng', 'petroleum', 'hydrocarbon', 'drilling', 'exploration', 'pipeline',
    'refinery', 'upstream', 'offshore', 'seismic', 'fpso', 'flng', 'crude', 'methane', 'block'
  ],

  basinKeywords: [
    ['lokichar', 'Lokichar Basin'],
    ['turkana', 'Lokichar Basin'],
    ['lamu', 'Lamu Basin'],
    ['anza graben', 'Anza Graben'],
    ['rovuma', 'Rovuma Basin'],
    ['cabo delgado', 'Rovuma Basin'],
    ['mandawa', 'Mandawa Basin'],
    ['ogaden', 'Ogaden Basin'],
    ['lake kivu', 'Lake Kivu'],
    ['kivuwatt', 'Lake Kivu'],
    ['gambela', 'Gambela Basin'],
    ['blue nile', 'Blue Nile Basin'],
    ['selous', 'Selous Basin'],
    ['ruvu basin', 'Ruvu Basin'],
    ['mudugh', 'Mudugh Basin'],
    ['nogal', 'Nogal Basin'],
    ['danakil', 'Danakil Basin'],
    ['albertine', 'Albertine Rift'],
    ['mozambique channel', 'Mozambique Channel Basin']
  ],

  // First matching category wins; anything unmatched is "Development".
  categoryKeywords: [
    ['Discovery', ['discover', 'spud', 'well result', 'appraisal well', 'oil show', 'finds oil', 'finds gas', 'strikes oil', 'strikes gas']],
    ['Corporate', ['exits', 'exit ', 'acquir', 'acquisition', 'farm-in', 'farm in', 'farm-out', 'farmout', 'stake', 'divest', 'merger', 'takeover', 'raises', 'funding', 'financing', 'ipo', 'shares', 'buys ', 'sells ', 'loan']],
    ['Infrastructure', ['pipeline', 'terminal', 'refinery', 'port ', 'power plant', 'storage', 'eacop', 'jetty', 'railway']],
    ['Policy', ['licen', 'bid round', 'block auction', 'regulat', 'law', 'tax', 'agreement', 'mou', 'minister', 'parliament', 'government', 'govt', 'authority', 'local content', 'trade name', 'public views', 'policy', 'cabinet', 'bill ', 'ban ']]
  ]
};
