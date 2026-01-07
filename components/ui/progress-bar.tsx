"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  color?: "blue" | "green" | "yellow" | "red" | "gray";
  size?: "sm" | "md" | "lg";
}

const colorMap = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
  gray: "bg-gray-400",
};

const sizeMap = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  color = "blue",
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {percentage.toFixed(1)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          "w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden",
          sizeMap[size]
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cn("h-full rounded-full", barClassName || colorMap[color])}
        />
      </div>
    </div>
  );
}

interface DualProgressBarProps {
  planned: number;
  actual: number;
  className?: string;
}

export function DualProgressBar({ planned, actual, className }: DualProgressBarProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500">Rencana: {planned}%</span>
        <span className="text-gray-500">Realisasi: {actual}%</span>
      </div>
      <div className="relative h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${planned}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute h-full rounded-full bg-blue-200 dark:bg-blue-900"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${actual}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className={cn(
            "absolute h-full rounded-full",
            actual >= planned ? "bg-emerald-500" : actual >= planned - 10 ? "bg-amber-500" : "bg-red-500"
          )}
        />
      </div>
    </div>
  );
}
