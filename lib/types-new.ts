// ============================================
// TYPE DEFINITIONS - SISTEM MONITORING KONTRAK & TAGIHAN
// Fokus: Monitoring Anggaran, Status Tagihan, Pembayaran
// ============================================

// ============================================
// USER & ROLE (Disederhanakan)
// Hanya 2 role: Admin (Operator) dan Viewer (Manajer)
// ============================================

export type UserRole = "admin" | "viewer";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  unit: string;
  createdAt: string;
  lastLogin?: string;
}

// ============================================
// KONTRAK (Proyek yang sudah memiliki perjanjian)
// ============================================

export type ContractStatus = "aktif" | "selesai" | "bermasalah";
export type ContractCategory = "investasi" | "pemeliharaan" | "administrasi";
export type JenisAnggaran = "AI" | "AO"; // AI = Anggaran Investasi, AO = Anggaran Operasi

export interface Contract {
  id: string;
  no: number;                     // Nomor urut
  
  // Identitas Kontrak
  uraianKegiatan: string;         // Uraian Kegiatan/Mata Anggaran
  noPerjanjian: string;           // No Perjanjian/Amandemen
  tanggalPerjanjian: string;      // Tanggal Perjanjian/Amandemen
  tanggalBerakhir: string;        // Tanggal Berakhir
  judulPekerjaan: string;         // Judul Perjanjian
  
  // Nilai & Vendor
  nilaiKontrak: number;           // Nilai Perjanjian
  vendor: string;                 // Nama Vendor
  
  // Tagihan
  nilaiTagihanKontrakPusat: number;  // Nilai Tagihan/Klaim Kontrak Pusat
  nilaiTagihanUnitInduk: number;     // Nilai Tagihan/Unit Induk Kantor Pusat
  nilaiBeritaAcara?: number;         // Sdr/Tagihan (Nilai Berita Acara)
  
  // Berita Acara
  noBeritaAcara?: string;         // No Berita Acara
  tanggalBeritaAcara?: string;    // Tanggal Berita Acara
  noBeritaAcaraSKRelasi?: string; // No Berita Acara SK/Relasi
  
  // Arsip
  tanggalArsip?: string;          // Tanggal Arsip
  
  // XPS (Sistem Pembayaran)
  noXPS?: string;                 // No XPS
  tanggalXPS?: string;            // Tanggal XPS
  
  // Kategori & Unit
  kategori: ContractCategory;     // Investasi / Pemeliharaan / Administrasi
  jenisAnggaran: JenisAnggaran;   // AI (Anggaran Investasi) atau AO (Anggaran Operasi)
  unit: string;
  unitSektorK?: string;           // Unit Sektor K
  
  // SK/WE & PO
  noSKWE?: string;                // No SK/WE
  posAngg?: string;               // Pos Angg
  noSKUSKKO?: string;             // No SKU/SKKO
  requestTanggalSERelasi?: string; // Request tanggal SE Relasi
  noSE?: string;                  // No SE
  noPO?: string;                  // No PO
  submissionId?: string;          // Submission ID
  
  // Detail Pekerjaan
  jenisPekerjaan?: string;        // Jenis Pekerjaan
  bebanTahun?: string;            // Beban tahun
  batasPaguTerbayar?: number;     // Batas pagu Terbayar
  unitTerbayar?: string;          // Unit Terbayar
  konfirmasiNonRutin?: string;    // rangan/Konfirmasi/Non Rutin
  bidang?: string;                // BIDANG
  
  // PIC
  picId?: string;
  picName?: string;
  entryBy?: string;               // Entry by
  
  // Status & calculated fields
  status: ContractStatus;
  totalTagihanDibayar: number;    // Total yang sudah dibayar
  sisaAnggaran: number;           // nilaiKontrak - totalTagihanDibayar
  persentaseRealisasi: number;    // (totalTagihanDibayar / nilaiKontrak) * 100
  progressPekerjaan: number;      // Progress pekerjaan 0-100%
  
  // Flags
  oldFlag?: string;               // Old Flag
  clickCB?: boolean;              // Click CB
  
  // Metadata
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
  
  // Optional
  keterangan?: string;
  dokumenKontrak?: string;        // URL/path dokumen
}

// ============================================
// TAGIHAN (Invoice/Berita Acara)
// ============================================

export type InvoiceStatus = 
  | "diajukan"      // Baru diinput, menunggu verifikasi (DEFAULT)
  | "diterima"      // Sudah diterima/diverifikasi
  | "ditolak"       // Ditolak
  | "dibayar";      // Sudah dibayar

export interface Invoice {
  id: string;
  contractId: string;             // FK ke Contract
  noPerjanjian: string;           // Denormalized untuk display
  
  // Identitas tagihan
  nomorTagihan: string;           // Nomor berita acara/invoice
  tanggalTagihan: string;
  nilaiTagihan: number;
  
  // Berita Acara
  noBeritaAcara?: string;         // No Berita Acara
  tanggalBeritaAcara?: string;    // Tanggal Berita Acara
  
  // Arsip
  tanggalArsip?: string;          // Tanggal Arsip
  
  // XPS (Sistem Pembayaran)
  noXPS?: string;                 // No XPS
  tanggalXPS?: string;            // Tanggal XPS
  
  // Status & tracking
  status: InvoiceStatus;          // diajukan (default), diterima, ditolak, dibayar
  
  // Tanggal tracking
  tanggalDiajukan: string;        // Tanggal pertama kali diajukan
  tanggalVerifikasi?: string;     // Tanggal saat status berubah (auto-update)
  
  // Notes
  keterangan?: string;
  
  // User tracking
  diajukanOleh: string;
  diajukanOlehName: string;
  dibayarOleh?: string;           // Nama orang yang membayar (diisi saat status = dibayar)
  
  // Dokumen pendukung
  dokumenTagihan?: string;        // URL/path dokumen
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DASHBOARD SUMMARY
// ============================================

export interface DashboardSummary {
  // Kontrak
  totalKontrakAktif: number;
  totalNilaiKontrak: number;
  totalDibayar: number;
  totalSisaAnggaran: number;
  persentaseRealisasiGlobal: number;
  
  // Per Kategori
  kontrakInvestasi: number;
  kontrakPemeliharaan: number;
  kontrakAdministrasi: number;
  nilaiInvestasi: number;
  nilaiPemeliharaan: number;
  nilaiAdministrasi: number;
  
  // Tagihan
  totalTagihan: number;
  tagihanDiajukan: number;
  tagihanDiterima: number;
  tagihanDibayar: number;
  tagihanDitolak: number;
  
  // Alerts
  kontrakHampirHabis: number;     // Kontrak dengan sisa < 10%
  tagihanPendingLama: number;     // Tagihan pending > 7 hari
  kontrakAkanBerakhir: number;    // Kontrak akan berakhir < 30 hari
}

// ============================================
// FILTER & PAGINATION
// ============================================

export interface ContractFilters {
  status?: ContractStatus | "all";
  kategori?: ContractCategory | "all";
  unit?: string;
  vendor?: string;
  periodeStart?: string;
  periodeEnd?: string;
  search?: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus | "all";
  contractId?: string;
  periodeStart?: string;
  periodeEnd?: string;
  search?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============================================
// ALERT / NOTIFIKASI
// ============================================

export type AlertType = 
  | "tagihan_pending_lama"
  | "kontrak_hampir_habis"
  | "kontrak_akan_berakhir"
  | "tagihan_ditolak";

export type AlertSeverity = "info" | "warning" | "critical";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  contractId?: string;
  invoiceId?: string;
  createdAt: string;
  readAt?: string;
}

// ============================================
// REPORT PARAMS
// ============================================

export interface ReportParams {
  type: "ringkasan" | "realisasi" | "tagihan" | "kontrak";
  periodeStart?: string;
  periodeEnd?: string;
  unit?: string;
  contractId?: string;
  format: "pdf" | "excel";
}

// ============================================
// AUDIT LOG
// ============================================

export interface AuditLog {
  id: string;
  entityType: "contract" | "invoice";
  entityId: string;
  action: "create" | "update" | "delete" | "status_change";
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
}
