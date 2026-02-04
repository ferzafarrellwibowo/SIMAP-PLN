# Panduan Migrasi Tabel Kontrak

## Overview

Migrasi ini akan memisahkan tabel `contracts` yang sebelumnya menyimpan semua kategori kontrak menjadi 3 tabel terpisah:

1. **`contract_investment`** - Untuk kontrak kategori Investasi (AI)
2. **`contract_maintenance`** - Untuk kontrak kategori Pemeliharaan (AO)
3. **`contract_administration`** - Untuk kontrak kategori Administrasi (AO)

## Urutan Eksekusi SQL Scripts

### 1. Buat Tabel Baru (supabase-split-tables.sql)

Script ini akan:
- Membuat 3 tabel baru dengan struktur yang sesuai
- Membuat triggers untuk auto-calculate (sisa_anggaran, persentase_realisasi)
- Membuat triggers untuk updated_at
- Membuat RLS policies
- Membuat indexes untuk performance

```bash
# Jalankan di Supabase SQL Editor
# File: supabase-split-tables.sql
```

### 2. Seed Data (supabase-seed-data.sql)

Script ini akan:
- Insert sample data untuk contract_investment (5 records)
- Insert sample data untuk contract_maintenance (4 records)
- Insert sample data untuk contract_administration (3 records)

```bash
# Jalankan di Supabase SQL Editor
# File: supabase-seed-data.sql
```

### 3. Migrasi Data dari Tabel Lama (OPSIONAL - supabase-migrate-data.sql)

Jika Anda memiliki data di tabel `contracts` lama yang ingin dipindahkan:

```bash
# Jalankan di Supabase SQL Editor
# File: supabase-migrate-data.sql
```

### 4. Hapus Tabel Lama (OPSIONAL - supabase-drop-old-table.sql)

⚠️ **PERINGATAN**: Hanya jalankan setelah memastikan data sudah termigrasi dengan benar!

```bash
# Jalankan di Supabase SQL Editor
# File: supabase-drop-old-table.sql
```

## Struktur Tabel Baru

### contract_investment

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary Key |
| no | SERIAL | Nomor urut |
| no_perjanjian | TEXT | Nomor perjanjian (unique, auto-generate) |
| tanggal_perjanjian | DATE | Tanggal perjanjian |
| tanggal_berakhir | DATE | Tanggal berakhir |
| judul_prk | TEXT | Judul PRK |
| nama_pekerjaan | TEXT | Nama pekerjaan |
| no_prk | TEXT | Nomor PRK (auto-generate) |
| nilai_perjanjian | BIGINT | Nilai kontrak |
| nilai_tagihan | BIGINT | Nilai tagihan |
| terbayar | BIGINT | Total yang sudah dibayar |
| sisa_anggaran | BIGINT | Otomatis dihitung |
| persentase_realisasi | NUMERIC | Otomatis dihitung |
| nama_vendor | TEXT | Nama vendor |
| jenis_ai | TEXT | AI atau AO |
| cr_not_cr | TEXT | CR atau Not CR |
| status | TEXT | aktif/selesai/bermasalah |
| status_vip | TEXT | lunas/belum_lunas/dokumen_tidak_lengkap |
| no_wbs_pos_anggaran | TEXT | Auto-generate |
| no_skki | TEXT | Auto-generate |
| no_se | TEXT | Auto-generate |
| no_po | TEXT | Auto-generate |
| submission_id_vip | TEXT | Auto-generate |
| ... | ... | Dan field lainnya |

### contract_maintenance

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary Key |
| no | SERIAL | Nomor urut |
| no_perjanjian | TEXT | Nomor perjanjian (unique) |
| tanggal_perjanjian | DATE | Tanggal perjanjian |
| tanggal_berakhir | DATE | Tanggal berakhir |
| judul_perjanjian | TEXT | Judul perjanjian |
| uraian_kegiatan | TEXT | Uraian kegiatan |
| nilai_perjanjian | BIGINT | Nilai perjanjian |
| nama_vendor | TEXT | Nama vendor |
| nilai_tagihan_sti_pusat | BIGINT | Nilai tagihan STI pusat |
| nilai_tagihan_unit_induk | BIGINT | Nilai tagihan unit induk |
| ... | ... | Dan field lainnya |

### contract_administration

| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID | Primary Key |
| no | SERIAL | Nomor urut |
| uraian_kegiatan | TEXT | Uraian Kegiatan/Mata Anggaran |
| no_perjanjian | TEXT | No. Perjanjian/Amandemen (unique) |
| tanggal_perjanjian | DATE | Tanggal Perjanjian/Amandemen |
| tanggal_berakhir | DATE | Tanggal Berakhir |
| judul_perjanjian | TEXT | Judul Perjanjian |
| nilai_perjanjian | BIGINT | Nilai Perjanjian |
| nama_vendor | TEXT | Nama Vendor |
| nilai_tagihan_keseluruhan | BIGINT | Nilai Tagihan Keseluruhan |
| nilai_tagihan_kantor_pusat | BIGINT | Nilai Tagihan Khusus Kantor Pusat |
| nilai_tagihan_unit_selain_pusat | BIGINT | Nilai Tagihan Unit selain Kantor Pusat |
| no_berita_acara | TEXT | No. Berita Acara |
| tanggal_berita_acara | DATE | Tanggal Berita Acara |
| no_wbs_pos_anggaran | TEXT | No. WBS/Pos Anggaran |
| no_skki_skko | TEXT | No. SKKI/SKKO |
| tanggal_request | DATE | Tanggal Request |
| tanggal_se_release | DATE | Tanggal SE release |
| no_se | TEXT | No. SE |
| no_po | TEXT | No. PO |
| submission_id | TEXT | Submission ID |
| nama_pekerjaan | TEXT | Nama Pekerjaan |
| beban_tahun | TEXT | Beban Tahun |
| terbayar_pusat | BIGINT | Terbayar Pusat |
| status_bayar | TEXT | Status Bayar |
| keterangan | TEXT | Keterangan |
| entry_by | TEXT | Entry By |
| keterangan_konfirmasi | TEXT | Keterangan/Konfirmasi |
| rutin_non_rutin | TEXT | Rutin/Non Rutin |
| pic | TEXT | PIC |
| bidang | TEXT | Bidang |
| created_at | TIMESTAMPTZ | Timestamp dibuat |
| updated_at | TIMESTAMPTZ | Timestamp diupdate |

## Perubahan Kode Aplikasi

### File Baru yang Dibuat

1. **`lib/types-split.ts`** - Type definitions untuk tabel baru
2. **`lib/supabase-service-split.ts`** - Service layer untuk Supabase
3. **`app/kontrak/page-tabbed.tsx`** - Halaman kontrak dengan 3 sub-tab

### Cara Menggunakan UI Baru

Untuk menggunakan halaman kontrak dengan 3 sub-tab:

1. Rename `app/kontrak/page.tsx` menjadi `app/kontrak/page-old.tsx`
2. Rename `app/kontrak/page-tabbed.tsx` menjadi `app/kontrak/page.tsx`

Atau gunakan import di `page.tsx`:

```tsx
// app/kontrak/page.tsx
export { default } from './page-tabbed';
```

### Migrasi Store (Opsional)

Jika ingin menggunakan Supabase sebagai data source utama, update `lib/store-new.tsx` untuk menggunakan service dari `lib/supabase-service-split.ts`.

## File SQL yang Dibuat

| File | Fungsi |
|------|--------|
| `supabase-split-tables.sql` | Membuat 3 tabel baru + triggers + policies |
| `supabase-seed-data.sql` | Insert sample data ke 3 tabel baru |
| `supabase-migrate-data.sql` | Migrasi data dari tabel lama |
| `supabase-drop-old-table.sql` | Hapus tabel contracts lama |

## Catatan Penting

1. **Backup data** sebelum menjalankan migrasi
2. Jalankan scripts secara **berurutan**
3. **Verifikasi** data setelah setiap langkah
4. Jangan hapus tabel lama sebelum memastikan migrasi berhasil
5. Update kode aplikasi untuk menggunakan service dan types yang baru

## Rollback

Jika terjadi masalah, Anda dapat:
1. Tidak menjalankan `supabase-drop-old-table.sql`
2. Aplikasi tetap bisa menggunakan tabel `contracts` lama
3. Hapus tabel baru jika diperlukan:

```sql
DROP TABLE IF EXISTS public.contract_investment CASCADE;
DROP TABLE IF EXISTS public.contract_maintenance CASCADE;
DROP TABLE IF EXISTS public.contract_administration CASCADE;
```
