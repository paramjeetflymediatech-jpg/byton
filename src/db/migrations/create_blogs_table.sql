-- ============================================================
-- Run this in Supabase → SQL Editor
-- Creates a dedicated `blogs` table for WordPress blog content
-- ============================================================

CREATE TABLE IF NOT EXISTS blogs (
  id              BIGSERIAL PRIMARY KEY,
  wp_id           INTEGER NOT NULL UNIQUE,          -- original WordPress post ID
  slug            TEXT NOT NULL DEFAULT '',
  title           TEXT NOT NULL DEFAULT '',
  content         TEXT NOT NULL DEFAULT '',         -- full HTML content
  excerpt         TEXT NOT NULL DEFAULT '',
  featured_image  TEXT NOT NULL DEFAULT '',         -- URL of the featured image
  categories      TEXT NOT NULL DEFAULT '',         -- comma-separated category names
  tags            TEXT NOT NULL DEFAULT '',         -- comma-separated tag names
  author          TEXT NOT NULL DEFAULT '',
  status          TEXT NOT NULL DEFAULT 'publish',
  published_at    TIMESTAMPTZ,
  canonical_url   TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_blogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS blogs_updated_at ON blogs;
CREATE TRIGGER blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_blogs_updated_at();
