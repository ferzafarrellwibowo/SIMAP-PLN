"use client";

import { cn } from "@/lib/utils";
import {
  MonthlyPaymentDisplay,
  PaymentSummary,
  MONTHS_ID,
} from "@/lib/payment-status";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// ============================================
// PAYMENT STATUS BADGE COMPONENT
// ============================================

interface PaymentStatusBadgeProps {
  status: "PAID" | "UNPAID";
  isGap?: boolean;
  className?: string;
}

export function PaymentStatusBadge({
  status,
  isGap = false,
  className,
}: PaymentStatusBadgeProps) {
  if (status === "PAID") {
    return (
      <Badge variant="success" className={cn("gap-1", className)}>
        <CheckCircle className="w-3 h-3" />
        <span>Lunas</span>
      </Badge>
    );
  }

  // Unpaid dengan gap (ada bulan setelahnya yang sudah paid)
  if (isGap) {
    return (
      <Badge variant="warning" className={cn("gap-1", className)}>
        <AlertTriangle className="w-3 h-3" />
        <span>Terlewat</span>
      </Badge>
    );
  }

  return (
    <Badge variant="danger" className={cn("gap-1", className)}>
      <XCircle className="w-3 h-3" />
      <span>Belum Bayar</span>
    </Badge>
  );
}

// ============================================
// MONTH CARD COMPONENT
// ============================================

interface MonthCardProps {
  payment: MonthlyPaymentDisplay;
  isGap?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

export function MonthCard({
  payment,
  isGap = false,
  onClick,
  selected = false,
}: MonthCardProps) {
  const isPaid = payment.status === "PAID";

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-3 rounded-lg border-2 transition-all text-left w-full",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2",
        isPaid
          ? "border-emerald-300 bg-emerald-50 focus:ring-emerald-500"
          : isGap
          ? "border-amber-300 bg-amber-50 focus:ring-amber-500"
          : "border-red-300 bg-red-50 focus:ring-red-500",
        selected && "ring-2 ring-offset-2 ring-blue-500"
      )}
    >
      {/* Status Icon */}
      <div className="absolute top-2 right-2">
        {isPaid ? (
          <CheckCircle className="w-5 h-5 text-emerald-600" />
        ) : isGap ? (
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600" />
        )}
      </div>

      {/* Month Name */}
      <div className="font-semibold text-gray-900">
        {payment.monthName}
      </div>

      {/* Status Label */}
      <div
        className={cn(
          "text-xs mt-1",
          isPaid
            ? "text-emerald-700"
            : isGap
            ? "text-amber-700"
            : "text-red-700"
        )}
      >
        {isPaid ? "Lunas" : isGap ? "Terlewat" : "Belum Bayar"}
      </div>

      {/* Amount if paid */}
      {isPaid && payment.amount && (
        <div className="text-xs text-gray-500 mt-1">
          Rp {payment.amount.toLocaleString("id-ID")}
        </div>
      )}
    </button>
  );
}

// ============================================
// PAYMENT STATUS GRID COMPONENT
// Grid 12 bulan dalam setahun
// ============================================

interface PaymentStatusGridProps {
  summary: PaymentSummary;
  onMonthClick?: (payment: MonthlyPaymentDisplay) => void;
  selectedMonths?: number[];
  className?: string;
}

export function PaymentStatusGrid({
  summary,
  onMonthClick,
  selectedMonths = [],
  className,
}: PaymentStatusGridProps) {
  const gapMonthNumbers = summary.gapMonths.map((g) => g.month);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with Summary */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Status Pembayaran {summary.year}
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-emerald-600 font-medium">
            {summary.paidMonths} Lunas
          </span>
          <span className="text-gray-400">/</span>
          <span className="text-red-600 font-medium">
            {summary.unpaidMonths} Belum Bayar
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-emerald-500 transition-all duration-500"
          style={{ width: `${summary.paidPercentage}%` }}
        />
      </div>

      {/* Gap Warning */}
      {summary.hasGapsInPayment && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <span className="font-medium">Perhatian:</span> Ada{" "}
            {summary.gapMonths.length} bulan terlewat (
            {summary.gapMonths.map((g) => g.monthShort).join(", ")})
          </div>
        </div>
      )}

      {/* Month Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
        {summary.allMonths.map((payment) => (
          <MonthCard
            key={payment.month}
            payment={payment}
            isGap={gapMonthNumbers.includes(payment.month)}
            onClick={() => onMonthClick?.(payment)}
            selected={selectedMonths.includes(payment.month)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span>Lunas</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span>Terlewat</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>Belum Bayar</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// PAYMENT STATUS LIST COMPONENT
// List view alternatif untuk detail
// ============================================

interface PaymentStatusListProps {
  payments: MonthlyPaymentDisplay[];
  gapMonths?: number[];
  title?: string;
  emptyMessage?: string;
  className?: string;
}

export function PaymentStatusList({
  payments,
  gapMonths = [],
  title,
  emptyMessage = "Tidak ada data",
  className,
}: PaymentStatusListProps) {
  if (payments.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-500", className)}>
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {title && (
        <h4 className="font-medium text-gray-900 mb-3">
          {title}
        </h4>
      )}
      <div className="space-y-2">
        {payments.map((payment) => (
          <div
            key={payment.month}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border",
              payment.isPaid
                ? "border-emerald-200 bg-emerald-50"
                : gapMonths.includes(payment.month)
                ? "border-amber-200 bg-amber-50"
                : "border-red-200 bg-red-50"
            )}
          >
            <div>
              <div className="font-medium text-gray-900">
                {payment.monthName} {payment.year}
              </div>
              {payment.amount && (
                <div className="text-sm text-gray-500">
                  Rp {payment.amount.toLocaleString("id-ID")}
                </div>
              )}
            </div>
            <PaymentStatusBadge
              status={payment.status}
              isGap={gapMonths.includes(payment.month)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// PAYMENT SUMMARY CARD COMPONENT
// Card untuk dashboard overview
// ============================================

interface PaymentSummaryCardProps {
  summary: PaymentSummary;
  className?: string;
}

export function PaymentSummaryCard({
  summary,
  className,
}: PaymentSummaryCardProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-gray-900">
          Ringkasan Pembayaran {summary.year}
        </h3>
        <Badge
          variant={
            summary.paidPercentage === 100
              ? "success"
              : summary.hasGapsInPayment
              ? "warning"
              : "info"
          }
        >
          {summary.paidPercentage}% Terbayar
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-emerald-50 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">
            {summary.paidMonths}
          </div>
          <div className="text-xs text-emerald-700">
            Bulan Lunas
          </div>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">
            {summary.unpaidMonths}
          </div>
          <div className="text-xs text-red-700">
            Bulan Belum Bayar
          </div>
        </div>
      </div>

      {/* Gap Warning */}
      {summary.hasGapsInPayment && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">
              {summary.gapMonths.length} bulan terlewat perlu dibayar
            </span>
          </div>
          <div className="text-xs text-amber-600 mt-1">
            {summary.gapMonths.map((g) => g.monthName).join(", ")}
          </div>
        </div>
      )}

      {/* Total Amount */}
      {summary.totalPaidAmount > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            Total Terbayar
          </div>
          <div className="text-xl font-bold text-gray-900">
            Rp {summary.totalPaidAmount.toLocaleString("id-ID")}
          </div>
        </div>
      )}
    </Card>
  );
}

// ============================================
// COMPACT MONTH INDICATOR
// Untuk inline display di table atau list
// ============================================

interface CompactMonthIndicatorProps {
  summary: PaymentSummary;
  className?: string;
}

export function CompactMonthIndicator({
  summary,
  className,
}: CompactMonthIndicatorProps) {
  const gapMonthNumbers = summary.gapMonths.map((g) => g.month);

  return (
    <div className={cn("flex gap-0.5", className)}>
      {summary.allMonths.map((payment) => {
        const isGap = gapMonthNumbers.includes(payment.month);
        return (
          <div
            key={payment.month}
            title={`${payment.monthName}: ${payment.statusLabel}`}
            className={cn(
              "w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-medium cursor-default",
              payment.isPaid
                ? "bg-emerald-500 text-white"
                : isGap
                ? "bg-amber-500 text-white"
                : "bg-red-500 text-white"
            )}
          >
            {payment.monthShort.charAt(0)}
          </div>
        );
      })}
    </div>
  );
}
