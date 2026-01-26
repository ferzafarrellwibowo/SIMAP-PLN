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
  return {
    id: row.id,
    no: row.no,
    kategori: "pemeliharaan",
    noPerjanjian: row.no_perjanjian,
    tanggalPerjanjian: row.tanggal_perjanjian,
    tanggalBerakhir: row.tanggal_berakhir,
    judulPekerjaan: row.judul_pekerjaan,
    uraianKegiatan: row.uraian_kegiatan,
    jenisPekerjaan: row.jenis_pekerjaan,
    nilaiKontrak: row.nilai_kontrak || 0,
    nilaiTagihan: row.nilai_tagihan || 0,
    totalTagihanDibayar: row.total_tagihan_dibayar || 0,
    sisaAnggaran: row.sisa_anggaran || 0,
    persentaseRealisasi: row.persentase_realisasi || 0,
    vendor: row.vendor,
    status: row.status || "aktif",
    jenisAnggaran: row.jenis_anggaran || "AO",
    noBeritaAcara: row.no_berita_acara,
    tanggalBeritaAcara: row.tanggal_berita_acara,
    nilaiBeritaAcara: row.nilai_berita_acara,
    noBeritaAcaraSKRelasi: row.no_berita_acara_sk_relasi,
    tanggalArsip: row.tanggal_arsip,
    noXPS: row.no_xps,
    tanggalXPS: row.tanggal_xps,
    unit: row.unit,
    unitSektorK: row.unit_sektor_k,
    noSKWE: row.no_skwe,
    posAngg: row.pos_angg,
    noSKUSKKO: row.no_sku_skko,
    noSE: row.no_se,
    noPO: row.no_po,
    submissionId: row.submission_id,
    requestTanggalSE: row.request_tanggal_se,
    requestTanggalSERelasi: row.request_tanggal_se_relasi,
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
function mapAdministrationContract(row: any): ContractAdministration {
  return {
    id: row.id,
    no: row.no,
    kategori: "administrasi",
    noPerjanjian: row.no_perjanjian,
    tanggalPerjanjian: row.tanggal_perjanjian,
    tanggalBerakhir: row.tanggal_berakhir,
    judulPekerjaan: row.judul_pekerjaan,
    uraianKegiatan: row.uraian_kegiatan,
    jenisPekerjaan: row.jenis_pekerjaan,
    nilaiKontrak: row.nilai_kontrak || 0,
    nilaiTagihan: row.nilai_tagihan || 0,
    totalTagihanDibayar: row.total_tagihan_dibayar || 0,
    sisaAnggaran: row.sisa_anggaran || 0,
    persentaseRealisasi: row.persentase_realisasi || 0,
    vendor: row.vendor,
    status: row.status || "aktif",
    jenisAnggaran: row.jenis_anggaran || "AO",
    noBeritaAcara: row.no_berita_acara,
    tanggalBeritaAcara: row.tanggal_berita_acara,
    nilaiBeritaAcara: row.nilai_berita_acara,
    noBeritaAcaraSKRelasi: row.no_berita_acara_sk_relasi,
    tanggalArsip: row.tanggal_arsip,
    noXPS: row.no_xps,
    tanggalXPS: row.tanggal_xps,
    unit: row.unit,
    unitSektorK: row.unit_sektor_k,
    noSKWE: row.no_skwe,
    posAngg: row.pos_angg,
    noSKUSKKO: row.no_sku_skko,
    noSE: row.no_se,
    noPO: row.no_po,
    submissionId: row.submission_id,
    requestTanggalSE: row.request_tanggal_se,
    requestTanggalSERelasi: row.request_tanggal_se_relasi,
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

  if (contract.noPerjanjian !== undefined) result.no_perjanjian = contract.noPerjanjian;
  if (contract.tanggalPerjanjian !== undefined) result.tanggal_perjanjian = contract.tanggalPerjanjian;
  if (contract.tanggalBerakhir !== undefined) result.tanggal_berakhir = contract.tanggalBerakhir;
  if (contract.judulPekerjaan !== undefined) result.judul_pekerjaan = contract.judulPekerjaan;
  if (contract.uraianKegiatan !== undefined) result.uraian_kegiatan = contract.uraianKegiatan;
  if (contract.nilaiKontrak !== undefined) result.nilai_kontrak = contract.nilaiKontrak;
  if (contract.nilaiTagihan !== undefined) result.nilai_tagihan = contract.nilaiTagihan;
  if (contract.totalTagihanDibayar !== undefined) result.total_tagihan_dibayar = contract.totalTagihanDibayar;
  if (contract.vendor !== undefined) result.vendor = contract.vendor;
  if (contract.status !== undefined) result.status = contract.status;
  if (contract.jenisAnggaran !== undefined) result.jenis_anggaran = contract.jenisAnggaran;
  if (contract.unit !== undefined) result.unit = contract.unit;
  if (contract.keterangan !== undefined) result.keterangan = contract.keterangan;

  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAdministrationToDb(contract: Partial<ContractAdministration>): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any> = {};

  if (contract.noPerjanjian !== undefined) result.no_perjanjian = contract.noPerjanjian;
  if (contract.tanggalPerjanjian !== undefined) result.tanggal_perjanjian = contract.tanggalPerjanjian;
  if (contract.tanggalBerakhir !== undefined) result.tanggal_berakhir = contract.tanggalBerakhir;
  if (contract.judulPekerjaan !== undefined) result.judul_pekerjaan = contract.judulPekerjaan;
  if (contract.uraianKegiatan !== undefined) result.uraian_kegiatan = contract.uraianKegiatan;
  if (contract.nilaiKontrak !== undefined) result.nilai_kontrak = contract.nilaiKontrak;
  if (contract.nilaiTagihan !== undefined) result.nilai_tagihan = contract.nilaiTagihan;
  if (contract.totalTagihanDibayar !== undefined) result.total_tagihan_dibayar = contract.totalTagihanDibayar;
  if (contract.vendor !== undefined) result.vendor = contract.vendor;
  if (contract.status !== undefined) result.status = contract.status;
  if (contract.jenisAnggaran !== undefined) result.jenis_anggaran = contract.jenisAnggaran;
  if (contract.unit !== undefined) result.unit = contract.unit;
  if (contract.keterangan !== undefined) result.keterangan = contract.keterangan;

  return result;
}
