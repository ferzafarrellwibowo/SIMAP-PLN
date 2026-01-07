"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useProjectStore, STATUS_LABELS, STATUS_COLORS, HEALTH_LABELS, HEALTH_COLORS, filterOptions } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/utils";
import type { ProjectLifecycleStatus, HealthStatus } from "@/lib/types";

export default function ProjectsPage() {
  const { user, hasPermission } = useAuth();
  const { projects, metrics } = useProjectStore();
  
  const [statusFilter, setStatusFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [unitFilter, setUnitFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter projects
  const filteredProjects = useMemo(() => {
    let result = projects;

    // PIC can only see their own projects
    if (user?.role === "pic") {
      result = result.filter((p) => p.picId === user.id);
    }

    // Apply filters
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (healthFilter !== "all") {
      result = result.filter((p) => p.healthStatus === healthFilter);
    }
    if (unitFilter !== "all") {
      result = result.filter((p) => p.unit === unitFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.code.toLowerCase().includes(query) ||
          p.picName.toLowerCase().includes(query)
      );
    }

    return result;
  }, [projects, user, statusFilter, healthFilter, unitFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Daftar Proyek
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {user?.role === "pic"
              ? "Proyek yang Anda tangani"
              : "Semua proyek dalam sistem"}
          </p>
        </div>
        {hasPermission("create_project") && (
          <Link
            href="/projects/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Buat Proyek Baru
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Cari nama proyek, kode, atau PIC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={filterOptions.statuses}
            className="w-full md:w-48"
          />

          {/* Health Filter */}
          <Select
            value={healthFilter}
            onChange={(value) => setHealthFilter(value)}
            options={filterOptions.healthStatuses}
            className="w-full md:w-48"
          />

          {/* Unit Filter */}
          <Select
            value={unitFilter}
            onChange={(value) => setUnitFilter(value)}
            options={filterOptions.units}
            className="w-full md:w-48"
          />
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Menampilkan {filteredProjects.length} dari {projects.length} proyek
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project, index) => {
          const projectMetrics = metrics[project.id];
          
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/projects/${project.id}`} className="interactive">
                <Card className="p-5 h-full card-hover cursor-pointer">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        {project.code}
                      </p>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {project.name}
                      </h3>
                    </div>
                    <Badge className={HEALTH_COLORS[project.healthStatus]}>
                      {HEALTH_LABELS[project.healthStatus]}
                    </Badge>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <Badge className={STATUS_COLORS[project.status]}>
                      {STATUS_LABELS[project.status]}
                    </Badge>
                  </div>

                  {/* Info */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{project.picName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{formatCurrency(project.estimatedBudget)}</span>
                    </div>
                  </div>

                  {/* Progress Bar (if metrics available) */}
                  {projectMetrics && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Progress</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {projectMetrics.actualProgress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${projectMetrics.actualProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{project.unit}</span>
                    <span>Update: {new Date(project.updatedAt).toLocaleDateString("id-ID")}</span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <Card className="p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            Tidak ada proyek ditemukan
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery
              ? "Coba ubah kata kunci pencarian atau filter"
              : "Belum ada proyek yang sesuai dengan kriteria"}
          </p>
          {hasPermission("create_project") && (
            <Link
              href="/projects/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Buat Proyek Baru
            </Link>
          )}
        </Card>
      )}
    </div>
  );
}
