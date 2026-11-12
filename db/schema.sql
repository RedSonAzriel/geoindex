-- GeoIndex Postgres schema (PostgreSQL 12+). Portable: works on Heroku Postgres, Neon, Supabase or self-hosted.
-- Not applied anywhere yet. Seed data currently lives in src/App.jsx and src/data/*.js.
-- Resource ranges follow the app's convention: P90 is the low case and P10 the high case (p90 <= p50 <= p10).

BEGIN;

CREATE TABLE IF NOT EXISTS basins (
  id              text PRIMARY KEY,                 -- e.g. 'lamu', 'rovuma_off'
  name            text NOT NULL,
  country         text NOT NULL,
  type            text NOT NULL,                    -- Rift, Passive Margin, Intracratonic, ...
  status          text NOT NULL CHECK (status IN ('Frontier', 'Exploration', 'Appraisal', 'Development')),
  area_km2        integer CHECK (area_km2 > 0),
  depth_min_m     integer,
  depth_max_m     integer,
  formations      text[] NOT NULL DEFAULT '{}',
  plays           text[] NOT NULL DEFAULT '{}',
  oil_mmbo_p90    numeric,
  oil_mmbo_p50    numeric,
  oil_mmbo_p10    numeric,
  gas_tcf_p90     numeric,
  gas_tcf_p50     numeric,
  gas_tcf_p10     numeric,
  wells_drilled   integer NOT NULL DEFAULT 0 CHECK (wells_drilled >= 0),
  discovery_year  integer,
  lat             numeric(8, 5) NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng             numeric(8, 5) NOT NULL CHECK (lng BETWEEN -180 AND 180),
  source          text,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT basins_depth_order CHECK (depth_min_m IS NULL OR depth_max_m IS NULL OR depth_min_m <= depth_max_m),
  CONSTRAINT basins_oil_order CHECK (oil_mmbo_p90 IS NULL OR (oil_mmbo_p90 <= oil_mmbo_p50 AND oil_mmbo_p50 <= oil_mmbo_p10)),
  CONSTRAINT basins_gas_order CHECK (gas_tcf_p90 IS NULL OR (gas_tcf_p90 <= gas_tcf_p50 AND gas_tcf_p50 <= gas_tcf_p10))
);
CREATE INDEX IF NOT EXISTS basins_country_idx ON basins (country);
CREATE INDEX IF NOT EXISTS basins_status_idx ON basins (status);

-- Field Notes: live RSS items and curated reference entries.
CREATE TABLE IF NOT EXISTS field_notes (
  id          text PRIMARY KEY,                     -- app id, e.g. 'live-1x2y3z' or 'fn-eacop-fid'
  note_date   date NOT NULL,
  category    text NOT NULL CHECK (category IN ('Discovery', 'Development', 'Corporate', 'Infrastructure', 'Policy')),
  country     text NOT NULL,
  basin_id    text REFERENCES basins (id) ON DELETE SET NULL,
  basin_label text,                                 -- free text when no matching basin row
  title       text NOT NULL,
  summary     text,
  detail      text,
  source      text,
  url         text UNIQUE,                          -- upsert key for live items; NULL for curated entries
  is_live     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS field_notes_date_idx ON field_notes (note_date DESC);
CREATE INDEX IF NOT EXISTS field_notes_category_idx ON field_notes (category);
CREATE INDEX IF NOT EXISTS field_notes_country_idx ON field_notes (country);

-- One row per feed refresh. Same idea as a freshness stamp: /api/health reads the newest successful row.
CREATE TABLE IF NOT EXISTS feed_runs (
  id            bigserial PRIMARY KEY,
  fetched_at    timestamptz NOT NULL DEFAULT now(),
  ok            boolean NOT NULL,
  record_count  integer NOT NULL DEFAULT 0,
  error         text,
  feeds         jsonb NOT NULL DEFAULT '[]'::jsonb  -- per-feed {name, ok, count, error}
);
CREATE INDEX IF NOT EXISTS feed_runs_fetched_idx ON feed_runs (fetched_at DESC);

-- OFS Metrics
CREATE TABLE IF NOT EXISTS ofs_wells (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  country     text NOT NULL,
  basin_id    text REFERENCES basins (id) ON DELETE SET NULL,
  basin_label text,
  operator    text,
  year        integer CHECK (year BETWEEN 1900 AND 2100),
  well_type   text CHECK (well_type IN ('Exploration', 'Appraisal', 'Development')),
  result      text,                                 -- e.g. 'Gas discovery', 'Oil discovery', 'Dry'
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ofs_wells_country_year_idx ON ofs_wells (country, year);

CREATE TABLE IF NOT EXISTS ofs_spending (
  id              text PRIMARY KEY,
  country         text NOT NULL,
  year            integer NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  category        text NOT NULL CHECK (category IN ('Drilling', 'Seismic', 'Development', 'Facilities')),
  parent_company  text NOT NULL,
  usd_m           numeric NOT NULL CHECK (usd_m >= 0),
  is_placeholder  boolean NOT NULL DEFAULT true,    -- flip to false only for sourced figures
  source          text,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ofs_spending_country_year_idx ON ofs_spending (country, year);
CREATE INDEX IF NOT EXISTS ofs_spending_parent_idx ON ofs_spending (parent_company);

COMMIT;
