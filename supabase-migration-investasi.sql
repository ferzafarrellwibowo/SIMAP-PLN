-- ============================================
-- MIGRATION: Update contracts table for Investasi category
-- SIMAP PLN - Contract Management System
-- ============================================
-- 
-- Jalankan script ini di Supabase SQL Editor untuk update schema
-- 
-- ============================================

-- ============================================
-- STEP 1: Add new columns for Investasi category
-- ============================================

-- Judul PRK
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS judul_prk TEXT;

-- Nilai Perjanjian (duplicate of nilai_kontrak for clarity)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS nilai_perjanjian BIGINT;

-- Nama Vendor (duplicate of vendor for clarity)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS nama_vendor TEXT;

-- Nilai Tagihan/Nominal
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS nilai_tagihan BIGINT DEFAULT 0;

-- No. WBS/Pos Anggaran (auto-generate: I.1001.23.21.0805.xxx)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS no_wbs_pos_anggaran TEXT;

-- No. SKKI (auto-generate: xxxx/KEU.00.03/EVP MUM/xxxx)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS no_skki TEXT;

-- Request Tanggal SE (auto when invoice status changes from diajukan to diterima)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS request_tanggal_se TIMESTAMP WITH TIME ZONE;

-- Submission ID - VIP (auto-generate: TRE-V/xxxx/xxxx/00000xxxxx)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS submission_id_vip TEXT;

-- Status VIP (lunas, belum_lunas, dokumen_tidak_lengkap)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS status_vip TEXT DEFAULT 'belum_lunas' CHECK (status_vip IN ('lunas', 'belum_lunas', 'dokumen_tidak_lengkap'));

-- Terbayar
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS terbayar BIGINT DEFAULT 0;

-- Nama Pekerjaan
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS nama_pekerjaan TEXT;

-- Jenis AI
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS jenis_ai TEXT DEFAULT 'AI' CHECK (jenis_ai IN ('AI', 'AO'));

-- No. PRK (auto-generate: (tahun).KPST.21.xxx)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS no_prk TEXT;

-- CR/Not CR
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS cr_not_cr TEXT DEFAULT 'Not CR' CHECK (cr_not_cr IN ('CR', 'Not CR'));

-- Additional legacy fields if not exist
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS nilai_tagihan_kontrak_pusat BIGINT DEFAULT 0;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS nilai_tagihan_unit_induk BIGINT DEFAULT 0;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS nilai_berita_acara BIGINT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS no_berita_acara TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS tanggal_berita_acara DATE;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS no_berita_acara_sk_relasi TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS tanggal_arsip DATE;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS no_xps TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS tanggal_xps DATE;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS unit_sektor_k TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS no_skwe TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS pos_angg TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS no_sku_skko TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS request_tanggal_se_relasi TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS no_se TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS no_po TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS submission_id TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS jenis_pekerjaan TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS beban_tahun TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS batas_pagu_terbayar BIGINT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS unit_terbayar TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS konfirmasi_non_rutin TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS bidang TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS pic_id TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS entry_by TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS progress_pekerjaan NUMERIC(5, 2) DEFAULT 0;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS old_flag TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS click_cb BOOLEAN DEFAULT FALSE;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS created_by TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS updated_by TEXT;

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS dokumen_kontrak TEXT;

-- ============================================
-- STEP 1.5: Add unique constraint on no_perjanjian if not exists
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'contracts_no_perjanjian_key'
    ) THEN
        ALTER TABLE public.contracts 
        ADD CONSTRAINT contracts_no_perjanjian_key UNIQUE (no_perjanjian);
    END IF;
END $$;

-- ============================================
-- STEP 2: Update existing data with default values
-- ============================================

-- Update judul_prk from uraian_kegiatan
UPDATE public.contracts 
SET judul_prk = uraian_kegiatan 
WHERE judul_prk IS NULL;

-- Update nilai_perjanjian from nilai_kontrak
UPDATE public.contracts 
SET nilai_perjanjian = nilai_kontrak 
WHERE nilai_perjanjian IS NULL;

-- Update nama_vendor from vendor
UPDATE public.contracts 
SET nama_vendor = vendor 
WHERE nama_vendor IS NULL;

-- Update nama_pekerjaan from judul_pekerjaan
UPDATE public.contracts 
SET nama_pekerjaan = judul_pekerjaan 
WHERE nama_pekerjaan IS NULL;

-- Update terbayar from total_tagihan_dibayar
UPDATE public.contracts 
SET terbayar = total_tagihan_dibayar 
WHERE terbayar = 0 OR terbayar IS NULL;

-- Update status_vip based on persentase_realisasi
UPDATE public.contracts 
SET status_vip = CASE 
    WHEN persentase_realisasi >= 100 THEN 'lunas'
    ELSE 'belum_lunas'
END
WHERE status_vip IS NULL;

-- ============================================
-- STEP 3: Generate auto fields for existing Investasi contracts
-- ============================================

-- Generate No. WBS/Pos Anggaran for Investasi contracts
UPDATE public.contracts 
SET no_wbs_pos_anggaran = 'I.1001.23.21.0805.' || LPAD((EXTRACT(EPOCH FROM created_at)::INTEGER % 1000)::TEXT, 3, '0')
WHERE kategori = 'investasi' AND no_wbs_pos_anggaran IS NULL;

-- Generate No. SKKI for Investasi contracts
UPDATE public.contracts 
SET no_skki = LPAD((EXTRACT(EPOCH FROM created_at)::INTEGER % 10000)::TEXT, 4, '0') || '/KEU.00.03/EVP MUM/' || EXTRACT(YEAR FROM tanggal_perjanjian)::TEXT
WHERE kategori = 'investasi' AND no_skki IS NULL;

-- Generate No. SE for Investasi contracts
UPDATE public.contracts 
SET no_se = '100369' || LPAD((EXTRACT(EPOCH FROM created_at)::INTEGER % 10000)::TEXT, 4, '0')
WHERE kategori = 'investasi' AND no_se IS NULL;

-- Generate No. PO for Investasi contracts
UPDATE public.contracts 
SET no_po = '310148' || LPAD((EXTRACT(EPOCH FROM created_at)::INTEGER % 10000)::TEXT, 4, '0')
WHERE kategori = 'investasi' AND no_po IS NULL;

-- Generate No. PRK for Investasi contracts
UPDATE public.contracts 
SET no_prk = EXTRACT(YEAR FROM tanggal_perjanjian)::TEXT || '.KPST.21.' || LPAD((EXTRACT(EPOCH FROM created_at)::INTEGER % 1000)::TEXT, 3, '0')
WHERE kategori = 'investasi' AND no_prk IS NULL;

-- Generate Submission ID VIP for Investasi contracts
UPDATE public.contracts 
SET submission_id_vip = 'TRE-V/' || LPAD((EXTRACT(EPOCH FROM created_at)::INTEGER % 10000)::TEXT, 4, '0') || '/' || EXTRACT(YEAR FROM tanggal_perjanjian)::TEXT || '/00000' || LPAD((EXTRACT(EPOCH FROM created_at)::INTEGER % 100000)::TEXT, 5, '0')
WHERE kategori = 'investasi' AND submission_id_vip IS NULL;

-- ============================================
-- STEP 4: Create trigger to auto-update status_vip
-- ============================================

CREATE OR REPLACE FUNCTION update_contract_status_vip()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status_vip when persentase_realisasi changes
    IF NEW.persentase_realisasi >= 100 THEN
        NEW.status_vip := 'lunas';
    ELSIF OLD.status_vip != 'dokumen_tidak_lengkap' THEN
        -- Only change to belum_lunas if not manually set to dokumen_tidak_lengkap
        NEW.status_vip := 'belum_lunas';
    END IF;
    
    -- Update status when persentase_realisasi reaches 100%
    IF NEW.persentase_realisasi >= 100 AND OLD.status != 'bermasalah' THEN
        NEW.status := 'selesai';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_contract_status_vip ON public.contracts;

-- Create trigger
CREATE TRIGGER trigger_update_contract_status_vip
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW
    WHEN (OLD.persentase_realisasi IS DISTINCT FROM NEW.persentase_realisasi)
    EXECUTE FUNCTION update_contract_status_vip();

-- ============================================
-- STEP 5: Create trigger to auto-generate request_tanggal_se on invoice status change
-- ============================================

CREATE OR REPLACE FUNCTION update_contract_request_tanggal_se()
RETURNS TRIGGER AS $$
BEGIN
    -- When invoice status changes from 'diajukan' to 'diterima'
    IF OLD.status = 'diajukan' AND NEW.status = 'diterima' THEN
        -- Update the contract's request_tanggal_se
        UPDATE public.contracts 
        SET request_tanggal_se = NOW(),
            request_tanggal_se_relasi = NOW()
        WHERE id = NEW.contract_id 
          AND request_tanggal_se IS NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_update_request_tanggal_se ON public.invoices;

-- Create trigger on invoices table
CREATE TRIGGER trigger_update_request_tanggal_se
    AFTER UPDATE ON public.invoices
    FOR EACH ROW
    WHEN (OLD.status = 'diajukan' AND NEW.status = 'diterima')
    EXECUTE FUNCTION update_contract_request_tanggal_se();

-- ============================================
-- STEP 6: Update invoices table to add berita acara fields
-- ============================================

-- Add no_berita_acara if not exists
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS no_berita_acara TEXT;

ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS tanggal_berita_acara DATE;

-- ============================================
-- STEP 7: Create trigger to auto-generate berita acara on invoice creation
-- ============================================

CREATE OR REPLACE FUNCTION generate_invoice_berita_acara()
RETURNS TRIGGER AS $$
DECLARE
    invoice_count INTEGER;
    contract_kategori TEXT;
BEGIN
    -- Get contract category
    SELECT kategori INTO contract_kategori 
    FROM public.contracts 
    WHERE id = NEW.contract_id;
    
    -- Only generate for Investasi category
    IF contract_kategori = 'investasi' THEN
        -- Count existing invoices for this contract
        SELECT COUNT(*) INTO invoice_count 
        FROM public.invoices 
        WHERE contract_id = NEW.contract_id;
        
        -- Generate No. Berita Acara (format: xxxx/JKO/2024/012)
        IF NEW.no_berita_acara IS NULL THEN
            NEW.no_berita_acara := LPAD((EXTRACT(EPOCH FROM NOW())::INTEGER % 10000)::TEXT, 4, '0') || '/JKO/' || EXTRACT(YEAR FROM NOW())::TEXT || '/' || LPAD((invoice_count + 1)::TEXT, 3, '0');
        END IF;
        
        -- Set tanggal_berita_acara to current date
        IF NEW.tanggal_berita_acara IS NULL THEN
            NEW.tanggal_berita_acara := CURRENT_DATE;
        END IF;
        
        -- Also update the contract's no_berita_acara
        UPDATE public.contracts 
        SET no_berita_acara = NEW.no_berita_acara,
            tanggal_berita_acara = NEW.tanggal_berita_acara
        WHERE id = NEW.contract_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_generate_berita_acara ON public.invoices;

-- Create trigger
CREATE TRIGGER trigger_generate_berita_acara
    BEFORE INSERT ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_berita_acara();

-- ============================================
-- STEP 8: Insert sample data for Investasi contracts
-- ============================================

-- Delete existing sample data if needed (optional - uncomment if needed)
-- DELETE FROM public.invoices;
-- DELETE FROM public.contracts;

-- Insert sample Investasi contracts with ALL columns filled
INSERT INTO public.contracts (
    -- Basic Info
    no, no_perjanjian, tanggal_perjanjian, tanggal_berakhir,
    uraian_kegiatan, judul_pekerjaan, nilai_kontrak, vendor,
    kategori, jenis_anggaran, unit, status,
    total_tagihan_dibayar, sisa_anggaran, persentase_realisasi,
    
    -- Investasi specific fields
    judul_prk, nilai_perjanjian, nama_vendor, nilai_tagihan,
    no_wbs_pos_anggaran, no_skki, no_se, no_po, submission_id_vip,
    status_vip, terbayar, nama_pekerjaan, jenis_ai, no_prk, cr_not_cr,
    
    -- Additional fields
    nilai_tagihan_kontrak_pusat, nilai_tagihan_unit_induk,
    nilai_berita_acara, no_berita_acara, tanggal_berita_acara,
    no_berita_acara_sk_relasi, tanggal_arsip,
    no_xps, tanggal_xps, unit_sektor_k, no_skwe, pos_angg, no_sku_skko,
    request_tanggal_se, request_tanggal_se_relasi,
    submission_id, jenis_pekerjaan, beban_tahun,
    batas_pagu_terbayar, unit_terbayar, konfirmasi_non_rutin,
    bidang, pic_id, entry_by, progress_pekerjaan,
    old_flag, click_cb, created_by, updated_by, dokumen_kontrak
) VALUES 
-- Contract 1: Pengadaan Trafo 60 MVA
(
    1,
    '031001Pj/STH.01.01/F01071001001/2025',
    '2025-01-15',
    '2026-01-15',
    'Pengadaan Trafo 60 MVA untuk GI Cawang',
    'Pengadaan dan Pemasangan Trafo Daya 60 MVA GI Cawang',
    15000000000,
    'PT Wijaya Karya',
    'investasi',
    'AI',
    'PLN UP3 Jakarta Selatan',
    'aktif',
    9000000000,
    6000000000,
    60.00,
    
    -- Investasi specific
    'Pengadaan Trafo 60 MVA',
    15000000000,
    'PT Wijaya Karya',
    9000000000,
    'I.1001.23.21.0805.001',
    '1001/KEU.00.03/EVP MUM/2025',
    '1003691001',
    '3101481001',
    'TRE-V/1001/2025/000001001',
    'belum_lunas',
    9000000000,
    'Pengadaan dan Pemasangan Trafo Daya 60 MVA GI Cawang',
    'AI',
    '2025.KPST.21.001',
    'Not CR',
    
    -- Additional fields
    5000000000,  -- nilai_tagihan_kontrak_pusat
    4000000000,  -- nilai_tagihan_unit_induk
    9000000000,  -- nilai_berita_acara
    '0001/JKO/2025/001',  -- no_berita_acara
    '2025-02-15',  -- tanggal_berita_acara
    'BA-SK-001/2025',  -- no_berita_acara_sk_relasi
    '2025-02-20',  -- tanggal_arsip
    'XPS/001/2025',  -- no_xps
    '2025-02-18',  -- tanggal_xps
    'Sektor Jakarta',  -- unit_sektor_k
    'SKWE/001/2025',  -- no_skwe
    'AI-001',  -- pos_angg
    'SKU/001/2025',  -- no_sku_skko
    '2025-02-10 10:00:00+07',  -- request_tanggal_se
    '2025-02-10 10:00:00+07',  -- request_tanggal_se_relasi
    'SUB-001-2025',  -- submission_id
    'Pengadaan Barang',  -- jenis_pekerjaan
    '2025',  -- beban_tahun
    15000000000,  -- batas_pagu_terbayar
    'UP3 Jakarta Selatan',  -- unit_terbayar
    'Rutin',  -- konfirmasi_non_rutin
    'Bidang Konstruksi',  -- bidang
    'PIC-001',  -- pic_id
    'admin@pln.co.id',  -- entry_by
    60.00,  -- progress_pekerjaan
    NULL,  -- old_flag
    FALSE,  -- click_cb
    'admin@pln.co.id',  -- created_by
    'admin@pln.co.id',  -- updated_by
    'DOK/KONTRAK/001/2025'  -- dokumen_kontrak
),
-- Contract 2: Pembangunan SUTT 150kV
(
    2,
    '031002Pj/STH.01.01/F01071002002/2025',
    '2025-02-20',
    '2026-02-20',
    'Pembangunan SUTT 150kV Cikarang-Bekasi',
    'Pembangunan SUTT 150kV Cikarang-Bekasi Circuit 2',
    28000000000,
    'PT Hutama Karya',
    'investasi',
    'AI',
    'PLN UP3 Bandung',
    'aktif',
    14000000000,
    14000000000,
    50.00,
    
    -- Investasi specific
    'Pembangunan SUTT 150kV',
    28000000000,
    'PT Hutama Karya',
    14000000000,
    'I.1001.23.21.0805.002',
    '1002/KEU.00.03/EVP MUM/2025',
    '1003691002',
    '3101481002',
    'TRE-V/1002/2025/000001002',
    'belum_lunas',
    14000000000,
    'Pembangunan SUTT 150kV Cikarang-Bekasi Circuit 2',
    'AI',
    '2025.KPST.21.002',
    'CR',
    
    -- Additional fields
    8000000000,  -- nilai_tagihan_kontrak_pusat
    6000000000,  -- nilai_tagihan_unit_induk
    14000000000,  -- nilai_berita_acara
    '0002/JKO/2025/001',  -- no_berita_acara
    '2025-03-20',  -- tanggal_berita_acara
    'BA-SK-002/2025',  -- no_berita_acara_sk_relasi
    '2025-03-25',  -- tanggal_arsip
    'XPS/002/2025',  -- no_xps
    '2025-03-22',  -- tanggal_xps
    'Sektor Bandung',  -- unit_sektor_k
    'SKWE/002/2025',  -- no_skwe
    'AI-002',  -- pos_angg
    'SKU/002/2025',  -- no_sku_skko
    '2025-03-15 14:30:00+07',  -- request_tanggal_se
    '2025-03-15 14:30:00+07',  -- request_tanggal_se_relasi
    'SUB-002-2025',  -- submission_id
    'Konstruksi Transmisi',  -- jenis_pekerjaan
    '2025',  -- beban_tahun
    28000000000,  -- batas_pagu_terbayar
    'UP3 Bandung',  -- unit_terbayar
    'Non Rutin',  -- konfirmasi_non_rutin
    'Bidang Transmisi',  -- bidang
    'PIC-002',  -- pic_id
    'operator@pln.co.id',  -- entry_by
    50.00,  -- progress_pekerjaan
    NULL,  -- old_flag
    FALSE,  -- click_cb
    'operator@pln.co.id',  -- created_by
    'operator@pln.co.id',  -- updated_by
    'DOK/KONTRAK/002/2025'  -- dokumen_kontrak
),
-- Contract 3: Pengadaan Kubikel 20kV (Lunas/Selesai)
(
    3,
    '031003Pj/STH.01.01/F01071003003/2025',
    '2025-03-10',
    '2026-03-10',
    'Pengadaan Kubikel 20kV GI Duri Kosambi',
    'Pengadaan Kubikel 20kV untuk GI Duri Kosambi',
    8500000000,
    'PT PP (Persero)',
    'investasi',
    'AI',
    'PLN UP3 Surabaya',
    'selesai',
    8500000000,
    0,
    100.00,
    
    -- Investasi specific
    'Pengadaan Kubikel 20kV',
    8500000000,
    'PT PP (Persero)',
    8500000000,
    'I.1001.23.21.0805.003',
    '1003/KEU.00.03/EVP MUM/2025',
    '1003691003',
    '3101481003',
    'TRE-V/1003/2025/000001003',
    'lunas',
    8500000000,
    'Pengadaan Kubikel 20kV untuk GI Duri Kosambi',
    'AI',
    '2025.KPST.21.003',
    'Not CR',
    
    -- Additional fields
    5000000000,  -- nilai_tagihan_kontrak_pusat
    3500000000,  -- nilai_tagihan_unit_induk
    8500000000,  -- nilai_berita_acara
    '0003/JKO/2025/001',  -- no_berita_acara
    '2025-04-10',  -- tanggal_berita_acara
    'BA-SK-003/2025',  -- no_berita_acara_sk_relasi
    '2025-04-15',  -- tanggal_arsip
    'XPS/003/2025',  -- no_xps
    '2025-04-12',  -- tanggal_xps
    'Sektor Surabaya',  -- unit_sektor_k
    'SKWE/003/2025',  -- no_skwe
    'AI-003',  -- pos_angg
    'SKU/003/2025',  -- no_sku_skko
    '2025-04-05 09:00:00+07',  -- request_tanggal_se
    '2025-04-05 09:00:00+07',  -- request_tanggal_se_relasi
    'SUB-003-2025',  -- submission_id
    'Pengadaan Peralatan',  -- jenis_pekerjaan
    '2025',  -- beban_tahun
    8500000000,  -- batas_pagu_terbayar
    'UP3 Surabaya',  -- unit_terbayar
    'Rutin',  -- konfirmasi_non_rutin
    'Bidang Distribusi',  -- bidang
    'PIC-003',  -- pic_id
    'supervisor@pln.co.id',  -- entry_by
    100.00,  -- progress_pekerjaan
    NULL,  -- old_flag
    TRUE,  -- click_cb
    'supervisor@pln.co.id',  -- created_by
    'supervisor@pln.co.id',  -- updated_by
    'DOK/KONTRAK/003/2025'  -- dokumen_kontrak
),
-- Contract 4: Pembangunan GITET 500kV (Bermasalah)
(
    4,
    '031004Pj/STH.01.01/F01071004004/2025',
    '2025-04-05',
    '2026-04-05',
    'Pembangunan GITET 500kV Surabaya Selatan',
    'Pembangunan GITET 500kV Surabaya Selatan',
    45000000000,
    'PT Adhi Karya',
    'investasi',
    'AI',
    'PLN UP3 Medan',
    'bermasalah',
    18000000000,
    27000000000,
    40.00,
    
    -- Investasi specific
    'Pembangunan GITET 500kV',
    45000000000,
    'PT Adhi Karya',
    22500000000,
    'I.1001.23.21.0805.004',
    '1004/KEU.00.03/EVP MUM/2025',
    '1003691004',
    '3101481004',
    'TRE-V/1004/2025/000001004',
    'dokumen_tidak_lengkap',
    18000000000,
    'Pembangunan GITET 500kV Surabaya Selatan',
    'AI',
    '2025.KPST.21.004',
    'CR',
    
    -- Additional fields
    12000000000,  -- nilai_tagihan_kontrak_pusat
    10500000000,  -- nilai_tagihan_unit_induk
    22500000000,  -- nilai_berita_acara
    '0004/JKO/2025/001',  -- no_berita_acara
    '2025-05-05',  -- tanggal_berita_acara
    'BA-SK-004/2025',  -- no_berita_acara_sk_relasi
    NULL,  -- tanggal_arsip (belum diarsipkan karena bermasalah)
    'XPS/004/2025',  -- no_xps
    '2025-05-03',  -- tanggal_xps
    'Sektor Medan',  -- unit_sektor_k
    'SKWE/004/2025',  -- no_skwe
    'AI-004',  -- pos_angg
    'SKU/004/2025',  -- no_sku_skko
    '2025-04-25 11:30:00+07',  -- request_tanggal_se
    '2025-04-25 11:30:00+07',  -- request_tanggal_se_relasi
    'SUB-004-2025',  -- submission_id
    'Konstruksi Gardu Induk',  -- jenis_pekerjaan
    '2025',  -- beban_tahun
    45000000000,  -- batas_pagu_terbayar
    'UP3 Medan',  -- unit_terbayar
    'Non Rutin',  -- konfirmasi_non_rutin
    'Bidang Konstruksi',  -- bidang
    'PIC-004',  -- pic_id
    'manager@pln.co.id',  -- entry_by
    40.00,  -- progress_pekerjaan
    'MASALAH: Dokumen tidak lengkap',  -- old_flag
    FALSE,  -- click_cb
    'manager@pln.co.id',  -- created_by
    'manager@pln.co.id',  -- updated_by
    'DOK/KONTRAK/004/2025'  -- dokumen_kontrak
),
-- Contract 5: Upgrade GI 70kV
(
    5,
    '031005Pj/STH.01.01/F01071005005/2025',
    '2025-05-01',
    '2026-05-01',
    'Upgrade Kapasitas GI Cibinong 70kV',
    'Upgrade Kapasitas GI Cibinong 70kV',
    6200000000,
    'PT Brantas Abipraya',
    'investasi',
    'AI',
    'PLN UP3 Makassar',
    'aktif',
    3720000000,
    2480000000,
    60.00,
    
    -- Investasi specific
    'Upgrade GI 70kV',
    6200000000,
    'PT Brantas Abipraya',
    3720000000,
    'I.1001.23.21.0805.005',
    '1005/KEU.00.03/EVP MUM/2025',
    '1003691005',
    '3101481005',
    'TRE-V/1005/2025/000001005',
    'belum_lunas',
    3720000000,
    'Upgrade Kapasitas GI Cibinong 70kV',
    'AI',
    '2025.KPST.21.005',
    'Not CR',
    
    -- Additional fields
    2000000000,  -- nilai_tagihan_kontrak_pusat
    1720000000,  -- nilai_tagihan_unit_induk
    3720000000,  -- nilai_berita_acara
    '0005/JKO/2025/001',  -- no_berita_acara
    '2025-06-01',  -- tanggal_berita_acara
    'BA-SK-005/2025',  -- no_berita_acara_sk_relasi
    '2025-06-05',  -- tanggal_arsip
    'XPS/005/2025',  -- no_xps
    '2025-06-02',  -- tanggal_xps
    'Sektor Makassar',  -- unit_sektor_k
    'SKWE/005/2025',  -- no_skwe
    'AI-005',  -- pos_angg
    'SKU/005/2025',  -- no_sku_skko
    '2025-05-20 08:45:00+07',  -- request_tanggal_se
    '2025-05-20 08:45:00+07',  -- request_tanggal_se_relasi
    'SUB-005-2025',  -- submission_id
    'Upgrade Peralatan',  -- jenis_pekerjaan
    '2025',  -- beban_tahun
    6200000000,  -- batas_pagu_terbayar
    'UP3 Makassar',  -- unit_terbayar
    'Rutin',  -- konfirmasi_non_rutin
    'Bidang Gardu Induk',  -- bidang
    'PIC-005',  -- pic_id
    'staff@pln.co.id',  -- entry_by
    60.00,  -- progress_pekerjaan
    NULL,  -- old_flag
    FALSE,  -- click_cb
    'staff@pln.co.id',  -- created_by
    'staff@pln.co.id',  -- updated_by
    'DOK/KONTRAK/005/2025'  -- dokumen_kontrak
),
-- Contract 6: Pemeliharaan Trafo (Kategori Pemeliharaan)
(
    6,
    '031006Pj/STH.01.01/F01071006006/2025',
    '2025-06-15',
    '2026-06-15',
    'Pemeliharaan Trafo Distribusi 20kV',
    'Pemeliharaan Berkala Trafo Distribusi 20kV Wilayah Jakarta',
    2500000000,
    'PT Rekadaya Elektrika',
    'pemeliharaan',
    'AO',
    'PLN UP3 Jakarta Timur',
    'aktif',
    1500000000,
    1000000000,
    60.00,
    
    -- Investasi specific (for pemeliharaan, some may be NULL)
    'Pemeliharaan Trafo 20kV',
    2500000000,
    'PT Rekadaya Elektrika',
    1500000000,
    NULL,  -- no_wbs_pos_anggaran (not for pemeliharaan)
    NULL,  -- no_skki
    '1003691006',
    '3101481006',
    NULL,  -- submission_id_vip
    NULL,  -- status_vip
    1500000000,
    'Pemeliharaan Berkala Trafo Distribusi 20kV Wilayah Jakarta',
    'AO',
    NULL,  -- no_prk
    'Not CR',
    
    -- Additional fields
    1000000000,  -- nilai_tagihan_kontrak_pusat
    500000000,  -- nilai_tagihan_unit_induk
    1500000000,  -- nilai_berita_acara
    '0006/JKO/2025/001',  -- no_berita_acara
    '2025-07-15',  -- tanggal_berita_acara
    'BA-SK-006/2025',  -- no_berita_acara_sk_relasi
    '2025-07-20',  -- tanggal_arsip
    'XPS/006/2025',  -- no_xps
    '2025-07-17',  -- tanggal_xps
    'Sektor Jakarta Timur',  -- unit_sektor_k
    'SKWE/006/2025',  -- no_skwe
    'AO-001',  -- pos_angg
    'SKU/006/2025',  -- no_sku_skko
    '2025-07-01 10:00:00+07',  -- request_tanggal_se
    '2025-07-01 10:00:00+07',  -- request_tanggal_se_relasi
    'SUB-006-2025',  -- submission_id
    'Jasa Pemeliharaan',  -- jenis_pekerjaan
    '2025',  -- beban_tahun
    2500000000,  -- batas_pagu_terbayar
    'UP3 Jakarta Timur',  -- unit_terbayar
    'Rutin',  -- konfirmasi_non_rutin
    'Bidang Pemeliharaan',  -- bidang
    'PIC-006',  -- pic_id
    'teknisi@pln.co.id',  -- entry_by
    60.00,  -- progress_pekerjaan
    NULL,  -- old_flag
    FALSE,  -- click_cb
    'teknisi@pln.co.id',  -- created_by
    'teknisi@pln.co.id',  -- updated_by
    'DOK/KONTRAK/006/2025'  -- dokumen_kontrak
),
-- Contract 7: Administrasi Umum (Kategori Administrasi)
(
    7,
    '031007Pj/STH.01.01/F01071007007/2025',
    '2025-07-01',
    '2026-07-01',
    'Jasa Konsultansi Manajemen Proyek',
    'Jasa Konsultansi Manajemen Proyek Kelistrikan',
    1200000000,
    'PT Konsultan Energi',
    'administrasi',
    'AO',
    'PLN Pusat',
    'aktif',
    600000000,
    600000000,
    50.00,
    
    -- Investasi specific (for administrasi, some may be NULL)
    'Jasa Konsultansi',
    1200000000,
    'PT Konsultan Energi',
    600000000,
    NULL,  -- no_wbs_pos_anggaran
    NULL,  -- no_skki
    '1003691007',
    '3101481007',
    NULL,  -- submission_id_vip
    NULL,  -- status_vip
    600000000,
    'Jasa Konsultansi Manajemen Proyek Kelistrikan',
    'AO',
    NULL,  -- no_prk
    'Not CR',
    
    -- Additional fields
    400000000,  -- nilai_tagihan_kontrak_pusat
    200000000,  -- nilai_tagihan_unit_induk
    600000000,  -- nilai_berita_acara
    '0007/JKO/2025/001',  -- no_berita_acara
    '2025-08-01',  -- tanggal_berita_acara
    'BA-SK-007/2025',  -- no_berita_acara_sk_relasi
    '2025-08-05',  -- tanggal_arsip
    'XPS/007/2025',  -- no_xps
    '2025-08-02',  -- tanggal_xps
    'Kantor Pusat',  -- unit_sektor_k
    'SKWE/007/2025',  -- no_skwe
    'AO-002',  -- pos_angg
    'SKU/007/2025',  -- no_sku_skko
    '2025-07-15 14:00:00+07',  -- request_tanggal_se
    '2025-07-15 14:00:00+07',  -- request_tanggal_se_relasi
    'SUB-007-2025',  -- submission_id
    'Jasa Konsultansi',  -- jenis_pekerjaan
    '2025',  -- beban_tahun
    1200000000,  -- batas_pagu_terbayar
    'PLN Pusat',  -- unit_terbayar
    'Non Rutin',  -- konfirmasi_non_rutin
    'Bidang Administrasi',  -- bidang
    'PIC-007',  -- pic_id
    'admin.pusat@pln.co.id',  -- entry_by
    50.00,  -- progress_pekerjaan
    NULL,  -- old_flag
    FALSE,  -- click_cb
    'admin.pusat@pln.co.id',  -- created_by
    'admin.pusat@pln.co.id',  -- updated_by
    'DOK/KONTRAK/007/2025'  -- dokumen_kontrak
)
ON CONFLICT (no_perjanjian) DO UPDATE SET
    -- Update all fields on conflict
    tanggal_perjanjian = EXCLUDED.tanggal_perjanjian,
    tanggal_berakhir = EXCLUDED.tanggal_berakhir,
    uraian_kegiatan = EXCLUDED.uraian_kegiatan,
    judul_pekerjaan = EXCLUDED.judul_pekerjaan,
    nilai_kontrak = EXCLUDED.nilai_kontrak,
    vendor = EXCLUDED.vendor,
    kategori = EXCLUDED.kategori,
    jenis_anggaran = EXCLUDED.jenis_anggaran,
    unit = EXCLUDED.unit,
    status = EXCLUDED.status,
    total_tagihan_dibayar = EXCLUDED.total_tagihan_dibayar,
    sisa_anggaran = EXCLUDED.sisa_anggaran,
    persentase_realisasi = EXCLUDED.persentase_realisasi,
    judul_prk = EXCLUDED.judul_prk,
    nilai_perjanjian = EXCLUDED.nilai_perjanjian,
    nama_vendor = EXCLUDED.nama_vendor,
    nilai_tagihan = EXCLUDED.nilai_tagihan,
    no_wbs_pos_anggaran = EXCLUDED.no_wbs_pos_anggaran,
    no_skki = EXCLUDED.no_skki,
    no_se = EXCLUDED.no_se,
    no_po = EXCLUDED.no_po,
    submission_id_vip = EXCLUDED.submission_id_vip,
    status_vip = EXCLUDED.status_vip,
    terbayar = EXCLUDED.terbayar,
    nama_pekerjaan = EXCLUDED.nama_pekerjaan,
    jenis_ai = EXCLUDED.jenis_ai,
    no_prk = EXCLUDED.no_prk,
    cr_not_cr = EXCLUDED.cr_not_cr,
    nilai_tagihan_kontrak_pusat = EXCLUDED.nilai_tagihan_kontrak_pusat,
    nilai_tagihan_unit_induk = EXCLUDED.nilai_tagihan_unit_induk,
    nilai_berita_acara = EXCLUDED.nilai_berita_acara,
    no_berita_acara = EXCLUDED.no_berita_acara,
    tanggal_berita_acara = EXCLUDED.tanggal_berita_acara,
    no_berita_acara_sk_relasi = EXCLUDED.no_berita_acara_sk_relasi,
    tanggal_arsip = EXCLUDED.tanggal_arsip,
    no_xps = EXCLUDED.no_xps,
    tanggal_xps = EXCLUDED.tanggal_xps,
    unit_sektor_k = EXCLUDED.unit_sektor_k,
    no_skwe = EXCLUDED.no_skwe,
    pos_angg = EXCLUDED.pos_angg,
    no_sku_skko = EXCLUDED.no_sku_skko,
    request_tanggal_se = EXCLUDED.request_tanggal_se,
    request_tanggal_se_relasi = EXCLUDED.request_tanggal_se_relasi,
    submission_id = EXCLUDED.submission_id,
    jenis_pekerjaan = EXCLUDED.jenis_pekerjaan,
    beban_tahun = EXCLUDED.beban_tahun,
    batas_pagu_terbayar = EXCLUDED.batas_pagu_terbayar,
    unit_terbayar = EXCLUDED.unit_terbayar,
    konfirmasi_non_rutin = EXCLUDED.konfirmasi_non_rutin,
    bidang = EXCLUDED.bidang,
    pic_id = EXCLUDED.pic_id,
    entry_by = EXCLUDED.entry_by,
    progress_pekerjaan = EXCLUDED.progress_pekerjaan,
    old_flag = EXCLUDED.old_flag,
    click_cb = EXCLUDED.click_cb,
    created_by = EXCLUDED.created_by,
    updated_by = EXCLUDED.updated_by,
    dokumen_kontrak = EXCLUDED.dokumen_kontrak,
    updated_at = NOW();

-- ============================================
-- STEP 9: Create indexes for better performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_contracts_kategori ON public.contracts(kategori);
CREATE INDEX IF NOT EXISTS idx_contracts_status_vip ON public.contracts(status_vip);
CREATE INDEX IF NOT EXISTS idx_contracts_jenis_ai ON public.contracts(jenis_ai);
CREATE INDEX IF NOT EXISTS idx_contracts_cr_not_cr ON public.contracts(cr_not_cr);

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contracts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
