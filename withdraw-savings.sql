-- Create savings_withdrawals table
CREATE TABLE IF NOT EXISTS savings_withdrawals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  savings_plan_id UUID REFERENCES savings_plans(id) ON DELETE CASCADE,
  amount_withdrawn DECIMAL(10,2) NOT NULL,
  withdrawal_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to withdraw from savings plan
CREATE OR REPLACE FUNCTION withdraw_savings_plan(plan_id UUID)
RETURNS JSON AS $$
DECLARE
  total_withdrawn DECIMAL;
BEGIN
  -- Calculate total contributions
  SELECT COALESCE(SUM(amount), 0) INTO total_withdrawn
  FROM savings_contributions
  WHERE savings_plan_id = plan_id;
  
  -- Update plan status to withdrawn
  UPDATE savings_plans 
  SET status = 'withdrawn', end_date = CURRENT_DATE
  WHERE id = plan_id;
  
  -- Record withdrawal
  INSERT INTO savings_withdrawals (savings_plan_id, amount_withdrawn, withdrawal_date)
  VALUES (plan_id, total_withdrawn, CURRENT_DATE);
  
  RETURN json_build_object(
    'amount_withdrawn', total_withdrawn,
    'withdrawal_date', CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql;
