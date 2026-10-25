import { test } from "node:test";
import assert from "node:assert/strict";
import { volumetric, simulate, triInv, lognInv, makeRng, percentileLow, calibrationScale } from "../src/forecast/montecarlo.js";
import { defaultsFor, chanceFor } from "../src/forecast/assumptions.js";

function paramsFor(fluid) {
  var d = defaultsFor("Rift");
  return {
    fluid: fluid, basin_area_km2: 10000, trials: 4000, seed: 7, correlation: 0.4,
    inputs: { area_fraction: d.area_fraction, net_pay_m: d.net_pay_m, porosity: d.porosity, water_sat: d.water_sat, recovery: fluid === "gas" ? d.recovery_gas : d.recovery_oil, fvf: fluid === "gas" ? d.bg : d.bo },
    chance: chanceFor("Frontier")
  };
}

test("oil volumetric matches a hand calculation", function () {
  // 100 km2 x 1e6 = 1e8 m2; x 20 m x 0.2 x 0.7 / 1.2 x 0.25 = 5.8333e7 m3 = 366.9 MMbbl
  var v = volumetric("oil", 100, 20, 0.2, 0.3, 1.2, 0.25);
  assert.ok(Math.abs(v - 366.9) < 0.5, "got " + v);
});

test("gas volumetric matches a hand calculation", function () {
  // 100 km2, 20 m, phi 0.2, Sw 0.3, Bg 0.004, RF 0.7: 1e8*20*0.2*0.7/0.004*0.7 = 4.9e10 m3 = 1.73 Tcf
  var v = volumetric("gas", 100, 20, 0.2, 0.3, 0.004, 0.7);
  assert.ok(Math.abs(v - 1.73) < 0.01, "got " + v);
});

test("same seed gives identical results, different seed differs", function () {
  var a = simulate(paramsFor("oil"));
  var b = simulate(paramsFor("oil"));
  var c = simulate(Object.assign({}, paramsFor("oil"), { seed: 8 }));
  assert.equal(a.p50, b.p50);
  assert.notEqual(a.p50, c.p50);
});

test("P90 <= P50 <= P10 and the mean sits above the median for skewed inputs", function () {
  ["oil", "gas"].forEach(function (f) {
    var r = simulate(paramsFor(f));
    assert.ok(r.p90 <= r.p50 && r.p50 <= r.p10, f);
    assert.ok(r.mean > r.p50, f);
    assert.ok(r.p90 > 0, f);
  });
});

test("risked mean equals mean times chance of success", function () {
  var r = simulate(paramsFor("oil"));
  assert.ok(Math.abs(r.risked_mean - r.mean * r.cos) < 1e-9);
  assert.ok(r.cos > 0 && r.cos < 1);
});

test("triangular and lognormal inverses behave", function () {
  assert.equal(triInv(0, 1, 2, 3), 1);
  assert.equal(triInv(1, 1, 2, 3), 3);
  assert.ok(Math.abs(triInv(0.5, 1, 2, 3) - 2) < 1e-9);
  // P90 low case is the 10th percentile: z = -1.2816 gives p90, z = +1.2816 gives p10
  assert.ok(Math.abs(lognInv(-1.2815515655, 10, 100) - 10) < 1e-6);
  assert.ok(Math.abs(lognInv(1.2815515655, 10, 100) - 100) < 1e-6);
});

test("percentile convention: P90 is the low case", function () {
  var s = []; for (var i = 1; i <= 101; i++) s.push(i);
  assert.equal(percentileLow(s, 0.5), 51);
  assert.ok(percentileLow(s, 0.9) < percentileLow(s, 0.1));
});

test("rng is uniform enough and in range", function () {
  var r = makeRng(1); var sum = 0;
  for (var i = 0; i < 10000; i++) { var x = r(); assert.ok(x >= 0 && x < 1); sum += x; }
  assert.ok(Math.abs(sum / 10000 - 0.5) < 0.02);
});

test("calibration scales the P50 onto the target", function () {
  var p = paramsFor("oil");
  var scale = calibrationScale(p, 500);
  var r = simulate(Object.assign({}, p, { scale: scale }));
  assert.ok(Math.abs(r.p50 - 500) < 0.5, "got " + r.p50);
});

test("sensitivity ranks area fraction and net pay above porosity for default inputs", function () {
  var r = simulate(paramsFor("oil"));
  assert.ok(["area_fraction", "net_pay_m"].indexOf(r.sensitivity[0].key) >= 0, r.sensitivity[0].key);
});
