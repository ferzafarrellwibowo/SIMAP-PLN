"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ReactNode } from "react";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-gray-100 text-gray-800",
        success: "bg-emerald-200 text-emerald-800",
        warning: "bg-amber-200 text-amber-800",
        danger: "bg-red-200 text-red-800",
        info: "bg-blue-200 text-blue-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: ReactNode;
  className?: string;
}

export function Badge({ children, variant, className }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: "green" | "yellow" | "red" }) {
  const config = {
    green: { variant: "success" as const, label: "Sesuai Rencana", dotColor: "bg-emerald-500" },
    yellow: { variant: "warning" as const, label: "Ada Deviasi", dotColor: "bg-amber-500" },
    red: { variant: "danger" as const, label: "Masalah Serius", dotColor: "bg-red-500" },
  };

  const { variant, label, dotColor } = config[status];

  return (
    <Badge variant={variant} className="gap-1.5">
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </Badge>
  );
}
