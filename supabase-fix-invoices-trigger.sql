-- Fix untuk Error: relation "public.contracts" does not exist

-- Error ini muncul karena ada trigger pada tabel `invoices` lama yang masih mencoba 
-- meng-update tabel `contracts` (yang sekarang sudah dihapus/displit).

DO $$ 
DECLARE
  rec RECORD;
BEGIN
  -- Looping semua trigger yang ada pada tabel invoices
  FOR rec IN 
    SELECT tgname 
    FROM pg_trigger 
    WHERE tgrelid = 'public.invoices'::regclass 
      AND tgname != 'RI_ConstraintTrigger_c' -- Kecualikan default constraint triggers
      AND tgname != 'RI_ConstraintTrigger_a'
      AND tgname NOT LIKE 'pg_%'
  LOOP
    -- Hapus trigger yang menyebabkan error.
    -- Jika trigger dibuat secara manual, ini akan men-drop trigger tersebut.
    EXECUTE 'DROP TRIGGER IF EXISTS ' || rec.tgname || ' ON public.invoices CASCADE';
    RAISE NOTICE 'Dropped trigger: %', rec.tgname;
  END LOOP;
END $$;

-- Jika Anda memiliki perhitungan (seperti total tagihan terbayar) yang bergantung
-- pada invoice, harap buat trigger baru untuk tabel contract_investment, 
-- contract_maintenance, dan contract_administration menggunakan function terpisah
-- yang sesuai dengan struktur kolom ketiga tabel baru.
