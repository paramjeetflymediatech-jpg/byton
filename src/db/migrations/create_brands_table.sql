-- ============================================================
-- Run this in Supabase → SQL Editor
-- Creates a dedicated `brands` table and populates it with 
-- the 21 initial premium horticulture brand logos.
-- ============================================================

CREATE TABLE IF NOT EXISTS brands (
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  logo_url        TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS brands_name_idx ON brands (name);

-- Auto-update updated_at on every change
CREATE OR REPLACE FUNCTION update_brands_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS brands_updated_at ON brands;
CREATE TRIGGER brands_updated_at
  BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_brands_updated_at_column();

-- Seed initial brands
INSERT INTO brands (name, logo_url) VALUES
('Brand Logo 1', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo01.avif'),
('Brand Logo 2', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo02.avif'),
('Brand Logo 3', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo03.avif'),
('Brand Logo 4', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo04.avif'),
('Brand Logo 5', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo05.avif'),
('Brand Logo 6', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo06.avif'),
('Brand Logo 7', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/LOGO07.avif'),
('Brand Logo 8', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo08.avif'),
('Brand Logo 9', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo09.avif'),
('Brand Logo 10', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo10.avif'),
('Brand Logo 11', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo11.avif'),
('Brand Logo 12', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo12.avif'),
('Brand Logo 13', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo13.avif'),
('Brand Logo 15', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo15.avif'),
('Brand Logo 15-1', 'https://baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo15-1.jpg'),
('Brand Logo 16', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo16.avif'),
('Brand Logo 17', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo17.avif'),
('Brand Logo 18', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo18.avif'),
('Brand Logo 19', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo19.avif'),
('Brand Logo 20', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo20.avif'),
('Brand Logo 21', 'https://spcdn.shortpixel.ai/spio/ret_img,q_cdnize,to_auto,s_webp:avif/baytonhorticulturecentre.co.uk/wp-content/uploads/2024/12/logo21.avif')
ON CONFLICT DO NOTHING;
