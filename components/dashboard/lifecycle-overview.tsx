"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

interface LifecycleStats {
  total: number;
  draft: number;
  initiated: number;
  planned: number;
  onProgress: number;
  onHold: number;
  completed: number;
  cancelled: number;
  healthy: number;
  warning: number;
  critical: number;
}

interface LifecycleOverviewProps {
  stats: LifecycleStats;
}

export function LifecycleOverview({ stats }: LifecycleOverviewProps) {
  const lifecycleStages = [
    { 
      key: "draft", 
      label: "Draft", 
      count: stats.draft, 
      color: "bg-slate-400",
      borderColor: "border-slate-400",
      textColor: "text-slate-600",
      description: "Menunggu review"
    },
    { 
      key: "initiated", 
      label: "Initiated", 
      count: stats.initiated, 
      color: "bg-blue-500",
      borderColor: "border-blue-500",
      textColor: "text-blue-600",
      description: "Siap planning"
    },
    { 
      key: "planned", 
      label: "Planned", 
      count: stats.planned, 
      color: "bg-violet-500",
      borderColor: "border-violet-500",
      textColor: "text-violet-600",
      description: "Siap eksekusi"
    },
    { 
      key: "onProgress", 
      label: "On Progress", 
      count: stats.onProgress, 
      color: "bg-cyan-500",
      borderColor: "border-cyan-500",
      textColor: "text-cyan-600",
      description: "Sedang berjalan"
    },
    { 
      key: "onHold", 
      label: "On Hold", 
      count: stats.onHold, 
      color: "bg-amber-500",
      borderColor: "border-amber-500",
      textColor: "text-amber-600",
      description: "Ditunda"
    },
    { 
      key: "completed", 
      label: "Completed", 
      count: stats.completed, 
      color: "bg-emerald-500",
      borderColor: "border-emerald-500",
      textColor: "text-emerald-600",
      description: "Selesai"
    },
    { 
      key: "cancelled", 
      label: "Cancelled", 
      count: stats.cancelled, 
      color: "bg-red-500",
      borderColor: "border-red-500",
      textColor: "text-red-600",
      description: "Dibatalkan"
    },
  ];

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Project Lifecycle Overview
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Status proyek berdasarkan tahapan lifecycle
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
            <span className="text-sm font-medium text-emerald-700">Sehat: {stats.healthy}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <span className="text-sm font-medium text-amber-700">Perhatian: {stats.warning}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            <span className="text-sm font-medium text-red-700">Kritis: {stats.critical}</span>
          </div>
        </div>
      </div>

      {/* Lifecycle Flow */}
      <div className="relative px-4">
        {/* Connection Line */}
        <div className="absolute top-7 left-[8%] right-[8%] h-1 bg-gradient-to-r from-slate-300 via-cyan-300 to-emerald-300 rounded-full" />

        {/* Stages */}
        <div className="relative z-10 grid grid-cols-7 gap-2">
          {lifecycleStages.map((stage, index) => (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 200 }}
              className="flex flex-col items-center"
            >
              {/* Circle with count */}
              <div className="relative group">
                <div
                  className={`w-14 h-14 rounded-full ${stage.color} flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform duration-200 group-hover:scale-110 border-4 border-white`}
                >
                  {stage.count}
                </div>
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-full ${stage.color} opacity-0 group-hover:opacity-30 blur-md transition-opacity duration-200`} />
              </div>

              {/* Label */}
              <p className={`mt-3 text-sm font-semibold text-center ${stage.textColor}`}>
                {stage.label}
              </p>
              <p className="text-xs text-gray-500 text-center leading-tight mt-0.5">
                {stage.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Proyek</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Aktif</p>
                <p className="text-lg font-bold text-cyan-600">{stats.onProgress}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500">Selesai</p>
                <p className="text-lg font-bold text-emerald-600">{stats.completed}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-gray-50">
            <div className="text-right">
              <p className="text-xs text-gray-500">Tingkat Penyelesaian</p>
              <p className="text-xl font-bold text-gray-900">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
