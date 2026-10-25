import { useState, useCallback } from "react";

var KEY = "geoindex.watchlist";

function load() {
  try {
    var raw = window.localStorage.getItem(KEY);
    var arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}

function save(list) {
  try { window.localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable */ }
}

// Watched basins are stored by name and kept in this browser only.
export function useWatchlist() {
  var st = useState(load);
  var names = st[0];
  var setNames = st[1];
  var toggle = useCallback(function (name) {
    setNames(function (prev) {
      var next = prev.indexOf(name) >= 0 ? prev.filter(function (n) { return n !== name; }) : prev.concat([name]);
      save(next);
      return next;
    });
  }, []);
  return {
    names: names,
    has: function (name) { return names.indexOf(name) >= 0; },
    toggle: toggle
  };
}

// A note belongs to the watchlist when its basin tag is the start of a watched basin name.
export function noteWatched(note, names) {
  if (!note.basin) return false;
  for (var i = 0; i < names.length; i++) {
    if (names[i].indexOf(note.basin) === 0) return true;
  }
  return false;
}

export function Star(props) {
  var on = props.on;
  return (
    <button
      title={on ? "Remove from watchlist" : "Add to watchlist"}
      aria-label={on ? "Remove from watchlist" : "Add to watchlist"}
      onClick={function (e) { e.stopPropagation(); props.onClick(); }}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 2, fontSize: props.size || 14, lineHeight: 1, color: on ? "#fbbf24" : "#334155" }}>
      {on ? "★" : "☆"}
    </button>
  );
}
