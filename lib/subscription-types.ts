// ============================================
// TYPES UNTUK SUBSCRIPTION & MONTHLY PAYMENTS
// ============================================

export type PaymentStatus = "PAID" | "UNPAID";
export type SubscriptionStatus = "aktif" | "tidak_aktif" | "selesai";
export type SubscriptionCategory = 
  | "utilitas"
  | "software"
  | "jasa"
  | "perlengkapan"
  | "properti"
  | "transportasi"
  | "karyawan"
  | "pemasaran"
  | "lainnya";

// Subscription (Langganan)
export interface Subscription {
  id: string;
  no_perjanjian: string;
  nama_layanan: string;
  vendor: string;
  unit: string;
  anggaran_per_bulan: number;
  periode_mulai: number;  // Tahun
  periode_selesai: number; // Tahun
  kategori: SubscriptionCategory;
  deskripsi?: string;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Monthly Payment (Pembayaran Bulanan)
export interface MonthlyPayment {
  id: string;
  subscription_id: string;
  bulan: number;
  tahun: number;
  status: PaymentStatus;
  jumlah_bayar?: number;
  tanggal_bayar?: string;
  no_invoice?: string;
  keterangan?: string;
  created_at: string;
  updated_at: string;
  paid_by?: string;
}

// Subscription dengan summary pembayaran
export interface SubscriptionWithPayments extends Subscription {
  payments: MonthlyPayment[];
  total_bulan_terbayar: number;
  total_bulan_belum_bayar: number;
  total_terbayar: number;
  has_gaps: boolean;
  gap_months: number[];
  paid_percentage: number;
}

// Form input untuk create subscription
export interface SubscriptionFormInput {
  no_perjanjian: string;
  nama_layanan: string;
  vendor: string;
  unit: string;
  anggaran_per_bulan: number;
  periode_mulai: number;
  periode_selesai: number;
  kategori?: SubscriptionCategory;
  deskripsi?: string;
}

// Display untuk bulan
export interface MonthDisplay {
  month: number;
  monthName: string;
  monthShort: string;
  year: number;
  status: PaymentStatus;
  isPaid: boolean;
  amount?: number;
  paidAt?: string;
}

// Summary per tahun
export interface YearlyPaymentSummary {
  year: number;
  totalMonths: number;
  paidMonths: number;
  unpaidMonths: number;
  paidPercentage: number;
  totalPaidAmount: number;
  hasGaps: boolean;
  gapMonths: number[];
  allMonths: MonthDisplay[];
}

// Constants
export const MONTHS_ID = [
  { value: 1, name: "Januari", short: "Jan" },
  { value: 2, name: "Februari", short: "Feb" },
  { value: 3, name: "Maret", short: "Mar" },
  { value: 4, name: "April", short: "Apr" },
  { value: 5, name: "Mei", short: "Mei" },
  { value: 6, name: "Juni", short: "Jun" },
  { value: 7, name: "Juli", short: "Jul" },
  { value: 8, name: "Agustus", short: "Agu" },
  { value: 9, name: "September", short: "Sep" },
  { value: 10, name: "Oktober", short: "Okt" },
  { value: 11, name: "November", short: "Nov" },
  { value: 12, name: "Desember", short: "Des" },
] as const;

export const CATEGORY_LABELS: Record<SubscriptionCategory, string> = {
  utilitas: "Utilitas (Internet, Listrik, Air)",
  software: "Software & Teknologi (SaaS)",
  jasa: "Jasa & Outsourcing",
  perlengkapan: "Perlengkapan & Peralatan Kantor",
  properti: "Properti & Sewa Gedung",
  transportasi: "Transportasi & Kendaraan",
  karyawan: "SDM & Legalitas",
  pemasaran: "Pemasaran & Promosi",
  lainnya: "Lainnya",
};

export const CATEGORY_COLORS: Record<SubscriptionCategory, string> = {
  utilitas: "bg-blue-100 text-blue-700",
  software: "bg-purple-100 text-purple-700",
  jasa: "bg-cyan-100 text-cyan-700",
  perlengkapan: "bg-amber-100 text-amber-700",
  properti: "bg-indigo-100 text-indigo-700",
  transportasi: "bg-orange-100 text-orange-700",
  karyawan: "bg-emerald-100 text-emerald-700",
  pemasaran: "bg-pink-100 text-pink-700",
  lainnya: "bg-gray-100 text-gray-700",
};

export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  aktif: "Aktif",
  tidak_aktif: "Tidak Aktif",
  selesai: "Selesai",
};

export const UNIT_OPTIONS = [
  "PLN Pusat",
  "PLN UP3 Jakarta Selatan",
  "PLN UP3 Bandung",
  "PLN UP3 Surabaya",
  "PLN UP3 Medan",
  "PLN UP3 Makassar",
  "PLN UP3 Tangerang",
  "PLN UP3 Bekasi",
];

// Utility functions
export function getMonthName(month: number): string {
  return MONTHS_ID.find((m) => m.value === month)?.name ?? "";
}

export function getMonthShort(month: number): string {
  return MONTHS_ID.find((m) => m.value === month)?.short ?? "";
}

export function formatCurrency(value: number): string {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)} M`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)} jt`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function formatPeriode(mulai: number, selesai: number): string {
  if (mulai === selesai) return `${mulai}`;
  return `${mulai} - ${selesai}`;
}

// Hitung gap months
export function calculateGapMonths(payments: MonthlyPayment[], year: number): number[] {
  const yearPayments = payments
    .filter((p) => p.tahun === year)
    .sort((a, b) => a.bulan - b.bulan);

  // Cari bulan PAID terakhir
  let lastPaidMonth = 0;
  for (const payment of yearPayments) {
    if (payment.status === "PAID") {
      lastPaidMonth = payment.bulan;
    }
  }

  if (lastPaidMonth === 0) return [];

  // Cari bulan UNPAID sebelum lastPaidMonth
  return yearPayments
    .filter((p) => p.status === "UNPAID" && p.bulan < lastPaidMonth)
    .map((p) => p.bulan);
}

// Convert payments ke yearly summary
export function getYearlyPaymentSummary(
  payments: MonthlyPayment[],
  year: number,
  anggaranPerBulan: number
): YearlyPaymentSummary {
  const yearPayments = payments
    .filter((p) => p.tahun === year)
    .sort((a, b) => a.bulan - b.bulan);

  const paidPayments = yearPayments.filter((p) => p.status === "PAID");
  const unpaidPayments = yearPayments.filter((p) => p.status === "UNPAID");
  const gapMonths = calculateGapMonths(payments, year);

  const allMonths: MonthDisplay[] = MONTHS_ID.map((m) => {
    const payment = yearPayments.find((p) => p.bulan === m.value);
    const isPaid = payment?.status === "PAID";
    return {
      month: m.value,
      monthName: m.name,
      monthShort: m.short,
      year,
      status: isPaid ? "PAID" : "UNPAID",
      isPaid,
      amount: payment?.jumlah_bayar ?? anggaranPerBulan,
      paidAt: payment?.tanggal_bayar,
    };
  });

  const totalPaidAmount = paidPayments.reduce(
    (sum, p) => sum + (p.jumlah_bayar ?? anggaranPerBulan),
    0
  );

  return {
    year,
    totalMonths: 12,
    paidMonths: paidPayments.length,
    unpaidMonths: unpaidPayments.length,
    paidPercentage: Math.round((paidPayments.length / 12) * 100),
    totalPaidAmount,
    hasGaps: gapMonths.length > 0,
    gapMonths,
    allMonths,
  };
}
