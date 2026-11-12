# GeoIndex — Session Handoff

## Project Overview
**GeoIndex** is a geological basin data explorer for East Africa & Horn of Africa — an African equivalent of DrillSource (Spears & Associates). Covers 24 sedimentary basins across 7 countries (Kenya, Tanzania, Mozambique, Ethiopia, Somalia, Eritrea, Rwanda).

- **Repo**: github.com/RedSonAzriel/geoindex
- **Deployed**: ulwazifuan.herokuapp.com
- **Stack**: React 18 + Vite 5 + Express static server on Heroku (Node 18.x)
- **Map**: Leaflet with OpenTopoMap tiles (NOT SVG/Mercator)

## Current State of Files

### Existing in repo (deployed):
- `src/App.jsx` — Single-file React app (478 lines), Leaflet map, sidebar nav, KPI cards, basin table, detail drawer
- `package.json`, `server.js`, `vite.config.js`, `Procfile`, `index.html`, `src/main.jsx`

### NEW files created this session (need to be committed):
```
db/schema.sql                          — Full Postgres schema (basins, field_notes, ofs_wells, ofs_spending tables)
src/data/fieldNotes.js                 — 10 seed entries of curated Africa E&P news
src/data/ofsMetrics.js                 — 19 wells + 18 spending records (DrillSource-style)
src/data/infrastructure.js             — Ports(18), airports(15), pipelines(8), power lines(10), roads(8) + proximity scoring
src/components/FieldNotes.jsx          — Category filter tabs, search, expandable cards with source attribution
src/components/OFSMetrics.jsx          — Country/year filters, KPIs, donut chart, wells table, parent company stacked bars
src/components/InfraOverlay.jsx        — Leaflet-compatible: useInfraLayer hook, InfraLegend, DevReadiness (0-100 score)
```

## What's Been Completed
1. ✅ Postgres schema (`db/schema.sql`)
2. ✅ Field Notes component + seed data
3. ✅ OFS Metrics component + seed data (DrillSource-style)
4. ✅ Infrastructure data + proximity/readiness scoring functions
5. ✅ InfraOverlay rewritten for Leaflet (was SVG/Mercator — now uses `L.circleMarker`, `L.polyline`, `L.layerGroup`)

## What Still Needs to Be Done

### Task 5 (was in progress): Wire new features into App.jsx
Update `src/App.jsx` to:
1. Add nav items: `{id:"notes", label:"Field Notes", icon:...}` and `{id:"ofs", label:"OFS Metrics", icon:...}` to `NAV_ITEMS` array
2. Import `FieldNotes` from `./components/FieldNotes` and `OFSMetrics` from `./components/OFSMetrics`
3. Add page routing in the render — when `page === "notes"` show `<FieldNotes/>`, when `page === "ofs"` show `<OFSMetrics/>`
4. Update header title/breadcrumb to reflect current page
5. Import `useInfraLayer` and `InfraLegend` from `./components/InfraOverlay`
6. Add infrastructure layer dropdown to MapPanel (ports/airports/pipelines/power/roads/none)
7. Call `useInfraLayer(mapRef, activeLayer, leafletReady)` inside MapPanel
8. Add `<InfraLegend activeLayer={activeLayer}/>` below the status legend
9. Import `DevReadiness` from `./components/InfraOverlay` and add it to the Drawer component

### Other pending work:
- Deploy Postgres backend (schema ready in `db/schema.sql`)
- Fix forecast P50 area fraction (30% → 3%) in the Forecasts page (marked `soon:true`)
- Add basin polygon overlays on the Leaflet map
- Send completed files to user (can't push — Claude GitHub App not installed for user's org)

## Design System
- Dark navy theme: `#080e1a` bg, `#0c1322` cards, `#1a2338` borders, `#34d399` accent green, `#e2e8f0` text
- Status colors: Frontier=`#a78bfa`, Exploration=`#fbbf24`, Appraisal=`#60a5fa`, Development=`#34d399`
- Font: Inter (loaded from Google Fonts)
- All new components use `var` and `function()` syntax (not arrow functions) to avoid blank screen bugs seen in earlier sessions

## Critical Notes
- **Leaflet, not SVG**: The map is Leaflet-based. InfraOverlay was rewritten to use `L.circleMarker`/`L.polyline`/`L.layerGroup` instead of SVG `pr()` projection. The `useInfraLayer` export is a React hook that takes `(mapRef, activeLayer, leafletReady)`.
- **Can't push to GitHub from cloud session**: Claude GitHub App not installed for RedSonAzriel org. Files need to be sent to user to commit manually.
- **User is on a different Windows laptop** than the one with the RedSonAzriel GitHub account signed in.
- **Blank screen history**: Previous sessions had crashes from optional chaining, SVG feDropShadow filter, and arrow functions in some contexts. New components avoid these patterns.

## File Locations in Cloud Session
All files are at `/home/claude/geoindex/` — a clone of the repo with the new files added on top.
