"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useProjectStore, STATUS_LABELS, STATUS_COLORS, HEALTH_LABELS, HEALTH_COLORS, filterOptions } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { Project, ProjectMetrics, HealthStatus, ProjectLifecycleStatus } from "@/lib/types";

type ReportType = "summary" | "progress" | "budget" | "problems";

export default function ReportsPage() {
  const { user, hasPermission } = useAuth();
  const { projects, getProjectMetrics, getSummaryStats } = useProjectStore();
  const stats = getSummaryStats();

  const [reportType, setReportType] = useState<ReportType>("summary");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Get filtered projects
  const filteredProjects = useMemo(() => {
    let result = [...projects];
    
    if (unitFilter !== "all") {
      result = result.filter((p) => p.unit === unitFilter);
    }
    
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    // For PIC, only show their projects
    if (user?.role === "pic") {
      result = result.filter((p) => p.picId === user.id);
    }

    return result;
  }, [projects, unitFilter, statusFilter, user]);

  // Calculate summary stats for filtered projects
  const filteredStats = useMemo(() => {
    const total = filteredProjects.length;
    const onProgress = filteredProjects.filter((p) => p.status === "on_progress").length;
    const completed = filteredProjects.filter((p) => p.status === "completed").length;
    const problematic = filteredProjects.filter((p) => p.healthStatus === "red").length;
    
    let totalBudget = 0;
    let totalSpent = 0;
    let avgSPI = 0;
    let avgCPI = 0;
    let validMetricsCount = 0;

    filteredProjects.forEach((p) => {
      const metrics = getProjectMetrics(p.id);
      totalBudget += p.estimatedBudget;
      if (metrics) {
        totalSpent += metrics.actualCost;
        if (metrics.spiValue > 0 && metrics.cpiValue > 0) {
          avgSPI += metrics.spiValue;
          avgCPI += metrics.cpiValue;
          validMetricsCount++;
        }
      }
    });

    if (validMetricsCount > 0) {
      avgSPI /= validMetricsCount;
      avgCPI /= validMetricsCount;
    }

    return {
      total,
      onProgress,
      completed,
      problematic,
      totalBudget,
      totalSpent,
      avgSPI,
      avgCPI,
      budgetUtilization: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    };
  }, [filteredProjects, getProjectMetrics]);

  const reportTypes: { id: ReportType; label: string; icon: string }[] = [
    { id: "summary", label: "Ringkasan Eksekutif", icon: "📊" },
    { id: "progress", label: "Progress Proyek", icon: "📈" },
    { id: "budget", label: "Realisasi Anggaran", icon: "💰" },
    { id: "problems", label: "Proyek Bermasalah", icon: "⚠️" },
  ];

  const exportReport = () => {
    // Simulate export
    alert("Fitur export akan mengunduh laporan dalam format PDF/Excel");
  };

  // Get unit options as string array
  const unitOptions = filterOptions.units
    .filter((u) => u.value !== "all")
    .map((u) => u.value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Laporan & Analisis
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitoring dan evaluasi proyek secara komprehensif
          </p>
        </div>
        <button
          onClick={exportReport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Laporan
        </button>
      </div>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              reportType === type.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                : "border-gray-200 dark:border-gray-700"
            } interactive`}
          >
            <span>{type.icon}</span>
            <span className="font-medium">{type.label}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Unit:
            </label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="all">Semua Unit</option>
              {unitOptions.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status:
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              <option value="all">Semua Status</option>
              {Object.entries(STATUS_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-gray-500 ml-auto">
            Menampilkan {filteredProjects.length} dari {projects.length} proyek
          </div>
        </div>
      </Card>

      {/* Report Content */}
      <motion.div
        key={reportType}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {reportType === "summary" && (
          <SummaryReport stats={filteredStats} />
        )}
        {reportType === "progress" && (
          <ProgressReport projects={filteredProjects} getMetrics={getProjectMetrics} />
        )}
        {reportType === "budget" && (
          <BudgetReport projects={filteredProjects} getMetrics={getProjectMetrics} />
        )}
        {reportType === "problems" && (
          <ProblemsReport projects={filteredProjects} getMetrics={getProjectMetrics} />
        )}
      </motion.div>
    </div>
  );
}

// Summary Report Component
function SummaryReport({ stats }: { stats: ReturnType<typeof useMemo<any>> }) {
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Proyek</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-2xl">📁</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Sedang Berjalan</p>
              <p className="text-3xl font-bold text-blue-600">{stats.onProgress}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <span className="text-2xl">🔄</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Selesai</p>
              <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Bermasalah</p>
              <p className="text-3xl font-bold text-red-600">{stats.problematic}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Performa Jadwal (SPI)
          </h3>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${
              stats.avgSPI >= 1 ? "text-green-600" : stats.avgSPI >= 0.9 ? "text-amber-600" : "text-red-600"
            }`}>
              {stats.avgSPI.toFixed(2)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2">
                {stats.avgSPI >= 1 
                  ? "Rata-rata proyek lebih cepat dari jadwal"
                  : stats.avgSPI >= 0.9 
                  ? "Rata-rata proyek sedikit terlambat"
                  : "Rata-rata proyek mengalami keterlambatan signifikan"}
              </p>
              <ProgressBar 
                value={Math.min(stats.avgSPI * 100, 150)} 
                max={150}
                color={stats.avgSPI >= 1 ? "green" : stats.avgSPI >= 0.9 ? "yellow" : "red"}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Performa Biaya (CPI)
          </h3>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${
              stats.avgCPI >= 1 ? "text-green-600" : stats.avgCPI >= 0.9 ? "text-amber-600" : "text-red-600"
            }`}>
              {stats.avgCPI.toFixed(2)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2">
                {stats.avgCPI >= 1 
                  ? "Rata-rata proyek dibawah anggaran"
                  : stats.avgCPI >= 0.9 
                  ? "Rata-rata proyek sedikit melebihi anggaran"
                  : "Rata-rata proyek mengalami pembengkakan biaya"}
              </p>
              <ProgressBar 
                value={Math.min(stats.avgCPI * 100, 150)} 
                max={150}
                color={stats.avgCPI >= 1 ? "green" : stats.avgCPI >= 0.9 ? "yellow" : "red"}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Overview */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Ringkasan Anggaran
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Anggaran</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {formatCurrency(stats.totalBudget)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Realisasi</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.totalSpent)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Utilisasi Anggaran</p>
            <p className={`text-2xl font-bold ${
              stats.budgetUtilization > 100 ? "text-red-600" : "text-green-600"
            }`}>
              {stats.budgetUtilization.toFixed(1)}%
            </p>
          </div>
        </div>
        <div className="mt-4">
          <ProgressBar 
            value={stats.budgetUtilization} 
            color={stats.budgetUtilization > 100 ? "red" : stats.budgetUtilization > 80 ? "yellow" : "blue"}
            showLabel
          />
        </div>
      </Card>
    </div>
  );
}

// Progress Report Component
function ProgressReport({ projects, getMetrics }: { projects: Project[]; getMetrics: (id: string) => ProjectMetrics | undefined }) {
  const sortedProjects = [...projects]
    .filter((p) => ["on_progress", "planned"].includes(p.status))
    .sort((a, b) => {
      const metricsA = getMetrics(a.id);
      const metricsB = getMetrics(b.id);
      return (metricsA?.actualProgress || 0) - (metricsB?.actualProgress || 0);
    });

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Progress Proyek Aktif
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Proyek</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Unit</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">PIC</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Rencana</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Realisasi</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Deviasi</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">SPI</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((project) => {
              const metrics = getMetrics(project.id);
              const deviation = (metrics?.actualProgress || 0) - (metrics?.plannedProgress || 0);
              
              return (
                <tr key={project.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.code}</p>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{project.unit}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{project.picName}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm font-medium">{(metrics?.plannedProgress || 0).toFixed(1)}%</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-sm font-medium">{(metrics?.actualProgress || 0).toFixed(1)}%</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm font-medium ${
                      deviation >= 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {deviation >= 0 ? "+" : ""}{deviation.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm font-medium ${
                      (metrics?.spiValue || 0) >= 1 ? "text-green-600" : 
                      (metrics?.spiValue || 0) >= 0.9 ? "text-amber-600" : "text-red-600"
                    }`}>
                      {(metrics?.spiValue || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge className={HEALTH_COLORS[project.healthStatus]}>
                      {HEALTH_LABELS[project.healthStatus]}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sortedProjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada proyek aktif
          </div>
        )}
      </div>
    </Card>
  );
}

// Budget Report Component
function BudgetReport({ projects, getMetrics }: { projects: Project[]; getMetrics: (id: string) => ProjectMetrics | undefined }) {
  const sortedProjects = [...projects]
    .filter((p) => ["on_progress", "completed"].includes(p.status))
    .sort((a, b) => {
      const metricsA = getMetrics(a.id);
      const metricsB = getMetrics(b.id);
      return (metricsA?.cpiValue || 1) - (metricsB?.cpiValue || 1);
    });

  return (
    <Card className="p-6">
      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Realisasi Anggaran Proyek
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Proyek</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Anggaran</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Realisasi</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Selisih</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">%</th>
              <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">CPI</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((project) => {
              const metrics = getMetrics(project.id);
              const spent = metrics?.actualCost || 0;
              const diff = project.estimatedBudget - spent;
              const pct = project.estimatedBudget > 0 ? (spent / project.estimatedBudget) * 100 : 0;
              
              return (
                <tr key={project.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{project.name}</p>
                    <p className="text-xs text-gray-500">{project.code}</p>
                  </td>
                  <td className="py-3 px-4 text-right text-sm">
                    {formatCurrency(project.estimatedBudget)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm font-medium">
                    {formatCurrency(spent)}
                  </td>
                  <td className={`py-3 px-4 text-right text-sm font-medium ${
                    diff >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {diff >= 0 ? "+" : ""}{formatCurrency(diff)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm font-medium ${
                      pct <= 100 ? "text-green-600" : "text-red-600"
                    }`}>
                      {pct.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`text-sm font-medium ${
                      (metrics?.cpiValue || 0) >= 1 ? "text-green-600" : 
                      (metrics?.cpiValue || 0) >= 0.9 ? "text-amber-600" : "text-red-600"
                    }`}>
                      {(metrics?.cpiValue || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-24">
                      <ProgressBar 
                        value={pct} 
                        color={pct <= 80 ? "blue" : pct <= 100 ? "yellow" : "red"}
                        size="sm"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sortedProjects.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Tidak ada data anggaran
          </div>
        )}
      </div>
    </Card>
  );
}

// Problems Report Component
function ProblemsReport({ projects, getMetrics }: { projects: Project[]; getMetrics: (id: string) => ProjectMetrics | undefined }) {
  const problematicProjects = projects.filter(
    (p) => p.healthStatus === "red" || p.healthStatus === "yellow"
  );

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <p className="text-lg font-semibold text-red-700 dark:text-red-300">
              {problematicProjects.length} Proyek Memerlukan Perhatian
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              Proyek dengan status kritis atau berisiko tinggi
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {problematicProjects.map((project) => {
          const metrics = getMetrics(project.id);
          
          return (
            <Card key={project.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={HEALTH_COLORS[project.healthStatus]}>
                      {HEALTH_LABELS[project.healthStatus]}
                    </Badge>
                    <Badge className={STATUS_COLORS[project.status]}>
                      {STATUS_LABELS[project.status]}
                    </Badge>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {project.name}
                  </h4>
                  <p className="text-sm text-gray-500">{project.code} • {project.unit}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-gray-500">PIC</p>
                  <p className="font-medium">{project.picName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500 mb-1">SPI (Schedule)</p>
                  <p className={`text-xl font-bold ${
                    (metrics?.spiValue || 0) >= 1 ? "text-green-600" : "text-red-600"
                  }`}>
                    {(metrics?.spiValue || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">CPI (Cost)</p>
                  <p className={`text-xl font-bold ${
                    (metrics?.cpiValue || 0) >= 1 ? "text-green-600" : "text-red-600"
                  }`}>
                    {(metrics?.cpiValue || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Progress</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {(metrics?.actualProgress || 0).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Deviasi</p>
                  <p className={`text-xl font-bold ${
                    (metrics?.actualProgress || 0) >= (metrics?.plannedProgress || 0) ? "text-green-600" : "text-red-600"
                  }`}>
                    {((metrics?.actualProgress || 0) - (metrics?.plannedProgress || 0)).toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Target: {project.targetEndDate}</span>
                </div>
                <a
                  href={`/projects/${project.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Lihat Detail →
                </a>
              </div>
            </Card>
          );
        })}

        {problematicProjects.length === 0 && (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
              <span className="text-3xl">✅</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Semua Proyek Berjalan Baik
            </h3>
            <p className="text-gray-500">
              Tidak ada proyek yang memerlukan perhatian khusus saat ini
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
