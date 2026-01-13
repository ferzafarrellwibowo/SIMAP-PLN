# Migration Guide - Progress Pekerjaan

## Deskripsi
Migration ini menambahkan fitur **Progress Pekerjaan** untuk tracking progres fisik penyelesaian pekerjaan kontrak.

## Perubahan yang Dilakukan

### 1. Database Schema
- Kolom baru: `progress_pekerjaan` (DECIMAL 5,2) di tabel `contracts`
- Default value: 0
- Range: 0-100%
- Constraint: CHECK untuk memastikan nilai antara 0-100

### 2. API Changes
- **POST /api/contracts**: Menambahkan `progress_pekerjaan` dengan default 0
- **PUT /api/contracts**: Support update `progress_pekerjaan` via dynamic transformation

### 3. Frontend Features
- Display progress pekerjaan di list kontrak dan detail
- Fitur edit inline untuk admin di halaman detail kontrak
- Realtime update ke database seperti update status tagihan
- Loading state saat menyimpan

## Cara Menjalankan Migration

### Opsi 1: Via Supabase Dashboard (Recommended)
1. Login ke Supabase Dashboard
2. Pilih project Anda
3. Buka **SQL Editor**
4. Copy isi file `migrations/002_add_progress_pekerjaan.sql`
5. Paste dan jalankan query

### Opsi 2: Via Supabase CLI
```bash
# Jika sudah setup Supabase CLI
supabase db push

# Atau apply specific migration
psql -h [DB_HOST] -U [DB_USER] -d [DB_NAME] -f migrations/002_add_progress_pekerjaan.sql
```

### Opsi 3: Manual SQL
Jalankan perintah SQL berikut di database:

```sql
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS progress_pekerjaan DECIMAL(5, 2) DEFAULT 0;

COMMENT ON COLUMN public.contracts.progress_pekerjaan IS 'Persentase progres fisik penyelesaian pekerjaan (0-100%)';

UPDATE public.contracts 
SET progress_pekerjaan = 0 
WHERE progress_pekerjaan IS NULL;

ALTER TABLE public.contracts 
ADD CONSTRAINT check_progress_pekerjaan_range 
CHECK (progress_pekerjaan >= 0 AND progress_pekerjaan <= 100);
```

## Verifikasi

Setelah migration, verifikasi dengan:

1. **Check kolom sudah ada:**
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'contracts' AND column_name = 'progress_pekerjaan';
```

2. **Check constraint:**
```sql
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'contracts' AND constraint_name = 'check_progress_pekerjaan_range';
```

3. **Test update:**
```sql
-- Test update (ganti ID dengan ID kontrak yang valid)
UPDATE public.contracts 
SET progress_pekerjaan = 50.5 
WHERE id = 'your-contract-id-here';
```

## Rollback (Jika Diperlukan)

Jika perlu rollback migration:

```sql
-- Remove constraint
ALTER TABLE public.contracts 
DROP CONSTRAINT IF EXISTS check_progress_pekerjaan_range;

-- Remove column
ALTER TABLE public.contracts 
DROP COLUMN IF EXISTS progress_pekerjaan;
```

## Testing

1. Buka halaman detail kontrak
2. Klik icon pensil di bagian "Progres Pekerjaan"
3. Ubah nilai (0-100)
4. Klik ✓ untuk simpan
5. Refresh halaman untuk verifikasi data tersimpan
6. Check di Supabase dashboard bahwa nilai sudah terupdate

## Notes

- Progress pekerjaan independent dari serapan anggaran
- Hanya admin yang bisa edit progress
- Update langsung ke database (realtime)
- Warna progress: 🟢 Hijau (<50%) → 🔵 Teal (50-90%) → 🔵 Biru (≥90%)
