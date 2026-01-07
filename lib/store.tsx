// ============================================
// PROJECT STORE - State Management with Zustand-like pattern
// ============================================

"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type {
  Project,
  Milestone,
  BudgetItem,
  ProgressEntry,
  CostEntry,
  ProjectMetrics,
  Alert,
  ApprovalRequest,
  ProjectLifecycleStatus,
  HealthStatus,
  BudgetCategory,
} from "./types";

// ============================================
// MOCK DATA GENERATION
// ============================================

const units = [
  "PLN UP3 Jakarta Selatan",
  "PLN UP3 Bandung",
  "PLN UP3 Surabaya",
  "PLN UP3 Medan",
  "PLN UP3 Makassar",
];

const locations = ["Jakarta", "Bandung", "Surabaya", "Medan", "Makassar", "Semarang", "Yogyakarta"];

const categories = ["Transmisi", "Distribusi", "Pembangkit", "Gardu Induk", "Jaringan"];

function generateProjectCode(index: number): string {
  const year = new Date().getFullYear();
  return `PRJ-${year}-${String(index + 1).padStart(4, "0")}`;
}

// Generate realistic mock projects with different statuses
function generateMockProjects(): Project[] {
  const projectData = [
    { name: "GI Cawang 150kV", status: "on_progress" as ProjectLifecycleStatus, health: "green" as HealthStatus },
    { name: "SUTT 150kV Cikarang-Bekasi", status: "on_progress" as ProjectLifecycleStatus, health: "yellow" as HealthStatus },
    { name: "GI Duri Kosambi", status: "on_progress" as ProjectLifecycleStatus, health: "red" as HealthStatus },
    { name: "GITET 500kV Surabaya Selatan", status: "planned" as ProjectLifecycleStatus, health: "green" as HealthStatus },
    { name: "GI Cibinong 70kV", status: "initiated" as ProjectLifecycleStatus, health: "green" as HealthStatus },
    { name: "SUTT 70kV Bandung Utara", status: "draft" as ProjectLifecycleStatus, health: "green" as HealthStatus },
    { name: "GI Medan Baru 150kV", status: "on_progress" as ProjectLifecycleStatus, health: "yellow" as HealthStatus },
    { name: "GITET 500kV Makassar", status: "on_progress" as ProjectLifecycleStatus, health: "green" as HealthStatus },
    { name: "GI Semarang Timur", status: "completed" as ProjectLifecycleStatus, health: "green" as HealthStatus },
    { name: "SUTT 150kV Yogya-Solo", status: "on_hold" as ProjectLifecycleStatus, health: "yellow" as HealthStatus },
    { name: "GI Tangerang Selatan", status: "on_progress" as ProjectLifecycleStatus, health: "green" as HealthStatus },
    { name: "SUTT 70kV Jakarta Utara", status: "on_progress" as ProjectLifecycleStatus, health: "red" as HealthStatus },
    { name: "GI Bekasi Barat", status: "planned" as ProjectLifecycleStatus, health: "green" as HealthStatus },
    { name: "GITET 500kV Jawa Tengah", status: "initiated" as ProjectLifecycleStatus, health: "green" as HealthStatus },
    { name: "GI Depok Lama", status: "on_progress" as ProjectLifecycleStatus, health: "green" as HealthStatus },
  ];

  return projectData.map((data, index) => {
    const estimatedBudget = Math.floor(Math.random() * 50000000000) + 10000000000;
    
    return {
      id: `project-${index + 1}`,
      code: generateProjectCode(index),
      name: data.name,
      description: `Proyek pembangunan ${data.name} untuk meningkatkan kapasitas dan reliabilitas jaringan listrik.`,
      category: categories[index % categories.length],
      unit: units[index % units.length],
      location: locations[index % locations.length],
      picId: index % 2 === 0 ? "USR-002" : "USR-003",
      picName: index % 2 === 0 ? "Budi Santoso" : "Siti Rahayu",
      status: data.status,
      healthStatus: data.health,
      targetStartDate: "2025-01-15",
      targetEndDate: "2026-06-30",
      actualStartDate: ["on_progress", "completed", "on_hold"].includes(data.status) ? "2025-01-20" : undefined,
      actualEndDate: data.status === "completed" ? "2025-12-15" : undefined,
      estimatedBudget,
      createdAt: "2025-01-01T00:00:00Z",
      createdBy: "USR-001",
      updatedAt: new Date().toISOString(),
      updatedBy: "USR-001",
      approvedAt: ["initiated", "planned", "on_progress", "completed", "on_hold"].includes(data.status)
        ? "2025-01-10T00:00:00Z"
        : undefined,
      approvedBy: ["initiated", "planned", "on_progress", "completed", "on_hold"].includes(data.status)
        ? "USR-005"
        : undefined,
    };
  });
}

// Generate milestones for a project
function generateMockMilestones(projectId: string): Milestone[] {
  const milestoneTemplates = [
    { name: "Persiapan", weight: 10, order: 1 },
    { name: "Pengadaan Material", weight: 20, order: 2 },
    { name: "Pekerjaan Sipil", weight: 25, order: 3 },
    { name: "Instalasi Peralatan", weight: 30, order: 4 },
    { name: "Pengujian & Komisioning", weight: 15, order: 5 },
  ];

  return milestoneTemplates.map((template, index) => ({
    id: `milestone-${projectId}-${index + 1}`,
    projectId,
    name: template.name,
    description: `Tahap ${template.name} untuk proyek`,
    order: template.order,
    weight: template.weight,
    plannedStartDate: `2025-0${index + 1}-01`,
    plannedEndDate: `2025-0${index + 2}-28`,
    progressPlanned: Math.min((index + 1) * 20, 100),
    progressActual: Math.max(0, Math.min((index + 1) * 20 - Math.floor(Math.random() * 15), 100)),
    deliverables: [`Deliverable ${template.name} 1`, `Deliverable ${template.name} 2`],
    status: index < 2 ? "completed" : index === 2 ? "in_progress" : "not_started",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: new Date().toISOString(),
  }));
}

// Generate budget items for a project
function generateMockBudgetItems(projectId: string, totalBudget: number): BudgetItem[] {
  const budgetTemplates: { name: string; category: BudgetCategory; percentage: number }[] = [
    { name: "Material Konduktor", category: "material", percentage: 30 },
    { name: "Material Tower", category: "material", percentage: 20 },
    { name: "Jasa Konstruksi", category: "jasa", percentage: 25 },
    { name: "Jasa Engineering", category: "jasa", percentage: 10 },
    { name: "Biaya Operasional", category: "operasional", percentage: 10 },
    { name: "Overhead & Kontingensi", category: "overhead", percentage: 5 },
  ];

  return budgetTemplates.map((template, index) => {
    const totalPlanned = Math.floor(totalBudget * (template.percentage / 100));
    const totalActual = Math.floor(totalPlanned * (0.3 + Math.random() * 0.5));

    return {
      id: `budget-${projectId}-${index + 1}`,
      projectId,
      category: template.category,
      name: template.name,
      description: `Anggaran untuk ${template.name}`,
      quantity: Math.floor(Math.random() * 100) + 10,
      unit: template.category === "material" ? "unit" : "paket",
      unitPrice: Math.floor(totalPlanned / (Math.floor(Math.random() * 100) + 10)),
      totalPlanned,
      totalActual,
      createdAt: "2025-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
    };
  });
}

// Calculate project metrics
function calculateProjectMetrics(
  project: Project,
  milestones: Milestone[],
  budgetItems: BudgetItem[]
): ProjectMetrics {
  // Calculate progress
  const totalWeight = milestones.reduce((sum, m) => sum + m.weight, 0);
  const actualProgress = milestones.reduce(
    (sum, m) => sum + (m.progressActual * m.weight) / 100,
    0
  );
  const plannedProgress = milestones.reduce(
    (sum, m) => sum + (m.progressPlanned * m.weight) / 100,
    0
  );

  // Calculate budget
  const plannedBudget = budgetItems.reduce((sum, b) => sum + b.totalPlanned, 0);
  const actualCost = budgetItems.reduce((sum, b) => sum + b.totalActual, 0);
  const remainingBudget = plannedBudget - actualCost;

  // Earned Value calculations
  const earnedValue = (actualProgress / 100) * plannedBudget;
  const plannedValue = (plannedProgress / 100) * plannedBudget;

  // Performance indices
  const spiValue = plannedValue > 0 ? earnedValue / plannedValue : 1;
  const cpiValue = actualCost > 0 ? earnedValue / actualCost : 1;

  // Determine health status
  let healthStatus: HealthStatus = "green";
  let healthReason = "Proyek berjalan sesuai rencana";

  if (spiValue < 0.7 || cpiValue < 0.7) {
    healthStatus = "red";
    healthReason = spiValue < 0.7 
      ? "Progress sangat terlambat dari jadwal"
      : "Biaya jauh melebihi nilai hasil";
  } else if (spiValue < 0.9 || cpiValue < 0.9) {
    healthStatus = "yellow";
    healthReason = spiValue < 0.9
      ? "Progress sedikit terlambat dari jadwal"
      : "Biaya sedikit melebihi rencana";
  }

  return {
    projectId: project.id,
    calculatedAt: new Date().toISOString(),
    plannedProgress,
    actualProgress,
    scheduleVariance: actualProgress - plannedProgress,
    plannedBudget,
    actualCost,
    remainingBudget,
    budgetVariance: plannedBudget - actualCost,
    absorptionRate: plannedBudget > 0 ? (actualCost / plannedBudget) * 100 : 0,
    earnedValue,
    plannedValue,
    spiValue,
    cpiValue,
    healthStatus,
    healthReason,
  };
}

// ============================================
// PROJECT STORE CONTEXT
// ============================================

interface ProjectStoreContextType {
  // Data
  projects: Project[];
  milestones: Record<string, Milestone[]>;
  budgetItems: Record<string, BudgetItem[]>;
  progressEntries: ProgressEntry[];
  costEntries: CostEntry[];
  metrics: Record<string, ProjectMetrics>;
  alerts: Alert[];
  approvalRequests: ApprovalRequest[];

  // Project CRUD
  getProject: (id: string) => Project | undefined;
  getProjectsByPic: (picId: string) => Project[];
  getProjectsByStatus: (status: ProjectLifecycleStatus) => Project[];
  createProject: (data: Partial<Project>) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  updateProjectStatus: (id: string, status: ProjectLifecycleStatus, notes?: string) => void;

  // Milestones
  getMilestones: (projectId: string) => Milestone[];
  addMilestone: (projectId: string, data: Partial<Milestone>) => void;
  updateMilestone: (milestoneId: string, data: Partial<Milestone>) => void;

  // Budget
  getBudgetItems: (projectId: string) => BudgetItem[];
  addBudgetItem: (projectId: string, data: Partial<BudgetItem>) => void;
  updateBudgetItem: (itemId: string, data: Partial<BudgetItem>) => void;

  // Progress & Cost entries
  addProgressEntry: (entry: Partial<ProgressEntry>) => void;
  addCostEntry: (entry: Partial<CostEntry>) => void;

  // Metrics
  getProjectMetrics: (projectId: string) => ProjectMetrics | undefined;
  recalculateMetrics: (projectId: string) => void;

  // Alerts
  getUnreadAlerts: (roles: string[]) => Alert[];
  markAlertRead: (alertId: string, userId: string) => void;

  // Approvals
  getPendingApprovals: () => ApprovalRequest[];
  createApprovalRequest: (projectId: string, type: ApprovalRequest["type"]) => void;
  processApproval: (requestId: string, approved: boolean, notes?: string) => void;

  // Summary stats
  getSummaryStats: () => {
    total: number;
    draft: number;
    initiated: number;
    planned: number;
    onProgress: number;
    onHold: number;
    completed: number;
    cancelled: number;
    healthy: number;
    warning: number;
    critical: number;
  };
}

const ProjectStoreContext = createContext<ProjectStoreContextType | null>(null);

export function ProjectStoreProvider({ children }: { children: ReactNode }) {
  // Initialize with mock data
  const [projects, setProjects] = useState<Project[]>(() => generateMockProjects());
  
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>(() => {
    const result: Record<string, Milestone[]> = {};
    generateMockProjects().forEach((p) => {
      if (["planned", "on_progress", "completed", "on_hold"].includes(p.status)) {
        result[p.id] = generateMockMilestones(p.id);
      }
    });
    return result;
  });

  const [budgetItems, setBudgetItems] = useState<Record<string, BudgetItem[]>>(() => {
    const result: Record<string, BudgetItem[]> = {};
    generateMockProjects().forEach((p) => {
      if (["planned", "on_progress", "completed", "on_hold"].includes(p.status)) {
        result[p.id] = generateMockBudgetItems(p.id, p.estimatedBudget);
      }
    });
    return result;
  });

  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([]);
  const [costEntries, setCostEntries] = useState<CostEntry[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);

  // Calculate metrics
  const [metrics, setMetrics] = useState<Record<string, ProjectMetrics>>(() => {
    const result: Record<string, ProjectMetrics> = {};
    const mockProjects = generateMockProjects();
    mockProjects.forEach((p) => {
      if (["planned", "on_progress", "completed", "on_hold"].includes(p.status)) {
        const ms = generateMockMilestones(p.id);
        const bi = generateMockBudgetItems(p.id, p.estimatedBudget);
        result[p.id] = calculateProjectMetrics(p, ms, bi);
      }
    });
    return result;
  });

  // ========== PROJECT OPERATIONS ==========

  const getProject = useCallback(
    (id: string) => projects.find((p) => p.id === id),
    [projects]
  );

  const getProjectsByPic = useCallback(
    (picId: string) => projects.filter((p) => p.picId === picId),
    [projects]
  );

  const getProjectsByStatus = useCallback(
    (status: ProjectLifecycleStatus) => projects.filter((p) => p.status === status),
    [projects]
  );

  const createProject = useCallback(
    (data: Partial<Project>): Project => {
      const newProject: Project = {
        id: `project-${Date.now()}`,
        code: generateProjectCode(projects.length),
        name: data.name || "New Project",
        description: data.description || "",
        category: data.category || "Distribusi",
        unit: data.unit || units[0],
        location: data.location || locations[0],
        picId: data.picId || "",
        picName: data.picName || "",
        status: "draft",
        healthStatus: "green",
        targetStartDate: data.targetStartDate || new Date().toISOString().split("T")[0],
        targetEndDate: data.targetEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        estimatedBudget: data.estimatedBudget || 0,
        createdAt: new Date().toISOString(),
        createdBy: data.createdBy || "",
        updatedAt: new Date().toISOString(),
        updatedBy: data.createdBy || "",
      };

      setProjects((prev) => [...prev, newProject]);
      return newProject;
    },
    [projects.length]
  );

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      )
    );
  }, []);

  const updateProjectStatus = useCallback(
    (id: string, status: ProjectLifecycleStatus, notes?: string) => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                status,
                updatedAt: new Date().toISOString(),
                approvalNotes: notes,
                approvedAt: ["initiated", "planned"].includes(status)
                  ? new Date().toISOString()
                  : p.approvedAt,
              }
            : p
        )
      );
    },
    []
  );

  // ========== MILESTONE OPERATIONS ==========

  const getMilestones = useCallback(
    (projectId: string) => milestones[projectId] || [],
    [milestones]
  );

  const addMilestone = useCallback(
    (projectId: string, data: Partial<Milestone>) => {
      const existing = milestones[projectId] || [];
      const newMilestone: Milestone = {
        id: `milestone-${Date.now()}`,
        projectId,
        name: data.name || "New Milestone",
        description: data.description || "",
        order: existing.length + 1,
        weight: data.weight || 0,
        plannedStartDate: data.plannedStartDate || "",
        plannedEndDate: data.plannedEndDate || "",
        progressPlanned: 0,
        progressActual: 0,
        deliverables: data.deliverables || [],
        status: "not_started",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setMilestones((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newMilestone],
      }));
    },
    [milestones]
  );

  const updateMilestone = useCallback((milestoneId: string, data: Partial<Milestone>) => {
    setMilestones((prev) => {
      const updated = { ...prev };
      for (const projectId in updated) {
        updated[projectId] = updated[projectId].map((m) =>
          m.id === milestoneId ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
        );
      }
      return updated;
    });
  }, []);

  // ========== BUDGET OPERATIONS ==========

  const getBudgetItems = useCallback(
    (projectId: string) => budgetItems[projectId] || [],
    [budgetItems]
  );

  const addBudgetItem = useCallback(
    (projectId: string, data: Partial<BudgetItem>) => {
      const newItem: BudgetItem = {
        id: `budget-${Date.now()}`,
        projectId,
        category: data.category || "material",
        name: data.name || "New Item",
        description: data.description || "",
        quantity: data.quantity || 0,
        unit: data.unit || "unit",
        unitPrice: data.unitPrice || 0,
        totalPlanned: (data.quantity || 0) * (data.unitPrice || 0),
        totalActual: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setBudgetItems((prev) => ({
        ...prev,
        [projectId]: [...(prev[projectId] || []), newItem],
      }));
    },
    []
  );

  const updateBudgetItem = useCallback((itemId: string, data: Partial<BudgetItem>) => {
    setBudgetItems((prev) => {
      const updated = { ...prev };
      for (const projectId in updated) {
        updated[projectId] = updated[projectId].map((b) =>
          b.id === itemId ? { ...b, ...data, updatedAt: new Date().toISOString() } : b
        );
      }
      return updated;
    });
  }, []);

  // ========== PROGRESS & COST ENTRIES ==========

  const addProgressEntry = useCallback((entry: Partial<ProgressEntry>) => {
    const newEntry: ProgressEntry = {
      id: `progress-${Date.now()}`,
      projectId: entry.projectId || "",
      milestoneId: entry.milestoneId || "",
      progressPercentage: entry.progressPercentage || 0,
      date: entry.date || new Date().toISOString().split("T")[0],
      notes: entry.notes || "",
      issues: entry.issues,
      photos: entry.photos,
      enteredBy: entry.enteredBy || "",
      enteredByName: entry.enteredByName || "",
      enteredAt: new Date().toISOString(),
    };

    setProgressEntries((prev) => [...prev, newEntry]);

    // Update milestone progress
    if (entry.milestoneId) {
      updateMilestone(entry.milestoneId, {
        progressActual: entry.progressPercentage,
        status: entry.progressPercentage === 100 ? "completed" : "in_progress",
      });
    }

    // Update project status if first progress entry
    if (entry.projectId) {
      const project = projects.find((p) => p.id === entry.projectId);
      if (project && project.status === "planned") {
        updateProjectStatus(entry.projectId, "on_progress");
      }
    }
  }, [projects, updateMilestone, updateProjectStatus]);

  const addCostEntry = useCallback((entry: Partial<CostEntry>) => {
    const newEntry: CostEntry = {
      id: `cost-${Date.now()}`,
      projectId: entry.projectId || "",
      budgetItemId: entry.budgetItemId || "",
      amount: entry.amount || 0,
      transactionDate: entry.transactionDate || new Date().toISOString().split("T")[0],
      referenceNumber: entry.referenceNumber || "",
      description: entry.description || "",
      enteredBy: entry.enteredBy || "",
      enteredByName: entry.enteredByName || "",
      enteredAt: new Date().toISOString(),
    };

    setCostEntries((prev) => [...prev, newEntry]);

    // Update budget item actual cost
    if (entry.budgetItemId) {
      setBudgetItems((prev) => {
        const updated = { ...prev };
        for (const projectId in updated) {
          updated[projectId] = updated[projectId].map((b) =>
            b.id === entry.budgetItemId
              ? { ...b, totalActual: b.totalActual + (entry.amount || 0) }
              : b
          );
        }
        return updated;
      });
    }
  }, []);

  // ========== METRICS ==========

  const getProjectMetrics = useCallback(
    (projectId: string) => metrics[projectId],
    [metrics]
  );

  const recalculateMetrics = useCallback(
    (projectId: string) => {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      const ms = milestones[projectId] || [];
      const bi = budgetItems[projectId] || [];
      const newMetrics = calculateProjectMetrics(project, ms, bi);

      setMetrics((prev) => ({
        ...prev,
        [projectId]: newMetrics,
      }));

      // Update project health status
      updateProject(projectId, { healthStatus: newMetrics.healthStatus });
    },
    [projects, milestones, budgetItems, updateProject]
  );

  // ========== ALERTS ==========

  const getUnreadAlerts = useCallback(
    (roles: string[]) =>
      alerts.filter((a) => !a.readAt && a.targetRoles.some((r) => roles.includes(r))),
    [alerts]
  );

  const markAlertRead = useCallback((alertId: string, userId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId ? { ...a, readAt: new Date().toISOString(), readBy: userId } : a
      )
    );
  }, []);

  // ========== APPROVALS ==========

  const getPendingApprovals = useCallback(
    () => approvalRequests.filter((a) => a.status === "pending"),
    [approvalRequests]
  );

  const createApprovalRequest = useCallback(
    (projectId: string, type: ApprovalRequest["type"]) => {
      const newRequest: ApprovalRequest = {
        id: `approval-${Date.now()}`,
        projectId,
        type,
        status: "pending",
        requestedBy: "",
        requestedByName: "",
        requestedAt: new Date().toISOString(),
      };

      setApprovalRequests((prev) => [...prev, newRequest]);
    },
    []
  );

  const processApproval = useCallback(
    (requestId: string, approved: boolean, notes?: string) => {
      setApprovalRequests((prev) =>
        prev.map((a) =>
          a.id === requestId
            ? {
                ...a,
                status: approved ? "approved" : "rejected",
                reviewedAt: new Date().toISOString(),
                notes: approved ? notes : undefined,
                rejectionReason: !approved ? notes : undefined,
              }
            : a
        )
      );
    },
    []
  );

  // ========== SUMMARY STATS ==========

  const getSummaryStats = useCallback(() => {
    return {
      total: projects.length,
      draft: projects.filter((p) => p.status === "draft").length,
      initiated: projects.filter((p) => p.status === "initiated").length,
      planned: projects.filter((p) => p.status === "planned").length,
      onProgress: projects.filter((p) => p.status === "on_progress").length,
      onHold: projects.filter((p) => p.status === "on_hold").length,
      completed: projects.filter((p) => p.status === "completed").length,
      cancelled: projects.filter((p) => p.status === "cancelled").length,
      healthy: projects.filter((p) => p.healthStatus === "green").length,
      warning: projects.filter((p) => p.healthStatus === "yellow").length,
      critical: projects.filter((p) => p.healthStatus === "red").length,
    };
  }, [projects]);

  return (
    <ProjectStoreContext.Provider
      value={{
        projects,
        milestones,
        budgetItems,
        progressEntries,
        costEntries,
        metrics,
        alerts,
        approvalRequests,
        getProject,
        getProjectsByPic,
        getProjectsByStatus,
        createProject,
        updateProject,
        updateProjectStatus,
        getMilestones,
        addMilestone,
        updateMilestone,
        getBudgetItems,
        addBudgetItem,
        updateBudgetItem,
        addProgressEntry,
        addCostEntry,
        getProjectMetrics,
        recalculateMetrics,
        getUnreadAlerts,
        markAlertRead,
        getPendingApprovals,
        createApprovalRequest,
        processApproval,
        getSummaryStats,
      }}
    >
      {children}
    </ProjectStoreContext.Provider>
  );
}

export function useProjectStore() {
  const context = useContext(ProjectStoreContext);
  if (!context) {
    throw new Error("useProjectStore must be used within a ProjectStoreProvider");
  }
  return context;
}

// Export filter options
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
    { value: "draft", label: "Draft" },
    { value: "initiated", label: "Initiated" },
    { value: "planned", label: "Planned" },
    { value: "on_progress", label: "On Progress" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ],
  healthStatuses: [
    { value: "all", label: "Semua Kondisi" },
    { value: "green", label: "Sehat" },
    { value: "yellow", label: "Perlu Perhatian" },
    { value: "red", label: "Kritis" },
  ],
  categories: [
    { value: "all", label: "Semua Kategori" },
    ...categories.map((c) => ({ value: c, label: c })),
  ],
};

// Status labels and colors
export const STATUS_LABELS: Record<ProjectLifecycleStatus, string> = {
  draft: "Draft",
  initiated: "Initiated",
  planned: "Planned",
  on_progress: "On Progress",
  on_hold: "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const STATUS_COLORS: Record<ProjectLifecycleStatus, string> = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  initiated: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  planned: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
  on_progress: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  on_hold: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

export const HEALTH_LABELS: Record<HealthStatus, string> = {
  green: "Sehat",
  yellow: "Perlu Perhatian",
  red: "Kritis",
};

export const HEALTH_COLORS: Record<HealthStatus, string> = {
  green: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  yellow: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};
