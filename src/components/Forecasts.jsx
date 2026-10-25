import React, { useState, useMemo } from "react";
import { simulate, calibrationScale } from "../forecast/montecarlo";
import { defaultsFor, chanceFor, MODEL_NOTE } from "../forecast/assumptions";

var card = { background: "#0c1322", border: "1px solid #1a2338", borderRadius: 10, padding: 16 };
var lbl = { fontSize: 11, color: "#64748b", marginBottom: 4, display: "block" };
var inp = { width: 70, background: "#080e1a", border: "1px solid #1a2338", color: "#e2e8f0", borderRadius: 5, padding: "4px 6px", fontSize: 12 };

function fmt(v, unit) {
  if (v === undefined || v === null || isNaN(v)) return "-";
  if (unit === "Tcf") return v >= 10 ? v.toFixed(1) : v.toFixed(2);
  return v >= 100 ? Math.round(v).toLocaleString() : v.toFixed(1);
}

function Kpi(props) {
  return (
    <div style={Object.assign({}, card, { padding: 12, flex: 1, minWidth: 110 })}>
      <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>{props.label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: props.color || "#e2e8f0", marginTop: 4 }}>{props.value}</div>
      <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{props.sub}</div>
    </div>
  );
}

function TriRow(props) {
  var s = props.spec;
  function set(k, raw) {
    var n = parseFloat(raw);
    if (isNaN(n)) return;
    var next = Object.assign({}, s); next[k] = n;
    props.onChange(next);
  }
  var pct = props.pct;
  var shown = function (v) { return pct ? +(v * 100).toFixed(3) : v; };
  var back = function (v) { return pct ? v / 100 : v; };
  return (
    <div style={{ marginBottom: 10 }}>
      <span style={lbl}>{props.label}{pct ? " (%)" : ""}</span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {s.kind === "logn" ? (
          <>
            <input style={inp} type="number" value={s.p90} onChange={function (e) { set("p90", e.target.value); }} />
            <span style={{ fontSize: 10, color: "#475569" }}>P90 low</span>
            <input style={inp} type="number" value={s.p10} onChange={function (e) { set("p10", e.target.value); }} />
            <span style={{ fontSize: 10, color: "#475569" }}>P10 high</span>
          </>
        ) : (
          <>
            {["min", "mode", "max"].map(function (k) {
              return (
                <React.Fragment key={k}>
                  <input style={inp} type="number" step="any" value={shown(s[k])} onChange={function (e) { set(k, back(parseFloat(e.target.value))); }} />
                  <span style={{ fontSize: 10, color: "#475569" }}>{k}</span>
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function Histogram(props) {
  var r = props.result;
  var h = r.histogram;
  var W = 640, H = 220, pad = 28;
  var max = Math.max.apply(null, h.counts);
  var bw = (W - pad * 2) / h.counts.length;
  var x = function (v) { return pad + ((v - h.min) / (h.max - h.min || 1)) * (W - pad * 2); };
  var lines = [["P90", r.p90, "#f87171"], ["P50", r.p50, "#fbbf24"], ["P10", r.p10, "#34d399"]];
  return (
    <svg viewBox={"0 0 " + W + " " + H} style={{ width: "100%", height: "auto" }} role="img" aria-label="Distribution of simulated recoverable volume">
      {h.counts.map(function (c, i) {
        var bh = (c / max) * (H - 60);
        return <rect key={i} x={pad + i * bw + 1} y={H - 30 - bh} width={bw - 2} height={bh} fill="#1e3a5f" />;
      })}
      <line x1={pad} y1={H - 30} x2={W - pad} y2={H - 30} stroke="#1a2338" />
      {lines.map(function (l) {
        return (
          <g key={l[0]}>
            <line x1={x(l[1])} x2={x(l[1])} y1={14} y2={H - 30} stroke={l[2]} strokeDasharray="4 3" />
            <text x={x(l[1])} y={10} fontSize="10" fill={l[2]} textAnchor="middle">{l[0]} {fmt(l[1], r.unit)}</text>
          </g>
        );
      })}
      <text x={pad} y={H - 12} fontSize="10" fill="#64748b">{fmt(h.min, r.unit)}</text>
      <text x={W - pad} y={H - 12} fontSize="10" fill="#64748b" textAnchor="end">{fmt(h.max, r.unit)} {r.unit} recoverable</text>
    </svg>
  );
}

function Tornado(props) {
  return (
    <div>
      {props.items.map(function (s) {
        var w = Math.abs(s.r) * 100;
        return (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 11 }}>
            <div style={{ width: 150, color: "#94a3b8" }}>{s.label}</div>
            <div style={{ flex: 1, background: "#080e1a", height: 10, borderRadius: 3 }}>
              <div style={{ width: w + "%", height: 10, borderRadius: 3, background: s.r >= 0 ? "#34d399" : "#f87171" }} />
            </div>
            <div style={{ width: 44, textAlign: "right", color: "#64748b" }}>{(s.r >= 0 ? "+" : "") + s.r.toFixed(2)}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function Forecasts(props) {
  var basins = props.basins || [];
  var _a = useState(basins.length ? basins[0].id : null), id = _a[0], setId = _a[1];
  var _b = useState("oil"), fluid = _b[0], setFluid = _b[1];
  var _c = useState(null), over = _c[0], setOver = _c[1];
  var _d = useState(false), calibrate = _d[0], setCalibrate = _d[1];
  var _e = useState(0.4), rho = _e[0], setRho = _e[1];
  var _f = useState(12345), seed = _f[0], setSeed = _f[1];

  var basin = basins.filter(function (b) { return b.id === id; })[0] || basins[0];
  var d = basin ? defaultsFor(basin.type) : null;

  var inputs = useMemo(function () {
    if (!d) return null;
    var base = {
      area_fraction: d.area_fraction, net_pay_m: d.net_pay_m, porosity: d.porosity, water_sat: d.water_sat,
      recovery: fluid === "gas" ? d.recovery_gas : d.recovery_oil, fvf: fluid === "gas" ? d.bg : d.bo
    };
    return Object.assign({}, base, over || {});
  }, [d, fluid, over]);

  var lib = basin ? (fluid === "gas" ? basin.estimated_gas_tcf : basin.estimated_oil_mmbo) : null;
  var chance = basin ? chanceFor(basin.status) : null;

  var run = useMemo(function () {
    if (!basin || !inputs) return null;
    var params = { fluid: fluid, basin_area_km2: basin.area_km2, inputs: inputs, chance: chance, trials: 10000, seed: seed, correlation: rho };
    var scale = 1;
    if (calibrate && lib && lib.p50) scale = calibrationScale(params, lib.p50);
    var res = simulate(Object.assign({}, params, { scale: scale }));
    res.scale = scale;
    return res;
  }, [basin, inputs, fluid, chance, rho, seed, calibrate, lib]);

  if (!basin) return <div style={card}>No basins loaded.</div>;

  function setInput(k, v) { var o = Object.assign({}, over || {}); o[k] = v; setOver(o); }
  function pick(v) { setId(v); setOver(null); setCalibrate(false); }
  var u = run.unit;
  var impliedPct = run.median_area_fraction * 100;

  return (
    <div>
      <div style={{ background: "#2a1f0a", border: "1px solid #5b4510", color: "#fbbf24", borderRadius: 8, padding: "10px 14px", fontSize: 12, marginBottom: 14 }}>
        {MODEL_NOTE} Defaults come from basin type; adjust them as real data arrives.
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={Object.assign({}, card, { width: 340, flexShrink: 0 })}>
          <span style={lbl}>Basin</span>
          <select value={basin.id} onChange={function (e) { pick(e.target.value); }} style={Object.assign({}, inp, { width: "100%", marginBottom: 10 })}>
            {basins.map(function (b) { return <option key={b.id} value={b.id}>{b.name} ({b.country})</option>; })}
          </select>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 12 }}>
            {basin.type} · {basin.status} · {basin.area_km2.toLocaleString()} km² · {basin.wells_drilled} wells drilled
          </div>

          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {["oil", "gas"].map(function (f) {
              return <button key={f} onClick={function () { setFluid(f); setOver(null); }} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid #1a2338", cursor: "pointer", fontSize: 12, background: fluid === f ? "#34d399" : "#080e1a", color: fluid === f ? "#04120c" : "#94a3b8" }}>{f === "oil" ? "Oil (MMbbl)" : "Gas (Tcf)"}</button>;
            })}
          </div>

          <TriRow label="Prospective area fraction of basin" pct spec={inputs.area_fraction} onChange={function (v) { setInput("area_fraction", v); }} />
          <TriRow label="Net pay (m)" spec={inputs.net_pay_m} onChange={function (v) { setInput("net_pay_m", v); }} />
          <TriRow label="Porosity" spec={inputs.porosity} onChange={function (v) { setInput("porosity", v); }} />
          <TriRow label="Water saturation" spec={inputs.water_sat} onChange={function (v) { setInput("water_sat", v); }} />
          <TriRow label="Recovery factor" spec={inputs.recovery} onChange={function (v) { setInput("recovery", v); }} />

          <span style={lbl}>{fluid === "gas" ? "Bg (rm³/sm³)" : "Bo (rb/stb)"}</span>
          <input style={Object.assign({}, inp, { marginBottom: 10 })} type="number" step="any" value={inputs.fvf} onChange={function (e) { var n = parseFloat(e.target.value); if (n > 0) setInput("fvf", n); }} />

          <span style={lbl}>Reservoir-quality correlation: {rho.toFixed(2)}</span>
          <input type="range" min="0" max="0.8" step="0.05" value={rho} onChange={function (e) { setRho(parseFloat(e.target.value)); }} style={{ width: "100%", marginBottom: 10 }} />

          <label style={{ fontSize: 12, color: lib && lib.p50 ? "#cbd5e1" : "#475569", display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
            <input type="checkbox" checked={calibrate} disabled={!(lib && lib.p50)} onChange={function (e) { setCalibrate(e.target.checked); }} />
            Calibrate to library P50
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={function () { setOver(null); setCalibrate(false); setRho(0.4); }} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid #1a2338", background: "#080e1a", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>Reset inputs</button>
            <button onClick={function () { setSeed(Math.floor(Math.random() * 1e6)); }} style={{ flex: 1, padding: "6px 0", borderRadius: 6, border: "1px solid #1a2338", background: "#080e1a", color: "#94a3b8", cursor: "pointer", fontSize: 12 }}>New random seed</button>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <Kpi label="P90 (low)" value={fmt(run.p90, u)} sub={u} color="#f87171" />
            <Kpi label="P50 (median)" value={fmt(run.p50, u)} sub={u} color="#fbbf24" />
            <Kpi label="P10 (high)" value={fmt(run.p10, u)} sub={u} color="#34d399" />
            <Kpi label="Mean" value={fmt(run.mean, u)} sub={u + " unrisked"} />
            <Kpi label="Chance of success" value={(run.cos * 100).toFixed(0) + "%"} sub={"risked mean " + fmt(run.risked_mean, u) + " " + u} />
          </div>

          <div style={Object.assign({}, card, { marginBottom: 14 })}>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>Simulated recoverable {fluid} · {run.trials.toLocaleString()} trials</div>
            <Histogram result={run} />
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <div style={Object.assign({}, card, { flex: 1, minWidth: 280 })}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>What drives the result (correlation with output)</div>
              <Tornado items={run.sensitivity} />
            </div>
            <div style={Object.assign({}, card, { flex: 1, minWidth: 280 })}>
              <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>Against the library estimate</div>
              {lib && lib.p50 ? (
                <table style={{ width: "100%", fontSize: 12, color: "#cbd5e1", borderCollapse: "collapse" }}>
                  <tbody>
                    <tr><td style={{ color: "#64748b" }}></td><td>P90</td><td>P50</td><td>P10</td></tr>
                    <tr><td style={{ color: "#64748b" }}>Library</td><td>{fmt(lib.p90, u)}</td><td>{fmt(lib.p50, u)}</td><td>{fmt(lib.p10, u)}</td></tr>
                    <tr><td style={{ color: "#64748b" }}>Model</td><td>{fmt(run.p90, u)}</td><td>{fmt(run.p50, u)}</td><td>{fmt(run.p10, u)}</td></tr>
                  </tbody>
                </table>
              ) : <div style={{ fontSize: 12, color: "#64748b" }}>No library estimate for this basin and fluid.</div>}
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 10, lineHeight: 1.5 }}>
                Median prospective area implied by these inputs: {impliedPct.toFixed(3)}% of basin
                ({Math.round(basin.area_km2 * run.median_area_fraction).toLocaleString()} km²).
                {calibrate ? " Calibrated: area fraction scaled ×" + run.scale.toFixed(2) + " so the model P50 matches the library P50." : " Tick “Calibrate” to rescale this to match the library P50; the implied fraction then shows what the library estimate assumes."}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 8, lineHeight: 1.5 }}>
                Chance of success = source {chance.source} × reservoir {chance.reservoir} × trap {chance.trap} × seal {chance.seal}, set by basin status ({basin.status}).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
