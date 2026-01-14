// ============================================
// CONTRACT STATUS CALCULATION UTILITY
// ============================================
// Menghitung status kontrak secara dinamis berdasarkan:
// - "Aktif": belum lewat tanggal selesai kontrak
// - "Bermasalah": 
//   * Mendekati tanggal selesai (1 bulan sebelum) DAN progress < 50%
//   * ATAU sudah melewati tanggal selesai DAN progress < 100%
// - "Selesai": progress pekerjaan sudah 100%
// ============================================

import type { ContractStatus } from "./types-new";

export interface ContractForStatusCalculation {
  tanggalBerakhir: string;
  progressPekerjaan: number;
}

/**
 * Menghitung status kontrak berdasarkan tanggal berakhir dan progress pekerjaan.
 * 
 * Aturan:
 * 1. "Selesai" - progress pekerjaan sudah 100%
 * 2. "Bermasalah" - salah satu dari kondisi berikut:
 *    - Mendekati tanggal selesai (1 bulan sebelum) DAN progress < 50%
 *    - Sudah melewati tanggal selesai DAN progress < 100%
 * 3. "Aktif" - belum lewat tanggal selesai kontrak (dan tidak bermasalah)
 * 
 * @param contract - Objek kontrak dengan tanggalBerakhir dan progressPekerjaan
 * @param currentDate - Tanggal saat ini (opsional, default: new Date())
 * @returns ContractStatus - "aktif" | "selesai" | "bermasalah"
 */
export function calculateContractStatus(
  contract: ContractForStatusCalculation,
  currentDate: Date = new Date()
): ContractStatus {
  const { tanggalBerakhir, progressPekerjaan } = contract;
  
  // Parse tanggal berakhir
  const endDate = new Date(tanggalBerakhir);
  
  // Hitung 1 bulan sebelum tanggal berakhir
  const oneMonthBeforeEnd = new Date(endDate);
  oneMonthBeforeEnd.setMonth(oneMonthBeforeEnd.getMonth() - 1);
  
  // Normalize progress (pastikan 0-100)
  const normalizedProgress = Math.min(Math.max(progressPekerjaan || 0, 0), 100);
  
  // RULE 1: Jika progress sudah 100%, status = "selesai"
  if (normalizedProgress >= 100) {
    return "selesai";
  }
  
  // RULE 2: Cek kondisi "bermasalah"
  const isPastEndDate = currentDate > endDate;
  const isApproachingEnd = currentDate >= oneMonthBeforeEnd && currentDate <= endDate;
  
  // Kondisi 2a: Sudah melewati tanggal selesai DAN progress < 100%
  if (isPastEndDate && normalizedProgress < 100) {
    return "bermasalah";
  }
  
  // Kondisi 2b: Mendekati tanggal selesai (1 bulan sebelum) DAN progress < 50%
  if (isApproachingEnd && normalizedProgress < 50) {
    return "bermasalah";
  }
  
  // RULE 3: Jika tidak memenuhi kondisi di atas, status = "aktif"
  return "aktif";
}

/**
 * Format status label untuk ditampilkan ke user
 */
export function getStatusLabel(status: ContractStatus): string {
  const labels: Record<ContractStatus, string> = {
    aktif: "Aktif",
    selesai: "Selesai", 
    bermasalah: "Bermasalah",
  };
  return labels[status];
}

/**
 * Mendapatkan deskripsi alasan status untuk tooltip/info
 */
export function getStatusReason(
  contract: ContractForStatusCalculation,
  currentDate: Date = new Date()
): string {
  const { tanggalBerakhir, progressPekerjaan } = contract;
  const endDate = new Date(tanggalBerakhir);
  const oneMonthBeforeEnd = new Date(endDate);
  oneMonthBeforeEnd.setMonth(oneMonthBeforeEnd.getMonth() - 1);
  
  const normalizedProgress = Math.min(Math.max(progressPekerjaan || 0, 0), 100);
  const isPastEndDate = currentDate > endDate;
  const isApproachingEnd = currentDate >= oneMonthBeforeEnd && currentDate <= endDate;
  
  if (normalizedProgress >= 100) {
    return "Pekerjaan telah selesai 100%";
  }
  
  if (isPastEndDate && normalizedProgress < 100) {
    const daysOverdue = Math.floor((currentDate.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24));
    return `Sudah melewati tanggal selesai (${daysOverdue} hari) dengan progress ${normalizedProgress.toFixed(1)}%`;
  }
  
  if (isApproachingEnd && normalizedProgress < 50) {
    const daysUntilEnd = Math.floor((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    return `Mendekati tanggal selesai (${daysUntilEnd} hari lagi) dengan progress hanya ${normalizedProgress.toFixed(1)}%`;
  }
  
  const daysUntilEnd = Math.floor((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
  return `Kontrak aktif, sisa ${daysUntilEnd} hari dengan progress ${normalizedProgress.toFixed(1)}%`;
}
