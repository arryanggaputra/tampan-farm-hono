CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE livestock (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT NOT NULL,
  weight_kg REAL,
  purchase_price INTEGER NOT NULL,
  purchase_date TEXT NOT NULL,
  vendor TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  image_url TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sales (
  id TEXT PRIMARY KEY,
  livestock_id TEXT NOT NULL,
  buyer_name TEXT NOT NULL,
  selling_price INTEGER NOT NULL,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'dp',
  sale_date TEXT NOT NULL,
  delivery_date TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (livestock_id) REFERENCES livestock(id)
);

CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  cost INTEGER NOT NULL,
  expense_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
