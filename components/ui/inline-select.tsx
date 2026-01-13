"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface InlineSelectOption {
  value: string;
  label: string;
}

interface InlineSelectProps {
  options: InlineSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onCancel?: () => void;
}

export function InlineSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih",
  onCancel,
}: InlineSelectProps) {
  return (
    <div className="inline-flex items-center w-auto bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 shadow-sm">
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "text-xs px-3 py-2 bg-transparent text-gray-900 dark:text-gray-100 border-none focus:ring-0 focus:outline-none cursor-pointer appearance-none pr-6"
          )}
          defaultValue=""
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-300" />
      </div>
      {onCancel && (
        <button
          onClick={onCancel}
          className="px-2 py-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors border-l border-gray-300 dark:border-gray-700"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
