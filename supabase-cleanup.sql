-- ============================================
-- DROP ALL EXISTING OBJECTS
-- Jalankan ini PERTAMA sebelum menjalankan supabase-full-schema.sql
-- ============================================

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trigger_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS trigger_milestones_updated_at ON public.milestones;
DROP TRIGGER IF EXISTS trigger_budget_items_updated_at ON public.budget_items;
DROP TRIGGER IF EXISTS trigger_contracts_updated_at ON public.contracts;
DROP TRIGGER IF EXISTS trigger_invoices_updated_at ON public.invoices;
DROP TRIGGER IF EXISTS trigger_update_contract_totals ON public.invoices;

-- Drop views
DROP VIEW IF EXISTS public.v_project_summary;
DROP VIEW IF EXISTS public.v_contract_summary;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS calculate_project_metrics(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_contract_totals() CASCADE;

-- Drop tables (order matters due to foreign keys)
DROP TABLE IF EXISTS public.dashboard_summary CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.contracts CASCADE;
DROP TABLE IF EXISTS public.approval_requests CASCADE;
DROP TABLE IF EXISTS public.alerts CASCADE;
DROP TABLE IF EXISTS public.project_metrics CASCADE;
DROP TABLE IF EXISTS public.cost_entries CASCADE;
DROP TABLE IF EXISTS public.progress_entries CASCADE;
DROP TABLE IF EXISTS public.budget_items CASCADE;
DROP TABLE IF EXISTS public.milestones CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Confirm cleanup
SELECT 'All tables, views, functions, and triggers have been dropped successfully!' as status;
