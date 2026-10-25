import { useState, useEffect } from "react";

// Fetches per-basin news signals computed by the server from the live feed.
export function useFieldSignals() {
  var st = useState({ signals: {}, items: [], windowDays: 120, ready: false });
  var data = st[0];
  var setData = st[1];
  useEffect(function () {
    var dead = false;
    fetch("/api/field-intel")
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!dead) setData({ signals: j.signals || {}, items: j.items || [], windowDays: j.windowDays || 120, ready: true });
      })
      .catch(function () {});
    return function () { dead = true; };
  }, []);
  return data;
}

// A feed tag such as "Rovuma Basin" covers any basin whose name starts with it.
export function signalFor(basin, signals) {
  var tags = Object.keys(signals || {});
  for (var i = 0; i < tags.length; i++) {
    if (basin.name.indexOf(tags[i]) === 0) return { tag: tags[i], s: signals[tags[i]] };
  }
  return null;
}

var CLR = { surge: "#f59e0b", quiet: "#94a3b8", steady: "#34d399", none: "#475569" };

function describe(s, windowDays) {
  if (s.status === "surge") return s.n7 >= 3 ? s.n7 + " stories this week" : s.n30 + " stories in 30 days";
  if (s.status === "quiet") return "Quiet " + s.daysSince + "d";
  if (s.status === "steady") return s.n30 + " in 30d";
  return "No coverage " + windowDays + "d";
}

export function SignalBadge(props) {
  var found = signalFor(props.basin, props.data.signals);
  if (!props.data.ready) return null;
  if (!found) return <span style={{ color: "#334155", fontSize: 10 }}>{"—"}</span>;
  var s = found.s;
  var c = CLR[s.status];
  var label = (s.status === "surge" ? "▲ " : "") + describe(s, props.data.windowDays);
  return (
    <span title={"Last story: " + (s.last || "none") + " · " + s.n7 + " in 7d, " + s.n30 + " in 30d, " + s.prev30 + " in prior 30d"}
      style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 10, color: c, background: c + "15", border: "1px solid " + c + "30", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

export function SignalPanel(props) {
  var found = signalFor(props.basin, props.data.signals);
  if (!props.data.ready || !found) return null;
  var s = found.s;
  var c = CLR[s.status];
  var note = s.status === "surge" ? "Coverage is above its recent pace."
    : s.status === "quiet" ? "Nothing new in over 60 days."
    : s.status === "steady" ? "Coverage is at a normal pace."
    : "No stories matched this basin in the feed window.";
  return (
    <div style={{ marginBottom: 18, padding: "10px 12px", background: "#0c1322", border: "1px solid #1a2338", borderRadius: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: "#64748b" }}>News signal</span>
        <SignalBadge basin={props.basin} data={props.data} />
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8" }}>{note}</div>
      <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>
        {s.n7} in 7d {"·"} {s.n30} in 30d {"·"} {s.prev30} in prior 30d{s.last ? " · last " + s.last : ""}
      </div>
    </div>
  );
}
