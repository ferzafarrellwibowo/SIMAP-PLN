-- Migration: create projects table and RLS policies

create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  owner uuid references auth.users(id),
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table projects enable row level security;
-- Policies: drop if exist then create (Postgres doesn't support IF NOT EXISTS for CREATE POLICY)
drop policy if exists "Users can select own projects" on projects;
create policy "Users can select own projects"
  on projects for select
  using (owner = auth.uid());

drop policy if exists "Users can insert projects" on projects;
create policy "Users can insert projects"
  on projects for insert
  with check (owner = auth.uid());

drop policy if exists "Users can update own projects" on projects;
create policy "Users can update own projects"
  on projects for update
  using (owner = auth.uid())
  with check (owner = auth.uid());

drop policy if exists "Users can delete own projects" on projects;
create policy "Users can delete own projects"
  on projects for delete
  using (owner = auth.uid());
