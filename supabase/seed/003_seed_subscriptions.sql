-- ============================================
-- SEED DATA UNTUK LANGGANAN & PEMBAYARAN
-- Data contoh untuk testing
-- ============================================

-- ============================================
-- 0. HAPUS DATA DUPLIKAT SEBELUM INSERT
-- ============================================
-- Hapus monthly_payments yang terkait dengan subscriptions yang akan di-delete
DELETE FROM monthly_payments WHERE subscription_id IN (
    SELECT id FROM subscriptions WHERE no_perjanjian LIKE 'PRJ-2026-%'
);

-- Hapus subscriptions yang sudah ada (berdasarkan no_perjanjian)
DELETE FROM subscriptions WHERE no_perjanjian LIKE 'PRJ-2026-%';

-- ============================================
-- 1. INSERT SUBSCRIPTIONS (Langganan)
-- Kategori: utilitas, software, jasa, perlengkapan, properti, transportasi, karyawan, pemasaran, lainnya
-- ============================================
INSERT INTO subscriptions (no_perjanjian, nama_layanan, vendor, unit, anggaran_per_bulan, periode_mulai, periode_selesai, kategori, deskripsi, status) VALUES

-- ============================================
-- KATEGORI: UTILITAS (Internet, Listrik, Air, Telepon, dll)
-- ============================================
('PRJ-2026-UTL-001', 'Langganan Internet Dedicated 100 Mbps', 'PT Telkom Indonesia', 'PLN UP3 Jakarta Selatan', 15000000, 2026, 2028, 'utilitas', 'Internet dedicated untuk kantor pusat dengan SLA 99.9%', 'aktif'),
('PRJ-2026-UTL-002', 'Langganan Internet Fiber 50 Mbps', 'PT Biznet Networks', 'PLN UP3 Bandung', 8500000, 2026, 2027, 'utilitas', 'Internet fiber optic untuk operasional harian', 'aktif'),
('PRJ-2026-UTL-003', 'Langganan TV Kabel Premium', 'PT MNC Vision', 'PLN UP3 Surabaya', 2500000, 2026, 2027, 'utilitas', 'Paket TV kabel untuk ruang tunggu dan lobby', 'aktif'),
('PRJ-2026-UTL-004', 'Langganan Streaming Berita', 'PT Vidio.com', 'PLN UP3 Medan', 1500000, 2026, 2028, 'utilitas', 'Streaming channel berita untuk monitoring', 'aktif'),
('PRJ-2026-UTL-005', 'Tagihan Listrik Kantor Pusat', 'PT PLN (Persero)', 'PLN Pusat', 45000000, 2026, 2030, 'utilitas', 'Biaya listrik bulanan kantor pusat', 'aktif'),
('PRJ-2026-UTL-006', 'Tagihan Air PDAM', 'PDAM Tirta Dharma', 'PLN UP3 Jakarta Selatan', 8000000, 2026, 2030, 'utilitas', 'Biaya air bersih bulanan', 'aktif'),
('PRJ-2026-UTL-007', 'Langganan Telepon PSTN', 'PT Telkom Indonesia', 'PLN Pusat', 5000000, 2026, 2028, 'utilitas', 'Layanan telepon fixed line kantor', 'aktif'),
('PRJ-2026-UTL-008', 'Langganan Internet Backup', 'PT Indosat Ooredoo', 'PLN UP3 Surabaya', 6000000, 2026, 2027, 'utilitas', 'Internet cadangan untuk failover', 'aktif'),

-- ============================================
-- KATEGORI: SOFTWARE & TEKNOLOGI (SaaS, Lisensi, Cloud)
-- ============================================
('PRJ-2026-SFT-001', 'Lisensi Microsoft 365 Enterprise', 'PT Microsoft Indonesia', 'PLN Pusat', 35000000, 2026, 2028, 'software', 'Lisensi Office 365 untuk 200 user', 'aktif'),
('PRJ-2026-SFT-002', 'Lisensi Antivirus Endpoint', 'PT Kaspersky Lab', 'PLN Pusat', 15000000, 2026, 2027, 'software', 'Proteksi endpoint untuk seluruh komputer', 'aktif'),
('PRJ-2026-SFT-003', 'Lisensi Adobe Creative Cloud', 'PT Adobe Systems', 'PLN UP3 Jakarta Selatan', 8500000, 2026, 2028, 'software', 'Software desain untuk tim marketing', 'aktif'),
('PRJ-2026-SFT-004', 'Sewa Server Cloud AWS', 'PT Amazon Web Services', 'PLN Pusat', 45000000, 2026, 2030, 'software', 'Cloud server untuk aplikasi internal', 'aktif'),
('PRJ-2026-SFT-005', 'Langganan VPN Corporate', 'PT XL Axiata', 'PLN Pusat', 25000000, 2026, 2030, 'software', 'VPN untuk koneksi antar kantor cabang', 'aktif'),
('PRJ-2026-SFT-006', 'Lisensi SAP ERP', 'PT SAP Indonesia', 'PLN Pusat', 120000000, 2026, 2030, 'software', 'Sistem ERP untuk manajemen perusahaan', 'aktif'),
('PRJ-2026-SFT-007', 'Langganan Zoom Enterprise', 'Zoom Video Communications', 'PLN Pusat', 12000000, 2026, 2028, 'software', 'Video conference untuk 500 host', 'aktif'),
('PRJ-2026-SFT-008', 'Lisensi Autodesk AutoCAD', 'PT Autodesk Asia', 'PLN UP3 Bandung', 18000000, 2026, 2028, 'software', 'Software CAD untuk tim engineering', 'aktif'),
('PRJ-2026-SFT-009', 'Sewa Database Oracle Cloud', 'PT Oracle Indonesia', 'PLN Pusat', 55000000, 2026, 2029, 'software', 'Database cloud untuk data warehouse', 'aktif'),
('PRJ-2026-SFT-010', 'Langganan Slack Business', 'Slack Technologies', 'PLN UP3 Jakarta Selatan', 8000000, 2026, 2027, 'software', 'Platform komunikasi tim', 'aktif'),

-- ============================================
-- KATEGORI: JASA & OUTSOURCING (Maintenance, Cleaning, Security)
-- ============================================
('PRJ-2026-JAS-001', 'Servis AC Bulanan (25 unit)', 'PT Daikin Airconditioning', 'PLN UP3 Jakarta Selatan', 12500000, 2026, 2028, 'jasa', 'Perawatan rutin AC split dan central', 'aktif'),
('PRJ-2026-JAS-002', 'Servis Lift Bulanan (3 unit)', 'PT Schindler Lifts Indonesia', 'PLN Pusat', 18000000, 2026, 2030, 'jasa', 'Maintenance lift penumpang dan barang', 'aktif'),
('PRJ-2026-JAS-003', 'Servis Genset Bulanan', 'PT Caterpillar Indonesia', 'PLN UP3 Medan', 8500000, 2026, 2028, 'jasa', 'Perawatan genset backup power', 'aktif'),
('PRJ-2026-JAS-004', 'Jasa Cleaning Service', 'PT ISS Indonesia', 'PLN UP3 Jakarta Selatan', 45000000, 2026, 2028, 'jasa', 'Outsourcing cleaning service 20 orang', 'aktif'),
('PRJ-2026-JAS-005', 'Jasa Security', 'PT Securindo Packatama', 'PLN UP3 Bandung', 65000000, 2026, 2029, 'jasa', 'Outsourcing security 15 orang 24 jam', 'aktif'),
('PRJ-2026-JAS-006', 'Jasa Pest Control', 'PT Rentokil Indonesia', 'PLN UP3 Surabaya', 4500000, 2026, 2028, 'jasa', 'Pengendalian hama bulanan', 'aktif'),
('PRJ-2026-JAS-007', 'Jasa Laundry Seragam', 'PT Cleanmatic Indonesia', 'PLN UP3 Jakarta Selatan', 8000000, 2026, 2027, 'jasa', 'Laundry seragam karyawan lapangan', 'aktif'),
('PRJ-2026-JAS-008', 'Servis CCTV dan Alarm', 'PT Hikvision Indonesia', 'PLN Pusat', 6500000, 2026, 2028, 'jasa', 'Maintenance sistem keamanan CCTV', 'aktif'),
('PRJ-2026-JAS-009', 'Jasa Catering Kantor', 'PT Aerofood Indonesia', 'PLN UP3 Medan', 35000000, 2026, 2027, 'jasa', 'Catering makan siang 150 karyawan', 'aktif'),
('PRJ-2026-JAS-010', 'Servis Fire Safety', 'PT Chubb Safes Indonesia', 'PLN UP3 Makassar', 5500000, 2026, 2028, 'jasa', 'Perawatan APAR dan sistem fire safety', 'aktif'),

-- ============================================
-- KATEGORI: PERLENGKAPAN & PERALATAN KANTOR (Sewa Alat, Furniture)
-- ============================================
('PRJ-2026-PRL-001', 'Sewa Laptop Operasional (50 unit)', 'PT Datascrip', 'PLN UP3 Jakarta Selatan', 75000000, 2026, 2029, 'perlengkapan', 'Sewa laptop HP ProBook untuk karyawan operasional', 'aktif'),
('PRJ-2026-PRL-002', 'Sewa Printer Multifungsi (10 unit)', 'PT Astra Graphia', 'PLN UP3 Bandung', 12000000, 2026, 2028, 'perlengkapan', 'Sewa printer Canon untuk kebutuhan cetak dokumen', 'aktif'),
('PRJ-2026-PRL-003', 'Sewa Proyektor Meeting Room (5 unit)', 'PT Epson Indonesia', 'PLN Pusat', 7500000, 2026, 2027, 'perlengkapan', 'Proyektor untuk ruang meeting dan presentasi', 'aktif'),
('PRJ-2026-PRL-004', 'Sewa Mesin Fotocopy (8 unit)', 'PT Astragraphia', 'PLN UP3 Makassar', 9600000, 2026, 2028, 'perlengkapan', 'Mesin fotocopy untuk kebutuhan administrasi', 'aktif'),
('PRJ-2026-PRL-005', 'Sewa Kursi Kantor Ergonomis (100 unit)', 'PT Vivere Multi Kreasi', 'PLN UP3 Jakarta Selatan', 8000000, 2026, 2028, 'perlengkapan', 'Kursi ergonomis untuk kenyamanan kerja karyawan', 'aktif'),
('PRJ-2026-PRL-006', 'Sewa Meja Kerja Adjustable (80 unit)', 'PT Chitose Indonesia', 'PLN UP3 Bandung', 6400000, 2026, 2028, 'perlengkapan', 'Meja kerja adjustable untuk fleksibilitas kerja', 'aktif'),
('PRJ-2026-PRL-007', 'Sewa Lemari Arsip (30 unit)', 'PT Lion Metal Works', 'PLN UP3 Surabaya', 3000000, 2026, 2027, 'perlengkapan', 'Lemari arsip untuk penyimpanan dokumen', 'aktif'),
('PRJ-2026-PRL-008', 'Sewa Dispenser Air (20 unit)', 'PT Aqua Golden Mississippi', 'PLN UP3 Medan', 2000000, 2026, 2028, 'perlengkapan', 'Dispenser air minum untuk pantry', 'aktif'),
('PRJ-2026-PRL-009', 'Sewa Scanner Dokumen (5 unit)', 'PT Canon Indonesia', 'PLN UP3 Tangerang', 3500000, 2026, 2027, 'perlengkapan', 'Scanner high-speed untuk digitalisasi dokumen', 'aktif'),
('PRJ-2026-PRL-010', 'Sewa Server Rack (3 unit)', 'PT Dell Indonesia', 'PLN Pusat', 15000000, 2026, 2029, 'perlengkapan', 'Server rack untuk data center lokal', 'aktif'),

-- ============================================
-- KATEGORI: PROPERTI & SEWA GEDUNG (Gedung, Gudang, Lahan)
-- ============================================
('PRJ-2026-PRP-001', 'Sewa Gedung Kantor Cabang', 'PT Agung Podomoro Land', 'PLN UP3 Tangerang', 85000000, 2026, 2030, 'properti', 'Sewa gedung 3 lantai untuk kantor cabang', 'aktif'),
('PRJ-2026-PRP-002', 'Sewa Gudang Peralatan', 'PT Ciputra Property', 'PLN UP3 Bekasi', 35000000, 2026, 2028, 'properti', 'Gudang penyimpanan material dan peralatan', 'aktif'),
('PRJ-2026-PRP-003', 'Sewa Lahan Parkir', 'PT Summarecon Agung', 'PLN UP3 Jakarta Selatan', 15000000, 2026, 2027, 'properti', 'Lahan parkir tambahan untuk kendaraan operasional', 'aktif'),
('PRJ-2026-PRP-004', 'Sewa Ruang Workshop', 'PT Lippo Karawaci', 'PLN UP3 Bandung', 25000000, 2026, 2028, 'properti', 'Ruang workshop untuk pelatihan teknis', 'aktif'),
('PRJ-2026-PRP-005', 'Sewa Garasi Kendaraan', 'PT Pakuwon Jati', 'PLN UP3 Surabaya', 18000000, 2026, 2029, 'properti', 'Garasi untuk kendaraan operasional dan truck', 'aktif'),
('PRJ-2026-PRP-006', 'Sewa Ruang Meeting External', 'Hotel Indonesia Kempinski', 'PLN Pusat', 12000000, 2026, 2027, 'properti', 'Sewa ruang meeting untuk event besar', 'aktif'),
('PRJ-2026-PRP-007', 'Sewa Mess Karyawan', 'PT Sinar Mas Land', 'PLN UP3 Makassar', 20000000, 2026, 2028, 'properti', 'Mess untuk karyawan dari luar kota', 'aktif'),
('PRJ-2026-PRP-008', 'Sewa Kantor Representatif', 'PT Metropolitan Land', 'PLN UP3 Medan', 45000000, 2026, 2029, 'properti', 'Kantor representatif di pusat kota', 'aktif'),

-- ============================================
-- KATEGORI: TRANSPORTASI & KENDARAAN (Sewa Mobil, Motor, dll)
-- ============================================
('PRJ-2026-TRP-001', 'Sewa Kendaraan Operasional (10 unit)', 'PT Tunas Ridean', 'PLN UP3 Jakarta Selatan', 55000000, 2026, 2029, 'transportasi', 'Sewa mobil Toyota Avanza untuk operasional lapangan', 'aktif'),
('PRJ-2026-TRP-002', 'Sewa Motor Operasional (20 unit)', 'PT Astra Honda Motor', 'PLN UP3 Makassar', 20000000, 2026, 2028, 'transportasi', 'Sewa motor untuk petugas lapangan', 'aktif'),
('PRJ-2026-TRP-003', 'Sewa Mobil Direksi (3 unit)', 'PT Toyota Astra Motor', 'PLN Pusat', 45000000, 2026, 2030, 'transportasi', 'Sewa Toyota Camry untuk direksi', 'aktif'),
('PRJ-2026-TRP-004', 'Sewa Truck Logistik (5 unit)', 'PT Hino Motors Indonesia', 'PLN UP3 Bandung', 35000000, 2026, 2028, 'transportasi', 'Truck untuk distribusi material', 'aktif'),
('PRJ-2026-TRP-005', 'Sewa Bus Karyawan (2 unit)', 'PT Mercedes-Benz Indonesia', 'PLN UP3 Surabaya', 28000000, 2026, 2029, 'transportasi', 'Bus antar jemput karyawan', 'aktif'),
('PRJ-2026-TRP-006', 'Langganan Bensin Operasional', 'PT Pertamina', 'PLN UP3 Jakarta Selatan', 50000000, 2026, 2030, 'transportasi', 'Voucher BBM untuk kendaraan operasional', 'aktif'),
('PRJ-2026-TRP-007', 'Langganan Tol Elektronik', 'PT Jasa Marga', 'PLN UP3 Tangerang', 15000000, 2026, 2028, 'transportasi', 'Saldo e-toll untuk kendaraan dinas', 'aktif'),
('PRJ-2026-TRP-008', 'Jasa Rental Ambulance', 'PT Ambulance Siaga', 'PLN UP3 Medan', 12000000, 2026, 2027, 'transportasi', 'Ambulance standby untuk keadaan darurat', 'aktif'),

-- ============================================
-- KATEGORI: SDM & LEGALITAS (Training, Asuransi, Konsultan Hukum)
-- ============================================
('PRJ-2026-SDM-001', 'Jasa Training Leadership', 'PT Prasetiya Mulya', 'PLN Pusat', 35000000, 2026, 2028, 'karyawan', 'Pelatihan kepemimpinan untuk level manajer', 'aktif'),
('PRJ-2026-SDM-002', 'Asuransi Kesehatan Karyawan', 'PT Prudential Indonesia', 'PLN Pusat', 85000000, 2026, 2030, 'karyawan', 'Asuransi kesehatan untuk 500 karyawan', 'aktif'),
('PRJ-2026-SDM-003', 'Jasa Konsultan Hukum', 'Hadiputranto Hadinoto & Partners', 'PLN Pusat', 45000000, 2026, 2029, 'karyawan', 'Retainer fee konsultan hukum perusahaan', 'aktif'),
('PRJ-2026-SDM-004', 'Langganan E-Learning Platform', 'LinkedIn Learning', 'PLN Pusat', 18000000, 2026, 2028, 'karyawan', 'Platform pembelajaran online untuk karyawan', 'aktif'),
('PRJ-2026-SDM-005', 'Jasa Assessment Karyawan', 'PT SHL Indonesia', 'PLN UP3 Jakarta Selatan', 12000000, 2026, 2027, 'karyawan', 'Assessment untuk rekrutmen dan promosi', 'aktif'),
('PRJ-2026-SDM-006', 'Asuransi Kecelakaan Kerja', 'PT Jasa Raharja', 'PLN Pusat', 25000000, 2026, 2030, 'karyawan', 'Asuransi kecelakaan untuk petugas lapangan', 'aktif'),
('PRJ-2026-SDM-007', 'Jasa Notaris & PPAT', 'Kantor Notaris Buntario', 'PLN Pusat', 8000000, 2026, 2028, 'karyawan', 'Jasa notaris untuk dokumen legal', 'aktif'),
('PRJ-2026-SDM-008', 'Training Sertifikasi K3', 'PT Kemnaker Training Center', 'PLN UP3 Bandung', 15000000, 2026, 2027, 'karyawan', 'Sertifikasi K3 untuk petugas lapangan', 'aktif'),

-- ============================================
-- KATEGORI: PEMASARAN & PROMOSI (Iklan, Event, Media)
-- ============================================
('PRJ-2026-MKT-001', 'Langganan Google Ads', 'Google Asia Pacific', 'PLN Pusat', 25000000, 2026, 2028, 'pemasaran', 'Iklan digital untuk brand awareness', 'aktif'),
('PRJ-2026-MKT-002', 'Langganan Social Media Management', 'PT Hootsuite Indonesia', 'PLN UP3 Jakarta Selatan', 8000000, 2026, 2027, 'pemasaran', 'Tools manajemen social media', 'aktif'),
('PRJ-2026-MKT-003', 'Jasa Agency PR & Media', 'PT Fortune Indonesia', 'PLN Pusat', 55000000, 2026, 2029, 'pemasaran', 'Jasa public relations dan media handling', 'aktif'),
('PRJ-2026-MKT-004', 'Langganan Email Marketing', 'Mailchimp', 'PLN UP3 Jakarta Selatan', 5000000, 2026, 2028, 'pemasaran', 'Platform email marketing automation', 'aktif'),
('PRJ-2026-MKT-005', 'Sponsorship Event Tahunan', 'PT Indo Premier', 'PLN Pusat', 100000000, 2026, 2027, 'pemasaran', 'Sponsorship event industri kelistrikan', 'aktif'),
('PRJ-2026-MKT-006', 'Jasa Desain Grafis Bulanan', 'PT Sribu Design', 'PLN UP3 Bandung', 12000000, 2026, 2028, 'pemasaran', 'Jasa desain untuk materi promosi', 'aktif'),
('PRJ-2026-MKT-007', 'Langganan Media Monitoring', 'PT Isentia Indonesia', 'PLN Pusat', 15000000, 2026, 2028, 'pemasaran', 'Monitoring berita dan media coverage', 'aktif'),
('PRJ-2026-MKT-008', 'Produksi Video Company Profile', 'PT Froyonion Media', 'PLN UP3 Jakarta Selatan', 20000000, 2026, 2027, 'pemasaran', 'Produksi video profil perusahaan tahunan', 'aktif'),

-- ============================================
-- KATEGORI: LAINNYA (Yang tidak masuk kategori di atas)
-- ============================================
('PRJ-2026-OTH-001', 'Langganan Majalah & Koran', 'PT Kompas Gramedia', 'PLN Pusat', 2500000, 2026, 2027, 'lainnya', 'Langganan media cetak untuk lobby', 'aktif'),
('PRJ-2026-OTH-002', 'Sewa Tanaman Hias Kantor', 'PT Green Pramuka', 'PLN UP3 Jakarta Selatan', 3500000, 2026, 2028, 'lainnya', 'Dekorasi tanaman untuk kantor', 'aktif'),
('PRJ-2026-OTH-003', 'Jasa Pembuangan Limbah B3', 'PT Wastec International', 'PLN UP3 Surabaya', 8000000, 2026, 2029, 'lainnya', 'Pengelolaan limbah berbahaya', 'aktif'),
('PRJ-2026-OTH-004', 'Langganan Musik Background', 'Spotify Premium Business', 'PLN UP3 Jakarta Selatan', 1500000, 2026, 2027, 'lainnya', 'Musik untuk lobby dan ruang tunggu', 'aktif');

-- ============================================
-- 2. FUNCTION untuk Generate Monthly Payments
-- ============================================
CREATE OR REPLACE FUNCTION generate_monthly_payments_for_subscription(
    p_subscription_id UUID,
    p_start_year INTEGER,
    p_end_year INTEGER
) RETURNS void AS $$
DECLARE
    v_year INTEGER;
    v_month INTEGER;
    v_anggaran DECIMAL(15, 2);
BEGIN
    -- Get anggaran per bulan
    SELECT anggaran_per_bulan INTO v_anggaran FROM subscriptions WHERE id = p_subscription_id;
    
    -- Loop through years and months
    FOR v_year IN p_start_year..p_end_year LOOP
        FOR v_month IN 1..12 LOOP
            INSERT INTO monthly_payments (subscription_id, bulan, tahun, status, jumlah_bayar)
            VALUES (p_subscription_id, v_month, v_year, 'UNPAID', v_anggaran)
            ON CONFLICT (subscription_id, bulan, tahun) DO NOTHING;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 3. Generate Monthly Payments untuk semua subscriptions
-- ============================================
DO $$
DECLARE
    sub RECORD;
BEGIN
    FOR sub IN SELECT id, periode_mulai, periode_selesai FROM subscriptions LOOP
        PERFORM generate_monthly_payments_for_subscription(sub.id, sub.periode_mulai, sub.periode_selesai);
    END LOOP;
END $$;

-- ============================================
-- 4. Simulasi beberapa pembayaran yang sudah terbayar
-- ============================================

-- UTILITAS: Internet Dedicated - bayar Jan-Jul 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-UTL001'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-UTL-001'
    AND mp.tahun = 2026 
    AND mp.bulan <= 7;

-- UTILITAS: Internet Fiber - bayar Jan-Apr 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-UTL002'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-UTL-002'
    AND mp.tahun = 2026 
    AND mp.bulan <= 4;

-- UTILITAS: TV Kabel - bayar Jan-Mei 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-UTL003'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-UTL-003'
    AND mp.tahun = 2026 
    AND mp.bulan <= 5;

-- UTILITAS: Tagihan Listrik - bayar Jan-Okt 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-UTL005'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-UTL-005'
    AND mp.tahun = 2026 
    AND mp.bulan <= 10;

-- SOFTWARE: Microsoft 365 - bayar semua 2026 (lunas)
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-SFT001'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-SFT-001'
    AND mp.tahun = 2026;

-- SOFTWARE: SAP ERP - bayar Jan-Sep 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-SFT006'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-SFT-006'
    AND mp.tahun = 2026 
    AND mp.bulan <= 9;

-- JASA: Servis AC - bayar Jan-Aug 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-JAS001'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-JAS-001'
    AND mp.tahun = 2026 
    AND mp.bulan <= 8;

-- JASA: Cleaning Service - bayar Jan-Sep 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-JAS004'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-JAS-004'
    AND mp.tahun = 2026 
    AND mp.bulan <= 9;

-- JASA: Security - bayar Jan-Okt 2026 (gap di Juni)
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-JAS005'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-JAS-005'
    AND mp.tahun = 2026 
    AND mp.bulan IN (1, 2, 3, 4, 5, 7, 8, 9, 10);

-- PERLENGKAPAN: Sewa Laptop - bayar Jan-Jul 2026 (gap di Maret)
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-PRL001'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-PRL-001'
    AND mp.tahun = 2026 
    AND mp.bulan IN (1, 2, 4, 5, 6, 7);

-- PERLENGKAPAN: Sewa Printer - bayar Jan-Jun 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-PRL002'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-PRL-002'
    AND mp.tahun = 2026 
    AND mp.bulan <= 6;

-- PROPERTI: Sewa Gedung - bayar Jan-Okt 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-PRP001'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-PRP-001'
    AND mp.tahun = 2026 
    AND mp.bulan <= 10;

-- PROPERTI: Sewa Gudang - bayar Jan-Aug 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-PRP002'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-PRP-002'
    AND mp.tahun = 2026 
    AND mp.bulan <= 8;

-- TRANSPORTASI: Sewa Kendaraan - bayar Jan-Sep 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-TRP001'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-TRP-001'
    AND mp.tahun = 2026 
    AND mp.bulan <= 9;

-- TRANSPORTASI: Sewa Mobil Direksi - bayar Jan-Jun 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-TRP003'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-TRP-003'
    AND mp.tahun = 2026 
    AND mp.bulan <= 6;

-- TRANSPORTASI: Langganan Bensin - bayar Jan-Okt 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-TRP006'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-TRP-006'
    AND mp.tahun = 2026 
    AND mp.bulan <= 10;

-- KARYAWAN: Asuransi Kesehatan - bayar Jan-Okt 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-SDM002'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-SDM-002'
    AND mp.tahun = 2026 
    AND mp.bulan <= 10;

-- KARYAWAN: Konsultan Hukum - bayar Jan-Jul 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-SDM003'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-SDM-003'
    AND mp.tahun = 2026 
    AND mp.bulan <= 7;

-- PEMASARAN: Google Ads - bayar Jan-Aug 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-MKT001'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-MKT-001'
    AND mp.tahun = 2026 
    AND mp.bulan <= 8;

-- PEMASARAN: PR Agency - bayar Jan-Sep 2026 (gap di Mei)
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-MKT003'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-MKT-003'
    AND mp.tahun = 2026 
    AND mp.bulan IN (1, 2, 3, 4, 6, 7, 8, 9);

-- LAINNYA: Langganan Majalah - bayar Jan-Apr 2026
UPDATE monthly_payments mp
SET status = 'PAID', 
    tanggal_bayar = make_date(tahun, bulan, 15),
    no_invoice = 'INV-' || tahun || '-' || LPAD(bulan::text, 2, '0') || '-OTH001'
FROM subscriptions s
WHERE mp.subscription_id = s.id 
    AND s.no_perjanjian = 'PRJ-2026-OTH-001'
    AND mp.tahun = 2026 
    AND mp.bulan <= 4;

-- ============================================
-- 5. Verify Data
-- ============================================
-- SELECT * FROM subscription_payment_summary;
