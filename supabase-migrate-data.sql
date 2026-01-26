-- ============================================
-- MIGRATION: Migrate data from old contracts table to new split tables
-- SIMAP PLN - Contract Management System
-- ============================================
-- 
-- Jalankan script ini SETELAH supabase-split-tables.sql
-- Script ini akan memigrasikan data dari tabel contracts lama ke 3 tabel baru
-- 
-- PERINGATAN: Pastikan tabel baru sudah dibuat sebelum menjalankan script ini!
-- 
-- ============================================

-- ============================================
-- STEP 1: Migrate Investasi contracts
-- ============================================

INSERT INTO public.contract_investment (
    no_perjanjian, tanggal_perjanjian, tanggal_berakhir,
    judul_prk, nama_pekerjaan, no_prk,
    nilai_perjanjian, nilai_tagihan, terbayar,
    nama_vendor, jenis_ai, cr_not_cr, status, status_vip,
    no_wbs_pos_anggaran, no_skki, no_se, no_po, submission_id_vip,
    no_berita_acara, tanggal_berita_acara, request_tanggal_se,
    unit, unit_sektor_k, uraian_kegiatan,
    nilai_tagihan_kontrak_pusat, nilai_tagihan_unit_induk,
    nilai_berita_acara, no_berita_acara_sk_relasi, tanggal_arsip,
    no_xps, tanggal_xps, no_skwe, pos_angg, no_sku_skko,
    request_tanggal_se_relasi, submission_id, jenis_pekerjaan, beban_tahun,
    batas_pagu_terbayar, unit_terbayar, konfirmasi_non_rutin,
    bidang, pic_id, entry_by, progress_pekerjaan,
    old_flag, click_cb, created_by, updated_by, dokumen_kontrak,
    created_at, updated_at
)
SELECT 
    no_perjanjian, tanggal_perjanjian, tanggal_berakhir,
    COALESCE(judul_prk, uraian_kegiatan, judul_pekerjaan),
    COALESCE(nama_pekerjaan, judul_pekerjaan),
    no_prk,
    COALESCE(nilai_perjanjian, nilai_kontrak),
    nilai_tagihan,
    COALESCE(terbayar, total_tagihan_dibayar),
    COALESCE(nama_vendor, vendor),
    COALESCE(jenis_ai, jenis_anggaran),
    cr_not_cr,
    status,
    COALESCE(status_vip, 'belum_lunas'),
    no_wbs_pos_anggaran,
    no_skki,
    no_se,
    no_po,
    submission_id_vip,
    no_berita_acara,
    tanggal_berita_acara,
    request_tanggal_se,
    unit,
    unit_sektor_k,
    uraian_kegiatan,
    nilai_tagihan_kontrak_pusat,
    nilai_tagihan_unit_induk,
    nilai_berita_acara,
    no_berita_acara_sk_relasi,
    tanggal_arsip,
    no_xps,
    tanggal_xps,
    no_skwe,
    pos_angg,
    no_sku_skko,
    request_tanggal_se_relasi,
    submission_id,
    jenis_pekerjaan,
    beban_tahun,
    batas_pagu_terbayar,
    unit_terbayar,
    konfirmasi_non_rutin,
    bidang,
    pic_id,
    entry_by,
    progress_pekerjaan,
    old_flag,
    click_cb,
    created_by,
    updated_by,
    dokumen_kontrak,
    created_at,
    updated_at
FROM public.contracts
WHERE kategori = 'investasi'
ON CONFLICT (no_perjanjian) DO NOTHING;

-- ============================================
-- STEP 2: Migrate Pemeliharaan contracts
-- ============================================

INSERT INTO public.contract_maintenance (
    no_perjanjian, tanggal_perjanjian, tanggal_berakhir,
    judul_pekerjaan, uraian_kegiatan, jenis_pekerjaan,
    nilai_kontrak, nilai_tagihan, total_tagihan_dibayar,
    vendor, status, jenis_anggaran,
    no_berita_acara, tanggal_berita_acara, nilai_berita_acara,
    no_berita_acara_sk_relasi, tanggal_arsip,
    no_xps, tanggal_xps,
    unit, unit_sektor_k,
    no_skwe, pos_angg, no_sku_skko, no_se, no_po,
    submission_id, request_tanggal_se, request_tanggal_se_relasi,
    beban_tahun, batas_pagu_terbayar, unit_terbayar, konfirmasi_non_rutin,
    bidang, pic_id, pic_name, entry_by, progress_pekerjaan,
    old_flag, click_cb, created_by, updated_by, dokumen_kontrak,
    created_at, updated_at
)
SELECT 
    no_perjanjian, tanggal_perjanjian, tanggal_berakhir,
    judul_pekerjaan,
    uraian_kegiatan,
    jenis_pekerjaan,
    nilai_kontrak,
    nilai_tagihan,
    total_tagihan_dibayar,
    vendor,
    status,
    jenis_anggaran,
    no_berita_acara,
    tanggal_berita_acara,
    nilai_berita_acara,
    no_berita_acara_sk_relasi,
    tanggal_arsip,
    no_xps,
    tanggal_xps,
    unit,
    unit_sektor_k,
    no_skwe,
    pos_angg,
    no_sku_skko,
    no_se,
    no_po,
    submission_id,
    request_tanggal_se,
    request_tanggal_se_relasi,
    beban_tahun,
    batas_pagu_terbayar,
    unit_terbayar,
    konfirmasi_non_rutin,
    bidang,
    pic_id,
    pic_name,
    entry_by,
    progress_pekerjaan,
    old_flag,
    click_cb,
    created_by,
    updated_by,
    dokumen_kontrak,
    created_at,
    updated_at
FROM public.contracts
WHERE kategori = 'pemeliharaan'
ON CONFLICT (no_perjanjian) DO NOTHING;

-- ============================================
-- STEP 3: Migrate Administrasi contracts
-- ============================================

INSERT INTO public.contract_administration (
    no_perjanjian, tanggal_perjanjian, tanggal_berakhir,
    judul_pekerjaan, uraian_kegiatan, jenis_pekerjaan,
    nilai_kontrak, nilai_tagihan, total_tagihan_dibayar,
    vendor, status, jenis_anggaran,
    no_berita_acara, tanggal_berita_acara, nilai_berita_acara,
    no_berita_acara_sk_relasi, tanggal_arsip,
    no_xps, tanggal_xps,
    unit, unit_sektor_k,
    no_skwe, pos_angg, no_sku_skko, no_se, no_po,
    submission_id, request_tanggal_se, request_tanggal_se_relasi,
    beban_tahun, batas_pagu_terbayar, unit_terbayar, konfirmasi_non_rutin,
    bidang, pic_id, pic_name, entry_by, progress_pekerjaan,
    old_flag, click_cb, created_by, updated_by, dokumen_kontrak,
    created_at, updated_at
)
SELECT 
    no_perjanjian, tanggal_perjanjian, tanggal_berakhir,
    judul_pekerjaan,
    uraian_kegiatan,
    jenis_pekerjaan,
    nilai_kontrak,
    nilai_tagihan,
    total_tagihan_dibayar,
    vendor,
    status,
    jenis_anggaran,
    no_berita_acara,
    tanggal_berita_acara,
    nilai_berita_acara,
    no_berita_acara_sk_relasi,
    tanggal_arsip,
    no_xps,
    tanggal_xps,
    unit,
    unit_sektor_k,
    no_skwe,
    pos_angg,
    no_sku_skko,
    no_se,
    no_po,
    submission_id,
    request_tanggal_se,
    request_tanggal_se_relasi,
    beban_tahun,
    batas_pagu_terbayar,
    unit_terbayar,
    konfirmasi_non_rutin,
    bidang,
    pic_id,
    pic_name,
    entry_by,
    progress_pekerjaan,
    old_flag,
    click_cb,
    created_by,
    updated_by,
    dokumen_kontrak,
    created_at,
    updated_at
FROM public.contracts
WHERE kategori = 'administrasi'
ON CONFLICT (no_perjanjian) DO NOTHING;

-- ============================================
-- STEP 4: Verify migration
-- ============================================

SELECT 'Migration Summary:' AS info;

SELECT 
    'contracts (original)' AS table_name, 
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE kategori = 'investasi') AS investasi,
    COUNT(*) FILTER (WHERE kategori = 'pemeliharaan') AS pemeliharaan,
    COUNT(*) FILTER (WHERE kategori = 'administrasi') AS administrasi
FROM public.contracts;

SELECT 'contract_investment' AS table_name, COUNT(*) AS record_count FROM public.contract_investment
UNION ALL
SELECT 'contract_maintenance', COUNT(*) FROM public.contract_maintenance
UNION ALL
SELECT 'contract_administration', COUNT(*) FROM public.contract_administration;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- 
-- Setelah verifikasi berhasil, jalankan supabase-drop-old-table.sql
-- untuk menghapus tabel contracts lama
-- 
-- ============================================
