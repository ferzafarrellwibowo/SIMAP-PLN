-- Tambahkan fields baru di Tabel Contracts untuk Extend & Approvals
ALTER TABLE contracts
ADD COLUMN IF NOT EXISTS vendor_email TEXT,
ADD COLUMN IF NOT EXISTS contract_approval_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS contract_value_revised NUMERIC,
ADD COLUMN IF NOT EXISTS extension_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS extension_rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS extension_negotiated_date DATE,
ADD COLUMN IF NOT EXISTS progress_approval_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS progress_rejection_reason TEXT;

-- Tambahkan fields baru di Tabel Invoices
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

-- Update User Role untuk mengakomodasi Vendor
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS active_until DATE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS activation_token TEXT;
