-- ============================================
-- DROP OLD CONTRACTS TABLE
-- SIMAP PLN - Contract Management System
-- ============================================
-- 
-- ⚠️ PERINGATAN: Script ini akan MENGHAPUS tabel contracts lama!
-- Pastikan data sudah berhasil dimigrasi ke tabel baru sebelum menjalankan script ini!
-- 
-- Jalankan script ini HANYA SETELAH:
-- 1. supabase-split-tables.sql (membuat tabel baru)
-- 2. supabase-migrate-data.sql (migrasi data)
-- 3. Verifikasi data di tabel baru sudah benar
-- 
-- ============================================

-- ============================================
-- STEP 1: Backup check - Verify new tables have data
-- ============================================

DO $$
DECLARE
    inv_count INTEGER;
    mtn_count INTEGER;
    adm_count INTEGER;
    old_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO inv_count FROM public.contract_investment;
    SELECT COUNT(*) INTO mtn_count FROM public.contract_maintenance;
    SELECT COUNT(*) INTO adm_count FROM public.contract_administration;
    
    -- Check if old table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contracts' AND table_schema = 'public') THEN
        SELECT COUNT(*) INTO old_count FROM public.contracts;
        
        RAISE NOTICE 'Old contracts table: % records', old_count;
        RAISE NOTICE 'New contract_investment: % records', inv_count;
        RAISE NOTICE 'New contract_maintenance: % records', mtn_count;
        RAISE NOTICE 'New contract_administration: % records', adm_count;
        RAISE NOTICE 'Total new: % records', inv_count + mtn_count + adm_count;
        
        IF (inv_count + mtn_count + adm_count) = 0 AND old_count > 0 THEN
            RAISE EXCEPTION 'New tables are empty but old table has data! Run migration first.';
        END IF;
    ELSE
        RAISE NOTICE 'Old contracts table does not exist.';
    END IF;
END $$;

-- ============================================
-- STEP 2: Drop triggers on old contracts table
-- ============================================

DROP TRIGGER IF EXISTS trigger_update_contract_status_vip ON public.contracts;
DROP TRIGGER IF EXISTS trigger_contracts_updated_at ON public.contracts;
DROP TRIGGER IF EXISTS set_contracts_updated_at ON public.contracts;

-- ============================================
-- STEP 3: Update invoices table to remove old foreign key
-- ============================================

-- Check and update invoices to use new table references
-- Since invoices are linked by contract_id, we need to handle this

-- First, let's add a new column for category reference
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS contract_category TEXT DEFAULT 'investasi';

-- Update existing invoices with category info from contracts
UPDATE public.invoices i
SET contract_category = c.kategori
FROM public.contracts c
WHERE i.contract_id::TEXT = c.id::TEXT;

-- ============================================
-- STEP 4: Drop foreign key constraints if any
-- ============================================

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'invoices' 
          AND constraint_type = 'FOREIGN KEY'
          AND table_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS ' || r.constraint_name;
    END LOOP;
END $$;

-- ============================================
-- STEP 5: Drop old contracts table
-- ============================================

-- Drop policies first
DROP POLICY IF EXISTS "Enable read access for all users" ON public.contracts;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.contracts;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.contracts;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.contracts;
DROP POLICY IF EXISTS "Anyone can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "Anyone can insert contracts" ON public.contracts;
DROP POLICY IF EXISTS "Anyone can update contracts" ON public.contracts;
DROP POLICY IF EXISTS "Anyone can delete contracts" ON public.contracts;

-- Drop the old table
DROP TABLE IF EXISTS public.contracts CASCADE;

-- ============================================
-- STEP 6: Verify deletion
-- ============================================

SELECT 'Old contracts table dropped successfully!' AS status
WHERE NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'contracts' AND table_schema = 'public'
);

-- Show remaining tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'contract%'
ORDER BY table_name;

-- ============================================
-- DROP COMPLETE
-- ============================================
-- 
-- Tabel contracts lama sudah dihapus.
-- Aplikasi sekarang menggunakan:
-- - contract_investment (untuk kategori Investasi)
-- - contract_maintenance (untuk kategori Pemeliharaan)
-- - contract_administration (untuk kategori Administrasi)
-- 
-- ============================================
