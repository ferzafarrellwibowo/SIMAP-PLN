"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useContractStore, CONTRACT_CATEGORY_LABELS, INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from "@/lib/store-new";
import { useAuth } from "@/lib/auth-new";
import type { Contract, Invoice, ContractCategory } from "@/lib/types-new";

function formatCurrency(value: number): string {
  if (value >= 1000000000) return "Rp " + (value / 1000000000).toFixed(1) + " M";
  if (value >= 1000000) return "Rp " + (value / 1000000).toFixed(0) + " jt";
  return "Rp " + value.toLocaleString("id-ID");
}

function daysAgo(date: string): number {
  const now = new Date();
  const target = new Date(date);
  return Math.floor((now.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
}

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

function SummaryCard({ title, value, subtitle, icon, color }: SummaryCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={"p-3 rounded-xl " + color}>{icon}</div>
      </div>
    </motion.div>
  );
}

function RealisasiChart({ totalNilai, totalDibayar, persentase }: { totalNilai: number; totalDibayar: number; persentase: number }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Serapan Anggaran</h3>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400" title="Persentase penggunaan anggaran dari total nilai kontrak">Serapan Anggaran</span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">{persentase.toFixed(1)}%</span>
        </div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: Math.min(persentase, 100) + "%" }} transition={{ duration: 1, ease: "easeOut" }} className={"h-full rounded-full " + (persentase > 90 ? "bg-red-500" : persentase > 50 ? "bg-yellow-500" : "bg-green-500")} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Nilai Kontrak</p>
          <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">{formatCurrency(totalNilai)}</p>
        </div>
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">Serapan</p>
          <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">{formatCurrency(totalDibayar)}</p>
        </div>
      </div>
    </div>
  );
}

function InvoiceStatusChart({ summary }: { summary: any }) {
  const data = [
    { label: "Diajukan", value: summary.tagihanDiajukan, color: "bg-yellow-500" },
    { label: "Diterima", value: summary.tagihanDiterima, color: "bg-blue-500" },
    { label: "Dibayar", value: summary.tagihanDibayar, color: "bg-green-500" },
    { label: "Ditolak", value: summary.tagihanDitolak, color: "bg-red-500" },
  ];
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Status Tagihan</h3>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
        {data.map((d, i) => (<motion.div key={d.label} initial={{ width: 0 }} animate={{ width: total > 0 ? ((d.value / total) * 100) + "%" : "0%" }} transition={{ duration: 0.8, delay: i * 0.1 }} className={d.color + " h-full"} title={d.label + ": " + d.value} />))}
      </div>
      <div className="grid grid-cols-2 gap-3 mt-4">
        {data.map((d) => (<div key={d.label} className="flex items-center gap-2"><div className={"w-3 h-3 rounded-full " + d.color} /><span className="text-sm text-gray-600 dark:text-gray-400">{d.label}</span><span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-auto">{d.value}</span></div>))}
      </div>
    </div>
  );
}

function CategorySummary({ summary }: { summary: any }) {
  const categories = [
    { key: "investasi" as ContractCategory, count: summary.kontrakInvestasi, nilai: summary.nilaiInvestasi, color: "bg-purple-500", bgColor: "bg-purple-50 dark:bg-purple-900/20", textColor: "text-purple-700 dark:text-purple-300" },
    { key: "pemeliharaan" as ContractCategory, count: summary.kontrakPemeliharaan, nilai: summary.nilaiPemeliharaan, color: "bg-orange-500", bgColor: "bg-orange-50 dark:bg-orange-900/20", textColor: "text-orange-700 dark:text-orange-300" },
    { key: "administrasi" as ContractCategory, count: summary.kontrakAdministrasi, nilai: summary.nilaiAdministrasi, color: "bg-cyan-500", bgColor: "bg-cyan-50 dark:bg-cyan-900/20", textColor: "text-cyan-700 dark:text-cyan-300" },
  ];
  const totalNilai = summary.nilaiInvestasi + summary.nilaiPemeliharaan + summary.nilaiAdministrasi;
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Ringkasan per Kategori</h3>
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex mb-4">
        {categories.map((cat, i) => (<motion.div key={cat.key} initial={{ width: 0 }} animate={{ width: totalNilai > 0 ? ((cat.nilai / totalNilai) * 100) + "%" : "0%" }} transition={{ duration: 0.8, delay: i * 0.15 }} className={cat.color + " h-full"} />))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link key={cat.key} href={"/kontrak?kategori=" + cat.key} className={cat.bgColor + " p-4 rounded-lg hover:opacity-90 transition-opacity"}>
            <div className="flex items-center gap-2 mb-2"><div className={"w-3 h-3 rounded-full " + cat.color} /><p className={"text-sm font-medium " + cat.textColor}>{CONTRACT_CATEGORY_LABELS[cat.key]}</p></div>
            <p className={"text-lg font-bold " + cat.textColor}>{formatCurrency(cat.nilai)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{cat.count} kontrak aktif</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const { contracts, invoices, getDashboardSummary } = useContractStore();
  const [loading, setLoading] = useState(true);
  const summary = useMemo(() => getDashboardSummary(), [getDashboardSummary]);
  
  useEffect(() => { const timer = setTimeout(() => setLoading(false), 600); return () => clearTimeout(timer); }, []);
  
  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => (<div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />))}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl" /><div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl" /></div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Monitoring</h1><p className="text-sm text-gray-500 dark:text-gray-400">Selamat datang, {user?.name || "User"}</p></div>
        <div className="flex items-center gap-3">
          <Link href="/kontrak" className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Lihat Kontrak</Link>
          <Link href="/tagihan" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Lihat Tagihan</Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Kontrak Aktif" value={summary.totalKontrakAktif} subtitle={contracts.length + " total kontrak"} icon={<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} color="bg-blue-100 dark:bg-blue-900/30" />
        <SummaryCard title="Tagihan Pending" value={summary.tagihanDiajukan + summary.tagihanDiterima} subtitle={summary.tagihanPendingLama + " lebih dari 7 hari"} icon={<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-yellow-100 dark:bg-yellow-900/30" />
        <SummaryCard title="Serapan" value={formatCurrency(summary.totalDibayar)} subtitle={summary.persentaseRealisasiGlobal.toFixed(1) + "% serapan"} icon={<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="bg-green-100 dark:bg-green-900/30" />
        <SummaryCard title="Sisa Anggaran" value={formatCurrency(summary.totalSisaAnggaran)} subtitle={summary.kontrakHampirHabis + " kontrak > 90%"} icon={<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} color="bg-purple-100 dark:bg-purple-900/30" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealisasiChart totalNilai={summary.totalNilaiKontrak} totalDibayar={summary.totalDibayar} persentase={summary.persentaseRealisasiGlobal} />
        <InvoiceStatusChart summary={summary} />
      </div>
      <CategorySummary summary={summary} />
    </div>
  );
}
