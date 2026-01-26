-- ============================================
-- MIGRATION: Split contracts table into 3 separate tables
-- SIMAP PLN - Contract Management System
-- ============================================
-- 
-- Jalankan script ini di Supabase SQL Editor
-- Script ini akan:
-- 1. Membuat 3 tabel baru (contract_investment, contract_maintenance, contract_administration)
-- 2. Migrasi data dari tabel contracts lama ke tabel baru
-- 3. Membuat triggers dan RLS policies
-- 
-- ============================================

-- ============================================
-- STEP 1: Create contract_investment table
-- Untuk kategori Investasi (AI)
-- ============================================

CREATE TABLE IF NOT EXISTS public.contract_investment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no SERIAL,
    
    -- Identitas Kontrak
    no_perjanjian TEXT NOT NULL UNIQUE,
    tanggal_perjanjian DATE NOT NULL,
    tanggal_berakhir DATE NOT NULL,
    
    -- PRK & Pekerjaan
    judul_prk TEXT NOT NULL,
    nama_pekerjaan TEXT NOT NULL,
    no_prk TEXT,
    
    -- Nilai
    nilai_perjanjian BIGINT NOT NULL DEFAULT 0,
    nilai_tagihan BIGINT DEFAULT 0,
    terbayar BIGINT DEFAULT 0,
    sisa_anggaran BIGINT DEFAULT 0,
    persentase_realisasi NUMERIC(5, 2) DEFAULT 0,
    
    -- Vendor
    nama_vendor TEXT NOT NULL,
    
    -- Jenis & Status
    jenis_ai TEXT DEFAULT 'AI' CHECK (jenis_ai IN ('AI', 'AO')),
    cr_not_cr TEXT DEFAULT 'Not CR' CHECK (cr_not_cr IN ('CR', 'Not CR')),
    status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai', 'bermasalah')),
    status_vip TEXT DEFAULT 'belum_lunas' CHECK (status_vip IN ('lunas', 'belum_lunas', 'dokumen_tidak_lengkap')),
    
    -- Auto-generate fields
    no_wbs_pos_anggaran TEXT,
    no_skki TEXT,
    no_se TEXT,
    no_po TEXT,
    no_berita_acara TEXT,
    tanggal_berita_acara DATE,
    submission_id_vip TEXT,
    request_tanggal_se TIMESTAMP WITH TIME ZONE,
    
    -- Unit & Lokasi
    unit TEXT NOT NULL,
    unit_sektor_k TEXT,
    
    -- Legacy/Additional fields
    uraian_kegiatan TEXT,
    nilai_tagihan_kontrak_pusat BIGINT DEFAULT 0,
    nilai_tagihan_unit_induk BIGINT DEFAULT 0,
    nilai_berita_acara BIGINT,
    no_berita_acara_sk_relasi TEXT,
    tanggal_arsip DATE,
    no_xps TEXT,
    tanggal_xps DATE,
    no_skwe TEXT,
    pos_angg TEXT,
    no_sku_skko TEXT,
    request_tanggal_se_relasi TIMESTAMP WITH TIME ZONE,
    submission_id TEXT,
    jenis_pekerjaan TEXT,
    beban_tahun TEXT,
    batas_pagu_terbayar BIGINT,
    unit_terbayar TEXT,
    konfirmasi_non_rutin TEXT,
    bidang TEXT,
    
    -- PIC & Tracking
    pic_id TEXT,
    pic_name TEXT,
    entry_by TEXT,
    progress_pekerjaan NUMERIC(5, 2) DEFAULT 0,
    
    -- Flags
    old_flag TEXT,
    click_cb BOOLEAN DEFAULT FALSE,
    
    -- Keterangan & Dokumen
    keterangan TEXT,
    dokumen_kontrak TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by TEXT
);

-- ============================================
-- STEP 2: Create contract_maintenance table
-- Untuk kategori Pemeliharaan (AO)
-- ============================================

CREATE TABLE IF NOT EXISTS public.contract_maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no SERIAL,
    
    -- Identitas Kontrak
    no_perjanjian TEXT NOT NULL UNIQUE,
    tanggal_perjanjian DATE NOT NULL,
    tanggal_berakhir DATE NOT NULL,
    
    -- Pekerjaan
    judul_pekerjaan TEXT NOT NULL,
    uraian_kegiatan TEXT,
    jenis_pekerjaan TEXT,
    
    -- Nilai
    nilai_kontrak BIGINT NOT NULL DEFAULT 0,
    nilai_tagihan BIGINT DEFAULT 0,
    total_tagihan_dibayar BIGINT DEFAULT 0,
    sisa_anggaran BIGINT DEFAULT 0,
    persentase_realisasi NUMERIC(5, 2) DEFAULT 0,
    
    -- Vendor
    vendor TEXT NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai', 'bermasalah')),
    jenis_anggaran TEXT DEFAULT 'AO' CHECK (jenis_anggaran IN ('AI', 'AO')),
    
    -- Berita Acara
    no_berita_acara TEXT,
    tanggal_berita_acara DATE,
    nilai_berita_acara BIGINT,
    no_berita_acara_sk_relasi TEXT,
    
    -- Arsip & XPS
    tanggal_arsip DATE,
    no_xps TEXT,
    tanggal_xps DATE,
    
    -- Unit & Lokasi
    unit TEXT NOT NULL,
    unit_sektor_k TEXT,
    
    -- SK/WE & PO
    no_skwe TEXT,
    pos_angg TEXT,
    no_sku_skko TEXT,
    no_se TEXT,
    no_po TEXT,
    submission_id TEXT,
    request_tanggal_se TIMESTAMP WITH TIME ZONE,
    request_tanggal_se_relasi TIMESTAMP WITH TIME ZONE,
    
    -- Detail
    beban_tahun TEXT,
    batas_pagu_terbayar BIGINT,
    unit_terbayar TEXT,
    konfirmasi_non_rutin TEXT,
    bidang TEXT,
    
    -- PIC & Tracking
    pic_id TEXT,
    pic_name TEXT,
    entry_by TEXT,
    progress_pekerjaan NUMERIC(5, 2) DEFAULT 0,
    
    -- Flags
    old_flag TEXT,
    click_cb BOOLEAN DEFAULT FALSE,
    
    -- Keterangan & Dokumen
    keterangan TEXT,
    dokumen_kontrak TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by TEXT
);

-- ============================================
-- STEP 3: Create contract_administration table
-- Untuk kategori Administrasi (AO)
-- ============================================

CREATE TABLE IF NOT EXISTS public.contract_administration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no SERIAL,
    
    -- Identitas Kontrak
    no_perjanjian TEXT NOT NULL UNIQUE,
    tanggal_perjanjian DATE NOT NULL,
    tanggal_berakhir DATE NOT NULL,
    
    -- Pekerjaan
    judul_pekerjaan TEXT NOT NULL,
    uraian_kegiatan TEXT,
    jenis_pekerjaan TEXT,
    
    -- Nilai
    nilai_kontrak BIGINT NOT NULL DEFAULT 0,
    nilai_tagihan BIGINT DEFAULT 0,
    total_tagihan_dibayar BIGINT DEFAULT 0,
    sisa_anggaran BIGINT DEFAULT 0,
    persentase_realisasi NUMERIC(5, 2) DEFAULT 0,
    
    -- Vendor
    vendor TEXT NOT NULL,
    
    -- Status
    status TEXT DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai', 'bermasalah')),
    jenis_anggaran TEXT DEFAULT 'AO' CHECK (jenis_anggaran IN ('AI', 'AO')),
    
    -- Berita Acara
    no_berita_acara TEXT,
    tanggal_berita_acara DATE,
    nilai_berita_acara BIGINT,
    no_berita_acara_sk_relasi TEXT,
    
    -- Arsip & XPS
    tanggal_arsip DATE,
    no_xps TEXT,
    tanggal_xps DATE,
    
    -- Unit & Lokasi
    unit TEXT NOT NULL,
    unit_sektor_k TEXT,
    
    -- SK/WE & PO
    no_skwe TEXT,
    pos_angg TEXT,
    no_sku_skko TEXT,
    no_se TEXT,
    no_po TEXT,
    submission_id TEXT,
    request_tanggal_se TIMESTAMP WITH TIME ZONE,
    request_tanggal_se_relasi TIMESTAMP WITH TIME ZONE,
    
    -- Detail
    beban_tahun TEXT,
    batas_pagu_terbayar BIGINT,
    unit_terbayar TEXT,
    konfirmasi_non_rutin TEXT,
    bidang TEXT,
    
    -- PIC & Tracking
    pic_id TEXT,
    pic_name TEXT,
    entry_by TEXT,
    progress_pekerjaan NUMERIC(5, 2) DEFAULT 0,
    
    -- Flags
    old_flag TEXT,
    click_cb BOOLEAN DEFAULT FALSE,
    
    -- Keterangan & Dokumen
    keterangan TEXT,
    dokumen_kontrak TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by TEXT
);

-- ============================================
-- STEP 4: Create updated_at triggers
-- ============================================

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for each table
DROP TRIGGER IF EXISTS update_contract_investment_modtime ON public.contract_investment;
CREATE TRIGGER update_contract_investment_modtime
    BEFORE UPDATE ON public.contract_investment
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_contract_maintenance_modtime ON public.contract_maintenance;
CREATE TRIGGER update_contract_maintenance_modtime
    BEFORE UPDATE ON public.contract_maintenance
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

DROP TRIGGER IF EXISTS update_contract_administration_modtime ON public.contract_administration;
CREATE TRIGGER update_contract_administration_modtime
    BEFORE UPDATE ON public.contract_administration
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- ============================================
-- STEP 5: Create auto-calculate triggers for investment
-- ============================================

CREATE OR REPLACE FUNCTION calculate_investment_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate sisa_anggaran
    NEW.sisa_anggaran := COALESCE(NEW.nilai_perjanjian, 0) - COALESCE(NEW.terbayar, 0);
    
    -- Calculate persentase_realisasi
    IF COALESCE(NEW.nilai_perjanjian, 0) > 0 THEN
        NEW.persentase_realisasi := ROUND((COALESCE(NEW.terbayar, 0)::NUMERIC / NEW.nilai_perjanjian::NUMERIC) * 100, 2);
    ELSE
        NEW.persentase_realisasi := 0;
    END IF;
    
    -- Update status_vip based on persentase
    IF NEW.persentase_realisasi >= 100 THEN
        NEW.status_vip := 'lunas';
        IF NEW.status != 'bermasalah' THEN
            NEW.status := 'selesai';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_investment ON public.contract_investment;
CREATE TRIGGER trigger_calculate_investment
    BEFORE INSERT OR UPDATE ON public.contract_investment
    FOR EACH ROW
    EXECUTE FUNCTION calculate_investment_fields();

-- ============================================
-- STEP 6: Create auto-calculate triggers for maintenance
-- ============================================

CREATE OR REPLACE FUNCTION calculate_maintenance_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate sisa_anggaran
    NEW.sisa_anggaran := COALESCE(NEW.nilai_kontrak, 0) - COALESCE(NEW.total_tagihan_dibayar, 0);
    
    -- Calculate persentase_realisasi
    IF COALESCE(NEW.nilai_kontrak, 0) > 0 THEN
        NEW.persentase_realisasi := ROUND((COALESCE(NEW.total_tagihan_dibayar, 0)::NUMERIC / NEW.nilai_kontrak::NUMERIC) * 100, 2);
    ELSE
        NEW.persentase_realisasi := 0;
    END IF;
    
    -- Update status based on persentase
    IF NEW.persentase_realisasi >= 100 AND NEW.status != 'bermasalah' THEN
        NEW.status := 'selesai';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_maintenance ON public.contract_maintenance;
CREATE TRIGGER trigger_calculate_maintenance
    BEFORE INSERT OR UPDATE ON public.contract_maintenance
    FOR EACH ROW
    EXECUTE FUNCTION calculate_maintenance_fields();

-- ============================================
-- STEP 7: Create auto-calculate triggers for administration
-- ============================================

CREATE OR REPLACE FUNCTION calculate_administration_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate sisa_anggaran
    NEW.sisa_anggaran := COALESCE(NEW.nilai_kontrak, 0) - COALESCE(NEW.total_tagihan_dibayar, 0);
    
    -- Calculate persentase_realisasi
    IF COALESCE(NEW.nilai_kontrak, 0) > 0 THEN
        NEW.persentase_realisasi := ROUND((COALESCE(NEW.total_tagihan_dibayar, 0)::NUMERIC / NEW.nilai_kontrak::NUMERIC) * 100, 2);
    ELSE
        NEW.persentase_realisasi := 0;
    END IF;
    
    -- Update status based on persentase
    IF NEW.persentase_realisasi >= 100 AND NEW.status != 'bermasalah' THEN
        NEW.status := 'selesai';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_administration ON public.contract_administration;
CREATE TRIGGER trigger_calculate_administration
    BEFORE INSERT OR UPDATE ON public.contract_administration
    FOR EACH ROW
    EXECUTE FUNCTION calculate_administration_fields();

-- ============================================
-- STEP 8: Enable RLS and create policies
-- ============================================

-- Enable RLS
ALTER TABLE public.contract_investment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_administration ENABLE ROW LEVEL SECURITY;

-- Create policies for contract_investment
CREATE POLICY "Enable read access for all users" ON public.contract_investment
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.contract_investment
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.contract_investment
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.contract_investment
    FOR DELETE USING (true);

-- Create policies for contract_maintenance
CREATE POLICY "Enable read access for all users" ON public.contract_maintenance
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.contract_maintenance
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.contract_maintenance
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.contract_maintenance
    FOR DELETE USING (true);

-- Create policies for contract_administration
CREATE POLICY "Enable read access for all users" ON public.contract_administration
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.contract_administration
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON public.contract_administration
    FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON public.contract_administration
    FOR DELETE USING (true);

-- ============================================
-- STEP 9: Create indexes for performance
-- ============================================

-- Indexes for contract_investment
CREATE INDEX IF NOT EXISTS idx_investment_no_perjanjian ON public.contract_investment(no_perjanjian);
CREATE INDEX IF NOT EXISTS idx_investment_status ON public.contract_investment(status);
CREATE INDEX IF NOT EXISTS idx_investment_status_vip ON public.contract_investment(status_vip);
CREATE INDEX IF NOT EXISTS idx_investment_unit ON public.contract_investment(unit);
CREATE INDEX IF NOT EXISTS idx_investment_tanggal ON public.contract_investment(tanggal_perjanjian);

-- Indexes for contract_maintenance
CREATE INDEX IF NOT EXISTS idx_maintenance_no_perjanjian ON public.contract_maintenance(no_perjanjian);
CREATE INDEX IF NOT EXISTS idx_maintenance_status ON public.contract_maintenance(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_unit ON public.contract_maintenance(unit);
CREATE INDEX IF NOT EXISTS idx_maintenance_tanggal ON public.contract_maintenance(tanggal_perjanjian);

-- Indexes for contract_administration
CREATE INDEX IF NOT EXISTS idx_administration_no_perjanjian ON public.contract_administration(no_perjanjian);
CREATE INDEX IF NOT EXISTS idx_administration_status ON public.contract_administration(status);
CREATE INDEX IF NOT EXISTS idx_administration_unit ON public.contract_administration(unit);
CREATE INDEX IF NOT EXISTS idx_administration_tanggal ON public.contract_administration(tanggal_perjanjian);

-- ============================================
-- MIGRATION COMPLETE - Tables Created
-- ============================================

SELECT 'Tables created successfully!' AS status;

-- Verify tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('contract_investment', 'contract_maintenance', 'contract_administration');
