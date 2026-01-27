-- ============================================
-- UPDATE CONTRACT_MAINTENANCE TABLE STRUCTURE
-- Menyamakan kolom dengan list requirement baru
-- ============================================

-- Backup tabel lama (opsional, untuk keamanan)
-- CREATE TABLE contract_maintenance_backup AS SELECT * FROM contract_maintenance;

-- Drop tabel lama dan buat baru dengan struktur yang benar
DROP TABLE IF EXISTS public.contract_maintenance CASCADE;

-- Buat tabel baru dengan kolom sesuai requirement
CREATE TABLE public.contract_maintenance (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  no SERIAL,
  
  -- Uraian Kegiatan/Mata Anggaran
  uraian_kegiatan TEXT,
  
  -- No. Perjanjian/Amandemen
  no_perjanjian TEXT UNIQUE,
  
  -- Tanggal Perjanjian/Amandemen
  tanggal_perjanjian DATE,
  
  -- Tanggal Berakhir
  tanggal_berakhir DATE,
  
  -- Judul Perjanjian
  judul_perjanjian TEXT,
  
  -- Nilai Perjanjian
  nilai_perjanjian BIGINT DEFAULT 0,
  
  -- Nama Vendor
  nama_vendor TEXT,
  
  -- Nilai Tagihan/Nominal STI Kantor Pusat
  nilai_tagihan_sti_pusat BIGINT DEFAULT 0,
  
  -- Nilai Tagihan/Nominal Unit Induk Seindonesia Raya
  nilai_tagihan_unit_induk BIGINT DEFAULT 0,
  
  -- No. Berita Acara
  no_berita_acara TEXT,
  
  -- Tanggal Berita Acara
  tanggal_berita_acara DATE,
  
  -- No. WBS/Pos Anggaran
  no_wbs_pos_anggaran TEXT,
  
  -- No. SKKI/SKKO
  no_skki_skko TEXT,
  
  -- Tanggal Request SE
  tanggal_request_se DATE,
  
  -- Tanggal SE Rilis
  tanggal_se_rilis DATE,
  
  -- No. SE
  no_se TEXT,
  
  -- No. PO
  no_po TEXT,
  
  -- Submission ID - Vendor Invoicing Portal
  submission_id_vip TEXT,
  
  -- Nama Pekerjaan
  nama_pekerjaan TEXT,
  
  -- MSB
  msb TEXT,
  
  -- Bidang
  bidang TEXT,
  
  -- Status VIP
  status_vip TEXT,
  
  -- Periode Accrue Bulan/Tahun
  periode_accrue TEXT,
  
  -- Requested By
  requested_by TEXT,
  
  -- Keterangan/Konfirmasi
  keterangan TEXT,
  
  -- Terbayar STI Pusat
  terbayar_sti_pusat BIGINT DEFAULT 0,
  
  -- Terbayar Unit
  terbayar_unit BIGINT DEFAULT 0,
  
  -- Status Terbayar
  status_terbayar TEXT,
  
  -- Rutin/Non Rutin
  rutin_non_rutin TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by TEXT
);

-- ============================================
-- INDEXES untuk Performance
-- ============================================

CREATE INDEX idx_contract_maintenance_no_perjanjian ON public.contract_maintenance(no_perjanjian);
CREATE INDEX idx_contract_maintenance_tanggal_perjanjian ON public.contract_maintenance(tanggal_perjanjian);
CREATE INDEX idx_contract_maintenance_nama_vendor ON public.contract_maintenance(nama_vendor);
CREATE INDEX idx_contract_maintenance_status_vip ON public.contract_maintenance(status_vip);
CREATE INDEX idx_contract_maintenance_bidang ON public.contract_maintenance(bidang);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_contract_maintenance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contract_maintenance_updated_at
  BEFORE UPDATE ON public.contract_maintenance
  FOR EACH ROW
  EXECUTE FUNCTION update_contract_maintenance_updated_at();

-- ============================================
-- RLS (Row Level Security) POLICIES
-- ============================================

ALTER TABLE public.contract_maintenance ENABLE ROW LEVEL SECURITY;

-- Policy untuk SELECT (semua user yang authenticated bisa read)
CREATE POLICY "Allow authenticated users to read contract_maintenance"
  ON public.contract_maintenance
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy untuk INSERT (semua user yang authenticated bisa insert)
CREATE POLICY "Allow authenticated users to insert contract_maintenance"
  ON public.contract_maintenance
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy untuk UPDATE (semua user yang authenticated bisa update)
CREATE POLICY "Allow authenticated users to update contract_maintenance"
  ON public.contract_maintenance
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy untuk DELETE (semua user yang authenticated bisa delete)
CREATE POLICY "Allow authenticated users to delete contract_maintenance"
  ON public.contract_maintenance
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- SAMPLE DATA (untuk testing)
-- ============================================

INSERT INTO public.contract_maintenance (
  uraian_kegiatan,
  no_perjanjian,
  tanggal_perjanjian,
  tanggal_berakhir,
  judul_perjanjian,
  nilai_perjanjian,
  nama_vendor,
  nilai_tagihan_sti_pusat,
  nilai_tagihan_unit_induk,
  no_berita_acara,
  tanggal_berita_acara,
  no_wbs_pos_anggaran,
  no_skki_skko,
  tanggal_request_se,
  tanggal_se_rilis,
  no_se,
  no_po,
  submission_id_vip,
  nama_pekerjaan,
  msb,
  bidang,
  status_vip,
  periode_accrue,
  requested_by,
  keterangan,
  terbayar_sti_pusat,
  terbayar_unit,
  status_terbayar,
  rutin_non_rutin,
  created_by
) VALUES 
-- Data 1: Pemeliharaan Jaringan Jakarta - Sudah Sebagian Terbayar
(
  'Pemeliharaan Jaringan Distribusi Listrik',
  'CT-MAINT-2024-001',
  '2024-01-15',
  '2024-12-31',
  'Kontrak Pemeliharaan Jaringan Distribusi Wilayah Jakarta',
  500000000,
  'PT Jaya Maintenance Indonesia',
  300000000,
  200000000,
  'BA/001/MAINT/2024',
  '2024-02-15',
  'WBS-2024-JKT-001',
  'SKKI/001/2024',
  '2024-01-05',
  '2024-01-08',
  'SE/001/MAINT/2024',
  'PO/2024/001/MAINT',
  'VIP-2024-001-MAINT',
  'Pemeliharaan Jaringan Distribusi 20kV Jakarta Pusat',
  'MSB-JKT-001',
  'Teknik Distribusi',
  'belum_lunas',
  '01/2024',
  'Ahmad Fauzi',
  'Kontrak berjalan sesuai jadwal. Pembayaran tahap 1 sudah dilakukan.',
  150000000,
  100000000,
  'sebagian_terbayar',
  'Rutin',
  'admin'
),

-- Data 2: Pemeliharaan Transformator - Belum Terbayar
(
  'Pemeliharaan Transformator Distribusi',
  'CT-MAINT-2024-002',
  '2024-02-01',
  '2024-11-30',
  'Kontrak Pemeliharaan Transformator Area Surabaya',
  750000000,
  'PT Elektro Service Nusantara',
  450000000,
  300000000,
  'BA/002/MAINT/2024',
  '2024-03-01',
  'WBS-2024-SBY-002',
  'SKKO/002/2024',
  '2024-01-20',
  '2024-01-25',
  'SE/002/MAINT/2024',
  'PO/2024/002/MAINT',
  'VIP-2024-002-MAINT',
  'Pemeliharaan Rutin Transformator 150kVA Area Surabaya',
  'MSB-SBY-002',
  'Teknik Transmisi',
  'dokumen_tidak_lengkap',
  '02/2024',
  'Budi Santoso',
  'Menunggu kelengkapan dokumen pendukung dari vendor',
  0,
  0,
  'belum_terbayar',
  'Rutin',
  'admin'
),

-- Data 3: Pemeliharaan SCADA - Lunas
(
  'Pemeliharaan Sistem SCADA',
  'CT-MAINT-2024-003',
  '2024-01-10',
  '2025-01-09',
  'Kontrak Pemeliharaan Sistem SCADA dan Telemetri',
  1200000000,
  'PT Smart Grid Technology',
  800000000,
  400000000,
  'BA/003/MAINT/2024',
  '2024-01-25',
  'WBS-2024-SCADA-003',
  'SKKI/003/2024',
  '2023-12-15',
  '2023-12-20',
  'SE/003/MAINT/2024',
  'PO/2024/003/MAINT',
  'VIP-2024-003-MAINT',
  'Pemeliharaan Sistem SCADA Regional Jawa Barat',
  'MSB-SCADA-003',
  'TI & Sistem Kontrol',
  'lunas',
  '01/2024',
  'Citra Dewi',
  'Pembayaran sudah lunas. Sistem berjalan optimal.',
  800000000,
  400000000,
  'lunas',
  'Rutin',
  'admin'
),

-- Data 4: Pemeliharaan Kabel - Sebagian Terbayar
(
  'Pemeliharaan Kabel Bawah Tanah',
  'CT-MAINT-2024-004',
  '2024-03-01',
  '2024-12-15',
  'Kontrak Pemeliharaan Kabel SKTM Area Bandung',
  650000000,
  'PT Kabel Underground Service',
  400000000,
  250000000,
  'BA/004/MAINT/2024',
  '2024-04-01',
  'WBS-2024-BDG-004',
  'SKKI/004/2024',
  '2024-02-15',
  '2024-02-18',
  'SE/004/MAINT/2024',
  'PO/2024/004/MAINT',
  'VIP-2024-004-MAINT',
  'Pemeliharaan Preventif Kabel SKTM 20kV Bandung',
  'MSB-BDG-004',
  'Teknik Distribusi',
  'belum_lunas',
  '03/2024',
  'Dedi Kurniawan',
  'Progres pekerjaan 60%. Pembayaran termin 1 dan 2 sudah dilakukan.',
  240000000,
  150000000,
  'sebagian_terbayar',
  'Rutin',
  'admin'
),

-- Data 5: Pemeliharaan Gardu Induk - Non Rutin
(
  'Pemeliharaan Besar Gardu Induk',
  'CT-MAINT-2024-005',
  '2024-02-15',
  '2024-08-15',
  'Kontrak Pemeliharaan Besar GI Cibinong',
  2500000000,
  'PT Power Station Maintenance',
  1500000000,
  1000000000,
  'BA/005/MAINT/2024',
  '2024-03-15',
  'WBS-2024-GI-005',
  'SKKO/005/2024',
  '2024-02-01',
  '2024-02-05',
  'SE/005/MAINT/2024',
  'PO/2024/005/MAINT',
  'VIP-2024-005-MAINT',
  'Overhaul Gardu Induk 150kV Cibinong',
  'MSB-GI-005',
  'Teknik Transmisi',
  'belum_lunas',
  '02/2024',
  'Eko Prasetyo',
  'Pekerjaan overhaul peralatan utama GI. Status pembayaran menunggu VO approval.',
  750000000,
  500000000,
  'sebagian_terbayar',
  'Non Rutin',
  'admin'
),

-- Data 6: Pemeliharaan Sistem Proteksi
(
  'Pemeliharaan Sistem Proteksi Relay',
  'CT-MAINT-2024-006',
  '2024-01-20',
  '2024-12-20',
  'Kontrak Pemeliharaan Relay Proteksi Area Semarang',
  450000000,
  'PT Protection System Service',
  280000000,
  170000000,
  'BA/006/MAINT/2024',
  '2024-02-20',
  'WBS-2024-SMG-006',
  'SKKI/006/2024',
  '2024-01-10',
  '2024-01-15',
  'SE/006/MAINT/2024',
  'PO/2024/006/MAINT',
  'VIP-2024-006-MAINT',
  'Pemeliharaan dan Kalibrasi Relay Proteksi',
  'MSB-SMG-006',
  'Teknik Proteksi',
  'lunas',
  '01/2024',
  'Fitri Handayani',
  'Semua relay sudah dikalibrasi. Pembayaran lunas.',
  280000000,
  170000000,
  'lunas',
  'Rutin',
  'admin'
),

-- Data 7: Pemeliharaan Generator
(
  'Pemeliharaan Genset Cadangan',
  'CT-MAINT-2024-007',
  '2024-03-15',
  '2024-09-15',
  'Kontrak Pemeliharaan Generator Set PLTD',
  850000000,
  'PT Genset Engineering Indonesia',
  500000000,
  350000000,
  NULL,
  NULL,
  'WBS-2024-PLTD-007',
  'SKKI/007/2024',
  '2024-03-01',
  '2024-03-05',
  'SE/007/MAINT/2024',
  'PO/2024/007/MAINT',
  'VIP-2024-007-MAINT',
  'Overhaul Genset PLTD Belawan 3x500kVA',
  'MSB-PLTD-007',
  'Pembangkitan',
  'dokumen_tidak_lengkap',
  '03/2024',
  'Gunawan Wijaya',
  'Pekerjaan sedang berjalan. Menunggu BA dari site.',
  0,
  0,
  'belum_terbayar',
  'Non Rutin',
  'admin'
),

-- Data 8: Pemeliharaan Meter
(
  'Pemeliharaan Meter kWh APP',
  'CT-MAINT-2024-008',
  '2024-02-10',
  '2025-02-09',
  'Kontrak Pemeliharaan Meter APP Regional Yogyakarta',
  380000000,
  'PT Metering Solutions',
  230000000,
  150000000,
  'BA/008/MAINT/2024',
  '2024-03-10',
  'WBS-2024-YOG-008',
  'SKKO/008/2024',
  '2024-01-25',
  '2024-01-30',
  'SE/008/MAINT/2024',
  'PO/2024/008/MAINT',
  'VIP-2024-008-MAINT',
  'Pemeliharaan Meter kWh dan MCB APP Pelanggan',
  'MSB-YOG-008',
  'Niaga',
  'belum_lunas',
  '02/2024',
  'Hendra Saputra',
  'Progres 40%. Termin 1 sudah dibayar.',
  92000000,
  60000000,
  'sebagian_terbayar',
  'Rutin',
  'admin'
);

-- Tampilkan hasil insert
SELECT 
  no,
  no_perjanjian,
  judul_perjanjian,
  nama_vendor,
  nilai_perjanjian,
  status_terbayar
FROM public.contract_maintenance
ORDER BY no;

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Cek struktur tabel yang baru dibuat
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contract_maintenance'
ORDER BY ordinal_position;
