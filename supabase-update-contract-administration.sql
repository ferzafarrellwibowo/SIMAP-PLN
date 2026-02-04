-- ============================================
-- UPDATE CONTRACT_ADMINISTRATION TABLE STRUCTURE
-- Menyamakan kolom dengan list requirement baru
-- ============================================

-- Backup tabel lama (opsional, untuk keamanan)
-- CREATE TABLE contract_administration_backup AS SELECT * FROM contract_administration;

-- Drop tabel lama dan buat baru dengan struktur yang benar
DROP TABLE IF EXISTS public.contract_administration CASCADE;

-- Buat tabel baru dengan kolom sesuai requirement
CREATE TABLE public.contract_administration (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no SERIAL,
  
  -- 1. Uraian Kegiatan/Mata Anggaran
  uraian_kegiatan TEXT,
  
  -- 2. No. Perjanjian/Amandemen
  no_perjanjian TEXT UNIQUE,
  
  -- 3. Tanggal Perjanjian/Amandemen
  tanggal_perjanjian DATE,
  
  -- 4. Tanggal Berakhir
  tanggal_berakhir DATE,
  
  -- 5. Judul Perjanjian
  judul_perjanjian TEXT,
  
  -- 6. Nilai Perjanjian
  nilai_perjanjian BIGINT DEFAULT 0,
  
  -- 7. Nama Vendor
  nama_vendor TEXT,
  
  -- 8. Nilai Tagihan Keseluruhan
  nilai_tagihan_keseluruhan BIGINT DEFAULT 0,
  
  -- 9. Nilai Tagihan Khusus Kantor Pusat
  nilai_tagihan_kantor_pusat BIGINT DEFAULT 0,
  
  -- 10. Nilai Tagihan Unit selain Kantor Pusat
  nilai_tagihan_unit_selain_pusat BIGINT DEFAULT 0,
  
  -- 11. No. Berita Acara
  no_berita_acara TEXT,
  
  -- 12. Tanggal Berita Acara
  tanggal_berita_acara DATE,
  
  -- 13. No. WBS/Pos Anggaran
  no_wbs_pos_anggaran TEXT,
  
  -- 14. No. SKKI/SKKO
  no_skki_skko TEXT,
  
  -- 15. Tanggal Request
  tanggal_request DATE,
  
  -- 16. Tanggal SE release
  tanggal_se_release DATE,
  
  -- 17. No. SE
  no_se TEXT,
  
  -- 18. No. PO
  no_po TEXT,
  
  -- 19. Submission ID
  submission_id TEXT,
  
  -- 20. Nama Pekerjaan
  nama_pekerjaan TEXT,
  
  -- 21. Beban Tahun
  beban_tahun TEXT,
  
  -- 22. Terbayar Pusat
  terbayar_pusat BIGINT DEFAULT 0,
  
  -- 23. Status Bayar
  status_bayar TEXT,
  
  -- 24. Keterangan
  keterangan TEXT,
  
  -- 25. Entry By
  entry_by TEXT,
  
  -- 26. Keterangan/Konfirmasi
  keterangan_konfirmasi TEXT,
  
  -- 27. Rutin/Non Rutin
  rutin_non_rutin TEXT,
  
  -- 28. PIC
  pic TEXT,
  
  -- 29. Bidang
  bidang TEXT,
  
  -- Metadata (tidak termasuk dalam list user tapi diperlukan untuk sistem)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES untuk Performance
-- ============================================

CREATE INDEX idx_contract_administration_no_perjanjian ON public.contract_administration(no_perjanjian);
CREATE INDEX idx_contract_administration_tanggal_perjanjian ON public.contract_administration(tanggal_perjanjian);
CREATE INDEX idx_contract_administration_nama_vendor ON public.contract_administration(nama_vendor);
CREATE INDEX idx_contract_administration_status_bayar ON public.contract_administration(status_bayar);
CREATE INDEX idx_contract_administration_bidang ON public.contract_administration(bidang);
CREATE INDEX idx_contract_administration_pic ON public.contract_administration(pic);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_contract_administration_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contract_administration_updated_at
  BEFORE UPDATE ON public.contract_administration
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_administration_updated_at();

-- ============================================
-- RLS (Row Level Security) POLICIES
-- ============================================

ALTER TABLE public.contract_administration ENABLE ROW LEVEL SECURITY;

-- Policy untuk SELECT (semua user yang authenticated bisa read)
CREATE POLICY "Allow authenticated users to read contract_administration"
  ON public.contract_administration
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy untuk INSERT (semua user yang authenticated bisa insert)
CREATE POLICY "Allow authenticated users to insert contract_administration"
  ON public.contract_administration
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy untuk UPDATE (semua user yang authenticated bisa update)
CREATE POLICY "Allow authenticated users to update contract_administration"
  ON public.contract_administration
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy untuk DELETE (semua user yang authenticated bisa delete)
CREATE POLICY "Allow authenticated users to delete contract_administration"
  ON public.contract_administration
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- SAMPLE DATA (untuk testing)
-- ============================================

INSERT INTO public.contract_administration (
  uraian_kegiatan,
  no_perjanjian,
  tanggal_perjanjian,
  tanggal_berakhir,
  judul_perjanjian,
  nilai_perjanjian,
  nama_vendor,
  nilai_tagihan_keseluruhan,
  nilai_tagihan_kantor_pusat,
  nilai_tagihan_unit_selain_pusat,
  no_berita_acara,
  tanggal_berita_acara,
  no_wbs_pos_anggaran,
  no_skki_skko,
  tanggal_request,
  tanggal_se_release,
  no_se,
  no_po,
  submission_id,
  nama_pekerjaan,
  beban_tahun,
  terbayar_pusat,
  status_bayar,
  keterangan,
  entry_by,
  keterangan_konfirmasi,
  rutin_non_rutin,
  pic,
  bidang
) VALUES 
-- Data 1: Administrasi Pengadaan ATK - Lunas
(
  'Pengadaan Alat Tulis Kantor',
  'CT-ADMIN-2024-001',
  '2024-01-10',
  '2024-12-31',
  'Kontrak Pengadaan ATK Kantor Pusat Tahun 2024',
  150000000,
  'PT Office Supplies Indonesia',
  150000000,
  100000000,
  50000000,
  'BA/001/ADMIN/2024',
  '2024-02-10',
  'WBS-2024-ATK-001',
  'SKKI/001/ADMIN/2024',
  '2024-01-05',
  '2024-01-08',
  'SE/001/ADMIN/2024',
  'PO/2024/001/ADMIN',
  'SUB-2024-ADMIN-001',
  'Pengadaan ATK Semester 1 Tahun 2024',
  '2024',
  100000000,
  'lunas',
  'Pengadaan ATK rutin kantor pusat',
  'Admin HR',
  'Pembayaran sudah lunas',
  'Rutin',
  'Budi Santoso',
  'Umum'
),

-- Data 2: Administrasi Jasa Kebersihan - Sebagian Terbayar
(
  'Jasa Kebersihan Gedung',
  'CT-ADMIN-2024-002',
  '2024-02-01',
  '2025-01-31',
  'Kontrak Jasa Kebersihan Gedung Kantor Pusat',
  360000000,
  'PT Clean Building Service',
  360000000,
  240000000,
  120000000,
  'BA/002/ADMIN/2024',
  '2024-03-01',
  'WBS-2024-CLEAN-002',
  'SKKO/002/ADMIN/2024',
  '2024-01-20',
  '2024-01-25',
  'SE/002/ADMIN/2024',
  'PO/2024/002/ADMIN',
  'SUB-2024-ADMIN-002',
  'Jasa Kebersihan Bulanan Gedung Pusat',
  '2024',
  160000000,
  'sebagian_terbayar',
  'Kontrak jasa kebersihan berjalan selama 12 bulan',
  'Admin Umum',
  'Pembayaran dilakukan per termin bulanan',
  'Rutin',
  'Dewi Kusuma',
  'Umum'
),

-- Data 3: Administrasi Jasa Keamanan - Belum Terbayar
(
  'Jasa Keamanan Gedung',
  'CT-ADMIN-2024-003',
  '2024-03-01',
  '2025-02-28',
  'Kontrak Jasa Keamanan Gedung Kantor Regional',
  480000000,
  'PT Secure Guard Indonesia',
  480000000,
  300000000,
  180000000,
  NULL,
  NULL,
  'WBS-2024-SEC-003',
  'SKKI/003/ADMIN/2024',
  '2024-02-15',
  '2024-02-20',
  'SE/003/ADMIN/2024',
  'PO/2024/003/ADMIN',
  'SUB-2024-ADMIN-003',
  'Jasa Keamanan 24 Jam Gedung Regional',
  '2024',
  0,
  'belum_terbayar',
  'Menunggu kelengkapan dokumen dari vendor',
  'Admin Regional',
  'Dokumen BA belum lengkap',
  'Rutin',
  'Ahmad Fauzi',
  'Keamanan'
),

-- Data 4: Administrasi Sewa Kendaraan Operasional
(
  'Sewa Kendaraan Operasional',
  'CT-ADMIN-2024-004',
  '2024-01-15',
  '2024-12-31',
  'Kontrak Sewa Kendaraan Operasional Dinas',
  720000000,
  'PT Auto Rental Service',
  720000000,
  500000000,
  220000000,
  'BA/004/ADMIN/2024',
  '2024-02-15',
  'WBS-2024-RENT-004',
  'SKKO/004/ADMIN/2024',
  '2024-01-10',
  '2024-01-12',
  'SE/004/ADMIN/2024',
  'PO/2024/004/ADMIN',
  'SUB-2024-ADMIN-004',
  'Sewa 20 Unit Kendaraan Dinas',
  '2024',
  300000000,
  'sebagian_terbayar',
  'Sewa kendaraan untuk operasional lapangan',
  'Admin Operasional',
  'Pembayaran per semester',
  'Rutin',
  'Citra Dewi',
  'Operasional'
),

-- Data 5: Administrasi Jasa Catering - Lunas
(
  'Jasa Katering Kantor',
  'CT-ADMIN-2024-005',
  '2024-01-02',
  '2024-06-30',
  'Kontrak Jasa Catering Rapat dan Event',
  180000000,
  'PT Catering Prima',
  180000000,
  120000000,
  60000000,
  'BA/005/ADMIN/2024',
  '2024-07-05',
  'WBS-2024-CAT-005',
  'SKKI/005/ADMIN/2024',
  '2023-12-20',
  '2023-12-28',
  'SE/005/ADMIN/2024',
  'PO/2024/005/ADMIN',
  'SUB-2024-ADMIN-005',
  'Jasa Catering Rapat Direksi Semester 1',
  '2024',
  120000000,
  'lunas',
  'Kontrak catering sudah selesai dan lunas',
  'Admin Sekretariat',
  'Kontrak telah berakhir dan dibayar lunas',
  'Non Rutin',
  'Eko Prasetyo',
  'Sekretariat'
),

-- Data 6: Administrasi Jasa Penerjemah
(
  'Jasa Penerjemah Dokumen',
  'CT-ADMIN-2024-006',
  '2024-02-15',
  '2024-08-15',
  'Kontrak Jasa Penerjemah Dokumen Teknis',
  95000000,
  'PT Language Solution',
  95000000,
  70000000,
  25000000,
  'BA/006/ADMIN/2024',
  '2024-03-15',
  'WBS-2024-TRANS-006',
  'SKKI/006/ADMIN/2024',
  '2024-02-10',
  '2024-02-12',
  'SE/006/ADMIN/2024',
  'PO/2024/006/ADMIN',
  'SUB-2024-ADMIN-006',
  'Penerjemahan Manual Teknis Peralatan',
  '2024',
  45000000,
  'sebagian_terbayar',
  'Penerjemahan dokumen manual dari bahasa asing',
  'Admin Teknik',
  'Pembayaran berdasarkan jumlah halaman',
  'Non Rutin',
  'Fitri Handayani',
  'Teknik'
),

-- Data 7: Administrasi Jasa Pelatihan
(
  'Jasa Pelatihan Karyawan',
  'CT-ADMIN-2024-007',
  '2024-03-01',
  '2024-11-30',
  'Kontrak Jasa Training dan Sertifikasi Karyawan',
  450000000,
  'PT Training Center Indonesia',
  450000000,
  300000000,
  150000000,
  NULL,
  NULL,
  'WBS-2024-TRAIN-007',
  'SKKO/007/ADMIN/2024',
  '2024-02-20',
  '2024-02-25',
  'SE/007/ADMIN/2024',
  'PO/2024/007/ADMIN',
  'SUB-2024-ADMIN-007',
  'Training Kompetensi Teknik dan Manajemen',
  '2024',
  0,
  'belum_terbayar',
  'Training batch pertama belum selesai',
  'Admin SDM',
  'Menunggu laporan training dari vendor',
  'Non Rutin',
  'Gunawan Wijaya',
  'SDM'
),

-- Data 8: Administrasi Jasa Konsultan Hukum
(
  'Jasa Konsultan Hukum',
  'CT-ADMIN-2024-008',
  '2024-01-05',
  '2024-12-31',
  'Kontrak Jasa Konsultan Hukum Korporasi',
  600000000,
  'Law Firm Pratama & Partners',
  600000000,
  450000000,
  150000000,
  'BA/008/ADMIN/2024',
  '2024-04-05',
  'WBS-2024-LAW-008',
  'SKKI/008/ADMIN/2024',
  '2023-12-20',
  '2023-12-28',
  'SE/008/ADMIN/2024',
  'PO/2024/008/ADMIN',
  'SUB-2024-ADMIN-008',
  'Konsultasi dan Pendampingan Hukum',
  '2024',
  225000000,
  'sebagian_terbayar',
  'Jasa konsultan hukum untuk pendampingan kontrak',
  'Admin Legal',
  'Retainer fee per kuartal',
  'Rutin',
  'Hendra Saputra',
  'Legal'
);

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Tampilkan hasil insert
SELECT 
  no,
  no_perjanjian,
  judul_perjanjian,
  nama_vendor,
  nilai_perjanjian,
  status_bayar,
  pic,
  bidang
FROM public.contract_administration
ORDER BY no;

-- Cek struktur tabel yang baru dibuat
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contract_administration'
ORDER BY ordinal_position;
