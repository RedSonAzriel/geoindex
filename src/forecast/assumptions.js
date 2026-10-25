// Default inputs for the Monte Carlo volumetric model, by basin type.
// ALL VALUES ARE ILLUSTRATIVE SCREENING ASSUMPTIONS, not measured data. Edit them as real well, core and
// analog data becomes available (see the Kenya, Tanzania and Mozambique well tables).
//
// Distributions:
//   { kind: "tri", min, mode, max }    triangular
//   { kind: "logn", p90, p10 }         lognormal, P90 = low case, P10 = high case (oil and gas convention)

export var PLAY_DEFAULTS = {
  "Rift": {
    area_fraction: { kind: "tri", min: 0.0005, mode: 0.003, max: 0.015 },
    net_pay_m: { kind: "logn", p90: 10, p10: 120 },
    porosity: { kind: "tri", min: 0.10, mode: 0.18, max: 0.26 },
    water_sat: { kind: "tri", min: 0.30, mode: 0.45, max: 0.65 },
    recovery_oil: { kind: "tri", min: 0.10, mode: 0.20, max: 0.35 },
    recovery_gas: { kind: "tri", min: 0.50, mode: 0.65, max: 0.80 },
    bo: 1.2,
    bg: 0.0045
  },
  "Passive Margin": {
    area_fraction: { kind: "tri", min: 0.0005, mode: 0.003, max: 0.015 },
    net_pay_m: { kind: "logn", p90: 15, p10: 150 },
    porosity: { kind: "tri", min: 0.12, mode: 0.22, max: 0.30 },
    water_sat: { kind: "tri", min: 0.25, mode: 0.40, max: 0.60 },
    recovery_oil: { kind: "tri", min: 0.15, mode: 0.25, max: 0.40 },
    recovery_gas: { kind: "tri", min: 0.55, mode: 0.70, max: 0.85 },
    bo: 1.25,
    bg: 0.004
  },
  "Intracratonic": {
    area_fraction: { kind: "tri", min: 0.0003, mode: 0.002, max: 0.010 },
    net_pay_m: { kind: "logn", p90: 5, p10: 60 },
    porosity: { kind: "tri", min: 0.06, mode: 0.12, max: 0.20 },
    water_sat: { kind: "tri", min: 0.30, mode: 0.50, max: 0.70 },
    recovery_oil: { kind: "tri", min: 0.08, mode: 0.15, max: 0.28 },
    recovery_gas: { kind: "tri", min: 0.40, mode: 0.55, max: 0.75 },
    bo: 1.15,
    bg: 0.005
  }
};

// "Rift / Passive Margin" basins use the rift defaults.
export function defaultsFor(type) {
  if (PLAY_DEFAULTS[type]) return PLAY_DEFAULTS[type];
  if (type && type.indexOf("Rift") === 0) return PLAY_DEFAULTS["Rift"];
  return PLAY_DEFAULTS["Passive Margin"];
}

// Chance of success by exploration status: source, reservoir, trap and seal each get a factor.
// More drilling and data means higher chances. Illustrative, edit as evidence comes in.
export var CHANCE_BY_STATUS = {
  Frontier: { source: 0.55, reservoir: 0.70, trap: 0.50, seal: 0.70 },
  Exploration: { source: 0.70, reservoir: 0.75, trap: 0.60, seal: 0.75 },
  Appraisal: { source: 0.90, reservoir: 0.90, trap: 0.80, seal: 0.85 },
  Development: { source: 0.95, reservoir: 0.95, trap: 0.90, seal: 0.90 }
};

export function chanceFor(status) {
  return CHANCE_BY_STATUS[status] || CHANCE_BY_STATUS.Exploration;
}

export var MODEL_NOTE = "Screening-level volumetric model with illustrative inputs. It is not a reserves estimate and not a substitute for a prospect evaluation.";
