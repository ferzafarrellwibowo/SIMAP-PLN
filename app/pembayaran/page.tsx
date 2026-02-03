"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-new";
import {
  SubscriptionWithPayments,
  MONTHS_ID,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  formatCurrency,
  formatPeriode,
  getYearlyPaymentSummary,
  SubscriptionCategory,
} from "@/lib/subscription-types";
import { getSubscriptions, deleteSubscription } from "@/lib/subscription-service";
import { CompactMonthIndicator } from "@/components/payment/payment-status-grid";
import { CardSkeleton } from "@/components/ui/skeleton";

export default function PembayaranPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Read URL parameters for initial filter values
  const kategoriParam = searchParams.get("kategori") as SubscriptionCategory | null;
  const statusParam = searchParams.get("status") as "all" | "complete" | "incomplete" | "hasGaps" | null;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "complete" | "incomplete" | "hasGaps">(statusParam || "all");
  const [categoryFilter, setCategoryFilter] = useState<SubscriptionCategory | "all">(kategoriParam || "all");
  const [tahunMulai, setTahunMulai] = useState<number | "all">("all");
  const [tahunSelesai, setTahunSelesai] = useState<number | "all">("all");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<SubscriptionWithPayments | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getSubscriptions();
        setSubscriptions(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching subscriptions:", err);
        setError("Gagal memuat data. Pastikan koneksi database sudah benar.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Handle delete subscription
  const handleDeleteClick = (sub: SubscriptionWithPayments) => {
    setSubscriptionToDelete(sub);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!subscriptionToDelete) return;

    try {
      setIsDeleting(true);
      await deleteSubscription(subscriptionToDelete.id);
      setSubscriptions((prev) => prev.filter((s) => s.id !== subscriptionToDelete.id));
      setDeleteModalOpen(false);
      setSubscriptionToDelete(null);
    } catch (err) {
      console.error("Error deleting subscription:", err);
      alert("Gagal menghapus langganan. Silakan coba lagi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setSubscriptionToDelete(null);
  };



  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchSearch =
        sub.nama_layanan.toLowerCase().includes(search.toLowerCase()) ||
        sub.vendor.toLowerCase().includes(search.toLowerCase()) ||
        sub.no_perjanjian.toLowerCase().includes(search.toLowerCase());

      // Category filter
      const matchCategory = categoryFilter === "all" || sub.kategori === categoryFilter;

      // Periode filter (tahun mulai dan selesai)
      const matchTahunMulai = tahunMulai === "all" || sub.periode_mulai === tahunMulai;
      const matchTahunSelesai = tahunSelesai === "all" || sub.periode_selesai === tahunSelesai;

      // Get year summary for status filter
      const yearPayments = sub.payments.filter((p) => p.tahun === selectedYear);
      const paidCount = yearPayments.filter((p) => p.status === "PAID").length;
      const gapMonths = sub.gap_months.filter((m) =>
        sub.payments.some((p) => p.bulan === m && p.tahun === selectedYear)
      );
      const hasGapsThisYear = gapMonths.length > 0;

      const matchStatus =
        statusFilter === "all" ||
        (statusFilter === "complete" && paidCount === 12) ||
        (statusFilter === "incomplete" && paidCount < 12) ||
        (statusFilter === "hasGaps" && hasGapsThisYear);

      return matchSearch && matchCategory && matchTahunMulai && matchTahunSelesai && matchStatus;
    });
  }, [subscriptions, search, categoryFilter, tahunMulai, tahunSelesai, statusFilter, selectedYear]);

  // Summary stats
  const summaryStats = useMemo(() => {
    let complete = 0;
    let hasGaps = 0;
    let totalPaid = 0;
    let totalUnpaid = 0;

    for (const sub of subscriptions) {
      const yearPayments = sub.payments.filter((p) => p.tahun === selectedYear);
      const paidCount = yearPayments.filter((p) => p.status === "PAID").length;
      const unpaidCount = yearPayments.filter((p) => p.status === "UNPAID").length;

      if (paidCount === 12) complete++;
      if (sub.has_gaps) hasGaps++;

      totalPaid += paidCount * sub.anggaran_per_bulan;
      totalUnpaid += unpaidCount * sub.anggaran_per_bulan;
    }

    return {
      total: subscriptions.length,
      complete,
      hasGaps,
      totalPaid,
      totalUnpaid,
    };
  }, [subscriptions, selectedYear]);

  // Generate year options from 2023 to current year + 10
  const tahunOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = 2023; y <= currentYear + 10; y++) {
      years.push(y);
    }
    return years;
  }, []);

  // Generate year options for status calculation
  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    subscriptions.forEach((sub) => {
      for (let y = sub.periode_mulai; y <= sub.periode_selesai; y++) {
        years.add(y);
      }
    });
    return Array.from(years).sort();
  }, [subscriptions]);

  const isFilterActive = search !== "" || categoryFilter !== "all" || tahunMulai !== "all" || tahunSelesai !== "all" || statusFilter !== "all";



  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Status Pembayaran Langganan
          </h1>
          <p className="text-sm text-gray-600">
            {filteredSubscriptions.length} langganan ditemukan
          </p>
        </div>
        {user?.role === "admin" && (
          <Link
            href="/pembayaran/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Langganan
          </Link>
        )}
      </div>

      {/* Summary Cards */}
      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Langganan</p>
            <p className="text-2xl font-bold text-gray-900">
              {summaryStats.total}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Lunas {selectedYear}</p>
            <p className="text-2xl font-bold text-emerald-600">
              {summaryStats.complete}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Ada Terlewat</p>
            <p className="text-2xl font-bold text-amber-600">
              {summaryStats.hasGaps}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Belum Bayar {selectedYear}</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(summaryStats.totalUnpaid)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className={`grid grid-cols-1 gap-4 ${isFilterActive ? "md:grid-cols-7" : "md:grid-cols-6"}`}>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Pencarian
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama layanan, vendor, atau nomor perjanjian..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Kategori
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as SubscriptionCategory | "all")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Kategori</option>
              <option value="utilitas">{CATEGORY_LABELS.utilitas}</option>
              <option value="software">{CATEGORY_LABELS.software}</option>
              <option value="jasa">{CATEGORY_LABELS.jasa}</option>
              <option value="perlengkapan">{CATEGORY_LABELS.perlengkapan}</option>
              <option value="properti">{CATEGORY_LABELS.properti}</option>
              <option value="transportasi">{CATEGORY_LABELS.transportasi}</option>
              <option value="karyawan">{CATEGORY_LABELS.karyawan}</option>
              <option value="pemasaran">{CATEGORY_LABELS.pemasaran}</option>
              <option value="lainnya">{CATEGORY_LABELS.lainnya}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Tahun Mulai
            </label>
            <select
              value={tahunMulai}
              onChange={(e) => setTahunMulai(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua</option>
              {tahunOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Tahun Selesai
            </label>
            <select
              value={tahunSelesai}
              onChange={(e) => setTahunSelesai(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua</option>
              {tahunOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">
              Status Pembayaran
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="complete">Lunas Semua</option>
              <option value="incomplete">Belum Lunas</option>
              <option value="hasGaps">Ada Bulan Terlewat</option>
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
                    setCategoryFilter("all");
                    setTahunMulai("all");
                    setTahunSelesai("all");
                    setStatusFilter("all");
                  }}
                  className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
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

      {/* Subscription List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubscriptions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <svg
                className="w-16 h-16 mx-auto text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <p className="text-gray-600">
                {subscriptions.length === 0
                  ? "Belum ada data langganan. Klik 'Tambah Langganan' untuk menambahkan."
                  : "Tidak ada langganan yang sesuai filter."}
              </p>
            </div>
          ) : (
            filteredSubscriptions.map((sub, index) => {
              const yearSummary = getYearlyPaymentSummary(
                sub.payments,
                selectedYear,
                sub.anggaran_per_bulan
              );
              const yearPayments = sub.payments.filter((p) => p.tahun === selectedYear);
              const paidCount = yearPayments.filter((p) => p.status === "PAID").length;
              const paidPercentageYear = Math.round((paidCount / 12) * 100);

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Left Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${CATEGORY_COLORS[sub.kategori as SubscriptionCategory] || CATEGORY_COLORS.lainnya}`}>
                          {CATEGORY_LABELS[sub.kategori as SubscriptionCategory] || sub.kategori}
                        </span>
                        {paidPercentageYear === 100 ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
                            Lunas {selectedYear}
                          </span>
                        ) : yearSummary.hasGaps ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                            Ada Terlewat
                          </span>
                        ) : paidCount > 0 ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            Dalam Proses
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                            Belum Bayar
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {sub.nama_layanan}
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">No. Perjanjian:</span>{" "}
                          {sub.no_perjanjian}
                        </p>
                        <p>
                          <span className="font-medium">Vendor:</span> {sub.vendor}
                        </p>
                        <p>
                          <span className="font-medium">Unit:</span> {sub.unit}
                        </p>
                        <p>
                          <span className="font-medium">Anggaran/Bulan:</span>{" "}
                          {formatCurrency(sub.anggaran_per_bulan)}
                        </p>
                        <p>
                          <span className="font-medium">Periode:</span>{" "}
                          {formatPeriode(sub.periode_mulai, sub.periode_selesai)}
                        </p>
                      </div>

                      {/* Gap Warning */}
                      {yearSummary.hasGaps && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-amber-700">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <span>
                            Bulan terlewat:{" "}
                            {yearSummary.gapMonths
                              .map((m) => MONTHS_ID.find((mo) => mo.value === m)?.short)
                              .join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right Content */}
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          Terbayar {selectedYear}
                        </p>
                        <p className="text-lg font-bold text-emerald-600">
                          {formatCurrency(yearSummary.totalPaidAmount)}
                        </p>
                      </div>

                      <div className="w-56 space-y-3">
                        {/* Status Pembayaran Bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">
                              Status Pembayaran
                            </span>
                            <span
                              className={`font-medium ${paidPercentageYear === 100
                                ? "text-emerald-600"
                                : paidPercentageYear >= 50
                                  ? "text-blue-600"
                                  : "text-red-600"
                                }`}
                            >
                              {paidCount}/12 bulan ({paidPercentageYear}%)
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${paidPercentageYear === 100
                                ? "bg-emerald-500"
                                : yearSummary.hasGaps
                                  ? "bg-amber-500"
                                  : "bg-blue-500"
                                }`}
                              style={{ width: `${paidPercentageYear}%` }}
                            />
                          </div>
                        </div>

                        {/* Compact Month Indicator */}
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Detail Bulan {selectedYear}
                          </p>
                          <CompactMonthIndicatorFromPayments
                            payments={yearPayments}
                            gapMonths={yearSummary.gapMonths}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/pembayaran/${sub.id}`}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          Detail
                        </Link>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => handleDeleteClick(sub)}
                            className="px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                            title="Hapus Langganan"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && subscriptionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCancelDelete}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4 z-10"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Hapus Langganan?
                </h3>
                <p className="text-sm text-gray-500">
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="font-medium text-gray-900 mb-1">
                {subscriptionToDelete.nama_layanan}
              </p>
              <p className="text-sm text-gray-600">
                No. Perjanjian: {subscriptionToDelete.no_perjanjian}
              </p>
              <p className="text-sm text-gray-600">
                Vendor: {subscriptionToDelete.vendor}
              </p>
            </div>

            <p className="text-sm text-red-600 mb-4">
              ⚠️ Semua data pembayaran terkait langganan ini juga akan dihapus.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Menghapus...
                  </>
                ) : (
                  "Ya, Hapus"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Compact month indicator component using direct payments
function CompactMonthIndicatorFromPayments({
  payments,
  gapMonths,
}: {
  payments: { bulan: number; status: string }[];
  gapMonths: number[];
}) {
  return (
    <div className="flex gap-0.5">
      {MONTHS_ID.map((month) => {
        const payment = payments.find((p) => p.bulan === month.value);
        const isPaid = payment?.status === "PAID";
        const isGap = gapMonths.includes(month.value);

        return (
          <div
            key={month.value}
            title={`${month.name}: ${isPaid ? "Lunas" : isGap ? "Terlewat" : "Belum Bayar"}`}
            className={`w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-medium cursor-default ${isPaid
              ? "bg-emerald-500 text-white"
              : isGap
                ? "bg-amber-500 text-white"
                : "bg-red-500 text-white"
              }`}
          >
            {month.short.charAt(0)}
          </div>
        );
      })}
    </div>
  );
}
