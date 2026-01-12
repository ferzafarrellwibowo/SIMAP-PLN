// ============================================
// SUPABASE HOOKS - React Hooks untuk Data Fetching
// Menggantikan Mock Data dengan Real-time Cloud Data
// ============================================

"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  projectService,
  milestoneService,
  budgetService,
  metricsService,
  contractService,
  invoiceService,
  dashboardService,
  filterOptionsService,
  type SupabaseContract,
  type SupabaseInvoice,
  type DashboardSummary,
} from './supabase-service';
import type {
  Project,
  Milestone,
  BudgetItem,
  ProjectMetrics,
  ProjectLifecycleStatus,
  HealthStatus,
  DashboardFilters,
} from './types';

// ============================================
// Generic Hook State Type
// ============================================

interface UseQueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseQueryArrayState<T> {
  data: T[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// ============================================
// PROJECTS HOOKS
// ============================================

export function useProjects(): UseQueryArrayState<Project> {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projects = await projectService.getAll();
      setData(projects);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useProject(id: string): UseQueryState<Project> {
  const [data, setData] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const project = await projectService.getById(id);
      setData(project);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch project'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useFilteredProjects(filters: DashboardFilters): UseQueryArrayState<Project> {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projects = await projectService.getFiltered(filters);
      setData(projects);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch filtered projects'));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useProjectsByStatus(status: ProjectLifecycleStatus): UseQueryArrayState<Project> {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projects = await projectService.getByStatus(status);
      setData(projects);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects by status'));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================
// MILESTONES HOOKS
// ============================================

export function useMilestones(projectId: string): UseQueryArrayState<Milestone> {
  const [data, setData] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const milestones = await milestoneService.getByProject(projectId);
      setData(milestones);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch milestones'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================
// BUDGET HOOKS
// ============================================

export function useBudgetItems(projectId: string): UseQueryArrayState<BudgetItem> {
  const [data, setData] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const items = await budgetService.getByProject(projectId);
      setData(items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch budget items'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================
// METRICS HOOKS
// ============================================

export function useProjectMetrics(projectId: string): UseQueryState<ProjectMetrics> {
  const [data, setData] = useState<ProjectMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      setError(null);
      const metrics = await metricsService.getByProject(projectId);
      setData(metrics);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================
// CONTRACT HOOKS
// ============================================

export function useContracts(): UseQueryArrayState<SupabaseContract> {
  const [data, setData] = useState<SupabaseContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const contracts = await contractService.getAll();
      setData(contracts);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch contracts'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useContract(id: string): UseQueryState<SupabaseContract> {
  const [data, setData] = useState<SupabaseContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const contract = await contractService.getById(id);
      setData(contract);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch contract'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================
// INVOICE HOOKS
// ============================================

export function useInvoices(): UseQueryArrayState<SupabaseInvoice> {
  const [data, setData] = useState<SupabaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const invoices = await invoiceService.getAll();
      setData(invoices);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch invoices'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useInvoicesByContract(contractId: string): UseQueryArrayState<SupabaseInvoice> {
  const [data, setData] = useState<SupabaseInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!contractId) return;
    try {
      setLoading(true);
      setError(null);
      const invoices = await invoiceService.getByContract(contractId);
      setData(invoices);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch invoices'));
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================
// DASHBOARD HOOKS
// ============================================

export function useDashboardSummary(period?: string, unit?: string): UseQueryState<DashboardSummary> {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await dashboardService.getSummary(period, unit);
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch dashboard summary'));
    } finally {
      setLoading(false);
    }
  }, [period, unit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useProjectStats() {
  const [data, setData] = useState<{
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
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await dashboardService.getProjectStats();
      setData(stats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch project stats'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useBudgetSummary() {
  const [data, setData] = useState<{
    totalBudget: number;
    totalAbsorbed: number;
    totalRemaining: number;
    absorptionRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await dashboardService.getBudgetSummary();
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch budget summary'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useContractSummary() {
  const [data, setData] = useState<{
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    problematicContracts: number;
    totalContractValue: number;
    totalPaidValue: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await dashboardService.getContractSummary();
      setData(summary);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch contract summary'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useProgressData() {
  const [data, setData] = useState<Array<{ month: string; rencana: number; realisasi: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const progressData = await dashboardService.getProgressData();
      setData(progressData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch progress data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useProblematicProjects(): UseQueryArrayState<Project> {
  const [data, setData] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const projects = await dashboardService.getProblematicProjects();
      setData(projects);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch problematic projects'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// ============================================
// FILTER OPTIONS HOOKS
// ============================================

export function useFilterOptions() {
  const [units, setUnits] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [unitsData, locationsData, categoriesData] = await Promise.all([
        filterOptionsService.getUnits(),
        filterOptionsService.getLocations(),
        filterOptionsService.getCategories(),
      ]);
      setUnits(unitsData);
      setLocations(locationsData);
      setCategories(categoriesData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch filter options'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    units,
    locations,
    categories,
    loading,
    error,
    refetch: fetchData,
    // Formatted options for Select components
    unitOptions: [
      { value: 'all', label: 'Semua Unit' },
      ...units.map(u => ({ value: u, label: u })),
    ],
    locationOptions: [
      { value: 'all', label: 'Semua Lokasi' },
      ...locations.map(l => ({ value: l, label: l })),
    ],
    categoryOptions: [
      { value: 'all', label: 'Semua Kategori' },
      ...categories.map(c => ({ value: c, label: c })),
    ],
  };
}

// ============================================
// MUTATION HOOKS (Create, Update, Delete)
// ============================================

export function useProjectMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createProject = async (data: Partial<Project>): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);
      const project = await projectService.create(data);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create project'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProject = async (id: string, data: Partial<Project>): Promise<Project | null> => {
    try {
      setLoading(true);
      setError(null);
      const project = await projectService.update(id, data);
      return project;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update project'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await projectService.delete(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete project'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProject,
    updateProject,
    deleteProject,
    loading,
    error,
  };
}

export function useContractMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createContract = async (data: Partial<SupabaseContract>): Promise<SupabaseContract | null> => {
    try {
      setLoading(true);
      setError(null);
      const contract = await contractService.create(data);
      return contract;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create contract'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateContract = async (id: string, data: Partial<SupabaseContract>): Promise<SupabaseContract | null> => {
    try {
      setLoading(true);
      setError(null);
      const contract = await contractService.update(id, data);
      return contract;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update contract'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteContract = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await contractService.delete(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete contract'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createContract,
    updateContract,
    deleteContract,
    loading,
    error,
  };
}

export function useInvoiceMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createInvoice = async (data: Partial<SupabaseInvoice>): Promise<SupabaseInvoice | null> => {
    try {
      setLoading(true);
      setError(null);
      const invoice = await invoiceService.create(data);
      return invoice;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create invoice'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateInvoice = async (id: string, data: Partial<SupabaseInvoice>): Promise<SupabaseInvoice | null> => {
    try {
      setLoading(true);
      setError(null);
      const invoice = await invoiceService.update(id, data);
      return invoice;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update invoice'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await invoiceService.delete(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete invoice'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    loading,
    error,
  };
}
