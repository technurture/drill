import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { Loan, LoanRepayment, CreateLoanData, AddRepaymentData, LoansSummary } from "@/types/loans.types";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

export const useLoans = (storeId?: string) => {
  const { isOnline } = useOfflineStatus();

  return useQuery({
    queryKey: ["loans", storeId],
    queryFn: async () => {
      if (!storeId) return [] as Loan[];

      // No offline check - just call Supabase
      // Natural network failure when offline
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as Loan[];
    },
    enabled: Boolean(storeId),
    networkMode: 'offlineFirst',
    placeholderData: (previousData) => previousData,
    refetchOnMount: isOnline,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
};

export const useLoan = (loanId?: string) => {
  const { isOnline } = useOfflineStatus();

  return useQuery({
    queryKey: ["loan", loanId],
    queryFn: async () => {
      if (!loanId) return null;

      // No offline check - just call Supabase
      // Natural network failure when offline
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("id", loanId)
        .single();
      if (error) throw error;
      return data as Loan;
    },
    enabled: Boolean(loanId),
    networkMode: 'offlineFirst',
    placeholderData: (previousData) => previousData,
    refetchOnMount: isOnline,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();

  return useOfflineMutation({
    tableName: "loans",
    action: "create",
    mutationFn: async (payload: CreateLoanData) => {
      const { user_id, ...cleanPayload } = payload;
      const { data, error } = await supabase
        .from("loans")
        .insert(cleanPayload)
        .select()
        .single();
      if (error) throw error;
      return data as Loan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["loans", data.store_id] });
      queryClient.invalidateQueries({ queryKey: ["loans-summary", data.store_id] });
    },
    getOptimisticData: (variables) => ({
      id: crypto.randomUUID(),
      ...variables,
      status: 'active',
      created_at: new Date().toISOString(),
    } as unknown as Loan),
  });
};

export const useUpdateLoanStatus = () => {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    tableName: "loans",
    action: "update",
    mutationFn: async ({ loanId, status }: { loanId: string; status: Loan["status"] }) => {
      const { data, error } = await supabase
        .from("loans")
        .update({ status })
        .eq("id", loanId)
        .select()
        .single();
      if (error) throw error;
      return data as Loan;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["loans", data.store_id] });
      queryClient.invalidateQueries({ queryKey: ["loans-summary", data.store_id] });
    },
    getOptimisticData: (variables) => ({
      id: variables.loanId,
      status: variables.status,
      updated_at: new Date().toISOString(),
    } as any),
  });
};

export const useDeleteLoan = () => {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    tableName: "loans",
    action: "delete",
    mutationFn: async ({ loanId }: { loanId: string }) => {
      const { error } = await supabase.from("loans").delete().eq("id", loanId);
      if (error) throw error;
      return loanId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["loans-summary"] });
    },
    getOptimisticData: ({ loanId }) => loanId,
  });
};

export const useRepayments = (loanId?: string) => {
  const { isOnline } = useOfflineStatus();

  return useQuery({
    queryKey: ["loan-repayments", loanId],
    queryFn: async () => {
      if (!loanId) return [] as LoanRepayment[];

      // No offline check - just call Supabase
      // Natural network failure when offline
      const { data, error } = await supabase
        .from("loan_repayments")
        .select("*")
        .eq("loan_id", loanId)
        .order("paid_at", { ascending: false });
      if (error) throw error;
      return (data || []) as LoanRepayment[];
    },
    enabled: Boolean(loanId),
    networkMode: 'offlineFirst',
    placeholderData: (previousData) => previousData,
    refetchOnMount: isOnline,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
};

export const useAddRepayment = () => {
  const queryClient = useQueryClient();

  return useOfflineMutation({
    tableName: "loan_repayments",
    action: "create",
    mutationFn: async (payload: AddRepaymentData) => {
      const { data, error } = await supabase
        .from("loan_repayments")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as LoanRepayment;
    },
    onSuccess: async (data, variables) => {
      // CRITICAL: Immediately update the cache before invalidation for instant UI update
      // Deduplicate to prevent double-insert when refetch occurs
      queryClient.setQueryData<LoanRepayment[]>(
        ["loan-repayments", data.loan_id],
        (oldRepayments) => {
          if (!oldRepayments) return [data];
          // Check if this repayment already exists to prevent duplicates
          const exists = oldRepayments.some(r => r.id === data.id);
          if (exists) return oldRepayments;
          // Add new repayment to the beginning (most recent first)
          return [data, ...oldRepayments];
        }
      );

      // Derive store_id from the loan in cache (avoid network call which fails offline)
      const loan = queryClient.getQueryData<Loan>(["loan", data.loan_id]) ||
        queryClient.getQueriesData<Loan[]>({ queryKey: ["loans"] })
          .flatMap(([, loans]) => loans || [])
          .find(l => l.id === data.loan_id);

      const storeId = loan?.store_id;

      if (storeId) {
        // Update store-wide repayments cache immediately (with deduplication)
        queryClient.setQueryData<LoanRepayment[]>(
          ["loan-repayments-by-store", storeId],
          (oldRepayments) => {
            if (!oldRepayments) return [data];
            const exists = oldRepayments.some(r => r.id === data.id);
            if (exists) return oldRepayments;
            return [data, ...oldRepayments];
          }
        );

        // Invalidate loans summary to refetch and recalculate totals
        queryClient.invalidateQueries({ queryKey: ["loans-summary", storeId] });
        // Invalidate the loans list in case status needs to update
        queryClient.invalidateQueries({ queryKey: ["loans", storeId] });
      }

      // After cache updates, invalidate to trigger background refetch (keeps data fresh)
      queryClient.invalidateQueries({ queryKey: ["loan-repayments", data.loan_id] });
    },
    getOptimisticData: (variables) => ({
      id: crypto.randomUUID(),
      ...variables,
      created_at: new Date().toISOString(),
    } as unknown as LoanRepayment),
  });
};

// Fetch all repayments for loans belonging to a store (for aggregation on the page)
export const useRepaymentsByStore = (storeId?: string) => {
  const { isOnline } = useOfflineStatus();

  return useQuery({
    queryKey: ["loan-repayments-by-store", storeId],
    queryFn: async () => {
      if (!storeId) return [] as LoanRepayment[];

      // No offline check - just call Supabase
      // Natural network failure when offline
      const { data, error } = await supabase
        .from("loan_repayments")
        .select("id, loan_id, amount, paid_at, note, created_at, loans!inner(store_id)")
        .eq("loans.store_id", storeId)
        .order("paid_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as LoanRepayment[];
    },
    enabled: Boolean(storeId),
    networkMode: 'offlineFirst',
    placeholderData: (previousData) => previousData,
    refetchOnMount: isOnline,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
};

export const useLoansSummary = (storeId?: string) => {
  const { isOnline } = useOfflineStatus();

  return useQuery({
    queryKey: ["loans-summary", storeId],
    queryFn: async () => {
      if (!storeId) return null as LoansSummary | null;

      // No offline check - just call Supabase
      // Natural network failure when offline
      const { data: loans, error } = await supabase
        .from("loans")
        .select("*")
        .eq("store_id", storeId);
      if (error) throw error;
      const { data: allRepayments, error: rErr } = await supabase
        .from("loan_repayments")
        .select("loan_id, amount");
      if (rErr) throw rErr;

      const total_loans = loans?.length || 0;
      const active_loans = loans?.filter(l => l.status === 'active').length || 0;
      const completed_loans = loans?.filter(l => l.status === 'completed').length || 0;
      // total payable = principal + interest amount (interest_rate stored as decimal)
      const total_principal = loans?.reduce((sum, l: any) => {
        const principal = Number(l.principal || 0);
        const rateDecimal = Number(l.interest_rate || 0);
        const interestAmount = principal * rateDecimal;
        return sum + principal + interestAmount;
      }, 0) || 0;
      const repaidByLoan = new Map<string, number>();
      (allRepayments || []).forEach(r => {
        repaidByLoan.set(r.loan_id, (repaidByLoan.get(r.loan_id) || 0) + Number(r.amount || 0));
      });
      const total_repaid = (loans || []).reduce((sum: number, l: any) => sum + (repaidByLoan.get(l.id) || 0), 0);
      const outstanding_balance = Math.max(0, total_principal - total_repaid);

      return { total_loans, active_loans, completed_loans, total_principal, total_repaid, outstanding_balance } as LoansSummary;
    },
    enabled: Boolean(storeId),
    networkMode: 'offlineFirst',
    placeholderData: (previousData) => previousData,
    refetchOnMount: isOnline,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
};
