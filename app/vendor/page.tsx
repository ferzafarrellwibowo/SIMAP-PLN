"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/lib/auth-new";
import { useContractStore, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS, INVOICE_STATUS_LABELS, INVOICE_STATUS_COLORS } from "@/lib/store-new";

function formatCurrency(value: number | undefined | null): string {
  if (!value || value === 0) return "Rp 0";
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

export default function VendorDashboardPage() {
  const { user } = useAuth();
  const { contracts, getInvoicesByContract } = useContractStore();

  // Vendor can only see their own contract
  const vendorContract = useMemo(() => {
    if (!user?.contractId) return null;
    return contracts.find((c) => c.id === user.contractId);
  }, [contracts, user]);

  const vendorInvoices = useMemo(() => {
    if (!vendorContract) return [];
    return getInvoicesByContract(vendorContract.id);
  }, [vendorContract, getInvoicesByContract]);

  // Tabs
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "progress" | "perpanjangan">("overview");

  // Forms
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [showProgressForm, setShowProgressForm] = useState(false);
  const [showPerpanjanganForm, setShowPerpanjanganForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Invoice form
  const [invoiceData, setInvoiceData] = useState({ nomorTagihan: "", nilaiTagihan: "", keterangan: "" });
  // Progress form
  const [progressData, setProgressData] = useState({ progress: "", keterangan: "" });
  // Perpanjangan form
  const [perpanjanganData, setPerpanjanganData] = useState({ tanggalBerakhirBaru: "", alasan: "" });

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "invoice_payment",
          contractId: vendorContract?.id,
          requestedBy: user?.id,
          requestedByName: `${user?.name} (${user?.vendorCompany || user?.unit})`,
          title: `Invoice ${invoiceData.nomorTagihan} - ${vendorContract?.judulPekerjaan}`,
          description: invoiceData.keterangan || `Pengajuan invoice senilai ${formatCurrency(parseFloat(invoiceData.nilaiTagihan))}`,
        }),
      });
      setShowInvoiceForm(false);
      setInvoiceData({ nomorTagihan: "", nilaiTagihan: "", keterangan: "" });
      setSuccessMessage("Invoice berhasil diajukan. Menunggu persetujuan Admin.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      console.error("Error submitting invoice:", error);
    }
  };

  const handleSubmitProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "update_progress",
          contractId: vendorContract?.id,
          requestedBy: user?.id,
          requestedByName: `${user?.name} (${user?.vendorCompany || user?.unit})`,
          title: `Update Progress ${progressData.progress}% - ${vendorContract?.judulPekerjaan}`,
          description: progressData.keterangan || `Pengajuan update progress ke ${progressData.progress}%`,
          proposedProgress: parseFloat(progressData.progress),
          currentProgress: vendorContract?.progressPekerjaan || 0,
        }),
      });
      setShowProgressForm(false);
      setProgressData({ progress: "", keterangan: "" });
      setSuccessMessage("Update progress berhasil diajukan. Menunggu persetujuan Admin.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      console.error("Error submitting progress:", error);
    }
  };

  const handleSubmitPerpanjangan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "perpanjangan_kontrak",
          contractId: vendorContract?.id,
          requestedBy: user?.id,
          requestedByName: `${user?.name} (${user?.vendorCompany || user?.unit})`,
          title: `Perpanjangan Kontrak - ${vendorContract?.judulPekerjaan}`,
          description: perpanjanganData.alasan || "Pengajuan perpanjangan kontrak",
          proposedEndDate: perpanjanganData.tanggalBerakhirBaru,
          currentEndDate: vendorContract?.tanggalBerakhir,
        }),
      });
      setShowPerpanjanganForm(false);
      setPerpanjanganData({ tanggalBerakhirBaru: "", alasan: "" });
      setSuccessMessage("Pengajuan perpanjangan kontrak berhasil dikirim. Menunggu review Admin.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (error) {
      console.error("Error submitting perpanjangan:", error);
    }
  };

  if (!user || user.role !== "vendor") {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500 mb-6">Halaman ini hanya untuk Vendor.</p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!vendorContract) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Kontrak Tidak Ditemukan</h2>
          <p className="text-gray-500">Kontrak yang terkait dengan akun Anda tidak ditemukan.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Portal Vendor</h1>
            <p className="text-sm text-gray-500 mt-1">Selamat datang, {user.name} ({user.vendorCompany})</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${CONTRACT_STATUS_COLORS[vendorContract.status]}`}>
            {CONTRACT_STATUS_LABELS[vendorContract.status]}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 font-medium">Nilai Kontrak</p>
            <p className="text-lg font-bold text-blue-900">{formatCurrency(vendorContract.nilaiKontrak)}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 font-medium">Terbayar</p>
            <p className="text-lg font-bold text-green-900">{formatCurrency(vendorContract.terbayar)}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-purple-600 font-medium">Progress</p>
            <p className="text-lg font-bold text-purple-900">{vendorContract.progressPekerjaan?.toFixed(1)}%</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-orange-600 font-medium">Berakhir</p>
            <p className="text-lg font-bold text-orange-900">{formatDate(vendorContract.tanggalBerakhir)}</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-lg bg-green-50 border border-green-200">
          <p className="text-sm text-green-700 font-medium">✓ {successMessage}</p>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: "overview", label: "Detail Kontrak" },
              { id: "invoices", label: "Invoice/Tagihan" },
              { id: "progress", label: "Update Progress" },
              { id: "perpanjangan", label: "Perpanjangan" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Informasi Kontrak</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">No. Perjanjian</p>
                  <p className="font-medium text-gray-900">{vendorContract.noPerjanjian}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Judul Pekerjaan</p>
                  <p className="font-medium text-gray-900">{vendorContract.judulPekerjaan}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Perjanjian</p>
                  <p className="font-medium text-gray-900">{formatDate(vendorContract.tanggalPerjanjian)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tanggal Berakhir</p>
                  <p className="font-medium text-gray-900">{formatDate(vendorContract.tanggalBerakhir)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Kategori</p>
                  <p className="font-medium text-gray-900 capitalize">{vendorContract.kategori}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit</p>
                  <p className="font-medium text-gray-900">{vendorContract.unit}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">Progress Pekerjaan</p>
                  <p className="text-sm font-bold text-gray-900">{vendorContract.progressPekerjaan?.toFixed(1)}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(vendorContract.progressPekerjaan || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Invoices Tab */}
          {activeTab === "invoices" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Daftar Invoice</h3>
                <button onClick={() => setShowInvoiceForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  + Ajukan Invoice
                </button>
              </div>

              {/* Invoice Form */}
              {showInvoiceForm && (
                <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmitInvoice} className="p-4 bg-blue-50 rounded-lg border border-blue-200 space-y-3">
                  <h4 className="font-medium text-blue-900">Ajukan Invoice Baru</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input type="text" placeholder="Nomor Invoice" value={invoiceData.nomorTagihan} onChange={(e) => setInvoiceData({ ...invoiceData, nomorTagihan: e.target.value })} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900" />
                    <input type="number" placeholder="Nilai (Rp)" value={invoiceData.nilaiTagihan} onChange={(e) => setInvoiceData({ ...invoiceData, nilaiTagihan: e.target.value })} required className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900" />
                  </div>
                  <textarea placeholder="Keterangan" value={invoiceData.keterangan} onChange={(e) => setInvoiceData({ ...invoiceData, keterangan: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 resize-none" rows={2} />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Kirim</button>
                    <button type="button" onClick={() => setShowInvoiceForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Batal</button>
                  </div>
                </motion.form>
              )}

              {/* Invoice List */}
              {vendorInvoices.length === 0 ? (
                <p className="text-gray-500 text-sm">Belum ada invoice.</p>
              ) : (
                <div className="space-y-3">
                  {vendorInvoices.map((inv) => (
                    <div key={inv.id} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{inv.nomorTagihan}</p>
                        <p className="text-xs text-gray-500">{formatDate(inv.tanggalTagihan)} • {formatCurrency(inv.nilaiTagihan)}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${INVOICE_STATUS_COLORS[inv.status]}`}>
                        {INVOICE_STATUS_LABELS[inv.status]}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === "progress" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Update Progress Pekerjaan</h3>
                <button onClick={() => setShowProgressForm(true)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                  + Update Progress
                </button>
              </div>

              {/* Progress Form */}
              {showProgressForm && (
                <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmitProgress} className="p-4 bg-green-50 rounded-lg border border-green-200 space-y-3">
                  <h4 className="font-medium text-green-900">Ajukan Update Progress</h4>
                  <p className="text-sm text-green-700">Progress saat ini: <strong>{vendorContract.progressPekerjaan?.toFixed(1)}%</strong></p>
                  <input type="number" placeholder="Progress baru (%)" min="0" max="100" step="0.1" value={progressData.progress} onChange={(e) => setProgressData({ ...progressData, progress: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900" />
                  <textarea placeholder="Keterangan progress (apa yang sudah dikerjakan)" value={progressData.keterangan} onChange={(e) => setProgressData({ ...progressData, keterangan: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 resize-none" rows={3} />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">Kirim</button>
                    <button type="button" onClick={() => setShowProgressForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Batal</button>
                  </div>
                </motion.form>
              )}

              {/* Current Progress Display */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-gray-700">Progress Pekerjaan Saat Ini</p>
                  <p className="text-2xl font-bold text-gray-900">{vendorContract.progressPekerjaan?.toFixed(1)}%</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-green-600 h-4 rounded-full transition-all" style={{ width: `${Math.min(vendorContract.progressPekerjaan || 0, 100)}%` }} />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Perubahan progress memerlukan persetujuan Admin sebelum diterapkan.
                </p>
              </div>
            </div>
          )}

          {/* Perpanjangan Tab */}
          {activeTab === "perpanjangan" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Pengajuan Perpanjangan Kontrak</h3>
                <button onClick={() => setShowPerpanjanganForm(true)} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                  + Ajukan Perpanjangan
                </button>
              </div>

              {/* Perpanjangan Form */}
              {showPerpanjanganForm && (
                <motion.form initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleSubmitPerpanjangan} className="p-4 bg-orange-50 rounded-lg border border-orange-200 space-y-3">
                  <h4 className="font-medium text-orange-900">Ajukan Perpanjangan Kontrak</h4>
                  <p className="text-sm text-orange-700">Tanggal berakhir saat ini: <strong>{formatDate(vendorContract.tanggalBerakhir)}</strong></p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berakhir Baru</label>
                    <input type="date" value={perpanjanganData.tanggalBerakhirBaru} onChange={(e) => setPerpanjanganData({ ...perpanjanganData, tanggalBerakhirBaru: e.target.value })} required min={vendorContract.tanggalBerakhir} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900" />
                  </div>
                  <textarea placeholder="Alasan perpanjangan kontrak" value={perpanjanganData.alasan} onChange={(e) => setPerpanjanganData({ ...perpanjanganData, alasan: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 resize-none" rows={3} />
                  <div className="flex gap-2">
                    <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">Kirim</button>
                    <button type="button" onClick={() => setShowPerpanjanganForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Batal</button>
                  </div>
                </motion.form>
              )}

              {/* Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Informasi Kontrak</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Tanggal Mulai</p>
                    <p className="font-medium text-gray-900">{formatDate(vendorContract.tanggalPerjanjian)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal Berakhir</p>
                    <p className="font-medium text-gray-900">{formatDate(vendorContract.tanggalBerakhir)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Pengajuan perpanjangan akan direview oleh Admin. Admin dapat menyetujui, menolak, atau menegosiasi tanggal akhir.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
