-- ============================================
-- MIGRASI KATEGORI BARU
-- Update data existing ke kategori baru
-- Kategori valid: utilitas, software, jasa, perlengkapan, properti, transportasi, karyawan, pemasaran, lainnya
-- ============================================

-- Update kategori 'internet' ke 'utilitas'
UPDATE subscriptions SET kategori = 'utilitas' WHERE kategori = 'internet';

-- Update kategori 'tv' ke 'utilitas'
UPDATE subscriptions SET kategori = 'utilitas' WHERE kategori = 'tv';

-- Update kategori 'sewa_peralatan' ke 'perlengkapan'
UPDATE subscriptions SET kategori = 'perlengkapan' WHERE kategori = 'sewa_peralatan';

-- Update kategori 'servis' ke 'jasa'
UPDATE subscriptions SET kategori = 'jasa' WHERE kategori = 'servis';

-- Update kategori 'sewa_gedung' ke 'properti' (kategori baru)
UPDATE subscriptions SET kategori = 'properti' WHERE kategori = 'sewa_gedung';

-- Properti/gedung items should become 'properti'
UPDATE subscriptions 
SET kategori = 'properti' 
WHERE kategori IN ('utilitas', 'lainnya') 
  AND (
    LOWER(nama_layanan) LIKE '%sewa gedung%' OR
    LOWER(nama_layanan) LIKE '%sewa gudang%' OR
    LOWER(nama_layanan) LIKE '%sewa lahan%' OR
    LOWER(nama_layanan) LIKE '%sewa ruang%' OR
    LOWER(nama_layanan) LIKE '%sewa kantor%' OR
    LOWER(nama_layanan) LIKE '%sewa mess%' OR
    LOWER(nama_layanan) LIKE '%sewa garasi%'
  );

-- Vehicle/transport items should become 'transportasi' (kategori baru)
UPDATE subscriptions 
SET kategori = 'transportasi' 
WHERE kategori IN ('perlengkapan', 'lainnya') 
  AND (
    LOWER(nama_layanan) LIKE '%kendaraan%' OR
    LOWER(nama_layanan) LIKE '%sewa mobil%' OR
    LOWER(nama_layanan) LIKE '%sewa motor%' OR
    LOWER(nama_layanan) LIKE '%sewa truck%' OR
    LOWER(nama_layanan) LIKE '%sewa bus%' OR
    LOWER(nama_layanan) LIKE '%ambulance%' OR
    LOWER(nama_layanan) LIKE '%bensin%' OR
    LOWER(nama_layanan) LIKE '%bbm%' OR
    LOWER(nama_layanan) LIKE '%tol%'
  );

-- Software-related items in 'lainnya' or 'utilitas' should become 'software'
UPDATE subscriptions 
SET kategori = 'software' 
WHERE kategori IN ('utilitas', 'lainnya') 
  AND (
    LOWER(nama_layanan) LIKE '%lisensi%' OR
    LOWER(nama_layanan) LIKE '%software%' OR
    LOWER(nama_layanan) LIKE '%microsoft%' OR
    LOWER(nama_layanan) LIKE '%adobe%' OR
    LOWER(nama_layanan) LIKE '%antivirus%' OR
    LOWER(nama_layanan) LIKE '%cloud%' OR
    LOWER(nama_layanan) LIKE '%saas%' OR
    LOWER(nama_layanan) LIKE '%server%' OR
    LOWER(nama_layanan) LIKE '%vpn%' OR
    LOWER(nama_layanan) LIKE '%sap%' OR
    LOWER(nama_layanan) LIKE '%zoom%' OR
    LOWER(nama_layanan) LIKE '%slack%' OR
    LOWER(nama_layanan) LIKE '%oracle%'
  );

-- SDM/karyawan related items should become 'karyawan'
UPDATE subscriptions 
SET kategori = 'karyawan' 
WHERE kategori = 'lainnya' 
  AND (
    LOWER(nama_layanan) LIKE '%training%' OR
    LOWER(nama_layanan) LIKE '%pelatihan%' OR
    LOWER(nama_layanan) LIKE '%asuransi%' OR
    LOWER(nama_layanan) LIKE '%konsultan hukum%' OR
    LOWER(nama_layanan) LIKE '%notaris%' OR
    LOWER(nama_layanan) LIKE '%sertifikasi%' OR
    LOWER(nama_layanan) LIKE '%assessment%' OR
    LOWER(nama_layanan) LIKE '%e-learning%'
  );

-- Marketing/pemasaran related items should become 'pemasaran'
UPDATE subscriptions 
SET kategori = 'pemasaran' 
WHERE kategori = 'lainnya' 
  AND (
    LOWER(nama_layanan) LIKE '%google ads%' OR
    LOWER(nama_layanan) LIKE '%social media%' OR
    LOWER(nama_layanan) LIKE '%email marketing%' OR
    LOWER(nama_layanan) LIKE '%pr %' OR
    LOWER(nama_layanan) LIKE '%public relation%' OR
    LOWER(nama_layanan) LIKE '%sponsorship%' OR
    LOWER(nama_layanan) LIKE '%desain grafis%' OR
    LOWER(nama_layanan) LIKE '%media monitoring%' OR
    LOWER(nama_layanan) LIKE '%company profile%'
  );

-- Verify update
-- SELECT kategori, COUNT(*) as total FROM subscriptions GROUP BY kategori ORDER BY kategori;
