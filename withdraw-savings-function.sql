-- Function to withdraw from a savings plan
-- This function will:
-- 1. Update the savings plan status to 'withdrawn'
-- 2. Set the end_date to current date
-- 3. Add a withdrawal record
-- 4. Return the total amount withdrawn

CREATE OR REPLACE FUNCTION withdraw_savings_plan(plan_id UUID)
RETURNS JSON AS $$
DECLARE
  plan_record RECORD;
  total_withdrawn DECIMAL;
  withdrawal_record JSON;
BEGIN
  -- Get the savings plan details
  SELECT * INTO plan_record 
  FROM savings_plans 
  WHERE id = plan_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Savings plan not found';
  END IF;
  
  -- Check if plan is already withdrawn
  IF plan_record.status = 'withdrawn' THEN
    RAISE EXCEPTION 'Savings plan is already withdrawn';
  END IF;
  
  -- Calculate total contributions
  SELECT COALESCE(SUM(amount), 0) INTO total_withdrawn
  FROM savings_contributions
  WHERE savings_plan_id = plan_id;
  
  -- Update the savings plan status to withdrawn
  UPDATE savings_plans 
  SET 
    status = 'withdrawn',
    end_date = CURRENT_DATE,
    updated_at = NOW()
  WHERE id = plan_id;
  
  -- Create withdrawal record
  INSERT INTO savings_withdrawals (
    savings_plan_id,
    amount_withdrawn,
    withdrawal_date,
    created_at
  ) VALUES (
    plan_id,
    total_withdrawn,
    CURRENT_DATE,
    NOW()
  );
  
  -- Return withdrawal details
  SELECT json_build_object(
    'plan_id', plan_id,
    'plan_title', plan_record.title,
    'amount_withdrawn', total_withdrawn,
    'withdrawal_date', CURRENT_DATE,
    'status', 'withdrawn'
  ) INTO withdrawal_record;
  
  RETURN withdrawal_record;
END;
$$ LANGUAGE plpgsql;

-- Create savings_withdrawals table if it doesn't exist
CREATE TABLE IF NOT EXISTS savings_withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  savings_plan_id UUID REFERENCES savings_plans(id) ON DELETE CASCADE,
  amount_withdrawn DECIMAL(10,2) NOT NULL,
  withdrawal_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for savings_withdrawals
ALTER TABLE savings_withdrawals ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view their own withdrawals
CREATE POLICY "Users can view their own withdrawals" ON savings_withdrawals
  FOR SELECT USING (
    savings_plan_id IN (
      SELECT id FROM savings_plans 
      WHERE user_id = auth.uid()
    )
  );

-- Policy to allow system to insert withdrawals
CREATE POLICY "System can insert withdrawals" ON savings_withdrawals
  FOR INSERT WITH CHECK (true);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_savings_withdrawals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_savings_withdrawals_updated_at
  BEFORE UPDATE ON savings_withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION update_savings_withdrawals_updated_at();
