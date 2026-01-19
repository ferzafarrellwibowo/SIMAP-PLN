"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-new";
import {
  SubscriptionFormInput,
  CATEGORY_LABELS,
  UNIT_OPTIONS,
  SubscriptionCategory,
} from "@/lib/subscription-types";
import { createSubscription } from "@/lib/subscription-service";

const CATEGORY_OPTIONS: { value: SubscriptionCategory; label: string }[] = [
  { value: "utilitas", label: CATEGORY_LABELS.utilitas },
  { value: "software", label: CATEGORY_LABELS.software },
  { value: "jasa", label: CATEGORY_LABELS.jasa },
  { value: "perlengkapan", label: CATEGORY_LABELS.perlengkapan },
  { value: "properti", label: CATEGORY_LABELS.properti },
  { value: "transportasi", label: CATEGORY_LABELS.transportasi },
  { value: "karyawan", label: CATEGORY_LABELS.karyawan },
  { value: "pemasaran", label: CATEGORY_LABELS.pemasaran },
  { value: "lainnya", label: CATEGORY_LABELS.lainnya },
];

export default function CreateSubscriptionPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState<SubscriptionFormInput>({
    no_perjanjian: "",
    nama_layanan: "",
    vendor: "",
    unit: UNIT_OPTIONS[0],
    anggaran_per_bulan: 0,
    periode_mulai: new Date().getFullYear(),
    periode_selesai: new Date().getFullYear(),
    kategori: "lainnya",
    deskripsi: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirect if not admin
  if (user?.role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 text-center">
          <svg
            className="w-12 h-12 mx-auto text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <p className="text-red-700 dark:text-red-300 mb-4">
            Anda tidak memiliki akses untuk menambah langganan.
          </p>
          <Link
            href="/pembayaran"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Kembali ke daftar langganan
          </Link>
        </div>
      </div>
    );
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.no_perjanjian.trim()) {
      newErrors.no_perjanjian = "Nomor perjanjian wajib diisi";
    }

    if (!formData.nama_layanan.trim()) {
      newErrors.nama_layanan = "Nama layanan wajib diisi";
    }

    if (!formData.vendor.trim()) {
      newErrors.vendor = "Nama vendor wajib diisi";
    }

    if (!formData.unit.trim()) {
      newErrors.unit = "Unit wajib dipilih";
    }

    if (formData.anggaran_per_bulan <= 0) {
      newErrors.anggaran_per_bulan = "Anggaran per bulan harus lebih dari 0";
    }

    if (formData.periode_mulai > formData.periode_selesai) {
      newErrors.periode_selesai = "Periode selesai harus sama atau setelah periode mulai";
    }

    if (formData.periode_selesai - formData.periode_mulai > 10) {
      newErrors.periode_selesai = "Periode maksimal 10 tahun";
    }

    setErrors(newErrors);
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
      await createSubscription(formData);
      router.push("/pembayaran");
    } catch (error) {
      console.error("Error creating subscription:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan langganan. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "anggaran_per_bulan" || name === "periode_mulai" || name === "periode_selesai") {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value, 10) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const formatRupiah = (value: number): string => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/pembayaran"
          className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-4"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Tambah Langganan Baru
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Isi formulir berikut untuk menambahkan langganan baru
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informasi Langganan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* No Perjanjian */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nomor Perjanjian <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="no_perjanjian"
                value={formData.no_perjanjian}
                onChange={handleChange}
                placeholder="Contoh: LGN/2026/001"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.no_perjanjian
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.no_perjanjian && (
                <p className="text-red-500 text-xs mt-1">{errors.no_perjanjian}</p>
              )}
            </div>

            {/* Kategori */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Kategori <span className="text-red-500">*</span>
              </label>
              <select
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Nama Layanan */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nama Layanan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nama_layanan"
                value={formData.nama_layanan}
                onChange={handleChange}
                placeholder="Contoh: Layanan Internet Fiber Optic 100 Mbps"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nama_layanan
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.nama_layanan && (
                <p className="text-red-500 text-xs mt-1">{errors.nama_layanan}</p>
              )}
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vendor <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="vendor"
                value={formData.vendor}
                onChange={handleChange}
                placeholder="Contoh: PT. Telkom Indonesia"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.vendor
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.vendor && (
                <p className="text-red-500 text-xs mt-1">{errors.vendor}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.unit
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="text-red-500 text-xs mt-1">{errors.unit}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Anggaran & Periode
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Anggaran Per Bulan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Anggaran Per Bulan <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="anggaran_per_bulan"
                value={formData.anggaran_per_bulan || ""}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="100000"
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.anggaran_per_bulan
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              />
              {errors.anggaran_per_bulan && (
                <p className="text-red-500 text-xs mt-1">{errors.anggaran_per_bulan}</p>
              )}
              {formData.anggaran_per_bulan > 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                  {formatRupiah(formData.anggaran_per_bulan)}
                </p>
              )}
            </div>

            {/* Periode Mulai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Periode Mulai <span className="text-red-500">*</span>
              </label>
              <select
                name="periode_mulai"
                value={formData.periode_mulai}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Periode Selesai */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Periode Selesai <span className="text-red-500">*</span>
              </label>
              <select
                name="periode_selesai"
                value={formData.periode_selesai}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.periode_selesai
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.periode_selesai && (
                <p className="text-red-500 text-xs mt-1">{errors.periode_selesai}</p>
              )}
            </div>
          </div>

          {/* Total Preview */}
          {formData.anggaran_per_bulan > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Per Bulan</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatRupiah(formData.anggaran_per_bulan)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Per Tahun</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatRupiah(formData.anggaran_per_bulan * 12)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Durasi</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formData.periode_selesai - formData.periode_mulai + 1} tahun
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total Periode</p>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">
                    {formatRupiah(
                      formData.anggaran_per_bulan *
                        12 *
                        (formData.periode_selesai - formData.periode_mulai + 1)
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Catatan */}
        <div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Catatan Tambahan
          </h2>
          <textarea
            name="deskripsi"
            value={formData.deskripsi}
            onChange={handleChange}
            rows={3}
            placeholder="Deskripsi atau keterangan tambahan (opsional)"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-red-700 dark:text-red-300">{submitError}</p>
            </div>
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Link
            href="/pembayaran"
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Simpan Langganan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
