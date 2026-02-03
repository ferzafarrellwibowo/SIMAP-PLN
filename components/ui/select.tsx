"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  className,
  label,
}: SelectProps) {
  return (
    <div className={cn("relative", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative inline-flex items-center w-full overflow-hidden rounded-lg">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
              "custom-select w-full appearance-none border border-gray-300 bg-transparent px-4 py-2.5 pr-10",
              "text-sm text-gray-900 shadow-sm",
              "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
              className
            )}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}
