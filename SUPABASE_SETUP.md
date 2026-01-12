# Setup Supabase untuk SIMAP PLN

## 📋 Langkah-langkah Setup Database

### 1. **Buka SQL Editor di Supabase Dashboard**
   - Login ke [Supabase Dashboard](https://app.supabase.com)
   - Pilih project Anda
   - Klik **SQL Editor** di sidebar kiri
   - Klik **New query**

### 2. **Jalankan Schema SQL**
   - Buka file `supabase-schema.sql` di root project ini
   - Copy **semua isi file** tersebut
   - Paste ke SQL Editor di Supabase
   - Klik **Run** atau tekan `Ctrl+Enter`

   File ini akan membuat:
   - ✅ Tabel `contracts` (kontrak)
   - ✅ Tabel `invoices` (tagihan)
   - ✅ Indexes untuk performa query
   - ✅ Row Level Security (RLS) policies
   - ✅ Triggers untuk auto-update total tagihan
   - ✅ Sample data (opsional - bisa dihapus)

### 3. **Verifikasi Tabel**
   Setelah berhasil, cek di **Table Editor**:
   - Anda akan melihat 2 tabel baru: `contracts` dan `invoices`
   - Jika ada sample data, akan muncul 3 rows di tabel `contracts`

---

## 🔐 Environment Variables

File `.env.local` sudah dibuat dengan konfigurasi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://aczdhhmxgirjixmuorgl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**PENTING:**
- ✅ File `.env.local` sudah di-ignore di git
- ✅ Jangan commit service role key ke repository
- ✅ Restart dev server setelah mengubah env variables

---

## 🚀 Cara Menggunakan

### **Menambah Kontrak**
Ketika Anda menggunakan form tambah kontrak di aplikasi:
```typescript
const { createContract } = useContractStore();

// Otomatis akan tersimpan ke Supabase
await createContract({
  no: 1,
  uraianKegiatan: "Pengadaan Trafo",
  noPerjanjian: "PJN/2025/001",
  tanggalPerjanjian: "2025-01-15",
  tanggalBerakhir: "2026-01-15",
  judulPekerjaan: "Pengadaan Trafo 60 MVA",
  nilaiKontrak: 15000000000,
  vendor: "PT Wijaya Karya",
  kategori: "investasi",
  jenisAnggaran: "AI",
  unit: "PLN UP3 Jakarta Selatan",
  status: "aktif",
  // ... field lainnya
});
```

### **Menambah Tagihan/Invoice**
```typescript
const { createInvoice } = useContractStore();

// Otomatis akan tersimpan ke Supabase
await createInvoice({
  contractId: "uuid-dari-contract",
  noPerjanjian: "PJN/2025/001",
  nomorTagihan: "INV-0001",
  tanggalTagihan: "2025-04-15",
  nilaiTagihan: 3000000000,
  status: "diajukan",
  tanggalDiajukan: new Date().toISOString(),
  diajukanOleh: "user-id",
  diajukanOlehName: "Admin Satu",
  // ... field lainnya
});
```

---

## 📊 Struktur Data

### **Tabel Contracts**
Kolom utama yang **wajib** diisi:
- `no` - Nomor urut (integer)
- `uraian_kegiatan` - Uraian kegiatan (text)
- `no_perjanjian` - Nomor perjanjian (text, UNIQUE)
- `tanggal_perjanjian` - Tanggal perjanjian (date)
- `tanggal_berakhir` - Tanggal berakhir (date)
- `judul_pekerjaan` - Judul perjanjian (text)
- `nilai_kontrak` - Nilai kontrak (bigint)
- `vendor` - Nama vendor (text)
- `kategori` - 'investasi' | 'pemeliharaan' | 'administrasi'
- `jenis_anggaran` - 'AI' | 'AO'
- `unit` - Unit PLN (text)
- `status` - 'aktif' | 'selesai' | 'bermasalah'

### **Tabel Invoices**
Kolom utama yang **wajib** diisi:
- `contract_id` - UUID dari contracts (foreign key)
- `no_perjanjian` - Nomor perjanjian (text)
- `nomor_tagihan` - Nomor tagihan/berita acara (text)
- `tanggal_tagihan` - Tanggal tagihan (date)
- `nilai_tagihan` - Nilai tagihan (bigint)
- `status` - 'diajukan' | 'diverifikasi' | 'dibayar' | 'ditolak'
- `tanggal_diajukan` - Timestamp diajukan
- `diajukan_oleh` - User ID yang mengajukan
- `diajukan_oleh_name` - Nama user yang mengajukan

---

## 🔄 Auto-Update Totals

Sistem sudah dilengkapi dengan **trigger otomatis**:

Ketika status invoice berubah menjadi `'dibayar'`:
- ✅ `total_tagihan_dibayar` di contracts akan bertambah otomatis
- ✅ `sisa_anggaran` akan dihitung ulang
- ✅ `persentase_realisasi` akan di-update

Anda **tidak perlu** menghitung manual!

---

## 🧪 Testing

### 1. **Test Insert Contract**
Jalankan di SQL Editor:
```sql
INSERT INTO public.contracts (
  no, uraian_kegiatan, no_perjanjian, tanggal_perjanjian, tanggal_berakhir,
  judul_pekerjaan, nilai_kontrak, vendor, kategori, jenis_anggaran, unit, status
) VALUES (
  1, 'Test Kontrak', 'TEST/2025/001', '2025-01-15', '2026-01-15',
  'Pengadaan Test', 1000000000, 'PT Test', 'investasi', 'AI', 
  'PLN UP3 Jakarta Selatan', 'aktif'
)
RETURNING *;
```

### 2. **Test dari Aplikasi**
```bash
npm run dev
```
- Buka aplikasi
- Gunakan form tambah kontrak
- Cek di Supabase Table Editor apakah data masuk

---

## 🛠️ Troubleshooting

### **Error: "relation does not exist"**
➡️ Pastikan Anda sudah menjalankan `supabase-schema.sql` di SQL Editor

### **Error: "permission denied"**
➡️ Cek RLS policies di Supabase. Pastikan policies sudah aktif dan benar

### **Error: "column does not exist"**
➡️ Cek apakah nama kolom di API route sudah sesuai dengan schema (snake_case di DB, camelCase di TypeScript)

### **Data tidak masuk ke Supabase**
➡️ Cek browser console untuk error
➡️ Cek Network tab untuk melihat request API
➡️ Pastikan `.env.local` sudah benar dan dev server sudah direstart

---

## 📝 Notes

- Semua field `tanggal_*` menggunakan format ISO 8601: `"2025-01-15"` atau `"2025-01-15T10:30:00Z"`
- Nilai uang (rupiah) disimpan sebagai `bigint` tanpa decimal
- UUID di-generate otomatis oleh database
- Timestamps (`created_at`, `updated_at`) di-handle otomatis oleh trigger

---

## ✅ Checklist Setup

- [ ] Jalankan `supabase-schema.sql` di SQL Editor
- [ ] Verifikasi tabel `contracts` dan `invoices` sudah ada
- [ ] File `.env.local` sudah terisi dengan benar
- [ ] Restart dev server: `npm run dev`
- [ ] Test tambah kontrak dari aplikasi
- [ ] Test tambah tagihan dari aplikasi
- [ ] Cek di Supabase Table Editor apakah data masuk

---

**Selamat! Database Supabase Anda sudah siap digunakan! 🎉**
