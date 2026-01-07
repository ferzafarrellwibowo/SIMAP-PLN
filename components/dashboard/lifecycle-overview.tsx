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
      color: "bg-gray-400",
      description: "Menunggu review"
    },
    { 
      key: "initiated", 
      label: "Initiated", 
      count: stats.initiated, 
      color: "bg-blue-500",
      description: "Siap planning"
    },
    { 
      key: "planned", 
      label: "Planned", 
      count: stats.planned, 
      color: "bg-indigo-500",
      description: "Siap eksekusi"
    },
    { 
      key: "onProgress", 
      label: "On Progress", 
      count: stats.onProgress, 
      color: "bg-cyan-500",
      description: "Sedang berjalan"
    },
    { 
      key: "onHold", 
      label: "On Hold", 
      count: stats.onHold, 
      color: "bg-amber-500",
      description: "Ditunda"
    },
    { 
      key: "completed", 
      label: "Completed", 
      count: stats.completed, 
      color: "bg-emerald-500",
      description: "Selesai"
    },
    { 
      key: "cancelled", 
      label: "Cancelled", 
      count: stats.cancelled, 
      color: "bg-red-500",
      description: "Dibatalkan"
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Project Lifecycle Overview
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Status proyek berdasarkan tahapan lifecycle
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Sehat: {stats.healthy}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Perhatian: {stats.warning}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Kritis: {stats.critical}</span>
          </div>
        </div>
      </div>

      {/* Lifecycle Flow */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 z-0" />

        {/* Stages */}
        <div className="relative z-10 flex justify-between">
          {lifecycleStages.map((stage, index) => (
            <motion.div
              key={stage.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              {/* Circle with count */}
              <div
                className={`w-16 h-16 rounded-full ${stage.color} flex items-center justify-center text-white font-bold text-xl shadow-lg`}
              >
                {stage.count}
              </div>

              {/* Label */}
              <p className="mt-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                {stage.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {stage.description}
              </p>

              {/* Arrow placeholder removed to render arrows from parent for perfect centering */}
            </motion.div>
          ))}

          {/* Arrows removed as requested */}
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total Proyek:</span>
              <span className="ml-2 font-semibold text-gray-900 dark:text-gray-100">{stats.total}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Aktif:</span>
              <span className="ml-2 font-semibold text-cyan-600">{stats.onProgress}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Selesai:</span>
              <span className="ml-2 font-semibold text-emerald-600">{stats.completed}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Tingkat Penyelesaian:</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
