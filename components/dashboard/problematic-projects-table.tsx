"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { formatCurrency } from "@/lib/utils";
import type { Project } from "@/lib/data";
import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown } from "lucide-react";

interface ProblematicProjectsTableProps {
  projects: Project[];
}

export function ProblematicProjectsTable({ projects }: ProblematicProjectsTableProps) {
  if (projects.length === 0) {
    return (
      <Card hover={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Proyek Bermasalah
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p>Tidak ada proyek bermasalah saat ini</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card hover={false}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Proyek Bermasalah
          <Badge variant="danger" className="ml-2">
            {projects.length} Proyek
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Proyek
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Progress
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Serapan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Deviasi
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {projects.map((project, index) => {
                const budgetPercentage = (project.budgetUsed / project.budgetTotal) * 100;
                const deviation = project.progressPlanned - project.progressActual;

                return (
                  <motion.tr
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group hover:bg-gray-50/40 dark:hover:bg-gray-800/20 transition-colors duration-150"
                  >
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {project.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {project.unit}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">
                            {project.progressActual.toFixed(1)}%
                          </span>
                          <span className="text-gray-400">
                            / {project.progressPlanned.toFixed(1)}%
                          </span>
                        </div>
                        <ProgressBar
                          value={project.progressActual}
                          max={100}
                          color={
                            project.status === "green"
                              ? "green"
                              : project.status === "yellow"
                              ? "yellow"
                              : "red"
                          }
                          size="sm"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">
                            {budgetPercentage.toFixed(0)}%
                          </span>
                        </div>
                        <ProgressBar
                          value={budgetPercentage}
                          max={100}
                          color={budgetPercentage > 85 ? "red" : budgetPercentage > 70 ? "yellow" : "blue"}
                          size="sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          {formatCurrency(project.budgetUsed)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 font-medium">
                          -{deviation.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={project.status} />
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
