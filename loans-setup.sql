-- Loans Schema and RLS (run in Supabase SQL editor)

-- 1) Base tables
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  borrower_name TEXT NOT NULL,            -- Who gave you the loan or institution
  principal NUMERIC(14,2) NOT NULL CHECK (principal >= 0),
  interest_rate NUMERIC(7,4) DEFAULT 0 CHECK (interest_rate >= 0), -- as decimal (e.g., 0.1 for 10%)
  start_date DATE NOT NULL,
  due_date DATE NOT NULL,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'active',   -- active, completed, defaulted, cancelled
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add repayment_frequency if missing
ALTER TABLE loans ADD COLUMN IF NOT EXISTS repayment_frequency TEXT;

-- Add constraint to limit allowed values
DO $$ BEGIN
  ALTER TABLE loans
  ADD CONSTRAINT repayment_frequency_allowed
  CHECK (repayment_frequency IN (
    'everyday', 'every_2_days', 'every_3_days', 'every_week', 'every_2_weeks',
    'monthly', 'every_2_months', 'every_3_months', 'yearly'
  ));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS loan_repayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  paid_at DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_loans_store_id ON loans(store_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loan_repayments_loan_id ON loan_repayments(loan_id);

-- 3) Triggers to update updated_at
CREATE OR REPLACE FUNCTION set_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS loans_set_updated_at ON loans;
CREATE TRIGGER loans_set_updated_at
BEFORE UPDATE ON loans
FOR EACH ROW EXECUTE FUNCTION set_timestamp_updated_at();

-- 4) RLS
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayments ENABLE ROW LEVEL SECURITY;

-- Assuming users own stores via stores.owner_id = auth.uid()
-- Policy: a user can select/insert/update/delete only rows linked to stores they own
DROP POLICY IF EXISTS loans_select ON loans;
CREATE POLICY loans_select ON loans
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM stores s
    WHERE s.id = loans.store_id AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS loans_modify ON loans;
CREATE POLICY loans_modify ON loans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM stores s
    WHERE s.id = loans.store_id AND s.owner_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM stores s
    WHERE s.id = loans.store_id AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS loan_repayments_select ON loan_repayments;
CREATE POLICY loan_repayments_select ON loan_repayments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM loans l JOIN stores s ON s.id = l.store_id
    WHERE l.id = loan_repayments.loan_id AND s.owner_id = auth.uid()
  )
);

DROP POLICY IF EXISTS loan_repayments_modify ON loan_repayments;
CREATE POLICY loan_repayments_modify ON loan_repayments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM loans l JOIN stores s ON s.id = l.store_id
    WHERE l.id = loan_repayments.loan_id AND s.owner_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM loans l JOIN stores s ON s.id = l.store_id
    WHERE l.id = loan_repayments.loan_id AND s.owner_id = auth.uid()
  )
);
