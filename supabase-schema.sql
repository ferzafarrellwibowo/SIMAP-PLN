-- ============================================
-- SCHEMA SQL UNTUK SUPABASE
-- Sistem Monitoring Kontrak & Tagihan PLN
-- ============================================

-- Aktifkan ekstensi UUID jika belum aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: contracts (KONTRAK)
-- ============================================

CREATE TABLE public.contracts (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  no INTEGER NOT NULL,

  -- Identitas Kontrak
  uraian_kegiatan TEXT NOT NULL,
  no_perjanjian TEXT NOT NULL,
  tanggal_perjanjian DATE NOT NULL,
  tanggal_berakhir DATE NOT NULL,
  judul_pekerjaan TEXT NOT NULL,

  -- Nilai & Vendor
  nilai_kontrak BIGINT NOT NULL,
  vendor TEXT NOT NULL,

  -- Tagihan
  nilai_tagihan_kontrak_pusat BIGINT DEFAULT 0,
  nilai_tagihan_unit_induk BIGINT DEFAULT 0,
  nilai_berita_acara BIGINT,

  -- Berita Acara
  no_berita_acara TEXT,
  tanggal_berita_acara DATE,
  no_berita_acara_sk_relasi TEXT,

  -- Arsip
  tanggal_arsip DATE,

  -- XPS (Sistem Pembayaran)
  no_xps TEXT,
  tanggal_xps DATE,

  -- Kategori & Unit
  kategori TEXT NOT NULL CHECK (kategori IN ('investasi', 'pemeliharaan', 'administrasi')),
  jenis_anggaran TEXT NOT NULL CHECK (jenis_anggaran IN ('AI', 'AO')),
  unit TEXT NOT NULL,
  unit_sektor_k TEXT,

  -- SK/WE & PO
  no_sk_we TEXT,
  pos_angg TEXT,
  no_sku_skko TEXT,
  request_tanggal_se_relasi DATE,
  no_se TEXT,
  no_po TEXT,
  submission_id TEXT,

  -- Detail Pekerjaan
  jenis_pekerjaan TEXT,
  beban_tahun TEXT,
  batas_pagu_terbayar BIGINT,
  unit_terbayar TEXT,
  konfirmasi_non_rutin TEXT,
  bidang TEXT,

  -- PIC
  pic_id TEXT,
  pic_name TEXT,
  entry_by TEXT,

  -- Status & calculated fields
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai', 'bermasalah')),
  total_tagihan_dibayar BIGINT DEFAULT 0,
  sisa_anggaran BIGINT DEFAULT 0,
  persentase_realisasi DECIMAL(5, 2) DEFAULT 0,

  -- Flags
  old_flag TEXT,
  click_cb BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT,

  -- Optional
  keterangan TEXT,
  dokumen_kontrak TEXT
);

-- Indexes untuk performa
CREATE INDEX idx_contracts_no_perjanjian ON public.contracts(no_perjanjian);
CREATE INDEX idx_contracts_kategori ON public.contracts(kategori);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_unit ON public.contracts(unit);
CREATE INDEX idx_contracts_tanggal_berakhir ON public.contracts(tanggal_berakhir);

-- ============================================
-- TABLE: invoices (TAGIHAN)
-- ============================================

CREATE TABLE public.invoices (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Key
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  no_perjanjian TEXT NOT NULL,

  -- Identitas Tagihan
  nomor_tagihan TEXT NOT NULL,
  tanggal_tagihan DATE NOT NULL,
  nilai_tagihan BIGINT NOT NULL,

  -- Berita Acara
  no_berita_acara TEXT,
  tanggal_berita_acara DATE,

  -- Arsip
  tanggal_arsip DATE,

  -- XPS (Sistem Pembayaran)
  no_xps TEXT,
  tanggal_xps DATE,

  -- Status & tracking
  status TEXT NOT NULL DEFAULT 'diajukan' CHECK (status IN ('diajukan', 'diverifikasi', 'dibayar', 'ditolak')),

  -- Tanggal status changes
  tanggal_diajukan TIMESTAMP WITH TIME ZONE NOT NULL,
  tanggal_diverifikasi TIMESTAMP WITH TIME ZONE,
  tanggal_dibayar TIMESTAMP WITH TIME ZONE,
  tanggal_ditolak TIMESTAMP WITH TIME ZONE,

  -- Notes
  keterangan TEXT,
  alasan_penolakan TEXT,

  -- User tracking
  diajukan_oleh TEXT NOT NULL,
  diajukan_oleh_name TEXT NOT NULL,
  diverifikasi_oleh TEXT,
  diverifikasi_oleh_name TEXT,
  dibayar_oleh TEXT,
  dibayar_oleh_name TEXT,

  -- Dokumen pendukung
  dokumen_tagihan TEXT,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk performa
CREATE INDEX idx_invoices_contract_id ON public.invoices(contract_id);
CREATE INDEX idx_invoices_nomor_tagihan ON public.invoices(nomor_tagihan);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_tanggal_tagihan ON public.invoices(tanggal_tagihan);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policies untuk contracts
CREATE POLICY "Enable read access for all users" ON public.contracts
  FOR SELECT USING (TRUE);

CREATE POLICY "Enable insert for authenticated users" ON public.contracts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.contracts
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.contracts
  FOR DELETE USING (auth.role() = 'authenticated');

-- Policies untuk invoices
CREATE POLICY "Enable read access for all users" ON public.invoices
  FOR SELECT USING (TRUE);

CREATE POLICY "Enable insert for authenticated users" ON public.invoices
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON public.invoices
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON public.invoices
  FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCTION: Update total_tagihan_dibayar otomatis
-- ============================================

CREATE OR REPLACE FUNCTION update_contract_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update contract totals when invoice status changes to 'dibayar'
  IF NEW.status = 'dibayar' AND (OLD.status IS NULL OR OLD.status != 'dibayar') THEN
    UPDATE public.contracts
    SET 
      total_tagihan_dibayar = COALESCE(total_tagihan_dibayar, 0) + NEW.nilai_tagihan,
      sisa_anggaran = nilai_kontrak - (COALESCE(total_tagihan_dibayar, 0) + NEW.nilai_tagihan),
      persentase_realisasi = ((COALESCE(total_tagihan_dibayar, 0) + NEW.nilai_tagihan)::DECIMAL / NULLIF(nilai_kontrak, 0)) * 100,
      updated_at = NOW()
    WHERE id = NEW.contract_id;
  END IF;

  -- Reverse if status changes from 'dibayar' to something else
  IF OLD.status = 'dibayar' AND NEW.status != 'dibayar' THEN
    UPDATE public.contracts
    SET 
      total_tagihan_dibayar = GREATEST(COALESCE(total_tagihan_dibayar, 0) - NEW.nilai_tagihan, 0),
      sisa_anggaran = nilai_kontrak - GREATEST(COALESCE(total_tagihan_dibayar, 0) - NEW.nilai_tagihan, 0),
      persentase_realisasi = (GREATEST(COALESCE(total_tagihan_dibayar, 0) - NEW.nilai_tagihan, 0)::DECIMAL / NULLIF(nilai_kontrak, 0)) * 100,
      updated_at = NOW()
    WHERE id = NEW.contract_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update
CREATE TRIGGER trigger_update_contract_totals
AFTER INSERT OR UPDATE OF status ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_contract_totals();

-- ============================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk contracts
CREATE TRIGGER trigger_contracts_updated_at
BEFORE UPDATE ON public.contracts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger untuk invoices
CREATE TRIGGER trigger_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Opsional - hapus jika tidak perlu)
-- ============================================

-- Contoh insert contract
INSERT INTO public.contracts (
  no, uraian_kegiatan, no_perjanjian, tanggal_perjanjian, tanggal_berakhir,
  judul_pekerjaan, nilai_kontrak, vendor, kategori, jenis_anggaran, unit, status
) VALUES
  (1, 'Pengadaan Trafo 60 MVA', 'PJN/2025/001', '2025-01-15', '2026-01-15',
   'Pengadaan dan Pemasangan Trafo Daya 60 MVA GI Cawang', 15000000000, 'PT Wijaya Karya',
   'investasi', 'AI', 'PLN UP3 Jakarta Selatan', 'aktif'),
  (2, 'Pemeliharaan Trafo GI', 'PJN/2025/002', '2025-02-10', '2026-02-10',
   'Pemeliharaan Rutin Trafo GI Bandung Selatan', 2500000000, 'PT Nindya Karya',
   'pemeliharaan', 'AO', 'PLN UP3 Bandung', 'aktif'),
  (3, 'Jasa Konsultansi DED', 'PJN/2025/003', '2025-03-05', '2025-12-31',
   'Jasa Konsultansi DED GI Tangerang Baru', 850000000, 'PT Adhi Karya',
   'administrasi', 'AI', 'PLN UP3 Jakarta Selatan', 'aktif');

-- Contoh insert invoice (setelah contracts ada)
-- INSERT INTO public.invoices (
--   contract_id, no_perjanjian, nomor_tagihan, tanggal_tagihan, nilai_tagihan,
--   status, tanggal_diajukan, diajukan_oleh, diajukan_oleh_name
-- ) VALUES
--   ((SELECT id FROM public.contracts WHERE no_perjanjian = 'PJN/2025/001' LIMIT 1),
--    'PJN/2025/001', 'INV-0001', '2025-04-15', 3000000000,
--    'diajukan', NOW(), 'user-001', 'Admin Satu');

-- ============================================
-- SELESAI
-- ============================================
