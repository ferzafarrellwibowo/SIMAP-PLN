import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Warna untuk kategori kontrak
const CONTRACT_CATEGORY_COLORS: Record<string, [number, number, number]> = {
  investasi: [139, 92, 246],      // violet
  pemeliharaan: [249, 115, 22],   // orange
  administrasi: [6, 182, 212],    // cyan
};

// Warna untuk kategori langganan  
const SUBSCRIPTION_CATEGORY_COLORS: Record<string, [number, number, number]> = {
  utilitas: [59, 130, 246],       // blue
  software: [168, 85, 247],       // purple
  jasa: [6, 182, 212],            // cyan
  perlengkapan: [245, 158, 11],   // amber
  properti: [99, 102, 241],       // indigo
  transportasi: [249, 115, 22],   // orange
  karyawan: [16, 185, 129],       // emerald
  pemasaran: [236, 72, 153],      // pink
  lainnya: [107, 114, 128],       // gray
};

interface ContractCategoryStats {
  kategori: string;
  label: string;
  totalKontrak: number;
  kontrakAktif: number;
  totalNilai: number;
  totalDibayar: number;
  sisaAnggaran: number;
  persentaseRealisasi: number;
  totalTagihan: number;
  tagihanDibayar: number;
  tagihanPending: number;
}

interface OverallContractStats {
  totalKontrak: number;
  kontrakAktif: number;
  totalNilai: number;
  totalDibayar: number;
  sisaAnggaran: number;
  persentaseRealisasi: number;
  totalTagihan: number;
  tagihanDibayar: number;
  tagihanPending: number;
}

interface SubscriptionCategoryStats {
  kategori: string;
  label: string;
  totalSubs: number;
  activeSubs: number;
  hasGaps: number;
  totalAnggaranBulanan: number;
  totalTerbayar: number;
  avgProgress: number;
}

interface OverallSubscriptionStats {
  totalSubs: number;
  activeSubs: number;
  totalTerbayar: number;
  totalGaps: number;
}

interface LaporanPDFData {
  contractStats: ContractCategoryStats[];
  overallContractStats: OverallContractStats;
  subscriptionStats: SubscriptionCategoryStats[];
  overallSubStats: OverallSubscriptionStats;
}

function formatCurrencyPDF(value: number): string {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(2)} M`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)} jt`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function drawBarChart(
  doc: jsPDF, 
  data: { label: string; pagu: number; realisasi: number; kategori: string }[],
  startX: number,
  startY: number,
  width: number,
  height: number,
  title: string,
  colorMap: Record<string, [number, number, number]>
) {
  // Title
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(title, startX, startY);
  
  const chartStartY = startY + 8;
  const chartHeight = height - 25;
  const barWidth = (width - 40) / (data.length * 2.5);
  const gapBetweenBars = 3;
  const gapBetweenGroups = barWidth * 0.8;
  
  // Find max value for scaling
  const maxValue = Math.max(...data.map(d => Math.max(d.pagu, d.realisasi)));
  const scale = chartHeight / maxValue;
  
  // Draw Y axis
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(startX, chartStartY, startX, chartStartY + chartHeight);
  
  // Draw X axis
  doc.line(startX, chartStartY + chartHeight, startX + width - 10, chartStartY + chartHeight);
  
  // Draw Y axis labels
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  
  const ySteps = 5;
  for (let i = 0; i <= ySteps; i++) {
    const value = (maxValue / ySteps) * i;
    const yPos = chartStartY + chartHeight - (value * scale);
    
    // Grid line
    doc.setDrawColor(230, 230, 230);
    doc.line(startX, yPos, startX + width - 10, yPos);
    
    // Label
    let label: string;
    if (value >= 1000000000) label = `${(value / 1000000000).toFixed(0)}M`;
    else if (value >= 1000000) label = `${(value / 1000000).toFixed(0)}jt`;
    else label = value.toFixed(0);
    
    doc.text(label, startX - 2, yPos + 1, { align: "right" });
  }
  
  // Draw bars
  let currentX = startX + 15;
  
  data.forEach((item, index) => {
    const paguHeight = item.pagu * scale;
    const realisasiHeight = item.realisasi * scale;
    
    // Pagu bar (gray)
    doc.setFillColor(148, 163, 184);
    doc.rect(currentX, chartStartY + chartHeight - paguHeight, barWidth, paguHeight, "F");
    
    // Realisasi bar (colored)
    const color = colorMap[item.kategori] || [107, 114, 128];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(currentX + barWidth + gapBetweenBars, chartStartY + chartHeight - realisasiHeight, barWidth, realisasiHeight, "F");
    
    // X axis label
    doc.setFontSize(8);
    doc.setTextColor(75, 85, 99);
    const labelX = currentX + barWidth + gapBetweenBars / 2;
    doc.text(item.label, labelX, chartStartY + chartHeight + 8, { align: "center" });
    
    currentX += (barWidth * 2) + gapBetweenBars + gapBetweenGroups;
  });
  
  // Legend
  const legendY = chartStartY + chartHeight + 18;
  doc.setFontSize(8);
  
  // Pagu legend
  doc.setFillColor(148, 163, 184);
  doc.rect(startX + 20, legendY - 3, 8, 4, "F");
  doc.setTextColor(75, 85, 99);
  doc.text("Pagu", startX + 30, legendY);
  
  // Realisasi legend
  doc.setFillColor(34, 197, 94);
  doc.rect(startX + 60, legendY - 3, 8, 4, "F");
  doc.text("Realisasi", startX + 70, legendY);
  
  return legendY + 10;
}

export function exportLaporanPDF(data: LaporanPDFData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  
  let currentY = margin;

  // ========== HEADER ==========
  doc.setFillColor(37, 99, 235); // Blue
  doc.rect(0, 0, pageWidth, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("LAPORAN MONITORING KONTRAK & LANGGANAN", pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("PT PLN (Persero)", pageWidth / 2, 23, { align: "center" });
  
  doc.setFontSize(9);
  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });
  doc.text(`Dicetak: ${dateStr}`, pageWidth / 2, 30, { align: "center" });
  
  currentY = 45;

  // ========== RINGKASAN KONTRAK ==========
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("RINGKASAN KONTRAK", margin, currentY);
  
  currentY += 8;
  
  // Summary box kontrak
  doc.setFillColor(239, 246, 255); // Light blue
  doc.roundedRect(margin, currentY, contentWidth, 22, 3, 3, "F");
  
  const boxY = currentY + 5;
  const colWidth = contentWidth / 4;
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  
  // Column 1: Total Kontrak
  doc.text("Total Kontrak", margin + 5, boxY);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(data.overallContractStats.totalKontrak.toString(), margin + 5, boxY + 8);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`${data.overallContractStats.kontrakAktif} aktif`, margin + 5, boxY + 13);
  
  // Column 2: Pagu Total
  doc.setFontSize(8);
  doc.text("Pagu Total", margin + colWidth + 5, boxY);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(formatCurrencyPDF(data.overallContractStats.totalNilai), margin + colWidth + 5, boxY + 8);
  
  // Column 3: Realisasi
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Realisasi Total", margin + (colWidth * 2) + 5, boxY);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 163, 74); // Green
  doc.text(formatCurrencyPDF(data.overallContractStats.totalDibayar), margin + (colWidth * 2) + 5, boxY + 8);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.overallContractStats.persentaseRealisasi.toFixed(1)}% serapan`, margin + (colWidth * 2) + 5, boxY + 13);
  
  // Column 4: Total Tagihan
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("Total Tagihan", margin + (colWidth * 3) + 5, boxY);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(data.overallContractStats.totalTagihan.toString(), margin + (colWidth * 3) + 5, boxY + 8);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`${data.overallContractStats.tagihanPending} pending`, margin + (colWidth * 3) + 5, boxY + 13);
  
  currentY += 30;

  // ========== BAR CHART KONTRAK ==========
  const contractChartData = data.contractStats.map(cat => ({
    label: cat.label,
    pagu: cat.totalNilai,
    realisasi: cat.totalDibayar,
    kategori: cat.kategori,
  }));
  
  currentY = drawBarChart(
    doc,
    contractChartData,
    margin,
    currentY,
    contentWidth,
    55,
    "Grafik Kontrak per Kategori",
    CONTRACT_CATEGORY_COLORS
  );

  currentY += 5;

  // ========== TABEL DETAIL KONTRAK ==========
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Detail Kontrak per Kategori", margin, currentY);
  
  currentY += 3;

  autoTable(doc, {
    startY: currentY,
    head: [["Kategori", "Kontrak", "Aktif", "Pagu", "Realisasi", "Sisa", "%"]],
    body: [
      ...data.contractStats.map((cat) => [
        cat.label,
        cat.totalKontrak.toString(),
        cat.kontrakAktif.toString(),
        formatCurrencyPDF(cat.totalNilai),
        formatCurrencyPDF(cat.totalDibayar),
        formatCurrencyPDF(cat.sisaAnggaran),
        `${cat.persentaseRealisasi.toFixed(1)}%`,
      ]),
      // Total row
      [
        { content: "TOTAL", styles: { fontStyle: "bold" } },
        { content: data.overallContractStats.totalKontrak.toString(), styles: { fontStyle: "bold" } },
        { content: data.overallContractStats.kontrakAktif.toString(), styles: { fontStyle: "bold" } },
        { content: formatCurrencyPDF(data.overallContractStats.totalNilai), styles: { fontStyle: "bold" } },
        { content: formatCurrencyPDF(data.overallContractStats.totalDibayar), styles: { fontStyle: "bold" } },
        { content: formatCurrencyPDF(data.overallContractStats.sisaAnggaran), styles: { fontStyle: "bold" } },
        { content: `${data.overallContractStats.persentaseRealisasi.toFixed(1)}%`, styles: { fontStyle: "bold" } },
      ],
    ],
    theme: "striped",
    styles: {
      overflow: 'linebreak',
      cellWidth: 'wrap',
      cellPadding: 2,
    },
    headStyles: { 
      fillColor: [37, 99, 235], 
      textColor: 255, 
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
    },
    bodyStyles: { 
      fontSize: 8,
      halign: "center",
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 50 },
      1: { cellWidth: 18 },
      2: { cellWidth: 18, halign: "center" },
      3: { halign: "right", cellWidth: 40 },
      4: { halign: "right", cellWidth: 40 },
      5: { halign: "right", cellWidth: 40 },
      6: { halign: "center", cellWidth: 22 },
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
  });

  // Get final Y position after table
  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Check if we need a new page for subscription section
  if (currentY > pageHeight - 100) {
    doc.addPage();
    currentY = margin;
  }

  // ========== RINGKASAN LANGGANAN ==========
  doc.setFillColor(16, 185, 129); // Emerald
  doc.rect(0, currentY - 5, pageWidth, 8, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("RINGKASAN LANGGANAN", margin, currentY);
  
  currentY += 10;
  
  // Summary box langganan
  doc.setFillColor(236, 253, 245); // Light green
  doc.roundedRect(margin, currentY, contentWidth, 22, 3, 3, "F");
  
  const subBoxY = currentY + 5;
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  
  // Column 1: Total Langganan
  doc.text("Total Langganan", margin + 5, subBoxY);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(data.overallSubStats.totalSubs.toString(), margin + 5, subBoxY + 8);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(`${data.overallSubStats.activeSubs} aktif`, margin + 5, subBoxY + 13);
  
  // Column 2: Status Pembayaran
  doc.setFontSize(8);
  doc.text("Status Pembayaran", margin + colWidth + 5, subBoxY);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(data.overallSubStats.totalGaps > 0 ? 245 : 22, data.overallSubStats.totalGaps > 0 ? 158 : 163, data.overallSubStats.totalGaps > 0 ? 11 : 74);
  doc.text(data.overallSubStats.totalGaps > 0 ? `${data.overallSubStats.totalGaps} Perlu Perhatian` : "Aman", margin + colWidth + 5, subBoxY + 8);
  
  // Column 3: Total Terbayar
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Total Terbayar", margin + (colWidth * 2) + 5, subBoxY);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 163, 74);
  doc.text(formatCurrencyPDF(data.overallSubStats.totalTerbayar), margin + (colWidth * 2) + 5, subBoxY + 8);
  
  // Column 4: Kategori
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text("Total Kategori", margin + (colWidth * 3) + 5, subBoxY);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text(data.subscriptionStats.length.toString(), margin + (colWidth * 3) + 5, subBoxY + 8);
  
  currentY += 30;

  // ========== BAR CHART LANGGANAN ==========
  if (data.subscriptionStats.length > 0) {
    const subscriptionChartData = data.subscriptionStats.map(cat => ({
      label: cat.label.length > 8 ? cat.label.substring(0, 8) + ".." : cat.label,
      pagu: cat.totalAnggaranBulanan * 12, // Annualized
      realisasi: cat.totalTerbayar,
      kategori: cat.kategori,
    }));
    
    currentY = drawBarChart(
      doc,
      subscriptionChartData,
      margin,
      currentY,
      contentWidth,
      55,
      "Grafik Langganan per Kategori",
      SUBSCRIPTION_CATEGORY_COLORS
    );

    currentY += 5;
  }

  // ========== TABEL DETAIL LANGGANAN ==========
  // Check if we need a new page
  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = margin;
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(31, 41, 55);
  doc.text("Detail Langganan per Kategori", margin, currentY);
  
  currentY += 3;

  if (data.subscriptionStats.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [["Kategori", "Langganan", "Aktif", "Anggaran/Bulan", "Total Terbayar", "Progress", "Status"]],
      body: data.subscriptionStats.map((stat) => [
        stat.label,
        stat.totalSubs.toString(),
        stat.activeSubs.toString(),
        formatCurrencyPDF(stat.totalAnggaranBulanan),
        formatCurrencyPDF(stat.totalTerbayar),
        `${stat.avgProgress.toFixed(0)}%`,
        stat.hasGaps > 0 ? "Perlu Perhatian" : "Aman",
      ]),
      theme: "striped",
      styles: {
        overflow: 'linebreak',
        cellWidth: 'wrap',
        cellPadding: 2,
      },
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: 255, 
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: { 
        fontSize: 8,
        halign: "center",
      },
      columnStyles: {
        0: { halign: "left", cellWidth: 45 },
        1: { cellWidth: 18 },
        2: { cellWidth: 18, halign: "center" },
        3: { halign: "right", cellWidth: 38 },
        4: { halign: "right", cellWidth: 38 },
        5: { halign: "right", cellWidth: 38 },
        6: { halign: "center", cellWidth: 22 },
      },
      didDrawCell: (data) => {
        if (data.column.index === 6 && data.section === "body") {
          const value = data.cell.raw as string;
          if (value === "Perlu Perhatian") {
            // Use autoTable cell textColor instead of global doc change
            data.cell.styles.textColor = [245, 158, 11];
          }
        }
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
    });
  } else {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(107, 114, 128);
    doc.text("Belum ada data langganan", margin, currentY + 10);
  }

  // ========== FOOTER ==========
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
    
    // Footer text
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text("PT PLN (Persero) - Sistem Monitoring Kontrak & Langganan", margin, pageHeight - 10);
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  // Save the PDF
  const fileName = `Laporan_Kontrak_Langganan_${today.toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
