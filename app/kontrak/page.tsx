"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useContractStore, CONTRACT_CATEGORY_LABELS, CONTRACT_CATEGORY_COLORS, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS, JENIS_ANGGARAN_LABELS, JENIS_ANGGARAN_COLORS, contractCategoryOptions, contractStatusOptions, jenisAnggaranOptions } from "@/lib/store-new";
import { useAuth } from "@/lib/auth-new";
import type { ContractCategory, ContractStatus, JenisAnggaran } from "@/lib/types-new";

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)} M`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)} jt`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function KontrakPage() {
  const { user } = useAuth();
  const { contracts } = useContractStore();
  const searchParams = useSearchParams();
  
  const initialKategori = searchParams.get("kategori") as ContractCategory | null;
  
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState<ContractCategory | "all">(initialKategori || "all");
  const [status, setStatus] = useState<ContractStatus | "all">("all");
  const [jenisAnggaran, setJenisAnggaran] = useState<JenisAnggaran | "all">("all");

  const filteredContracts = useMemo(() => {
    return contracts.filter((c) => {
      const matchSearch = c.judulPekerjaan.toLowerCase().includes(search.toLowerCase()) ||
        c.vendor.toLowerCase().includes(search.toLowerCase()) ||
        c.noPerjanjian.toLowerCase().includes(search.toLowerCase());
      const matchKategori = kategori === "all" || c.kategori === kategori;
      const matchStatus = status === "all" || c.status === status;
      const matchJenisAnggaran = jenisAnggaran === "all" || c.jenisAnggaran === jenisAnggaran;
      return matchSearch && matchKategori && matchStatus && matchJenisAnggaran;
    });
  }, [contracts, search, kategori, status, jenisAnggaran]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Daftar Kontrak</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredContracts.length} kontrak ditemukan
          </p>
        </div>
        {(user?.role === "admin" || user?.role === "operator") && (
          <Link
            href="/kontrak/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Kontrak
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pencarian</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, vendor, atau nomor..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Anggaran</label>
            <select
              value={jenisAnggaran}
              onChange={(e) => setJenisAnggaran(e.target.value as JenisAnggaran | "all")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {jenisAnggaranOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as ContractCategory | "all")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Kategori</option>
              {contractCategoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ContractStatus | "all")}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              {contractStatusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contract List */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400">Tidak ada kontrak yang ditemukan</p>
          </div>
        ) : (
          filteredContracts.map((contract, index) => (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Left Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${JENIS_ANGGARAN_COLORS[contract.jenisAnggaran]}`}>
                      {contract.jenisAnggaran}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${CONTRACT_CATEGORY_COLORS[contract.kategori]}`}>
                      {CONTRACT_CATEGORY_LABELS[contract.kategori]}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${CONTRACT_STATUS_COLORS[contract.status]}`}>
                      {CONTRACT_STATUS_LABELS[contract.status]}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    {contract.judulPekerjaan}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <span className="font-medium">No Perjanjian:</span> {contract.noPerjanjian}
                    </p>
                    <p>
                      <span className="font-medium">Vendor:</span> {contract.vendor}
                    </p>
                    <p>
                      <span className="font-medium">Tanggal:</span> {new Date(contract.tanggalPerjanjian).toLocaleDateString("id-ID")}
                    </p>
                    <p>
                      <span className="font-medium">Unit:</span> {contract.unit}
                    </p>
                    <p>
                      <span className="font-medium">Bidang:</span> {contract.bidang || "-"}
                    </p>
                    <p>
                      <span className="font-medium">Jenis:</span> {contract.jenisPekerjaan || "-"}
                    </p>
                    {contract.noPO && (
                      <p>
                        <span className="font-medium">No PO:</span> {contract.noPO}
                      </p>
                    )}
                    {contract.noXPS && (
                      <p>
                        <span className="font-medium">No XPS:</span> {contract.noXPS}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">PIC:</span> {contract.picName || "-"}
                    </p>
                  </div>
                </div>

                {/* Right Content */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nilai Kontrak</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(contract.nilaiKontrak)}
                    </p>
                  </div>
                  
                  <div className="w-48">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Realisasi</span>
                      <span className={`font-medium ${
                        contract.persentaseRealisasi > 90 ? "text-red-600" :
                        contract.persentaseRealisasi > 70 ? "text-yellow-600" : "text-green-600"
                      }`}>
                        {contract.persentaseRealisasi.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          contract.persentaseRealisasi > 90 ? "bg-red-500" :
                          contract.persentaseRealisasi > 70 ? "bg-yellow-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min(contract.persentaseRealisasi, 100)}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/kontrak/${contract.id}`}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
