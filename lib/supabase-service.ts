// ============================================
// SUPABASE DATA SERVICE
// Menggantikan Mock Data dengan Cloud Data
// ============================================

import { supabase } from './supabaseClient';
import type {
  Project,
  Milestone,
  BudgetItem,
  ProjectMetrics,
  ProgressEntry,
  CostEntry,
  Alert,
  ApprovalRequest,
  ProjectLifecycleStatus,
  HealthStatus,
  DashboardFilters,
} from './types';

// ============================================
// TYPE DEFINITIONS untuk Supabase Response
// ============================================

export interface SupabaseProject {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  location: string;
  pic_id: string | null;
  pic_name: string | null;
  status: ProjectLifecycleStatus;
  health_status: HealthStatus;
  target_start_date: string;
  target_end_date: string;
  actual_start_date: string | null;
  actual_end_date: string | null;
  estimated_budget: number;
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  approved_at: string | null;
  approved_by: string | null;
  approval_notes: string | null;
  rejection_reason: string | null;
}

export interface SupabaseMilestone {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  order: number;
  weight: number;
  planned_start_date: string;
  planned_end_date: string;
  actual_start_date: string | null;
  actual_end_date: string | null;
  deliverables: string[];
  progress_planned: number;
  progress_actual: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  created_at: string;
  updated_at: string;
}

export interface SupabaseBudgetItem {
  id: string;
  project_id: string;
  category: string;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  total_planned: number;
  total_actual: number;
  monthly_allocation: Record<string, number> | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseProjectMetrics {
  id: string;
  project_id: string;
  calculated_at: string;
  planned_progress: number;
  actual_progress: number;
  schedule_variance: number;
  planned_budget: number;
  actual_cost: number;
  remaining_budget: number;
  budget_variance: number;
  absorption_rate: number;
  earned_value: number;
  planned_value: number;
  spi_value: number;
  cpi_value: number;
  health_status: HealthStatus;
  health_reason: string | null;
}

export interface SupabaseContract {
  id: string;
  no: number;
  uraian_kegiatan: string;
  no_perjanjian: string;
  tanggal_perjanjian: string;
  tanggal_berakhir: string;
  judul_pekerjaan: string;
  nilai_kontrak: number;
  vendor: string;
  kategori: 'investasi' | 'pemeliharaan' | 'administrasi';
  jenis_anggaran: 'AI' | 'AO';
  unit: string;
  status: 'aktif' | 'selesai' | 'bermasalah';
  total_tagihan_dibayar: number;
  sisa_anggaran: number;
  persentase_realisasi: number;
  pic_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseInvoice {
  id: string;
  contract_id: string;
  no_perjanjian: string;
  nomor_tagihan: string;
  tanggal_tagihan: string;
  nilai_tagihan: number;
  status: 'diajukan' | 'diverifikasi' | 'dibayar' | 'ditolak';
  tanggal_diajukan: string;
  diajukan_oleh: string;
  diajukan_oleh_name: string;
  keterangan: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  id: string;
  period: string;
  unit: string | null;
  total_projects: number;
  draft_projects: number;
  initiated_projects: number;
  planned_projects: number;
  on_progress_projects: number;
  on_hold_projects: number;
  completed_projects: number;
  cancelled_projects: number;
  healthy_projects: number;
  warning_projects: number;
  critical_projects: number;
  total_budget: number;
  total_absorbed: number;
  total_remaining: number;
  absorption_rate: number;
  avg_planned_progress: number;
  avg_actual_progress: number;
  total_contracts: number;
  active_contracts: number;
  completed_contracts: number;
  problematic_contracts: number;
  total_contract_value: number;
  total_paid_value: number;
  calculated_at: string;
}

// ============================================
// CONVERSION FUNCTIONS
// ============================================

function convertToProject(data: SupabaseProject): Project {
  return {
    id: data.id,
    code: data.code,
    name: data.name,
    description: data.description || '',
    category: data.category,
    unit: data.unit,
    location: data.location,
    picId: data.pic_id || '',
    picName: data.pic_name || '',
    status: data.status,
    healthStatus: data.health_status,
    targetStartDate: data.target_start_date,
    targetEndDate: data.target_end_date,
    actualStartDate: data.actual_start_date || undefined,
    actualEndDate: data.actual_end_date || undefined,
    estimatedBudget: data.estimated_budget,
    createdAt: data.created_at,
    createdBy: data.created_by || '',
    updatedAt: data.updated_at,
    updatedBy: data.updated_by || '',
    approvedAt: data.approved_at || undefined,
    approvedBy: data.approved_by || undefined,
    approvalNotes: data.approval_notes || undefined,
    rejectionReason: data.rejection_reason || undefined,
  };
}

function convertToMilestone(data: SupabaseMilestone): Milestone {
  return {
    id: data.id,
    projectId: data.project_id,
    name: data.name,
    description: data.description || '',
    order: data.order,
    weight: data.weight,
    plannedStartDate: data.planned_start_date,
    plannedEndDate: data.planned_end_date,
    actualStartDate: data.actual_start_date || undefined,
    actualEndDate: data.actual_end_date || undefined,
    deliverables: data.deliverables || [],
    progressPlanned: data.progress_planned,
    progressActual: data.progress_actual,
    status: data.status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function convertToBudgetItem(data: SupabaseBudgetItem): BudgetItem {
  return {
    id: data.id,
    projectId: data.project_id,
    category: data.category as BudgetItem['category'],
    name: data.name,
    description: data.description || '',
    quantity: data.quantity,
    unit: data.unit,
    unitPrice: data.unit_price,
    totalPlanned: data.total_planned,
    totalActual: data.total_actual,
    monthlyAllocation: data.monthly_allocation || undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function convertToProjectMetrics(data: SupabaseProjectMetrics): ProjectMetrics {
  return {
    projectId: data.project_id,
    calculatedAt: data.calculated_at,
    plannedProgress: data.planned_progress,
    actualProgress: data.actual_progress,
    scheduleVariance: data.schedule_variance,
    plannedBudget: data.planned_budget,
    actualCost: data.actual_cost,
    remainingBudget: data.remaining_budget,
    budgetVariance: data.budget_variance,
    absorptionRate: data.absorption_rate,
    earnedValue: data.earned_value,
    plannedValue: data.planned_value,
    spiValue: data.spi_value,
    cpiValue: data.cpi_value,
    healthStatus: data.health_status,
    healthReason: data.health_reason || '',
  };
}

// ============================================
// PROJECT SERVICE
// ============================================

export const projectService = {
  // Get all projects
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(convertToProject);
  },

  // Get project by ID
  async getById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? convertToProject(data) : null;
  },

  // Get projects by status
  async getByStatus(status: ProjectLifecycleStatus): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(convertToProject);
  },

  // Get projects by PIC
  async getByPic(picId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('pic_id', picId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(convertToProject);
  },

  // Get filtered projects
  async getFiltered(filters: DashboardFilters): Promise<Project[]> {
    let query = supabase.from('projects').select('*');

    if (filters.unit && filters.unit !== 'all') {
      query = query.eq('unit', filters.unit);
    }
    if (filters.location && filters.location !== 'all') {
      query = query.eq('location', filters.location);
    }
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters.healthStatus && filters.healthStatus !== 'all') {
      query = query.eq('health_status', filters.healthStatus);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(convertToProject);
  },

  // Create project
  async create(project: Partial<Project>): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        code: project.code,
        name: project.name,
        description: project.description,
        category: project.category,
        unit: project.unit,
        location: project.location,
        pic_id: project.picId,
        pic_name: project.picName,
        status: project.status || 'draft',
        health_status: project.healthStatus || 'green',
        target_start_date: project.targetStartDate,
        target_end_date: project.targetEndDate,
        estimated_budget: project.estimatedBudget,
        created_by: project.createdBy,
        updated_by: project.createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return convertToProject(data);
  },

  // Update project
  async update(id: string, updates: Partial<Project>): Promise<Project> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.picId !== undefined) updateData.pic_id = updates.picId;
    if (updates.picName !== undefined) updateData.pic_name = updates.picName;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.healthStatus !== undefined) updateData.health_status = updates.healthStatus;
    if (updates.targetStartDate !== undefined) updateData.target_start_date = updates.targetStartDate;
    if (updates.targetEndDate !== undefined) updateData.target_end_date = updates.targetEndDate;
    if (updates.actualStartDate !== undefined) updateData.actual_start_date = updates.actualStartDate;
    if (updates.actualEndDate !== undefined) updateData.actual_end_date = updates.actualEndDate;
    if (updates.estimatedBudget !== undefined) updateData.estimated_budget = updates.estimatedBudget;
    if (updates.updatedBy !== undefined) updateData.updated_by = updates.updatedBy;
    if (updates.approvalNotes !== undefined) updateData.approval_notes = updates.approvalNotes;
    if (updates.approvedAt !== undefined) updateData.approved_at = updates.approvedAt;
    if (updates.approvedBy !== undefined) updateData.approved_by = updates.approvedBy;

    const { data, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return convertToProject(data);
  },

  // Delete project
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// MILESTONE SERVICE
// ============================================

export const milestoneService = {
  async getByProject(projectId: string): Promise<Milestone[]> {
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true });

    if (error) throw error;
    return (data || []).map(convertToMilestone);
  },

  async create(milestone: Partial<Milestone>): Promise<Milestone> {
    const { data, error } = await supabase
      .from('milestones')
      .insert({
        project_id: milestone.projectId,
        name: milestone.name,
        description: milestone.description,
        order: milestone.order,
        weight: milestone.weight,
        planned_start_date: milestone.plannedStartDate,
        planned_end_date: milestone.plannedEndDate,
        deliverables: milestone.deliverables,
        progress_planned: milestone.progressPlanned || 0,
        progress_actual: milestone.progressActual || 0,
        status: milestone.status || 'not_started',
      })
      .select()
      .single();

    if (error) throw error;
    return convertToMilestone(data);
  },

  async update(id: string, updates: Partial<Milestone>): Promise<Milestone> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.order !== undefined) updateData.order = updates.order;
    if (updates.weight !== undefined) updateData.weight = updates.weight;
    if (updates.plannedStartDate !== undefined) updateData.planned_start_date = updates.plannedStartDate;
    if (updates.plannedEndDate !== undefined) updateData.planned_end_date = updates.plannedEndDate;
    if (updates.actualStartDate !== undefined) updateData.actual_start_date = updates.actualStartDate;
    if (updates.actualEndDate !== undefined) updateData.actual_end_date = updates.actualEndDate;
    if (updates.deliverables !== undefined) updateData.deliverables = updates.deliverables;
    if (updates.progressPlanned !== undefined) updateData.progress_planned = updates.progressPlanned;
    if (updates.progressActual !== undefined) updateData.progress_actual = updates.progressActual;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('milestones')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return convertToMilestone(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('milestones')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// BUDGET SERVICE
// ============================================

export const budgetService = {
  async getByProject(projectId: string): Promise<BudgetItem[]> {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('project_id', projectId)
      .order('category', { ascending: true });

    if (error) throw error;
    return (data || []).map(convertToBudgetItem);
  },

  async create(item: Partial<BudgetItem>): Promise<BudgetItem> {
    const { data, error } = await supabase
      .from('budget_items')
      .insert({
        project_id: item.projectId,
        category: item.category,
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unitPrice,
        total_planned: (item.quantity || 0) * (item.unitPrice || 0),
        total_actual: item.totalActual || 0,
      })
      .select()
      .single();

    if (error) throw error;
    return convertToBudgetItem(data);
  },

  async update(id: string, updates: Partial<BudgetItem>): Promise<BudgetItem> {
    const updateData: Record<string, unknown> = {};
    
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.unitPrice !== undefined) updateData.unit_price = updates.unitPrice;
    if (updates.totalPlanned !== undefined) updateData.total_planned = updates.totalPlanned;
    if (updates.totalActual !== undefined) updateData.total_actual = updates.totalActual;

    const { data, error } = await supabase
      .from('budget_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return convertToBudgetItem(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('budget_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// METRICS SERVICE
// ============================================

export const metricsService = {
  async getByProject(projectId: string): Promise<ProjectMetrics | null> {
    const { data, error } = await supabase
      .from('project_metrics')
      .select('*')
      .eq('project_id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data ? convertToProjectMetrics(data) : null;
  },

  async recalculate(projectId: string): Promise<void> {
    const { error } = await supabase.rpc('calculate_project_metrics', {
      p_project_id: projectId,
    });

    if (error) throw error;
  },
};

// ============================================
// CONTRACT SERVICE
// ============================================

export const contractService = {
  async getAll(): Promise<SupabaseContract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('no', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<SupabaseContract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async getByStatus(status: 'aktif' | 'selesai' | 'bermasalah'): Promise<SupabaseContract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('status', status)
      .order('no', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async create(contract: Partial<SupabaseContract>): Promise<SupabaseContract> {
    const { data, error } = await supabase
      .from('contracts')
      .insert(contract)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<SupabaseContract>): Promise<SupabaseContract> {
    const { data, error } = await supabase
      .from('contracts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// INVOICE SERVICE
// ============================================

export const invoiceService = {
  async getAll(): Promise<SupabaseInvoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('tanggal_tagihan', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByContract(contractId: string): Promise<SupabaseInvoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('contract_id', contractId)
      .order('tanggal_tagihan', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByStatus(status: 'diajukan' | 'diverifikasi' | 'dibayar' | 'ditolak'): Promise<SupabaseInvoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('status', status)
      .order('tanggal_tagihan', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(invoice: Partial<SupabaseInvoice>): Promise<SupabaseInvoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<SupabaseInvoice>): Promise<SupabaseInvoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

// ============================================
// DASHBOARD SERVICE
// ============================================

export const dashboardService = {
  async getSummary(period?: string, unit?: string): Promise<DashboardSummary | null> {
    let query = supabase.from('dashboard_summary').select('*');
    
    if (period) {
      query = query.eq('period', period);
    }
    
    if (unit) {
      query = query.eq('unit', unit);
    } else {
      query = query.is('unit', null);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  // Get summary stats directly calculated from projects
  async getProjectStats(): Promise<{
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
  }> {
    const { data, error } = await supabase
      .from('projects')
      .select('status, health_status');

    if (error) throw error;

    const projects = data || [];
    
    return {
      total: projects.length,
      draft: projects.filter(p => p.status === 'draft').length,
      initiated: projects.filter(p => p.status === 'initiated').length,
      planned: projects.filter(p => p.status === 'planned').length,
      onProgress: projects.filter(p => p.status === 'on_progress').length,
      onHold: projects.filter(p => p.status === 'on_hold').length,
      completed: projects.filter(p => p.status === 'completed').length,
      cancelled: projects.filter(p => p.status === 'cancelled').length,
      healthy: projects.filter(p => p.health_status === 'green').length,
      warning: projects.filter(p => p.health_status === 'yellow').length,
      critical: projects.filter(p => p.health_status === 'red').length,
    };
  },

  // Get budget summary
  async getBudgetSummary(): Promise<{
    totalBudget: number;
    totalAbsorbed: number;
    totalRemaining: number;
    absorptionRate: number;
  }> {
    const { data, error } = await supabase
      .from('budget_items')
      .select('total_planned, total_actual');

    if (error) throw error;

    const items = data || [];
    const totalBudget = items.reduce((sum, item) => sum + (item.total_planned || 0), 0);
    const totalAbsorbed = items.reduce((sum, item) => sum + (item.total_actual || 0), 0);
    
    return {
      totalBudget,
      totalAbsorbed,
      totalRemaining: totalBudget - totalAbsorbed,
      absorptionRate: totalBudget > 0 ? (totalAbsorbed / totalBudget) * 100 : 0,
    };
  },

  // Get contract summary
  async getContractSummary(): Promise<{
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    problematicContracts: number;
    totalContractValue: number;
    totalPaidValue: number;
  }> {
    const { data, error } = await supabase
      .from('contracts')
      .select('status, nilai_kontrak, total_tagihan_dibayar');

    if (error) throw error;

    const contracts = data || [];
    
    return {
      totalContracts: contracts.length,
      activeContracts: contracts.filter(c => c.status === 'aktif').length,
      completedContracts: contracts.filter(c => c.status === 'selesai').length,
      problematicContracts: contracts.filter(c => c.status === 'bermasalah').length,
      totalContractValue: contracts.reduce((sum, c) => sum + (c.nilai_kontrak || 0), 0),
      totalPaidValue: contracts.reduce((sum, c) => sum + (c.total_tagihan_dibayar || 0), 0),
    };
  },

  // Get progress data for chart
  async getProgressData(): Promise<Array<{ month: string; rencana: number; realisasi: number }>> {
    // Get all project metrics
    const { data, error } = await supabase
      .from('project_metrics')
      .select('planned_progress, actual_progress');

    if (error) throw error;

    const metrics = data || [];
    const avgPlanned = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + (m.planned_progress || 0), 0) / metrics.length
      : 0;
    const avgActual = metrics.length > 0
      ? metrics.reduce((sum, m) => sum + (m.actual_progress || 0), 0) / metrics.length
      : 0;

    // Generate monthly data based on current progress
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const currentMonth = new Date().getMonth();
    
    return months.slice(0, currentMonth + 1).map((month, index) => {
      const factor = (index + 1) / (currentMonth + 1);
      return {
        month,
        rencana: Math.round(avgPlanned * factor),
        realisasi: Math.round(avgActual * factor),
      };
    });
  },

  // Get problematic projects
  async getProblematicProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .in('health_status', ['yellow', 'red'])
      .order('health_status', { ascending: true })
      .limit(10);

    if (error) throw error;
    return (data || []).map(convertToProject);
  },
};

// ============================================
// FILTER OPTIONS (from database)
// ============================================

export const filterOptionsService = {
  async getUnits(): Promise<string[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('unit')
      .order('unit');

    if (error) throw error;
    const units = [...new Set((data || []).map(d => d.unit))];
    return units;
  },

  async getLocations(): Promise<string[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('location')
      .order('location');

    if (error) throw error;
    const locations = [...new Set((data || []).map(d => d.location))];
    return locations;
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('category')
      .order('category');

    if (error) throw error;
    const categories = [...new Set((data || []).map(d => d.category))];
    return categories;
  },
};

export default {
  project: projectService,
  milestone: milestoneService,
  budget: budgetService,
  metrics: metricsService,
  contract: contractService,
  invoice: invoiceService,
  dashboard: dashboardService,
  filterOptions: filterOptionsService,
};
