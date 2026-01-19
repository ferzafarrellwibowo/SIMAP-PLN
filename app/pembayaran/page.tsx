"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
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
import { getSubscriptions } from "@/lib/subscription-service";
import { CompactMonthIndicator } from "@/components/payment/payment-status-grid";

export default function PembayaranPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithPayments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "complete" | "incomplete" | "hasGaps">("all");
  const [selectedYear, setSelectedYear] = useState<number>(2026);

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

  // Filter subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      const matchSearch =
        sub.nama_layanan.toLowerCase().includes(search.toLowerCase()) ||
        sub.vendor.toLowerCase().includes(search.toLowerCase()) ||
        sub.no_perjanjian.toLowerCase().includes(search.toLowerCase());

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

      return matchSearch && matchStatus;
    });
  }, [subscriptions, search, statusFilter, selectedYear]);

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

  // Generate year options
  const yearOptions = useMemo(() => {
    const years = new Set<number>();
    subscriptions.forEach((sub) => {
      for (let y = sub.periode_mulai; y <= sub.periode_selesai; y++) {
        years.add(y);
      }
    });
    return Array.from(years).sort();
  }, [subscriptions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Status Pembayaran Langganan
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Langganan</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {summaryStats.total}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Lunas {selectedYear}</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {summaryStats.complete}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Ada Terlewat</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {summaryStats.hasGaps}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Belum Bayar {selectedYear}</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(summaryStats.totalUnpaid)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
              Pencarian
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama layanan, vendor, atau nomor perjanjian..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
              Tahun
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {yearOptions.length > 0 ? (
                yearOptions.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))
              ) : (
                <option value={2026}>2026</option>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
              Status Pembayaran
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="complete">Lunas Semua</option>
              <option value="incomplete">Belum Lunas</option>
              <option value="hasGaps">Ada Bulan Terlewat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscription List */}
      <div className="space-y-4">
        {filteredSubscriptions.length === 0 ? (
          <div className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4"
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
            <p className="text-gray-600 dark:text-gray-400">
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
                className="bg-white dark:bg-gray-900/95 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${CATEGORY_COLORS[sub.kategori as SubscriptionCategory] || CATEGORY_COLORS.lainnya}`}>
                        {CATEGORY_LABELS[sub.kategori as SubscriptionCategory] || sub.kategori}
                      </span>
                      {paidPercentageYear === 100 ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Lunas {selectedYear}
                        </span>
                      ) : yearSummary.hasGaps ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          Ada Terlewat
                        </span>
                      ) : paidCount > 0 ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Dalam Proses
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          Belum Bayar
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {sub.nama_layanan}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-600 dark:text-gray-300">
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
                      <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400">
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Terbayar {selectedYear}
                      </p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(yearSummary.totalPaidAmount)}
                      </p>
                    </div>

                    <div className="w-56 space-y-3">
                      {/* Status Pembayaran Bar */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500 dark:text-gray-400">
                            Status Pembayaran
                          </span>
                          <span
                            className={`font-medium ${
                              paidPercentageYear === 100
                                ? "text-emerald-600"
                                : paidPercentageYear >= 50
                                ? "text-blue-600"
                                : "text-red-600"
                            }`}
                          >
                            {paidCount}/12 bulan ({paidPercentageYear}%)
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              paidPercentageYear === 100
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Detail Bulan {selectedYear}
                        </p>
                        <CompactMonthIndicatorFromPayments
                          payments={yearPayments}
                          gapMonths={yearSummary.gapMonths}
                        />
                      </div>
                    </div>

                    <Link
                      href={`/pembayaran/${sub.id}`}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
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
            className={`w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-medium cursor-default ${
              isPaid
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
