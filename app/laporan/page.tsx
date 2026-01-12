"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useContractStore, CONTRACT_CATEGORY_LABELS } from "@/lib/store-new";
import type { ContractCategory } from "@/lib/types-new";

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(2)} M`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)} jt`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function LaporanPage() {
  const { contracts, invoices, getDashboardSummary } = useContractStore();
  const summary = useMemo(() => getDashboardSummary(), [getDashboardSummary]);

  const categoryStats = useMemo(() => {
    const categories: ContractCategory[] = ["investasi", "pemeliharaan", "administrasi"];
    
    return categories.map((cat) => {
      const catContracts = contracts.filter((c) => c.kategori === cat);
      const catInvoices = invoices.filter((inv) => {
        const contract = contracts.find((c) => c.id === inv.contractId);
        return contract?.kategori === cat;
      });
      
      const totalNilai = catContracts.reduce((sum, c) => sum + c.nilaiKontrak, 0);
      const totalDibayar = catContracts.reduce((sum, c) => sum + c.totalTagihanDibayar, 0);
      const totalTagihan = catInvoices.length;
      const tagihanDibayar = catInvoices.filter((i) => i.status === "dibayar").length;
      const tagihanPending = catInvoices.filter((i) => i.status === "diajukan" || i.status === "diverifikasi").length;
      
      return {
        kategori: cat,
        label: CONTRACT_CATEGORY_LABELS[cat],
        totalKontrak: catContracts.length,
        kontrakAktif: catContracts.filter((c) => c.status === "aktif").length,
        totalNilai,
        totalDibayar,
        sisaAnggaran: totalNilai - totalDibayar,
        persentaseRealisasi: totalNilai > 0 ? (totalDibayar / totalNilai) * 100 : 0,
        totalTagihan,
        tagihanDibayar,
        tagihanPending,
      };
    });
  }, [contracts, invoices]);

  const overallStats = useMemo(() => ({
    totalKontrak: contracts.length,
    kontrakAktif: contracts.filter((c) => c.status === "aktif").length,
    totalNilai: contracts.reduce((sum, c) => sum + c.nilaiKontrak, 0),
    totalDibayar: summary.totalDibayar,
    sisaAnggaran: summary.totalSisaAnggaran,
    persentaseRealisasi: summary.persentaseRealisasiGlobal,
    totalTagihan: invoices.length,
    tagihanDibayar: summary.tagihanDibayar,
    tagihanPending: summary.tagihanDiajukan + summary.tagihanDiverifikasi,
  }), [contracts, invoices, summary]);

  const handleExport = () => {
    // Generate CSV content
    const headers = ["Kategori", "Total Kontrak", "Kontrak Aktif", "Pagu", "Serapan", "Sisa Anggaran", "% Serapan", "Total Tagihan", "Tagihan Dibayar", "Tagihan Pending"];
    const rows = categoryStats.map((cat) => [
      cat.label,
      cat.totalKontrak,
      cat.kontrakAktif,
      cat.totalNilai,
      cat.totalDibayar,
      cat.sisaAnggaran,
      cat.persentaseRealisasi.toFixed(2),
      cat.totalTagihan,
      cat.tagihanDibayar,
      cat.tagihanPending,
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Laporan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Ringkasan data kontrak dan tagihan
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Overall Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white"
      >
        <h2 className="text-lg font-semibold mb-4">Ringkasan Keseluruhan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-blue-200 text-sm">Total Kontrak</p>
            <p className="text-2xl font-bold">{overallStats.totalKontrak}</p>
            <p className="text-blue-200 text-xs">{overallStats.kontrakAktif} aktif</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Pagu</p>
            <p className="text-2xl font-bold">{formatCurrency(overallStats.totalNilai)}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Serapan</p>
            <p className="text-2xl font-bold">{formatCurrency(overallStats.totalDibayar)}</p>
            <p className="text-blue-200 text-xs">{overallStats.persentaseRealisasi.toFixed(1)}% serapan</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Total Tagihan</p>
            <p className="text-2xl font-bold">{overallStats.totalTagihan}</p>
            <p className="text-blue-200 text-xs">{overallStats.tagihanPending} pending</p>
          </div>
        </div>
      </motion.div>

      {/* Category Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {categoryStats.map((cat, index) => (
          <motion.div
            key={cat.kategori}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-4 h-4 rounded-full ${
                cat.kategori === "investasi" ? "bg-purple-500" :
                cat.kategori === "pemeliharaan" ? "bg-orange-500" : "bg-cyan-500"
              }`} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {cat.label}
              </h3>
            </div>

            <div className="space-y-4">
              {/* Kontrak */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Kontrak</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{cat.totalKontrak}</span>
                </div>
                <p className="text-xs text-gray-500">{cat.kontrakAktif} aktif</p>
              </div>

              {/* Nilai & Realisasi */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Pagu</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(cat.totalNilai)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Serapan</span>
                  <span className="font-medium text-green-600">{formatCurrency(cat.totalDibayar)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Sisa</span>
                  <span className="font-medium text-blue-600">{formatCurrency(cat.sisaAnggaran)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Serapan</span>
                  <span className={`font-medium ${
                    cat.persentaseRealisasi > 90 ? "text-red-600" :
                    cat.persentaseRealisasi > 70 ? "text-yellow-600" : "text-green-600"
                  }`}>
                    {cat.persentaseRealisasi.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(cat.persentaseRealisasi, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className={`h-full rounded-full ${
                      cat.persentaseRealisasi > 90 ? "bg-red-500" :
                      cat.persentaseRealisasi > 70 ? "bg-yellow-500" : "bg-green-500"
                    }`}
                  />
                </div>
              </div>

              {/* Tagihan */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tagihan</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{cat.totalTagihan}</span>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span className="text-green-600">{cat.tagihanDibayar} dibayar</span>
                  <span className="text-yellow-600">{cat.tagihanPending} pending</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Detail per Kategori</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Kategori</th>
                <th className="px-4 py-3 text-center">Kontrak</th>
                <th className="px-4 py-3 text-center">Aktif</th>
                <th className="px-4 py-3 text-right">Pagu</th>
                <th className="px-4 py-3 text-right">Serapan</th>
                <th className="px-4 py-3 text-right">Sisa</th>
                <th className="px-4 py-3 text-center">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              {categoryStats.map((cat) => (
                <tr key={cat.kategori} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        cat.kategori === "investasi" ? "bg-purple-500" :
                        cat.kategori === "pemeliharaan" ? "bg-orange-500" : "bg-cyan-500"
                      }`} />
                      {cat.label}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{cat.totalKontrak}</td>
                  <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{cat.kontrakAktif}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatCurrency(cat.totalNilai)}</td>
                  <td className="px-4 py-3 text-right text-green-600 whitespace-nowrap">{formatCurrency(cat.totalDibayar)}</td>
                  <td className="px-4 py-3 text-right text-blue-600 whitespace-nowrap">{formatCurrency(cat.sisaAnggaran)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      cat.persentaseRealisasi > 90 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      cat.persentaseRealisasi > 70 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}>
                      {cat.persentaseRealisasi.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 dark:bg-gray-800 border-t-2 border-gray-300 dark:border-gray-600">
              <tr className="font-semibold text-sm">
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">Total</td>
                <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">{overallStats.totalKontrak}</td>
                <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">{overallStats.kontrakAktif}</td>
                <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100 whitespace-nowrap">{formatCurrency(overallStats.totalNilai)}</td>
                <td className="px-4 py-3 text-right text-green-600 whitespace-nowrap">{formatCurrency(overallStats.totalDibayar)}</td>
                <td className="px-4 py-3 text-right text-blue-600 whitespace-nowrap">{formatCurrency(overallStats.sisaAnggaran)}</td>
                <td className="px-4 py-3 text-center text-gray-900 dark:text-gray-100">{overallStats.persentaseRealisasi.toFixed(1)}%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
