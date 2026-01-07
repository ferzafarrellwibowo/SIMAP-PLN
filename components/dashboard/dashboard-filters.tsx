"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { filterOptions, type DashboardFilters } from "@/lib/data";
import { motion } from "framer-motion";
import { Filter, RotateCcw } from "lucide-react";

interface DashboardFiltersProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
}

export function DashboardFiltersComponent({
  filters,
  onFilterChange,
}: DashboardFiltersProps) {
  const handleChange = (key: keyof DashboardFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFilterChange({
      period: "all",
      unit: "all",
      location: "all",
      status: "all",
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value && value !== "all"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-6" hover={false}>
        <CardContent className="py-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Filter className="h-5 w-5" />
              <span className="font-medium">Filter:</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
              <Select
                label="Periode"
                options={filterOptions.periods}
                value={filters.period}
                onChange={(value) => handleChange("period", value)}
              />
              <Select
                label="Unit"
                options={filterOptions.units}
                value={filters.unit}
                onChange={(value) => handleChange("unit", value)}
              />
              <Select
                label="Lokasi"
                options={filterOptions.locations}
                value={filters.location}
                onChange={(value) => handleChange("location", value)}
              />
              <Select
                label="Status"
                options={filterOptions.statuses}
                value={filters.status}
                onChange={(value) => handleChange("status", value)}
              />
            </div>

            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleReset}
                className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 interactive"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </motion.button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
