"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useContractStore, CONTRACT_CATEGORY_LABELS } from "@/lib/store-new";
import { useAuth } from "@/lib/auth-new";
import type { ContractCategory, JenisAnggaran, CRStatus } from "@/lib/types-new";

// Helper function to generate auto IDs
function generateNoPerjanjian(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `03${randomNum}Pj/STH.01.01/F0107${randomNum}00/${year}`;
}

function generateNoWBSPosAnggaran(): string {
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `I.1001.23.21.0805.${String(randomNum).padStart(3, "0")}`;
}

function generateNoSKKI(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `${randomNum}/KEU.00.03/EVP MUM/${year}`;
}

function generateNoSE(): string {
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `100369${randomNum}`;
}

function generateNoPO(): string {
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return `310148${randomNum}`;
}

function generateSubmissionIdVIP(): string {
  const year = new Date().getFullYear();
  const randomNum1 = Math.floor(Math.random() * 9000) + 1000;
  const randomNum2 = Math.floor(Math.random() * 90000) + 10000;
  return `TRE-V/${randomNum1}/${year}/00000${randomNum2}`;
}

function generateNoPRK(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(Math.random() * 900) + 100;
  return `${year}.KPST.21.${String(randomNum).padStart(3, "0")}`;
}

// Helper function to format currency to readable text
function formatCurrencyText(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num) || num === 0) return '';
  
  if (num >= 1000000000000) {
    const triliun = num / 1000000000000;
    return `Rp ${triliun.toLocaleString('id-ID', { maximumFractionDigits: 2 })} triliun`;
  } else if (num >= 1000000000) {
    const miliar = num / 1000000000;
    return `Rp ${miliar.toLocaleString('id-ID', { maximumFractionDigits: 2 })} miliar`;
  } else if (num >= 1000000) {
    const juta = num / 1000000;
    return `Rp ${juta.toLocaleString('id-ID', { maximumFractionDigits: 2 })} jt`;
  } else if (num >= 1000) {
    const ribu = num / 1000;
    return `Rp ${ribu.toLocaleString('id-ID', { maximumFractionDigits: 2 })} rb`;
  }
  return `Rp ${num.toLocaleString('id-ID')}`;
}

export default function CreateContractPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createContract } = useContractStore();

  // Form data untuk kategori investasi
  const [formData, setFormData] = useState({
    // Field yang perlu diinput manual untuk Investasi
    kategori: "investasi" as ContractCategory,
    tanggalPerjanjian: "",
    tanggalBerakhir: "",
    judulPRK: "",
    nilaiPerjanjian: "",
    namaVendor: "",
    nilaiTagihan: "",
    namaPekerjaan: "",
    jenisAI: "AI" as JenisAnggaran,
    crNotCR: "Not CR" as CRStatus,
    unit: "",
    keterangan: "",
    
    // Field untuk kategori lain (pemeliharaan & administrasi)
    uraianKegiatan: "",
    noPerjanjian: "",
    judulPekerjaan: "",
    nilaiKontrak: "",
    vendor: "",
    picName: "",
    unitSektorK: "",
    unitTerbayar: "",
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
    requestTanggalSERelasi: "",
    noXPS: "",
    tanggalXPS: "",
    noBeritaAcara: "",
    tanggalBeritaAcara: "",
    noBeritaAcaraSKRelasi: "",
    tanggalArsip: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user changes input
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (formData.kategori === "investasi") {
        // Validation for Investasi category
        if (!formData.tanggalPerjanjian || !formData.tanggalBerakhir || !formData.judulPRK || 
            !formData.nilaiPerjanjian || !formData.namaVendor || !formData.nilaiTagihan ||
            !formData.namaPekerjaan) {
          setErrorMessage("Mohon lengkapi field yang wajib diisi (ditandai dengan *)");
          window.scrollTo({ top: 0, behavior: "smooth" });
          setIsSubmitting(false);
          return;
        }

        // Auto-generate fields for Investasi
        const noPerjanjian = generateNoPerjanjian();
        const noWBSPosAnggaran = generateNoWBSPosAnggaran();
        const noSKKI = generateNoSKKI();
        const noSE = generateNoSE();
        const noPO = generateNoPO();
        const submissionIdVIP = generateSubmissionIdVIP();
        const noPRK = generateNoPRK();
        const nilaiPerjanjian = parseFloat(formData.nilaiPerjanjian);
        const nilaiTagihan = parseFloat(formData.nilaiTagihan);

        // Create contract object for Investasi
        const newContract = {
          no: 0, // Will be auto-assigned by store
          
          // Investasi specific fields
          noPerjanjian,
          tanggalPerjanjian: formData.tanggalPerjanjian,
          tanggalBerakhir: formData.tanggalBerakhir,
          judulPRK: formData.judulPRK,
          nilaiPerjanjian,
          namaVendor: formData.namaVendor,
          nilaiTagihan,
          noWBSPosAnggaran,
          noSKKI,
          noSE,
          noPO,
          submissionIdVIP,
          statusVIP: "belum_lunas" as const,
          terbayar: 0,
          namaPekerjaan: formData.namaPekerjaan,
          jenisAI: formData.jenisAI,
          noPRK,
          crNotCR: formData.crNotCR,
          
          // Mapped fields for backward compatibility
          uraianKegiatan: formData.judulPRK,
          judulPekerjaan: formData.namaPekerjaan,
          nilaiKontrak: nilaiPerjanjian,
          vendor: formData.namaVendor,
          nilaiTagihanKontrakPusat: nilaiTagihan,
          nilaiTagihanUnitInduk: 0,
          
          // Category & Unit
          kategori: "investasi" as ContractCategory,
          jenisAnggaran: "AI" as JenisAnggaran,
          unit: formData.unit || user?.unit || "",
          
          // Legacy field mappings
          posAngg: noWBSPosAnggaran,
          noSKUSKKO: noSKKI,
          submissionId: submissionIdVIP,
          
          entryBy: user?.name || "Admin",
          status: "aktif" as const,
          keterangan: formData.keterangan,
        };

        await createContract(newContract);
      } else {
        // Validation for other categories (Pemeliharaan & Administrasi)
        if (!formData.judulPekerjaan || !formData.noPerjanjian || !formData.vendor || !formData.nilaiKontrak) {
          setErrorMessage("Mohon lengkapi field yang wajib diisi (ditandai dengan *)");
          window.scrollTo({ top: 0, behavior: "smooth" });
          setIsSubmitting(false);
          return;
        }

        // Create contract object for other categories
        const newContract = {
          no: 0,
          uraianKegiatan: formData.uraianKegiatan,
          noPerjanjian: formData.noPerjanjian,
          tanggalPerjanjian: formData.tanggalPerjanjian,
          tanggalBerakhir: formData.tanggalBerakhir,
          judulPekerjaan: formData.judulPekerjaan,
          nilaiKontrak: parseFloat(formData.nilaiKontrak),
          vendor: formData.vendor,
          picName: formData.picName,
          nilaiTagihanKontrakPusat: 0,
          nilaiTagihanUnitInduk: 0,
          kategori: formData.kategori,
          jenisAnggaran: "AO" as JenisAnggaran,
          unit: formData.unit || user?.unit || "",
          unitSektorK: formData.unitSektorK,
          unitTerbayar: formData.unitTerbayar,
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
          requestTanggalSERelasi: formData.requestTanggalSERelasi || undefined,
          noXPS: formData.noXPS,
          tanggalXPS: formData.tanggalXPS || undefined,
          noBeritaAcara: formData.noBeritaAcara,
          tanggalBeritaAcara: formData.tanggalBeritaAcara || undefined,
          noBeritaAcaraSKRelasi: formData.noBeritaAcaraSKRelasi,
          tanggalArsip: formData.tanggalArsip || undefined,
          entryBy: user?.name || "Admin",
          status: "aktif" as const,
          
          // Default values for new fields
          judulPRK: formData.judulPekerjaan,
          nilaiPerjanjian: parseFloat(formData.nilaiKontrak),
          namaVendor: formData.vendor,
          nilaiTagihan: 0,
          statusVIP: "belum_lunas" as const,
          terbayar: 0,
          namaPekerjaan: formData.judulPekerjaan,
          jenisAI: "AO" as JenisAnggaran,
          crNotCR: "Not CR" as CRStatus,
          keterangan: formData.keterangan,
        };

        await createContract(newContract);
      }

      // Redirect to contract list
      router.push("/kontrak");
    } catch (error) {
      console.error("Error creating contract:", error);
      setErrorMessage("Terjadi kesalahan saat membuat kontrak. Silakan coba lagi.");
      window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Render form based on category
  const renderInvestasiForm = () => (
    <>
      {/* Informasi Dasar - Investasi */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informasi Perjanjian</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tanggal Perjanjian/Amandemen <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggalPerjanjian"
              value={formData.tanggalPerjanjian}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tanggal Berakhir <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="tanggalBerakhir"
              value={formData.tanggalBerakhir}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Judul PRK <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="judulPRK"
              value={formData.judulPRK}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Pembangunan GI 150kV Cawang"
            />
          </div>
        </div>
      </div>

      {/* Nilai & Vendor - Investasi */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Nilai & Vendor</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nilai Perjanjian (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="nilaiPerjanjian"
              value={formData.nilaiPerjanjian}
              onChange={handleChange}
              required
              min="0"
              step="1000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: 15000000000"
            />
            {formData.nilaiPerjanjian && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatCurrencyText(formData.nilaiPerjanjian)}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Vendor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="namaVendor"
              value={formData.namaVendor}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: PT Wijaya Karya"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nilai Tagihan/Nominal (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="nilaiTagihan"
              value={formData.nilaiTagihan}
              onChange={handleChange}
              required
              min="0"
              step="1000"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: 3000000000"
            />
            {formData.nilaiTagihan && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatCurrencyText(formData.nilaiTagihan)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Detail Pekerjaan - Investasi */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Detail Pekerjaan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nama Pekerjaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="namaPekerjaan"
              value={formData.namaPekerjaan}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Pengadaan dan Pemasangan Trafo Daya 60 MVA GI Cawang"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jenis AI
            </label>
            <select
              name="jenisAI"
              value={formData.jenisAI}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="AI">AI - Anggaran Investasi</option>
              <option value="AO">AO - Anggaran Operasi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              CR / Not CR
            </label>
            <select
              name="crNotCR"
              value={formData.crNotCR}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Not CR">Not CR</option>
              <option value="CR">CR</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unit - Investasi */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Unit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>
      </div>
    </>
  );

  const renderOtherCategoryForm = () => (
    <>
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
              placeholder="Contoh: Pemeliharaan Trafo GI"
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
              placeholder="Contoh: Pemeliharaan Rutin"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              PIC (Person In Charge)
            </label>
            <input
              type="text"
              name="picName"
              value={formData.picName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Contoh: Budi Santoso"
            />
          </div>
        </div>
      </div>

      {/* Keuangan */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Keuangan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Jenis Anggaran
            </label>
            <input
              type="text"
              value="AO - Anggaran Operasi"
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
              placeholder="Contoh: Pemeliharaan"
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
              placeholder="Contoh: Operasi & Pemeliharaan"
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center gap-2 mb-2 justify-center">
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

      {/* Error Alert */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="text-red-800 dark:text-red-200 font-medium">{errorMessage}</p>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6"
      >
        {/* Kategori Selection */}
        <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Kategori Kontrak</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["investasi", "pemeliharaan", "administrasi"] as ContractCategory[]).map((cat) => (
              <label
                key={cat}
                className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.kategori === cat
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <input
                  type="radio"
                  name="kategori"
                  value={cat}
                  checked={formData.kategori === cat}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className={`text-sm font-medium ${
                  formData.kategori === cat
                    ? "text-blue-700 dark:text-blue-300"
                    : "text-gray-700 dark:text-gray-300"
                }`}>
                  {CONTRACT_CATEGORY_LABELS[cat]}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Render form based on category */}
        {formData.kategori === "investasi" ? renderInvestasiForm() : renderOtherCategoryForm()}

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
