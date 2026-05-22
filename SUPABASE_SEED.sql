-- ============================================================
-- STATIC WEARS — COMPREHENSIVE DEMO DATA
-- Run this AFTER running SUPABASE_SCHEMA.sql
-- ============================================================

-- ============================================================
-- BRAND
-- ============================================================
INSERT INTO brands (id, name, slug, description) VALUES
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Static Wears', 'static-wears', 'Our in-house streetwear label — born in Sri Lanka')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (id, name, slug, description) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'T-Shirts',     't-shirts',     'Classic and graphic tees'),
  ('c0000001-0000-0000-0000-000000000002', 'Hoodies',      'hoodies',      'Pullover and zip hoodies'),
  ('c0000001-0000-0000-0000-000000000003', 'Caps',         'caps',         'Snapbacks and fitted caps'),
  ('c0000001-0000-0000-0000-000000000004', 'Accessories',  'accessories',  'Bags, socks, and more')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCTS (10 products)
-- ============================================================
INSERT INTO products (id, name, slug, description, base_price, brand_id, status) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'Static Core Tee',      'static-core-tee',
   'The foundation piece. 100% combed cotton. Drop shoulder. Relaxed fit. Made for the streets of Colombo.',
   2800, 'a1b2c3d4-0000-0000-0000-000000000001', 'active'),

  ('b0000001-0000-0000-0000-000000000002', 'Voltage Graphic Tee',  'voltage-graphic-tee',
   'High-voltage screen print. Heavy 280gsm fabric. Limited run — 50 units only.',
   3500, 'a1b2c3d4-0000-0000-0000-000000000001', 'active'),

  ('b0000001-0000-0000-0000-000000000003', 'Island Tribe Tee',     'island-tribe-tee',
   'Sri Lanka pride graphic. Inspired by traditional patterns reimagined for street culture.',
   3200, 'a1b2c3d4-0000-0000-0000-000000000001', 'active'),

  ('b0000001-0000-0000-0000-000000000004', 'Blackout Tee',         'blackout-tee',
   'Pure minimal. All black, embroidered logo. No compromises.',
   2600, 'a1b2c3d4-0000-0000-0000-000000000001', 'active'),

  ('b0000001-0000-0000-0000-000000000005', 'Static Pullover Hoodie', 'static-pullover-hoodie',
   '400gsm French terry. Kangaroo pocket. Embroidered chest logo. Built for cool nights and cooler fits.',
   6800, 'a1b2c3d4-0000-0000-0000-000000000001', 'active'),

  ('b0000001-0000-0000-0000-000000000006', 'Archive Zip Hoodie',   'archive-zip-hoodie',
   'Full zip. Heavy fleece. Dropped shoulders. The layering piece you actually need.',
   7500, 'a1b2c3d4-0000-0000-0000-000000000001', 'active'),

  ('b0000001-0000-0000-0000-000000000007', 'Static Snapback',      'static-snapback',
   '6-panel structured snapback. Embroidered flame logo. One size fits most.',
   2200, 'a1b2c3d4-0000-0000-0000-000000000001', 'active'),

  ('b0000001-0000-0000-0000-000000000008', 'Drop Dad Cap',         'drop-dad-cap',
   'Unstructured 6-panel. Washed cotton. Low profile. Logo patch front.',
   1900, 'a1b2c3d4-0000-0000-0000-000000000001', 'active'),

  ('b0000001-0000-0000-0000-000000000009', 'Static Tote Bag',      'static-tote-bag',
   'Heavy canvas 12oz. Screen printed logo. Reinforced handles. Carry everything, regret nothing.',
   1600, 'a1b2c3d4-0000-0000-0000-000000000001', 'active'),

  ('b0000001-0000-0000-0000-000000000010', 'Frequency Tee',        'frequency-tee',
   'Abstract wave print. Oversized fit. Washed-out aesthetic for that worn-in feel.',
   3800, 'a1b2c3d4-0000-0000-0000-000000000001', 'active')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- PRODUCT ↔ CATEGORY LINKS
-- ============================================================
INSERT INTO product_categories (product_id, category_id) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001'),
  ('b0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001'),
  ('b0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001'),
  ('b0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000001'),
  ('b0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000002'),
  ('b0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000002'),
  ('b0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000003'),
  ('b0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000003'),
  ('b0000001-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000004'),
  ('b0000001-0000-0000-0000-000000000010', 'c0000001-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PRODUCT VARIANTS
-- Tees: S/M/L/XL × Black/White/Navy
-- Hoodies: S/M/L/XL × Black/Khaki
-- Caps: One Size × Black/White
-- Accessories: One Size × Black
-- ============================================================

-- Static Core Tee
INSERT INTO product_variants (product_id, size, color, stock_qty, price_adj, sku) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'S',  'Black', 15, 0,    'SCT-S-BLK'),
  ('b0000001-0000-0000-0000-000000000001', 'M',  'Black', 22, 0,    'SCT-M-BLK'),
  ('b0000001-0000-0000-0000-000000000001', 'L',  'Black', 18, 0,    'SCT-L-BLK'),
  ('b0000001-0000-0000-0000-000000000001', 'XL', 'Black', 10, 0,    'SCT-XL-BLK'),
  ('b0000001-0000-0000-0000-000000000001', 'S',  'White', 12, 0,    'SCT-S-WHT'),
  ('b0000001-0000-0000-0000-000000000001', 'M',  'White', 20, 0,    'SCT-M-WHT'),
  ('b0000001-0000-0000-0000-000000000001', 'L',  'White', 14, 0,    'SCT-L-WHT'),
  ('b0000001-0000-0000-0000-000000000001', 'XL', 'White', 8,  0,    'SCT-XL-WHT'),
  ('b0000001-0000-0000-0000-000000000001', 'S',  'Navy',  8,  200,  'SCT-S-NVY'),
  ('b0000001-0000-0000-0000-000000000001', 'M',  'Navy',  15, 200,  'SCT-M-NVY'),
  ('b0000001-0000-0000-0000-000000000001', 'L',  'Navy',  3,  200,  'SCT-L-NVY')
ON CONFLICT (sku) DO NOTHING;

-- Voltage Graphic Tee
INSERT INTO product_variants (product_id, size, color, stock_qty, price_adj, sku) VALUES
  ('b0000001-0000-0000-0000-000000000002', 'S',  'Black', 8,  0,  'VGT-S-BLK'),
  ('b0000001-0000-0000-0000-000000000002', 'M',  'Black', 12, 0,  'VGT-M-BLK'),
  ('b0000001-0000-0000-0000-000000000002', 'L',  'Black', 10, 0,  'VGT-L-BLK'),
  ('b0000001-0000-0000-0000-000000000002', 'XL', 'Black', 5,  0,  'VGT-XL-BLK'),
  ('b0000001-0000-0000-0000-000000000002', 'M',  'White', 7,  0,  'VGT-M-WHT'),
  ('b0000001-0000-0000-0000-000000000002', 'L',  'White', 3,  0,  'VGT-L-WHT')
ON CONFLICT (sku) DO NOTHING;

-- Island Tribe Tee
INSERT INTO product_variants (product_id, size, color, stock_qty, price_adj, sku) VALUES
  ('b0000001-0000-0000-0000-000000000003', 'S',  'Black',  10, 0,    'ITT-S-BLK'),
  ('b0000001-0000-0000-0000-000000000003', 'M',  'Black',  15, 0,    'ITT-M-BLK'),
  ('b0000001-0000-0000-0000-000000000003', 'L',  'Black',  12, 0,    'ITT-L-BLK'),
  ('b0000001-0000-0000-0000-000000000003', 'XL', 'Black',  6,  0,    'ITT-XL-BLK'),
  ('b0000001-0000-0000-0000-000000000003', 'S',  'Khaki',  7,  300,  'ITT-S-KHK'),
  ('b0000001-0000-0000-0000-000000000003', 'M',  'Khaki',  9,  300,  'ITT-M-KHK'),
  ('b0000001-0000-0000-0000-000000000003', 'L',  'Khaki',  2,  300,  'ITT-L-KHK')
ON CONFLICT (sku) DO NOTHING;

-- Blackout Tee
INSERT INTO product_variants (product_id, size, color, stock_qty, price_adj, sku) VALUES
  ('b0000001-0000-0000-0000-000000000004', 'S',  'Black', 20, 0, 'BOT-S-BLK'),
  ('b0000001-0000-0000-0000-000000000004', 'M',  'Black', 25, 0, 'BOT-M-BLK'),
  ('b0000001-0000-0000-0000-000000000004', 'L',  'Black', 18, 0, 'BOT-L-BLK'),
  ('b0000001-0000-0000-0000-000000000004', 'XL', 'Black', 12, 0, 'BOT-XL-BLK')
ON CONFLICT (sku) DO NOTHING;

-- Static Pullover Hoodie
INSERT INTO product_variants (product_id, size, color, stock_qty, price_adj, sku) VALUES
  ('b0000001-0000-0000-0000-000000000005', 'S',  'Black', 10, 0,   'SPH-S-BLK'),
  ('b0000001-0000-0000-0000-000000000005', 'M',  'Black', 14, 0,   'SPH-M-BLK'),
  ('b0000001-0000-0000-0000-000000000005', 'L',  'Black', 11, 0,   'SPH-L-BLK'),
  ('b0000001-0000-0000-0000-000000000005', 'XL', 'Black', 6,  0,   'SPH-XL-BLK'),
  ('b0000001-0000-0000-0000-000000000005', 'S',  'Khaki', 6,  500, 'SPH-S-KHK'),
  ('b0000001-0000-0000-0000-000000000005', 'M',  'Khaki', 8,  500, 'SPH-M-KHK'),
  ('b0000001-0000-0000-0000-000000000005', 'L',  'Khaki', 4,  500, 'SPH-L-KHK'),
  ('b0000001-0000-0000-0000-000000000005', 'XL', 'Khaki', 2,  500, 'SPH-XL-KHK')
ON CONFLICT (sku) DO NOTHING;

-- Archive Zip Hoodie
INSERT INTO product_variants (product_id, size, color, stock_qty, price_adj, sku) VALUES
  ('b0000001-0000-0000-0000-000000000006', 'S',  'Black', 8,  0, 'AZH-S-BLK'),
  ('b0000001-0000-0000-0000-000000000006', 'M',  'Black', 12, 0, 'AZH-M-BLK'),
  ('b0000001-0000-0000-0000-000000000006', 'L',  'Black', 9,  0, 'AZH-L-BLK'),
  ('b0000001-0000-0000-0000-000000000006', 'XL', 'Black', 5,  0, 'AZH-XL-BLK')
ON CONFLICT (sku) DO NOTHING;

-- Static Snapback
INSERT INTO product_variants (product_id, size, color, stock_qty, price_adj, sku) VALUES
  ('b0000001-0000-0000-0000-000000000007', 'One Size', 'Black', 25, 0,   'SSB-OS-BLK'),
  ('b0000001-0000-0000-0000-000000000007', 'One Size', 'White', 15, 0,   'SSB-OS-WHT'),
  ('b0000001-0000-0000-0000-000000000007', 'One Size', 'Navy',  8,  200, 'SSB-OS-NVY')
ON CONFLICT (sku) DO NOTHING;

-- Drop Dad Cap
INSERT INTO product_variants (product_id, size, color, stock_qty, price_adj, sku) VALUES
  ('b0000001-0000-0000-0000-000000000008', 'One Size', 'Black', 18, 0,   'DDC-OS-BLK'),
  ('b0000001-0000-0000-0000-000000000008', 'One Size', 'Khaki', 20, 0,   'DDC-OS-KHK'),
  ('b0000001-0000-0000-0000-000000000008', 'One Size', 'White', 10, 0,   'DDC-OS-WHT')
ON CONFLICT (sku) DO NOTHING;

-- Static Tote Bag
INSERT INTO product_variants (product_id, size, color, stock_qty, price_adj, sku) VALUES
  ('b0000001-0000-0000-0000-000000000009', 'One Size', 'Black', 30, 0, 'STB-OS-BLK'),
  ('b0000001-0000-0000-0000-000000000009', 'One Size', 'White', 20, 0, 'STB-OS-WHT')
ON CONFLICT (sku) DO NOTHING;

-- Frequency Tee
INSERT INTO product_variants (product_id, size, color, stock_qty, price_adj, sku) VALUES
  ('b0000001-0000-0000-0000-000000000010', 'S',  'Black', 7,  0, 'FQT-S-BLK'),
  ('b0000001-0000-0000-0000-000000000010', 'M',  'Black', 11, 0, 'FQT-M-BLK'),
  ('b0000001-0000-0000-0000-000000000010', 'L',  'Black', 9,  0, 'FQT-L-BLK'),
  ('b0000001-0000-0000-0000-000000000010', 'XL', 'Black', 4,  0, 'FQT-XL-BLK')
ON CONFLICT (sku) DO NOTHING;

-- ============================================================
-- PRODUCT IMAGES
-- Using demo paths — storefront will fall back to Unsplash
-- ============================================================
INSERT INTO product_images (product_id, image_path, is_main, sort_order) VALUES
  ('b0000001-0000-0000-0000-000000000001', 'demo/tee-core-1.jpg',    true,  0),
  ('b0000001-0000-0000-0000-000000000001', 'demo/tee-core-2.jpg',    false, 1),
  ('b0000001-0000-0000-0000-000000000002', 'demo/tee-voltage-1.jpg', true,  0),
  ('b0000001-0000-0000-0000-000000000002', 'demo/tee-voltage-2.jpg', false, 1),
  ('b0000001-0000-0000-0000-000000000003', 'demo/tee-tribe-1.jpg',   true,  0),
  ('b0000001-0000-0000-0000-000000000004', 'demo/tee-blackout-1.jpg',true,  0),
  ('b0000001-0000-0000-0000-000000000005', 'demo/hoodie-pull-1.jpg', true,  0),
  ('b0000001-0000-0000-0000-000000000005', 'demo/hoodie-pull-2.jpg', false, 1),
  ('b0000001-0000-0000-0000-000000000006', 'demo/hoodie-zip-1.jpg',  true,  0),
  ('b0000001-0000-0000-0000-000000000007', 'demo/cap-snap-1.jpg',    true,  0),
  ('b0000001-0000-0000-0000-000000000007', 'demo/cap-snap-2.jpg',    false, 1),
  ('b0000001-0000-0000-0000-000000000008', 'demo/cap-dad-1.jpg',     true,  0),
  ('b0000001-0000-0000-0000-000000000009', 'demo/tote-1.jpg',        true,  0),
  ('b0000001-0000-0000-0000-000000000010', 'demo/tee-freq-1.jpg',    true,  0);

-- ============================================================
-- DEMO ORDERS
-- NOTE: These require real user UUIDs from your auth.users table.
-- After registering a user, replace the UUIDs below.
-- The orders below use a placeholder — they'll be skipped with FK error
-- if the user doesn't exist. That's fine — they illustrate the structure.
-- ============================================================

-- To insert demo orders, first register a user, then:
--
-- INSERT INTO order_svc.orders (id, customer_id, status, total_amount, shipping_name, shipping_phone, shipping_addr, created_at) VALUES
--   (gen_random_uuid(), '<YOUR_USER_UUID>', 'delivered', 8600, 'Chamidu Jayaneththi', '+94 77 123 4567', '45 Galle Road, Colombo 03, Colombo', NOW() - INTERVAL '15 days'),
--   (gen_random_uuid(), '<YOUR_USER_UUID>', 'shipped',   6800, 'Chamidu Jayaneththi', '+94 77 123 4567', '45 Galle Road, Colombo 03, Colombo', NOW() - INTERVAL '5 days'),
--   (gen_random_uuid(), '<YOUR_USER_UUID>', 'confirmed', 3500, 'Chamidu Jayaneththi', '+94 77 123 4567', '45 Galle Road, Colombo 03, Colombo', NOW() - INTERVAL '1 day'),
--   (gen_random_uuid(), '<YOUR_USER_UUID>', 'pending',   7700, 'Chamidu Jayaneththi', '+94 77 123 4567', '45 Galle Road, Colombo 03, Colombo', NOW());

-- ============================================================
-- MAKE A USER ADMIN
-- Run this after creating your account
-- ============================================================

-- UPDATE user_svc.profiles
-- SET role = 'admin'
-- WHERE email = 'your-email@example.com';

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- SELECT COUNT(*) FROM products WHERE status = 'active';
-- SELECT COUNT(*) FROM product_variants;
-- SELECT COUNT(*) FROM categories;
-- SELECT name, COUNT(v.*) as variant_count
-- FROM products p
-- LEFT JOIN product_variants v ON v.product_id = p.id
-- GROUP BY p.name ORDER BY p.name;
