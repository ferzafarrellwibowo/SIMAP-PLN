import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface ContractData {
  id: string;
  no: number;
  kategori: "investasi" | "pemeliharaan" | "administrasi";
  
  // Common fields
  noPerjanjian: string;
  tanggalPerjanjian: string;
  tanggalBerakhir: string;
  nilaiPerjanjian?: number;
  nilaiKontrak?: number;
  namaVendor?: string;
  vendor?: string;
  nilaiTagihan?: number;
  noBeritaAcara?: string;
  tanggalBeritaAcara?: string;
  noSKKI?: string;
  noSE?: string;
  noPO?: string;
  submissionIdVIP?: string;
  submissionId?: string;
  statusVIP?: string;
  terbayar?: number;
  totalTagihanDibayar?: number;
  
  // Investasi specific
  judulPRK?: string;
  noWBSPosAnggaran?: string;
  requestTanggalSE?: string;
  tanggalSERilis?: string;
  namaPekerjaan?: string;
  jenisAI?: string;
  noPRK?: string;
  crNotCR?: string;
  clickCB?: boolean;
  
  // Pemeliharaan specific
  jenisAnggaran?: string;
  bidang?: string;
  judulPerjanjian?: string;
  msb?: string;
  periodeAccrueBulan?: string;
  periodeAccrueTahun?: string;
  requestedBy?: string;
  tanggalRequestSE?: string;
  terbayarPusat?: number;
  terbayarUnit?: number;
  statusTerbayar?: string;
  rutinNonRutin?: string;
  
  // Administrasi specific
  uraianKegiatan?: string;
  bebanTahun?: string;
  unitSektorK?: string;
  posAngg?: string;
  batasPaguTerbayar?: number;
  entryBy?: string;
  konfirmasiNonRutin?: string;
  keterangan?: string;
  noXPS?: string;
  tanggalXPS?: string;
  picName?: string;
  
  // Legacy/calculated fields
  unit?: string;
  status?: string;
  sisaAnggaran?: number;
  persentaseRealisasi?: number;
  progressPekerjaan?: number;
}

// ============================================
// COLUMN DEFINITIONS PER CATEGORY
// ============================================

const INVESTASI_COLUMNS = [
  { header: "No Perjanjian/Amandemen", key: "noPerjanjian", width: 35 },
  { header: "Tanggal Perjanjian/Amandemen", key: "tanggalPerjanjian", width: 25, isDate: true },
  { header: "Tanggal Berakhir", key: "tanggalBerakhir", width: 18, isDate: true },
  { header: "Judul PRK", key: "judulPRK", width: 45 },
  { header: "Nilai Perjanjian", key: "nilaiPerjanjian", width: 22, isCurrency: true },
  { header: "Nama Vendor", key: "namaVendor", width: 28 },
  { header: "Nilai Tagihan/Nominal", key: "nilaiTagihan", width: 22, isCurrency: true },
  { header: "No Berita Acara", key: "noBeritaAcara", width: 22 },
  { header: "Tanggal Berita Acara", key: "tanggalBeritaAcara", width: 20, isDate: true },
  { header: "No WBS/Pos Anggaran", key: "noWBSPosAnggaran", width: 25 },
  { header: "No SKKI", key: "noSKKI", width: 30 },
  { header: "Tanggal Request SE", key: "requestTanggalSE", width: 20, isDate: true },
  { header: "Tanggal SE Relase", key: "tanggalSERilis", width: 18, isDate: true },
  { header: "No SE", key: "noSE", width: 18 },
  { header: "No PO", key: "noPO", width: 18 },
  { header: "Submission ID Vendor Invoicing Portal", key: "submissionIdVIP", width: 35 },
  { header: "Status VIP", key: "statusVIP", width: 18 },
  { header: "Terbayar", key: "terbayar", width: 22, isCurrency: true },
  { header: "Nama Pekerjaan", key: "namaPekerjaan", width: 45 },
  { header: "Jenis AI", key: "jenisAI", width: 12 },
  { header: "No. PRK", key: "noPRK", width: 22 },
  { header: "CR/Not CR", key: "crNotCR", width: 12 },
  { header: "Click CB", key: "clickCB", width: 10 },
];

const PEMELIHARAAN_COLUMNS = [
  { header: "No", key: "no", width: 6 },
  { header: "Jenis Anggaran/Mata Anggaran", key: "jenisAnggaran", width: 28 },
  { header: "No Perjanjian/Amandemen", key: "noPerjanjian", width: 35 },
  { header: "Tanggal Perjanjian/Amandemen", key: "tanggalPerjanjian", width: 25, isDate: true },
  { header: "Tanggal Berakhir", key: "tanggalBerakhir", width: 18, isDate: true },
  { header: "Nilai Perjanjian", key: "nilaiPerjanjian", width: 22, isCurrency: true },
  { header: "Nilai Tagihan", key: "nilaiTagihan", width: 22, isCurrency: true },
  { header: "Bidang", key: "bidang", width: 35 },
  { header: "No Berita Acara", key: "noBeritaAcara", width: 22 },
  { header: "Tanggal Berita Acara", key: "tanggalBeritaAcara", width: 20, isDate: true },
  { header: "KEBK/SKU/SKKO", key: "noSKKI", width: 28 },
  { header: "Request Tanggal SE Relasi", key: "requestTanggalSE", width: 22, isDate: true },
  { header: "No SE", key: "noSE", width: 18 },
  { header: "No PO", key: "noPO", width: 18 },
  { header: "Submission ID", key: "submissionIdVIP", width: 30 },
  { header: "Status VIP", key: "statusVIP", width: 18 },
  { header: "Terbayar", key: "terbayar", width: 22, isCurrency: true },
  { header: "Nama Vendor", key: "namaVendor", width: 28 },
  { header: "Judul Perjanjian", key: "judulPerjanjian", width: 45 },
  { header: "MSB", key: "msb", width: 15 },
  { header: "Periode Accrue Bulan", key: "periodeAccrueBulan", width: 18 },
  { header: "Periode Accrue Tahun", key: "periodeAccrueTahun", width: 18 },
  { header: "Requested By", key: "requestedBy", width: 20 },
  { header: "Tanggal Request SE", key: "tanggalRequestSE", width: 18, isDate: true },
  { header: "Tanggal SE Rilis", key: "tanggalSERilis", width: 18, isDate: true },
  { header: "Terbayar STI Pusat", key: "terbayarPusat", width: 20, isCurrency: true },
  { header: "Terbayar Unit", key: "terbayarUnit", width: 18, isCurrency: true },
  { header: "Status Terbayar", key: "statusTerbayar", width: 16 },
  { header: "Rutin/Non Rutin", key: "rutinNonRutin", width: 16 },
];

const ADMINISTRASI_COLUMNS = [
  { header: "No", key: "no", width: 6 },
  { header: "Uraian Kegiatan/Mata Anggaran", key: "uraianKegiatan", width: 35 },
  { header: "No Perjanjian/Amandemen", key: "noPerjanjian", width: 35 },
  { header: "Tanggal Perjanjian/Amandemen", key: "tanggalPerjanjian", width: 25, isDate: true },
  { header: "Tanggal Berakhir", key: "tanggalBerakhir", width: 18, isDate: true },
  { header: "Judul Perjanjian", key: "judulPerjanjian", width: 45 },
  { header: "Nilai Perjanjian", key: "nilaiPerjanjian", width: 22, isCurrency: true },
  { header: "Nama Vendor", key: "namaVendor", width: 28 },
  { header: "Yg Dibebankan Khusus Kar K", key: "bebanTahun", width: 25 },
  { header: "Unit Sektor K", key: "unitSektorK", width: 20 },
  { header: "No Berita Acara", key: "noBeritaAcara", width: 22 },
  { header: "Tanggal Berita Acara", key: "tanggalBeritaAcara", width: 20, isDate: true },
  { header: "Ac/Stb/Pos Ang", key: "posAngg", width: 18 },
  { header: "No SKU/SKKO", key: "noSKKI", width: 25 },
  { header: "Request Tanggal SE Relasi", key: "requestTanggalSE", width: 22, isDate: true },
  { header: "No SE", key: "noSE", width: 18 },
  { header: "No PO", key: "noPO", width: 18 },
  { header: "Submission ID", key: "submissionIdVIP", width: 30 },
  { header: "Batas Pagu Terbayar", key: "batasPaguTerbayar", width: 20, isCurrency: true },
  { header: "Terbayar", key: "terbayar", width: 22, isCurrency: true },
  { header: "Entry By", key: "entryBy", width: 18 },
  { header: "Konfirmasi/Non Rutin", key: "konfirmasiNonRutin", width: 20 },
  { header: "Keterangan", key: "keterangan", width: 30 },
  { header: "No. XPS", key: "noXPS", width: 18 },
  { header: "Tanggal XPS", key: "tanggalXPS", width: 16, isDate: true },
  { header: "PIC", key: "picName", width: 18 },
  { header: "Bidang", key: "bidang", width: 20 },
];

// ============================================
// STYLING CONSTANTS
// ============================================

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E40AF" }, // Blue-800
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  size: 11,
  name: "Calibri",
};

const TITLE_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  size: 16,
  name: "Calibri",
  color: { argb: "FF1E3A8A" }, // Blue-900
};

const SUBTITLE_FONT: Partial<ExcelJS.Font> = {
  size: 11,
  name: "Calibri",
  color: { argb: "FF6B7280" }, // Gray-500
};

const BORDER_STYLE: Partial<ExcelJS.Borders> = {
  top: { style: "thin", color: { argb: "FFD1D5DB" } },
  left: { style: "thin", color: { argb: "FFD1D5DB" } },
  bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
  right: { style: "thin", color: { argb: "FFD1D5DB" } },
};

const HEADER_BORDER_STYLE: Partial<ExcelJS.Borders> = {
  top: { style: "medium", color: { argb: "FF1E40AF" } },
  left: { style: "medium", color: { argb: "FF1E40AF" } },
  bottom: { style: "medium", color: { argb: "FF1E40AF" } },
  right: { style: "medium", color: { argb: "FF1E40AF" } },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDateForExcel(dateString: string): Date | string {
  if (!dateString) return "-";
  try {
    return new Date(dateString);
  } catch {
    return dateString;
  }
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    aktif: "Aktif",
    selesai: "Selesai",
    bermasalah: "Bermasalah",
  };
  return labels[status] || status;
}

// Convert column number to Excel letter (1 = A, 26 = Z, 27 = AA, etc.)
function getExcelColumnLetter(colNumber: number): string {
  let letter = "";
  let temp = colNumber;
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

interface ColumnDef {
  header: string;
  key: string;
  width: number;
  isDate?: boolean;
  isCurrency?: boolean;
}

function createWorksheet(
  workbook: ExcelJS.Workbook,
  sheetName: string,
  title: string,
  columns: ColumnDef[],
  data: ContractData[]
): void {
  const worksheet = workbook.addWorksheet(sheetName, {
    properties: { tabColor: { argb: sheetName === "Investasi" ? "FF3B82F6" : sheetName === "Pemeliharaan" ? "FFF59E0B" : "FF8B5CF6" } },
    pageSetup: {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
    },
  });

  // ============================================
  // TITLE SECTION (Row 1-4)
  // ============================================

  // Merge cells for title
  const lastCol = getExcelColumnLetter(columns.length);
  worksheet.mergeCells(`A1:${lastCol}1`);
  worksheet.mergeCells(`A2:${lastCol}2`);
  worksheet.mergeCells(`A3:${lastCol}3`);

  // Title
  const titleCell = worksheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = TITLE_FONT;
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(1).height = 30;

  // Subtitle
  const subtitleCell = worksheet.getCell("A2");
  subtitleCell.value = `PT PLN (Persero) - Sistem Monitoring Kontrak & Tagihan`;
  subtitleCell.font = SUBTITLE_FONT;
  subtitleCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(2).height = 20;

  // Date generated
  const dateCell = worksheet.getCell("A3");
  const now = new Date();
  dateCell.value = `Dicetak pada: ${now.toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  dateCell.font = { ...SUBTITLE_FONT, italic: true, size: 10 };
  dateCell.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(3).height = 18;

  // Empty row
  worksheet.getRow(4).height = 10;

  // ============================================
  // HEADER ROW (Row 5)
  // ============================================

  const headerRow = worksheet.getRow(5);
  headerRow.height = 35;

  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    cell.font = HEADER_FONT;
    cell.fill = HEADER_FILL;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
    cell.border = HEADER_BORDER_STYLE;

    // Set column width
    worksheet.getColumn(index + 1).width = col.width;
  });

  // ============================================
  // DATA ROWS (Starting from Row 6)
  // ============================================

  let rowNumber = 6;
  data.forEach((contract, dataIndex) => {
    const row = worksheet.getRow(rowNumber);
    row.height = 25;

    // Alternating row colors
    const rowFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: dataIndex % 2 === 0 ? "FFFFFFFF" : "FFF9FAFB" },
    };

    columns.forEach((col, colIndex) => {
      const cell = row.getCell(colIndex + 1);

      // Get value based on key
      let value: string | number | Date | boolean = "-";

      if (col.key === "no") {
        value = dataIndex + 1;
      } else if (col.key === "namaVendor") {
        value = contract.namaVendor || contract.vendor || "-";
      } else if (col.key === "nilaiPerjanjian") {
        value = contract.nilaiPerjanjian || contract.nilaiKontrak || 0;
      } else if (col.key === "terbayar") {
        value = contract.terbayar || contract.totalTagihanDibayar || 0;
      } else if (col.key === "submissionIdVIP") {
        value = contract.submissionIdVIP || contract.submissionId || "-";
      } else if (col.key === "statusVIP") {
        const statusVIPLabels: Record<string, string> = {
          lunas: "Lunas",
          belum_lunas: "Belum Lunas",
          dokumen_tidak_lengkap: "Dokumen Tidak Lengkap",
        };
        value = contract.statusVIP ? statusVIPLabels[contract.statusVIP] || contract.statusVIP : "-";
      } else if (col.key === "clickCB") {
        value = contract.clickCB ? "Ya" : "-";
      } else if (col.key === "jenisAnggaran") {
        const jenisLabels: Record<string, string> = {
          AI: "AI - Anggaran Investasi",
          AO: "AO - Anggaran Operasi",
        };
        value = contract.jenisAnggaran ? jenisLabels[contract.jenisAnggaran] || contract.jenisAnggaran : "-";
      } else if (col.key === "status") {
        value = contract.status ? getStatusLabel(contract.status) : "-";
      } else {
        const rawValue = contract[col.key as keyof ContractData];
        if (rawValue !== undefined && rawValue !== null && rawValue !== "") {
          value = rawValue as string | number | boolean;
        } else {
          value = "-";
        }
      }

      // Handle date formatting
      if (col.isDate && value !== "-") {
        const dateValue = formatDateForExcel(value as string);
        cell.value = dateValue;
        if (dateValue instanceof Date) {
          cell.numFmt = "DD-MM-YYYY";
        }
      } else if (col.isCurrency && typeof value === "number") {
        cell.value = value;
        cell.numFmt = '"Rp "#,##0';
      } else {
        cell.value = value;
      }

      // Styling
      cell.fill = rowFill;
      cell.border = BORDER_STYLE;

      // Alignment based on column type
      if (col.isCurrency || col.key === "persentaseRealisasi" || col.key === "progressPekerjaan") {
        // Numbers/currency stay right aligned
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else if (col.key === "no" || col.isDate) {
        // Index and dates centered
        cell.alignment = { horizontal: "center", vertical: "middle" };
      } else {
        // Default: center text content for all other columns
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      }

      // Status cell coloring
      if (col.key === "status") {
        cell.alignment = { horizontal: "center", vertical: "middle" };
        if (value === "Aktif") {
          cell.font = { color: { argb: "FF059669" }, bold: true }; // Green
        } else if (value === "Selesai") {
          cell.font = { color: { argb: "FF2563EB" }, bold: true }; // Blue
        } else if (value === "Bermasalah") {
          cell.font = { color: { argb: "FFDC2626" }, bold: true }; // Red
        }
      }
    });

    rowNumber++;
  });

  // SUMMARY SECTION removed per request: totals/summary row not included in export

  // ============================================
  // FREEZE PANES
  // ============================================

  worksheet.views = [
    { state: "frozen", xSplit: 0, ySplit: 5, activeCell: "A6", showGridLines: true },
  ];
}

// ============================================
// API ROUTE HANDLER
// ============================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body for contracts data
    const body = await request.json();
    const contracts: ContractData[] = body.contracts || [];

    // Separate contracts by category
    const investasiContracts = contracts.filter((c) => c.kategori === "investasi");
    const pemeliharaanContracts = contracts.filter((c) => c.kategori === "pemeliharaan");
    const administrasiContracts = contracts.filter((c) => c.kategori === "administrasi");

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "PLN Monitoring System";
    workbook.lastModifiedBy = "PLN Monitoring System";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Create worksheets for each category
    createWorksheet(
      workbook,
      "Investasi",
      "LAPORAN MONITORING TAGIHAN - INVESTASI",
      INVESTASI_COLUMNS,
      investasiContracts
    );

    createWorksheet(
      workbook,
      "Pemeliharaan",
      "LAPORAN MONITORING TAGIHAN - PEMELIHARAAN",
      PEMELIHARAAN_COLUMNS,
      pemeliharaanContracts
    );

    createWorksheet(
      workbook,
      "Administrasi",
      "LAPORAN MONITORING TAGIHAN - ADMINISTRASI",
      ADMINISTRASI_COLUMNS,
      administrasiContracts
    );

    // Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Generate filename with date
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const filename = `laporan-monitoring-tagihan-${dateStr}.xlsx`;

    // Return response with file download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error generating Excel:", error);
    return NextResponse.json(
      { error: "Failed to generate Excel file" },
      { status: 500 }
    );
  }
}

// GET handler for testing
export async function GET() {
  return NextResponse.json({
    message: "Use POST method with contracts data to generate Excel report",
    usage: {
      method: "POST",
      body: {
        contracts: "Array of contract objects",
      },
    },
  });
}
