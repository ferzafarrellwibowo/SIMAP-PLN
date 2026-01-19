-- ============================================
-- MIGRASI: HAPUS DATA DUPLIKAT
-- Menghapus data subscriptions dan monthly_payments yang duplikat
-- ============================================

-- ============================================
-- 1. HAPUS DUPLIKAT BERDASARKAN NAMA LAYANAN
-- Menyimpan hanya 1 record per nama_layanan + vendor + unit (yang paling baru)
-- ============================================

-- Hapus monthly_payments dari subscriptions duplikat (berdasarkan nama_layanan)
DELETE FROM monthly_payments 
WHERE subscription_id IN (
    SELECT s.id 
    FROM subscriptions s
    WHERE s.id NOT IN (
        -- Ambil ID subscription yang paling baru per nama_layanan + vendor + unit
        SELECT DISTINCT ON (nama_layanan, vendor, unit) id 
        FROM subscriptions 
        ORDER BY nama_layanan, vendor, unit, created_at DESC
    )
);

-- Hapus subscriptions duplikat berdasarkan nama_layanan + vendor + unit (simpan yang paling baru)
DELETE FROM subscriptions 
WHERE id NOT IN (
    SELECT DISTINCT ON (nama_layanan, vendor, unit) id 
    FROM subscriptions 
    ORDER BY nama_layanan, vendor, unit, created_at DESC
);

-- ============================================
-- 2. HAPUS DUPLIKAT BERDASARKAN NO_PERJANJIAN
-- Menyimpan hanya 1 record per no_perjanjian (yang paling baru)
-- ============================================

-- Hapus monthly_payments dari subscriptions duplikat
DELETE FROM monthly_payments 
WHERE subscription_id IN (
    SELECT s.id 
    FROM subscriptions s
    WHERE s.id NOT IN (
        SELECT DISTINCT ON (no_perjanjian) id 
        FROM subscriptions 
        ORDER BY no_perjanjian, created_at DESC
    )
);

-- Hapus subscriptions duplikat (simpan yang paling baru)
DELETE FROM subscriptions 
WHERE id NOT IN (
    SELECT DISTINCT ON (no_perjanjian) id 
    FROM subscriptions 
    ORDER BY no_perjanjian, created_at DESC
);

-- ============================================
-- 2. HAPUS MONTHLY_PAYMENTS DUPLIKAT
-- Menyimpan hanya 1 payment per subscription_id + bulan + tahun
-- ============================================
DELETE FROM monthly_payments 
WHERE id NOT IN (
    SELECT DISTINCT ON (subscription_id, bulan, tahun) id 
    FROM monthly_payments 
    ORDER BY subscription_id, bulan, tahun, created_at DESC
);

-- ============================================
-- 3. TAMBAHKAN UNIQUE CONSTRAINT (jika belum ada)
-- Untuk mencegah duplikat di masa depan
-- ============================================

-- Unique constraint untuk no_perjanjian di subscriptions
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'subscriptions_no_perjanjian_unique'
    ) THEN
        ALTER TABLE subscriptions 
        ADD CONSTRAINT subscriptions_no_perjanjian_unique 
        UNIQUE (no_perjanjian);
    END IF;
END $$;

-- Unique constraint untuk subscription_id + bulan + tahun di monthly_payments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'monthly_payments_subscription_bulan_tahun_unique'
    ) THEN
        ALTER TABLE monthly_payments 
        ADD CONSTRAINT monthly_payments_subscription_bulan_tahun_unique 
        UNIQUE (subscription_id, bulan, tahun);
    END IF;
END $$;

-- ============================================
-- 4. VERIFY: Cek jumlah data setelah cleanup
-- ============================================
-- SELECT 'subscriptions' as table_name, COUNT(*) as total FROM subscriptions
-- UNION ALL
-- SELECT 'monthly_payments', COUNT(*) FROM monthly_payments;

-- Cek duplikat yang tersisa
-- SELECT no_perjanjian, COUNT(*) 
-- FROM subscriptions 
-- GROUP BY no_perjanjian 
-- HAVING COUNT(*) > 1;
