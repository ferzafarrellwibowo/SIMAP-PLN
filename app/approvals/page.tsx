"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjectStore, STATUS_LABELS, STATUS_COLORS } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";

export default function ApprovalsPage() {
  const { user } = useAuth();
  const { projects, updateProjectStatus } = useProjectStore();

  const [processingId, setProcessingId] = useState<string | null>(null);

  // Get projects pending approval
  const pendingProjects = useMemo(() => {
    return projects.filter((p) => p.status === "draft" || p.status === "initiated");
  }, [projects]);

  const draftProjects = pendingProjects.filter((p) => p.status === "draft");
  const initiatedProjects = pendingProjects.filter((p) => p.status === "initiated");

  const handleApprove = async (projectId: string, currentStatus: string) => {
    setProcessingId(projectId);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    if (currentStatus === "draft") {
      updateProjectStatus(projectId, "initiated", `Approved by ${user?.name}`);
    } else if (currentStatus === "initiated") {
      updateProjectStatus(projectId, "planned", `Planning approved by ${user?.name}`);
    }
    
    setProcessingId(null);
  };

  const handleReject = async (projectId: string) => {
    setProcessingId(projectId);
    await new Promise((resolve) => setTimeout(resolve, 500));
    // In a real app, you'd show a dialog for rejection reason
    updateProjectStatus(projectId, "cancelled", "Rejected by manager");
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Approval Proyek
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Daftar proyek yang memerlukan persetujuan Anda
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Draft - Perlu Inisiasi</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{draftProjects.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Initiated - Perlu Planning</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{initiatedProjects.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingProjects.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Draft Projects - Need Initiation Approval */}
      {draftProjects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Menunggu Persetujuan Inisiasi
          </h3>
          <div className="space-y-4">
            {draftProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={STATUS_COLORS[project.status]}>
                          {STATUS_LABELS[project.status]}
                        </Badge>
                        <span className="text-sm text-gray-500">{project.code}</span>
                      </div>
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600"
                      >
                        {project.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                        <span>📍 {project.location}</span>
                        <span>👤 PIC: {project.picName}</span>
                        <span>💰 {formatCurrency(project.estimatedBudget)}</span>
                        <span>📅 {project.targetStartDate} - {project.targetEndDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleReject(project.id)}
                        disabled={processingId === project.id}
                        className="px-4 py-2 border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors disabled:opacity-50"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => handleApprove(project.id, project.status)}
                        disabled={processingId === project.id}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {processingId === project.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Setujui Inisiasi
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Initiated Projects - Need Planning Approval */}
      {initiatedProjects.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Menunggu Persetujuan Rencana
          </h3>
          <div className="space-y-4">
            {initiatedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className={STATUS_COLORS[project.status]}>
                          {STATUS_LABELS[project.status]}
                        </Badge>
                        <span className="text-sm text-gray-500">{project.code}</span>
                      </div>
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600"
                      >
                        {project.name}
                      </Link>
                      <p className="text-sm text-gray-500 mt-1">
                        Proyek telah diinisiasi, menunggu input dan persetujuan rencana
                      </p>
                      <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                        <span>📍 {project.location}</span>
                        <span>👤 PIC: {project.picName}</span>
                        <span>💰 {formatCurrency(project.estimatedBudget)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/projects/${project.id}`}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
                      >
                        Lihat Detail
                      </Link>
                      <button
                        onClick={() => handleApprove(project.id, project.status)}
                        disabled={processingId === project.id}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {processingId === project.id ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Setujui Rencana
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pendingProjects.length === 0 && (
        <Card className="p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-green-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Tidak ada approval pending
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Semua proyek sudah diproses. Anda akan diberitahu jika ada yang memerlukan persetujuan.
          </p>
        </Card>
      )}
    </div>
  );
}
