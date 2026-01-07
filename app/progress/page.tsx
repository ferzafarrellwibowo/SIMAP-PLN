"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useProjectStore, STATUS_COLORS, HEALTH_COLORS, HEALTH_LABELS } from "@/lib/store";
import { useAuth } from "@/lib/auth";

export default function ProgressInputPage() {
  const { user } = useAuth();
  const { projects, getMilestones, getProjectMetrics, addProgressEntry, recalculateMetrics } = useProjectStore();

  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [issues, setIssues] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Get projects where user is PIC and status is on_progress or planned
  const myProjects = useMemo(() => {
    return projects.filter(
      (p) => p.picId === user?.id && ["planned", "on_progress"].includes(p.status)
    );
  }, [projects, user]);

  // Get milestones for selected project
  const milestones = selectedProject ? getMilestones(selectedProject) : [];
  const selectedMilestoneData = milestones.find((m) => m.id === selectedMilestone);
  const projectData = projects.find((p) => p.id === selectedProject);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProject || !selectedMilestone || progressValue < 0) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    addProgressEntry({
      projectId: selectedProject,
      milestoneId: selectedMilestone,
      progressPercentage: progressValue,
      date: new Date().toISOString().split("T")[0],
      notes,
      issues: issues || undefined,
      enteredBy: user?.id || "",
      enteredByName: user?.name || "",
    });

    // Recalculate metrics
    recalculateMetrics(selectedProject);

    setSuccessMessage(`Progress milestone "${selectedMilestoneData?.name}" berhasil diupdate ke ${progressValue}%`);
    
    // Reset form
    setSelectedMilestone(null);
    setProgressValue(0);
    setNotes("");
    setIssues("");
    setIsSubmitting(false);

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Input Progress Proyek
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update progress realisasi untuk proyek yang Anda tangani
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
        >
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        </motion.div>
      )}

      {myProjects.length === 0 ? (
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
            Tidak ada proyek aktif
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Anda tidak memiliki proyek yang sedang berjalan atau siap dieksekusi
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Project Selection */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Pilih Proyek
            </h3>
            <div className="space-y-3">
              {myProjects.map((project) => {
                const metrics = getProjectMetrics(project.id);
                const isSelected = selectedProject === project.id;
                
                return (
                  <button
                    key={project.id}
                    onClick={() => {
                      setSelectedProject(project.id);
                      setSelectedMilestone(null);
                    }}
                      className={`w-full p-4 rounded-lg border text-left ${
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-200 dark:border-gray-700"
                      } interactive`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                        {project.name}
                      </p>
                      <Badge className={HEALTH_COLORS[project.healthStatus]}>
                        {HEALTH_LABELS[project.healthStatus]}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{project.code}</p>
                    {metrics && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Progress</span>
                          <span className="font-medium">{metrics.actualProgress.toFixed(1)}%</span>
                        </div>
                        <ProgressBar
                          value={metrics.actualProgress}
                          className="h-1.5"
                          barClassName="bg-blue-500"
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right - Milestone & Form */}
          <div className="lg:col-span-2">
            {!selectedProject ? (
              <Card className="p-8 text-center">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                  />
                </svg>
                <p className="text-gray-500">
                  Pilih proyek di sebelah kiri untuk memulai input progress
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Project Info */}
                <Card className="p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {projectData?.name}
                      </p>
                      <p className="text-sm text-gray-500">{projectData?.code}</p>
                    </div>
                    <Link
                      href={`/projects/${selectedProject}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Lihat Detail →
                    </Link>
                  </div>
                </Card>

                {/* Milestone Selection */}
                <Card className="p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Pilih Milestone
                  </h3>
                  
                  {milestones.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Proyek ini belum memiliki milestone</p>
                      <p className="text-sm mt-1">Hubungi Admin untuk menambahkan rencana</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {milestones.map((milestone) => {
                        const isSelected = selectedMilestone === milestone.id;
                        
                        return (
                          <button
                            key={milestone.id}
                            onClick={() => {
                              setSelectedMilestone(milestone.id);
                              setProgressValue(milestone.progressActual);
                            }}
                            className={`w-full p-4 rounded-lg border text-left ${
                                isSelected
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                  : "border-gray-200 dark:border-gray-700"
                              } interactive`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs font-medium text-gray-500">
                                    #{milestone.order}
                                  </span>
                                  <p className="font-medium text-gray-900 dark:text-gray-100">
                                    {milestone.name}
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500 mb-2">{milestone.description}</p>
                                <div className="flex items-center gap-4 text-xs">
                                  <span className="text-gray-500">
                                    Bobot: <strong>{milestone.weight}%</strong>
                                  </span>
                                  <span className="text-gray-500">
                                    Target: <strong>{milestone.progressPlanned}%</strong>
                                  </span>
                                  <span className={
                                    milestone.progressActual >= milestone.progressPlanned
                                      ? "text-green-600"
                                      : "text-amber-600"
                                  }>
                                    Aktual: <strong>{milestone.progressActual}%</strong>
                                  </span>
                                </div>
                              </div>
                              <Badge
                                className={
                                  milestone.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : milestone.status === "in_progress"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {milestone.status === "completed"
                                  ? "Selesai"
                                  : milestone.status === "in_progress"
                                  ? "Berjalan"
                                  : "Belum Mulai"}
                              </Badge>
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
                          </button>
                        );
                      })}
                    </div>
                  )}
                </Card>

                {/* Progress Input Form */}
                {selectedMilestone && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Update Progress: {selectedMilestoneData?.name}
                      </h3>
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Progress Slider */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Progress Aktual (%)
                          </label>
                          <div className="flex items-center gap-4">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={progressValue}
                              onChange={(e) => setProgressValue(Number(e.target.value))}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={progressValue}
                              onChange={(e) => setProgressValue(Math.min(100, Math.max(0, Number(e.target.value))))}
                              className="w-20 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-center font-medium"
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Progress sebelumnya: {selectedMilestoneData?.progressActual}%</span>
                            <span className={
                              progressValue > (selectedMilestoneData?.progressActual || 0)
                                ? "text-green-600"
                                : progressValue < (selectedMilestoneData?.progressActual || 0)
                                ? "text-red-600"
                                : ""
                            }>
                              {progressValue > (selectedMilestoneData?.progressActual || 0)
                                ? `+${progressValue - (selectedMilestoneData?.progressActual || 0)}%`
                                : progressValue < (selectedMilestoneData?.progressActual || 0)
                                ? `${progressValue - (selectedMilestoneData?.progressActual || 0)}%`
                                : "Tidak ada perubahan"}
                            </span>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Catatan Progress <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            required
                            placeholder="Jelaskan pekerjaan yang sudah diselesaikan..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Issues */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Kendala (Opsional)
                          </label>
                          <textarea
                            value={issues}
                            onChange={(e) => setIssues(e.target.value)}
                            rows={2}
                            placeholder="Jelaskan kendala yang dihadapi jika ada..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        {/* Submit */}
                        <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMilestone(null);
                              setProgressValue(0);
                              setNotes("");
                              setIssues("");
                            }}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting || !notes.trim()}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Menyimpan...
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Simpan Progress
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
