-- Diagnostic SQL: show column types for contract tables
-- Run this in Supabase SQL editor or psql to identify column types and sizes

SELECT table_name, column_name, data_type, character_maximum_length, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('contract_investment','contract_maintenance','contract_administration')
ORDER BY table_name, ordinal_position;
