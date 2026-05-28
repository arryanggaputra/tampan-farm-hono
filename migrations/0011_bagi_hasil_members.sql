CREATE TABLE IF NOT EXISTS bagi_hasil_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  percentage INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO bagi_hasil_members (id, name, percentage, sort_order)
VALUES
  (lower(hex(randomblob(16))), 'Investor', 50, 1),
  (lower(hex(randomblob(16))), 'Operator', 50, 2);
