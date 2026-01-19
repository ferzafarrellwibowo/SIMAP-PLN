// ============================================
// SUPABASE SERVICE UNTUK SUBSCRIPTIONS
// ============================================

import { createClient } from "@supabase/supabase-js";
import {
  Subscription,
  MonthlyPayment,
  SubscriptionWithPayments,
  SubscriptionFormInput,
  PaymentStatus,
  calculateGapMonths,
} from "./subscription-types";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================
// SUBSCRIPTION CRUD
// ============================================

/**
 * Get all subscriptions with payment summary
 */
export async function getSubscriptions(): Promise<SubscriptionWithPayments[]> {
  const { data: subscriptions, error: subError } = await supabase
    .from("subscriptions")
    .select("*")
    .order("created_at", { ascending: false });

  if (subError) throw subError;
  if (!subscriptions) return [];

  // Get all payments for all subscriptions
  const subscriptionIds = subscriptions.map((s) => s.id);
  const { data: payments, error: payError } = await supabase
    .from("monthly_payments")
    .select("*")
    .in("subscription_id", subscriptionIds)
    .order("tahun", { ascending: true })
    .order("bulan", { ascending: true });

  if (payError) throw payError;

  // Map subscriptions with their payments
  return subscriptions.map((sub) => {
    const subPayments = (payments || []).filter(
      (p) => p.subscription_id === sub.id
    );
    const paidPayments = subPayments.filter((p) => p.status === "PAID");
    const unpaidPayments = subPayments.filter((p) => p.status === "UNPAID");

    // Calculate gaps for current year (2026)
    const currentYear = new Date().getFullYear();
    const gapMonths = calculateGapMonths(subPayments, currentYear);

    const totalTerbayar = paidPayments.reduce(
      (sum, p) => sum + (p.jumlah_bayar || sub.anggaran_per_bulan),
      0
    );

    const totalBulanKontrak =
      (sub.periode_selesai - sub.periode_mulai + 1) * 12;
    const paidPercentage =
      totalBulanKontrak > 0
        ? Math.round((paidPayments.length / totalBulanKontrak) * 100)
        : 0;

    return {
      ...sub,
      payments: subPayments,
      total_bulan_terbayar: paidPayments.length,
      total_bulan_belum_bayar: unpaidPayments.length,
      total_terbayar: totalTerbayar,
      has_gaps: gapMonths.length > 0,
      gap_months: gapMonths,
      paid_percentage: paidPercentage,
    };
  });
}

/**
 * Get single subscription by ID with payments
 */
export async function getSubscriptionById(
  id: string
): Promise<SubscriptionWithPayments | null> {
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .single();

  if (subError) {
    if (subError.code === "PGRST116") return null; // Not found
    throw subError;
  }

  const { data: payments, error: payError } = await supabase
    .from("monthly_payments")
    .select("*")
    .eq("subscription_id", id)
    .order("tahun", { ascending: true })
    .order("bulan", { ascending: true });

  if (payError) throw payError;

  const subPayments = payments || [];
  const paidPayments = subPayments.filter((p) => p.status === "PAID");
  const unpaidPayments = subPayments.filter((p) => p.status === "UNPAID");

  const currentYear = new Date().getFullYear();
  const gapMonths = calculateGapMonths(subPayments, currentYear);

  const totalTerbayar = paidPayments.reduce(
    (sum, p) => sum + (p.jumlah_bayar || subscription.anggaran_per_bulan),
    0
  );

  const totalBulanKontrak =
    (subscription.periode_selesai - subscription.periode_mulai + 1) * 12;
  const paidPercentage =
    totalBulanKontrak > 0
      ? Math.round((paidPayments.length / totalBulanKontrak) * 100)
      : 0;

  return {
    ...subscription,
    payments: subPayments,
    total_bulan_terbayar: paidPayments.length,
    total_bulan_belum_bayar: unpaidPayments.length,
    total_terbayar: totalTerbayar,
    has_gaps: gapMonths.length > 0,
    gap_months: gapMonths,
    paid_percentage: paidPercentage,
  };
}

/**
 * Create new subscription with monthly payments
 */
export async function createSubscription(
  input: SubscriptionFormInput
): Promise<Subscription> {
  // Insert subscription
  const { data: subscription, error: subError } = await supabase
    .from("subscriptions")
    .insert({
      no_perjanjian: input.no_perjanjian,
      nama_layanan: input.nama_layanan,
      vendor: input.vendor,
      unit: input.unit,
      anggaran_per_bulan: input.anggaran_per_bulan,
      periode_mulai: input.periode_mulai,
      periode_selesai: input.periode_selesai,
      kategori: input.kategori || "lainnya",
      deskripsi: input.deskripsi,
      status: "aktif",
    })
    .select()
    .single();

  if (subError) throw subError;

  // Generate monthly payments for the entire period
  const payments: Omit<MonthlyPayment, "id" | "created_at" | "updated_at">[] =
    [];

  for (let year = input.periode_mulai; year <= input.periode_selesai; year++) {
    for (let month = 1; month <= 12; month++) {
      payments.push({
        subscription_id: subscription.id,
        bulan: month,
        tahun: year,
        status: "UNPAID",
        jumlah_bayar: input.anggaran_per_bulan,
      });
    }
  }

  // Insert all payments
  const { error: payError } = await supabase
    .from("monthly_payments")
    .insert(payments);

  if (payError) throw payError;

  return subscription;
}

/**
 * Update subscription
 */
export async function updateSubscription(
  id: string,
  input: Partial<SubscriptionFormInput>
): Promise<Subscription> {
  const { data, error } = await supabase
    .from("subscriptions")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete subscription (cascade deletes payments)
 */
export async function deleteSubscription(id: string): Promise<void> {
  const { error } = await supabase.from("subscriptions").delete().eq("id", id);

  if (error) throw error;
}

// ============================================
// PAYMENT OPERATIONS
// ============================================

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  additionalData?: {
    tanggal_bayar?: string;
    no_invoice?: string;
    keterangan?: string;
  }
): Promise<MonthlyPayment> {
  const updateData: Record<string, unknown> = { status };

  if (status === "PAID") {
    updateData.tanggal_bayar =
      additionalData?.tanggal_bayar || new Date().toISOString().split("T")[0];
    if (additionalData?.no_invoice) {
      updateData.no_invoice = additionalData.no_invoice;
    }
  } else {
    updateData.tanggal_bayar = null;
    updateData.no_invoice = null;
  }

  if (additionalData?.keterangan) {
    updateData.keterangan = additionalData.keterangan;
  }

  const { data, error } = await supabase
    .from("monthly_payments")
    .update(updateData)
    .eq("id", paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark multiple payments as paid
 */
export async function markPaymentsAsPaid(
  subscriptionId: string,
  year: number,
  months: number[]
): Promise<void> {
  const { error } = await supabase
    .from("monthly_payments")
    .update({
      status: "PAID",
      tanggal_bayar: new Date().toISOString().split("T")[0],
    })
    .eq("subscription_id", subscriptionId)
    .eq("tahun", year)
    .in("bulan", months);

  if (error) throw error;
}

/**
 * Mark all payments for a year as paid
 */
export async function markYearAsPaid(
  subscriptionId: string,
  year: number
): Promise<void> {
  const { error } = await supabase
    .from("monthly_payments")
    .update({
      status: "PAID",
      tanggal_bayar: new Date().toISOString().split("T")[0],
    })
    .eq("subscription_id", subscriptionId)
    .eq("tahun", year);

  if (error) throw error;
}

/**
 * Reset all payments for a year to unpaid
 */
export async function resetYearPayments(
  subscriptionId: string,
  year: number
): Promise<void> {
  const { error } = await supabase
    .from("monthly_payments")
    .update({
      status: "UNPAID",
      tanggal_bayar: null,
      no_invoice: null,
    })
    .eq("subscription_id", subscriptionId)
    .eq("tahun", year);

  if (error) throw error;
}

/**
 * Get payments for a specific subscription and year
 */
export async function getPaymentsByYear(
  subscriptionId: string,
  year: number
): Promise<MonthlyPayment[]> {
  const { data, error } = await supabase
    .from("monthly_payments")
    .select("*")
    .eq("subscription_id", subscriptionId)
    .eq("tahun", year)
    .order("bulan", { ascending: true });

  if (error) throw error;
  return data || [];
}

// ============================================
// STATISTICS
// ============================================

export interface SubscriptionStats {
  totalSubscriptions: number;
  totalLunas: number;
  totalAdaTerlewat: number;
  totalBelumBayar: number;
  totalNilaiTerbayar: number;
  totalNilaiBelumBayar: number;
}

export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  const subscriptions = await getSubscriptions();
  const currentYear = new Date().getFullYear();

  let totalLunas = 0;
  let totalAdaTerlewat = 0;
  let totalNilaiTerbayar = 0;
  let totalNilaiBelumBayar = 0;

  for (const sub of subscriptions) {
    // Check current year payments
    const yearPayments = sub.payments.filter((p) => p.tahun === currentYear);
    const paidCount = yearPayments.filter((p) => p.status === "PAID").length;
    const unpaidCount = yearPayments.filter((p) => p.status === "UNPAID").length;

    if (paidCount === 12) {
      totalLunas++;
    } else if (sub.has_gaps) {
      totalAdaTerlewat++;
    }

    totalNilaiTerbayar += sub.total_terbayar;
    totalNilaiBelumBayar += sub.total_bulan_belum_bayar * sub.anggaran_per_bulan;
  }

  return {
    totalSubscriptions: subscriptions.length,
    totalLunas,
    totalAdaTerlewat,
    totalBelumBayar: subscriptions.length - totalLunas,
    totalNilaiTerbayar,
    totalNilaiBelumBayar,
  };
}
