"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useContractStore, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS, invoiceStatusOptions } from "@/lib/store-new";
import { useAuth } from "@/lib/auth-new";
import type { InvoiceStatus } from "@/lib/types-new";

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)} M`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)} jt`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function daysAgo(date: string): number {
  const now = new Date();
  const target = new Date(date);
  return Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
}

export default function TagihanPage() {
  const { user } = useAuth();
  const { contracts, invoices, updateInvoiceStatus } = useContractStore();
  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "all">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const contract = contracts.find((c) => c.id === inv.contractId);
      const matchSearch = 
        inv.nomorTagihan.toLowerCase().includes(search.toLowerCase()) ||
        contract?.judulPekerjaan.toLowerCase().includes(search.toLowerCase()) ||
        contract?.vendor.toLowerCase().includes(search.toLowerCase());
      const matchStatus = status === "all" || inv.status === status;
      return matchSearch && matchStatus;
    }).sort((a, b) => new Date(b.tanggalDiajukan).getTime() - new Date(a.tanggalDiajukan).getTime());
  }, [invoices, contracts, search, status]);

  const getContractInfo = (contractId: string) => {
    return contracts.find((c) => c.id === contractId);
  };

  const handleStatusChange = (invoiceId: string, newStatus: InvoiceStatus) => {
    updateInvoiceStatus(invoiceId, newStatus, user?.id || "system");
    setSelectedInvoice(null);
  };

  const canEditStatus = user?.role === "admin" || user?.role === "manajemen";

  const statusStats = useMemo(() => {
    return {
      diajukan: invoices.filter((i) => i.status === "diajukan").length,
      diverifikasi: invoices.filter((i) => i.status === "diverifikasi").length,
      dibayar: invoices.filter((i) => i.status === "dibayar").length,
      ditolak: invoices.filter((i) => i.status === "ditolak").length,
    };
  }, [invoices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daftar Tagihan</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredInvoices.length} tagihan ditemukan
          </p>
        </div>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Diajukan</p>
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{statusStats.diajukan}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Diverifikasi</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{statusStats.diverifikasi}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Dibayar</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{statusStats.dibayar}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Ditolak</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">{statusStats.ditolak}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pencarian</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor tagihan, kontrak, atau vendor..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus | "all")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              {invoiceStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-6 py-4">No Tagihan</th>
                <th className="px-6 py-4">Kontrak</th>
                <th className="px-6 py-4">Vendor</th>
                <th className="px-6 py-4">Nilai</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Umur</th>
                {canEditStatus && <th className="px-6 py-4">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={canEditStatus ? 8 : 7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada tagihan yang ditemukan
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice, index) => {
                  const contract = getContractInfo(invoice.contractId);
                  const age = daysAgo(invoice.tanggalDiajukan);
                  const isPending = invoice.status === "diajukan" || invoice.status === "diverifikasi";
                  
                  return (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{invoice.nomorTagihan}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-700 dark:text-gray-300 text-sm">
                          {contract?.judulPekerjaan.substring(0, 30)}...
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">{contract?.vendor}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(invoice.nilaiTagihan)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {new Date(invoice.tanggalDiajukan).toLocaleDateString("id-ID")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                          {INVOICE_STATUS_LABELS[invoice.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isPending && (
                          <span className={`text-sm font-medium ${
                            age > 7 ? "text-red-600" : age > 3 ? "text-yellow-600" : "text-gray-600"
                          }`}>
                            {age} hari
                          </span>
                        )}
                        {invoice.status === "dibayar" && invoice.tanggalDibayar && (
                          <span className="text-sm text-green-600">
                            {new Date(invoice.tanggalDibayar).toLocaleDateString("id-ID")}
                          </span>
                        )}
                      </td>
                      {canEditStatus && (
                        <td className="px-6 py-4">
                          {selectedInvoice === invoice.id ? (
                            <div className="flex items-center gap-2">
                              <select
                                className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                defaultValue={invoice.status}
                                onChange={(e) => handleStatusChange(invoice.id, e.target.value as InvoiceStatus)}
                              >
                                {invoiceStatusOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => setSelectedInvoice(null)}
                                className="text-xs text-gray-500 hover:text-gray-700"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setSelectedInvoice(invoice.id)}
                              className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                            >
                              Ubah Status
                            </button>
                          )}
                        </td>
                      )}
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
