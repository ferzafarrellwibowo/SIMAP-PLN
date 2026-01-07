"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useProjectStore, filterOptions } from "@/lib/store";
import { useAuth, MOCK_USERS } from "@/lib/auth";

export default function CreateProjectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createProject } = useProjectStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Distribusi",
    unit: filterOptions.units[1].value,
    location: filterOptions.locations[1].value,
    picId: "",
    targetStartDate: "",
    targetEndDate: "",
    estimatedBudget: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get PIC users
  const picUsers = MOCK_USERS.filter((u) => u.role === "pic");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama proyek wajib diisi";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Deskripsi proyek wajib diisi";
    }
    if (!formData.picId) {
      newErrors.picId = "PIC proyek wajib dipilih";
    }
    if (!formData.targetStartDate) {
      newErrors.targetStartDate = "Tanggal mulai wajib diisi";
    }
    if (!formData.targetEndDate) {
      newErrors.targetEndDate = "Tanggal selesai wajib diisi";
    }
    if (formData.targetStartDate && formData.targetEndDate) {
      if (new Date(formData.targetEndDate) <= new Date(formData.targetStartDate)) {
        newErrors.targetEndDate = "Tanggal selesai harus setelah tanggal mulai";
      }
    }
    if (!formData.estimatedBudget || Number(formData.estimatedBudget) <= 0) {
      newErrors.estimatedBudget = "Estimasi anggaran wajib diisi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const picUser = picUsers.find((u) => u.id === formData.picId);

    createProject({
      name: formData.name,
      description: formData.description,
      category: formData.category,
      unit: formData.unit,
      location: formData.location,
      picId: formData.picId,
      picName: picUser?.name || "",
      targetStartDate: formData.targetStartDate,
      targetEndDate: formData.targetEndDate,
      estimatedBudget: Number(formData.estimatedBudget),
      createdBy: user?.id || "",
    });

    setIsSubmitting(false);
    router.push("/projects");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (fieldName: string) => (value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Buat Proyek Baru
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Isi data dasar proyek untuk memulai inisiasi
        </p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Proyek <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: GI Cawang 150kV"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.name
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-all`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Deskripsi Proyek <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Jelaskan tujuan dan scope proyek..."
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-all`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Category & Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Kategori Proyek
                </label>
                <Select
                  value={formData.category}
                  onChange={handleSelectChange("category")}
                  options={filterOptions.categories.slice(1)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit Kerja
                </label>
                <Select
                  value={formData.unit}
                  onChange={handleSelectChange("unit")}
                  options={filterOptions.units.slice(1)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Location & PIC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Lokasi
                </label>
                <Select
                  value={formData.location}
                  onChange={handleSelectChange("location")}
                  options={filterOptions.locations.slice(1)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PIC Proyek <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.picId}
                  onChange={handleSelectChange("picId")}
                  options={picUsers.map((u) => ({ value: u.id, label: `${u.name} (${u.unit})` }))}
                  placeholder="Pilih PIC..."
                  className={`w-full ${errors.picId ? "border-red-500" : ""}`}
                />
                {errors.picId && (
                  <p className="mt-1 text-sm text-red-500">{errors.picId}</p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="targetStartDate"
                  value={formData.targetStartDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.targetStartDate
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-all`}
                />
                {errors.targetStartDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.targetStartDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Target Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="targetEndDate"
                  value={formData.targetEndDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.targetEndDate
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-all`}
                />
                {errors.targetEndDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.targetEndDate}</p>
                )}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimasi Total Anggaran (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="estimatedBudget"
                value={formData.estimatedBudget}
                onChange={handleChange}
                placeholder="Contoh: 50000000000"
                className={`w-full px-4 py-3 rounded-lg border ${
                  errors.estimatedBudget
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:ring-blue-500"
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:border-transparent transition-all`}
              />
              {errors.estimatedBudget && (
                <p className="mt-1 text-sm text-red-500">{errors.estimatedBudget}</p>
              )}
              {formData.estimatedBudget && (
                <p className="mt-1 text-sm text-gray-500">
                  = Rp {Number(formData.estimatedBudget).toLocaleString("id-ID")}
                </p>
              )}
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">Alur setelah submit:</p>
                  <ol className="list-decimal ml-4 space-y-1 text-blue-700 dark:text-blue-300">
                    <li>Proyek akan berstatus <strong>Draft</strong></li>
                    <li>Manajer akan mereview dan menyetujui</li>
                    <li>Setelah disetujui, status berubah menjadi <strong>Initiated</strong></li>
                    <li>Admin dapat melakukan perencanaan (jadwal & anggaran)</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 rounded-lg interactive"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 interactive"
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Simpan Proyek
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
