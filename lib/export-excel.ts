import type { Contract } from "./types-new";

/**
 * Export contracts data to Excel file with 3 sheets:
 * - Investasi
 * - Pemeliharaan
 * - Administrasi
 *
 * Uses the /api/export-excel endpoint to generate styled Excel report
 */
export async function exportContractsToExcel(contracts: Contract[]): Promise<void> {
  try {
    const response = await fetch("/api/export-excel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contracts }),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    // Get the blob from response
    const blob = await response.blob();

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;

    // Extract filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = "laporan-monitoring-tagihan.xlsx";
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) {
        filename = match[1];
      }
    }

    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    throw error;
  }
}

/**
 * Export filtered contracts by category
 */
export async function exportContractsByCategory(
  contracts: Contract[],
  kategori: "investasi" | "pemeliharaan" | "administrasi" | "all"
): Promise<void> {
  const filteredContracts =
    kategori === "all"
      ? contracts
      : contracts.filter((c) => c.kategori === kategori);

  return exportContractsToExcel(filteredContracts);
}
