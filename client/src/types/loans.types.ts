export type LoanStatus = "active" | "completed" | "defaulted" | "cancelled";
export type RepaymentFrequency =
  | "everyday"
  | "every_2_days"
  | "every_3_days"
  | "every_week"
  | "every_2_weeks"
  | "monthly"
  | "every_2_months"
  | "every_3_months"
  | "yearly";

export interface Loan {
  id: string;
  store_id: string;
  borrower_name: string; // lender or institution name
  principal: number;
  interest_rate: number; // decimal (e.g., 0.1 for 10%)
  start_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  repayment_frequency?: RepaymentFrequency;
  purpose?: string;
  status: LoanStatus;
  created_at: string;
  updated_at: string;
}

export interface LoanRepayment {
  id: string;
  loan_id: string;
  amount: number;
  paid_at: string; // YYYY-MM-DD
  note?: string;
  created_at: string;
}

export interface CreateLoanData {
  store_id: string;
  borrower_name: string;
  principal: number;
  interest_rate?: number;
  start_date: string;
  due_date: string;
  repayment_frequency?: RepaymentFrequency;
  purpose?: string;
  user_id: string;
  status: LoanStatus;
}

export interface AddRepaymentData {
  loan_id: string;
  amount: number;
  paid_at?: string;
  note?: string;
}

export interface LoansSummary {
  total_loans: number;
  active_loans: number;
  completed_loans: number;
  total_principal: number;
  total_repaid: number;
  outstanding_balance: number;
}
