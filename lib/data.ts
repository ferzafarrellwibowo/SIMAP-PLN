// Mock data for dashboard - Replace with PostgreSQL queries
import { getProjectStatus, type ProjectStatus } from "./utils";

export interface Project {
  id: string;
  name: string;
  unit: string;
  location: string;
  progressPlanned: number;
  progressActual: number;
  budgetTotal: number;
  budgetUsed: number;
  startDate: string;
  endDate: string;
  lastUpdate: string;
  status: ProjectStatus;
}

export interface DashboardFilters {
  period: string;
  unit: string;
  location: string;
  status: string;
}

// Generate mock projects
const units = ["PLN UP3 Jakarta Selatan", "PLN UP3 Bandung", "PLN UP3 Surabaya", "PLN UP3 Medan", "PLN UP3 Makassar"];
const locations = ["Jakarta", "Bandung", "Surabaya", "Medan", "Makassar", "Semarang", "Yogyakarta"];
const projectNames = [
  "GI Cawang 150kV",
  "SUTT 150kV Cikarang-Bekasi",
  "GI Duri Kosambi",
  "GITET 500kV Surabaya Selatan",
  "GI Cibinong 70kV",
  "SUTT 70kV Bandung Utara",
  "GI Medan Baru 150kV",
  "GITET 500kV Makassar",
  "GI Semarang Timur",
  "SUTT 150kV Yogya-Solo",
  "GI Tangerang Selatan",
  "SUTT 70kV Jakarta Utara",
  "GI Bekasi Barat",
  "GITET 500kV Jawa Tengah",
  "GI Depok Lama",
];

function generateMockProjects(): Project[] {
  return projectNames.map((name, index) => {
    const progressPlanned = Math.floor(Math.random() * 40) + 50;
    const progressActual = progressPlanned - Math.floor(Math.random() * 30) - 5;
    const budgetTotal = Math.floor(Math.random() * 50000000000) + 10000000000;
    const budgetUsed = budgetTotal * (Math.random() * 0.4 + 0.4);
    
    const daysAgo = Math.floor(Math.random() * 14);
    const lastUpdate = new Date();
    lastUpdate.setDate(lastUpdate.getDate() - daysAgo);

    return {
      id: `PRJ-${String(index + 1).padStart(3, "0")}`,
      name,
      unit: units[index % units.length],
      location: locations[index % locations.length],
      progressPlanned: Math.min(progressPlanned, 100),
      progressActual: Math.max(progressActual, 0),
      budgetTotal,
      budgetUsed,
      startDate: "2025-01-15",
      endDate: "2026-06-30",
      lastUpdate: lastUpdate.toISOString().split("T")[0],
      status: getProjectStatus(
        Math.max(progressActual, 0),
        Math.min(progressPlanned, 100),
        budgetUsed,
        budgetTotal
      ),
    };
  });
}

export const mockProjects: Project[] = generateMockProjects();

export function getFilteredProjects(filters: DashboardFilters): Project[] {
  return mockProjects.filter((project) => {
    if (filters.unit && filters.unit !== "all" && project.unit !== filters.unit) return false;
    if (filters.location && filters.location !== "all" && project.location !== filters.location) return false;
    if (filters.status && filters.status !== "all" && project.status !== filters.status) return false;
    return true;
  });
}

export function getSummaryStats(projects: Project[]) {
  const total = projects.length;
  const running = projects.filter((p) => p.progressActual > 0 && p.progressActual < 100).length;
  const completed = projects.filter((p) => p.progressActual >= 100).length;
  const problematic = projects.filter((p) => p.status === "red").length;

  return { total, running, completed, problematic };
}

export function getStatusDistribution(projects: Project[]) {
  const green = projects.filter((p) => p.status === "green").length;
  const yellow = projects.filter((p) => p.status === "yellow").length;
  const red = projects.filter((p) => p.status === "red").length;

  return [
    { name: "Sesuai Rencana", value: green, color: "#10b981" },
    { name: "Ada Deviasi", value: yellow, color: "#f59e0b" },
    { name: "Masalah Serius", value: red, color: "#ef4444" },
  ];
}

export function getProgressData(projects: Project[]) {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  
  return months.slice(0, 6).map((month, index) => {
    const baseProgress = (index + 1) * 15;
    return {
      month,
      rencana: Math.min(baseProgress + Math.floor(Math.random() * 5), 100),
      realisasi: Math.min(baseProgress - Math.floor(Math.random() * 10), 100),
    };
  });
}

export function getBudgetData(projects: Project[]) {
  const totalBudget = projects.reduce((sum, p) => sum + p.budgetTotal, 0);
  const totalUsed = projects.reduce((sum, p) => sum + p.budgetUsed, 0);
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
}

export function getProblematicProjects(projects: Project[]): Project[] {
  return projects
    .filter((p) => p.status === "red" || p.status === "yellow")
    .sort((a, b) => {
      // Sort by status severity, then by deviation
      if (a.status === "red" && b.status !== "red") return -1;
      if (b.status === "red" && a.status !== "red") return 1;
      const deviationA = a.progressPlanned - a.progressActual;
      const deviationB = b.progressPlanned - b.progressActual;
      return deviationB - deviationA;
    })
    .slice(0, 10);
}

export function getRiskIndicators(projects: Project[]) {
  const now = new Date();
  
  const delayedProjects = projects.filter(
    (p) => p.progressPlanned - p.progressActual > 10
  ).length;

  const overBudgetProjects = projects.filter(
    (p) => (p.budgetUsed / p.budgetTotal) * 100 > 85
  ).length;

  const noUpdateProjects = projects.filter((p) => {
    const lastUpdate = new Date(p.lastUpdate);
    const diffDays = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  }).length;

  return {
    delayed: delayedProjects,
    overBudget: overBudgetProjects,
    noUpdate: noUpdateProjects,
  };
}

export const filterOptions = {
  periods: [
    { value: "all", label: "Semua Periode" },
    { value: "2025", label: "2025" },
    { value: "2026", label: "2026" },
  ],
  units: [
    { value: "all", label: "Semua Unit" },
    ...units.map((u) => ({ value: u, label: u })),
  ],
  locations: [
    { value: "all", label: "Semua Lokasi" },
    ...locations.map((l) => ({ value: l, label: l })),
  ],
  statuses: [
    { value: "all", label: "Semua Status" },
    { value: "green", label: "Sesuai Rencana" },
    { value: "yellow", label: "Ada Deviasi" },
    { value: "red", label: "Masalah Serius" },
  ],
};
