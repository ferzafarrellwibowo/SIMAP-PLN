-- ============================================
-- FULL SCHEMA SQL UNTUK SUPABASE
-- Sistem Monitoring Kontrak & Proyek PLN
-- Migrasi dari Mock Data ke Cloud
-- ============================================

-- Aktifkan ekstensi UUID jika belum aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: users (PENGGUNA)
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'pic', 'keuangan', 'manajer')),
  unit TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLE: projects (PROYEK)
-- ============================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  unit TEXT NOT NULL,
  location TEXT NOT NULL,
  
  -- Assignment
  pic_id UUID REFERENCES public.users(id),
  pic_name TEXT,
  
  -- Lifecycle
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'initiated', 'planned', 'on_progress', 'on_hold', 'completed', 'cancelled')),
  health_status TEXT NOT NULL DEFAULT 'green' CHECK (health_status IN ('green', 'yellow', 'red')),
  
  -- Dates
  target_start_date DATE NOT NULL,
  target_end_date DATE NOT NULL,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- Budget Estimation (initial)
  estimated_budget BIGINT NOT NULL DEFAULT 0,
  
  -- Approval
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES public.users(id),
  approval_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps & Audit
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES public.users(id)
);

-- Indexes untuk projects
CREATE INDEX IF NOT EXISTS idx_projects_code ON public.projects(code);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_health_status ON public.projects(health_status);
CREATE INDEX IF NOT EXISTS idx_projects_unit ON public.projects(unit);
CREATE INDEX IF NOT EXISTS idx_projects_pic_id ON public.projects(pic_id);

-- ============================================
-- TABLE: milestones (TAHAPAN PROYEK)
-- ============================================

CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  
  -- Weight for progress calculation (total must be 100%)
  weight DECIMAL(5, 2) NOT NULL DEFAULT 0,
  
  -- Planned dates
  planned_start_date DATE NOT NULL,
  planned_end_date DATE NOT NULL,
  
  -- Actual dates (filled during execution)
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- Deliverables (stored as JSON array)
  deliverables JSONB DEFAULT '[]',
  
  -- Progress (0-100)
  progress_planned DECIMAL(5, 2) DEFAULT 0,
  progress_actual DECIMAL(5, 2) DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'delayed')),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk milestones
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON public.milestones(status);

-- ============================================
-- TABLE: budget_items (ITEM ANGGARAN)
-- ============================================

CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('material', 'jasa', 'operasional', 'overhead', 'lainnya')),
  name TEXT NOT NULL,
  description TEXT,
  
  -- Planned
  quantity INTEGER NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  unit_price BIGINT NOT NULL DEFAULT 0,
  total_planned BIGINT NOT NULL DEFAULT 0,
  
  -- Actual (accumulated from realizations)
  total_actual BIGINT DEFAULT 0,
  
  -- Monthly allocation (optional, stored as JSON)
  monthly_allocation JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk budget_items
CREATE INDEX IF NOT EXISTS idx_budget_items_project_id ON public.budget_items(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_category ON public.budget_items(category);

-- ============================================
-- TABLE: progress_entries (ENTRI PROGRES)
-- ============================================

CREATE TABLE IF NOT EXISTS public.progress_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  milestone_id UUID NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  
  -- Progress data
  progress_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  
  -- Documentation
  notes TEXT,
  issues TEXT,
  photos JSONB DEFAULT '[]',
  
  -- Audit
  entered_by UUID REFERENCES public.users(id),
  entered_by_name TEXT,
  entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk progress_entries
CREATE INDEX IF NOT EXISTS idx_progress_entries_project_id ON public.progress_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_milestone_id ON public.progress_entries(milestone_id);

-- ============================================
-- TABLE: cost_entries (ENTRI BIAYA)
-- ============================================

CREATE TABLE IF NOT EXISTS public.cost_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  budget_item_id UUID NOT NULL REFERENCES public.budget_items(id) ON DELETE CASCADE,
  
  -- Cost data
  amount BIGINT NOT NULL DEFAULT 0,
  transaction_date DATE NOT NULL,
  reference_number TEXT,
  description TEXT,
  
  -- Audit
  entered_by UUID REFERENCES public.users(id),
  entered_by_name TEXT,
  entered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk cost_entries
CREATE INDEX IF NOT EXISTS idx_cost_entries_project_id ON public.cost_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_cost_entries_budget_item_id ON public.cost_entries(budget_item_id);

-- ============================================
-- TABLE: project_metrics (METRIK PROYEK - untuk caching)
-- ============================================

CREATE TABLE IF NOT EXISTS public.project_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Progress metrics
  planned_progress DECIMAL(5, 2) DEFAULT 0,
  actual_progress DECIMAL(5, 2) DEFAULT 0,
  schedule_variance DECIMAL(5, 2) DEFAULT 0,
  
  -- Budget metrics
  planned_budget BIGINT DEFAULT 0,
  actual_cost BIGINT DEFAULT 0,
  remaining_budget BIGINT DEFAULT 0,
  budget_variance BIGINT DEFAULT 0,
  absorption_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Earned Value metrics
  earned_value BIGINT DEFAULT 0,
  planned_value BIGINT DEFAULT 0,
  
  -- Performance indices
  spi_value DECIMAL(5, 2) DEFAULT 1,
  cpi_value DECIMAL(5, 2) DEFAULT 1,
  
  -- Health status (calculated)
  health_status TEXT DEFAULT 'green' CHECK (health_status IN ('green', 'yellow', 'red')),
  health_reason TEXT
);

-- Indexes untuk project_metrics
CREATE INDEX IF NOT EXISTS idx_project_metrics_project_id ON public.project_metrics(project_id);

-- ============================================
-- TABLE: alerts (NOTIFIKASI)
-- ============================================

CREATE TABLE IF NOT EXISTS public.alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT,
  type TEXT NOT NULL CHECK (type IN ('progress_behind', 'budget_overrun', 'no_update', 'deadline_approaching', 'status_change', 'approval_needed')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  read_by UUID REFERENCES public.users(id),
  target_roles JSONB DEFAULT '[]'
);

-- Indexes untuk alerts
CREATE INDEX IF NOT EXISTS idx_alerts_project_id ON public.alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON public.alerts(type);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON public.alerts(severity);

-- ============================================
-- TABLE: approval_requests (PERMINTAAN PERSETUJUAN)
-- ============================================

CREATE TABLE IF NOT EXISTS public.approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('project_initiation', 'project_planning', 'project_closing', 'change_request')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  requested_by UUID REFERENCES public.users(id),
  requested_by_name TEXT,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_by_name TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  notes TEXT,
  rejection_reason TEXT
);

-- Indexes untuk approval_requests
CREATE INDEX IF NOT EXISTS idx_approval_requests_project_id ON public.approval_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON public.approval_requests(status);

-- ============================================
-- TABLE: contracts (KONTRAK) - sudah ada sebelumnya
-- ============================================

CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  no INTEGER NOT NULL,
  uraian_kegiatan TEXT NOT NULL,
  no_perjanjian TEXT NOT NULL,
  tanggal_perjanjian DATE NOT NULL,
  tanggal_berakhir DATE NOT NULL,
  judul_pekerjaan TEXT NOT NULL,
  nilai_kontrak BIGINT NOT NULL,
  vendor TEXT NOT NULL,
  nilai_tagihan_kontrak_pusat BIGINT DEFAULT 0,
  nilai_tagihan_unit_induk BIGINT DEFAULT 0,
  nilai_berita_acara BIGINT,
  no_berita_acara TEXT,
  tanggal_berita_acara DATE,
  no_berita_acara_sk_relasi TEXT,
  tanggal_arsip DATE,
  no_xps TEXT,
  tanggal_xps DATE,
  kategori TEXT NOT NULL CHECK (kategori IN ('investasi', 'pemeliharaan', 'administrasi')),
  jenis_anggaran TEXT NOT NULL CHECK (jenis_anggaran IN ('AI', 'AO')),
  unit TEXT NOT NULL,
  unit_sektor_k TEXT,
  no_sk_we TEXT,
  pos_angg TEXT,
  no_sku_skko TEXT,
  request_tanggal_se_relasi DATE,
  no_se TEXT,
  no_po TEXT,
  submission_id TEXT,
  jenis_pekerjaan TEXT,
  beban_tahun TEXT,
  batas_pagu_terbayar BIGINT,
  unit_terbayar TEXT,
  konfirmasi_non_rutin TEXT,
  bidang TEXT,
  pic_id TEXT,
  pic_name TEXT,
  entry_by TEXT,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'selesai', 'bermasalah')),
  total_tagihan_dibayar BIGINT DEFAULT 0,
  sisa_anggaran BIGINT DEFAULT 0,
  persentase_realisasi DECIMAL(5, 2) DEFAULT 0,
  old_flag TEXT,
  click_cb BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by TEXT,
  keterangan TEXT,
  dokumen_kontrak TEXT
);

-- Indexes untuk contracts
CREATE INDEX IF NOT EXISTS idx_contracts_no_perjanjian ON public.contracts(no_perjanjian);
CREATE INDEX IF NOT EXISTS idx_contracts_kategori ON public.contracts(kategori);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_unit ON public.contracts(unit);

-- ============================================
-- TABLE: invoices (TAGIHAN) - sudah ada sebelumnya
-- ============================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
  no_perjanjian TEXT NOT NULL,
  nomor_tagihan TEXT NOT NULL,
  tanggal_tagihan DATE NOT NULL,
  nilai_tagihan BIGINT NOT NULL,
  no_berita_acara TEXT,
  tanggal_berita_acara DATE,
  tanggal_arsip DATE,
  no_xps TEXT,
  tanggal_xps DATE,
  status TEXT NOT NULL DEFAULT 'diajukan' CHECK (status IN ('diajukan', 'diverifikasi', 'dibayar', 'ditolak')),
  tanggal_diajukan TIMESTAMP WITH TIME ZONE NOT NULL,
  tanggal_diverifikasi TIMESTAMP WITH TIME ZONE,
  tanggal_dibayar TIMESTAMP WITH TIME ZONE,
  tanggal_ditolak TIMESTAMP WITH TIME ZONE,
  keterangan TEXT,
  alasan_penolakan TEXT,
  diajukan_oleh TEXT NOT NULL,
  diajukan_oleh_name TEXT NOT NULL,
  diverifikasi_oleh TEXT,
  diverifikasi_oleh_name TEXT,
  dibayar_oleh TEXT,
  dibayar_oleh_name TEXT,
  dokumen_tagihan TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes untuk invoices
CREATE INDEX IF NOT EXISTS idx_invoices_contract_id ON public.invoices(contract_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- ============================================
-- TABLE: dashboard_summary (RINGKASAN DASHBOARD - untuk caching)
-- ============================================

CREATE TABLE IF NOT EXISTS public.dashboard_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  period TEXT NOT NULL, -- e.g., '2025-01', '2025-Q1', '2025'
  unit TEXT,
  
  -- Project counts
  total_projects INTEGER DEFAULT 0,
  draft_projects INTEGER DEFAULT 0,
  initiated_projects INTEGER DEFAULT 0,
  planned_projects INTEGER DEFAULT 0,
  on_progress_projects INTEGER DEFAULT 0,
  on_hold_projects INTEGER DEFAULT 0,
  completed_projects INTEGER DEFAULT 0,
  cancelled_projects INTEGER DEFAULT 0,
  
  -- Health counts
  healthy_projects INTEGER DEFAULT 0,
  warning_projects INTEGER DEFAULT 0,
  critical_projects INTEGER DEFAULT 0,
  
  -- Budget summary
  total_budget BIGINT DEFAULT 0,
  total_absorbed BIGINT DEFAULT 0,
  total_remaining BIGINT DEFAULT 0,
  absorption_rate DECIMAL(5, 2) DEFAULT 0,
  
  -- Progress summary
  avg_planned_progress DECIMAL(5, 2) DEFAULT 0,
  avg_actual_progress DECIMAL(5, 2) DEFAULT 0,
  
  -- Contract summary
  total_contracts INTEGER DEFAULT 0,
  active_contracts INTEGER DEFAULT 0,
  completed_contracts INTEGER DEFAULT 0,
  problematic_contracts INTEGER DEFAULT 0,
  
  -- Contract values
  total_contract_value BIGINT DEFAULT 0,
  total_paid_value BIGINT DEFAULT 0,
  
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(period, unit)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_summary ENABLE ROW LEVEL SECURITY;

-- Policies untuk read access (semua user bisa baca)
CREATE POLICY "Enable read for all" ON public.users FOR SELECT USING (TRUE);
CREATE POLICY "Enable read for all" ON public.projects FOR SELECT USING (TRUE);
CREATE POLICY "Enable read for all" ON public.milestones FOR SELECT USING (TRUE);
CREATE POLICY "Enable read for all" ON public.budget_items FOR SELECT USING (TRUE);
CREATE POLICY "Enable read for all" ON public.progress_entries FOR SELECT USING (TRUE);
CREATE POLICY "Enable read for all" ON public.cost_entries FOR SELECT USING (TRUE);
CREATE POLICY "Enable read for all" ON public.project_metrics FOR SELECT USING (TRUE);
CREATE POLICY "Enable read for all" ON public.alerts FOR SELECT USING (TRUE);
CREATE POLICY "Enable read for all" ON public.approval_requests FOR SELECT USING (TRUE);
CREATE POLICY "Enable read for all" ON public.contracts FOR SELECT USING (TRUE);
CREATE POLICY "Enable read for all" ON public.invoices FOR SELECT USING (TRUE);
CREATE POLICY "Enable read for all" ON public.dashboard_summary FOR SELECT USING (TRUE);

-- Policies untuk write access (authenticated users)
CREATE POLICY "Enable write for authenticated" ON public.users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable write for authenticated" ON public.projects FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable write for authenticated" ON public.milestones FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable write for authenticated" ON public.budget_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable write for authenticated" ON public.progress_entries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable write for authenticated" ON public.cost_entries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable write for authenticated" ON public.project_metrics FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable write for authenticated" ON public.alerts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable write for authenticated" ON public.approval_requests FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable write for authenticated" ON public.contracts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable write for authenticated" ON public.invoices FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Enable write for authenticated" ON public.dashboard_summary FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers untuk updated_at
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_milestones_updated_at BEFORE UPDATE ON public.milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_budget_items_updated_at BEFORE UPDATE ON public.budget_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function untuk menghitung metrics proyek
CREATE OR REPLACE FUNCTION calculate_project_metrics(p_project_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_weight DECIMAL;
  v_actual_progress DECIMAL;
  v_planned_progress DECIMAL;
  v_planned_budget BIGINT;
  v_actual_cost BIGINT;
  v_earned_value BIGINT;
  v_planned_value BIGINT;
  v_spi DECIMAL;
  v_cpi DECIMAL;
  v_health TEXT;
  v_health_reason TEXT;
BEGIN
  -- Calculate progress from milestones
  SELECT 
    COALESCE(SUM(weight), 0),
    COALESCE(SUM(progress_actual * weight / 100), 0),
    COALESCE(SUM(progress_planned * weight / 100), 0)
  INTO v_total_weight, v_actual_progress, v_planned_progress
  FROM public.milestones
  WHERE project_id = p_project_id;

  -- Calculate budget from budget_items
  SELECT 
    COALESCE(SUM(total_planned), 0),
    COALESCE(SUM(total_actual), 0)
  INTO v_planned_budget, v_actual_cost
  FROM public.budget_items
  WHERE project_id = p_project_id;

  -- Calculate Earned Value
  v_earned_value := (v_actual_progress / 100) * v_planned_budget;
  v_planned_value := (v_planned_progress / 100) * v_planned_budget;

  -- Calculate performance indices
  v_spi := CASE WHEN v_planned_value > 0 THEN v_earned_value::DECIMAL / v_planned_value ELSE 1 END;
  v_cpi := CASE WHEN v_actual_cost > 0 THEN v_earned_value::DECIMAL / v_actual_cost ELSE 1 END;

  -- Determine health status
  IF v_spi < 0.7 OR v_cpi < 0.7 THEN
    v_health := 'red';
    v_health_reason := CASE 
      WHEN v_spi < 0.7 THEN 'Progress sangat terlambat dari jadwal'
      ELSE 'Biaya jauh melebihi nilai hasil'
    END;
  ELSIF v_spi < 0.9 OR v_cpi < 0.9 THEN
    v_health := 'yellow';
    v_health_reason := CASE 
      WHEN v_spi < 0.9 THEN 'Progress sedikit terlambat dari jadwal'
      ELSE 'Biaya sedikit melebihi rencana'
    END;
  ELSE
    v_health := 'green';
    v_health_reason := 'Proyek berjalan sesuai rencana';
  END IF;

  -- Upsert metrics
  INSERT INTO public.project_metrics (
    project_id, calculated_at,
    planned_progress, actual_progress, schedule_variance,
    planned_budget, actual_cost, remaining_budget, budget_variance, absorption_rate,
    earned_value, planned_value,
    spi_value, cpi_value,
    health_status, health_reason
  ) VALUES (
    p_project_id, NOW(),
    v_planned_progress, v_actual_progress, v_actual_progress - v_planned_progress,
    v_planned_budget, v_actual_cost, v_planned_budget - v_actual_cost, v_planned_budget - v_actual_cost,
    CASE WHEN v_planned_budget > 0 THEN (v_actual_cost::DECIMAL / v_planned_budget) * 100 ELSE 0 END,
    v_earned_value, v_planned_value,
    v_spi, v_cpi,
    v_health, v_health_reason
  )
  ON CONFLICT (project_id) DO UPDATE SET
    calculated_at = NOW(),
    planned_progress = EXCLUDED.planned_progress,
    actual_progress = EXCLUDED.actual_progress,
    schedule_variance = EXCLUDED.schedule_variance,
    planned_budget = EXCLUDED.planned_budget,
    actual_cost = EXCLUDED.actual_cost,
    remaining_budget = EXCLUDED.remaining_budget,
    budget_variance = EXCLUDED.budget_variance,
    absorption_rate = EXCLUDED.absorption_rate,
    earned_value = EXCLUDED.earned_value,
    planned_value = EXCLUDED.planned_value,
    spi_value = EXCLUDED.spi_value,
    cpi_value = EXCLUDED.cpi_value,
    health_status = EXCLUDED.health_status,
    health_reason = EXCLUDED.health_reason;

  -- Update project health status
  UPDATE public.projects
  SET health_status = v_health, updated_at = NOW()
  WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql;

-- Function untuk update invoice totals on contract
CREATE OR REPLACE FUNCTION update_contract_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'dibayar' AND (OLD.status IS NULL OR OLD.status != 'dibayar') THEN
    UPDATE public.contracts
    SET 
      total_tagihan_dibayar = COALESCE(total_tagihan_dibayar, 0) + NEW.nilai_tagihan,
      sisa_anggaran = nilai_kontrak - (COALESCE(total_tagihan_dibayar, 0) + NEW.nilai_tagihan),
      persentase_realisasi = ((COALESCE(total_tagihan_dibayar, 0) + NEW.nilai_tagihan)::DECIMAL / NULLIF(nilai_kontrak, 0)) * 100,
      updated_at = NOW()
    WHERE id = NEW.contract_id;
  END IF;

  IF OLD.status = 'dibayar' AND NEW.status != 'dibayar' THEN
    UPDATE public.contracts
    SET 
      total_tagihan_dibayar = GREATEST(COALESCE(total_tagihan_dibayar, 0) - NEW.nilai_tagihan, 0),
      sisa_anggaran = nilai_kontrak - GREATEST(COALESCE(total_tagihan_dibayar, 0) - NEW.nilai_tagihan, 0),
      persentase_realisasi = (GREATEST(COALESCE(total_tagihan_dibayar, 0) - NEW.nilai_tagihan, 0)::DECIMAL / NULLIF(nilai_kontrak, 0)) * 100,
      updated_at = NOW()
    WHERE id = NEW.contract_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contract_totals
AFTER INSERT OR UPDATE OF status ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION update_contract_totals();

-- ============================================
-- VIEWS UNTUK DASHBOARD
-- ============================================

-- View untuk ringkasan proyek
CREATE OR REPLACE VIEW public.v_project_summary AS
SELECT 
  p.id,
  p.code,
  p.name,
  p.category,
  p.unit,
  p.location,
  p.pic_name,
  p.status,
  p.health_status,
  p.target_start_date,
  p.target_end_date,
  p.estimated_budget,
  COALESCE(pm.actual_progress, 0) as actual_progress,
  COALESCE(pm.planned_progress, 0) as planned_progress,
  COALESCE(pm.actual_cost, 0) as actual_cost,
  COALESCE(pm.absorption_rate, 0) as absorption_rate,
  COALESCE(pm.spi_value, 1) as spi_value,
  COALESCE(pm.cpi_value, 1) as cpi_value,
  pm.health_reason
FROM public.projects p
LEFT JOIN public.project_metrics pm ON p.id = pm.project_id;

-- View untuk ringkasan kontrak
CREATE OR REPLACE VIEW public.v_contract_summary AS
SELECT 
  c.id,
  c.no_perjanjian,
  c.judul_pekerjaan,
  c.vendor,
  c.unit,
  c.kategori,
  c.status,
  c.nilai_kontrak,
  c.total_tagihan_dibayar,
  c.sisa_anggaran,
  c.persentase_realisasi,
  c.tanggal_perjanjian,
  c.tanggal_berakhir,
  (SELECT COUNT(*) FROM public.invoices WHERE contract_id = c.id) as total_invoices,
  (SELECT COUNT(*) FROM public.invoices WHERE contract_id = c.id AND status = 'dibayar') as paid_invoices
FROM public.contracts c;

-- ============================================
-- SELESAI
-- ============================================
