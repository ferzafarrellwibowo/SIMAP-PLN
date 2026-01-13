-- ============================================
-- MIGRATION: Add progress_pekerjaan column to contracts table
-- Date: 2026-01-13
-- Description: Menambahkan kolom progress_pekerjaan untuk tracking progres fisik pekerjaan
-- ============================================

-- Add progress_pekerjaan column to contracts table
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS progress_pekerjaan DECIMAL(5, 2) DEFAULT 0;

-- Add comment to the column
COMMENT ON COLUMN public.contracts.progress_pekerjaan IS 'Persentase progres fisik penyelesaian pekerjaan (0-100%)';

-- Update existing records to have default value
UPDATE public.contracts 
SET progress_pekerjaan = 0 
WHERE progress_pekerjaan IS NULL;

-- Optional: Add check constraint to ensure value is between 0 and 100
ALTER TABLE public.contracts 
ADD CONSTRAINT check_progress_pekerjaan_range 
CHECK (progress_pekerjaan >= 0 AND progress_pekerjaan <= 100);

-- ============================================
-- SELESAI
-- ============================================
