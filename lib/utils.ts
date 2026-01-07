import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Status logic based on requirements
export type ProjectStatus = "green" | "yellow" | "red";

export function getProjectStatus(
  progressActual: number,
  progressPlanned: number,
  budgetUsed: number,
  budgetTotal: number
): ProjectStatus {
  const progressDeviation = progressPlanned - progressActual;
  const budgetPercentage = (budgetUsed / budgetTotal) * 100;
  const progressPercentage = progressActual;

  // Red: Budget far exceeds progress OR significant delay
  if (budgetPercentage > progressPercentage + 20 || progressDeviation > 15) {
    return "red";
  }

  // Yellow: Small deviation
  if (budgetPercentage > progressPercentage + 10 || progressDeviation > 5) {
    return "yellow";
  }

  // Green: Progress >= plan and budget <= progress
  return "green";
}

export function getStatusColor(status: ProjectStatus): string {
  switch (status) {
    case "green":
      return "text-emerald-500";
    case "yellow":
      return "text-amber-500";
    case "red":
      return "text-red-500";
  }
}

export function getStatusBgColor(status: ProjectStatus): string {
  switch (status) {
    case "green":
      return "bg-emerald-500";
    case "yellow":
      return "bg-amber-500";
    case "red":
      return "bg-red-500";
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
