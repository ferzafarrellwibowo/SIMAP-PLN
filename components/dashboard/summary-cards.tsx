"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  FolderKanban,
  PlayCircle,
} from "lucide-react";

interface SummaryCardsProps {
  total: number;
  running: number;
  completed: number;
  problematic: number;
}

const cardConfig = [
  {
    key: "total",
    title: "Total Proyek",
    icon: FolderKanban,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-l-blue-500",
  },
  {
    key: "running",
    title: "Proyek Berjalan",
    icon: PlayCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-l-emerald-500",
  },
  {
    key: "completed",
    title: "Proyek Selesai",
    icon: CheckCircle2,
    color: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-950/30",
    borderColor: "border-l-violet-500",
  },
  {
    key: "problematic",
    title: "Proyek Bermasalah",
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/30",
    borderColor: "border-l-red-500",
  },
];

export function SummaryCards({ total, running, completed, problematic }: SummaryCardsProps) {
  const values = { total, running, completed, problematic };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cardConfig.map((config, index) => {
        const Icon = config.icon;
        const value = values[config.key as keyof typeof values];

        return (
          <motion.div
            key={config.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className={`border-l-4 ${config.borderColor} ${config.bgColor} overflow-hidden relative`}
              hover={false}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {config.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${config.bgColor}`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: index * 0.1 + 0.2 }}
                >
                  <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {value}
                  </span>
                </motion.div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {config.key === "problematic" 
                    ? "Perlu perhatian segera" 
                    : `${((value / total) * 100 || 0).toFixed(1)}% dari total`}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
