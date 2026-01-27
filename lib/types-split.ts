// ============================================
// TYPE DEFINITIONS - SPLIT CONTRACT TABLES
// SIMAP PLN - Contract Management System
// ============================================

// ============================================
// USER & ROLE
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
// COMMON TYPES
// ============================================

export type ContractStatus = "aktif" | "selesai" | "bermasalah";
export type ContractCategory = "investasi" | "pemeliharaan" | "administrasi";
export type JenisAnggaran = "AI" | "AO";
export type StatusVIP = "lunas" | "belum_lunas" | "dokumen_tidak_lengkap";
export type CRStatus = "CR" | "Not CR";

// ============================================
// BASE CONTRACT INTERFACE (shared fields)
// ============================================

interface BaseContract {
  id: string;
  no: number;
  
  // Identitas
  noPerjanjian: string;
  tanggalPerjanjian: string;
  tanggalBerakhir: string;
  
  // Status
  status: ContractStatus;
  
  // Unit
  unit: string;
  unitSektorK?: string;
  
  // Berita Acara
  noBeritaAcara?: string;
  tanggalBeritaAcara?: string;
  nilaiBeritaAcara?: number;
  noBeritaAcaraSKRelasi?: string;
  
  // Arsip & XPS
  tanggalArsip?: string;
  noXPS?: string;
  tanggalXPS?: string;
  
  // SK/WE & PO
  noSKWE?: string;
  posAngg?: string;
  noSKUSKKO?: string;
  noSE?: string;
  noPO?: string;
  submissionId?: string;
  requestTanggalSE?: string;
  requestTanggalSERelasi?: string;
  
  // Detail
  bebanTahun?: string;
  batasPaguTerbayar?: number;
  unitTerbayar?: string;
  konfirmasiNonRutin?: string;
  bidang?: string;
  
  // PIC & Tracking
  picId?: string;
  picName?: string;
  entryBy?: string;
  progressPekerjaan: number;
  
  // Flags
  oldFlag?: string;
  clickCB?: boolean;
  
  // Keterangan & Dokumen
  keterangan?: string;
  dokumenKontrak?: string;
  
  // Metadata
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

// ============================================
// CONTRACT INVESTMENT (Investasi - AI)
// ============================================

export interface ContractInvestment extends BaseContract {
  kategori: "investasi";
  
  // PRK & Pekerjaan
  judulPRK: string;
  namaPekerjaan: string;
  noPRK?: string;
  
  // Nilai
  nilaiPerjanjian: number;
  nilaiTagihan: number;
  terbayar: number;
  sisaAnggaran: number;
  persentaseRealisasi: number;
  
  // Vendor
  namaVendor: string;
  
  // Jenis & Status
  jenisAI: JenisAnggaran;
  crNotCR: CRStatus;
  statusVIP: StatusVIP;
  
  // Auto-generate fields
  noWBSPosAnggaran?: string;
  noSKKI?: string;
  submissionIdVIP?: string;
  
  // Legacy fields
  uraianKegiatan?: string;
  nilaiTagihanKontrakPusat?: number;
  nilaiTagihanUnitInduk?: number;
  jenisPekerjaan?: string;
}

// ============================================
// CONTRACT MAINTENANCE (Pemeliharaan - AO)
// ============================================

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

// ============================================
// CONTRACT ADMINISTRATION (Administrasi - AO)
// ============================================

export interface ContractAdministration extends BaseContract {
  kategori: "administrasi";
  
  // Pekerjaan
  judulPekerjaan: string;
  uraianKegiatan?: string;
  jenisPekerjaan?: string;
  
  // Nilai
  nilaiKontrak: number;
  nilaiTagihan: number;
  totalTagihanDibayar: number;
  sisaAnggaran: number;
  persentaseRealisasi: number;
  
  // Vendor
  vendor: string;
  
  // Jenis
  jenisAnggaran: JenisAnggaran;
}

// ============================================
// UNION TYPE FOR ALL CONTRACTS
// ============================================

export type Contract = ContractInvestment | ContractMaintenance | ContractAdministration;

// Type guards
export function isContractInvestment(contract: Contract): contract is ContractInvestment {
  return contract.kategori === "investasi";
}

export function isContractMaintenance(contract: Contract): contract is ContractMaintenance {
  return contract.kategori === "pemeliharaan";
}

export function isContractAdministration(contract: Contract): contract is ContractAdministration {
  return contract.kategori === "administrasi";
}

// ============================================
// TAGIHAN (Invoice/Berita Acara)
// ============================================

export type InvoiceStatus = 
  | "diajukan"
  | "diterima"
  | "ditolak"
  | "dibayar";

export interface Invoice {
  id: string;
  contractId: string;
  contractCategory: ContractCategory; // NEW: untuk menentukan tabel mana
  noPerjanjian: string;
  
  // Identitas tagihan
  nomorTagihan: string;
  tanggalTagihan: string;
  nilaiTagihan: number;
  
  // Berita Acara
  noBeritaAcara?: string;
  tanggalBeritaAcara?: string;
  
  // Arsip
  tanggalArsip?: string;
  
  // XPS
  noXPS?: string;
  tanggalXPS?: string;
  
  // Status & tracking
  status: InvoiceStatus;
  
  // Tanggal tracking
  tanggalDiajukan: string;
  tanggalVerifikasi?: string;
  
  // Notes
  keterangan?: string;
  
  // User tracking
  diajukanOleh: string;
  diajukanOlehName: string;
  dibayarOleh?: string;
  
  // Dokumen pendukung
  dokumenTagihan?: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface DashboardSummary {
  // Per category
  investasi: {
    totalKontrak: number;
    totalNilai: number;
    totalTerbayar: number;
    sisaAnggaran: number;
    kontrakAktif: number;
    kontrakSelesai: number;
    kontrakBermasalah: number;
  };
  pemeliharaan: {
    totalKontrak: number;
    totalNilai: number;
    totalTerbayar: number;
    sisaAnggaran: number;
    kontrakAktif: number;
    kontrakSelesai: number;
    kontrakBermasalah: number;
  };
  administrasi: {
    totalKontrak: number;
    totalNilai: number;
    totalTerbayar: number;
    sisaAnggaran: number;
    kontrakAktif: number;
    kontrakSelesai: number;
    kontrakBermasalah: number;
  };
  
  // Totals
  totalKontrak: number;
  totalNilaiKontrak: number;
  totalTagihanDibayar: number;
  totalSisaAnggaran: number;
  
  // Status counts
  kontrakAktif: number;
  kontrakSelesai: number;
  kontrakBermasalah: number;
  
  // Invoice stats
  totalTagihan: number;
  tagihanMenunggu: number;
  tagihanDiterima: number;
  tagihanDibayar: number;
}

// ============================================
// FILTER & SEARCH
// ============================================

export interface ContractFilter {
  kategori?: ContractCategory;
  status?: ContractStatus;
  statusVIP?: StatusVIP;
  unit?: string;
  jenisAnggaran?: JenisAnggaran;
  searchQuery?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface InvoiceFilter {
  contractId?: string;
  contractCategory?: ContractCategory;
  status?: InvoiceStatus;
  searchQuery?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================
// FORM DATA TYPES
// ============================================

export interface CreateInvestmentContractData {
  tanggalPerjanjian: string;
  tanggalBerakhir: string;
  judulPRK: string;
  namaPekerjaan: string;
  nilaiPerjanjian: number;
  namaVendor: string;
  nilaiTagihan: number;
  jenisAI: JenisAnggaran;
  crNotCR: CRStatus;
  unit: string;
  keterangan?: string;
}

export interface CreateMaintenanceContractData {
  noPerjanjian: string;
  tanggalPerjanjian: string;
  tanggalBerakhir: string;
  judulPekerjaan: string;
  uraianKegiatan?: string;
  nilaiKontrak: number;
  vendor: string;
  jenisAnggaran: JenisAnggaran;
  unit: string;
  keterangan?: string;
}

export interface CreateAdministrationContractData {
  noPerjanjian: string;
  tanggalPerjanjian: string;
  tanggalBerakhir: string;
  judulPekerjaan: string;
  uraianKegiatan?: string;
  nilaiKontrak: number;
  vendor: string;
  jenisAnggaran: JenisAnggaran;
  unit: string;
  keterangan?: string;
}

export interface CreateInvoiceData {
  contractId: string;
  contractCategory: ContractCategory;
  nomorTagihan: string;
  tanggalTagihan: string;
  nilaiTagihan: number;
  keterangan?: string;
}
