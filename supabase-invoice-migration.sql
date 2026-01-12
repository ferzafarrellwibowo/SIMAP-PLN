-- ============================================
-- MIGRATION: Update struktur tabel invoices
-- - Status: diajukan (default), diterima, ditolak, dibayar
-- - Tambah: tanggal_verifikasi (mencatat waktu perubahan status)
-- - Drop: tanggal_diverifikasi, tanggal_dibayar, tanggal_ditolak, alasan_penolakan
-- Jalankan di Supabase SQL Editor
-- ============================================

-- ============================================
-- STEP 1: Drop kolom-kolom yang tidak diperlukan
-- ============================================

ALTER TABLE public.invoices 
  DROP COLUMN IF EXISTS tanggal_diverifikasi,
  DROP COLUMN IF EXISTS tanggal_dibayar,
  DROP COLUMN IF EXISTS tanggal_ditolak,
  DROP COLUMN IF EXISTS alasan_penolakan,
  DROP COLUMN IF EXISTS diverifikasi_oleh,
  DROP COLUMN IF EXISTS diverifikasi_oleh_name,
  DROP COLUMN IF EXISTS dibayar_oleh,
  DROP COLUMN IF EXISTS dibayar_oleh_name;

-- ============================================
-- STEP 2: Update constraint status
-- ============================================

-- Drop constraint lama jika ada
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

-- Tambah constraint baru dengan nilai status yang benar
ALTER TABLE public.invoices 
  ADD CONSTRAINT invoices_status_check 
  CHECK (status IN ('diajukan', 'diterima', 'ditolak', 'dibayar'));

-- ============================================
-- STEP 3: Tambah kolom tanggal_verifikasi
-- ============================================

ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS tanggal_verifikasi TIMESTAMP WITH TIME ZONE;

-- Tambah kolom dibayar_oleh
ALTER TABLE public.invoices 
  ADD COLUMN IF NOT EXISTS dibayar_oleh TEXT;

-- ============================================
-- STEP 4: Set default status ke 'diajukan'
-- ============================================

ALTER TABLE public.invoices 
  ALTER COLUMN status SET DEFAULT 'diajukan';

-- ============================================
-- STEP 5: Update data yang ada - konversi status lama ke baru
-- ============================================

-- Update status 'diverifikasi' menjadi 'diterima'
UPDATE public.invoices 
SET status = 'diterima' 
WHERE status = 'diverifikasi';

-- Set tanggal_verifikasi untuk invoice yang sudah punya status selain diajukan
UPDATE public.invoices 
SET tanggal_verifikasi = updated_at
WHERE status IN ('diterima', 'ditolak', 'dibayar') 
  AND tanggal_verifikasi IS NULL;

-- ============================================
-- STEP 6: Buat trigger untuk auto-update tanggal_verifikasi
-- ============================================

CREATE OR REPLACE FUNCTION update_invoice_tanggal_verifikasi()
RETURNS TRIGGER AS $$
BEGIN
  -- Jika status berubah (bukan diajukan), update tanggal_verifikasi
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status != 'diajukan' THEN
    NEW.tanggal_verifikasi = NOW();
  END IF;
  
  -- Selalu update updated_at
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger lama jika ada
DROP TRIGGER IF EXISTS trigger_update_invoice_tanggal_verifikasi ON public.invoices;

-- Buat trigger baru
CREATE TRIGGER trigger_update_invoice_tanggal_verifikasi
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_tanggal_verifikasi();

-- ============================================
-- STEP 7: Drop tabel invoice_status jika ada
-- ============================================

DROP TABLE IF EXISTS public.invoice_status CASCADE;

-- ============================================
-- Verifikasi hasil
-- ============================================

SELECT 
  id,
  nomor_tagihan,
  status,
  tanggal_diajukan,
  tanggal_verifikasi,
  updated_at
FROM public.invoices
ORDER BY tanggal_tagihan;

-- Tampilkan struktur tabel
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'invoices'
ORDER BY ordinal_position;
