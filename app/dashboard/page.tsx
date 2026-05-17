"use client";

import { useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { StatusPieChart } from "@/components/dashboard/status-chart";
import { BudgetChart } from "@/components/dashboard/budget-chart";
import { useContractStore, CONTRACT_STATUS_LABELS, CONTRACT_STATUS_COLORS } from "@/lib/store-new";
import { useAuth } from "@/lib/auth-new";
import { formatCurrency } from "@/lib/utils";

// Icon components untuk konsistensi dengan tema proyek
const FolderIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Summary Card Config
const summaryCardConfig = [
  {
    key: "total",
    title: "Total Kontrak",
    icon: FolderIcon,
    color: "text-blue-700",
    bgColor: "bg-blue-100",
    borderColor: "border-l-blue-600",
    iconBg: "bg-blue-200",
  },
  {
    key: "running",
    title: "Kontrak Aktif",
    icon: PlayIcon,
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
    borderColor: "border-l-emerald-600",
    iconBg: "bg-emerald-200",
  },
  {
    key: "completed",
    title: "Kontrak Selesai",
    icon: CheckIcon,
    color: "text-violet-700",
    bgColor: "bg-violet-100",
    borderColor: "border-l-violet-600",
    iconBg: "bg-violet-200",
  },
  {
    key: "problematic",
    title: "Kontrak Bermasalah",
    icon: AlertIcon,
    color: "text-red-700",
    bgColor: "bg-red-100",
    borderColor: "border-l-red-600",
    iconBg: "bg-red-200",
  },
];

// Category Config
const categoryConfig = [
  {
    key: "investasi",
    label: "Investasi",
    icon: TrendingUpIcon,
    color: "bg-blue-500",
    textColor: "text-blue-600",
    lightBg: "bg-blue-50",
  },
  {
    key: "pemeliharaan",
    label: "Pemeliharaan",
    icon: SettingsIcon,
    color: "bg-amber-500",
    textColor: "text-amber-600",
    lightBg: "bg-amber-50",
  },
  {
    key: "administrasi",
    label: "Administrasi",
    icon: DocumentIcon,
    color: "bg-purple-500",
    textColor: "text-purple-600",
    lightBg: "bg-purple-50",
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { contracts } = useContractStore();
  const router = useRouter();

  // Redirect vendor to their portal
  useEffect(() => {
    if (user?.role === "vendor") {
      router.replace("/vendor");
    }
  }, [user, router]);

  // Summary statistics
  const summary = useMemo(() => {
    const total = contracts.length;
    const running = contracts.filter((c) => c.status === "aktif").length;
    const completed = contracts.filter((c) => c.status === "selesai").length;
    const problematic = contracts.filter((c) => c.status === "bermasalah").length;
    return { total, running, completed, problematic };
  }, [contracts]);

  // Status chart data
  const statusChartData = useMemo(() => {
    return [
      { name: "Aktif", value: summary.running, color: "#10b981" },
      { name: "Selesai", value: summary.completed, color: "#8b5cf6" },
      { name: "Bermasalah", value: summary.problematic, color: "#ef4444" },
    ];
  }, [summary]);

  // Budget data
  const budgetData = useMemo(() => {
    const total = contracts.reduce((sum, c) => sum + (c.nilaiKontrak || c.nilaiPerjanjian || 0), 0);
    const used = contracts.reduce((sum, c) => {
      const nilai = c.nilaiKontrak || c.nilaiPerjanjian || 0;
      const realisasi = c.persentaseRealisasi || 0;
      return sum + (nilai * realisasi) / 100;
    }, 0);
    const remaining = total - used;

    return {
      total,
      used,
      remaining,
      chartData: [
        { name: "Terpakai", value: used, color: "#3b82f6" },
        { name: "Sisa", value: remaining, color: "#e5e7eb" },
      ],
    };
  }, [contracts]);

  // Contracts by category
  const contractsByCategory = useMemo(() => {
    return {
      investasi: contracts.filter((c) => c.kategori === "investasi"),
      pemeliharaan: contracts.filter((c) => c.kategori === "pemeliharaan"),
      administrasi: contracts.filter((c) => c.kategori === "administrasi"),
    };
  }, [contracts]);

  // Recent contracts (last 5)
  const recentContracts = useMemo(() => {
    return [...contracts]
      .sort((a, b) => {
        const dateA = new Date(b.createdAt || b.tanggalPerjanjian || 0).getTime();
        const dateB = new Date(a.createdAt || a.tanggalPerjanjian || 0).getTime();
        return dateA - dateB;
      })
      .slice(0, 5);
  }, [contracts]);

  const summaryValues = { 
    total: summary.total, 
    running: summary.running, 
    completed: summary.completed, 
    problematic: summary.problematic 
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Monitoring</h1>
          <p className="text-sm text-gray-500">
            Selamat datang, {user?.name || "User"} • {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/kontrak" className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm">
            <DocumentIcon />
            Lihat Kontrak
          </Link>
          <Link href="/tagihan" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
            Lihat Tagihan
            <ArrowRightIcon />
          </Link>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCardConfig.map((config, index) => {
          const Icon = config.icon;
          const value = summaryValues[config.key as keyof typeof summaryValues];

          return (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className={`rounded-xl border-l-4 ${config.borderColor} ${config.bgColor} p-5 shadow-sm border border-gray-200/50`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{config.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {value}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {config.key === "problematic" ? "Perlu perhatian" : `${((value / summary.total) * 100 || 0).toFixed(1)}% dari total`}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <StatusPieChart data={statusChartData} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <BudgetChart data={budgetData} />
        </motion.div>
      </div>

      {/* Category Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ringkasan Kategori</h2>
          <Link href="/kontrak" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Lihat Semua <ArrowRightIcon />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {categoryConfig.map((category, index) => {
            const Icon = category.icon;
            const categoryContracts = contractsByCategory[category.key as keyof typeof contractsByCategory];
            const totalValue = categoryContracts.reduce((sum, c) => sum + (c.nilaiKontrak || c.nilaiPerjanjian || 0), 0);
            const aktifCount = categoryContracts.filter((c) => c.status === "aktif").length;

            return (
              <motion.div
                key={category.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              >
                <Link href={`/kontrak?kategori=${category.key}`} className="block">
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 shadow-sm transition-all hover:shadow-md hover:border-gray-300 hover:bg-white">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg ${category.color} text-white`}>
                        <Icon />
                      </div>
                      <div>
                        <h3 className={`font-semibold ${category.textColor}`}>{category.label}</h3>
                        <p className="text-xs text-gray-500">{categoryContracts.length} kontrak • {aktifCount} aktif</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Nilai</span>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(totalValue)}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${category.color}`}
                          style={{ width: `${summary.total > 0 ? (categoryContracts.length / summary.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Contracts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.9 }}
        className="rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-700">
              <ClockIcon />
              <h2 className="text-lg font-semibold text-gray-900">Kontrak Terbaru</h2>
            </div>
            <Link href="/kontrak" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Lihat Semua <ArrowRightIcon />
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentContracts.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <DocumentIcon />
              <p className="mt-2">Belum ada kontrak</p>
            </div>
          ) : (
            recentContracts.map((contract, index) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.9 + index * 0.05 }}
              >
                <Link href={`/kontrak/${contract.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${CONTRACT_STATUS_COLORS[contract.status]}`}>
                        {CONTRACT_STATUS_LABELS[contract.status]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(contract.tanggalPerjanjian).toLocaleDateString("id-ID")}
                      </span>
                    </div>
                    <p className="truncate font-medium text-gray-900">
                      {contract.judulPekerjaan || contract.judulPerjanjian}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {contract.vendor || contract.namaVendor} • {contract.noPerjanjian}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(contract.nilaiKontrak || contract.nilaiPerjanjian || 0)}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${contract.persentaseRealisasi > 90 ? "bg-red-500" : contract.persentaseRealisasi > 50 ? "bg-yellow-500" : "bg-green-500"}`}
                          style={{ width: `${Math.min(contract.persentaseRealisasi, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
