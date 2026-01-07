"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { SummaryCards } from "@/components/dashboard/summary-cards";
import { StatusPieChart } from "@/components/dashboard/status-chart";
import { ProgressChart } from "@/components/dashboard/progress-chart";
import { BudgetChart } from "@/components/dashboard/budget-chart";
import { ProblematicProjectsTable } from "@/components/dashboard/problematic-projects-table";
import { RiskIndicators } from "@/components/dashboard/risk-indicators";
import { DashboardFiltersComponent } from "@/components/dashboard/dashboard-filters";
import { LifecycleOverview } from "@/components/dashboard/lifecycle-overview";
import { CardSkeleton, ChartSkeleton, TableSkeleton } from "@/components/ui/skeleton";

import { useProjectStore } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import type { DashboardFilters } from "@/lib/types";

export default function Home() {
  const { user } = useAuth();
  const { projects, metrics, getSummaryStats } = useProjectStore();
  
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({
    period: "all",
    unit: "all",
    location: "all",
    status: "all",
  });

  // Simulating data loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Reload when filters change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [filters]);

  // Filter projects based on user role and filters
  const filteredProjects = useMemo(() => {
    let result = projects;

    // PIC can only see their own projects
    if (user?.role === "pic") {
      result = result.filter((p) => p.picId === user.id);
    }

    // Apply filters
    if (filters.unit && filters.unit !== "all") {
      result = result.filter((p) => p.unit === filters.unit);
    }
    if (filters.location && filters.location !== "all") {
      result = result.filter((p) => p.location === filters.location);
    }
    if (filters.status && filters.status !== "all") {
      result = result.filter((p) => p.status === filters.status);
    }
    if (filters.healthStatus && filters.healthStatus !== "all") {
      result = result.filter((p) => p.healthStatus === filters.healthStatus);
    }

    return result;
  }, [projects, user, filters]);

  // Calculate summary stats
  const summary = useMemo(() => {
    const total = filteredProjects.length;
    const running = filteredProjects.filter(
      (p) => p.status === "on_progress"
    ).length;
    const completed = filteredProjects.filter(
      (p) => p.status === "completed"
    ).length;
    const problematic = filteredProjects.filter(
      (p) => p.healthStatus === "red"
    ).length;

    return { total, running, completed, problematic };
  }, [filteredProjects]);

  // Status distribution for pie chart
  const statusData = useMemo(() => {
    const green = filteredProjects.filter((p) => p.healthStatus === "green").length;
    const yellow = filteredProjects.filter((p) => p.healthStatus === "yellow").length;
    const red = filteredProjects.filter((p) => p.healthStatus === "red").length;

    return [
      { name: "Sehat", value: green, color: "#10b981" },
      { name: "Perlu Perhatian", value: yellow, color: "#f59e0b" },
      { name: "Kritis", value: red, color: "#ef4444" },
    ];
  }, [filteredProjects]);

  // Progress data for chart
  const progressData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];
    return months.map((month, index) => {
      const baseProgress = (index + 1) * 15;
      return {
        month,
        rencana: Math.min(baseProgress + 5, 100),
        realisasi: Math.min(baseProgress - 3, 100),
      };
    });
  }, []);

  // Budget data
  const budgetData = useMemo(() => {
    const totalBudget = filteredProjects.reduce((sum, p) => sum + p.estimatedBudget, 0);
    // Calculate actual usage from metrics
    let totalUsed = 0;
    filteredProjects.forEach((p) => {
      const m = metrics[p.id];
      if (m) {
        totalUsed += m.actualCost;
      } else {
        // Estimate if no metrics
        totalUsed += p.estimatedBudget * 0.5;
      }
    });
    const remaining = totalBudget - totalUsed;

    return {
      total: totalBudget,
      used: totalUsed,
      remaining,
      chartData: [
        { name: "Realisasi", value: totalUsed, color: "#3b82f6" },
        { name: "Sisa", value: remaining, color: "#e5e7eb" },
      ],
    };
  }, [filteredProjects, metrics]);

  // Problematic projects (red and yellow)
  const problematicProjects = useMemo(() => {
    return filteredProjects
      .filter((p) => p.healthStatus === "red" || p.healthStatus === "yellow")
      .map((p) => {
        const m = metrics[p.id];
        return {
          id: p.id,
          name: p.name,
          unit: p.unit,
          location: p.location,
          status: p.healthStatus,
          progressPlanned: m?.plannedProgress || 0,
          progressActual: m?.actualProgress || 0,
          budgetTotal: p.estimatedBudget,
          budgetUsed: m?.actualCost || 0,
          startDate: p.targetStartDate,
          endDate: p.targetEndDate,
          lastUpdate: p.updatedAt.split("T")[0],
        };
      })
      .sort((a, b) => {
        if (a.status === "red" && b.status !== "red") return -1;
        if (b.status === "red" && a.status !== "red") return 1;
        return (b.progressPlanned - b.progressActual) - (a.progressPlanned - a.progressActual);
      })
      .slice(0, 10);
  }, [filteredProjects, metrics]);

  // Risk indicators
  const riskIndicators = useMemo(() => {
    const now = new Date();
    
    const delayedProjects = filteredProjects.filter((p) => {
      const m = metrics[p.id];
      return m && m.scheduleVariance < -10;
    }).length;

    const overBudgetProjects = filteredProjects.filter((p) => {
      const m = metrics[p.id];
      return m && m.absorptionRate > 85;
    }).length;

    const noUpdateProjects = filteredProjects.filter((p) => {
      const lastUpdate = new Date(p.updatedAt);
      const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays > 7;
    }).length;

    return {
      delayed: delayedProjects,
      overBudget: overBudgetProjects,
      noUpdate: noUpdateProjects,
    };
  }, [filteredProjects, metrics]);

  // Lifecycle stats
  const lifecycleStats = getSummaryStats();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Dashboard Monitoring
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.role === "pic" 
              ? "Monitoring proyek yang Anda tangani"
              : "Overview seluruh proyek dan anggaran"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Update terakhir: {new Date().toLocaleTimeString("id-ID")}
          </p>
        </div>
      </div>

      {/* Filters */}
      <DashboardFiltersComponent
        filters={filters}
        onFilterChange={setFilters}
      />

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards Skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
            </div>

            {/* Table Skeleton */}
            <TableSkeleton />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Lifecycle Overview - Only for Manajer and Admin */}
            {(user?.role === "manajer" || user?.role === "admin") && (
              <LifecycleOverview stats={lifecycleStats} />
            )}

            {/* Summary Cards */}
            <SummaryCards
              total={summary.total}
              running={summary.running}
              completed={summary.completed}
              problematic={summary.problematic}
            />

            {/* Risk Indicators */}
            <RiskIndicators
              delayed={riskIndicators.delayed}
              overBudget={riskIndicators.overBudget}
              noUpdate={riskIndicators.noUpdate}
            />

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <StatusPieChart data={statusData} />
              <BudgetChart data={budgetData} />
            </div>

            {/* Progress Chart - Full Width */}
            <ProgressChart data={progressData} />

            {/* Problematic Projects Table */}
            <ProblematicProjectsTable projects={problematicProjects} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
