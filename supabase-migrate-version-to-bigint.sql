-- Migration SQL: convert version_number to BIGINT if the column exists
-- Safe: runs checks and reports notices; wrapped per-table to minimize risk.
-- IMPORTANT: Run this in Supabase SQL editor or via psql. BACKUP your data first.

-- Backup (optional) - uncomment to create table copies
-- CREATE TABLE backup_contract_investment AS TABLE contract_investment;
-- CREATE TABLE backup_contract_maintenance AS TABLE contract_maintenance;
-- CREATE TABLE backup_contract_administration AS TABLE contract_administration;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contract_investment' AND column_name = 'version_number'
  ) THEN
    BEGIN
      ALTER TABLE public.contract_investment
        ALTER COLUMN version_number TYPE bigint USING version_number::bigint;
      RAISE NOTICE 'Altered contract_investment.version_number to bigint';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not alter contract_investment.version_number: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Column contract_investment.version_number does not exist; skipping';
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contract_maintenance' AND column_name = 'version_number'
  ) THEN
    BEGIN
      ALTER TABLE public.contract_maintenance
        ALTER COLUMN version_number TYPE bigint USING version_number::bigint;
      RAISE NOTICE 'Altered contract_maintenance.version_number to bigint';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not alter contract_maintenance.version_number: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Column contract_maintenance.version_number does not exist; skipping';
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contract_administration' AND column_name = 'version_number'
  ) THEN
    BEGIN
      ALTER TABLE public.contract_administration
        ALTER COLUMN version_number TYPE bigint USING version_number::bigint;
      RAISE NOTICE 'Altered contract_administration.version_number to bigint';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not alter contract_administration.version_number: %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE 'Column contract_administration.version_number does not exist; skipping';
  END IF;
END
$$;

-- Create indexes for previous_contract_id if not exist (optional)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contract_investment' AND column_name = 'previous_contract_id'
  ) THEN
    BEGIN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_investment_previous_contract ON contract_investment(previous_contract_id)';
      RAISE NOTICE 'Ensured index idx_investment_previous_contract';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not create index for contract_investment.previous_contract_id: %', SQLERRM;
    END;
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contract_maintenance' AND column_name = 'previous_contract_id'
  ) THEN
    BEGIN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_maintenance_previous_contract ON contract_maintenance(previous_contract_id)';
      RAISE NOTICE 'Ensured index idx_maintenance_previous_contract';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not create index for contract_maintenance.previous_contract_id: %', SQLERRM;
    END;
  END IF;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'contract_administration' AND column_name = 'previous_contract_id'
  ) THEN
    BEGIN
      EXECUTE 'CREATE INDEX IF NOT EXISTS idx_administration_previous_contract ON contract_administration(previous_contract_id)';
      RAISE NOTICE 'Ensured index idx_administration_previous_contract';
    EXCEPTION WHEN others THEN
      RAISE NOTICE 'Could not create index for contract_administration.previous_contract_id: %', SQLERRM;
    END;
  END IF;
END
$$;

-- End of migration
