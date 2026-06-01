-- ============================================================
-- Run this in Supabase → SQL Editor
-- Creates a dedicated `seo` table for all SEO metadata
-- ============================================================

CREATE TABLE IF NOT EXISTS seo (
  id              BIGSERIAL PRIMARY KEY,
  page_type       TEXT NOT NULL DEFAULT '',          -- 'post', 'page', 'product', 'custom'
  page_id         TEXT NOT NULL DEFAULT '',          -- WP post/page ID or product ID
  slug            TEXT NOT NULL DEFAULT '',          -- URL slug (e.g. "best-plants")
  canonical_url   TEXT NOT NULL DEFAULT '',          -- full canonical URL
  meta_title      TEXT NOT NULL DEFAULT '',
  meta_description TEXT NOT NULL DEFAULT '',
  keywords        TEXT NOT NULL DEFAULT '',
  og_title        TEXT NOT NULL DEFAULT '',
  og_description  TEXT NOT NULL DEFAULT '',
  og_image_url    TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint so upsert works on (page_type, page_id)
CREATE UNIQUE INDEX IF NOT EXISTS seo_page_type_page_id_idx ON seo (page_type, page_id);

-- Auto-update updated_at on every change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS seo_updated_at ON seo;
CREATE TRIGGER seo_updated_at
  BEFORE UPDATE ON seo
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
