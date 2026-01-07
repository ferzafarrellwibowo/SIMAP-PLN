"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useProjectStore, STATUS_LABELS, STATUS_COLORS, HEALTH_LABELS, HEALTH_COLORS } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

type TabType = "overview" | "planning" | "progress" | "budget" | "metrics";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const { user, hasPermission, canAccessProject } = useAuth();
  const { 
    getProject, 
    getMilestones, 
    getBudgetItems, 
    getProjectMetrics,
    updateProjectStatus 
  } = useProjectStore();

  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const project = getProject(projectId);
  const milestones = getMilestones(projectId);
  const budgetItems = getBudgetItems(projectId);
  const metrics = getProjectMetrics(projectId);

  // Check access
  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Proyek tidak ditemukan
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Proyek yang Anda cari tidak ada atau sudah dihapus
        </p>
        <Link
          href="/projects"
          className="text-blue-600 hover:underline"
        >
          Kembali ke Daftar Proyek
        </Link>
      </div>
    );
  }

  if (!canAccessProject(project.picId)) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Akses Ditolak
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Anda tidak memiliki akses ke proyek ini
        </p>
        <Link
          href="/projects"
          className="text-blue-600 hover:underline"
        >
          Kembali ke Daftar Proyek
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as TabType, label: "Overview", show: true },
    { id: "planning" as TabType, label: "Perencanaan", show: ["planned", "on_progress", "completed", "on_hold"].includes(project.status) },
    { id: "progress" as TabType, label: "Progress", show: ["on_progress", "completed", "on_hold"].includes(project.status) },
    { id: "budget" as TabType, label: "Anggaran", show: ["planned", "on_progress", "completed", "on_hold"].includes(project.status) },
    { id: "metrics" as TabType, label: "Metrics", show: ["on_progress", "completed", "on_hold"].includes(project.status) },
  ];

  // Calculate budget summary
  const budgetSummary = useMemo(() => {
    const totalPlanned = budgetItems.reduce((sum, b) => sum + b.totalPlanned, 0);
    const totalActual = budgetItems.reduce((sum, b) => sum + b.totalActual, 0);
    return {
      planned: totalPlanned,
      actual: totalActual,
      remaining: totalPlanned - totalActual,
      percentage: totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0,
    };
  }, [budgetItems]);

  // Calculate progress summary
  const progressSummary = useMemo(() => {
    if (milestones.length === 0) return { planned: 0, actual: 0 };
    
    const totalWeight = milestones.reduce((sum, m) => sum + m.weight, 0);
    const actualProgress = milestones.reduce(
      (sum, m) => sum + (m.progressActual * m.weight) / 100,
      0
    );
    const plannedProgress = milestones.reduce(
      (sum, m) => sum + (m.progressPlanned * m.weight) / 100,
      0
    );
    
    return {
      planned: (plannedProgress / totalWeight) * 100,
      actual: (actualProgress / totalWeight) * 100,
    };
  }, [milestones]);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/projects" className="hover:text-blue-600">
          Proyek
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-100">{project.code}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {project.name}
            </h2>
            <Badge className={HEALTH_COLORS[project.healthStatus]}>
              {HEALTH_LABELS[project.healthStatus]}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              {project.code}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {project.location}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              PIC: {project.picName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={`${STATUS_COLORS[project.status]} text-sm px-3 py-1`}>
            {STATUS_LABELS[project.status]}
          </Badge>

          {/* Action Buttons based on status and role */}
          {hasPermission("approve_project") && project.status === "draft" && (
            <button
              onClick={() => updateProjectStatus(projectId, "initiated", "Approved by manager")}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Approve
            </button>
          )}

          {hasPermission("input_plan") && project.status === "initiated" && (
            <Link
              href={`/projects/${projectId}/planning`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Input Rencana
            </Link>
          )}

          {hasPermission("input_progress") && project.status === "on_progress" && project.picId === user?.id && (
            <Link
              href={`/projects/${projectId}/input-progress`}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Input Progress
            </Link>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs
            .filter((tab) => tab.show)
            .map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Project Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Deskripsi Proyek
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {project.description}
                </p>
              </Card>

              {/* Timeline */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Timeline
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Target Mulai</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(project.targetStartDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Target Selesai</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(project.targetEndDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  {project.actualStartDate && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Aktual Mulai</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(project.actualStartDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  {project.actualEndDate && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Aktual Selesai</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(project.actualEndDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Project Status Flow */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Status Lifecycle
                </h3>
                <div className="flex items-center justify-between">
                  {["draft", "initiated", "planned", "on_progress", "completed"].map((status, index) => {
                    const isActive = project.status === status;
                    const isPast = ["draft", "initiated", "planned", "on_progress", "completed"]
                      .indexOf(project.status) > index;
                    
                    return (
                      <div key={status} className="flex items-center">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isActive
                                ? "bg-blue-500 text-white"
                                : isPast
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                            }`}
                          >
                            {isPast ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              index + 1
                            )}
                          </div>
                          <p className={`mt-2 text-xs font-medium ${
                            isActive ? "text-blue-600" : "text-gray-500"
                          }`}>
                            {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
                          </p>
                        </div>
                        {index < 4 && (
                          <div
                            className={`w-12 h-0.5 mx-2 ${
                              isPast ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Right Column - Summary */}
            <div className="space-y-6">
              {/* Progress Summary */}
              {metrics && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Progress
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Rencana</span>
                        <span className="font-medium">{progressSummary.planned.toFixed(1)}%</span>
                      </div>
                      <ProgressBar value={progressSummary.planned} className="bg-blue-100" barClassName="bg-blue-500" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Aktual</span>
                        <span className="font-medium">{progressSummary.actual.toFixed(1)}%</span>
                      </div>
                      <ProgressBar 
                        value={progressSummary.actual} 
                        className="bg-green-100" 
                        barClassName="bg-green-500" 
                      />
                    </div>
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Deviasi</span>
                        <span className={`font-medium ${
                          metrics.scheduleVariance >= 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {metrics.scheduleVariance >= 0 ? "+" : ""}{metrics.scheduleVariance.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Budget Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Anggaran
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Total Rencana</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(project.estimatedBudget)}
                    </span>
                  </div>
                  {budgetItems.length > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Realisasi</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(budgetSummary.actual)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Sisa</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(budgetSummary.remaining)}
                        </span>
                      </div>
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Penyerapan</span>
                          <span className="font-medium">{budgetSummary.percentage.toFixed(1)}%</span>
                        </div>
                        <ProgressBar 
                          value={budgetSummary.percentage} 
                          className="bg-gray-100" 
                          barClassName={budgetSummary.percentage > 90 ? "bg-red-500" : "bg-blue-500"} 
                        />
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Project Info */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Informasi
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kategori</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{project.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Unit</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{project.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dibuat</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(project.createdAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Terakhir Update</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {new Date(project.updatedAt).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "planning" && (
          <div className="space-y-6">
            {/* Milestones */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Milestone / Fase Proyek
                </h3>
                {hasPermission("input_plan") && project.status === "initiated" && (
                  <button className="text-sm text-blue-600 hover:underline">
                    + Tambah Milestone
                  </button>
                )}
              </div>
              
              {milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div
                      key={milestone.id}
                      className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                            <h4 className="font-medium text-gray-900 dark:text-gray-100">
                              {milestone.name}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                        </div>
                        <Badge
                          className={
                            milestone.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : milestone.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : milestone.status === "delayed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {milestone.status === "completed"
                            ? "Selesai"
                            : milestone.status === "in_progress"
                            ? "Berjalan"
                            : milestone.status === "delayed"
                            ? "Terlambat"
                            : "Belum Mulai"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Bobot</span>
                          <p className="font-medium">{milestone.weight}%</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Rencana Mulai</span>
                          <p className="font-medium">{milestone.plannedStartDate}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Rencana Selesai</span>
                          <p className="font-medium">{milestone.plannedEndDate}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Progress</span>
                          <p className="font-medium">{milestone.progressActual}%</p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <ProgressBar 
                          value={milestone.progressActual} 
                          className="h-2" 
                          barClassName={
                            milestone.progressActual >= milestone.progressPlanned
                              ? "bg-green-500"
                              : "bg-amber-500"
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Belum ada milestone yang dibuat</p>
                  {hasPermission("input_plan") && project.status === "initiated" && (
                    <button className="mt-2 text-blue-600 hover:underline">
                      Mulai buat rencana
                    </button>
                  )}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "progress" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Progress Realisasi
                </h3>
                {hasPermission("input_progress") && project.picId === user?.id && (
                  <Link
                    href={`/projects/${projectId}/input-progress`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Input Progress Baru
                  </Link>
                )}
              </div>

              {milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {milestone.name}
                        </h4>
                        <span className="text-sm font-medium">
                          {milestone.progressActual}% / {milestone.progressPlanned}%
                        </span>
                      </div>
                      <div className="relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-blue-200"
                          style={{ width: `${milestone.progressPlanned}%` }}
                        />
                        <div
                          className={`absolute inset-y-0 left-0 ${
                            milestone.progressActual >= milestone.progressPlanned
                              ? "bg-green-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${milestone.progressActual}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>Rencana: {milestone.progressPlanned}%</span>
                        <span className={
                          milestone.progressActual >= milestone.progressPlanned
                            ? "text-green-600"
                            : "text-amber-600"
                        }>
                          Deviasi: {(milestone.progressActual - milestone.progressPlanned).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Belum ada data progress</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "budget" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Rincian Anggaran
                </h3>
              </div>

              {budgetItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Kategori</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Item</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Rencana</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Realisasi</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Sisa</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetItems.map((item) => {
                        const percentage = item.totalPlanned > 0 
                          ? (item.totalActual / item.totalPlanned) * 100 
                          : 0;
                        const remaining = item.totalPlanned - item.totalActual;
                        
                        return (
                          <tr 
                            key={item.id} 
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="py-3 px-4">
                              <Badge className="capitalize">{item.category}</Badge>
                            </td>
                            <td className="py-3 px-4 text-gray-900 dark:text-gray-100">
                              {item.name}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                              {formatCurrency(item.totalPlanned)}
                            </td>
                            <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                              {formatCurrency(item.totalActual)}
                            </td>
                            <td className={`py-3 px-4 text-right ${
                              remaining < 0 ? "text-red-600" : "text-gray-900 dark:text-gray-100"
                            }`}>
                              {formatCurrency(remaining)}
                            </td>
                            <td className={`py-3 px-4 text-right font-medium ${
                              percentage > 100 ? "text-red-600" : percentage > 80 ? "text-amber-600" : "text-green-600"
                            }`}>
                              {percentage.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 dark:bg-gray-800 font-medium">
                        <td colSpan={2} className="py-3 px-4 text-gray-900 dark:text-gray-100">
                          Total
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                          {formatCurrency(budgetSummary.planned)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-900 dark:text-gray-100">
                          {formatCurrency(budgetSummary.actual)}
                        </td>
                        <td className={`py-3 px-4 text-right ${
                          budgetSummary.remaining < 0 ? "text-red-600" : "text-gray-900 dark:text-gray-100"
                        }`}>
                          {formatCurrency(budgetSummary.remaining)}
                        </td>
                        <td className={`py-3 px-4 text-right ${
                          budgetSummary.percentage > 100 ? "text-red-600" : "text-gray-900 dark:text-gray-100"
                        }`}>
                          {budgetSummary.percentage.toFixed(1)}%
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Belum ada data anggaran</p>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "metrics" && metrics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schedule Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Kinerja Jadwal
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Schedule Performance Index (SPI)</span>
                  <span className={`text-2xl font-bold ${
                    metrics.spiValue >= 1 ? "text-green-600" : 
                    metrics.spiValue >= 0.9 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {metrics.spiValue.toFixed(2)}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {metrics.spiValue >= 1 
                      ? "✅ Proyek berjalan sesuai atau lebih cepat dari jadwal"
                      : metrics.spiValue >= 0.9
                      ? "⚠️ Proyek sedikit terlambat dari jadwal"
                      : "🔴 Proyek sangat terlambat dari jadwal"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Planned Value (PV)</span>
                    <p className="font-medium">{formatCurrency(metrics.plannedValue)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Earned Value (EV)</span>
                    <p className="font-medium">{formatCurrency(metrics.earnedValue)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Cost Performance */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Kinerja Biaya
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Cost Performance Index (CPI)</span>
                  <span className={`text-2xl font-bold ${
                    metrics.cpiValue >= 1 ? "text-green-600" : 
                    metrics.cpiValue >= 0.9 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {metrics.cpiValue.toFixed(2)}
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {metrics.cpiValue >= 1 
                      ? "✅ Biaya efisien, sesuai atau di bawah anggaran"
                      : metrics.cpiValue >= 0.9
                      ? "⚠️ Biaya sedikit melebihi rencana"
                      : "🔴 Biaya jauh melebihi rencana"}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Actual Cost (AC)</span>
                    <p className="font-medium">{formatCurrency(metrics.actualCost)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Earned Value (EV)</span>
                    <p className="font-medium">{formatCurrency(metrics.earnedValue)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Health Summary */}
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Ringkasan Kesehatan Proyek
              </h3>
              <div className={`p-6 rounded-lg ${
                metrics.healthStatus === "green" 
                  ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                  : metrics.healthStatus === "yellow"
                  ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
                  : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    metrics.healthStatus === "green" ? "bg-green-500" :
                    metrics.healthStatus === "yellow" ? "bg-amber-500" : "bg-red-500"
                  }`}>
                    {metrics.healthStatus === "green" ? (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : metrics.healthStatus === "yellow" ? (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xl font-bold ${
                      metrics.healthStatus === "green" ? "text-green-800 dark:text-green-200" :
                      metrics.healthStatus === "yellow" ? "text-amber-800 dark:text-amber-200" : 
                      "text-red-800 dark:text-red-200"
                    }`}>
                      {HEALTH_LABELS[metrics.healthStatus]}
                    </h4>
                    <p className={`${
                      metrics.healthStatus === "green" ? "text-green-700 dark:text-green-300" :
                      metrics.healthStatus === "yellow" ? "text-amber-700 dark:text-amber-300" : 
                      "text-red-700 dark:text-red-300"
                    }`}>
                      {metrics.healthReason}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </motion.div>
    </div>
  );
}
