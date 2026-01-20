"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useContractStore, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS, invoiceStatusOptions } from "@/lib/store-new";
import { useAuth } from "@/lib/auth-new";
import AlertPopup from "@/components/ui/alert-popup";
import type { InvoiceStatus, Invoice } from "@/lib/types-new";

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(2)} M`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)} jt`;
  if (value >= 1000) return `Rp ${value.toLocaleString("id-ID")}`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function daysAgo(date: string): number {
  const now = new Date();
  const target = new Date(date);
  return Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
}

// Helper function untuk mendapatkan opsi status berdasarkan status saat ini
function getAvailableStatusOptions(currentStatus: InvoiceStatus) {
  // Jika status ditolak atau dibayar, tidak bisa diubah
  if (currentStatus === "ditolak" || currentStatus === "dibayar") {
    return [];
  }

  // Jika status diajukan, hanya bisa pilih Diterima atau Ditolak
  if (currentStatus === "diajukan") {
    return [
      { value: "diterima", label: "Diterima" },
      { value: "ditolak", label: "Ditolak" },
    ];
  }

  // Jika status diterima, bisa pilih Ditolak atau Dibayar
  if (currentStatus === "diterima") {
    return [
      { value: "ditolak", label: "Ditolak" },
      { value: "dibayar", label: "Dibayar" },
    ];
  }

  return [];
}

export default function TagihanPage() {
  const { user } = useAuth();
  const { contracts, invoices, updateInvoiceStatus } = useContractStore();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"terbaru" | "tertinggi" | "terendah">("terbaru");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<InvoiceStatus | null>(null);
  const [dibayarOleh, setDibayarOleh] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get unique years from invoices
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    invoices.forEach((inv) => {
      const year = new Date(inv.tanggalDiajukan).getFullYear();
      years.add(year);
    });
    return Array.from(years).sort().reverse();
  }, [invoices]);

  // Check if any filter is active
  const isFilterActive = search !== "" || status !== "all" || filterYear !== "all" || filterMonth !== "all";

  const filteredInvoices = useMemo(() => {
    let filtered = invoices.filter((inv) => {
      const contract = contracts.find((c) => c.id === inv.contractId);
      const matchSearch =
        inv.nomorTagihan.toLowerCase().includes(search.toLowerCase()) ||
        contract?.judulPekerjaan.toLowerCase().includes(search.toLowerCase()) ||
        contract?.vendor.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "all" || inv.status === status;

      // Filter by year
      let matchYear = true;
      if (filterYear !== "all") {
        const invYear = new Date(inv.tanggalDiajukan).getFullYear();
        matchYear = invYear === parseInt(filterYear);
      }

      // Filter by month
      let matchMonth = true;
      if (filterMonth !== "all") {
        const invMonth = new Date(inv.tanggalDiajukan).getMonth() + 1;
        matchMonth = invMonth === parseInt(filterMonth);
      }

      return matchSearch && matchStatus && matchYear && matchMonth;
    });

    // Sort based on selected option
    if (sortBy === "terbaru") {
      filtered.sort((a, b) => new Date(b.tanggalDiajukan).getTime() - new Date(a.tanggalDiajukan).getTime());
    } else if (sortBy === "tertinggi") {
      filtered.sort((a, b) => b.nilaiTagihan - a.nilaiTagihan);
    } else if (sortBy === "terendah") {
      filtered.sort((a, b) => a.nilaiTagihan - b.nilaiTagihan);
    }

    return filtered;
  }, [invoices, contracts, search, status, sortBy, filterMonth, filterYear]);

  const getContractInfo = (contractId: string) => {
    return contracts.find((c) => c.id === contractId);
  };

  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (invoiceId: string, newStatus: InvoiceStatus) => {
    // Jika memilih dibayar, tampilkan input dibayar oleh
    if (newStatus === "dibayar") {
      setPendingStatus(newStatus);
      return;
    }

    setIsUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await updateInvoiceStatus(invoiceId, newStatus);
      setSelectedInvoice(null);
      setPendingStatus(null);
      setDibayarOleh("");
      setSuccessMessage("Status tagihan berhasil diperbarui.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage('Gagal mengubah status tagihan');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDibayar = async (invoiceId: string) => {
    if (!dibayarOleh.trim()) {
      setErrorMessage('Harap isi nama pembayar');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    setIsUpdating(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      await updateInvoiceStatus(invoiceId, "dibayar", dibayarOleh);
      setSelectedInvoice(null);
      setPendingStatus(null);
      setDibayarOleh("");
      setSuccessMessage("Status tagihan berhasil diperbarui.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error('Error updating status:', error);
      setErrorMessage('Gagal mengubah status tagihan');
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setSelectedInvoice(null);
    setPendingStatus(null);
    setDibayarOleh("");
  };

  const canEditStatus = user?.role === "admin";

  const statusStats = useMemo(() => {
    return {
      diajukan: invoices.filter((i) => i.status === "diajukan").length,
      diterima: invoices.filter((i) => i.status === "diterima").length,
      dibayar: invoices.filter((i) => i.status === "dibayar").length,
      ditolak: invoices.filter((i) => i.status === "ditolak").length,
    };
  }, [invoices]);


  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daftar Tagihan</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {filteredInvoices.length} tagihan ditemukan
          </p>
        </div>
      </div>

      {/* Alerts */}
      <AlertPopup
        message={successMessage}
        type="success"
        onClose={() => setSuccessMessage(null)}
      />
      <AlertPopup
        message={errorMessage}
        type="error"
        onClose={() => setErrorMessage(null)}
      />

      {/* Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-amber-100 dark:bg-yellow-900/30 rounded-xl p-4 border border-amber-300 dark:border-yellow-700">
          <p className="text-sm text-amber-800 dark:text-yellow-300 font-medium">Diajukan</p>
          <p className="text-2xl font-bold text-amber-950 dark:text-yellow-200 mt-1">{statusStats.diajukan}</p>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-300 dark:border-blue-700">
          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">Diterima</p>
          <p className="text-2xl font-bold text-blue-950 dark:text-blue-200 mt-1">{statusStats.diterima}</p>
        </div>
        <div className="bg-emerald-100 dark:bg-green-900/30 rounded-xl p-4 border border-emerald-300 dark:border-green-700">
          <p className="text-sm text-emerald-800 dark:text-green-300 font-medium">Dibayar</p>
          <p className="text-2xl font-bold text-emerald-950 dark:text-green-200 mt-1">{statusStats.dibayar}</p>
        </div>
        <div className="bg-red-100 dark:bg-red-900/30 rounded-xl p-4 border border-red-300 dark:border-red-700">
          <p className="text-sm text-red-800 dark:text-red-300 font-medium">Ditolak</p>
          <p className="text-2xl font-bold text-red-950 dark:text-red-200 mt-1">{statusStats.ditolak}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${isFilterActive ? "lg:grid-cols-6" : "lg:grid-cols-5"}`}>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Pencarian</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor tagihan, kontrak, atau vendor..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus | "all")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {invoiceStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Urutkan</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "terbaru" | "tertinggi" | "terendah")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="terbaru">Terbaru</option>
              <option value="tertinggi">Nilai Tertinggi</option>
              <option value="terendah">Nilai Terendah</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Tahun</label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Bulan</label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Bulan</option>
              <option value="1">Januari</option>
              <option value="2">Februari</option>
              <option value="3">Maret</option>
              <option value="4">April</option>
              <option value="5">Mei</option>
              <option value="6">Juni</option>
              <option value="7">Juli</option>
              <option value="8">Agustus</option>
              <option value="9">September</option>
              <option value="10">Oktober</option>
              <option value="11">November</option>
              <option value="12">Desember</option>
            </select>
          </div>
          {/* Reset Filter Button */}
          <AnimatePresence>
            {isFilterActive && (
              <motion.div
                key="reset-button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex items-end"
              >
                <button
                  onClick={() => {
                    setSearch("");
                    setStatus("all");
                    setFilterYear("all");
                    setFilterMonth("all");
                  }}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Desktop Table - Hidden on Mobile */}
        <div className="hidden lg:block">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr className="text-center text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                <th className="px-4 py-3 w-[22%]">No Tagihan</th>
                <th className="px-4 py-3 w-[20%]">Kontrak</th>
                <th className="px-4 py-3 w-[14%]">Vendor</th>
                <th className="px-4 py-3 w-[10%]">Nilai</th>
                <th className="px-4 py-3 w-[10%]">Tanggal</th>
                <th className="px-4 py-3 w-[9%]">Status</th>
                {canEditStatus && <th className="px-4 py-3 w-[8%]">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={canEditStatus ? 8 : 7} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada tagihan yang ditemukan
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice, index) => {
                  const contract = getContractInfo(invoice.contractId);
                  const age = daysAgo(invoice.tanggalDiajukan);
                  const isPending = invoice.status === "diajukan" || invoice.status === "diterima";

                  return (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="px-4 py-3 text-center">
                        <span className="font-medium text-gray-900 dark:text-white text-sm truncate block" title={invoice.nomorTagihan}>
                          {invoice.nomorTagihan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-700 dark:text-gray-200 text-sm truncate block" title={contract?.judulPekerjaan}>
                          {contract?.judulPekerjaan && contract.judulPekerjaan.length > 25
                            ? contract.judulPekerjaan.substring(0, 25) + "..."
                            : contract?.judulPekerjaan}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-600 dark:text-gray-300 text-sm truncate block" title={contract?.vendor}>
                          {contract?.vendor && contract.vendor.length > 12
                            ? contract.vendor.substring(0, 12) + "..."
                            : contract?.vendor}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm whitespace-nowrap">
                          {formatCurrency(invoice.nilaiTagihan)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-600 dark:text-gray-300 text-xs whitespace-nowrap">
                          {new Date(invoice.tanggalDiajukan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "2-digit" })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                          {INVOICE_STATUS_LABELS[invoice.status]}
                        </span>
                      </td>
                      {canEditStatus && (
                        <td className="px-4 py-3 text-center">
                          {(() => {
                            const availableOptions = getAvailableStatusOptions(invoice.status);
                            const canEdit = availableOptions.length > 0;

                            if (!canEdit) {
                              return (
                                <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                                  {invoice.status === "ditolak" ? "Final" : invoice.status === "dibayar" ? (
                                    <span className="flex flex-col leading-tight">
                                      <span>Final</span>
                                      {invoice.dibayarOleh && (
                                        <span className="text-green-600 dark:text-green-400 not-italic truncate max-w-[60px]" title={invoice.dibayarOleh}>
                                          {invoice.dibayarOleh}
                                        </span>
                                      )}
                                    </span>
                                  ) : "-"}
                                </span>
                              );
                            }

                            if (selectedInvoice === invoice.id) {
                              if (pendingStatus === "dibayar") {
                                return (
                                  <div className="flex flex-col gap-1">
                                    <input
                                      type="text"
                                      value={dibayarOleh}
                                      onChange={(e) => setDibayarOleh(e.target.value)}
                                      placeholder="Pembayar..."
                                      className="text-xs px-2 py-1 w-full border border-green-300 dark:border-green-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                      autoFocus
                                    />
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleConfirmDibayar(invoice.id)}
                                        disabled={isUpdating || !dibayarOleh.trim()}
                                        className="flex-1 text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                      >
                                        OK
                                      </button>
                                      <button
                                        onClick={handleCancelEdit}
                                        className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div className="inline-flex items-center w-auto bg-white dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-sm">
                                  <select
                                    className="text-xs px-3 py-2 bg-transparent text-gray-900 dark:text-white border-none focus:ring-0 focus:outline-none cursor-pointer"
                                    defaultValue=""
                                    onChange={(e) => handleStatusChange(invoice.id, e.target.value as InvoiceStatus)}
                                  >
                                    <option value="" disabled>Pilih</option>
                                    {availableOptions.map((opt) => (
                                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="px-2 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors border-l border-gray-300 dark:border-gray-600"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              );
                            }

                            return (
                              <button
                                onClick={() => setSelectedInvoice(invoice.id)}
                                className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50"
                              >
                                Ubah
                              </button>
                            );
                          })()}
                        </td>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {filteredInvoices.length === 0 ? (
            <div className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
              Tidak ada tagihan yang ditemukan
            </div>
          ) : (
            filteredInvoices.map((invoice, index) => {
              const contract = getContractInfo(invoice.contractId);
              const age = daysAgo(invoice.tanggalDiajukan);
              const isPending = invoice.status === "diajukan" || invoice.status === "diterima";

              return (
                <motion.div
                  key={invoice.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm truncate">
                        {invoice.nomorTagihan}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {contract?.judulPekerjaan}
                      </p>
                    </div>
                    <span className={`ml-2 inline-flex px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                      {INVOICE_STATUS_LABELS[invoice.status]}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatCurrency(invoice.nilaiTagihan)}
                    </span>
                    <span>{contract?.vendor}</span>
                    <span>{new Date(invoice.tanggalDiajukan).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "2-digit" })}</span>
                    {isPending && (
                      <span className={`font-medium ${age > 7 ? "text-red-600" : age > 3 ? "text-yellow-600" : "text-gray-600"}`}>
                        {age}hr
                      </span>
                    )}
                  </div>

                  {canEditStatus && (
                    <div className="mt-3">
                      {(() => {
                        const availableOptions = getAvailableStatusOptions(invoice.status);
                        const canEdit = availableOptions.length > 0;

                        if (!canEdit) {
                          return (
                            <span className="text-xs text-gray-400 dark:text-gray-500 italic">
                              {invoice.status === "dibayar" && invoice.dibayarOleh
                                ? `Final • oleh: ${invoice.dibayarOleh}`
                                : "Final"}
                            </span>
                          );
                        }

                        if (selectedInvoice === invoice.id) {
                          if (pendingStatus === "dibayar") {
                            return (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={dibayarOleh}
                                  onChange={(e) => setDibayarOleh(e.target.value)}
                                  placeholder="Nama pembayar..."
                                  className="flex-1 text-sm px-3 py-1.5 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-700"
                                  autoFocus
                                />
                                <button
                                  onClick={() => handleConfirmDibayar(invoice.id)}
                                  disabled={isUpdating || !dibayarOleh.trim()}
                                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg disabled:opacity-50"
                                >
                                  OK
                                </button>
                                <button onClick={handleCancelEdit} className="px-2 text-red-500">✕</button>
                              </div>
                            );
                          }

                          return (
                            <div className="flex items-center w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm">
                              <select
                                className="flex-1 text-sm px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 border-none focus:ring-0 focus:outline-none cursor-pointer"
                                defaultValue=""
                                onChange={(e) => handleStatusChange(invoice.id, e.target.value as InvoiceStatus)}
                              >
                                <option value="" disabled>Pilih status...</option>
                                {availableOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              <button onClick={handleCancelEdit} className="px-3 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors border-l border-gray-300 dark:border-gray-700">✕</button>
                            </div>
                          );
                        }

                        return (
                          <button
                            onClick={() => setSelectedInvoice(invoice.id)}
                            className="text-sm px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg"
                          >
                            Ubah Status
                          </button>
                        );
                      })()}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
