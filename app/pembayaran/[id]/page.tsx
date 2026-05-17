"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-new";
import {
  SubscriptionWithPayments,
  MonthlyPayment,
  MONTHS_ID,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  formatCurrency,
  formatPeriode,
  getYearlyPaymentSummary,
  SubscriptionCategory,
} from "@/lib/subscription-types";
import { getSubscriptionById, updatePaymentStatus, markPaymentsAsPaid, resetYearPayments } from "@/lib/subscription-service";
import { Badge } from "@/components/ui/badge";

export default function PembayaranDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const subscriptionId = params.id as string;

  const [subscription, setSubscription] = useState<SubscriptionWithPayments | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<MonthlyPayment | null>(null);
  const [updating, setUpdating] = useState(false);

  // Fetch subscription data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const data = await getSubscriptionById(subscriptionId);
        setSubscription(data);
        if (data) {
          setSelectedYear(data.periode_mulai);
        }
        setError(null);
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError("Gagal memuat data. Pastikan koneksi database sudah benar.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [subscriptionId]);

  // Get year summary
  const yearSummary = useMemo(() => {
    if (!subscription) return null;
    return getYearlyPaymentSummary(
      subscription.payments,
      selectedYear,
      subscription.anggaran_per_bulan
    );
  }, [subscription, selectedYear]);

  // Get payments for selected year
  const yearPayments = useMemo(() => {
    if (!subscription) return [];
    return subscription.payments.filter((p) => p.tahun === selectedYear);
  }, [subscription, selectedYear]);

  // Stats
  const paidCount = yearPayments.filter((p) => p.status === "PAID").length;
  const unpaidCount = yearPayments.filter((p) => p.status === "UNPAID").length;
  const totalPaid = paidCount * (subscription?.anggaran_per_bulan || 0);
  const totalUnpaid = unpaidCount * (subscription?.anggaran_per_bulan || 0);
  const isFullyPaid = paidCount === 12;

  // Year options
  const yearOptions = useMemo(() => {
    if (!subscription) return [];
    const years = [];
    for (let y = subscription.periode_mulai; y <= subscription.periode_selesai; y++) {
      years.push(y);
    }
    return years;
  }, [subscription]);

  const handleMonthClick = (payment: MonthlyPayment) => {
    setSelectedMonth(payment);
  };

  const handleTogglePayment = async () => {
    if (!selectedMonth || !subscription) return;

    setUpdating(true);
    try {
      const newStatus = selectedMonth.status === "PAID" ? "UNPAID" : "PAID";
      await updatePaymentStatus(selectedMonth.id, newStatus);

      // Refresh data
      const updated = await getSubscriptionById(subscriptionId);
      setSubscription(updated);

      // Update selected month
      const updatedPayment = updated?.payments.find((p) => p.id === selectedMonth.id);
      if (updatedPayment) {
        setSelectedMonth(updatedPayment);
      } else {
        setSelectedMonth(null);
      }
    } catch (err) {
      console.error("Error updating payment:", err);
      alert("Gagal mengupdate status pembayaran");
    } finally {
      setUpdating(false);
    }
  };

  const handlePayUntilMonth = async (targetMonth: number) => {
    if (!subscription) return;

    setUpdating(true);
    try {
      // Get months that need to be paid (1 to targetMonth that are UNPAID)
      const monthsToPay = yearPayments
        .filter((p) => p.bulan <= targetMonth && p.status === "UNPAID")
        .map((p) => p.bulan);

      if (monthsToPay.length > 0) {
        await markPaymentsAsPaid(subscription.id, selectedYear, monthsToPay);

        // Refresh data
        const updated = await getSubscriptionById(subscriptionId);
        setSubscription(updated);
        setSelectedMonth(null);
      }
    } catch (err) {
      console.error("Error paying multiple months:", err);
      alert("Gagal mengupdate status pembayaran");
    } finally {
      setUpdating(false);
    }
  };

  const handleResetPayments = async () => {
    if (!subscription || !confirm("Yakin ingin mereset semua pembayaran tahun ini?")) return;

    setUpdating(true);
    try {
      await resetYearPayments(subscription.id, selectedYear);

      // Refresh data
      const updated = await getSubscriptionById(subscriptionId);
      setSubscription(updated);
      setSelectedMonth(null);
    } catch (err) {
      console.error("Error resetting payments:", err);
      alert("Gagal mereset pembayaran");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error || !subscription) {
    return (
      <div className="space-y-6">
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
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-gray-600 mb-4">
            {error || "Langganan tidak ditemukan"}
          </p>
          <Link
            href="/pembayaran"
            className="text-blue-600 hover:text-blue-700"
          >
            ← Kembali ke Daftar Langganan
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
            <Link
              href="/pembayaran"
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-500">Detail Pembayaran</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {subscription.nama_layanan}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            No. Perjanjian: {subscription.no_perjanjian}
          </p>
        </div>
        <div className="flex gap-2">
          {yearOptions.length > 1 && (
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(Number(e.target.value));
                setSelectedMonth(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {yearOptions.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          )}
          {user?.role === "admin" && (
            <button
              onClick={handleResetPayments}
              disabled={updating}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm disabled:opacity-50"
            >
              Reset Pembayaran
            </button>
          )}
        </div>
      </div>

      {/* Subscription Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Informasi Langganan
          </h2>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${CATEGORY_COLORS[subscription.kategori as SubscriptionCategory] || CATEGORY_COLORS.lainnya}`}>
            {CATEGORY_LABELS[subscription.kategori as SubscriptionCategory] || subscription.kategori}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Vendor</p>
            <p className="font-medium text-gray-900">{subscription.vendor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Unit</p>
            <p className="font-medium text-gray-900">{subscription.unit}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Anggaran Per Bulan</p>
            <p className="font-medium text-gray-900">
              {formatCurrency(subscription.anggaran_per_bulan)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Periode</p>
            <p className="font-medium text-gray-900">
              {formatPeriode(subscription.periode_mulai, subscription.periode_selesai)}
            </p>
          </div>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(subscription as any).catatan && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Catatan</p>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <p className="text-gray-700">{(subscription as any).catatan}</p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Status {selectedYear}</p>
          <div className="mt-1">
            {isFullyPaid ? (
              <Badge variant="success">Lunas Semua</Badge>
            ) : yearSummary?.hasGaps ? (
              <Badge variant="warning">Ada Terlewat</Badge>
            ) : paidCount > 0 ? (
              <Badge variant="info">Dalam Proses</Badge>
            ) : (
              <Badge variant="danger">Belum Bayar</Badge>
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Bulan Terbayar</p>
          <p className="text-2xl font-bold text-emerald-600">
            {paidCount}/12
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Terbayar</p>
          <p className="text-2xl font-bold text-emerald-600">
            {formatCurrency(totalPaid)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Sisa Pembayaran</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(totalUnpaid)}
          </p>
        </div>
      </div>

      {/* Payment Status Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Status Pembayaran Tahun {selectedYear}
        </h3>
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {MONTHS_ID.map((month) => {
            const payment = yearPayments.find((p) => p.bulan === month.value);
            const isPaid = payment?.status === "PAID";
            const isGap = yearSummary?.gapMonths.includes(month.value);
            const isSelected = selectedMonth?.bulan === month.value;

            return (
              <button
                key={month.value}
                onClick={() => payment && handleMonthClick(payment)}
                disabled={!payment || updating}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected
                  ? "border-blue-500 ring-2 ring-blue-500/50"
                  : "border-transparent"
                } ${
                  isPaid
                    ? "bg-emerald-100 hover:bg-emerald-200"
                    : isGap
                    ? "bg-amber-100 hover:bg-amber-200"
                    : "bg-red-100 hover:bg-red-200"
                } ${!payment || updating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <p className={`text-xs font-medium ${
                  isPaid
                    ? "text-emerald-700"
                    : isGap
                      ? "text-amber-700"
                      : "text-red-700"
                }`}>
                  {month.short}
                </p>
                <div className="mt-1">
                  {isPaid ? (
                    <svg className="w-5 h-5 mx-auto text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isGap ? (
                    <svg className="w-5 h-5 mx-auto text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 mx-auto text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
              </button>
        );
          })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500"></div>
          <span className="text-gray-600">Lunas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-500"></div>
          <span className="text-gray-600">Terlewat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-gray-600">Belum Bayar</span>
        </div>
      </div>
    </div>

      {/* Selected Month Action */ }
  {
    selectedMonth && user?.role === "admin" && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-gray-900">
              {MONTHS_ID.find((m) => m.value === selectedMonth.bulan)?.name} {selectedMonth.tahun}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">
                Status saat ini:
              </span>
              {selectedMonth.status === "PAID" ? (
                <Badge variant="success">Lunas</Badge>
              ) : yearSummary?.gapMonths.includes(selectedMonth.bulan) ? (
                <Badge variant="warning">Terlewat</Badge>
              ) : (
                <Badge variant="danger">Belum Bayar</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Nilai: {formatCurrency(subscription.anggaran_per_bulan)}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleTogglePayment}
              disabled={updating}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${selectedMonth.status === "PAID"
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
            >
              {updating ? "Menyimpan..." : selectedMonth.status === "PAID" ? "Tandai Belum Bayar" : "Tandai Lunas"}
            </button>
            {selectedMonth.status === "UNPAID" && selectedMonth.bulan > 1 && (
              <button
                onClick={() => handlePayUntilMonth(selectedMonth.bulan)}
                disabled={updating}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {updating ? "Menyimpan..." : `Bayar Jan - ${MONTHS_ID.find((m) => m.value === selectedMonth.bulan)?.short}`}
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  {/* Quick Actions for Admin */ }
  {
    user?.role === "admin" && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Aksi Cepat
        </h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handlePayUntilMonth(3)}
            disabled={updating}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
          >
            Bayar Q1 (Jan-Mar)
          </button>
          <button
            onClick={() => handlePayUntilMonth(6)}
            disabled={updating}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
          >
            Bayar H1 (Jan-Jun)
          </button>
          <button
            onClick={() => handlePayUntilMonth(9)}
            disabled={updating}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
          >
            Bayar Q1-Q3 (Jan-Sep)
          </button>
          <button
            onClick={() => handlePayUntilMonth(12)}
            disabled={updating}
            className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-sm disabled:opacity-50"
          >
            Bayar Semua (Lunas)
          </button>
        </div>
      </div>
    )
  }

  {/* Gap Warning */ }
  {
    yearSummary?.hasGaps && (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-semibold text-amber-800">
              Perhatian: Ada Pembayaran Terlewat
            </h4>
            <p className="text-sm text-amber-700 mt-1">
              Bulan {yearSummary.gapMonths.map((m) => MONTHS_ID.find((mo) => mo.value === m)?.name).join(", ")} belum dibayar meskipun bulan setelahnya sudah terbayar.
              Segera lakukan pembayaran untuk bulan yang terlewat.
            </p>
          </div>
        </div>
      </div>
    )
  }

  {/* Completed Message */ }
  {
    isFullyPaid && (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <svg className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold text-emerald-800">
              Pembayaran Lengkap
            </h4>
            <p className="text-sm text-emerald-700 mt-1">
              Semua pembayaran untuk tahun {selectedYear} telah lunas.
              Total pembayaran: {formatCurrency(subscription.anggaran_per_bulan * 12)}
            </p>
          </div>
        </div>
      </div>
    )
  }
    </div >
  );
}
