-- Seed: admin user (password: password123, hashed with PBKDF2-SHA256)
-- Run: wrangler d1 execute DB --local --file=migrations/seed.sql
-- For production: wrangler d1 execute DB --remote --file=migrations/seed.sql
INSERT OR REPLACE INTO users (id, email, password_hash, name)
VALUES (
  'e077fd50-88db-435d-ba58-d1cd1ef88ab8',
  'arry@peternaktampan.com',
  'S3b/48VKMWVwlSj9wrfi/O6hOiNKsMCBdm/iZ+Y6T3MWvuR2J8RiuLrzFbrhugN+',
  'Arryangga'
);

-- Livestock inventory based on actual business transactions
INSERT INTO livestock (id, name, type, weight_kg, purchase_price, purchase_date, vendor, status, notes)
VALUES
  -- Sold items
  ('lst-001', 'Domba Jambul', 'Domba', 45, 3500000, '2026-05-01', 'SMK Izzudin', 'sold', 'BB 45kg, berjambul, sold at 3.3M'),
  ('lst-002', 'Dorper', 'Domba', 70, 4200000, '2026-05-08', 'Vendor Riyan', 'sold', 'BB 70kg, sold same day'),

  -- Available for sale
  ('lst-003', 'Domba Putih BB 45', 'Domba', 45, 4000000, '2026-05-02', 'SMK Izzudin', 'available', 'BB 45kg, belum terjual'),
  ('lst-004', 'Kambing BB 55', 'Kambing', 55, 4500000, '2026-05-03', 'SMK Izzudin', 'available', 'BB 55kg, coklat'),
  ('lst-005', 'Sapi Besar', 'Sapi', 200, 5500000, '2026-05-04', 'Vendor Pasuruan', 'available', 'Kondisi: sembuh dari luka mulut, offered at 5.3M'),
  ('lst-006', 'Merino Tanduk Batur', 'Domba', 70, 4250000, '2026-05-09', 'Vendor Timur', 'available', 'BB 70kg, grade tinggi'),

  -- Reserved/pending
  ('lst-007', 'Domba Ekonomis 1', 'Domba', 30, 2000000, '2026-05-05', 'SMK Izzudin', 'available', 'Kelas ekonomis'),
  ('lst-008', 'Domba Ekonomis 2', 'Domba', 32, 2100000, '2026-05-05', 'SMK Izzudin', 'available', 'Kelas ekonomis');

-- Expenses from business operations
INSERT INTO expenses (id, category, description, cost, expense_date)
VALUES
  -- Cage construction
  ('exp-001', 'Infrastruktur', 'Kayu kandang 4m x 1.2m (glugu, papan, 3x5, 4x6, triplek)', 2300000, '2026-03-28'),
  ('exp-002', 'Infrastruktur', 'Ongkir kayu (2x angkut)', 150000, '2026-03-28'),
  ('exp-003', 'Infrastruktur', 'Seng galvalum untuk atap kandang', 500000, '2026-03-29'),
  ('exp-004', 'Infrastruktur', 'Paku dan baut kandang', 150000, '2026-03-29'),
  ('exp-005', 'Infrastruktur', 'Paralon untuk air ke kandang', 60000, '2026-03-29'),

  -- Medical expenses
  ('exp-006', 'Kesehatan', 'Super Tetra untuk sapi sakit', 50000, '2026-05-07'),
  ('exp-007', 'Kesehatan', 'Wepol, Bayclin untuk perawatan', 15000, '2026-05-06'),
  ('exp-008', 'Kesehatan', 'Jeruk nipis dan garam untuk obat mata', 10000, '2026-05-06'),

  -- Operational expenses
  ('exp-009', 'Operasional', 'Seragam tim jagal (7 kaos: L, L, XL, XL, XL, XL, XXL)', 350000, '2026-05-05'),
  ('exp-010', 'Operasional', 'Sharpening dan tas pisau (pinjam virtual Arryangga)', 200000, '2026-05-05'),
  ('exp-011', 'Operasional', 'Cat logo Ternak Tampan di domba', 50000, '2026-05-07'),

  -- Feed expenses
  ('exp-012', 'Pakan', 'Rumput dan pakan tambahan', 250000, '2026-05-01'),
  ('exp-013', 'Pakan', 'Pakan untuk maintenance 10 hari', 400000, '2026-05-05');

-- Sales records
INSERT INTO sales (id, livestock_id, buyer_name, selling_price, amount_paid, payment_status, sale_date, delivery_date, notes)
VALUES
  ('sal-001', 'lst-001', 'Customer Sidoarjo', 3300000, 3300000, 'paid', '2026-05-07', '2026-05-10', 'Termasuk ongkir dan perawatan'),
  ('sal-002', 'lst-002', 'Customer Bangil', 4200000, 4200000, 'paid', '2026-05-09', '2026-05-09', 'Sold same day, pickup langsung'),
  ('sal-003', 'lst-005', 'Pelanggan Kerupuk', 5300000, 0, 'pending', '2026-05-09', '2026-05-12', 'Deal harga 5.3M, menunggu DP setelah mantau Senin');
