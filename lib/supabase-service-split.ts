// ============================================
// SUPABASE SERVICE - SPLIT CONTRACT TABLES
// SIMAP PLN - Contract Management System
// ============================================

import { createClient } from "@supabase/supabase-js";
import type {
  Contract,
  ContractInvestment,
  ContractMaintenance,
  ContractAdministration,
  ContractCategory,
  Invoice,
  CreateInvestmentContractData,
  CreateMaintenanceContractData,
  CreateAdministrationContractData,
  CreateInvoiceData,
} from "./types-split";

// ============================================
// SUPABASE CLIENT
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// TABLE NAMES
// ============================================

const TABLES = {
  investment: "contract_investment",
  maintenance: "contract_maintenance",
  administration: "contract_administration",
  invoices: "invoices",
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTableByCategory(category: ContractCategory): string {
  switch (category) {
    case "investasi":
      return TABLES.investment;
    case "pemeliharaan":
      return TABLES.maintenance;
    case "administrasi":
      return TABLES.administration;
  }
}

// Auto-generate ID functions
function generateNoPerjanjian(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `03${randomNum}Pj/STH.01.01/F0107${randomNum}00/${year}`;
}

function generateNoWBSPosAnggaran(): string {
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `I.1001.23.21.0805.${String(randomNum).padStart(3, "0")}`;
}

function generateNoSKKI(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `${randomNum}/KEU.00.03/EVP MUM/${year}`;
}

function generateNoSE(): string {
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `100369${randomNum}`;
}

function generateNoPO(): string {
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `310148${randomNum}`;
}

function generateSubmissionIdVIP(): string {
  const year = new Date().getFullYear();
  const randomNum1 = Math.floor(Math.random() * 9000) + 1000;
  const randomNum2 = Math.floor(Math.random() * 90000) + 10000;
  return `TRE-V/${randomNum1}/${year}/00000${randomNum2}`;
}

function generateNoPRK(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `${year}.KPST.21.${String(randomNum).padStart(3, "0")}`;
}

// ============================================
// INVESTMENT CONTRACT SERVICES
// ============================================

export async function getInvestmentContracts(): Promise<ContractInvestment[]> {
  const { data, error } = await supabase
    .from(TABLES.investment)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapInvestmentContract);
}

export async function getInvestmentContractById(id: string): Promise<ContractInvestment | null> {
  const { data, error } = await supabase
    .from(TABLES.investment)
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return mapInvestmentContract(data);
}

export async function createInvestmentContract(
  contractData: CreateInvestmentContractData
): Promise<ContractInvestment> {
  const insertData = {
    no_perjanjian: generateNoPerjanjian(),
    tanggal_perjanjian: contractData.tanggalPerjanjian,
    tanggal_berakhir: contractData.tanggalBerakhir,
    judul_prk: contractData.judulPRK,
    nama_pekerjaan: contractData.namaPekerjaan,
    no_prk: generateNoPRK(),
    nilai_perjanjian: contractData.nilaiPerjanjian,
    nilai_tagihan: contractData.nilaiTagihan,
    terbayar: 0,
    nama_vendor: contractData.namaVendor,
    jenis_ai: contractData.jenisAI,
    cr_not_cr: contractData.crNotCR,
    status: "aktif",
    status_vip: "belum_lunas",
    no_wbs_pos_anggaran: generateNoWBSPosAnggaran(),
    no_skki: generateNoSKKI(),
    no_se: generateNoSE(),
    no_po: generateNoPO(),
    submission_id_vip: generateSubmissionIdVIP(),
    unit: contractData.unit,
    uraian_kegiatan: contractData.judulPRK,
    keterangan: contractData.keterangan,
  };

  const { data, error } = await supabase
    .from(TABLES.investment)
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return mapInvestmentContract(data);
}

export async function updateInvestmentContract(
  id: string,
  updates: Partial<ContractInvestment>
): Promise<ContractInvestment> {
  const { data, error } = await supabase
    .from(TABLES.investment)
    .update(mapInvestmentToDb(updates))
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapInvestmentContract(data);
}

export async function deleteInvestmentContract(id: string): Promise<void> {
  const { error } = await supabase.from(TABLES.investment).delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// MAINTENANCE CONTRACT SERVICES
// ============================================

export async function getMaintenanceContracts(): Promise<ContractMaintenance[]> {
  const { data, error } = await supabase
    .from(TABLES.maintenance)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapMaintenanceContract);
}

export async function getMaintenanceContractById(id: string): Promise<ContractMaintenance | null> {
  const { data, error } = await supabase
    .from(TABLES.maintenance)
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return mapMaintenanceContract(data);
}

export async function createMaintenanceContract(
  contractData: CreateMaintenanceContractData
): Promise<ContractMaintenance> {
  const insertData = {
    no_perjanjian: contractData.noPerjanjian,
    tanggal_perjanjian: contractData.tanggalPerjanjian,
    tanggal_berakhir: contractData.tanggalBerakhir,
    judul_pekerjaan: contractData.judulPekerjaan,
    uraian_kegiatan: contractData.uraianKegiatan,
    nilai_kontrak: contractData.nilaiKontrak,
    nilai_tagihan: 0,
    total_tagihan_dibayar: 0,
    vendor: contractData.vendor,
    status: "aktif",
    jenis_anggaran: contractData.jenisAnggaran,
    unit: contractData.unit,
    keterangan: contractData.keterangan,
  };

  const { data, error } = await supabase
    .from(TABLES.maintenance)
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return mapMaintenanceContract(data);
}

export async function updateMaintenanceContract(
  id: string,
  updates: Partial<ContractMaintenance>
): Promise<ContractMaintenance> {
  const { data, error } = await supabase
    .from(TABLES.maintenance)
    .update(mapMaintenanceToDb(updates))
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapMaintenanceContract(data);
}

export async function deleteMaintenanceContract(id: string): Promise<void> {
  const { error } = await supabase.from(TABLES.maintenance).delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// ADMINISTRATION CONTRACT SERVICES
// ============================================

export async function getAdministrationContracts(): Promise<ContractAdministration[]> {
  const { data, error } = await supabase
    .from(TABLES.administration)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapAdministrationContract);
}

export async function getAdministrationContractById(id: string): Promise<ContractAdministration | null> {
  const { data, error } = await supabase
    .from(TABLES.administration)
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return mapAdministrationContract(data);
}

export async function createAdministrationContract(
  contractData: CreateAdministrationContractData
): Promise<ContractAdministration> {
  const insertData = {
    // Required fields
    no_perjanjian: contractData.noPerjanjian,
    tanggal_perjanjian: contractData.tanggalPerjanjian,
    tanggal_berakhir: contractData.tanggalBerakhir,
    judul_perjanjian: contractData.judulPerjanjian,
    nilai_perjanjian: contractData.nilaiPerjanjian,
    nama_vendor: contractData.namaVendor,
    
    // Optional fields with defaults
    uraian_kegiatan: contractData.uraianKegiatan,
    nilai_tagihan_keseluruhan: contractData.nilaiTagihanKeseluruhan || 0,
    nilai_tagihan_kantor_pusat: contractData.nilaiTagihanKantorPusat || 0,
    nilai_tagihan_unit_selain_pusat: contractData.nilaiTagihanUnitSelainPusat || 0,
    no_berita_acara: contractData.noBeritaAcara,
    tanggal_berita_acara: contractData.tanggalBeritaAcara,
    no_wbs_pos_anggaran: contractData.noWBSPosAnggaran,
    no_skki_skko: contractData.noSKKISKKO,
    tanggal_request: contractData.tanggalRequest,
    tanggal_se_release: contractData.tanggalSERelease,
    no_se: contractData.noSE,
    no_po: contractData.noPO,
    submission_id: contractData.submissionId,
    nama_pekerjaan: contractData.namaPekerjaan,
    beban_tahun: contractData.bebanTahun,
    terbayar_pusat: contractData.terbayarPusat || 0,
    status_bayar: contractData.statusBayar || "belum_terbayar",
    keterangan: contractData.keterangan,
    entry_by: contractData.entryBy,
    keterangan_konfirmasi: contractData.keteranganKonfirmasi,
    rutin_non_rutin: contractData.rutinNonRutin,
    pic: contractData.pic,
    bidang: contractData.bidang,
  };

  const { data, error } = await supabase
    .from(TABLES.administration)
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return mapAdministrationContract(data);
}

export async function updateAdministrationContract(
  id: string,
  updates: Partial<ContractAdministration>
): Promise<ContractAdministration> {
  const { data, error } = await supabase
    .from(TABLES.administration)
    .update(mapAdministrationToDb(updates))
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapAdministrationContract(data);
}

export async function deleteAdministrationContract(id: string): Promise<void> {
  const { error } = await supabase.from(TABLES.administration).delete().eq("id", id);
  if (error) throw error;
}

// ============================================
// GENERIC CONTRACT SERVICES
// ============================================

export async function getAllContracts(): Promise<Contract[]> {
  const [investment, maintenance, administration] = await Promise.all([
    getInvestmentContracts(),
    getMaintenanceContracts(),
    getAdministrationContracts(),
  ]);

  return [...investment, ...maintenance, ...administration];
}

export async function getContractById(
  id: string,
  category: ContractCategory
): Promise<Contract | null> {
  switch (category) {
    case "investasi":
      return getInvestmentContractById(id);
    case "pemeliharaan":
      return getMaintenanceContractById(id);
    case "administrasi":
      return getAdministrationContractById(id);
  }
}

export async function deleteContract(id: string, category: ContractCategory): Promise<void> {
  switch (category) {
    case "investasi":
      return deleteInvestmentContract(id);
    case "pemeliharaan":
      return deleteMaintenanceContract(id);
    case "administrasi":
      return deleteAdministrationContract(id);
  }
}

// ============================================
// INVOICE SERVICES
// ============================================

export async function getInvoices(): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from(TABLES.invoices)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapInvoice);
}

export async function getInvoicesByContract(
  contractId: string,
  category: ContractCategory
): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from(TABLES.invoices)
    .select("*")
    .eq("contract_id", contractId)
    .eq("contract_category", category)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map(mapInvoice);
}

export async function createInvoice(invoiceData: CreateInvoiceData): Promise<Invoice> {
  const insertData = {
    contract_id: invoiceData.contractId,
    contract_category: invoiceData.contractCategory,
    nomor_tagihan: invoiceData.nomorTagihan,
    tanggal_tagihan: invoiceData.tanggalTagihan,
    nilai_tagihan: invoiceData.nilaiTagihan,
    status: "diajukan",
    tanggal_diajukan: new Date().toISOString(),
    keterangan: invoiceData.keterangan,
  };

  const { data, error } = await supabase
    .from(TABLES.invoices)
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;
  return mapInvoice(data);
}

export async function updateInvoiceStatus(
  id: string,
  status: Invoice["status"]
): Promise<Invoice> {
  const updates: Record<string, unknown> = {
    status,
    tanggal_verifikasi: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from(TABLES.invoices)
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return mapInvoice(data);
}

// ============================================
// MAPPERS - Database to TypeScript
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvestmentContract(row: any): ContractInvestment {
  return {
    id: row.id,
    no: row.no,
    kategori: "investasi",
    noPerjanjian: row.no_perjanjian,
    tanggalPerjanjian: row.tanggal_perjanjian,
    tanggalBerakhir: row.tanggal_berakhir,
    judulPRK: row.judul_prk,
    namaPekerjaan: row.nama_pekerjaan,
    noPRK: row.no_prk,
    nilaiPerjanjian: row.nilai_perjanjian || 0,
    nilaiTagihan: row.nilai_tagihan || 0,
    terbayar: row.terbayar || 0,
    sisaAnggaran: row.sisa_anggaran || 0,
    persentaseRealisasi: row.persentase_realisasi || 0,
    namaVendor: row.nama_vendor,
    jenisAI: row.jenis_ai || "AI",
    crNotCR: row.cr_not_cr || "Not CR",
    status: row.status || "aktif",
    statusVIP: row.status_vip || "belum_lunas",
    noWBSPosAnggaran: row.no_wbs_pos_anggaran,
    noSKKI: row.no_skki,
    noSE: row.no_se,
    noPO: row.no_po,
    submissionIdVIP: row.submission_id_vip,
    noBeritaAcara: row.no_berita_acara,
    tanggalBeritaAcara: row.tanggal_berita_acara,
    requestTanggalSE: row.request_tanggal_se,
    unit: row.unit,
    unitSektorK: row.unit_sektor_k,
    uraianKegiatan: row.uraian_kegiatan,
    nilaiTagihanKontrakPusat: row.nilai_tagihan_kontrak_pusat,
    nilaiTagihanUnitInduk: row.nilai_tagihan_unit_induk,
    nilaiBeritaAcara: row.nilai_berita_acara,
    noBeritaAcaraSKRelasi: row.no_berita_acara_sk_relasi,
    tanggalArsip: row.tanggal_arsip,
    noXPS: row.no_xps,
    tanggalXPS: row.tanggal_xps,
    noSKWE: row.no_skwe,
    posAngg: row.pos_angg,
    noSKUSKKO: row.no_sku_skko,
    requestTanggalSERelasi: row.request_tanggal_se_relasi,
    submissionId: row.submission_id,
    jenisPekerjaan: row.jenis_pekerjaan,
    bebanTahun: row.beban_tahun,
    batasPaguTerbayar: row.batas_pagu_terbayar,
    unitTerbayar: row.unit_terbayar,
    konfirmasiNonRutin: row.konfirmasi_non_rutin,
    bidang: row.bidang,
    picId: row.pic_id,
    picName: row.pic_name,
    entryBy: row.entry_by,
    progressPekerjaan: row.progress_pekerjaan || 0,
    oldFlag: row.old_flag,
    clickCB: row.click_cb,
    keterangan: row.keterangan,
    dokumenKontrak: row.dokumen_kontrak,
    createdAt: row.created_at,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMaintenanceContract(row: any): ContractMaintenance {
  // Mapping sesuai struktur tabel baru contract_maintenance
  return {
    id: row.id,
    no: row.no,
    kategori: "pemeliharaan",
    
    // Field sesuai requirement baru
    uraianKegiatan: row.uraian_kegiatan,
    noPerjanjian: row.no_perjanjian,
    tanggalPerjanjian: row.tanggal_perjanjian,
    tanggalBerakhir: row.tanggal_berakhir,
    judulPerjanjian: row.judul_perjanjian,
    nilaiPerjanjian: row.nilai_perjanjian || 0,
    namaVendor: row.nama_vendor,
    nilaiTagihanSTIPusat: row.nilai_tagihan_sti_pusat || 0,
    nilaiTagihanUnitInduk: row.nilai_tagihan_unit_induk || 0,
    noBeritaAcara: row.no_berita_acara,
    tanggalBeritaAcara: row.tanggal_berita_acara,
    noWBSPosAnggaran: row.no_wbs_pos_anggaran,
    noSKKISKKO: row.no_skki_skko,
    tanggalRequestSE: row.tanggal_request_se,
    tanggalSERilis: row.tanggal_se_rilis,
    noSE: row.no_se,
    noPO: row.no_po,
    submissionIdVIP: row.submission_id_vip,
    namaPekerjaan: row.nama_pekerjaan,
    msb: row.msb,
    bidang: row.bidang,
    statusVIP: row.status_vip,
    periodeAccrue: row.periode_accrue,
    requestedBy: row.requested_by,
    keterangan: row.keterangan,
    terbayarSTIPusat: row.terbayar_sti_pusat || 0,
    terbayarUnit: row.terbayar_unit || 0,
    statusTerbayar: row.status_terbayar,
    rutinNonRutin: row.rutin_non_rutin,
    
    // Metadata
    createdAt: row.created_at,
    createdBy: row.created_by,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAdministrationContract(row: any): ContractAdministration {
  return {
    id: row.id,
    no: row.no,
    kategori: "administrasi",
    
    // 1. Uraian Kegiatan/Mata Anggaran
    uraianKegiatan: row.uraian_kegiatan,
    
    // 2. No. Perjanjian/Amandemen
    noPerjanjian: row.no_perjanjian,
    
    // 3. Tanggal Perjanjian/Amandemen
    tanggalPerjanjian: row.tanggal_perjanjian,
    
    // 4. Tanggal Berakhir
    tanggalBerakhir: row.tanggal_berakhir,
    
    // 5. Judul Perjanjian
    judulPerjanjian: row.judul_perjanjian,
    
    // 6. Nilai Perjanjian
    nilaiPerjanjian: row.nilai_perjanjian || 0,
    
    // 7. Nama Vendor
    namaVendor: row.nama_vendor,
    
    // 8. Nilai Tagihan Keseluruhan
    nilaiTagihanKeseluruhan: row.nilai_tagihan_keseluruhan || 0,
    
    // 9. Nilai Tagihan Khusus Kantor Pusat
    nilaiTagihanKantorPusat: row.nilai_tagihan_kantor_pusat || 0,
    
    // 10. Nilai Tagihan Unit selain Kantor Pusat
    nilaiTagihanUnitSelainPusat: row.nilai_tagihan_unit_selain_pusat || 0,
    
    // 11. No. Berita Acara
    noBeritaAcara: row.no_berita_acara,
    
    // 12. Tanggal Berita Acara
    tanggalBeritaAcara: row.tanggal_berita_acara,
    
    // 13. No. WBS/Pos Anggaran
    noWBSPosAnggaran: row.no_wbs_pos_anggaran,
    
    // 14. No. SKKI/SKKO
    noSKKISKKO: row.no_skki_skko,
    
    // 15. Tanggal Request
    tanggalRequest: row.tanggal_request,
    
    // 16. Tanggal SE release
    tanggalSERelease: row.tanggal_se_release,
    
    // 17. No. SE
    noSE: row.no_se,
    
    // 18. No. PO
    noPO: row.no_po,
    
    // 19. Submission ID
    submissionId: row.submission_id,
    
    // 20. Nama Pekerjaan
    namaPekerjaan: row.nama_pekerjaan,
    
    // 21. Beban Tahun
    bebanTahun: row.beban_tahun,
    
    // 22. Terbayar Pusat
    terbayarPusat: row.terbayar_pusat || 0,
    
    // 23. Status Bayar
    statusBayar: row.status_bayar,
    
    // 24. Keterangan
    keterangan: row.keterangan,
    
    // 25. Entry By
    entryBy: row.entry_by,
    
    // 26. Keterangan/Konfirmasi
    keteranganKonfirmasi: row.keterangan_konfirmasi,
    
    // 27. Rutin/Non Rutin
    rutinNonRutin: row.rutin_non_rutin,
    
    // 28. PIC
    pic: row.pic,
    
    // 29. Bidang
    bidang: row.bidang,
    
    // Metadata
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvoice(row: any): Invoice {
  return {
    id: row.id,
    contractId: row.contract_id,
    contractCategory: row.contract_category || "investasi",
    noPerjanjian: row.no_perjanjian,
    nomorTagihan: row.nomor_tagihan,
    tanggalTagihan: row.tanggal_tagihan,
    nilaiTagihan: row.nilai_tagihan || 0,
    noBeritaAcara: row.no_berita_acara,
    tanggalBeritaAcara: row.tanggal_berita_acara,
    tanggalArsip: row.tanggal_arsip,
    noXPS: row.no_xps,
    tanggalXPS: row.tanggal_xps,
    status: row.status || "diajukan",
    tanggalDiajukan: row.tanggal_diajukan,
    tanggalVerifikasi: row.tanggal_verifikasi,
    keterangan: row.keterangan,
    diajukanOleh: row.diajukan_oleh,
    diajukanOlehName: row.diajukan_oleh_name,
    dibayarOleh: row.dibayar_oleh,
    dokumenTagihan: row.dokumen_tagihan,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ============================================
// MAPPERS - TypeScript to Database
// ============================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapInvestmentToDb(contract: Partial<ContractInvestment>): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};

  if (contract.noPerjanjian !== undefined) result.no_perjanjian = contract.noPerjanjian;
  if (contract.tanggalPerjanjian !== undefined) result.tanggal_perjanjian = contract.tanggalPerjanjian;
  if (contract.tanggalBerakhir !== undefined) result.tanggal_berakhir = contract.tanggalBerakhir;
  if (contract.judulPRK !== undefined) result.judul_prk = contract.judulPRK;
  if (contract.namaPekerjaan !== undefined) result.nama_pekerjaan = contract.namaPekerjaan;
  if (contract.noPRK !== undefined) result.no_prk = contract.noPRK;
  if (contract.nilaiPerjanjian !== undefined) result.nilai_perjanjian = contract.nilaiPerjanjian;
  if (contract.nilaiTagihan !== undefined) result.nilai_tagihan = contract.nilaiTagihan;
  if (contract.terbayar !== undefined) result.terbayar = contract.terbayar;
  if (contract.namaVendor !== undefined) result.nama_vendor = contract.namaVendor;
  if (contract.jenisAI !== undefined) result.jenis_ai = contract.jenisAI;
  if (contract.crNotCR !== undefined) result.cr_not_cr = contract.crNotCR;
  if (contract.status !== undefined) result.status = contract.status;
  if (contract.statusVIP !== undefined) result.status_vip = contract.statusVIP;
  if (contract.unit !== undefined) result.unit = contract.unit;
  if (contract.keterangan !== undefined) result.keterangan = contract.keterangan;

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMaintenanceToDb(contract: Partial<ContractMaintenance>): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};

  // Mapping sesuai struktur tabel baru contract_maintenance
  if (contract.uraianKegiatan !== undefined) result.uraian_kegiatan = contract.uraianKegiatan;
  if (contract.noPerjanjian !== undefined) result.no_perjanjian = contract.noPerjanjian;
  if (contract.tanggalPerjanjian !== undefined) result.tanggal_perjanjian = contract.tanggalPerjanjian;
  if (contract.tanggalBerakhir !== undefined) result.tanggal_berakhir = contract.tanggalBerakhir;
  if (contract.judulPerjanjian !== undefined) result.judul_perjanjian = contract.judulPerjanjian;
  if (contract.nilaiPerjanjian !== undefined) result.nilai_perjanjian = contract.nilaiPerjanjian;
  if (contract.namaVendor !== undefined) result.nama_vendor = contract.namaVendor;
  if (contract.nilaiTagihanSTIPusat !== undefined) result.nilai_tagihan_sti_pusat = contract.nilaiTagihanSTIPusat;
  if (contract.nilaiTagihanUnitInduk !== undefined) result.nilai_tagihan_unit_induk = contract.nilaiTagihanUnitInduk;
  if (contract.noBeritaAcara !== undefined) result.no_berita_acara = contract.noBeritaAcara;
  if (contract.tanggalBeritaAcara !== undefined) result.tanggal_berita_acara = contract.tanggalBeritaAcara;
  if (contract.noWBSPosAnggaran !== undefined) result.no_wbs_pos_anggaran = contract.noWBSPosAnggaran;
  if (contract.noSKKISKKO !== undefined) result.no_skki_skko = contract.noSKKISKKO;
  if (contract.tanggalRequestSE !== undefined) result.tanggal_request_se = contract.tanggalRequestSE;
  if (contract.tanggalSERilis !== undefined) result.tanggal_se_rilis = contract.tanggalSERilis;
  if (contract.noSE !== undefined) result.no_se = contract.noSE;
  if (contract.noPO !== undefined) result.no_po = contract.noPO;
  if (contract.submissionIdVIP !== undefined) result.submission_id_vip = contract.submissionIdVIP;
  if (contract.namaPekerjaan !== undefined) result.nama_pekerjaan = contract.namaPekerjaan;
  if (contract.msb !== undefined) result.msb = contract.msb;
  if (contract.bidang !== undefined) result.bidang = contract.bidang;
  if (contract.statusVIP !== undefined) result.status_vip = contract.statusVIP;
  if (contract.periodeAccrue !== undefined) result.periode_accrue = contract.periodeAccrue;
  if (contract.requestedBy !== undefined) result.requested_by = contract.requestedBy;
  if (contract.keterangan !== undefined) result.keterangan = contract.keterangan;
  if (contract.terbayarSTIPusat !== undefined) result.terbayar_sti_pusat = contract.terbayarSTIPusat;
  if (contract.terbayarUnit !== undefined) result.terbayar_unit = contract.terbayarUnit;
  if (contract.statusTerbayar !== undefined) result.status_terbayar = contract.statusTerbayar;
  if (contract.rutinNonRutin !== undefined) result.rutin_non_rutin = contract.rutinNonRutin;

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAdministrationToDb(contract: Partial<ContractAdministration>): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};

  // Mapping sesuai struktur tabel baru contract_administration
  if (contract.uraianKegiatan !== undefined) result.uraian_kegiatan = contract.uraianKegiatan;
  if (contract.noPerjanjian !== undefined) result.no_perjanjian = contract.noPerjanjian;
  if (contract.tanggalPerjanjian !== undefined) result.tanggal_perjanjian = contract.tanggalPerjanjian;
  if (contract.tanggalBerakhir !== undefined) result.tanggal_berakhir = contract.tanggalBerakhir;
  if (contract.judulPerjanjian !== undefined) result.judul_perjanjian = contract.judulPerjanjian;
  if (contract.nilaiPerjanjian !== undefined) result.nilai_perjanjian = contract.nilaiPerjanjian;
  if (contract.namaVendor !== undefined) result.nama_vendor = contract.namaVendor;
  if (contract.nilaiTagihanKeseluruhan !== undefined) result.nilai_tagihan_keseluruhan = contract.nilaiTagihanKeseluruhan;
  if (contract.nilaiTagihanKantorPusat !== undefined) result.nilai_tagihan_kantor_pusat = contract.nilaiTagihanKantorPusat;
  if (contract.nilaiTagihanUnitSelainPusat !== undefined) result.nilai_tagihan_unit_selain_pusat = contract.nilaiTagihanUnitSelainPusat;
  if (contract.noBeritaAcara !== undefined) result.no_berita_acara = contract.noBeritaAcara;
  if (contract.tanggalBeritaAcara !== undefined) result.tanggal_berita_acara = contract.tanggalBeritaAcara;
  if (contract.noWBSPosAnggaran !== undefined) result.no_wbs_pos_anggaran = contract.noWBSPosAnggaran;
  if (contract.noSKKISKKO !== undefined) result.no_skki_skko = contract.noSKKISKKO;
  if (contract.tanggalRequest !== undefined) result.tanggal_request = contract.tanggalRequest;
  if (contract.tanggalSERelease !== undefined) result.tanggal_se_release = contract.tanggalSERelease;
  if (contract.noSE !== undefined) result.no_se = contract.noSE;
  if (contract.noPO !== undefined) result.no_po = contract.noPO;
  if (contract.submissionId !== undefined) result.submission_id = contract.submissionId;
  if (contract.namaPekerjaan !== undefined) result.nama_pekerjaan = contract.namaPekerjaan;
  if (contract.bebanTahun !== undefined) result.beban_tahun = contract.bebanTahun;
  if (contract.terbayarPusat !== undefined) result.terbayar_pusat = contract.terbayarPusat;
  if (contract.statusBayar !== undefined) result.status_bayar = contract.statusBayar;
  if (contract.keterangan !== undefined) result.keterangan = contract.keterangan;
  if (contract.entryBy !== undefined) result.entry_by = contract.entryBy;
  if (contract.keteranganKonfirmasi !== undefined) result.keterangan_konfirmasi = contract.keteranganKonfirmasi;
  if (contract.rutinNonRutin !== undefined) result.rutin_non_rutin = contract.rutinNonRutin;
  if (contract.pic !== undefined) result.pic = contract.pic;
  if (contract.bidang !== undefined) result.bidang = contract.bidang;

  return result;
}
