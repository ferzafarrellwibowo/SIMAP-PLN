# Update Contract Maintenance Table Structure

## Overview
Dokumen ini menjelaskan perubahan struktur tabel `contract_maintenance` agar sesuai dengan requirement kolom yang baru.

## Perubahan yang Dilakukan

### 1. SQL Script - Update Tabel Database
**File**: `supabase-update-contract-maintenance.sql`

Script ini akan:
- Menghapus tabel `contract_maintenance` yang lama
- Membuat tabel baru dengan struktur kolom sesuai requirement
- Menambahkan indexes untuk performance
- Menambahkan triggers untuk auto-update `updated_at`
- Mengaktifkan Row Level Security (RLS) dengan policies

### 2. TypeScript Types - Update Interface
**File**: `lib/types-split.ts`

Interface `ContractMaintenance` telah diupdate dengan kolom-kolom baru:

```typescript
export interface ContractMaintenance {
  // Primary Key
  id: string;
  no: number;
  kategori: "pemeliharaan";
  
  // Uraian Kegiatan/Mata Anggaran
  uraianKegiatan?: string;
  
  // No. Perjanjian/Amandemen
  noPerjanjian: string;
  
  // Tanggal Perjanjian/Amandemen
  tanggalPerjanjian: string;
  
  // Tanggal Berakhir
  tanggalBerakhir: string;
  
  // Judul Perjanjian
  judulPerjanjian: string;
  
  // Nilai Perjanjian
  nilaiPerjanjian: number;
  
  // Nama Vendor
  namaVendor: string;
  
  // Nilai Tagihan/Nominal STI Kantor Pusat
  nilaiTagihanSTIPusat: number;
  
  // Nilai Tagihan/Nominal Unit Induk Seindonesia Raya
  nilaiTagihanUnitInduk: number;
  
  // No. Berita Acara
  noBeritaAcara?: string;
  
  // Tanggal Berita Acara
  tanggalBeritaAcara?: string;
  
  // No. WBS/Pos Anggaran
  noWBSPosAnggaran?: string;
  
  // No. SKKI/SKKO
  noSKKISKKO?: string;
  
  // Tanggal Request SE
  tanggalRequestSE?: string;
  
  // Tanggal SE Rilis
  tanggalSERilis?: string;
  
  // No. SE
  noSE?: string;
  
  // No. PO
  noPO?: string;
  
  // Submission ID - Vendor Invoicing Portal
  submissionIdVIP?: string;
  
  // Nama Pekerjaan
  namaPekerjaan?: string;
  
  // MSB
  msb?: string;
  
  // Bidang
  bidang?: string;
  
  // Status VIP
  statusVIP?: string;
  
  // Periode Accrue Bulan/Tahun
  periodeAccrue?: string;
  
  // Requested By
  requestedBy?: string;
  
  // Keterangan/Konfirmasi
  keterangan?: string;
  
  // Terbayar STI Pusat
  terbayarSTIPusat: number;
  
  // Terbayar Unit
  terbayarUnit: number;
  
  // Status Terbayar
  statusTerbayar?: string;
  
  // Rutin/Non Rutin
  rutinNonRutin?: string;
  
  // Metadata
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}
```

## Mapping Kolom Database ke TypeScript

| Kolom Requirement | Kolom Database | TypeScript Property | Tipe Data |
|------------------|----------------|---------------------|-----------|
| Uraian Kegiatan/Mata Anggaran | `uraian_kegiatan` | `uraianKegiatan` | string (optional) |
| No. Perjanjian/Amandemen | `no_perjanjian` | `noPerjanjian` | string (UNIQUE) |
| Tanggal Perjanjian/Amandemen | `tanggal_perjanjian` | `tanggalPerjanjian` | DATE/string |
| Tanggal Berakhir | `tanggal_berakhir` | `tanggalBerakhir` | DATE/string |
| Judul Perjanjian | `judul_perjanjian` | `judulPerjanjian` | string |
| Nilai Perjanjian | `nilai_perjanjian` | `nilaiPerjanjian` | BIGINT/number |
| Nama Vendor | `nama_vendor` | `namaVendor` | string |
| Nilai Tagihan/Nominal STI Kantor Pusat | `nilai_tagihan_sti_pusat` | `nilaiTagihanSTIPusat` | BIGINT/number |
| Nilai Tagihan/Nominal Unit Induk Seindonesia Raya | `nilai_tagihan_unit_induk` | `nilaiTagihanUnitInduk` | BIGINT/number |
| No. Berita Acara | `no_berita_acara` | `noBeritaAcara` | string (optional) |
| Tanggal Berita Acara | `tanggal_berita_acara` | `tanggalBeritaAcara` | DATE/string (optional) |
| No. WBS/Pos Anggaran | `no_wbs_pos_anggaran` | `noWBSPosAnggaran` | string (optional) |
| No. SKKI/SKKO | `no_skki_skko` | `noSKKISKKO` | string (optional) |
| Tanggal Request SE | `tanggal_request_se` | `tanggalRequestSE` | DATE/string (optional) |
| Tanggal SE Rilis | `tanggal_se_rilis` | `tanggalSERilis` | DATE/string (optional) |
| No. SE | `no_se` | `noSE` | string (optional) |
| No. PO | `no_po` | `noPO` | string (optional) |
| Submission ID - Vendor Invoicing Portal | `submission_id_vip` | `submissionIdVIP` | string (optional) |
| Nama Pekerjaan | `nama_pekerjaan` | `namaPekerjaan` | string (optional) |
| MSB | `msb` | `msb` | string (optional) |
| Bidang | `bidang` | `bidang` | string (optional) |
| Status VIP | `status_vip` | `statusVIP` | string (optional) |
| Periode Accrue Bulan/Tahun | `periode_accrue` | `periodeAccrue` | string (optional) |
| Requested By | `requested_by` | `requestedBy` | string (optional) |
| Keterangan/Konfirmasi | `keterangan` | `keterangan` | string (optional) |
| Terbayar STI Pusat | `terbayar_sti_pusat` | `terbayarSTIPusat` | BIGINT/number |
| Terbayar Unit | `terbayar_unit` | `terbayarUnit` | BIGINT/number |
| Status Terbayar | `status_terbayar` | `statusTerbayar` | string (optional) |
| Rutin/Non Rutin | `rutin_non_rutin` | `rutinNonRutin` | string (optional) |

## Cara Menjalankan Migrasi

### Step 1: Backup Data (PENTING!)
Sebelum menjalankan script, backup data yang ada jika tabel sudah memiliki data:

```sql
-- Di Supabase SQL Editor
CREATE TABLE contract_maintenance_backup AS 
SELECT * FROM contract_maintenance;
```

### Step 2: Jalankan SQL Script
1. Buka **Supabase Dashboard**
2. Masuk ke **SQL Editor**
3. Buka file `supabase-update-contract-maintenance.sql`
4. Copy semua isi file
5. Paste ke SQL Editor
6. Klik **Run** atau tekan `Ctrl + Enter`

### Step 3: Verifikasi Struktur Tabel
Jalankan query verifikasi di akhir script:

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'contract_maintenance'
ORDER BY ordinal_position;
```

### Step 4: Update Service Layer
Setelah database diupdate, Anda perlu mengupdate service layer di `lib/supabase-service-split.ts` untuk mapping field database ke TypeScript interface.

Contoh mapping:
```typescript
function mapMaintenanceContract(data: any): ContractMaintenance {
  return {
    id: data.id,
    no: data.no,
    kategori: "pemeliharaan",
    
    uraianKegiatan: data.uraian_kegiatan,
    noPerjanjian: data.no_perjanjian,
    tanggalPerjanjian: data.tanggal_perjanjian,
    tanggalBerakhir: data.tanggal_berakhir,
    judulPerjanjian: data.judul_perjanjian,
    nilaiPerjanjian: data.nilai_perjanjian || 0,
    namaVendor: data.nama_vendor,
    nilaiTagihanSTIPusat: data.nilai_tagihan_sti_pusat || 0,
    nilaiTagihanUnitInduk: data.nilai_tagihan_unit_induk || 0,
    noBeritaAcara: data.no_berita_acara,
    tanggalBeritaAcara: data.tanggal_berita_acara,
    noWBSPosAnggaran: data.no_wbs_pos_anggaran,
    noSKKISKKO: data.no_skki_skko,
    tanggalRequestSE: data.tanggal_request_se,
    tanggalSERilis: data.tanggal_se_rilis,
    noSE: data.no_se,
    noPO: data.no_po,
    submissionIdVIP: data.submission_id_vip,
    namaPekerjaan: data.nama_pekerjaan,
    msb: data.msb,
    bidang: data.bidang,
    statusVIP: data.status_vip,
    periodeAccrue: data.periode_accrue,
    requestedBy: data.requested_by,
    keterangan: data.keterangan,
    terbayarSTIPusat: data.terbayar_sti_pusat || 0,
    terbayarUnit: data.terbayar_unit || 0,
    statusTerbayar: data.status_terbayar,
    rutinNonRutin: data.rutin_non_rutin,
    
    createdAt: data.created_at,
    createdBy: data.created_by,
    updatedAt: data.updated_at,
    updatedBy: data.updated_by,
  };
}
```

## Kolom yang Dihapus

Kolom-kolom berikut dari struktur lama telah dihapus karena tidak ada dalam requirement baru:
- `judul_pekerjaan` (diganti dengan `judul_perjanjian`)
- `nilai_kontrak` (diganti dengan `nilai_perjanjian`)
- `nilai_tagihan` (split menjadi `nilai_tagihan_sti_pusat` dan `nilai_tagihan_unit_induk`)
- `total_tagihan_dibayar` (split menjadi `terbayar_sti_pusat` dan `terbayar_unit`)
- `sisa_anggaran` (dihapus)
- `persentase_realisasi` (dihapus)
- `vendor` (diganti dengan `nama_vendor`)
- `jenis_anggaran` (dihapus)
- Semua field dari `BaseContract` yang tidak sesuai

## Indexes yang Dibuat

Untuk optimasi query, dibuat indexes pada kolom yang sering digunakan:
- `idx_contract_maintenance_no_perjanjian`
- `idx_contract_maintenance_tanggal_perjanjian`
- `idx_contract_maintenance_nama_vendor`
- `idx_contract_maintenance_status_vip`
- `idx_contract_maintenance_bidang`

## Security (RLS Policies)

Semua authenticated users dapat:
- ✅ Read (SELECT)
- ✅ Insert (INSERT)
- ✅ Update (UPDATE)
- ✅ Delete (DELETE)

Jika Anda ingin mengubah permissions, edit policies di SQL script sebelum dijalankan.

## Troubleshooting

### Error: "table contract_maintenance does not exist"
Ini normal jika tabel belum pernah dibuat sebelumnya. Script akan membuat tabel baru.

### Error: "column does not exist"
Pastikan Anda sudah menjalankan SQL script terlebih dahulu sebelum menggunakan kode TypeScript.

### Data hilang setelah migrasi
Jika Anda memiliki data lama, pastikan sudah backup terlebih dahulu. Script ini akan **DROP** tabel lama dan membuat baru.

## Next Steps

1. ✅ Jalankan SQL script di Supabase
2. ⏳ Update service layer (`lib/supabase-service-split.ts`)
3. ⏳ Update komponen React yang menggunakan `ContractMaintenance`
4. ⏳ Update form create/edit kontrak maintenance
5. ⏳ Testing CRUD operations

---

**Created**: January 27, 2026  
**Last Updated**: January 27, 2026  
**Author**: GitHub Copilot
