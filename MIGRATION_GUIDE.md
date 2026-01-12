# Panduan Migrasi Data Mock ke Supabase

## Overview

Panduan ini menjelaskan cara memigrasikan semua data mock lokal ke Supabase cloud database.

## Langkah-langkah Migrasi

### 1. Setup Supabase Project

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Buat project baru atau gunakan project existing
3. Catat kredensial berikut dari Settings > API:
   - Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Anon/public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### 2. Konfigurasi Environment Variables

Buat atau update file `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Jalankan Schema SQL

1. Buka Supabase Dashboard > SQL Editor
2. Copy dan paste isi file `supabase-full-schema.sql`
3. Klik "Run" untuk membuat semua tabel

**Tabel yang akan dibuat:**
- `users` - Data pengguna sistem
- `projects` - Data proyek
- `milestones` - Tahapan proyek
- `budget_items` - Item anggaran proyek
- `progress_entries` - Entri progres
- `cost_entries` - Entri biaya
- `project_metrics` - Metrik performa proyek (cached)
- `alerts` - Notifikasi
- `approval_requests` - Permintaan persetujuan
- `contracts` - Data kontrak
- `invoices` - Data tagihan
- `dashboard_summary` - Ringkasan dashboard (cached)

### 4. Insert Seed Data

1. Buka Supabase Dashboard > SQL Editor
2. Copy dan paste isi file `supabase-seed-data.sql`
3. Klik "Run" untuk memasukkan semua data

**Data yang akan dimasukkan:**
- 5 Users (admin, pic, keuangan, manajer)
- 15 Projects dengan berbagai status:
  - 8 On Progress
  - 2 Planned
  - 2 Initiated
  - 1 Draft
  - 1 On Hold
  - 1 Completed
- 75 Milestones (5 per project aktif)
- 90 Budget Items (6 per project aktif)
- 8 Contracts
- 12 Invoices
- Project Metrics (auto-calculated)
- Dashboard Summary

### 5. Verifikasi Data

Jalankan query ini untuk memverifikasi:

```sql
SELECT 'Users' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Projects', COUNT(*) FROM public.projects
UNION ALL
SELECT 'Milestones', COUNT(*) FROM public.milestones
UNION ALL
SELECT 'Budget Items', COUNT(*) FROM public.budget_items
UNION ALL
SELECT 'Contracts', COUNT(*) FROM public.contracts
UNION ALL
SELECT 'Invoices', COUNT(*) FROM public.invoices
UNION ALL
SELECT 'Project Metrics', COUNT(*) FROM public.project_metrics
UNION ALL
SELECT 'Dashboard Summary', COUNT(*) FROM public.dashboard_summary;
```

Expected output:
| table_name | count |
|------------|-------|
| Users | 5 |
| Projects | 15 |
| Milestones | ~55 |
| Budget Items | ~66 |
| Contracts | 8 |
| Invoices | 12 |
| Project Metrics | ~11 |
| Dashboard Summary | 3 |

## Menggunakan Data dari Supabase

### Menggunakan Hooks (Recommended)

```tsx
import { 
  useProjects, 
  useProjectStats, 
  useBudgetSummary,
  useContracts 
} from '@/lib/supabase-hooks';

function Dashboard() {
  const { data: projects, loading, error } = useProjects();
  const { data: stats } = useProjectStats();
  const { data: budget } = useBudgetSummary();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Total Projects: {stats?.total}</h1>
      <h2>Total Budget: {budget?.totalBudget}</h2>
      {/* ... */}
    </div>
  );
}
```

### Menggunakan Service Langsung

```tsx
import { projectService, dashboardService } from '@/lib/supabase-service';

// Di dalam async function atau useEffect
const projects = await projectService.getAll();
const stats = await dashboardService.getProjectStats();
const budget = await dashboardService.getBudgetSummary();
```

## Data Summary

### Total Anggaran Proyek
- **Total Anggaran (Estimated)**: Rp 690.000.000.000
- **Total Terserap**: Rp ~276.000.000.000 (40%)
- **Total Sisa**: Rp ~414.000.000.000

### Status Proyek
| Status | Jumlah |
|--------|--------|
| Draft | 1 |
| Initiated | 2 |
| Planned | 2 |
| On Progress | 8 |
| On Hold | 1 |
| Completed | 1 |
| Cancelled | 0 |
| **Total** | **15** |

### Health Status
| Health | Jumlah |
|--------|--------|
| Green (Sehat) | 10 |
| Yellow (Perlu Perhatian) | 3 |
| Red (Kritis) | 2 |

### Kontrak
| Metric | Nilai |
|--------|-------|
| Total Kontrak | 8 |
| Kontrak Aktif | 6 |
| Kontrak Selesai | 1 |
| Kontrak Bermasalah | 1 |
| Total Nilai Kontrak | Rp 61.350.000.000 |
| Total Dibayar | Rp 16.910.000.000 |

## File-file Baru

1. **`supabase-full-schema.sql`** - Schema lengkap database
2. **`supabase-seed-data.sql`** - Data seed untuk migrasi
3. **`lib/supabase-service.ts`** - Service untuk akses Supabase
4. **`lib/supabase-hooks.ts`** - React hooks untuk data fetching

## Migrasi dari Mock Data

Untuk beralih dari mock data lokal ke Supabase:

### Sebelum (Mock Data)
```tsx
import { mockProjects, getSummaryStats } from '@/lib/data';
import { useProjectStore } from '@/lib/store';
```

### Sesudah (Supabase)
```tsx
import { useProjects, useProjectStats } from '@/lib/supabase-hooks';
// atau
import { projectService, dashboardService } from '@/lib/supabase-service';
```

## Real-time Updates (Optional)

Untuk mengaktifkan real-time updates dari Supabase:

```tsx
import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';

function useRealtimeProjects() {
  const { data, refetch } = useProjects();

  useEffect(() => {
    const channel = supabase
      .channel('projects-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' },
        () => refetch()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return data;
}
```

## Troubleshooting

### Error: Missing Supabase URL/Key
Pastikan file `.env.local` sudah dikonfigurasi dengan benar.

### Error: Permission Denied
Pastikan RLS policies sudah dikonfigurasi. Untuk development, bisa disable RLS sementara:
```sql
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
```

### Error: Foreign Key Violation
Pastikan data di-insert sesuai urutan:
1. Users
2. Projects
3. Milestones & Budget Items
4. Contracts
5. Invoices

## Kesimpulan

Setelah migrasi selesai:
- ✅ Semua data tersimpan di cloud (Supabase)
- ✅ Data dapat diakses dari mana saja
- ✅ Support untuk multiple users
- ✅ Real-time capabilities
- ✅ Automatic backups
- ✅ Row Level Security
