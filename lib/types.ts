// ============================================
// TYPE DEFINITIONS FOR PROJECT MONITORING SYSTEM
// Following PMBOK Project Lifecycle
// ============================================

// User Roles
export type UserRole = "admin" | "pic" | "keuangan" | "manajer";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  unit: string;
  createdAt: string;
}

// Project Lifecycle Status
export type ProjectLifecycleStatus =
  | "draft"           // Baru dibuat, belum diapprove
  | "initiated"       // Sudah diapprove manajer, siap planning
  | "planned"         // Rencana sudah disetujui, siap eksekusi
  | "on_progress"     // Sedang berjalan
  | "on_hold"         // Ditunda sementara
  | "completed"       // Selesai
  | "cancelled";      // Dibatalkan

// Health Status (calculated by system)
export type HealthStatus = "green" | "yellow" | "red";

// ============================================
// PROJECT STRUCTURE
// ============================================

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  location: string;
  
  // Assignment
  picId: string;
  picName: string;
  
  // Lifecycle
  status: ProjectLifecycleStatus;
  healthStatus: HealthStatus;
  
  // Dates
  targetStartDate: string;
  targetEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  
  // Budget Estimation (initial)
  estimatedBudget: number;
  
  // Timestamps & Audit
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  approvedAt?: string;
  approvedBy?: string;
  
  // Approval notes
  approvalNotes?: string;
  rejectionReason?: string;
}

// ============================================
// PLANNING - MILESTONES & SCHEDULE
// ============================================

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description: string;
  order: number;
  
  // Weight for progress calculation (total must be 100%)
  weight: number;
  
  // Planned dates
  plannedStartDate: string;
  plannedEndDate: string;
  
  // Actual dates (filled during execution)
  actualStartDate?: string;
  actualEndDate?: string;
  
  // Deliverables
  deliverables: string[];
  
  // Progress (0-100)
  progressPlanned: number;  // Calculated based on date
  progressActual: number;   // Input by PIC
  
  // Status
  status: "not_started" | "in_progress" | "completed" | "delayed";
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// PLANNING - BUDGET
// ============================================

export type BudgetCategory = 
  | "material"
  | "jasa"
  | "operasional"
  | "overhead"
  | "lainnya";

export interface BudgetItem {
  id: string;
  projectId: string;
  category: BudgetCategory;
  name: string;
  description: string;
  
  // Planned
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPlanned: number;  // quantity * unitPrice
  
  // Actual (accumulated from realizations)
  totalActual: number;
  
  // Monthly allocation (optional)
  monthlyAllocation?: Record<string, number>;
  
  createdAt: string;
  updatedAt: string;
}

// ============================================
// EXECUTION - PROGRESS REALIZATION
// ============================================

export interface ProgressEntry {
  id: string;
  projectId: string;
  milestoneId: string;
  
  // Progress data
  progressPercentage: number;
  date: string;
  
  // Documentation
  notes: string;
  issues?: string;
  photos?: string[];
  
  // Audit
  enteredBy: string;
  enteredByName: string;
  enteredAt: string;
}

// ============================================
// EXECUTION - COST REALIZATION
// ============================================

export interface CostEntry {
  id: string;
  projectId: string;
  budgetItemId: string;
  
  // Cost data
  amount: number;
  transactionDate: string;
  referenceNumber: string;
  description: string;
  
  // Audit
  enteredBy: string;
  enteredByName: string;
  enteredAt: string;
}

// ============================================
// MONITORING - CALCULATED METRICS
// ============================================

export interface ProjectMetrics {
  projectId: string;
  calculatedAt: string;
  
  // Progress metrics
  plannedProgress: number;      // Expected progress based on schedule
  actualProgress: number;       // Actual progress from milestones
  scheduleVariance: number;     // actualProgress - plannedProgress
  
  // Budget metrics
  plannedBudget: number;        // Total baseline budget
  actualCost: number;           // Total actual cost
  remainingBudget: number;      // plannedBudget - actualCost
  budgetVariance: number;       // plannedBudget - actualCost
  absorptionRate: number;       // (actualCost / plannedBudget) * 100
  
  // Earned Value metrics
  earnedValue: number;          // actualProgress% * plannedBudget
  plannedValue: number;         // plannedProgress% * plannedBudget
  
  // Performance indices
  spiValue: number;             // Schedule Performance Index = EV / PV
  cpiValue: number;             // Cost Performance Index = EV / AC
  
  // Health status (calculated)
  healthStatus: HealthStatus;
  healthReason: string;
}

// ============================================
// ALERTS & NOTIFICATIONS
// ============================================

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertType = 
  | "progress_behind"
  | "budget_overrun"
  | "no_update"
  | "deadline_approaching"
  | "status_change"
  | "approval_needed";

export interface Alert {
  id: string;
  projectId: string;
  projectName: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  createdAt: string;
  readAt?: string;
  readBy?: string;
  targetRoles: UserRole[];
}

// ============================================
// APPROVAL WORKFLOW
// ============================================

export type ApprovalType = 
  | "project_initiation"
  | "project_planning"
  | "project_closing"
  | "change_request";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalRequest {
  id: string;
  projectId: string;
  type: ApprovalType;
  status: ApprovalStatus;
  
  requestedBy: string;
  requestedByName: string;
  requestedAt: string;
  
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  
  notes?: string;
  rejectionReason?: string;
}

// ============================================
// CLOSING
// ============================================

export interface ProjectClosing {
  id: string;
  projectId: string;
  
  // Checklist
  deliverablesCompleted: boolean;
  allCostsRecorded: boolean;
  documentationComplete: boolean;
  
  // Final report
  finalNotes: string;
  lessonsLearned: string;
  
  // Performance summary
  finalProgress: number;
  finalBudgetUsed: number;
  daysDelayed: number;
  
  // Approval
  requestedBy: string;
  requestedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  
  status: ApprovalStatus;
}

// ============================================
// AUDIT LOG
// ============================================

export interface AuditLog {
  id: string;
  projectId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  ipAddress?: string;
}

// ============================================
// FILTER & REPORT TYPES
// ============================================

export interface DashboardFilters {
  period: string;
  unit: string;
  location: string;
  status: string;
  healthStatus?: string;
}

export interface ReportParams {
  type: "executive" | "weekly" | "monthly" | "project_detail" | "budget";
  startDate?: string;
  endDate?: string;
  projectIds?: string[];
  unit?: string;
  format: "pdf" | "excel" | "dashboard";
}
