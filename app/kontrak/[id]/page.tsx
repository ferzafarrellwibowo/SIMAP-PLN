"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useContractStore, CONTRACT_CATEGORY_LABELS, CONTRACT_CATEGORY_COLORS, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS, JENIS_ANGGARAN_LABELS, JENIS_ANGGARAN_COLORS, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "@/lib/store-new";
import { useAuth } from "@/lib/auth-new";

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(2)} M`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)} jt`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function KontrakDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { getContractById, getInvoicesByContract, updateContract } = useContractStore();
  
  const contractId = params.id as string;
  const contract = useMemo(() => getContractById(contractId), [contractId, getContractById]);
  const invoices = useMemo(() => getInvoicesByContract(contractId), [contractId, getInvoicesByContract]);
  
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [progressValue, setProgressValue] = useState(contract?.progressPekerjaan.toString() || "0");
  const [isSavingProgress, setIsSavingProgress] = useState(false);

  const handleSaveProgress = async () => {
    const newProgress = parseFloat(progressValue);
    if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) {
      alert("Progress harus antara 0-100%");
      return;
    }
    
    setIsSavingProgress(true);
    try {
      await updateContract(contractId, { progressPekerjaan: newProgress });
      setIsEditingProgress(false);
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Gagal menyimpan progress pekerjaan');
    } finally {
      setIsSavingProgress(false);
    }
  };

  const handleCancelEdit = () => {
    setProgressValue(contract?.progressPekerjaan.toString() || "0");
    setIsEditingProgress(false);
  };

  if (!contract) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Kontrak Tidak Ditemukan</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Kontrak dengan ID "{contractId}" tidak ditemukan dalam sistem.</p>
          <Link
            href="/kontrak"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Daftar Kontrak
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/kontrak" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <span className="text-gray-300 dark:text-gray-600">/</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Detail Kontrak</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {contract.judulPekerjaan}
          </h1>
          <div className="flex items-center gap-2 flex-wrap">
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
        </div>
        
        {user?.role === "admin" && (
          <div className="flex items-center gap-2">
            <Link
              href={`/tagihan/create?contractId=${contract.id}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                contract.persentaseRealisasi >= 100
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              {...(contract.persentaseRealisasi >= 100 ? { 
                onClick: (e) => e.preventDefault(),
                title: "Tidak dapat menambah tagihan karena serapan anggaran sudah mencapai 100%"
              } : {})}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Tambah Tagihan
            </Link>
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Informasi Kontrak</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No Perjanjian</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.noPerjanjian}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vendor</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.vendor}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Jenis Pekerjaan</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.jenisPekerjaan || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tanggal Perjanjian</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(contract.tanggalPerjanjian)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tanggal Berakhir</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(contract.tanggalBerakhir)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Beban Tahun</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.bebanTahun || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Uraian Kegiatan</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.uraianKegiatan}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Jenis Anggaran</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${JENIS_ANGGARAN_COLORS[contract.jenisAnggaran]}`}>
                  {JENIS_ANGGARAN_LABELS[contract.jenisAnggaran]}
                </span>
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bidang</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.bidang || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unit</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.unit}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unit Sektor K</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.unitSektorK || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Konfirmasi/Non Rutin</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.konfirmasiNonRutin || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">PIC</p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.picName || "-"}</p>
            </div>
          </div>

          {/* SK/WE & Dokumen Section */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Informasi SK/WE & Dokumen</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No SK/WE</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.noSKWE || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No SKU/SKKO</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.noSKUSKKO || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No SE</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.noSE || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No PO</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.noPO || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pos Anggaran</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.posAngg || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Submission ID</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.submissionId || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Request Tgl SE Relasi</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.requestTanggalSERelasi ? formatDate(contract.requestTanggalSERelasi) : "-"}</p>
              </div>
            </div>
          </div>

          {/* XPS & Berita Acara Section */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">XPS & Berita Acara</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contract.noXPS && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No XPS</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.noXPS}</p>
                </div>
              )}
              {contract.tanggalXPS && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tanggal XPS</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(contract.tanggalXPS)}</p>
                </div>
              )}
              {contract.noBeritaAcara && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No Berita Acara</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.noBeritaAcara}</p>
                </div>
              )}
              {contract.tanggalBeritaAcara && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tanggal Berita Acara</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(contract.tanggalBeritaAcara)}</p>
                </div>
              )}
              {contract.noBeritaAcaraSKRelasi && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No BA SK/Relasi</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.noBeritaAcaraSKRelasi}</p>
                </div>
              )}
              {contract.tanggalArsip && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tanggal Arsip</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(contract.tanggalArsip)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Section */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Informasi Tambahan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Entry By</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.entryBy || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unit Terbayar</p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.unitTerbayar || "-"}</p>
              </div>
              {contract.oldFlag && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Old Flag</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{contract.oldFlag}</p>
                </div>
              )}
              {contract.keterangan && (
                <div className="md:col-span-2 lg:col-span-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Keterangan</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{contract.keterangan}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Financial Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Ringkasan Keuangan</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nilai Kontrak</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(contract.nilaiKontrak)}</p>
            </div>
            
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            
            {/* Serapan Anggaran */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400" title="Persentase penggunaan anggaran: Hijau (≤50%), Kuning (50-90%), Merah (>90%)">Serapan Anggaran</span>
                <span className={`font-semibold ${
                  contract.persentaseRealisasi > 90 ? "text-red-600" :
                  contract.persentaseRealisasi > 50 ? "text-yellow-600" : "text-green-600"
                }`}>
                  {contract.persentaseRealisasi.toFixed(1)}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(contract.persentaseRealisasi, 100)}%` }}
                  transition={{ duration: 0.8 }}
                  className={`h-full rounded-full ${
                    contract.persentaseRealisasi > 90 ? "bg-red-500" :
                    contract.persentaseRealisasi > 50 ? "bg-yellow-500" : "bg-green-500"
                  }`}
                />
              </div>
            </div>
            
            {/* Progres Pekerjaan */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400" title="Persentase penyelesaian fisik pekerjaan">Progres Pekerjaan</span>
                <div className="flex items-center gap-2">
                  {!isEditingProgress ? (
                    <>
                      <span className={`font-semibold ${
                        contract.progressPekerjaan >= 90 ? "text-blue-600" :
                        contract.progressPekerjaan >= 50 ? "text-teal-600" : "text-green-600"
                      }`}>
                        {contract.progressPekerjaan.toFixed(1)}%
                      </span>
                      {user?.role === "admin" && (
                        <button
                          onClick={() => setIsEditingProgress(true)}
                          className="text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit progres pekerjaan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={progressValue}
                        onChange={(e) => setProgressValue(e.target.value)}
                        disabled={isSavingProgress}
                        className="w-16 px-2 py-0.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                        autoFocus
                      />
                      <span className="text-xs text-gray-500">%</span>
                      <button
                        onClick={handleSaveProgress}
                        disabled={isSavingProgress}
                        className="text-green-600 hover:text-green-700 p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Simpan"
                      >
                        {isSavingProgress ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isSavingProgress}
                        className="text-red-600 hover:text-red-700 p-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Batal"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(contract.progressPekerjaan, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`h-full rounded-full ${
                    contract.progressPekerjaan >= 90 ? "bg-blue-500" :
                    contract.progressPekerjaan >= 50 ? "bg-teal-500" : "bg-green-500"
                  }`}
                />
              </div>
            </div>
            
              <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-600 dark:text-green-400 mb-1">Serapan</p>
                <p className="text-sm font-bold text-green-700 dark:text-green-300">{formatCurrency(contract.totalTagihanDibayar)}</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Sisa Anggaran</p>
                <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{formatCurrency(contract.sisaAnggaran)}</p>
              </div>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-700" />

            {/* Detail Tagihan */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tagihan Kontrak Pusat</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(contract.nilaiTagihanKontrakPusat)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Tagihan Unit Induk</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(contract.nilaiTagihanUnitInduk)}</span>
              </div>
              {contract.nilaiBeritaAcara && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Nilai Berita Acara</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(contract.nilaiBeritaAcara)}</span>
                </div>
              )}
              {contract.batasPaguTerbayar && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Batas Pagu Terbayar</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(contract.batasPaguTerbayar)}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Invoices / Tagihan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daftar Tagihan</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{invoices.length} tagihan</span>
        </div>
        
        {invoices.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">Belum ada tagihan untuk kontrak ini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">No Tagihan</th>
                  <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">Tanggal</th>
                  <th className="text-right py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">Nilai</th>
                  <th className="text-center py-3 px-2 text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{invoice.nomorTagihan}</p>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(invoice.tanggalTagihan)}
                    </td>
                    <td className="py-3 px-2 text-sm font-medium text-gray-900 dark:text-gray-100 text-right">
                      {formatCurrency(invoice.nilaiTagihan)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${INVOICE_STATUS_COLORS[invoice.status]}`}>
                        {INVOICE_STATUS_LABELS[invoice.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
