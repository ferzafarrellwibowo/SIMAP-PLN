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

// ============================================
// DATA TRANSFORMATION UTILITIES
// Untuk transformasi antara camelCase (TS) dan snake_case (DB)
// ============================================

/**
 * Convert snake_case to camelCase
 */
export function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
export function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Transform object keys from snake_case to camelCase
 */
export function transformToCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => transformToCamelCase(item)) as any;
  }
  if (typeof obj !== 'object') return obj;

  const result: any = {};
  Object.keys(obj).forEach((key) => {
    const camelKey = toCamelCase(key);
    result[camelKey] = transformToCamelCase(obj[key]);
  });
  return result;
}

/**
 * Transform object keys from camelCase to snake_case
 */
export function transformToSnakeCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => transformToSnakeCase(item)) as any;
  }
  if (typeof obj !== 'object') return obj;

  const result: any = {};
  Object.keys(obj).forEach((key) => {
    const snakeKey = toSnakeCase(key);
    result[snakeKey] = transformToSnakeCase(obj[key]);
  });
  return result;
}
