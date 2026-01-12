// ============================================
// EXPORT UTILITIES - PDF & Excel Export
// ============================================

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { formatCurrency } from "./utils";
import type { Project, ProjectMetrics } from "./types";

// Types for export data
interface ExportProjectData {
  project: Project;
  metrics?: ProjectMetrics;
}

interface SummaryStats {
  total: number;
  onProgress: number;
  completed: number;
  problematic: number;
  totalBudget: number;
  totalSpent: number;
  avgSPI: number;
  avgCPI: number;
  budgetUtilization: number;
}

type ReportType = "summary" | "progress" | "budget" | "problems";

// ============================================
// PDF EXPORT
// ============================================

export function exportToPDF(
  reportType: ReportType,
  projects: ExportProjectData[],
  stats: SummaryStats,
  filters: { unit: string; status: string }
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PT PLN (Persero)", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.text("Laporan Monitoring Proyek & Anggaran", pageWidth / 2, 28, { align: "center" });
  
  // Report title based on type
  const reportTitles: Record<ReportType, string> = {
    summary: "Ringkasan Eksekutif",
    progress: "Progress Proyek",
    budget: "Serapan Anggaran",
    problems: "Proyek Bermasalah",
  };
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Jenis Laporan: ${reportTitles[reportType]}`, 14, 40);
  doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  })}`, 14, 47);
  
  if (filters.unit !== "all") {
    doc.text(`Unit: ${filters.unit}`, 14, 54);
  }
  if (filters.status !== "all") {
    doc.text(`Status: ${filters.status}`, 14, 61);
  }

  let startY = filters.unit !== "all" || filters.status !== "all" ? 70 : 56;

  // Content based on report type
  switch (reportType) {
    case "summary":
      generateSummaryPDF(doc, stats, startY);
      break;
    case "progress":
      generateProgressPDF(doc, projects, startY);
      break;
    case "budget":
      generateBudgetPDF(doc, projects, stats, startY);
      break;
    case "problems":
      generateProblemsPDF(doc, projects, startY);
      break;
  }

  // Footer
  const pageCount = doc.internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Halaman ${i} dari ${pageCount} | Dicetak pada ${new Date().toLocaleString("id-ID")}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  // Save
  const fileName = `Laporan_${reportTitles[reportType].replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

function generateSummaryPDF(doc: jsPDF, stats: SummaryStats, startY: number) {
  // Summary cards data
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Proyek", 14, startY);
  
  autoTable(doc, {
    startY: startY + 5,
    head: [["Indikator", "Nilai"]],
    body: [
      ["Total Proyek", stats.total.toString()],
      ["Sedang Berjalan", stats.onProgress.toString()],
      ["Selesai", stats.completed.toString()],
      ["Bermasalah", stats.problematic.toString()],
    ],
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
  });

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // Budget summary
  doc.setFont("helvetica", "bold");
  doc.text("Ringkasan Anggaran", 14, finalY + 15);

  autoTable(doc, {
    startY: finalY + 20,
    head: [["Indikator", "Nilai"]],
    body: [
      ["Pagu", formatCurrencyShort(stats.totalBudget)],
      ["Serapan", formatCurrencyShort(stats.totalSpent)],
      ["Utilisasi Anggaran", `${stats.budgetUtilization.toFixed(1)}%`],
    ],
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129] },
  });

  const finalY2 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // Performance metrics
  doc.setFont("helvetica", "bold");
  doc.text("Performa Proyek", 14, finalY2 + 15);

  autoTable(doc, {
    startY: finalY2 + 20,
    head: [["Indikator", "Nilai", "Status"]],
    body: [
      ["Schedule Performance Index (SPI)", stats.avgSPI.toFixed(2), getSPIStatus(stats.avgSPI)],
      ["Cost Performance Index (CPI)", stats.avgCPI.toFixed(2), getCPIStatus(stats.avgCPI)],
    ],
    theme: "grid",
    headStyles: { fillColor: [245, 158, 11] },
  });
}

function generateProgressPDF(doc: jsPDF, projects: ExportProjectData[], startY: number) {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Detail Progress Proyek", 14, startY);

  const tableData = projects.map((p) => [
    p.project.code,
    p.project.name.substring(0, 25) + (p.project.name.length > 25 ? "..." : ""),
    p.project.unit.replace("PLN ", ""),
    `${p.metrics?.plannedProgress.toFixed(0) || 0}%`,
    `${p.metrics?.actualProgress.toFixed(0) || 0}%`,
    `${((p.metrics?.actualProgress || 0) - (p.metrics?.plannedProgress || 0)).toFixed(1)}%`,
    getHealthLabel(p.project.healthStatus),
  ]);

  autoTable(doc, {
    startY: startY + 5,
    head: [["Kode", "Nama Proyek", "Unit", "Rencana", "Realisasi", "Deviasi", "Status"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 45 },
      2: { cellWidth: 30 },
      3: { cellWidth: 18 },
      4: { cellWidth: 18 },
      5: { cellWidth: 18 },
      6: { cellWidth: 25 },
    },
  });
}

function generateBudgetPDF(doc: jsPDF, projects: ExportProjectData[], stats: SummaryStats, startY: number) {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Serapan Anggaran per Proyek", 14, startY);

  const tableData = projects.map((p) => {
    const spent = p.metrics?.actualCost || 0;
    const utilization = p.project.estimatedBudget > 0 
      ? (spent / p.project.estimatedBudget) * 100 
      : 0;
    
    return [
      p.project.code,
      p.project.name.substring(0, 25) + (p.project.name.length > 25 ? "..." : ""),
      formatCurrencyShort(p.project.estimatedBudget),
      formatCurrencyShort(spent),
      formatCurrencyShort(p.project.estimatedBudget - spent),
      `${utilization.toFixed(1)}%`,
    ];
  });

  autoTable(doc, {
    startY: startY + 5,
    head: [["Kode", "Nama Proyek", "Anggaran", "Terpakai", "Sisa", "Utilisasi"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [16, 185, 129], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
  });

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  // Total row
  autoTable(doc, {
    startY: finalY,
    body: [[
      "",
      "TOTAL",
      formatCurrencyShort(stats.totalBudget),
      formatCurrencyShort(stats.totalSpent),
      formatCurrencyShort(stats.totalBudget - stats.totalSpent),
      `${stats.budgetUtilization.toFixed(1)}%`,
    ]],
    theme: "grid",
    bodyStyles: { fontSize: 8, fontStyle: "bold" },
  });
}

function generateProblemsPDF(doc: jsPDF, projects: ExportProjectData[], startY: number) {
  const problematicProjects = projects.filter(
    (p) => p.project.healthStatus === "red" || p.project.healthStatus === "yellow"
  );

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(`Proyek Bermasalah (${problematicProjects.length} proyek)`, 14, startY);

  if (problematicProjects.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.text("Tidak ada proyek bermasalah.", 14, startY + 10);
    return;
  }

  const tableData = problematicProjects.map((p) => {
    const deviation = (p.metrics?.actualProgress || 0) - (p.metrics?.plannedProgress || 0);
    return [
      p.project.code,
      p.project.name.substring(0, 25) + (p.project.name.length > 25 ? "..." : ""),
      p.project.unit.replace("PLN ", ""),
      getHealthLabel(p.project.healthStatus),
      `${deviation.toFixed(1)}%`,
      p.metrics?.healthReason || "-",
    ];
  });

  autoTable(doc, {
    startY: startY + 5,
    head: [["Kode", "Nama Proyek", "Unit", "Status", "Deviasi", "Alasan"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [239, 68, 68], fontSize: 8 },
    bodyStyles: { fontSize: 7 },
  });
}

// ============================================
// EXCEL EXPORT
// ============================================

export function exportToExcel(
  reportType: ReportType,
  projects: ExportProjectData[],
  stats: SummaryStats,
  filters: { unit: string; status: string }
) {
  const wb = XLSX.utils.book_new();
  
  const reportTitles: Record<ReportType, string> = {
    summary: "Ringkasan Eksekutif",
    progress: "Progress Proyek",
    budget: "Serapan Anggaran",
    problems: "Proyek Bermasalah",
  };

  switch (reportType) {
    case "summary":
      generateSummaryExcel(wb, stats, filters);
      break;
    case "progress":
      generateProgressExcel(wb, projects, filters);
      break;
    case "budget":
      generateBudgetExcel(wb, projects, stats, filters);
      break;
    case "problems":
      generateProblemsExcel(wb, projects, filters);
      break;
  }

  // Generate buffer and save
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const fileName = `Laporan_${reportTitles[reportType].replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  saveAs(blob, fileName);
}

function generateSummaryExcel(wb: XLSX.WorkBook, stats: SummaryStats, filters: { unit: string; status: string }) {
  // Summary sheet
  const summaryData = [
    ["LAPORAN RINGKASAN EKSEKUTIF"],
    ["PT PLN (Persero)"],
    [""],
    ["Tanggal", new Date().toLocaleDateString("id-ID")],
    ["Unit", filters.unit === "all" ? "Semua Unit" : filters.unit],
    ["Status", filters.status === "all" ? "Semua Status" : filters.status],
    [""],
    ["RINGKASAN PROYEK"],
    ["Indikator", "Nilai"],
    ["Total Proyek", stats.total],
    ["Sedang Berjalan", stats.onProgress],
    ["Selesai", stats.completed],
    ["Bermasalah", stats.problematic],
    [""],
    ["RINGKASAN ANGGARAN"],
    ["Indikator", "Nilai"],
    ["Pagu", stats.totalBudget],
    ["Serapan", stats.totalSpent],
    ["Sisa Anggaran", stats.totalBudget - stats.totalSpent],
    ["Utilisasi (%)", stats.budgetUtilization.toFixed(1)],
    [""],
    ["PERFORMA PROYEK"],
    ["Indikator", "Nilai", "Status"],
    ["SPI Rata-rata", stats.avgSPI.toFixed(2), getSPIStatus(stats.avgSPI)],
    ["CPI Rata-rata", stats.avgCPI.toFixed(2), getCPIStatus(stats.avgCPI)],
  ];

  const ws = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Set column widths
  ws["!cols"] = [{ wch: 25 }, { wch: 20 }, { wch: 20 }];
  
  XLSX.utils.book_append_sheet(wb, ws, "Ringkasan");
}

function generateProgressExcel(wb: XLSX.WorkBook, projects: ExportProjectData[], filters: { unit: string; status: string }) {
  const headerData = [
    ["LAPORAN PROGRESS PROYEK"],
    ["PT PLN (Persero)"],
    [""],
    ["Tanggal", new Date().toLocaleDateString("id-ID")],
    ["Unit", filters.unit === "all" ? "Semua Unit" : filters.unit],
    [""],
  ];

  const tableHeader = ["Kode", "Nama Proyek", "Unit", "Lokasi", "PIC", "Status", "Health", "Progress Rencana (%)", "Progress Aktual (%)", "Deviasi (%)", "SPI", "Tanggal Mulai", "Tanggal Selesai"];
  
  const tableData = projects.map((p) => [
    p.project.code,
    p.project.name,
    p.project.unit,
    p.project.location,
    p.project.picName,
    getStatusLabel(p.project.status),
    getHealthLabel(p.project.healthStatus),
    p.metrics?.plannedProgress.toFixed(1) || 0,
    p.metrics?.actualProgress.toFixed(1) || 0,
    ((p.metrics?.actualProgress || 0) - (p.metrics?.plannedProgress || 0)).toFixed(1),
    p.metrics?.spiValue.toFixed(2) || "-",
    p.project.targetStartDate,
    p.project.targetEndDate,
  ]);

  const allData = [...headerData, tableHeader, ...tableData];
  const ws = XLSX.utils.aoa_to_sheet(allData);
  
  ws["!cols"] = [
    { wch: 15 }, { wch: 35 }, { wch: 25 }, { wch: 15 }, { wch: 20 },
    { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
    { wch: 8 }, { wch: 12 }, { wch: 12 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Progress");
}

function generateBudgetExcel(wb: XLSX.WorkBook, projects: ExportProjectData[], stats: SummaryStats, filters: { unit: string; status: string }) {
  const headerData = [
    ["LAPORAN SERAPAN ANGGARAN"],
    ["PT PLN (Persero)"],
    [""],
    ["Tanggal", new Date().toLocaleDateString("id-ID")],
    ["Unit", filters.unit === "all" ? "Semua Unit" : filters.unit],
    [""],
  ];

  const tableHeader = ["Kode", "Nama Proyek", "Unit", "Pagu (Rp)", "Serapan (Rp)", "Sisa (Rp)", "Utilisasi (%)", "CPI", "Status Biaya"];
  
  const tableData = projects.map((p) => {
    const spent = p.metrics?.actualCost || 0;
    const remaining = p.project.estimatedBudget - spent;
    const utilization = p.project.estimatedBudget > 0 ? (spent / p.project.estimatedBudget) * 100 : 0;
    
    return [
      p.project.code,
      p.project.name,
      p.project.unit,
      p.project.estimatedBudget,
      spent,
      remaining,
      utilization.toFixed(1),
      p.metrics?.cpiValue.toFixed(2) || "-",
      getCPIStatus(p.metrics?.cpiValue || 1),
    ];
  });

  // Add total row
  const totalRow = [
    "",
    "TOTAL",
    "",
    stats.totalBudget,
    stats.totalSpent,
    stats.totalBudget - stats.totalSpent,
    stats.budgetUtilization.toFixed(1),
    "",
    "",
  ];

  const allData = [...headerData, tableHeader, ...tableData, totalRow];
  const ws = XLSX.utils.aoa_to_sheet(allData);
  
  ws["!cols"] = [
    { wch: 15 }, { wch: 35 }, { wch: 25 }, { wch: 18 }, { wch: 18 },
    { wch: 18 }, { wch: 12 }, { wch: 8 }, { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Anggaran");
}

function generateProblemsExcel(wb: XLSX.WorkBook, projects: ExportProjectData[], filters: { unit: string; status: string }) {
  const problematicProjects = projects.filter(
    (p) => p.project.healthStatus === "red" || p.project.healthStatus === "yellow"
  );

  const headerData = [
    ["LAPORAN PROYEK BERMASALAH"],
    ["PT PLN (Persero)"],
    [""],
    ["Tanggal", new Date().toLocaleDateString("id-ID")],
    ["Unit", filters.unit === "all" ? "Semua Unit" : filters.unit],
    ["Total Proyek Bermasalah", problematicProjects.length],
    [""],
  ];

  const tableHeader = ["Kode", "Nama Proyek", "Unit", "Lokasi", "PIC", "Status Kesehatan", "Deviasi Progress (%)", "SPI", "CPI", "Alasan"];
  
  const tableData = problematicProjects.map((p) => {
    const deviation = (p.metrics?.actualProgress || 0) - (p.metrics?.plannedProgress || 0);
    return [
      p.project.code,
      p.project.name,
      p.project.unit,
      p.project.location,
      p.project.picName,
      getHealthLabel(p.project.healthStatus),
      deviation.toFixed(1),
      p.metrics?.spiValue.toFixed(2) || "-",
      p.metrics?.cpiValue.toFixed(2) || "-",
      p.metrics?.healthReason || "-",
    ];
  });

  const allData = [...headerData, tableHeader, ...tableData];
  const ws = XLSX.utils.aoa_to_sheet(allData);
  
  ws["!cols"] = [
    { wch: 15 }, { wch: 35 }, { wch: 25 }, { wch: 15 }, { wch: 20 },
    { wch: 18 }, { wch: 18 }, { wch: 8 }, { wch: 8 }, { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Bermasalah");
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrencyShort(value: number): string {
  if (value >= 1_000_000_000_000) {
    return `Rp ${(value / 1_000_000_000_000).toFixed(1)} T`;
  } else if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  } else if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)} Jt`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function getSPIStatus(spi: number): string {
  if (spi >= 1) return "Sesuai Jadwal";
  if (spi >= 0.9) return "Sedikit Terlambat";
  return "Terlambat";
}

function getCPIStatus(cpi: number): string {
  if (cpi >= 1) return "Efisien";
  if (cpi >= 0.9) return "Cukup Efisien";
  return "Tidak Efisien";
}

function getHealthLabel(health: string): string {
  const labels: Record<string, string> = {
    green: "Sehat",
    yellow: "Perlu Perhatian",
    red: "Kritis",
  };
  return labels[health] || health;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Draft",
    initiated: "Initiated",
    planned: "Planned",
    on_progress: "On Progress",
    on_hold: "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

// ============================================
// EXPORT ALL REPORTS
// ============================================

function addAllReportsHeader(doc: jsPDF, title: string, filters: { unit: string; status: string }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PT PLN (Persero)", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(14);
  doc.text("Laporan Monitoring Proyek & Anggaran", pageWidth / 2, 28, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  })}`, 14, 40);
  
  if (filters.unit !== "all") {
    doc.text(`Unit: ${filters.unit}`, 14, 46);
  }
  if (filters.status !== "all") {
    doc.text(`Status: ${filters.status}`, 14, filters.unit !== "all" ? 52 : 46);
  }
}

export function exportAllToPDF(
  projects: ExportProjectData[],
  stats: SummaryStats,
  filters: { unit: string; status: string }
) {
  const doc = new jsPDF();
  
  // Page 1: Summary
  addAllReportsHeader(doc, "Laporan Lengkap - Semua Laporan", filters);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("1. RINGKASAN EKSEKUTIF", 14, 55);
  generateSummaryPDF(doc, stats, 62);
  
  // Page 2: Progress
  doc.addPage();
  addAllReportsHeader(doc, "Laporan Lengkap - Semua Laporan", filters);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("2. PROGRESS PROYEK", 14, 55);
  generateProgressPDF(doc, projects, 62);
  
  // Page 3: Budget
  doc.addPage();
  addAllReportsHeader(doc, "Laporan Lengkap - Semua Laporan", filters);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("3. SERAPAN ANGGARAN", 14, 55);
  generateBudgetPDF(doc, projects, stats, 62);
  
  // Page 4: Problems
  doc.addPage();
  addAllReportsHeader(doc, "Laporan Lengkap - Semua Laporan", filters);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("4. PROYEK BERMASALAH", 14, 55);
  generateProblemsPDF(doc, projects, 62);
  
  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Halaman ${i} dari ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  const fileName = `Laporan_Lengkap_Semua_Laporan_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

export function exportAllToExcel(
  projects: ExportProjectData[],
  stats: SummaryStats,
  filters: { unit: string; status: string }
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  generateSummaryExcel(wb, stats, filters);
  
  // Sheet 2: Progress
  generateProgressExcel(wb, projects, filters);
  
  // Sheet 3: Budget
  generateBudgetExcel(wb, projects, stats, filters);
  
  // Sheet 4: Problems
  generateProblemsExcel(wb, projects, filters);

  // Generate buffer and save
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/octet-stream" });
  const fileName = `Laporan_Lengkap_Semua_Laporan_${new Date().toISOString().split("T")[0]}.xlsx`;
  saveAs(blob, fileName);
}
