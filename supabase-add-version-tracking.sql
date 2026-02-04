-- SQL Migration: Add version tracking columns for contract versioning feature
-- This allows tracking of contract updates while maintaining history
-- Run this migration on your Supabase database

-- Add version tracking columns to contract_investment table
ALTER TABLE contract_investment
ADD COLUMN IF NOT EXISTS previous_contract_id UUID REFERENCES contract_investment(id),
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

-- Add version tracking columns to contract_maintenance table  
ALTER TABLE contract_maintenance
ADD COLUMN IF NOT EXISTS previous_contract_id UUID REFERENCES contract_maintenance(id),
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

-- Add version tracking columns to contract_administration table
ALTER TABLE contract_administration
ADD COLUMN IF NOT EXISTS previous_contract_id UUID REFERENCES contract_administration(id),
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1;

-- Create indexes for faster history queries
CREATE INDEX IF NOT EXISTS idx_investment_previous_contract ON contract_investment(previous_contract_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_previous_contract ON contract_maintenance(previous_contract_id);
CREATE INDEX IF NOT EXISTS idx_administration_previous_contract ON contract_administration(previous_contract_id);

-- Optional: Create a view to easily get contract versions
-- This view shows all contracts with their version history
CREATE OR REPLACE VIEW contract_version_history AS
SELECT 
  id,
  no_perjanjian,
  previous_contract_id,
  version_number,
  'investasi' as kategori,
  created_at
FROM contract_investment
WHERE previous_contract_id IS NOT NULL OR version_number > 1
UNION ALL
SELECT 
  id,
  no_perjanjian,
  previous_contract_id,
  version_number,
  'pemeliharaan' as kategori,
  created_at
FROM contract_maintenance
WHERE previous_contract_id IS NOT NULL OR version_number > 1
UNION ALL
SELECT 
  id,
  no_perjanjian,
  previous_contract_id,
  version_number,
  'administrasi' as kategori,
  created_at
FROM contract_administration
WHERE previous_contract_id IS NOT NULL OR version_number > 1
ORDER BY created_at DESC;

-- Comment: After running this migration, all new contracts will have version_number = 1
-- When a contract is updated using the "Update Kontrak" feature:
-- 1. A new contract record is created with the updated data
-- 2. The new contract's previous_contract_id points to the old contract's id
-- 3. The new contract's version_number is incremented (old version + 1)
-- 4. The old contract remains unchanged (immutable history)
