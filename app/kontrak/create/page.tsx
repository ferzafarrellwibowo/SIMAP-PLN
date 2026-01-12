"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useContractStore, CONTRACT_CATEGORY_LABELS, JENIS_ANGGARAN_LABELS } from "@/lib/store-new";
import { useAuth } from "@/lib/auth-new";
import type { ContractCategory, JenisAnggaran } from "@/lib/types-new";

export default function CreateContractPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createContract } = useContractStore();

  const [formData, setFormData] = useState({
    uraianKegiatan: "",
    noPerjanjian: "",
    tanggalPerjanjian: "",
    tanggalBerakhir: "",
    judulPekerjaan: "",
    nilaiKontrak: "",
    vendor: "",
    kategori: "investasi" as ContractCategory,
    jenisAnggaran: "AI" as JenisAnggaran,
    unit: "",
    unitSektorK: "",
    noSKWE: "",
    posAngg: "",
    noSKUSKKO: "",
    noSE: "",
    noPO: "",
    submissionId: "",
    jenisPekerjaan: "",
    bebanTahun: new Date().getFullYear().toString(),
    konfirmasiNonRutin: "Rutin",
    bidang: "",
    keterangan: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-update jenisAnggaran based on kategori
    if (name === "kategori") {
      setFormData((prev) => ({
        ...prev,
        jenisAnggaran: value === "investasi" ? "AI" : "AO",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validation
      if (!formData.judulPekerjaan || !formData.noPerjanjian || !formData.vendor || !formData.nilaiKontrak) {
        alert("Mohon lengkapi field yang wajib diisi (ditandai dengan *)");
        setIsSubmitting(false);
        return;
      }

      // Create contract object
      const newContract = {
        no: 0, // Will be auto-assigned by store
        uraianKegiatan: formData.uraianKegiatan,
        noPerjanjian: formData.noPerjanjian,
        tanggalPerjanjian: formData.tanggalPerjanjian,
        tanggalBerakhir: formData.tanggalBerakhir,
        judulPekerjaan: formData.judulPekerjaan,
        nilaiKontrak: parseFloat(formData.nilaiKontrak),
        vendor: formData.vendor,
        nilaiTagihanKontrakPusat: 0,
        nilaiTagihanUnitInduk: 0,
        kategori: formData.kategori,
        jenisAnggaran: formData.jenisAnggaran,
        unit: formData.unit || user?.unit || "",
        unitSektorK: formData.unitSektorK,
        noSKWE: formData.noSKWE,
        posAngg: formData.posAngg,
        noSKUSKKO: formData.noSKUSKKO,
        noSE: formData.noSE,
        noPO: formData.noPO,
        submissionId: formData.submissionId,
        jenisPekerjaan: formData.jenisPekerjaan,
        bebanTahun: formData.bebanTahun,
        konfirmasiNonRutin: formData.konfirmasiNonRutin,
        bidang: formData.bidang,
        keterangan: formData.keterangan,
        status: "aktif" as const,
      };

      createContract(newContract);
      
      // Redirect to contract list
      router.push("/kontrak");
    } catch (error) {
      console.error("Error creating contract:", error);
      alert("Terjadi kesalahan saat membuat kontrak");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Akses Ditolak</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Anda tidak memiliki akses untuk menambah kontrak.</p>
          <Link
            href="/kontrak"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Kembali ke Daftar Kontrak
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/kontrak" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <span className="text-gray-300 dark:text-gray-600">/</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">Tambah Kontrak</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Tambah Kontrak Baru</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Lengkapi formulir di bawah untuk menambahkan kontrak baru
        </p>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
      >
        {/* Informasi Dasar */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informasi Dasar</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Judul Pekerjaan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="judulPekerjaan"
                value={formData.judulPekerjaan}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Pembangunan GI 150kV"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                No Perjanjian <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="noPerjanjian"
                value={formData.noPerjanjian}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: 0001/PLN/KTR/2026"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Uraian Kegiatan
              </label>
              <input
                type="text"
                name="uraianKegiatan"
                value={formData.uraianKegiatan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Pengadaan Trafo 60 MVA"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vendor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: PT Wijaya Karya"
              />
            </div>
          </div>
        </div>

        {/* Kategori & Keuangan */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Kategori & Keuangan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kategori
              </label>
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="investasi">Investasi</option>
                <option value="pemeliharaan">Pemeliharaan</option>
                <option value="administrasi">Administrasi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jenis Anggaran
              </label>
              <input
                type="text"
                value={`${formData.jenisAnggaran} - ${JENIS_ANGGARAN_LABELS[formData.jenisAnggaran]}`}
                disabled
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nilai Kontrak (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="nilaiKontrak"
                value={formData.nilaiKontrak}
                onChange={handleChange}
                required
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: 15000000000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Jenis Pekerjaan
              </label>
              <input
                type="text"
                name="jenisPekerjaan"
                value={formData.jenisPekerjaan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Konstruksi"
              />
            </div>
          </div>
        </div>

        {/* Tanggal */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Jadwal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tanggal Perjanjian
              </label>
              <input
                type="date"
                name="tanggalPerjanjian"
                value={formData.tanggalPerjanjian}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tanggal Berakhir
              </label>
              <input
                type="date"
                name="tanggalBerakhir"
                value={formData.tanggalBerakhir}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Beban Tahun
              </label>
              <input
                type="text"
                name="bebanTahun"
                value={formData.bebanTahun}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="2026"
              />
            </div>
          </div>
        </div>

        {/* Unit & Lokasi */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Unit & Lokasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: PLN UP3 Jakarta Selatan"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit Sektor K
              </label>
              <input
                type="text"
                name="unitSektorK"
                value={formData.unitSektorK}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Sektor A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bidang
              </label>
              <input
                type="text"
                name="bidang"
                value={formData.bidang}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Pengembangan"
              />
            </div>
          </div>
        </div>

        {/* Dokumen & Nomor Referensi */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Dokumen & Nomor Referensi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                No SK/WE
              </label>
              <input
                type="text"
                name="noSKWE"
                value={formData.noSKWE}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                No SKU/SKKO
              </label>
              <input
                type="text"
                name="noSKUSKKO"
                value={formData.noSKUSKKO}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                No SE
              </label>
              <input
                type="text"
                name="noSE"
                value={formData.noSE}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                No PO
              </label>
              <input
                type="text"
                name="noPO"
                value={formData.noPO}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pos Anggaran
              </label>
              <input
                type="text"
                name="posAngg"
                value={formData.posAngg}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Submission ID
              </label>
              <input
                type="text"
                name="submissionId"
                value={formData.submissionId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Konfirmasi/Non Rutin
              </label>
              <select
                name="konfirmasiNonRutin"
                value={formData.konfirmasiNonRutin}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Rutin">Rutin</option>
                <option value="Non Rutin">Non Rutin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Keterangan */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Keterangan</h2>
          <textarea
            name="keterangan"
            value={formData.keterangan}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tambahkan catatan atau keterangan tambahan..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/kontrak"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Simpan Kontrak
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
