"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { useContractStore } from "@/lib/store-new";
import { useAuth } from "@/lib/auth-new";

function formatCurrency(value: number): string {
  if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(2)} M`;
  if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)} jt`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function CreateTagihanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { contracts, getContractById, createInvoice, getInvoicesByContract } = useContractStore();

  // Get contractId from URL params
  const contractIdParam = searchParams.get("contractId");

  const [formData, setFormData] = useState({
    contractId: contractIdParam || "",
    nomorTagihan: "",
    tanggalTagihan: new Date().toISOString().split("T")[0],
    nilaiTagihan: "",
    noBeritaAcara: "",
    tanggalBeritaAcara: "",
    noXPS: "",
    tanggalXPS: "",
    tanggalArsip: "",
    keterangan: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Get selected contract details
  const selectedContract = useMemo(() => {
    if (formData.contractId) {
      return getContractById(formData.contractId);
    }
    return undefined;
  }, [formData.contractId, getContractById]);

  // Get existing invoices for selected contract
  const existingInvoices = useMemo(() => {
    if (formData.contractId) {
      return getInvoicesByContract(formData.contractId);
    }
    return [];
  }, [formData.contractId, getInvoicesByContract]);

  // Calculate remaining budget
  const remainingBudget = useMemo(() => {
    if (selectedContract) {
      return selectedContract.sisaAnggaran;
    }
    return 0;
  }, [selectedContract]);

  // Auto-generate invoice number
  useEffect(() => {
    if (selectedContract && !formData.nomorTagihan) {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, "0");
      const invoiceCount = existingInvoices.length + 1;
      // Build a tidy contract key:
      const contractKey = selectedContract.noPerjanjian
        ? selectedContract.noPerjanjian
          .toString()
          .replace(/[^A-Za-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/(^-|-$)/g, "")
          .toUpperCase()
        : (typeof selectedContract.no !== "undefined" ? `NO${String(selectedContract.no).padStart(3, "0")}` : selectedContract.id.slice(-8).toUpperCase());

      const generatedNumber = `BA/${contractKey}/${String(invoiceCount).padStart(2, "0")}/${year}`;

      // Auto-generate No Berita Acara Format: xxxx/JKO/2024/012
      const randomNum = Math.floor(Math.random() * 9000) + 1000;
      const generatedBA = `${randomNum}/JKO/${year}/012`;

      setFormData((prev) => ({
        ...prev,
        nomorTagihan: generatedNumber,
        noBeritaAcara: prev.noBeritaAcara || generatedBA,
        tanggalBeritaAcara: prev.tanggalBeritaAcara || new Date().toISOString().split("T")[0],
      }));
    }
  }, [selectedContract, existingInvoices.length, formData.nomorTagihan]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear global error
    if (submitError) setSubmitError(null);
  };

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Tipe file tidak didukung. Gunakan PDF, gambar (JPG/PNG), Word, atau Excel.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('Ukuran file terlalu besar. Maksimal 10MB.');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'tagihan');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload gagal');
      }

      setUploadedFileUrl(result.data.url);
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Terjadi kesalahan saat upload');
      setSelectedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = async () => {
    if (uploadedFileUrl) {
      try {
        // Extract path from URL
        const urlParts = uploadedFileUrl.split('/invoices/');
        if (urlParts[1]) {
          await fetch(`/api/upload?path=${encodeURIComponent(urlParts[1])}`, {
            method: 'DELETE',
          });
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
    setSelectedFile(null);
    setUploadedFileUrl(null);
    setUploadError(null);
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.contractId) {
      newErrors.contractId = "Kontrak harus dipilih";
    }

    if (!formData.nomorTagihan.trim()) {
      newErrors.nomorTagihan = "Nomor tagihan harus diisi";
    }

    if (!formData.tanggalTagihan) {
      newErrors.tanggalTagihan = "Tanggal tagihan harus diisi";
    }

    if (!formData.nilaiTagihan || parseFloat(formData.nilaiTagihan) <= 0) {
      newErrors.nilaiTagihan = "Nilai tagihan harus lebih dari 0";
    }

    // Check if value exceeds remaining budget
    if (selectedContract && parseFloat(formData.nilaiTagihan) > remainingBudget) {
      newErrors.nilaiTagihan = `Nilai tagihan melebihi sisa anggaran (${formatCurrency(remainingBudget)})`;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSubmitError("Mohon periksa input yang ditandai merah");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (!selectedContract || !user) {
        throw new Error("Data tidak lengkap");
      }

      const now = new Date().toISOString();

      const invoiceData = {
        contractId: formData.contractId,
        noPerjanjian: selectedContract.noPerjanjian,
        nomorTagihan: formData.nomorTagihan,
        tanggalTagihan: formData.tanggalTagihan,
        nilaiTagihan: parseFloat(formData.nilaiTagihan),
        noBeritaAcara: formData.noBeritaAcara || undefined,
        tanggalBeritaAcara: formData.tanggalBeritaAcara || undefined,
        noXPS: formData.noXPS || undefined,
        tanggalXPS: formData.tanggalXPS || undefined,
        tanggalArsip: formData.tanggalArsip || undefined,
        status: "diajukan" as const,
        tanggalDiajukan: now,
        keterangan: formData.keterangan || undefined,
        diajukanOleh: user.id,
        diajukanOlehName: user.name,
        dokumenTagihan: uploadedFileUrl || undefined,
      };

      await createInvoice(invoiceData);

      // Redirect to contract detail page
      router.push(`/kontrak/${formData.contractId}`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      setSubmitError("Terjadi kesalahan saat membuat tagihan. Silakan coba lagi.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check access - only admin can create invoices
  if (!user || user.role !== "admin") {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Akses Ditolak
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Anda tidak memiliki akses untuk menambah tagihan.
          </p>
          <Link
            href="/tagihan"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Kembali ke Daftar Tagihan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Link
          href={contractIdParam ? `/kontrak/${contractIdParam}` : "/tagihan"}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Link>
        <span className="text-gray-300 dark:text-gray-600">/</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">Tambah Tagihan</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Tambah Tagihan Baru
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Tambahkan tagihan/berita acara untuk kontrak yang dipilih
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {submitError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-800"
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <p className="text-red-800 dark:text-red-200 font-medium">{submitError}</p>
          </div>
        </motion.div>
      )}

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800"
      >
        <form onSubmit={handleSubmit}>
          {/* Contract Selection Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Pilih Kontrak
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="contractId"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Kontrak <span className="text-red-500">*</span>
                </label>
                <select
                  id="contractId"
                  name="contractId"
                  value={formData.contractId}
                  onChange={handleChange}
                  disabled={!!contractIdParam}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.contractId
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <option value="">-- Pilih Kontrak --</option>
                  {contracts
                    .filter((c) => c.status === "aktif")
                    .map((contract) => (
                      <option key={contract.id} value={contract.id}>
                        {contract.noPerjanjian} - {contract.judulPekerjaan || contract.judulPerjanjian || "-"}
                      </option>
                    ))}
                </select>
                {errors.contractId && (
                  <p className="mt-1 text-sm text-red-500">{errors.contractId}</p>
                )}
              </div>
            </div>

            {/* Contract Info Card */}
            {selectedContract && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                      Judul Pekerjaan
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedContract.judulPekerjaan || selectedContract.judulPerjanjian || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Vendor</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {selectedContract.vendor || selectedContract.namaVendor || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                      Nilai Kontrak
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(selectedContract.nilaiKontrak)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                      Sisa Anggaran
                    </p>
                    <p
                      className={`text-sm font-bold ${remainingBudget < selectedContract.nilaiKontrak * 0.1
                        ? "text-red-600 dark:text-red-400"
                        : "text-green-600 dark:text-green-400"
                        }`}
                    >
                      {formatCurrency(remainingBudget)}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400" title="Persentase penggunaan anggaran: Hijau (≤50%), Kuning (50-90%), Merah (>90%)">
                      Serapan Anggaran: {selectedContract.persentaseRealisasi.toFixed(1)}%
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {existingInvoices.length} tagihan
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${selectedContract.persentaseRealisasi > 90
                        ? "bg-red-500"
                        : selectedContract.persentaseRealisasi > 50
                          ? "bg-yellow-500"
                          : "bg-green-500"
                        }`}
                      style={{
                        width: `${Math.min(selectedContract.persentaseRealisasi, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Invoice Details Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Detail Tagihan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Nomor Tagihan */}
              <div>
                <label
                  htmlFor="nomorTagihan"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Nomor Tagihan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nomorTagihan"
                  name="nomorTagihan"
                  value={formData.nomorTagihan}
                  onChange={handleChange}
                  placeholder="BA/001/01/2025"
                  className={`w-full px-3 py-2 rounded-lg border ${errors.nomorTagihan
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2`}
                />
                {errors.nomorTagihan && (
                  <p className="mt-1 text-sm text-red-500">{errors.nomorTagihan}</p>
                )}
              </div>

              {/* Tanggal Tagihan */}
              <div>
                <label
                  htmlFor="tanggalTagihan"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tanggal Tagihan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="tanggalTagihan"
                  name="tanggalTagihan"
                  value={formData.tanggalTagihan}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 rounded-lg border ${errors.tanggalTagihan
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2`}
                />
                {errors.tanggalTagihan && (
                  <p className="mt-1 text-sm text-red-500">{errors.tanggalTagihan}</p>
                )}
              </div>

              {/* Nilai Tagihan */}
              <div>
                <label
                  htmlFor="nilaiTagihan"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Nilai Tagihan (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="nilaiTagihan"
                  name="nilaiTagihan"
                  value={formData.nilaiTagihan}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  step="1"
                  className={`w-full px-3 py-2 rounded-lg border ${errors.nilaiTagihan
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                    } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2`}
                />
                {errors.nilaiTagihan && (
                  <p className="mt-1 text-sm text-red-500">{errors.nilaiTagihan}</p>
                )}
                {formData.nilaiTagihan && !errors.nilaiTagihan && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {formatCurrency(parseFloat(formData.nilaiTagihan) || 0)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Berita Acara & XPS Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Berita Acara & XPS (Opsional)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* No Berita Acara */}
              <div>
                <label
                  htmlFor="noBeritaAcara"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  No Berita Acara
                </label>
                <input
                  type="text"
                  id="noBeritaAcara"
                  name="noBeritaAcara"
                  value={formData.noBeritaAcara}
                  onChange={handleChange}
                  placeholder="BA-001/2025"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tanggal Berita Acara */}
              <div>
                <label
                  htmlFor="tanggalBeritaAcara"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tanggal Berita Acara
                </label>
                <input
                  type="date"
                  id="tanggalBeritaAcara"
                  name="tanggalBeritaAcara"
                  value={formData.tanggalBeritaAcara}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* No XPS */}
              <div>
                <label
                  htmlFor="noXPS"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  No XPS
                </label>
                <input
                  type="text"
                  id="noXPS"
                  name="noXPS"
                  value={formData.noXPS}
                  onChange={handleChange}
                  placeholder="XPS/001/2025"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tanggal XPS */}
              <div>
                <label
                  htmlFor="tanggalXPS"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tanggal XPS
                </label>
                <input
                  type="date"
                  id="tanggalXPS"
                  name="tanggalXPS"
                  value={formData.tanggalXPS}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tanggal Arsip */}
              <div>
                <label
                  htmlFor="tanggalArsip"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Tanggal Arsip
                </label>
                <input
                  type="date"
                  id="tanggalArsip"
                  name="tanggalArsip"
                  value={formData.tanggalArsip}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Keterangan Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Keterangan Tambahan
            </h2>

            <div>
              <label
                htmlFor="keterangan"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Keterangan
              </label>
              <textarea
                id="keterangan"
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                rows={3}
                placeholder="Masukkan keterangan tambahan (opsional)"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Dokumen Upload Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Dokumen Pendukung (Opsional)
            </h2>

            <div>
              <label
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Upload Dokumen
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Format: PDF, JPG, PNG, Word, Excel. Maksimal 10MB.
              </p>

              {!selectedFile && !uploadedFileUrl ? (
                <label
                  htmlFor="dokumenTagihan"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                    </p>
                  </div>
                  <input
                    id="dokumenTagihan"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    {isUploading ? (
                      <svg
                        className="animate-spin h-8 w-8 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <svg
                          className="w-6 h-6 text-blue-600 dark:text-blue-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px] md:max-w-[300px]">
                        {selectedFile?.name || 'Dokumen'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isUploading
                          ? 'Mengupload...'
                          : uploadedFileUrl
                            ? `${formatFileSize(selectedFile?.size || 0)} - Upload berhasil`
                            : ''}
                      </p>
                    </div>
                  </div>
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Hapus file"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}

              {uploadError && (
                <p className="mt-2 text-sm text-red-500">{uploadError}</p>
              )}

              {uploadedFileUrl && (
                <a
                  href={uploadedFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Lihat dokumen
                </a>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Link
              href={contractIdParam ? `/kontrak/${contractIdParam}` : "/tagihan"}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || !selectedContract || isUploading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Simpan Tagihan
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
