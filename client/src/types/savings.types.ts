// Savings System Types

export type SavingsDuration =
  | 'everyday'
  | 'every_2_days'
  | 'every_3_days'
  | 'weekly'
  | 'every_2_weeks'
  | 'monthly'
  | 'every_2_months'
  | 'every_3_months'
  | 'every_6_months'
  | 'yearly';

export type SavingsStatus = 'just_started' | 'in_progress' | 'completed' | 'withdrawn';

export interface SavingsPlan {
  id: string;
  user_id: string;
  store_id: string;
  title: string;
  start_date: string;
  end_date: string;
  contributing_to: string;
  savings_duration: SavingsDuration;
  target_amount: string;
  current_amount: string;
  status: SavingsStatus;
  created_at: string;
  updated_at: string;
}

export interface SavingsContribution {
  id: string;
  savings_plan_id: string;
  user_id: string;
  store_id: string;
  amount: string;
  contribution_date: string;
  created_at: string;
}

export interface CreateSavingsPlanData {
  title: string;
  start_date: string;
  end_date: string;
  contributing_to: string;
  savings_duration: SavingsDuration;
  target_amount: number;
  current_amount?: string;
  status: SavingsStatus;
}

export interface AddContributionData {
  savings_plan_id: string;
  amount: number;
  contribution_date: string;
}

export interface SavingsPlanWithContributions extends SavingsPlan {
  contributions: SavingsContribution[];
}

export interface SavingsSummary {
  total_plans: number;
  active_plans: number;
  completed_plans: number;
  total_saved: number;
  total_target: number;
  progress_percentage: number;
}

// Duration options for the UI
export const SAVINGS_DURATION_OPTIONS = [
  { value: 'everyday', label: 'Every Day' },
  { value: 'every_2_days', label: 'Every 2 Days' },
  { value: 'every_3_days', label: 'Every 3 Days' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'every_2_weeks', label: 'Every 2 Weeks' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'every_2_months', label: 'Every 2 Months' },
  { value: 'every_3_months', label: 'Every 3 Months' },
  { value: 'every_6_months', label: 'Every 6 Months' },
  { value: 'yearly', label: 'Yearly' }
] as const;

// Status display options
export const SAVINGS_STATUS_OPTIONS = [
  { value: 'just_started', label: 'Just Started', color: 'bg-gray-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-red-500' }
] as const; 