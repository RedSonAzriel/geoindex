// Monte Carlo volumetric model for undiscovered recoverable resources, one basin at a time.
//
// Oil:  recoverable (m3) = A * h * phi * (1 - Sw) / Bo * RF        -> MMbbl
// Gas:  recoverable (m3) = A * h * phi * (1 - Sw) / Bg * RF        -> Tcf
// where A is the prospective closure area (basin area times an uncertain area fraction), h is net pay,
// phi is porosity, Sw is water saturation, Bo and Bg are formation volume factors, RF is the recovery factor.
//
// Porosity, water saturation and recovery factor share one latent "reservoir quality" variable, so good
// reservoirs tend to be good on all three (correlation set by `correlation`). The run is seeded, so the same
// inputs always give the same answer.
//
// Percentiles follow the oil and gas convention: P90 is the low case (90% chance of at least this much),
// P10 is the high case.

var M3_TO_BBL = 6.28981;
var M3_TO_SCF = 35.3147;

// ---------- random numbers ----------
export function makeRng(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalSample(rng) {
  var u = 0;
  while (u === 0) u = rng();
  var v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Standard normal CDF (Abramowitz and Stegun 7.1.26).
export function normCdf(x) {
  var t = 1 / (1 + 0.2316419 * Math.abs(x));
  var d = 0.3989423 * Math.exp(-x * x / 2);
  var p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x > 0 ? 1 - p : p;
}

var Z90 = 1.2815515655446004;

// ---------- distributions ----------
export function triInv(u, min, mode, max) {
  if (max <= min) return min;
  var c = (mode - min) / (max - min);
  if (u < c) return min + Math.sqrt(u * (max - min) * (mode - min));
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

export function lognInv(z, p90, p10) {
  var l90 = Math.log(p90);
  var l10 = Math.log(p10);
  var mu = (l90 + l10) / 2;
  var sigma = (l10 - l90) / (2 * Z90);
  return Math.exp(mu + sigma * z);
}

function draw(spec, u, z) {
  if (spec.kind === "logn") return lognInv(z, spec.p90, spec.p10);
  return triInv(u, spec.min, spec.mode, spec.max);
}

// ---------- statistics ----------
export function percentileLow(sorted, p) {
  // value exceeded with probability p (so P90 returns the 10th percentile of the sample)
  var q = 1 - p;
  var idx = q * (sorted.length - 1);
  var lo = Math.floor(idx);
  var hi = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

function mean(arr) {
  var s = 0;
  for (var i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function corr(x, y) {
  var mx = mean(x);
  var my = mean(y);
  var sxy = 0, sxx = 0, syy = 0;
  for (var i = 0; i < x.length; i++) {
    var dx = x[i] - mx;
    var dy = y[i] - my;
    sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
}

// Deterministic volumetric calculation for one set of inputs. Area in km2, thickness in m.
export function volumetric(fluid, area_km2, net_pay_m, porosity, water_sat, fvf, recovery) {
  var m3 = area_km2 * 1e6 * net_pay_m * porosity * (1 - water_sat) / fvf * recovery;
  return fluid === "gas" ? m3 * M3_TO_SCF / 1e12 : m3 * M3_TO_BBL / 1e6;
}

export function histogram(values, bins) {
  var min = values[0];
  var max = values[values.length - 1];
  var width = (max - min) / bins || 1;
  var counts = [];
  for (var i = 0; i < bins; i++) counts.push(0);
  for (var j = 0; j < values.length; j++) {
    var b = Math.min(bins - 1, Math.floor((values[j] - min) / width));
    counts[b]++;
  }
  return { min: min, max: max, width: width, counts: counts };
}

// ---------- the simulation ----------
// params: { fluid, basin_area_km2, inputs, chance, trials, seed, correlation, scale }
//   inputs: area_fraction, net_pay_m, porosity, water_sat, recovery (specs), fvf (number)
//   chance: { source, reservoir, trap, seal }
//   scale: multiplies the area fraction (used for calibration)
export function simulate(params) {
  var trials = params.trials || 10000;
  var rng = makeRng(params.seed === undefined ? 12345 : params.seed);
  var rho = params.correlation === undefined ? 0.4 : params.correlation;
  var sr = Math.sqrt(rho);
  var se = Math.sqrt(1 - rho);
  var scale = params.scale === undefined ? 1 : params.scale;
  var inp = params.inputs;

  var out = new Array(trials);
  var cols = { area_fraction: [], net_pay_m: [], porosity: [], water_sat: [], recovery: [] };

  for (var i = 0; i < trials; i++) {
    var zq = normalSample(rng);
    var area = draw(inp.area_fraction, rng(), normalSample(rng)) * scale;
    var h = draw(inp.net_pay_m, rng(), normalSample(rng));
    var phi = draw(inp.porosity, normCdf(sr * zq + se * normalSample(rng)), 0);
    var sw = draw(inp.water_sat, normCdf(-sr * zq + se * normalSample(rng)), 0);
    var rf = draw(inp.recovery, normCdf(sr * zq + se * normalSample(rng)), 0);
    out[i] = volumetric(params.fluid, params.basin_area_km2 * area, h, phi, sw, inp.fvf, rf);
    cols.area_fraction.push(area); cols.net_pay_m.push(h); cols.porosity.push(phi); cols.water_sat.push(sw); cols.recovery.push(rf);
  }

  // Sensitivity: correlation of each input with the result, on a log scale for the skewed ones.
  var logOut = out.map(function (v) { return Math.log(v); });
  var sens = [
    { key: "area_fraction", label: "Prospective area fraction", r: corr(cols.area_fraction.map(Math.log), logOut) },
    { key: "net_pay_m", label: "Net pay", r: corr(cols.net_pay_m.map(Math.log), logOut) },
    { key: "porosity", label: "Porosity", r: corr(cols.porosity, logOut) },
    { key: "water_sat", label: "Water saturation", r: corr(cols.water_sat, logOut) },
    { key: "recovery", label: "Recovery factor", r: corr(cols.recovery, logOut) }
  ].sort(function (a, b) { return Math.abs(b.r) - Math.abs(a.r); });

  var sorted = out.slice().sort(function (a, b) { return a - b; });
  var ch = params.chance || { source: 1, reservoir: 1, trap: 1, seal: 1 };
  var cos = ch.source * ch.reservoir * ch.trap * ch.seal;
  var m = mean(sorted);

  return {
    fluid: params.fluid,
    unit: params.fluid === "gas" ? "Tcf" : "MMbbl",
    trials: trials,
    p90: percentileLow(sorted, 0.9),
    p50: percentileLow(sorted, 0.5),
    p10: percentileLow(sorted, 0.1),
    mean: m,
    cos: cos,
    risked_mean: m * cos,
    histogram: histogram(sorted, 40),
    sensitivity: sens,
    median_area_fraction: cols.area_fraction.slice().sort(function (a, b) { return a - b; })[Math.floor(trials / 2)]
  };
}

// Finds the factor that scales the area fraction so the simulated P50 equals a target P50.
// Volume is linear in the area fraction, so one run is enough.
export function calibrationScale(params, targetP50) {
  var base = simulate(Object.assign({}, params, { scale: 1 }));
  return base.p50 > 0 ? targetP50 / base.p50 : 1;
}
