ALTER TABLE livestock ADD COLUMN slug TEXT;
CREATE UNIQUE INDEX idx_livestock_slug ON livestock(slug);
