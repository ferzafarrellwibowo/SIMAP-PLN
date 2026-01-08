"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useProjectStore, STATUS_LABELS, STATUS_COLORS, HEALTH_LABELS, HEALTH_COLORS, filterOptions } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import { exportToPDF, exportToExcel, exportAllToPDF, exportAllToExcel } from "@/lib/export";
import { Project, ProjectMetrics, HealthStatus, ProjectLifecycleStatus } from "@/lib/types";

type ReportType = "summary" | "progress" | "budget" | "problems";

export default function ReportsPage() {
  const { user, hasPermission } = useAuth();
  const { projects, getProjectMetrics, getSummaryStats } = useProjectStore();
  const stats = getSummaryStats();

  const [reportType, setReportType] = useState<ReportType>("summary");
  const [unitFilter, setUnitFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportAllReports, setExportAllReports] = useState(false);

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

  const reportTypes: { id: ReportType; label: string }[] = [
    { id: "summary", label: "Ringkasan Eksekutif" },
    { id: "progress", label: "Progress Proyek" },
    { id: "budget", label: "Realisasi Anggaran" },
    { id: "problems", label: "Proyek Bermasalah" },
  ];

  // Prepare export data
  const exportProjectData = useMemo(() => {
    return filteredProjects.map((project) => ({
      project,
      metrics: getProjectMetrics(project.id),
    }));
  }, [filteredProjects, getProjectMetrics]);

  const handleExport = async (format: "pdf" | "excel") => {
    setIsExporting(true);
    
    try {
      const filters = { unit: unitFilter, status: statusFilter };
      
      if (exportAllReports) {
        // Export all 4 reports at once
        if (format === "pdf") {
          exportAllToPDF(exportProjectData, filteredStats, filters);
        } else {
          exportAllToExcel(exportProjectData, filteredStats, filters);
        }
      } else {
        // Export single report
        if (format === "pdf") {
          exportToPDF(reportType, exportProjectData, filteredStats, filters);
        } else {
          exportToExcel(reportType, exportProjectData, filteredStats, filters);
        }
      }
      
      setShowExportModal(false);
      setExportAllReports(false);
    } catch (error) {
      console.error("Export error:", error);
      alert("Terjadi kesalahan saat export. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
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
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Laporan
        </button>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => { if (!isExporting) { setShowExportModal(false); setExportAllReports(false); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Export Laporan
                </h3>
                <button
                  onClick={() => { if (!isExporting) { setShowExportModal(false); setExportAllReports(false); } }}
                  disabled={isExporting}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {exportAllReports 
                    ? "Export semua laporan dalam satu file (4 laporan)"
                    : <>Pilih format file untuk export laporan <span className="font-medium text-gray-900 dark:text-gray-100">{reportTypes.find(r => r.id === reportType)?.label}</span></>
                  }
                </p>

                {/* Toggle: Export Current vs Export All */}
                <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <button
                    onClick={() => setExportAllReports(false)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      !exportAllReports 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Laporan Aktif
                    </div>
                  </button>
                  <button
                    onClick={() => setExportAllReports(true)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      exportAllReports 
                        ? "bg-blue-600 text-white shadow-md" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Semua Laporan
                    </div>
                  </button>
                </div>

                {/* Show what will be exported */}
                {exportAllReports && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-2">Laporan yang akan diekspor:</p>
                    <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                      <li className="flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Ringkasan Eksekutif
                      </li>
                      <li className="flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Progress Proyek
                      </li>
                      <li className="flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Realisasi Anggaran
                      </li>
                      <li className="flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Proyek Bermasalah
                      </li>
                    </ul>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {/* PDF Option */}
                  <button
                    onClick={() => handleExport("pdf")}
                    disabled={isExporting}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
                        <rect x="4" y="2" width="24" height="28" rx="2" fill="#DC2626"/>
                        <path d="M20 2L28 10H22C20.8954 10 20 9.10457 20 8V2Z" fill="#FCA5A5"/>
                        <rect x="7" y="14" width="18" height="12" rx="1" fill="white"/>
                        <text x="16" y="23" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#DC2626">PDF</text>
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">PDF</span>
                    <span className="text-xs text-gray-500">Format dokumen</span>
                  </button>

                  {/* Excel Option */}
                  <button
                    onClick={() => handleExport("excel")}
                    disabled={isExporting}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-9 h-9" viewBox="0 0 32 32" fill="none">
                        <rect x="4" y="2" width="24" height="28" rx="2" fill="#16A34A"/>
                        <path d="M20 2L28 10H22C20.8954 10 20 9.10457 20 8V2Z" fill="#86EFAC"/>
                        <rect x="7" y="14" width="18" height="12" rx="1" fill="white"/>
                        <text x="16" y="23" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#16A34A">XLSX</text>
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">Excel</span>
                    <span className="text-xs text-gray-500">Format spreadsheet</span>
                  </button>
                </div>
              </div>

              {isExporting && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sedang membuat laporan...</span>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                  Data: {filteredProjects.length} proyek | Filter: {unitFilter === "all" ? "Semua Unit" : unitFilter}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-2">
        {reportTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setReportType(type.id)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              reportType === type.id
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {type.label}
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
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
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
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
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
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
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
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
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
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
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
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
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
