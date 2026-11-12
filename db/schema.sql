-- ══════════════════════════════════════════════════════════════════
-- GeoIndex — Full Database Schema
-- PostgreSQL 14+
-- ══════════════════════════════════════════════════════════════════

-- ── BASINS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS basins (
  id              VARCHAR(50) PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  country         VARCHAR(100) NOT NULL,
  type            VARCHAR(100),
  status          VARCHAR(50) CHECK (status IN ('Frontier','Exploration','Appraisal','Development')),
  area_km2        INTEGER,
  depth_m_min     INTEGER,
  depth_m_max     INTEGER,
  formations      TEXT[],
  plays           TEXT[],
  oil_p90         NUMERIC,
  oil_p50         NUMERIC,
  oil_p10         NUMERIC,
  gas_p90         NUMERIC,
  gas_p50         NUMERIC,
  gas_p10         NUMERIC,
  wells_drilled   INTEGER DEFAULT 0,
  discovery_year  INTEGER,
  lat             NUMERIC(8,4),
  lng             NUMERIC(8,4),
  polygon         JSONB,
  source          TEXT,
  notes           TEXT,
  -- Petrophysical data
  petro_toc       NUMERIC,
  petro_porosity  NUMERIC,
  petro_perm      NUMERIC,
  petro_sw        NUMERIC,
  petro_netpay    NUMERIC,
  petro_td        NUMERIC,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  is_uploaded     BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_basins_country ON basins (country);
CREATE INDEX idx_basins_status ON basins (status);

-- ── FIELD NOTES ────────────────────────────────────────────────
-- Curated Africa E&P industry intelligence (DrillSource-style)
CREATE TABLE IF NOT EXISTS field_notes (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(500) NOT NULL,
  body            TEXT NOT NULL,
  published_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  source_name     VARCHAR(200),
  source_url      TEXT,
  countries       TEXT[] DEFAULT '{}',
  basin_ids       TEXT[] DEFAULT '{}',
  tags            TEXT[] DEFAULT '{}',
  category        VARCHAR(50) CHECK (category IN (
    'Discovery','Licensing','Drilling','Production',
    'Infrastructure','Policy','M&A','Market','ESG'
  )),
  author          VARCHAR(200) DEFAULT 'GeoIndex Editorial',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_fn_published ON field_notes (published_at DESC);
CREATE INDEX idx_fn_countries ON field_notes USING GIN (countries);
CREATE INDEX idx_fn_tags ON field_notes USING GIN (tags);
CREATE INDEX idx_fn_category ON field_notes (category);

-- Attachments for field notes
CREATE TABLE IF NOT EXISTS field_files (
  id              SERIAL PRIMARY KEY,
  note_id         INTEGER REFERENCES field_notes(id) ON DELETE CASCADE,
  filename        VARCHAR(300) NOT NULL,
  file_url        TEXT NOT NULL,
  file_type       VARCHAR(50),
  file_size_kb    INTEGER
);

-- ── OFS METRICS ────────────────────────────────────────────────
-- Wells drilled per country/basin/year
CREATE TABLE IF NOT EXISTS ofs_wells (
  id              SERIAL PRIMARY KEY,
  country         VARCHAR(100) NOT NULL,
  basin_id        VARCHAR(50) REFERENCES basins(id),
  year            INTEGER NOT NULL,
  operator        VARCHAR(200),
  parent_company  VARCHAR(200),
  well_name       VARCHAR(200),
  well_type       VARCHAR(50) CHECK (well_type IN (
    'Exploration','Appraisal','Development','Workover'
  )),
  spud_date       DATE,
  td_date         DATE,
  td_ft           INTEGER,
  result          VARCHAR(50) CHECK (result IN (
    'Oil Discovery','Gas Discovery','Oil & Gas','Dry','Suspended','Drilling'
  )),
  rig_name        VARCHAR(200),
  lat             NUMERIC(8,4),
  lng             NUMERIC(8,4),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ofs_wells_country ON ofs_wells (country);
CREATE INDEX idx_ofs_wells_year ON ofs_wells (year);
CREATE INDEX idx_ofs_wells_operator ON ofs_wells (operator);

-- OFS spending by service category
CREATE TABLE IF NOT EXISTS ofs_spending (
  id              SERIAL PRIMARY KEY,
  country         VARCHAR(100) NOT NULL,
  basin_id        VARCHAR(50) REFERENCES basins(id),
  year            INTEGER NOT NULL,
  quarter         INTEGER CHECK (quarter BETWEEN 1 AND 4),
  operator        VARCHAR(200),
  parent_company  VARCHAR(200),
  -- Service categories (USD thousands)
  cement          NUMERIC DEFAULT 0,
  casing_wh       NUMERIC DEFAULT 0,
  directional     NUMERIC DEFAULT 0,
  driller         NUMERIC DEFAULT 0,
  frac            NUMERIC DEFAULT 0,
  mud             NUMERIC DEFAULT 0,
  pipe            NUMERIC DEFAULT 0,
  logging         NUMERIC DEFAULT 0,
  completion      NUMERIC DEFAULT 0,
  other           NUMERIC DEFAULT 0,
  total_spend     NUMERIC GENERATED ALWAYS AS (
    cement + casing_wh + directional + driller + frac + mud + pipe + logging + completion + other
  ) STORED,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ofs_spend_country ON ofs_spending (country);
CREATE INDEX idx_ofs_spend_year ON ofs_spending (year);
CREATE INDEX idx_ofs_spend_parent ON ofs_spending (parent_company);

-- ── HELPER: updated_at trigger ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER basins_updated
  BEFORE UPDATE ON basins
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();
