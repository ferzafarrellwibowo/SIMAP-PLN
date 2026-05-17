// ============================================
// MONTHLY PAYMENT STATUS TRACKING SYSTEM
// Untuk menandai status pembayaran bulanan dalam periode 1 tahun
// ============================================

// Types & Interfaces
// ============================================

export type PaymentStatus = "PAID" | "UNPAID";

export interface MonthlyPayment {
  id: string;
  contractId: string;          // ID kontrak/langganan
  month: number;               // 1-12
  year: number;                // Tahun pembayaran
  status: PaymentStatus;       // Status pembayaran
  amount?: number;             // Jumlah yang dibayar (optional)
  paidAt?: string;             // Tanggal pembayaran (ISO string)
  paidBy?: string;             // User yang melakukan pembayaran
  invoiceNumber?: string;      // Nomor invoice
  notes?: string;              // Catatan tambahan
  createdAt: string;
  updatedAt: string;
}

// Contract Payment Tracking - untuk list pembayaran per kontrak
export interface ContractPaymentTracking {
  id: string;
  contractId: string;
  noPerjanjian: string;
  judulPekerjaan: string;
  vendor: string;
  nilaiKontrak: number;
  nilaiPerBulan: number;         // Nilai per bulan (nilaiKontrak / 12 atau custom)
  year: number;
  unit: string;
  kategori: string;
  payments: MonthlyPayment[];
  // Calculated fields
  paidMonths: number;
  unpaidMonths: number;
  paidPercentage: number;
  totalPaidAmount: number;
  totalUnpaidAmount: number;
  hasGaps: boolean;              // Ada bulan terlewat
  gapMonthNumbers: number[];     // Nomor bulan yang terlewat
  createdAt: string;
  updatedAt: string;
}

// Untuk display di UI
export interface MonthlyPaymentDisplay {
  month: number;
  monthName: string;
  monthShort: string;
  year: number;
  status: PaymentStatus;
  isPaid: boolean;
  amount?: number;
  paidAt?: string;
  badgeVariant: "success" | "danger" | "warning" | "default";
  statusLabel: string;
}

// Summary untuk dashboard
export interface PaymentSummary {
  year: number;
  totalMonths: number;
  paidMonths: number;
  unpaidMonths: number;
  paidPercentage: number;
  totalPaidAmount: number;
  paidMonthsList: MonthlyPaymentDisplay[];
  unpaidMonthsList: MonthlyPaymentDisplay[];
  allMonths: MonthlyPaymentDisplay[];
  hasGapsInPayment: boolean;  // Ada bulan unpaid sebelum bulan paid
  gapMonths: MonthlyPaymentDisplay[]; // Bulan-bulan yang terlewat
}

// Constants
// ============================================

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

// Utility Functions
// ============================================

/**
 * Mendapatkan nama bulan berdasarkan nomor bulan
 */
export function getMonthName(month: number): string {
  const monthData = MONTHS_ID.find((m) => m.value === month);
  return monthData?.name ?? "";
}

/**
 * Mendapatkan nama singkat bulan
 */
export function getMonthShort(month: number): string {
  const monthData = MONTHS_ID.find((m) => m.value === month);
  return monthData?.short ?? "";
}

/**
 * Inisialisasi data pembayaran untuk 1 tahun (12 bulan)
 * Semua bulan diset ke UNPAID secara default
 */
export function initializeYearlyPayments(
  contractId: string,
  year: number
): MonthlyPayment[] {
  const now = new Date().toISOString();
  
  return MONTHS_ID.map((month) => ({
    id: `${contractId}-${year}-${month.value.toString().padStart(2, "0")}`,
    contractId,
    month: month.value,
    year,
    status: "UNPAID" as PaymentStatus,
    createdAt: now,
    updatedAt: now,
  }));
}

/**
 * Mengubah status pembayaran bulan tertentu
 */
export function updatePaymentStatus(
  payments: MonthlyPayment[],
  month: number,
  year: number,
  status: PaymentStatus,
  additionalData?: Partial<MonthlyPayment>
): MonthlyPayment[] {
  return payments.map((payment) => {
    if (payment.month === month && payment.year === year) {
      return {
        ...payment,
        status,
        paidAt: status === "PAID" ? new Date().toISOString() : undefined,
        updatedAt: new Date().toISOString(),
        ...additionalData,
      };
    }
    return payment;
  });
}

/**
 * Menandai beberapa bulan sekaligus sebagai PAID
 */
export function markMonthsAsPaid(
  payments: MonthlyPayment[],
  monthsToMark: number[],
  year: number,
  additionalData?: Partial<MonthlyPayment>
): MonthlyPayment[] {
  return payments.map((payment) => {
    if (monthsToMark.includes(payment.month) && payment.year === year) {
      return {
        ...payment,
        status: "PAID",
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...additionalData,
      };
    }
    return payment;
  });
}

/**
 * Convert MonthlyPayment ke format display untuk UI
 */
export function toPaymentDisplay(payment: MonthlyPayment): MonthlyPaymentDisplay {
  const isPaid = payment.status === "PAID";
  
  return {
    month: payment.month,
    monthName: getMonthName(payment.month),
    monthShort: getMonthShort(payment.month),
    year: payment.year,
    status: payment.status,
    isPaid,
    amount: payment.amount,
    paidAt: payment.paidAt,
    badgeVariant: isPaid ? "success" : "danger",
    statusLabel: isPaid ? "Lunas" : "Belum Bayar",
  };
}

/**
 * Mendapatkan daftar bulan yang sudah dibayar
 */
export function getPaidMonths(payments: MonthlyPayment[]): MonthlyPaymentDisplay[] {
  return payments
    .filter((p) => p.status === "PAID")
    .sort((a, b) => a.month - b.month)
    .map(toPaymentDisplay);
}

/**
 * Mendapatkan daftar bulan yang belum dibayar
 */
export function getUnpaidMonths(payments: MonthlyPayment[]): MonthlyPaymentDisplay[] {
  return payments
    .filter((p) => p.status === "UNPAID")
    .sort((a, b) => a.month - b.month)
    .map(toPaymentDisplay);
}

/**
 * Mendapatkan bulan-bulan yang terlewat (gap)
 * Yaitu bulan UNPAID yang ada sebelum bulan PAID terakhir
 */
export function getGapMonths(payments: MonthlyPayment[]): MonthlyPaymentDisplay[] {
  const sortedPayments = [...payments].sort((a, b) => a.month - b.month);
  
  // Cari bulan PAID terakhir
  let lastPaidMonth = 0;
  for (const payment of sortedPayments) {
    if (payment.status === "PAID") {
      lastPaidMonth = payment.month;
    }
  }
  
  // Jika tidak ada yang PAID, tidak ada gap
  if (lastPaidMonth === 0) {
    return [];
  }
  
  // Cari bulan UNPAID sebelum lastPaidMonth
  return sortedPayments
    .filter((p) => p.status === "UNPAID" && p.month < lastPaidMonth)
    .map(toPaymentDisplay);
}

/**
 * Cek apakah ada gap dalam pembayaran
 */
export function hasPaymentGaps(payments: MonthlyPayment[]): boolean {
  return getGapMonths(payments).length > 0;
}

/**
 * Mendapatkan summary lengkap pembayaran dalam 1 tahun
 */
export function getPaymentSummary(
  payments: MonthlyPayment[],
  year: number
): PaymentSummary {
  const yearPayments = payments.filter((p) => p.year === year);
  const sortedPayments = [...yearPayments].sort((a, b) => a.month - b.month);
  
  const paidMonths = getPaidMonths(sortedPayments);
  const unpaidMonths = getUnpaidMonths(sortedPayments);
  const gapMonths = getGapMonths(sortedPayments);
  
  const totalPaidAmount = yearPayments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + (p.amount ?? 0), 0);
  
  return {
    year,
    totalMonths: 12,
    paidMonths: paidMonths.length,
    unpaidMonths: unpaidMonths.length,
    paidPercentage: Math.round((paidMonths.length / 12) * 100),
    totalPaidAmount,
    paidMonthsList: paidMonths,
    unpaidMonthsList: unpaidMonths,
    allMonths: sortedPayments.map(toPaymentDisplay),
    hasGapsInPayment: gapMonths.length > 0,
    gapMonths,
  };
}

/**
 * Validasi apakah semua bulan dalam range sudah dibayar
 */
export function validatePaymentRange(
  payments: MonthlyPayment[],
  fromMonth: number,
  toMonth: number,
  year: number
): { isValid: boolean; unpaidInRange: MonthlyPaymentDisplay[] } {
  const yearPayments = payments.filter((p) => p.year === year);
  const rangePayments = yearPayments.filter(
    (p) => p.month >= fromMonth && p.month <= toMonth
  );
  
  const unpaidInRange = rangePayments
    .filter((p) => p.status === "UNPAID")
    .map(toPaymentDisplay);
  
  return {
    isValid: unpaidInRange.length === 0,
    unpaidInRange,
  };
}

/**
 * Mendapatkan bulan berikutnya yang harus dibayar
 */
export function getNextUnpaidMonth(
  payments: MonthlyPayment[],
  year: number
): MonthlyPaymentDisplay | null {
  const sortedPayments = payments
    .filter((p) => p.year === year && p.status === "UNPAID")
    .sort((a, b) => a.month - b.month);
  
  if (sortedPayments.length === 0) {
    return null;
  }
  
  return toPaymentDisplay(sortedPayments[0]);
}

/**
 * Format bulan dan tahun untuk display
 */
export function formatMonthYear(month: number, year: number): string {
  return `${getMonthName(month)} ${year}`;
}

/**
 * Format range bulan untuk display
 */
export function formatMonthRange(
  fromMonth: number,
  toMonth: number,
  year: number
): string {
  if (fromMonth === toMonth) {
    return formatMonthYear(fromMonth, year);
  }
  return `${getMonthShort(fromMonth)} - ${getMonthShort(toMonth)} ${year}`;
}

// ============================================
// CONTOH DATA / MOCK DATA
// ============================================

/**
 * Contoh penggunaan dan data untuk testing
 */
export function getExamplePaymentData(): {
  payments: MonthlyPayment[];
  summary: PaymentSummary;
} {
  const contractId = "CONTRACT-001";
  const year = 2026;
  
  // Inisialisasi 12 bulan
  let payments = initializeYearlyPayments(contractId, year);
  
  // Simulasi: Jan, Feb, Mar, Jun, Jul sudah dibayar
  // April, Mei belum (ini gap)
  payments = markMonthsAsPaid(payments, [1, 2, 3, 6, 7], year, {
    amount: 1000000,
    invoiceNumber: "INV-2026-001",
  });
  
  const summary = getPaymentSummary(payments, year);
  
  return { payments, summary };
}

// ============================================
// TYPE GUARDS
// ============================================

export function isMonthlyPayment(obj: unknown): obj is MonthlyPayment {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "month" in obj &&
    "year" in obj &&
    "status" in obj
  );
}

export function isValidMonth(month: number): boolean {
  return month >= 1 && month <= 12;
}

export function isValidPaymentStatus(status: string): status is PaymentStatus {
  return status === "PAID" || status === "UNPAID";
}

// ============================================
// GENERATE MOCK CONTRACT PAYMENT TRACKING
// ============================================

/**
 * Generate mock payment tracking data untuk semua kontrak
 */
export function generateMockPaymentTrackings(contracts: Array<{
  id: string;
  noPerjanjian: string;
  judulPekerjaan: string;
  vendor: string;
  nilaiKontrak: number;
  unit: string;
  kategori: string;
}>): ContractPaymentTracking[] {
  const year = 2026;
  const now = new Date().toISOString();
  
  return contracts.map((contract, index) => {
    const nilaiPerBulan = Math.round(contract.nilaiKontrak / 12);
    let payments = initializeYearlyPayments(contract.id, year);
    
    // Generate random paid months pattern
    const paidMonthsPattern = generateRandomPaidPattern(index);
    payments = payments.map((p) => {
      if (paidMonthsPattern.includes(p.month)) {
        return {
          ...p,
          status: "PAID" as PaymentStatus,
          amount: nilaiPerBulan,
          paidAt: new Date(year, p.month - 1, 15).toISOString(),
          invoiceNumber: `INV-${year}-${contract.id.slice(-3)}-${p.month.toString().padStart(2, "0")}`,
          updatedAt: now,
        };
      }
      return p;
    });
    
    const summary = getPaymentSummary(payments, year);
    const gapMonths = getGapMonths(payments);
    
    return {
      id: `PAY-${contract.id}`,
      contractId: contract.id,
      noPerjanjian: contract.noPerjanjian,
      judulPekerjaan: contract.judulPekerjaan || "-",
      vendor: contract.vendor || "-",
      nilaiKontrak: contract.nilaiKontrak || 0,
      nilaiPerBulan,
      year,
      unit: contract.unit,
      kategori: contract.kategori,
      payments,
      paidMonths: summary.paidMonths,
      unpaidMonths: summary.unpaidMonths,
      paidPercentage: summary.paidPercentage,
      totalPaidAmount: summary.totalPaidAmount,
      totalUnpaidAmount: (12 - summary.paidMonths) * nilaiPerBulan,
      hasGaps: summary.hasGapsInPayment,
      gapMonthNumbers: gapMonths.map((g) => g.month),
      createdAt: now,
      updatedAt: now,
    };
  });
}

/**
 * Generate random pattern of paid months
 */
function generateRandomPaidPattern(seed: number): number[] {
  // Different patterns based on seed
  const patterns = [
    [1, 2, 3, 4, 5],                    // Jan-Mei paid
    [1, 2, 3, 6, 7],                    // Gap di Apr-Mei
    [1, 2, 3, 4, 5, 6, 7, 8],           // Jan-Agu paid
    [1, 2, 4, 5, 6],                    // Gap di Mar
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],    // Almost complete
    [1, 2, 3],                          // Only Q1
    [1, 2, 3, 4, 5, 6],                 // Half year
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], // Full year (complete)
    [1, 3, 5, 7, 9],                    // Multiple gaps
    [1, 2, 5, 6, 7],                    // Gap Q1-Q2
    [1, 2, 3, 4],                       // Q1 + April
    [1, 2, 3, 4, 5, 7, 8],              // Gap Juni
    [1, 2, 3, 4, 5, 6, 7],              // Jan-Juli
    [1, 2],                             // Only 2 months
  ];
  
  return patterns[seed % patterns.length];
}

/**
 * Create ContractPaymentTracking from contract data
 */
export function createPaymentTrackingFromContract(
  contract: {
    id: string;
    noPerjanjian: string;
    judulPekerjaan: string;
    vendor: string;
    nilaiKontrak: number;
    unit: string;
    kategori: string;
  },
  year: number = 2026,
  initialPaidMonths: number[] = []
): ContractPaymentTracking {
  const now = new Date().toISOString();
  const nilaiPerBulan = Math.round(contract.nilaiKontrak / 12);
  
  let payments = initializeYearlyPayments(contract.id, year);
  
  if (initialPaidMonths.length > 0) {
    payments = markMonthsAsPaid(payments, initialPaidMonths, year, {
      amount: nilaiPerBulan,
    });
  }
  
  const summary = getPaymentSummary(payments, year);
  const gapMonths = getGapMonths(payments);
  
  return {
    id: `PAY-${contract.id}`,
    contractId: contract.id,
    noPerjanjian: contract.noPerjanjian,
    judulPekerjaan: contract.judulPekerjaan || "-",
    vendor: contract.vendor || "-",
    nilaiKontrak: contract.nilaiKontrak || 0,
    nilaiPerBulan,
    year,
    unit: contract.unit,
    kategori: contract.kategori,
    payments,
    paidMonths: summary.paidMonths,
    unpaidMonths: summary.unpaidMonths,
    paidPercentage: summary.paidPercentage,
    totalPaidAmount: summary.totalPaidAmount,
    totalUnpaidAmount: (12 - summary.paidMonths) * nilaiPerBulan,
    hasGaps: summary.hasGapsInPayment,
    gapMonthNumbers: gapMonths.map((g) => g.month),
    createdAt: now,
    updatedAt: now,
  };
}
