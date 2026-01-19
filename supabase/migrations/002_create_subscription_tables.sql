-- ============================================
-- TABEL LANGGANAN & PEMBAYARAN BULANAN
-- Sistem tracking pembayaran bulanan untuk langganan
-- ============================================

-- Drop existing tables if exists (untuk fresh install)
DROP TABLE IF EXISTS monthly_payments CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- ============================================
-- 1. TABEL SUBSCRIPTIONS (Langganan)
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identitas Langganan
    no_perjanjian VARCHAR(100) NOT NULL UNIQUE,
    nama_layanan VARCHAR(255) NOT NULL,
    vendor VARCHAR(255) NOT NULL,
    unit VARCHAR(100) NOT NULL,
    
    -- Nilai & Periode
    anggaran_per_bulan DECIMAL(15, 2) NOT NULL,
    periode_mulai INTEGER NOT NULL,  -- Tahun mulai (e.g., 2026)
    periode_selesai INTEGER NOT NULL, -- Tahun selesai (e.g., 2030)
    
    -- Kategori
    kategori VARCHAR(50) DEFAULT 'lainnya',
    -- Opsi: 'internet', 'tv', 'sewa_peralatan', 'sewa_gedung', 'servis', 'lainnya'
    
    -- Deskripsi
    deskripsi TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'aktif',
    -- Opsi: 'aktif', 'tidak_aktif', 'selesai'
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    
    -- Constraints
    CONSTRAINT valid_periode CHECK (periode_selesai >= periode_mulai),
    CONSTRAINT positive_anggaran CHECK (anggaran_per_bulan > 0)
);

-- ============================================
-- 2. TABEL MONTHLY_PAYMENTS (Pembayaran Bulanan)
-- ============================================
CREATE TABLE monthly_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Key ke Subscription
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    
    -- Periode Pembayaran
    bulan INTEGER NOT NULL CHECK (bulan >= 1 AND bulan <= 12),
    tahun INTEGER NOT NULL,
    
    -- Status Pembayaran
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID',
    -- Opsi: 'PAID', 'UNPAID'
    
    -- Detail Pembayaran (jika sudah bayar)
    jumlah_bayar DECIMAL(15, 2),
    tanggal_bayar DATE,
    no_invoice VARCHAR(100),
    keterangan TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_by UUID,
    
    -- Unique constraint: 1 subscription hanya 1 record per bulan per tahun
    CONSTRAINT unique_payment_period UNIQUE (subscription_id, bulan, tahun)
);

-- ============================================
-- 3. INDEXES
-- ============================================
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_vendor ON subscriptions(vendor);
CREATE INDEX idx_subscriptions_unit ON subscriptions(unit);
CREATE INDEX idx_subscriptions_kategori ON subscriptions(kategori);
CREATE INDEX idx_monthly_payments_subscription ON monthly_payments(subscription_id);
CREATE INDEX idx_monthly_payments_status ON monthly_payments(status);
CREATE INDEX idx_monthly_payments_periode ON monthly_payments(tahun, bulan);

-- ============================================
-- 4. TRIGGER untuk updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_payments_updated_at
    BEFORE UPDATE ON monthly_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_payments ENABLE ROW LEVEL SECURITY;

-- Policy untuk authenticated users (bisa lihat semua)
CREATE POLICY "Allow all for authenticated users" ON subscriptions
    FOR ALL USING (true);

CREATE POLICY "Allow all for authenticated users" ON monthly_payments
    FOR ALL USING (true);

-- ============================================
-- 6. VIEWS untuk Summary
-- ============================================
CREATE OR REPLACE VIEW subscription_payment_summary AS
SELECT 
    s.id,
    s.no_perjanjian,
    s.nama_layanan,
    s.vendor,
    s.unit,
    s.anggaran_per_bulan,
    s.periode_mulai,
    s.periode_selesai,
    s.kategori,
    s.status,
    COUNT(CASE WHEN mp.status = 'PAID' THEN 1 END) as total_bulan_terbayar,
    COUNT(CASE WHEN mp.status = 'UNPAID' THEN 1 END) as total_bulan_belum_bayar,
    COALESCE(SUM(CASE WHEN mp.status = 'PAID' THEN mp.jumlah_bayar END), 0) as total_terbayar,
    ((s.periode_selesai - s.periode_mulai + 1) * 12) as total_bulan_kontrak
FROM subscriptions s
LEFT JOIN monthly_payments mp ON s.id = mp.subscription_id
GROUP BY s.id;

COMMENT ON TABLE subscriptions IS 'Tabel untuk menyimpan data langganan/kontrak berlangganan';
COMMENT ON TABLE monthly_payments IS 'Tabel untuk tracking pembayaran bulanan per langganan';
