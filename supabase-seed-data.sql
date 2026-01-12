-- ============================================
-- SEED DATA UNTUK SUPABASE
-- Migrasi dari Mock Data Lokal ke Cloud
-- Jalankan setelah menjalankan supabase-full-schema.sql
-- ============================================

-- ============================================
-- INSERT USERS (Mock Users)
-- ============================================

INSERT INTO public.users (id, username, name, email, role, unit) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin', 'Administrator', 'admin@pln.co.id', 'admin', 'PLN UP3 Jakarta Selatan'),
  ('00000000-0000-0000-0000-000000000002', 'budi.santoso', 'Budi Santoso', 'budi.santoso@pln.co.id', 'pic', 'PLN UP3 Jakarta Selatan'),
  ('00000000-0000-0000-0000-000000000003', 'siti.rahayu', 'Siti Rahayu', 'siti.rahayu@pln.co.id', 'pic', 'PLN UP3 Bandung'),
  ('00000000-0000-0000-0000-000000000004', 'ahmad.wijaya', 'Ahmad Wijaya', 'ahmad.wijaya@pln.co.id', 'keuangan', 'PLN UP3 Jakarta Selatan'),
  ('00000000-0000-0000-0000-000000000005', 'dewi.lestari', 'Dewi Lestari', 'dewi.lestari@pln.co.id', 'manajer', 'PLN UP3 Jakarta Selatan')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT PROJECTS (15 Proyek dari Mock Data)
-- ============================================

INSERT INTO public.projects (
  id, code, name, description, category, unit, location,
  pic_id, pic_name, status, health_status,
  target_start_date, target_end_date, actual_start_date, actual_end_date,
  estimated_budget, created_at, created_by, updated_at, approved_at, approved_by
) VALUES
  -- Project 1: GI Cawang 150kV (On Progress, Green)
  ('10000000-0000-0000-0000-000000000001', 'PRJ-2025-0001', 'GI Cawang 150kV', 
   'Proyek pembangunan GI Cawang 150kV untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Gardu Induk', 'PLN UP3 Jakarta Selatan', 'Jakarta',
   '00000000-0000-0000-0000-000000000002', 'Budi Santoso', 'on_progress', 'green',
   '2025-01-15', '2026-06-30', '2025-01-20', NULL,
   45000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 2: SUTT 150kV Cikarang-Bekasi (On Progress, Yellow)
  ('10000000-0000-0000-0000-000000000002', 'PRJ-2025-0002', 'SUTT 150kV Cikarang-Bekasi',
   'Proyek pembangunan SUTT 150kV Cikarang-Bekasi untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Transmisi', 'PLN UP3 Bandung', 'Bandung',
   '00000000-0000-0000-0000-000000000003', 'Siti Rahayu', 'on_progress', 'yellow',
   '2025-01-15', '2026-06-30', '2025-01-20', NULL,
   38000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 3: GI Duri Kosambi (On Progress, Red)
  ('10000000-0000-0000-0000-000000000003', 'PRJ-2025-0003', 'GI Duri Kosambi',
   'Proyek pembangunan GI Duri Kosambi untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Gardu Induk', 'PLN UP3 Surabaya', 'Surabaya',
   '00000000-0000-0000-0000-000000000002', 'Budi Santoso', 'on_progress', 'red',
   '2025-01-15', '2026-06-30', '2025-01-20', NULL,
   52000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 4: GITET 500kV Surabaya Selatan (Planned, Green)
  ('10000000-0000-0000-0000-000000000004', 'PRJ-2025-0004', 'GITET 500kV Surabaya Selatan',
   'Proyek pembangunan GITET 500kV Surabaya Selatan untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Gardu Induk', 'PLN UP3 Medan', 'Medan',
   '00000000-0000-0000-0000-000000000003', 'Siti Rahayu', 'planned', 'green',
   '2025-01-15', '2026-06-30', NULL, NULL,
   85000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 5: GI Cibinong 70kV (Initiated, Green)
  ('10000000-0000-0000-0000-000000000005', 'PRJ-2025-0005', 'GI Cibinong 70kV',
   'Proyek pembangunan GI Cibinong 70kV untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Gardu Induk', 'PLN UP3 Makassar', 'Makassar',
   '00000000-0000-0000-0000-000000000002', 'Budi Santoso', 'initiated', 'green',
   '2025-01-15', '2026-06-30', NULL, NULL,
   28000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 6: SUTT 70kV Bandung Utara (Draft, Green)
  ('10000000-0000-0000-0000-000000000006', 'PRJ-2025-0006', 'SUTT 70kV Bandung Utara',
   'Proyek pembangunan SUTT 70kV Bandung Utara untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Transmisi', 'PLN UP3 Jakarta Selatan', 'Semarang',
   '00000000-0000-0000-0000-000000000003', 'Siti Rahayu', 'draft', 'green',
   '2025-01-15', '2026-06-30', NULL, NULL,
   22000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   NULL, NULL),

  -- Project 7: GI Medan Baru 150kV (On Progress, Yellow)
  ('10000000-0000-0000-0000-000000000007', 'PRJ-2025-0007', 'GI Medan Baru 150kV',
   'Proyek pembangunan GI Medan Baru 150kV untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Gardu Induk', 'PLN UP3 Bandung', 'Yogyakarta',
   '00000000-0000-0000-0000-000000000002', 'Budi Santoso', 'on_progress', 'yellow',
   '2025-01-15', '2026-06-30', '2025-01-20', NULL,
   41000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 8: GITET 500kV Makassar (On Progress, Green)
  ('10000000-0000-0000-0000-000000000008', 'PRJ-2025-0008', 'GITET 500kV Makassar',
   'Proyek pembangunan GITET 500kV Makassar untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Gardu Induk', 'PLN UP3 Surabaya', 'Jakarta',
   '00000000-0000-0000-0000-000000000003', 'Siti Rahayu', 'on_progress', 'green',
   '2025-01-15', '2026-06-30', '2025-01-20', NULL,
   78000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 9: GI Semarang Timur (Completed, Green)
  ('10000000-0000-0000-0000-000000000009', 'PRJ-2025-0009', 'GI Semarang Timur',
   'Proyek pembangunan GI Semarang Timur untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Gardu Induk', 'PLN UP3 Medan', 'Bandung',
   '00000000-0000-0000-0000-000000000002', 'Budi Santoso', 'completed', 'green',
   '2025-01-15', '2025-12-31', '2025-01-20', '2025-12-15',
   35000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 10: SUTT 150kV Yogya-Solo (On Hold, Yellow)
  ('10000000-0000-0000-0000-000000000010', 'PRJ-2025-0010', 'SUTT 150kV Yogya-Solo',
   'Proyek pembangunan SUTT 150kV Yogya-Solo untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Transmisi', 'PLN UP3 Makassar', 'Surabaya',
   '00000000-0000-0000-0000-000000000003', 'Siti Rahayu', 'on_hold', 'yellow',
   '2025-01-15', '2026-06-30', '2025-01-20', NULL,
   48000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 11: GI Tangerang Selatan (On Progress, Green)
  ('10000000-0000-0000-0000-000000000011', 'PRJ-2025-0011', 'GI Tangerang Selatan',
   'Proyek pembangunan GI Tangerang Selatan untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Gardu Induk', 'PLN UP3 Jakarta Selatan', 'Medan',
   '00000000-0000-0000-0000-000000000002', 'Budi Santoso', 'on_progress', 'green',
   '2025-01-15', '2026-06-30', '2025-01-20', NULL,
   32000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 12: SUTT 70kV Jakarta Utara (On Progress, Red)
  ('10000000-0000-0000-0000-000000000012', 'PRJ-2025-0012', 'SUTT 70kV Jakarta Utara',
   'Proyek pembangunan SUTT 70kV Jakarta Utara untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Transmisi', 'PLN UP3 Bandung', 'Makassar',
   '00000000-0000-0000-0000-000000000003', 'Siti Rahayu', 'on_progress', 'red',
   '2025-01-15', '2026-06-30', '2025-01-20', NULL,
   27000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 13: GI Bekasi Barat (Planned, Green)
  ('10000000-0000-0000-0000-000000000013', 'PRJ-2025-0013', 'GI Bekasi Barat',
   'Proyek pembangunan GI Bekasi Barat untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Gardu Induk', 'PLN UP3 Surabaya', 'Semarang',
   '00000000-0000-0000-0000-000000000002', 'Budi Santoso', 'planned', 'green',
   '2025-01-15', '2026-06-30', NULL, NULL,
   38000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 14: GITET 500kV Jawa Tengah (Initiated, Green)
  ('10000000-0000-0000-0000-000000000014', 'PRJ-2025-0014', 'GITET 500kV Jawa Tengah',
   'Proyek pembangunan GITET 500kV Jawa Tengah untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Gardu Induk', 'PLN UP3 Medan', 'Yogyakarta',
   '00000000-0000-0000-0000-000000000003', 'Siti Rahayu', 'initiated', 'green',
   '2025-01-15', '2026-06-30', NULL, NULL,
   92000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005'),

  -- Project 15: GI Depok Lama (On Progress, Green)
  ('10000000-0000-0000-0000-000000000015', 'PRJ-2025-0015', 'GI Depok Lama',
   'Proyek pembangunan GI Depok Lama untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.',
   'Gardu Induk', 'PLN UP3 Makassar', 'Jakarta',
   '00000000-0000-0000-0000-000000000002', 'Budi Santoso', 'on_progress', 'green',
   '2025-01-15', '2026-06-30', '2025-01-20', NULL,
   29000000000, '2025-01-01', '00000000-0000-0000-0000-000000000001', NOW(),
   '2025-01-10', '00000000-0000-0000-0000-000000000005')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT MILESTONES (5 Milestones per Project untuk proyek aktif)
-- ============================================

-- Function untuk membuat milestones
DO $$
DECLARE
  proj RECORD;
  milestone_templates TEXT[][] := ARRAY[
    ARRAY['Persiapan', '10', '1'],
    ARRAY['Pengadaan Material', '20', '2'],
    ARRAY['Pekerjaan Sipil', '25', '3'],
    ARRAY['Instalasi Peralatan', '30', '4'],
    ARRAY['Pengujian & Komisioning', '15', '5']
  ];
  i INT;
  milestone_id UUID;
  progress_planned DECIMAL;
  progress_actual DECIMAL;
  m_status TEXT;
BEGIN
  FOR proj IN 
    SELECT id, status FROM public.projects 
    WHERE status IN ('planned', 'on_progress', 'completed', 'on_hold')
  LOOP
    FOR i IN 1..5 LOOP
      milestone_id := uuid_generate_v4();
      
      -- Calculate progress based on order
      progress_planned := LEAST(i * 20, 100);
      
      -- Set actual progress based on project status
      IF proj.status = 'completed' THEN
        progress_actual := 100;
        m_status := 'completed';
      ELSIF proj.status = 'on_progress' THEN
        IF i <= 2 THEN
          progress_actual := progress_planned;
          m_status := 'completed';
        ELSIF i = 3 THEN
          progress_actual := progress_planned - 10;
          m_status := 'in_progress';
        ELSE
          progress_actual := 0;
          m_status := 'not_started';
        END IF;
      ELSE
        progress_actual := 0;
        m_status := 'not_started';
      END IF;
      
      INSERT INTO public.milestones (
        id, project_id, name, description, "order", weight,
        planned_start_date, planned_end_date,
        progress_planned, progress_actual, deliverables, status
      ) VALUES (
        milestone_id, proj.id, milestone_templates[i][1],
        'Tahap ' || milestone_templates[i][1] || ' untuk proyek',
        milestone_templates[i][3]::INT, milestone_templates[i][2]::DECIMAL,
        ('2025-0' || i || '-01')::DATE,
        ('2025-0' || (i + 1) || '-28')::DATE,
        progress_planned, progress_actual,
        ('["Deliverable ' || milestone_templates[i][1] || ' 1", "Deliverable ' || milestone_templates[i][1] || ' 2"]')::JSONB,
        m_status
      );
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- INSERT BUDGET ITEMS (6 items per Project untuk proyek aktif)
-- ============================================

DO $$
DECLARE
  proj RECORD;
  budget_templates TEXT[][] := ARRAY[
    ARRAY['Material Konduktor', 'material', '30'],
    ARRAY['Material Tower', 'material', '20'],
    ARRAY['Jasa Konstruksi', 'jasa', '25'],
    ARRAY['Jasa Engineering', 'jasa', '10'],
    ARRAY['Biaya Operasional', 'operasional', '10'],
    ARRAY['Overhead & Kontingensi', 'overhead', '5']
  ];
  i INT;
  total_planned BIGINT;
  total_actual BIGINT;
  actual_percentage DECIMAL;
BEGIN
  FOR proj IN 
    SELECT id, estimated_budget, status FROM public.projects 
    WHERE status IN ('planned', 'on_progress', 'completed', 'on_hold')
  LOOP
    FOR i IN 1..6 LOOP
      total_planned := (proj.estimated_budget * budget_templates[i][3]::INT / 100);
      
      -- Set actual based on project status
      IF proj.status = 'completed' THEN
        actual_percentage := 0.95;
      ELSIF proj.status = 'on_progress' THEN
        actual_percentage := 0.3 + (random() * 0.4);
      ELSE
        actual_percentage := 0;
      END IF;
      
      total_actual := (total_planned * actual_percentage)::BIGINT;
      
      INSERT INTO public.budget_items (
        project_id, category, name, description,
        quantity, unit, unit_price, total_planned, total_actual
      ) VALUES (
        proj.id, budget_templates[i][2], budget_templates[i][1],
        'Anggaran untuk ' || budget_templates[i][1],
        FLOOR(random() * 100) + 10,
        CASE WHEN budget_templates[i][2] = 'material' THEN 'unit' ELSE 'paket' END,
        total_planned / (FLOOR(random() * 100) + 10),
        total_planned, total_actual
      );
    END LOOP;
  END LOOP;
END $$;

-- ============================================
-- INSERT CONTRACTS (Data Kontrak LENGKAP dengan semua kolom)
-- ============================================

INSERT INTO public.contracts (
  id, no, uraian_kegiatan, no_perjanjian, tanggal_perjanjian, tanggal_berakhir,
  judul_pekerjaan, nilai_kontrak, vendor, 
  nilai_tagihan_kontrak_pusat, nilai_tagihan_unit_induk,
  nilai_berita_acara, no_berita_acara, tanggal_berita_acara, no_berita_acara_sk_relasi,
  tanggal_arsip, no_xps, tanggal_xps,
  kategori, jenis_anggaran, unit, unit_sektor_k,
  no_sk_we, pos_angg, no_sku_skko, request_tanggal_se_relasi, no_se, no_po,
  submission_id, jenis_pekerjaan, beban_tahun, batas_pagu_terbayar, unit_terbayar,
  konfirmasi_non_rutin, bidang, pic_id, pic_name, entry_by,
  status, total_tagihan_dibayar, sisa_anggaran, persentase_realisasi,
  keterangan, dokumen_kontrak
) VALUES
  -- Kontrak 1: Pengadaan Trafo 60 MVA (Aktif)
  ('20000000-0000-0000-0000-000000000001', 1, 'Pengadaan Trafo 60 MVA', 'PJN/2025/001', '2025-01-15', '2026-01-15',
   'Pengadaan dan Pemasangan Trafo Daya 60 MVA GI Cawang', 15000000000, 'PT Wijaya Karya',
   7500000000, 7500000000,
   4500000000, 'BA/2025/001', '2025-04-20', 'BA-SK/2025/001',
   '2025-04-25', 'XPS/2025/001', '2025-04-22',
   'investasi', 'AI', 'PLN UP3 Jakarta Selatan', 'Sektor Jakarta 1',
   'SKWE/2025/001', 'AI-001', 'SKKO/2025/001', '2025-01-10', 'SE/2025/001', 'PO/2025/001',
   'SUB-2025-0001', 'Pengadaan', '2025', 15000000000, 'PLN UP3 Jakarta Selatan',
   'Rutin', 'Pengembangan Jaringan', '00000000-0000-0000-0000-000000000002', 'Budi Santoso', 'Administrator',
   'aktif', 4500000000, 10500000000, 30.00,
   'Kontrak pengadaan trafo daya untuk meningkatkan kapasitas GI Cawang', 'kontrak_trafo_cawang.pdf'),
   
  -- Kontrak 2: Pemeliharaan Trafo GI (Aktif)
  ('20000000-0000-0000-0000-000000000002', 2, 'Pemeliharaan Trafo GI', 'PJN/2025/002', '2025-02-10', '2026-02-10',
   'Pemeliharaan Rutin Trafo GI Bandung Selatan', 2500000000, 'PT Nindya Karya',
   1250000000, 1250000000,
   1000000000, 'BA/2025/002', '2025-05-15', 'BA-SK/2025/002',
   '2025-05-20', 'XPS/2025/002', '2025-05-18',
   'pemeliharaan', 'AO', 'PLN UP3 Bandung', 'Sektor Bandung 1',
   'SKWE/2025/002', 'AO-001', 'SKKO/2025/002', '2025-02-05', 'SE/2025/002', 'PO/2025/002',
   'SUB-2025-0002', 'Pemeliharaan', '2025', 2500000000, 'PLN UP3 Bandung',
   'Rutin', 'Pemeliharaan', '00000000-0000-0000-0000-000000000003', 'Siti Rahayu', 'Administrator',
   'aktif', 1000000000, 1500000000, 40.00,
   'Kontrak pemeliharaan rutin trafo untuk menjaga keandalan sistem', 'kontrak_pemeliharaan_bandung.pdf'),
   
  -- Kontrak 3: Jasa Konsultansi DED (Selesai)
  ('20000000-0000-0000-0000-000000000003', 3, 'Jasa Konsultansi DED', 'PJN/2025/003', '2025-03-05', '2025-12-31',
   'Jasa Konsultansi DED GI Tangerang Baru', 850000000, 'PT Adhi Karya',
   425000000, 425000000,
   850000000, 'BA/2025/003', '2025-12-20', 'BA-SK/2025/003',
   '2025-12-25', 'XPS/2025/003', '2025-12-22',
   'administrasi', 'AI', 'PLN UP3 Jakarta Selatan', 'Sektor Jakarta 2',
   'SKWE/2025/003', 'AI-002', 'SKKO/2025/003', '2025-03-01', 'SE/2025/003', 'PO/2025/003',
   'SUB-2025-0003', 'Konsultansi', '2025', 850000000, 'PLN UP3 Jakarta Selatan',
   'Non Rutin', 'Perencanaan', '00000000-0000-0000-0000-000000000002', 'Budi Santoso', 'Administrator',
   'selesai', 850000000, 0, 100.00,
   'Kontrak konsultansi DED untuk pembangunan GI Tangerang Baru telah selesai', 'kontrak_ded_tangerang.pdf'),
   
  -- Kontrak 4: Pengadaan Kabel XLPE (Aktif)
  ('20000000-0000-0000-0000-000000000004', 4, 'Pengadaan Kabel XLPE', 'PJN/2025/004', '2025-04-01', '2026-03-31',
   'Pengadaan Kabel XLPE 150kV untuk SUTT Cikarang', 8500000000, 'PT Pembangunan Perumahan',
   4250000000, 4250000000,
   2550000000, 'BA/2025/004', '2025-07-10', 'BA-SK/2025/004',
   '2025-07-15', 'XPS/2025/004', '2025-07-12',
   'investasi', 'AI', 'PLN UP3 Bandung', 'Sektor Bandung 2',
   'SKWE/2025/004', 'AI-003', 'SKKO/2025/004', '2025-03-25', 'SE/2025/004', 'PO/2025/004',
   'SUB-2025-0004', 'Pengadaan', '2025', 8500000000, 'PLN UP3 Bandung',
   'Rutin', 'Pengembangan Jaringan', '00000000-0000-0000-0000-000000000003', 'Siti Rahayu', 'Administrator',
   'aktif', 2550000000, 5950000000, 30.00,
   'Kontrak pengadaan kabel XLPE 150kV untuk proyek SUTT Cikarang-Bekasi', 'kontrak_kabel_cikarang.pdf'),
   
  -- Kontrak 5: Pemeliharaan Jaringan (Aktif)
  ('20000000-0000-0000-0000-000000000005', 5, 'Pemeliharaan Jaringan', 'PJN/2025/005', '2025-05-15', '2026-05-14',
   'Pemeliharaan Berkala Jaringan Distribusi Surabaya', 3200000000, 'PT Hutama Karya',
   1600000000, 1600000000,
   800000000, 'BA/2025/005', '2025-08-20', 'BA-SK/2025/005',
   '2025-08-25', 'XPS/2025/005', '2025-08-22',
   'pemeliharaan', 'AO', 'PLN UP3 Surabaya', 'Sektor Surabaya 1',
   'SKWE/2025/005', 'AO-002', 'SKKO/2025/005', '2025-05-10', 'SE/2025/005', 'PO/2025/005',
   'SUB-2025-0005', 'Pemeliharaan', '2025', 3200000000, 'PLN UP3 Surabaya',
   'Rutin', 'Pemeliharaan', '00000000-0000-0000-0000-000000000002', 'Budi Santoso', 'Administrator',
   'aktif', 800000000, 2400000000, 25.00,
   'Kontrak pemeliharaan berkala jaringan distribusi wilayah Surabaya', 'kontrak_pemeliharaan_surabaya.pdf'),
   
  -- Kontrak 6: Konstruksi GI Baru (Aktif)
  ('20000000-0000-0000-0000-000000000006', 6, 'Konstruksi GI Baru', 'PJN/2025/006', '2025-06-01', '2026-12-31',
   'Konstruksi Gardu Induk Baru 150kV Medan Utara', 25000000000, 'PT Waskita Karya',
   12500000000, 12500000000,
   5000000000, 'BA/2025/006', '2025-09-10', 'BA-SK/2025/006',
   '2025-09-15', 'XPS/2025/006', '2025-09-12',
   'investasi', 'AI', 'PLN UP3 Medan', 'Sektor Medan 1',
   'SKWE/2025/006', 'AI-004', 'SKKO/2025/006', '2025-05-25', 'SE/2025/006', 'PO/2025/006',
   'SUB-2025-0006', 'Konstruksi', '2025', 25000000000, 'PLN UP3 Medan',
   'Non Rutin', 'Pengembangan Jaringan', '00000000-0000-0000-0000-000000000003', 'Siti Rahayu', 'Administrator',
   'aktif', 5000000000, 20000000000, 20.00,
   'Kontrak konstruksi pembangunan GI baru 150kV di Medan Utara', 'kontrak_gi_medan.pdf'),
   
  -- Kontrak 7: Upgrade Sistem SCADA (Bermasalah)
  ('20000000-0000-0000-0000-000000000007', 7, 'Upgrade Sistem SCADA', 'PJN/2025/007', '2025-07-10', '2026-07-09',
   'Upgrade Sistem SCADA Regional Makassar', 4800000000, 'PT Telkom Indonesia',
   2400000000, 2400000000,
   960000000, 'BA/2025/007', '2025-10-15', 'BA-SK/2025/007',
   '2025-10-20', 'XPS/2025/007', '2025-10-18',
   'investasi', 'AI', 'PLN UP3 Makassar', 'Sektor Makassar 1',
   'SKWE/2025/007', 'AI-005', 'SKKO/2025/007', '2025-07-05', 'SE/2025/007', 'PO/2025/007',
   'SUB-2025-0007', 'IT & Teknologi', '2025', 4800000000, 'PLN UP3 Makassar',
   'Non Rutin', 'IT & Sistem', '00000000-0000-0000-0000-000000000002', 'Budi Santoso', 'Administrator',
   'bermasalah', 960000000, 3840000000, 20.00,
   'Kontrak upgrade SCADA mengalami keterlambatan karena kendala teknis integrasi sistem', 'kontrak_scada_makassar.pdf'),
   
  -- Kontrak 8: Penggantian Isolator (Aktif)
  ('20000000-0000-0000-0000-000000000008', 8, 'Penggantian Isolator', 'PJN/2025/008', '2025-08-01', '2026-02-28',
   'Penggantian Isolator Transmisi 70kV Semarang', 1500000000, 'PT Brantas Abipraya',
   750000000, 750000000,
   750000000, 'BA/2025/008', '2025-11-05', 'BA-SK/2025/008',
   '2025-11-10', 'XPS/2025/008', '2025-11-08',
   'pemeliharaan', 'AO', 'PLN UP3 Jakarta Selatan', 'Sektor Jakarta 3',
   'SKWE/2025/008', 'AO-003', 'SKKO/2025/008', '2025-07-25', 'SE/2025/008', 'PO/2025/008',
   'SUB-2025-0008', 'Pemeliharaan', '2025', 1500000000, 'PLN UP3 Jakarta Selatan',
   'Rutin', 'Pemeliharaan', '00000000-0000-0000-0000-000000000003', 'Siti Rahayu', 'Administrator',
   'aktif', 750000000, 750000000, 50.00,
   'Kontrak penggantian isolator transmisi 70kV untuk peningkatan keandalan', 'kontrak_isolator_semarang.pdf')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INSERT INVOICES (Tagihan untuk kontrak)
-- ============================================

INSERT INTO public.invoices (
  id, contract_id, no_perjanjian, nomor_tagihan, tanggal_tagihan, nilai_tagihan,
  status, tanggal_diajukan, diajukan_oleh, diajukan_oleh_name
) VALUES
  -- Tagihan untuk kontrak 1
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'PJN/2025/001',
   'INV-2025-0001', '2025-04-15', 3000000000, 'dibayar', '2025-04-15', 'USR-002', 'Budi Santoso'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'PJN/2025/001',
   'INV-2025-0002', '2025-07-15', 1500000000, 'dibayar', '2025-07-15', 'USR-002', 'Budi Santoso'),
   
  -- Tagihan untuk kontrak 2
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'PJN/2025/002',
   'INV-2025-0003', '2025-05-10', 1000000000, 'dibayar', '2025-05-10', 'USR-003', 'Siti Rahayu'),
   
  -- Tagihan untuk kontrak 3 (selesai)
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'PJN/2025/003',
   'INV-2025-0004', '2025-06-05', 425000000, 'dibayar', '2025-06-05', 'USR-002', 'Budi Santoso'),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000003', 'PJN/2025/003',
   'INV-2025-0005', '2025-10-05', 425000000, 'dibayar', '2025-10-05', 'USR-002', 'Budi Santoso'),
   
  -- Tagihan untuk kontrak 4
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000004', 'PJN/2025/004',
   'INV-2025-0006', '2025-07-01', 2550000000, 'dibayar', '2025-07-01', 'USR-003', 'Siti Rahayu'),
   
  -- Tagihan untuk kontrak 5
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000005', 'PJN/2025/005',
   'INV-2025-0007', '2025-08-15', 800000000, 'dibayar', '2025-08-15', 'USR-002', 'Budi Santoso'),
   
  -- Tagihan untuk kontrak 6
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000006', 'PJN/2025/006',
   'INV-2025-0008', '2025-09-01', 5000000000, 'dibayar', '2025-09-01', 'USR-003', 'Siti Rahayu'),
   
  -- Tagihan untuk kontrak 7 (bermasalah)
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000007', 'PJN/2025/007',
   'INV-2025-0009', '2025-10-10', 960000000, 'diverifikasi', '2025-10-10', 'USR-002', 'Budi Santoso'),
   
  -- Tagihan untuk kontrak 8
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000008', 'PJN/2025/008',
   'INV-2025-0010', '2025-11-01', 750000000, 'dibayar', '2025-11-01', 'USR-003', 'Siti Rahayu'),
   
  -- Tagihan pending
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000001', 'PJN/2025/001',
   'INV-2025-0011', '2025-12-15', 2000000000, 'diajukan', '2025-12-15', 'USR-002', 'Budi Santoso'),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000002', 'PJN/2025/002',
   'INV-2025-0012', '2025-12-10', 500000000, 'diverifikasi', '2025-12-10', 'USR-003', 'Siti Rahayu')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CALCULATE PROJECT METRICS
-- ============================================

DO $$
DECLARE
  proj RECORD;
BEGIN
  FOR proj IN SELECT id FROM public.projects WHERE status IN ('planned', 'on_progress', 'completed', 'on_hold')
  LOOP
    PERFORM calculate_project_metrics(proj.id);
  END LOOP;
END $$;

-- ============================================
-- INSERT DASHBOARD SUMMARY (Ringkasan untuk periode)
-- ============================================

INSERT INTO public.dashboard_summary (
  period, unit,
  total_projects, draft_projects, initiated_projects, planned_projects,
  on_progress_projects, on_hold_projects, completed_projects, cancelled_projects,
  healthy_projects, warning_projects, critical_projects,
  total_budget, total_absorbed, total_remaining, absorption_rate,
  avg_planned_progress, avg_actual_progress,
  total_contracts, active_contracts, completed_contracts, problematic_contracts,
  total_contract_value, total_paid_value
) VALUES
  ('2025', NULL, 15, 1, 2, 2, 8, 1, 1, 0, 10, 3, 2,
   690000000000, 276000000000, 414000000000, 40.00,
   50.00, 42.00,
   8, 6, 1, 1,
   61350000000, 16910000000),
   
  ('2025', 'PLN UP3 Jakarta Selatan', 4, 1, 0, 0, 2, 0, 0, 0, 3, 1, 0,
   128000000000, 51200000000, 76800000000, 40.00,
   55.00, 48.00,
   3, 2, 1, 0,
   18350000000, 6100000000),
   
  ('2025', 'PLN UP3 Bandung', 3, 0, 0, 0, 2, 0, 0, 0, 1, 2, 0,
   106000000000, 42400000000, 63600000000, 40.00,
   52.00, 40.00,
   2, 2, 0, 0,
   11000000000, 3550000000)
ON CONFLICT (period, unit) DO UPDATE SET
  total_projects = EXCLUDED.total_projects,
  total_budget = EXCLUDED.total_budget,
  total_absorbed = EXCLUDED.total_absorbed,
  calculated_at = NOW();

-- ============================================
-- SELESAI - SEMUA MOCK DATA TELAH DIMIGRASIKAN
-- ============================================

-- Verifikasi data
SELECT 'Users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'Milestones', COUNT(*) FROM public.milestones
UNION ALL
SELECT 'Budget Items', COUNT(*) FROM public.budget_items
UNION ALL
SELECT 'Contracts', COUNT(*) FROM public.contracts
UNION ALL
SELECT 'Invoices', COUNT(*) FROM public.invoices
UNION ALL
SELECT 'Project Metrics', COUNT(*) FROM public.project_metrics
UNION ALL
SELECT 'Dashboard Summary', COUNT(*) FROM public.dashboard_summary;
