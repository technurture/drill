import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import {
  SavingsPlan,
  SavingsContribution,
  CreateSavingsPlanData,
  AddContributionData,
  SavingsSummary
} from "@/types/savings.types";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

// Fetch all savings plans for a store with contributions
export const useSavingsPlans = (storeId?: string) => {
  const { isOnline } = useOfflineStatus();
  return useQuery({
    queryKey: ["savings-plans", storeId],
    queryFn: async () => {
      if (!storeId) return [];

      console.log("Fetching savings plans for store:", storeId);

      const { data, error } = await supabase
        .from("savings_plans")
        .select(`
          *,
          contributions:savings_contributions(*),
          withdrawals:savings_withdrawals(*)
        `)
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      console.log("Savings plans fetch result:", { data, error });

      if (error) throw error;
      return (data || []) as (SavingsPlan & { contributions: SavingsContribution[]; withdrawals: Array<{ amount_withdrawn: number }> })[];
    },
    enabled: !!storeId,
    networkMode: 'offlineFirst',
    refetchOnMount: isOnline,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
};

// Fetch a single savings plan with contributions
export const useSavingsPlan = (planId?: string) => {
  const { isOnline } = useOfflineStatus();
  return useQuery({
    queryKey: ["savings-plan", planId],
    queryFn: async () => {
      if (!planId) return null;

      const { data, error } = await supabase
        .from("savings_plans")
        .select(`
          *,
          contributions:savings_contributions(*)
        `)
        .eq("id", planId)
        .single();

      if (error) throw error;
      return data as SavingsPlan & { contributions: SavingsContribution[] };
    },
    enabled: !!planId,
    networkMode: 'offlineFirst',
    refetchOnMount: isOnline,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
};

// Fetch contributions for a specific plan
export const useSavingsContributions = (planId?: string) => {
  const { isOnline } = useOfflineStatus();
  return useQuery({
    queryKey: ["savings-contributions", planId],
    queryFn: async () => {
      if (!planId) return [];

      const { data, error } = await supabase
        .from("savings_contributions")
        .select("*")
        .eq("savings_plan_id", planId)
        .order("contribution_date", { ascending: false });

      if (error) throw error;
      return (data || []) as SavingsContribution[];
    },
    enabled: !!planId,
    networkMode: 'offlineFirst',
    refetchOnMount: isOnline,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
};

// Create a new savings plan
export const useCreateSavingsPlan = () => {
  const queryClient = useQueryClient();

  return useOfflineMutation({
    tableName: "savings_plans",
    action: "create",
    mutationFn: async (newPlan: CreateSavingsPlanData & { store_id: string; user_id: string }) => {
      const { data, error } = await supabase
        .from("savings_plans")
        .insert([newPlan])
        .select()
        .single();

      if (error) throw error;
      return data as SavingsPlan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["savings-plans", data.store_id] });
    },
    getOptimisticData: (variables) => ({
      id: crypto.randomUUID(),
      ...variables,
      current_amount: "0",
      status: "active",
      created_at: new Date().toISOString(),
    } as unknown as SavingsPlan),
  });
};

// Add a contribution to a savings plan
export const useAddContribution = () => {
  const queryClient = useQueryClient();

  return useOfflineMutation({
    tableName: "savings_contributions",
    action: "create",
    mutationFn: async (contribution: AddContributionData & { store_id: string; user_id: string }) => {
      console.log("Adding contribution:", contribution);

      const { data, error } = await supabase
        .from("savings_contributions")
        .insert([contribution])
        .select()
        .single();

      console.log("Contribution result:", { data, error });

      if (error) throw error;
      return data as SavingsContribution;
    },
    onSuccess: (data, variables) => {
      console.log("Contribution added successfully, invalidating queries");
      // Invalidate the specific plan and contributions queries
      queryClient.invalidateQueries({ queryKey: ["savings-plan", variables.savings_plan_id] });
      queryClient.invalidateQueries({ queryKey: ["savings-contributions", variables.savings_plan_id] });
      queryClient.invalidateQueries({ queryKey: ["savings-plans", variables.store_id] });
      queryClient.invalidateQueries({ queryKey: ["savings-summary", variables.store_id] });
    },
    onError: (error) => {
      console.error("Error adding contribution:", error);
    },
    getOptimisticData: (variables) => ({
      id: crypto.randomUUID(),
      ...variables,
      created_at: new Date().toISOString(),
    } as unknown as SavingsContribution),
  });
};

// Delete a savings plan
export const useDeleteSavingsPlan = () => {
  const queryClient = useQueryClient();

  return useOfflineMutation({
    tableName: "savings_plans",
    action: "delete",
    mutationFn: async (planId: string) => {
      const { error } = await supabase
        .from("savings_plans")
        .delete()
        .eq("id", planId);

      if (error) throw error;
      return planId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-plans"] });
    },
    getOptimisticData: (planId) => planId,
  });
};

// Delete a contribution
export const useDeleteContribution = () => {
  const queryClient = useQueryClient();

  return useOfflineMutation({
    tableName: "savings_contributions",
    action: "delete",
    mutationFn: async (contributionId: string) => {
      const { error } = await supabase
        .from("savings_contributions")
        .delete()
        .eq("id", contributionId);

      if (error) throw error;
      return contributionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["savings-plan"] });
      queryClient.invalidateQueries({ queryKey: ["savings-contributions"] });
      queryClient.invalidateQueries({ queryKey: ["savings-plans"] });
    },
    getOptimisticData: (contributionId) => contributionId,
  });
};

// Withdraw from a savings plan (marks as withdrawn and prevents further contributions)
export const useWithdrawSavings = () => {
  const queryClient = useQueryClient();

  return useOfflineMutation({
    tableName: "savings_withdrawals",
    action: "withdraw_full",
    mutationFn: async ({ planId, storeId, totalAmount }: { planId: string; storeId: string; totalAmount?: number }) => {
      // If totalAmount not provided, fetch it
      let amountToWithdraw = totalAmount;
      if (!amountToWithdraw) {
        const { data: plan, error: fetchError } = await supabase
          .from('savings_plans')
          .select('id,current_amount,contributions:savings_contributions(amount)')
          .eq('id', planId)
          .single();

        if (fetchError) throw fetchError;

        // Calculate total amount to withdraw
        const currentFromField = parseFloat(plan?.current_amount ?? 0);
        const sumContrib = (plan?.contributions || []).reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0);
        amountToWithdraw = currentFromField > 0 ? currentFromField : sumContrib;
      }

      // Update the savings plan status to 'withdrawn' and set end_date to current date
      const { error } = await supabase
        .from("savings_plans")
        .update({
          status: 'withdrawn',
          end_date: new Date().toISOString().split('T')[0]
        })
        .eq("id", planId);

      if (error) throw error;

      // Record the withdrawal in savings_withdrawals table
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('savings_withdrawals')
        .insert({
          savings_plan_id: planId,
          amount_withdrawn: amountToWithdraw,
          withdrawal_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (withdrawalError) throw withdrawalError;

      return { planId, storeId, withdrawal: withdrawalData };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["savings-plan", data.planId] });
      queryClient.invalidateQueries({ queryKey: ["savings-plans", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["savings-summary", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["savings-withdrawals", data.planId] });
    },
    getOptimisticData: (variables) => ({
      planId: variables.planId,
      storeId: variables.storeId,
      withdrawal: {
        id: crypto.randomUUID(),
        savings_plan_id: variables.planId,
        amount_withdrawn: variables.totalAmount || 0,
        withdrawal_date: new Date().toISOString().split('T')[0],
      },
    }),
  });
};

// Withdraw a partial amount by updating current_amount (no negative contributions)
export const useWithdrawPartialSavings = () => {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    tableName: "savings_withdrawals",
    action: "withdraw_partial",
    mutationFn: async ({ planId, amount, store_id }: { planId: string; amount: number; store_id: string }) => {
      if (amount <= 0) {
        throw new Error('Withdrawal amount must be greater than 0');
      }
      // Fetch plan with contributions to determine effective saved
      const { data: plan, error: fetchError } = await supabase
        .from('savings_plans')
        .select('id,current_amount,target_amount,contributions:savings_contributions(amount)')
        .eq('id', planId)
        .single();
      if (fetchError) throw fetchError;
      const currentFromField = parseFloat(plan?.current_amount ?? 0);
      const sumContrib = (plan?.contributions || []).reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0);
      const effectiveSaved = currentFromField > 0 ? currentFromField : sumContrib;
      const newAmount = Math.max(0, effectiveSaved - amount);

      // Update the savings plan current amount
      const { data, error } = await supabase
        .from('savings_plans')
        .update({ current_amount: newAmount })
        .eq('id', planId)
        .select()
        .single();
      if (error) throw error;

      // Record the withdrawal in savings_withdrawals table
      const { data: withdrawalData, error: withdrawalError } = await supabase
        .from('savings_withdrawals')
        .insert({
          savings_plan_id: planId,
          amount_withdrawn: amount,
          withdrawal_date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (withdrawalError) throw withdrawalError;

      return { plan: data, withdrawal: withdrawalData };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['savings-plan', variables.planId] });
      queryClient.invalidateQueries({ queryKey: ['savings-plans', variables.store_id] });
      queryClient.invalidateQueries({ queryKey: ['savings-summary', variables.store_id] });
      queryClient.invalidateQueries({ queryKey: ['savings-withdrawals', variables.planId] });
    },
    getOptimisticData: (variables) => ({
      plan: {
        id: variables.planId,
        store_id: variables.store_id,
      },
      withdrawal: {
        id: crypto.randomUUID(),
        savings_plan_id: variables.planId,
        amount_withdrawn: variables.amount,
        withdrawal_date: new Date().toISOString().split('T')[0],
      },
    }),
  });
};

// Get savings summary for a store
export const useSavingsSummary = (storeId?: string) => {
  const { isOnline } = useOfflineStatus();
  return useQuery({
    queryKey: ["savings-summary", storeId],
    queryFn: async () => {
      if (!storeId) return null;

      console.log("Calculating savings summary for store:", storeId);

      // Fetch plans with contributions and withdrawals
      const { data: plans, error: plansError } = await supabase
        .from("savings_plans")
        .select(`
          *,
          contributions:savings_contributions(*),
          withdrawals:savings_withdrawals(*)
        `)
        .eq("store_id", storeId);

      if (plansError) throw plansError;

      console.log("Plans with contributions:", plans);

      const total_plans = plans?.length || 0;

      // Calculate totals
      let total_contributed = 0;
      let total_effective_saved = 0;
      let active_plans = 0;
      let completed_plans = 0;

      plans?.forEach(plan => {
        const planContributions = plan.contributions || [];
        const totalContributions = planContributions.reduce((sum, contribution) =>
          sum + parseFloat(contribution.amount), 0);
        total_contributed += totalContributions;

        const planWithdrawals = (plan.withdrawals || []).reduce((sum: number, w: any) => sum + parseFloat(w.amount_withdrawn || 0), 0);
        const currentField = parseFloat((plan as any)?.current_amount ?? 0);
        const effectiveSaved = currentField > 0 ? currentField : Math.max(0, totalContributions - planWithdrawals);
        total_effective_saved += effectiveSaved;

        // Determine status based on actual contributions
        if (totalContributions === 0) {
          // Just started - no contributions
        } else if (totalContributions >= parseFloat(plan.target_amount)) {
          completed_plans++;
        } else {
          active_plans++;
        }
      });

      const total_target = plans?.reduce((sum, plan) => sum + parseFloat(plan.target_amount), 0) || 0;
      const progress_percentage = total_target > 0 ? (total_effective_saved / total_target) * 100 : 0;

      const summary = {
        total_plans,
        active_plans,
        completed_plans,
        total_saved: total_effective_saved, // backward compatible
        total_effective_saved,
        total_contributed,
        total_target,
        progress_percentage
      };

      console.log("Calculated summary:", summary);

      return summary as SavingsSummary;
    },
    enabled: !!storeId,
    networkMode: 'offlineFirst',
    refetchOnMount: isOnline,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
};

// Get withdrawals for a savings plan
export const useSavingsWithdrawals = (planId?: string) => {
  const { isOnline } = useOfflineStatus();
  return useQuery({
    queryKey: ["savings-withdrawals", planId],
    queryFn: async () => {
      if (!planId) return [];

      const { data, error } = await supabase
        .from("savings_withdrawals")
        .select("*")
        .eq("savings_plan_id", planId)
        .order("withdrawal_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!planId,
    networkMode: 'offlineFirst',
    refetchOnMount: isOnline,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
}; 