"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect, ReactNode } from "react";
import type {
  Contract,
  Invoice,
  ContractStatus,
  ContractCategory,
  JenisAnggaran,
  InvoiceStatus,
  DashboardSummary,
  ContractFilters,
  InvoiceFilters,
  Alert,
} from "./types-new";

// ============================================
// MOCK DATA - VENDORS
// ============================================

const vendors = [
  "PT Wijaya Karya",
  "PT Hutama Karya",
  "PT Waskita Karya",
  "PT PP (Persero)",
  "PT Adhi Karya",
  "PT Brantas Abipraya",
  "PT Nindya Karya",
  "PT Jasa Marga",
];

const units = [
  "PLN UP3 Jakarta Selatan",
  "PLN UP3 Bandung",
  "PLN UP3 Surabaya",
  "PLN UP3 Medan",
  "PLN UP3 Makassar",
];

// ============================================
// GENERATE MOCK CONTRACTS - SESUAI SAMPLE DATA PLN
// ============================================

function generateMockContracts(): Contract[] {
  // Data berdasarkan sample: Investasi, Pemeliharaan, Administrasi
  const contractData: Array<{
    kategori: ContractCategory;
    uraian: string;
    judul: string;
    vendor: string;
    nilai: number;
    status: ContractStatus;
  }> = [
    // INVESTASI
    { kategori: "investasi", uraian: "Pengadaan Trafo 60 MVA", judul: "Pengadaan dan Pemasangan Trafo Daya 60 MVA GI Cawang", vendor: "PT Wijaya Karya", nilai: 15000000000, status: "aktif" },
    { kategori: "investasi", uraian: "Pembangunan SUTT 150kV", judul: "Pembangunan SUTT 150kV Cikarang-Bekasi Circuit 2", vendor: "PT Hutama Karya", nilai: 28000000000, status: "aktif" },
    { kategori: "investasi", uraian: "Pengadaan Kubikel 20kV", judul: "Pengadaan Kubikel 20kV untuk GI Duri Kosambi", vendor: "PT PP (Persero)", nilai: 8500000000, status: "aktif" },
    { kategori: "investasi", uraian: "Pembangunan GITET 500kV", judul: "Pembangunan GITET 500kV Surabaya Selatan", vendor: "PT Adhi Karya", nilai: 45000000000, status: "aktif" },
    { kategori: "investasi", uraian: "Upgrade GI 70kV", judul: "Upgrade Kapasitas GI Cibinong 70kV", vendor: "PT Brantas Abipraya", nilai: 6200000000, status: "aktif" },
    
    // PEMELIHARAAN
    { kategori: "pemeliharaan", uraian: "Pemeliharaan Trafo GI", judul: "Pemeliharaan Rutin Trafo GI Bandung Selatan", vendor: "PT Nindya Karya", nilai: 2500000000, status: "aktif" },
    { kategori: "pemeliharaan", uraian: "Overhaul PMT 150kV", judul: "Overhaul PMT 150kV GI Medan Timur", vendor: "PT Hutama Karya", nilai: 1800000000, status: "aktif" },
    { kategori: "pemeliharaan", uraian: "Penggantian Isolator SUTT", judul: "Penggantian Isolator SUTT 150kV Jalur Makassar", vendor: "PT Waskita Karya", nilai: 3200000000, status: "aktif" },
    { kategori: "pemeliharaan", uraian: "Pemeliharaan Sistem Proteksi", judul: "Pemeliharaan Sistem Proteksi GI Jakarta Timur", vendor: "PT Wijaya Karya", nilai: 1500000000, status: "selesai" },
    { kategori: "pemeliharaan", uraian: "Perbaikan Kabel Bawah Tanah", judul: "Perbaikan Kabel Bawah Tanah 20kV Area CBD Jakarta", vendor: "PT PP (Persero)", nilai: 4500000000, status: "bermasalah" },
    
    // ADMINISTRASI
    { kategori: "administrasi", uraian: "Jasa Konsultansi DED", judul: "Jasa Konsultansi DED GI Tangerang Baru", vendor: "PT Adhi Karya", nilai: 850000000, status: "aktif" },
    { kategori: "administrasi", uraian: "Supervisi Konstruksi", judul: "Jasa Supervisi Konstruksi SUTT 150kV Yogya-Solo", vendor: "PT Jasa Marga", nilai: 1200000000, status: "aktif" },
    { kategori: "administrasi", uraian: "Studi Kelayakan", judul: "Studi Kelayakan Pembangunan GI Bekasi Timur", vendor: "PT Brantas Abipraya", nilai: 650000000, status: "aktif" },
    { kategori: "administrasi", uraian: "Jasa Audit Teknis", judul: "Jasa Audit Teknis Instalasi GI se-Jawa Barat", vendor: "PT Nindya Karya", nilai: 480000000, status: "selesai" },
  ];

  return contractData.map((data, index) => {
    // Random percentage of completion (20% - 85%)
    const realisasiPersen = Math.random() * 65 + 20;
    const totalDibayar = Math.floor(data.nilai * (realisasiPersen / 100));
    const sisaAnggaran = data.nilai - totalDibayar;

    // Generate dates
    const tahun = 2025;
    const bulanMulai = (index % 6) + 1;
    const tanggalPerjanjian = `${tahun}-${String(bulanMulai).padStart(2, "0")}-15`;
    const tanggalBerakhir = `${tahun + 1}-${String(((bulanMulai + 5) % 12) + 1).padStart(2, "0")}-30`;

    // Bidang berdasarkan kategori
    const bidangMap: Record<ContractCategory, string> = {
      investasi: "Pengembangan",
      pemeliharaan: "Operasi & Pemeliharaan",
      administrasi: "Administrasi & Umum",
    };

    // Jenis pekerjaan berdasarkan kategori
    const jenisPekerjaanMap: Record<ContractCategory, string[]> = {
      investasi: ["Konstruksi", "Pengadaan", "Instalasi", "Pembangunan"],
      pemeliharaan: ["Overhaul", "Perbaikan", "Pemeliharaan Rutin", "Penggantian"],
      administrasi: ["Konsultansi", "Supervisi", "Studi", "Audit"],
    };

    return {
      id: `CTR-${String(index + 1).padStart(3, "0")}`,
      no: index + 1,
      uraianKegiatan: data.uraian,
      noPerjanjian: `${String(index + 1).padStart(4, "0")}/PLN/KTR/${tahun}`,
      tanggalPerjanjian,
      tanggalBerakhir,
      judulPekerjaan: data.judul,
      nilaiKontrak: data.nilai,
      vendor: data.vendor,
      nilaiTagihanKontrakPusat: Math.floor(totalDibayar * 0.6),
      nilaiTagihanUnitInduk: Math.floor(totalDibayar * 0.4),
      nilaiBeritaAcara: realisasiPersen > 30 ? Math.floor(totalDibayar * 0.9) : undefined,
      noBeritaAcara: realisasiPersen > 30 ? `BA-${String(index + 1).padStart(3, "0")}/${tahun}` : undefined,
      tanggalBeritaAcara: realisasiPersen > 30 ? `${tahun}-${String(bulanMulai + 2).padStart(2, "0")}-20` : undefined,
      noBeritaAcaraSKRelasi: realisasiPersen > 50 ? `BA-SK/${String(index + 1).padStart(3, "0")}/${tahun}` : undefined,
      tanggalArsip: realisasiPersen > 50 ? `${tahun}-${String(bulanMulai + 3).padStart(2, "0")}-01` : undefined,
      noXPS: realisasiPersen > 40 ? `XPS/${String(index + 1).padStart(4, "0")}/${tahun}` : undefined,
      tanggalXPS: realisasiPersen > 40 ? `${tahun}-${String(bulanMulai + 2).padStart(2, "0")}-25` : undefined,
      kategori: data.kategori,
      jenisAnggaran: data.kategori === "investasi" ? "AI" : "AO",
      unit: units[index % units.length],
      unitSektorK: `Sektor ${["A", "B", "C", "D", "E"][index % 5]}`,
      noSKWE: `SK-WE/${String(index + 1).padStart(4, "0")}/${tahun}`,
      posAngg: `${5200 + (index % 10)}`,
      noSKUSKKO: `SKU/${String(index + 1).padStart(5, "0")}/${tahun}`,
      requestTanggalSERelasi: `${tahun}-${String(bulanMulai).padStart(2, "0")}-10`,
      noSE: `SE/${String(index + 1).padStart(4, "0")}/${tahun}`,
      noPO: `PO/${String(index + 1).padStart(6, "0")}/${tahun}`,
      submissionId: `SUB-${String(index + 1).padStart(8, "0")}`,
      jenisPekerjaan: jenisPekerjaanMap[data.kategori][index % jenisPekerjaanMap[data.kategori].length],
      bebanTahun: `${tahun}`,
      batasPaguTerbayar: Math.floor(data.nilai * 0.95),
      unitTerbayar: units[index % units.length],
      konfirmasiNonRutin: index % 3 === 0 ? "Non Rutin" : "Rutin",
      bidang: bidangMap[data.kategori],
      picId: index % 2 === 0 ? "USR-002" : "USR-003",
      picName: index % 2 === 0 ? "Budi Santoso" : "Siti Rahayu",
      entryBy: ["Admin", "Operator", "System"][index % 3],
      status: data.status,
      totalTagihanDibayar: totalDibayar,
      sisaAnggaran,
      persentaseRealisasi: realisasiPersen,
      oldFlag: index % 5 === 0 ? "Y" : undefined,
      clickCB: index % 4 === 0,
      createdAt: "2025-01-01T00:00:00Z",
      createdBy: "USR-001",
      updatedAt: new Date().toISOString(),
      updatedBy: "USR-001",
      keterangan: `Pekerjaan ${data.judul} sesuai kontrak perjanjian.`,
    };
  });
}

// ============================================
// GENERATE MOCK INVOICES
// ============================================

function generateMockInvoices(contracts: Contract[]): Invoice[] {
  const invoices: Invoice[] = [];
  let invoiceIndex = 1;

  contracts.forEach((contract) => {
    // Generate 2-5 invoices per contract
    const numInvoices = Math.floor(Math.random() * 4) + 2;
    
    for (let i = 0; i < numInvoices; i++) {
      const nilaiTagihan = Math.floor((contract.nilaiKontrak / numInvoices) * (0.8 + Math.random() * 0.4));
      
      // Determine status based on random and position
      let status: InvoiceStatus;
      if (i < numInvoices - 2) {
        status = "dibayar";
      } else if (i === numInvoices - 2) {
        status = Math.random() > 0.3 ? "diverifikasi" : "dibayar";
      } else {
        const rand = Math.random();
        if (rand < 0.4) status = "diajukan";
        else if (rand < 0.7) status = "diverifikasi";
        else if (rand < 0.9) status = "dibayar";
        else status = "ditolak";
      }

      const tanggalDiajukan = new Date(2025, i * 2, 15 + Math.floor(Math.random() * 10));
      const tahun = tanggalDiajukan.getFullYear();
      
      invoices.push({
        id: `INV-${String(invoiceIndex).padStart(4, "0")}`,
        contractId: contract.id,
        noPerjanjian: contract.noPerjanjian,
        nomorTagihan: `BA/${contract.id.replace("CTR-", "")}/${String(i + 1).padStart(2, "0")}/${tahun}`,
        tanggalTagihan: tanggalDiajukan.toISOString().split("T")[0],
        nilaiTagihan,
        noBeritaAcara: status !== "diajukan" ? `BA-${String(invoiceIndex).padStart(4, "0")}/${tahun}` : undefined,
        tanggalBeritaAcara: status !== "diajukan" ? new Date(tanggalDiajukan.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : undefined,
        tanggalArsip: status === "dibayar" ? new Date(tanggalDiajukan.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : undefined,
        noXPS: ["diverifikasi", "dibayar"].includes(status) ? `XPS/${String(invoiceIndex).padStart(4, "0")}/${tahun}` : undefined,
        tanggalXPS: ["diverifikasi", "dibayar"].includes(status) ? new Date(tanggalDiajukan.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] : undefined,
        status,
        tanggalDiajukan: tanggalDiajukan.toISOString(),
        tanggalDiverifikasi: ["diverifikasi", "dibayar"].includes(status)
          ? new Date(tanggalDiajukan.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        tanggalDibayar: status === "dibayar"
          ? new Date(tanggalDiajukan.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        tanggalDitolak: status === "ditolak"
          ? new Date(tanggalDiajukan.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString()
          : undefined,
        keterangan: `Pembayaran termin ke-${i + 1}`,
        alasanPenolakan: status === "ditolak" ? "Dokumen pendukung tidak lengkap" : undefined,
        diajukanOleh: "USR-002",
        diajukanOlehName: "Budi Santoso",
        diverifikasiOleh: ["diverifikasi", "dibayar"].includes(status) ? "USR-003" : undefined,
        diverifikasiOlehName: ["diverifikasi", "dibayar"].includes(status) ? "Siti Rahayu" : undefined,
        dibayarOleh: status === "dibayar" ? "USR-001" : undefined,
        dibayarOlehName: status === "dibayar" ? "Administrator" : undefined,
        createdAt: tanggalDiajukan.toISOString(),
        updatedAt: new Date().toISOString(),
      });

      invoiceIndex++;
    }
  });

  return invoices;
}

// ============================================
// STATUS LABELS & COLORS
// ============================================

export const JENIS_ANGGARAN_LABELS: Record<JenisAnggaran, string> = {
  AI: "AI (Anggaran Investasi)",
  AO: "AO (Anggaran Operasi)",
};

export const JENIS_ANGGARAN_COLORS: Record<JenisAnggaran, string> = {
  AI: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  AO: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  aktif: "Aktif",
  selesai: "Selesai",
  bermasalah: "Bermasalah",
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  aktif: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  selesai: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  bermasalah: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export const CONTRACT_CATEGORY_LABELS: Record<ContractCategory, string> = {
  investasi: "Investasi",
  pemeliharaan: "Pemeliharaan",
  administrasi: "Administrasi",
};

export const CONTRACT_CATEGORY_COLORS: Record<ContractCategory, string> = {
  investasi: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  pemeliharaan: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  administrasi: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  diajukan: "Diajukan",
  diverifikasi: "Diverifikasi",
  dibayar: "Dibayar",
  ditolak: "Ditolak",
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  diajukan: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  diverifikasi: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  dibayar: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  ditolak: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

// ============================================
// FILTER OPTIONS
// ============================================

export const jenisAnggaranOptions = [
  { value: "all", label: "Semua Jenis" },
  { value: "AI", label: "AI (Anggaran Investasi)" },
  { value: "AO", label: "AO (Anggaran Operasi)" },
];

export const contractStatusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "aktif", label: "Aktif" },
  { value: "selesai", label: "Selesai" },
  { value: "bermasalah", label: "Bermasalah" },
];

export const contractCategoryOptions = [
  { value: "all", label: "Semua Kategori" },
  { value: "investasi", label: "Investasi" },
  { value: "pemeliharaan", label: "Pemeliharaan" },
  { value: "administrasi", label: "Administrasi" },
];

export const invoiceStatusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "diajukan", label: "Diajukan" },
  { value: "diverifikasi", label: "Diverifikasi" },
  { value: "dibayar", label: "Dibayar" },
  { value: "ditolak", label: "Ditolak" },
];

export const unitOptions = [
  { value: "all", label: "Semua Unit" },
  ...units.map((u) => ({ value: u, label: u })),
];

export const vendorOptions = [
  { value: "all", label: "Semua Vendor" },
  ...vendors.map((v) => ({ value: v, label: v })),
];

// ============================================
// STORE CONTEXT
// ============================================

interface ContractStoreContextType {
  // Data
  contracts: Contract[];
  invoices: Invoice[];
  alerts: Alert[];
  isLoading: boolean;
  
  // Getters
  getContractById: (id: string) => Contract | undefined;
  getInvoiceById: (id: string) => Invoice | undefined;
  getInvoicesByContract: (contractId: string) => Invoice[];
  getDashboardSummary: () => DashboardSummary;
  
  // Filters
  filterContracts: (filters: ContractFilters) => Contract[];
  filterInvoices: (filters: InvoiceFilters) => Invoice[];
  
  // Mutations - ASYNC karena menggunakan Supabase
  createContract: (contract: Omit<Contract, "id" | "createdAt" | "updatedAt" | "totalTagihanDibayar" | "sisaAnggaran" | "persentaseRealisasi">) => Promise<Contract>;
  addContract: (contract: Omit<Contract, "id" | "createdAt" | "updatedAt" | "totalTagihanDibayar" | "sisaAnggaran" | "persentaseRealisasi">) => Promise<Contract>; // Alias
  updateContract: (id: string, updates: Partial<Contract>) => Contract | undefined;
  
  createInvoice: (invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Invoice | undefined;
  updateInvoiceStatus: (id: string, status: InvoiceStatus, notes?: string) => Invoice | undefined;
  
  // Alert mutations
  markAlertAsRead: (id: string) => void;
  markAllAlertsAsRead: () => void;
  
  // Recalculate
  recalculateContractTotals: (contractId: string) => void;
}

const ContractStoreContext = createContext<ContractStoreContextType | undefined>(undefined);

// ============================================
// GENERATE ALERTS BASED ON CONDITIONS
// ============================================

function generateAlerts(contracts: Contract[], invoices: Invoice[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();
  let alertId = 1;

  // Check contracts
  contracts.forEach((contract) => {
    // Kontrak hampir habis anggarannya (> 90% serapan)
    if (contract.persentaseRealisasi > 90 && contract.status === "aktif") {
      alerts.push({
        id: `ALT-${String(alertId++).padStart(4, "0")}`,
        type: "kontrak_hampir_habis",
        severity: "critical",
        title: "Anggaran Hampir Habis",
        message: `Kontrak "${contract.judulPekerjaan}" sudah mencapai ${contract.persentaseRealisasi.toFixed(1)}% serapan anggaran.`,
        contractId: contract.id,
        createdAt: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
      });
    }

    // Kontrak akan berakhir dalam 30 hari
    const endDate = new Date(contract.tanggalBerakhir);
    const daysUntilEnd = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilEnd > 0 && daysUntilEnd <= 30 && contract.status === "aktif") {
      alerts.push({
        id: `ALT-${String(alertId++).padStart(4, "0")}`,
        type: "kontrak_akan_berakhir",
        severity: daysUntilEnd <= 7 ? "critical" : "warning",
        title: "Kontrak Akan Berakhir",
        message: `Kontrak "${contract.judulPekerjaan}" akan berakhir dalam ${daysUntilEnd} hari (${endDate.toLocaleDateString("id-ID")}).`,
        contractId: contract.id,
        createdAt: new Date(now.getTime() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
      });
    }
  });

  // Check invoices
  invoices.forEach((invoice) => {
    // Tagihan pending lebih dari 7 hari
    if (invoice.status === "diajukan") {
      const submittedDate = new Date(invoice.tanggalDiajukan);
      const daysPending = Math.floor((now.getTime() - submittedDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysPending > 7) {
        alerts.push({
          id: `ALT-${String(alertId++).padStart(4, "0")}`,
          type: "tagihan_pending_lama",
          severity: daysPending > 14 ? "critical" : "warning",
          title: "Tagihan Menunggu Verifikasi",
          message: `Tagihan "${invoice.nomorTagihan}" sudah ${daysPending} hari menunggu verifikasi.`,
          contractId: invoice.contractId,
          invoiceId: invoice.id,
          createdAt: new Date(now.getTime() - Math.random() * 72 * 60 * 60 * 1000).toISOString(),
        });
      }
    }

    // Tagihan ditolak
    if (invoice.status === "ditolak") {
      alerts.push({
        id: `ALT-${String(alertId++).padStart(4, "0")}`,
        type: "tagihan_ditolak",
        severity: "warning",
        title: "Tagihan Ditolak",
        message: `Tagihan "${invoice.nomorTagihan}" ditolak. Alasan: ${invoice.alasanPenolakan || "Tidak ada keterangan"}.`,
        contractId: invoice.contractId,
        invoiceId: invoice.id,
        createdAt: invoice.tanggalDitolak || new Date().toISOString(),
      });
    }
  });

  // Sort alerts by createdAt (newest first)
  return alerts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

// ============================================
// PROVIDER
// ============================================

export function ContractStoreProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // LOAD DATA DARI SUPABASE saat pertama kali mount
  useEffect(() => {
    async function loadDataFromSupabase() {
      try {
        setIsLoading(true);
        
        // Fetch contracts
        const contractsRes = await fetch('/api/contracts');
        if (contractsRes.ok) {
          const { data: contractsData } = await contractsRes.json();
          
          // Transform snake_case to camelCase
          const transformedContracts: Contract[] = contractsData.map((data: any) => ({
            id: data.id,
            no: data.no,
            uraianKegiatan: data.uraian_kegiatan,
            noPerjanjian: data.no_perjanjian,
            tanggalPerjanjian: data.tanggal_perjanjian,
            tanggalBerakhir: data.tanggal_berakhir,
            judulPekerjaan: data.judul_pekerjaan,
            nilaiKontrak: data.nilai_kontrak,
            vendor: data.vendor,
            nilaiTagihanKontrakPusat: data.nilai_tagihan_kontrak_pusat,
            nilaiTagihanUnitInduk: data.nilai_tagihan_unit_induk,
            nilaiBeritaAcara: data.nilai_berita_acara,
            noBeritaAcara: data.no_berita_acara,
            tanggalBeritaAcara: data.tanggal_berita_acara,
            noBeritaAcaraSKRelasi: data.no_berita_acara_sk_relasi,
            tanggalArsip: data.tanggal_arsip,
            noXPS: data.no_xps,
            tanggalXPS: data.tanggal_xps,
            kategori: data.kategori,
            jenisAnggaran: data.jenis_anggaran,
            unit: data.unit,
            unitSektorK: data.unit_sektor_k,
            noSKWE: data.no_sk_we,
            posAngg: data.pos_angg,
            noSKUSKKO: data.no_sku_skko,
            requestTanggalSERelasi: data.request_tanggal_se_relasi,
            noSE: data.no_se,
            noPO: data.no_po,
            submissionId: data.submission_id,
            jenisPekerjaan: data.jenis_pekerjaan,
            bebanTahun: data.beban_tahun,
            batasPaguTerbayar: data.batas_pagu_terbayar,
            unitTerbayar: data.unit_terbayar,
            konfirmasiNonRutin: data.konfirmasi_non_rutin,
            bidang: data.bidang,
            picId: data.pic_id,
            picName: data.pic_name,
            entryBy: data.entry_by,
            status: data.status,
            totalTagihanDibayar: data.total_tagihan_dibayar,
            sisaAnggaran: data.sisa_anggaran,
            persentaseRealisasi: parseFloat(data.persentase_realisasi),
            oldFlag: data.old_flag,
            clickCB: data.click_cb,
            createdAt: data.created_at,
            createdBy: data.created_by,
            updatedAt: data.updated_at,
            updatedBy: data.updated_by,
            keterangan: data.keterangan,
            dokumenKontrak: data.dokumen_kontrak,
          }));
          
          setContracts(transformedContracts);
        }

        // Fetch invoices
        const invoicesRes = await fetch('/api/invoices');
        if (invoicesRes.ok) {
          const { data: invoicesData } = await invoicesRes.json();
          
          // Transform snake_case to camelCase
          const transformedInvoices: Invoice[] = invoicesData.map((data: any) => ({
            id: data.id,
            contractId: data.contract_id,
            noPerjanjian: data.no_perjanjian,
            nomorTagihan: data.nomor_tagihan,
            tanggalTagihan: data.tanggal_tagihan,
            nilaiTagihan: data.nilai_tagihan,
            noBeritaAcara: data.no_berita_acara,
            tanggalBeritaAcara: data.tanggal_berita_acara,
            tanggalArsip: data.tanggal_arsip,
            noXPS: data.no_xps,
            tanggalXPS: data.tanggal_xps,
            status: data.status,
            tanggalDiajukan: data.tanggal_diajukan,
            tanggalDiverifikasi: data.tanggal_diverifikasi,
            tanggalDibayar: data.tanggal_dibayar,
            tanggalDitolak: data.tanggal_ditolak,
            keterangan: data.keterangan,
            alasanPenolakan: data.alasan_penolakan,
            diajukanOleh: data.diajukan_oleh,
            diajukanOlehName: data.diajukan_oleh_name,
            diverifikasiOleh: data.diverifikasi_oleh,
            diverifikasiOlehName: data.diverifikasi_oleh_name,
            dibayarOleh: data.dibayar_oleh,
            dibayarOlehName: data.dibayar_oleh_name,
            dokumenTagihan: data.dokumen_tagihan,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          }));
          
          setInvoices(transformedInvoices);
        }
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        // Fallback ke mock data jika gagal
        setContracts(generateMockContracts());
        setInvoices(generateMockInvoices(contracts));
      } finally {
        setIsLoading(false);
      }
    }

    loadDataFromSupabase();
  }, []); // Run once on mount

  // Generate alerts on mount and when contracts/invoices change
  useEffect(() => {
    const generatedAlerts = generateAlerts(contracts, invoices);
    setAlerts(generatedAlerts);
  }, [contracts, invoices]);

  // Mark alert as read
  const markAlertAsRead = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, readAt: new Date().toISOString() } : alert
      )
    );
  }, []);

  // Mark all alerts as read
  const markAllAlertsAsRead = useCallback(() => {
    const now = new Date().toISOString();
    setAlerts((prev) =>
      prev.map((alert) => (alert.readAt ? alert : { ...alert, readAt: now }))
    );
  }, []);

  // Get contract by ID
  const getContractById = useCallback(
    (id: string) => contracts.find((c) => c.id === id),
    [contracts]
  );

  // Get invoice by ID
  const getInvoiceById = useCallback(
    (id: string) => invoices.find((inv) => inv.id === id),
    [invoices]
  );

  // Get invoices by contract
  const getInvoicesByContract = useCallback(
    (contractId: string) => invoices.filter((inv) => inv.contractId === contractId),
    [invoices]
  );

  // Filter contracts
  const filterContracts = useCallback(
    (filters: ContractFilters): Contract[] => {
      let result = [...contracts];

      if (filters.status && filters.status !== "all") {
        result = result.filter((c) => c.status === filters.status);
      }
      if (filters.kategori && filters.kategori !== "all") {
        result = result.filter((c) => c.kategori === filters.kategori);
      }
      if (filters.unit && filters.unit !== "all") {
        result = result.filter((c) => c.unit === filters.unit);
      }
      if (filters.vendor && filters.vendor !== "all") {
        result = result.filter((c) => c.vendor === filters.vendor);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        result = result.filter(
          (c) =>
            c.judulPekerjaan.toLowerCase().includes(search) ||
            c.noPerjanjian.toLowerCase().includes(search) ||
            c.uraianKegiatan.toLowerCase().includes(search) ||
            c.vendor.toLowerCase().includes(search)
        );
      }

      return result;
    },
    [contracts]
  );

  // Filter invoices
  const filterInvoices = useCallback(
    (filters: InvoiceFilters): Invoice[] => {
      let result = [...invoices];

      if (filters.status && filters.status !== "all") {
        result = result.filter((inv) => inv.status === filters.status);
      }
      if (filters.contractId) {
        result = result.filter((inv) => inv.contractId === filters.contractId);
      }
      if (filters.search) {
        const search = filters.search.toLowerCase();
        result = result.filter(
          (inv) =>
            inv.nomorTagihan.toLowerCase().includes(search) ||
            inv.noPerjanjian.toLowerCase().includes(search)
        );
      }

      return result;
    },
    [invoices]
  );

  // Dashboard summary
  const getDashboardSummary = useCallback((): DashboardSummary => {
    const activeContracts = contracts.filter((c) => c.status === "aktif");
    const totalNilaiKontrak = activeContracts.reduce((sum, c) => sum + c.nilaiKontrak, 0);
    const totalDibayar = activeContracts.reduce((sum, c) => sum + c.totalTagihanDibayar, 0);

    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Per Kategori
    const kontrakInvestasi = activeContracts.filter((c) => c.kategori === "investasi");
    const kontrakPemeliharaan = activeContracts.filter((c) => c.kategori === "pemeliharaan");
    const kontrakAdministrasi = activeContracts.filter((c) => c.kategori === "administrasi");

    return {
      totalKontrakAktif: activeContracts.length,
      totalNilaiKontrak,
      totalDibayar,
      totalSisaAnggaran: totalNilaiKontrak - totalDibayar,
      persentaseRealisasiGlobal: totalNilaiKontrak > 0 ? (totalDibayar / totalNilaiKontrak) * 100 : 0,
      
      // Per Kategori
      kontrakInvestasi: kontrakInvestasi.length,
      kontrakPemeliharaan: kontrakPemeliharaan.length,
      kontrakAdministrasi: kontrakAdministrasi.length,
      nilaiInvestasi: kontrakInvestasi.reduce((sum, c) => sum + c.nilaiKontrak, 0),
      nilaiPemeliharaan: kontrakPemeliharaan.reduce((sum, c) => sum + c.nilaiKontrak, 0),
      nilaiAdministrasi: kontrakAdministrasi.reduce((sum, c) => sum + c.nilaiKontrak, 0),
      
      totalTagihan: invoices.length,
      tagihanDiajukan: invoices.filter((inv) => inv.status === "diajukan").length,
      tagihanDiverifikasi: invoices.filter((inv) => inv.status === "diverifikasi").length,
      tagihanDibayar: invoices.filter((inv) => inv.status === "dibayar").length,
      tagihanDitolak: invoices.filter((inv) => inv.status === "ditolak").length,
      
      kontrakHampirHabis: activeContracts.filter((c) => c.persentaseRealisasi > 90).length,
      tagihanPendingLama: invoices.filter(
        (inv) => inv.status === "diajukan" && new Date(inv.tanggalDiajukan) < sevenDaysAgo
      ).length,
      kontrakAkanBerakhir: activeContracts.filter(
        (c) => new Date(c.tanggalBerakhir) < thirtyDaysFromNow
      ).length,
    };
  }, [contracts, invoices]);

  // Create contract - DENGAN SUPABASE
  const createContract = useCallback(
    async (contractData: Omit<Contract, "id" | "createdAt" | "updatedAt" | "totalTagihanDibayar" | "sisaAnggaran" | "persentaseRealisasi">) => {
      try {
        // Call API to save to Supabase
        const response = await fetch('/api/contracts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contractData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create contract');
        }

        const { data } = await response.json();
        
        // Transform snake_case to camelCase
        const transformedData: Contract = {
          id: data.id,
          no: data.no,
          uraianKegiatan: data.uraian_kegiatan,
          noPerjanjian: data.no_perjanjian,
          tanggalPerjanjian: data.tanggal_perjanjian,
          tanggalBerakhir: data.tanggal_berakhir,
          judulPekerjaan: data.judul_pekerjaan,
          nilaiKontrak: data.nilai_kontrak,
          vendor: data.vendor,
          nilaiTagihanKontrakPusat: data.nilai_tagihan_kontrak_pusat,
          nilaiTagihanUnitInduk: data.nilai_tagihan_unit_induk,
          nilaiBeritaAcara: data.nilai_berita_acara,
          noBeritaAcara: data.no_berita_acara,
          tanggalBeritaAcara: data.tanggal_berita_acara,
          noBeritaAcaraSKRelasi: data.no_berita_acara_sk_relasi,
          tanggalArsip: data.tanggal_arsip,
          noXPS: data.no_xps,
          tanggalXPS: data.tanggal_xps,
          kategori: data.kategori,
          jenisAnggaran: data.jenis_anggaran,
          unit: data.unit,
          unitSektorK: data.unit_sektor_k,
          noSKWE: data.no_sk_we,
          posAngg: data.pos_angg,
          noSKUSKKO: data.no_sku_skko,
          requestTanggalSERelasi: data.request_tanggal_se_relasi,
          noSE: data.no_se,
          noPO: data.no_po,
          submissionId: data.submission_id,
          jenisPekerjaan: data.jenis_pekerjaan,
          bebanTahun: data.beban_tahun,
          batasPaguTerbayar: data.batas_pagu_terbayar,
          unitTerbayar: data.unit_terbayar,
          konfirmasiNonRutin: data.konfirmasi_non_rutin,
          bidang: data.bidang,
          picId: data.pic_id,
          picName: data.pic_name,
          entryBy: data.entry_by,
          status: data.status,
          totalTagihanDibayar: data.total_tagihan_dibayar,
          sisaAnggaran: data.sisa_anggaran,
          persentaseRealisasi: data.persentase_realisasi,
          oldFlag: data.old_flag,
          clickCB: data.click_cb,
          createdAt: data.created_at,
          createdBy: data.created_by,
          updatedAt: data.updated_at,
          updatedBy: data.updated_by,
          keterangan: data.keterangan,
          dokumenKontrak: data.dokumen_kontrak,
        };

        // Update local state
        setContracts((prev) => [...prev, transformedData]);
        return transformedData;
      } catch (error) {
        console.error('Error creating contract:', error);
        throw error;
      }
    },
    []
  );

  // Update contract
  const updateContract = useCallback(
    (id: string, updates: Partial<Contract>) => {
      let updated: Contract | undefined;
      setContracts((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            updated = { ...c, ...updates, updatedAt: new Date().toISOString() };
            return updated;
          }
          return c;
        })
      );
      return updated;
    },
    []
  );

  // Create invoice - DENGAN SUPABASE
  const createInvoice = useCallback(
    async (invoiceData: Omit<Invoice, "id" | "createdAt" | "updatedAt">) => {
      try {
        // Call API to save to Supabase
        const response = await fetch('/api/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoiceData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to create invoice');
        }

        const { data } = await response.json();
        
        // Transform snake_case to camelCase
        const transformedData: Invoice = {
          id: data.id,
          contractId: data.contract_id,
          noPerjanjian: data.no_perjanjian,
          nomorTagihan: data.nomor_tagihan,
          tanggalTagihan: data.tanggal_tagihan,
          nilaiTagihan: data.nilai_tagihan,
          noBeritaAcara: data.no_berita_acara,
          tanggalBeritaAcara: data.tanggal_berita_acara,
          tanggalArsip: data.tanggal_arsip,
          noXPS: data.no_xps,
          tanggalXPS: data.tanggal_xps,
          status: data.status,
          tanggalDiajukan: data.tanggal_diajukan,
          tanggalDiverifikasi: data.tanggal_diverifikasi,
          tanggalDibayar: data.tanggal_dibayar,
          tanggalDitolak: data.tanggal_ditolak,
          keterangan: data.keterangan,
          alasanPenolakan: data.alasan_penolakan,
          diajukanOleh: data.diajukan_oleh,
          diajukanOlehName: data.diajukan_oleh_name,
          diverifikasiOleh: data.diverifikasi_oleh,
          diverifikasiOlehName: data.diverifikasi_oleh_name,
          dibayarOleh: data.dibayar_oleh,
          dibayarOlehName: data.dibayar_oleh_name,
          dokumenTagihan: data.dokumen_tagihan,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };

        // Update local state
        setInvoices((prev) => [...prev, transformedData]);
        return transformedData;
      } catch (error) {
        console.error('Error creating invoice:', error);
        throw error;
      }
    },
    []
  );

  // Update invoice
  const updateInvoice = useCallback(
    (id: string, updates: Partial<Invoice>) => {
      let updated: Invoice | undefined;
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === id) {
            updated = { ...inv, ...updates, updatedAt: new Date().toISOString() };
            return updated;
          }
          return inv;
        })
      );
      return updated;
    },
    []
  );

  // Update invoice status
  const updateInvoiceStatus = useCallback(
    (id: string, status: InvoiceStatus, notes?: string) => {
      const now = new Date().toISOString();
      const updates: Partial<Invoice> = { status };

      if (status === "diverifikasi") {
        updates.tanggalDiverifikasi = now;
      } else if (status === "dibayar") {
        updates.tanggalDibayar = now;
      } else if (status === "ditolak") {
        updates.tanggalDitolak = now;
        updates.alasanPenolakan = notes;
      }

      return updateInvoice(id, updates);
    },
    [updateInvoice]
  );

  // Recalculate contract totals
  const recalculateContractTotals = useCallback(
    (contractId: string) => {
      const contractInvoices = invoices.filter(
        (inv) => inv.contractId === contractId && inv.status === "dibayar"
      );
      const totalDibayar = contractInvoices.reduce((sum, inv) => sum + inv.nilaiTagihan, 0);
      
      setContracts((prev) =>
        prev.map((c) => {
          if (c.id === contractId) {
            return {
              ...c,
              totalTagihanDibayar: totalDibayar,
              sisaAnggaran: c.nilaiKontrak - totalDibayar,
              persentaseRealisasi: (totalDibayar / c.nilaiKontrak) * 100,
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        })
      );
    },
    [invoices]
  );

  const value = useMemo(
    () => ({
      contracts,
      invoices,
      alerts,
      isLoading,
      getContractById,
      getInvoiceById,
      getInvoicesByContract,
      getDashboardSummary,
      filterContracts,
      filterInvoices,
      createContract,
      addContract: createContract, // Alias untuk createContract
      updateContract,
      createInvoice,
      updateInvoice,
      updateInvoiceStatus,
      markAlertAsRead,
      markAllAlertsAsRead,
      recalculateContractTotals,
    }),
    [
      contracts,
      invoices,
      alerts,
      isLoading,
      getContractById,
      getInvoiceById,
      getInvoicesByContract,
      getDashboardSummary,
      filterContracts,
      filterInvoices,
      createContract,
      updateContract,
      createInvoice,
      updateInvoice,
      updateInvoiceStatus,
      markAlertAsRead,
      markAllAlertsAsRead,
      recalculateContractTotals,
    ]
  );

  return (
    <ContractStoreContext.Provider value={value}>
      {children}
    </ContractStoreContext.Provider>
  );
}

export function useContractStore() {
  const context = useContext(ContractStoreContext);
  if (context === undefined) {
    throw new Error("useContractStore must be used within a ContractStoreProvider");
  }
  return context;
}
