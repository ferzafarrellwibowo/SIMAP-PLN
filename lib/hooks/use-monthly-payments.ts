"use client";

import { useState, useCallback, useMemo } from "react";
import {
  MonthlyPayment,
  PaymentStatus,
  PaymentSummary,
  MonthlyPaymentDisplay,
  initializeYearlyPayments,
  updatePaymentStatus,
  markMonthsAsPaid,
  getPaymentSummary,
  getPaidMonths,
  getUnpaidMonths,
  getGapMonths,
  getNextUnpaidMonth,
  hasPaymentGaps,
  validatePaymentRange,
} from "@/lib/payment-status";

interface UseMonthlyPaymentsOptions {
  contractId: string;
  year: number;
  initialPayments?: MonthlyPayment[];
}

interface UseMonthlyPaymentsReturn {
  // Data
  payments: MonthlyPayment[];
  summary: PaymentSummary;
  paidMonths: MonthlyPaymentDisplay[];
  unpaidMonths: MonthlyPaymentDisplay[];
  gapMonths: MonthlyPaymentDisplay[];
  nextUnpaid: MonthlyPaymentDisplay | null;
  
  // Status
  hasGaps: boolean;
  isFullyPaid: boolean;
  paidPercentage: number;
  
  // Actions
  markAsPaid: (month: number, additionalData?: Partial<MonthlyPayment>) => void;
  markAsUnpaid: (month: number) => void;
  markMultipleAsPaid: (months: number[], additionalData?: Partial<MonthlyPayment>) => void;
  togglePaymentStatus: (month: number) => void;
  resetYear: () => void;
  
  // Validation
  validateRange: (fromMonth: number, toMonth: number) => {
    isValid: boolean;
    unpaidInRange: MonthlyPaymentDisplay[];
  };
}

/**
 * Custom hook untuk mengelola status pembayaran bulanan
 */
export function useMonthlyPayments({
  contractId,
  year,
  initialPayments,
}: UseMonthlyPaymentsOptions): UseMonthlyPaymentsReturn {
  // Initialize payments
  const [payments, setPayments] = useState<MonthlyPayment[]>(() => {
    if (initialPayments && initialPayments.length > 0) {
      return initialPayments;
    }
    return initializeYearlyPayments(contractId, year);
  });

  // Computed values
  const summary = useMemo(
    () => getPaymentSummary(payments, year),
    [payments, year]
  );

  const paidMonths = useMemo(() => getPaidMonths(payments), [payments]);
  const unpaidMonths = useMemo(() => getUnpaidMonths(payments), [payments]);
  const gapMonths = useMemo(() => getGapMonths(payments), [payments]);
  const nextUnpaid = useMemo(
    () => getNextUnpaidMonth(payments, year),
    [payments, year]
  );
  const hasGaps = useMemo(() => hasPaymentGaps(payments), [payments]);
  const isFullyPaid = useMemo(() => summary.unpaidMonths === 0, [summary]);

  // Actions
  const markAsPaid = useCallback(
    (month: number, additionalData?: Partial<MonthlyPayment>) => {
      setPayments((prev) =>
        updatePaymentStatus(prev, month, year, "PAID", additionalData)
      );
    },
    [year]
  );

  const markAsUnpaid = useCallback(
    (month: number) => {
      setPayments((prev) =>
        updatePaymentStatus(prev, month, year, "UNPAID", {
          amount: undefined,
          paidAt: undefined,
          paidBy: undefined,
          invoiceNumber: undefined,
        })
      );
    },
    [year]
  );

  const markMultipleAsPaid = useCallback(
    (months: number[], additionalData?: Partial<MonthlyPayment>) => {
      setPayments((prev) => markMonthsAsPaid(prev, months, year, additionalData));
    },
    [year]
  );

  const togglePaymentStatus = useCallback(
    (month: number) => {
      const currentPayment = payments.find(
        (p) => p.month === month && p.year === year
      );
      if (currentPayment) {
        if (currentPayment.status === "PAID") {
          markAsUnpaid(month);
        } else {
          markAsPaid(month);
        }
      }
    },
    [payments, year, markAsPaid, markAsUnpaid]
  );

  const resetYear = useCallback(() => {
    setPayments(initializeYearlyPayments(contractId, year));
  }, [contractId, year]);

  const validateRange = useCallback(
    (fromMonth: number, toMonth: number) => {
      return validatePaymentRange(payments, fromMonth, toMonth, year);
    },
    [payments, year]
  );

  return {
    payments,
    summary,
    paidMonths,
    unpaidMonths,
    gapMonths,
    nextUnpaid,
    hasGaps,
    isFullyPaid,
    paidPercentage: summary.paidPercentage,
    markAsPaid,
    markAsUnpaid,
    markMultipleAsPaid,
    togglePaymentStatus,
    resetYear,
    validateRange,
  };
}

/**
 * Hook untuk multiple years (jika diperlukan tracking beberapa tahun)
 */
interface UseMultiYearPaymentsOptions {
  contractId: string;
  years: number[];
  initialPayments?: MonthlyPayment[];
}

export function useMultiYearPayments({
  contractId,
  years,
  initialPayments = [],
}: UseMultiYearPaymentsOptions) {
  const [payments, setPayments] = useState<MonthlyPayment[]>(() => {
    if (initialPayments.length > 0) {
      return initialPayments;
    }
    return years.flatMap((year) => initializeYearlyPayments(contractId, year));
  });

  const getSummaryForYear = useCallback(
    (year: number) => getPaymentSummary(payments, year),
    [payments]
  );

  const getAllSummaries = useMemo(() => {
    return years.map((year) => getPaymentSummary(payments, year));
  }, [payments, years]);

  const markAsPaid = useCallback(
    (month: number, year: number, additionalData?: Partial<MonthlyPayment>) => {
      setPayments((prev) =>
        updatePaymentStatus(prev, month, year, "PAID", additionalData)
      );
    },
    []
  );

  const markAsUnpaid = useCallback((month: number, year: number) => {
    setPayments((prev) =>
      updatePaymentStatus(prev, month, year, "UNPAID", {
        amount: undefined,
        paidAt: undefined,
      })
    );
  }, []);

  return {
    payments,
    getSummaryForYear,
    getAllSummaries,
    markAsPaid,
    markAsUnpaid,
  };
}
