import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

export interface FinancialRecord {
  id: string;
  store_id: string;
  user_id: string;
  type: 'income' | 'expense';
  reason: string;
  amount: string;
  date: string;
  sale_id?: string;
  created_at: string;
  updated_at: string;
  sale?: {
    id: string;
    items?: Array<{
      id: string;
      quantity: number;
      unit_price: number;
      product?: {
        id: string;
        name: string;
      };
    }>;
  };
}

export interface AddFinancialRecordData {
  store_id: string;
  user_id: string;
  type: 'income' | 'expense';
  reason: string;
  amount: number;
  date: string;
  sale_id?: string;
}

// Fetch financial records for a store
export const useFinancialRecords = (storeId?: string) => {
  const { isOnline } = useOfflineStatus();
  
  return useQuery({
    queryKey: ["financial-records", storeId],
    queryFn: async () => {
      if (!storeId) return [];
      
      const { data, error } = await supabase
        .from("financial_records")
        .select(`
          *,
          sale:sales(
            id,
            items:sale_items(
              id,
              quantity,
              unit_price,
              product:products(
                id,
                name
              )
            )
          )
        `)
        .eq("store_id", storeId)
        .order("date", { ascending: false });

      if (error) throw error;
      return (data || []) as FinancialRecord[];
    },
    enabled: !!storeId && (isOnline || navigator.onLine),
    refetchOnMount: isOnline ? 'always' : false,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: isOnline,
  });
};

// Add a new financial record
export const useAddFinancialRecord = () => {
  const queryClient = useQueryClient();
  
  return useOfflineMutation({
    tableName: "financial_records",
    action: "create",
    mutationFn: async (newRecord: AddFinancialRecordData) => {
      console.log("Finance Hook - Attempting to insert record:", newRecord);
      
      // If a sale_id is provided, check for an existing finance record to avoid duplicates
      if (newRecord.sale_id) {
        const { data: existing, error: existingErr } = await supabase
          .from("financial_records")
          .select("*")
          .eq("sale_id", newRecord.sale_id)
          .eq("store_id", newRecord.store_id)
          .maybeSingle();
        if (existingErr) {
          console.error("Finance Hook - Existing check error:", existingErr);
        }
        if (existing) {
          console.log("Finance Hook - Skipping insert; record already exists for sale_id:", newRecord.sale_id);
          return existing as FinancialRecord;
        }
      }
      
      const { data, error } = await supabase
        .from("financial_records")
        .insert([newRecord])
        .select()
        .single();

      console.log("Finance Hook - Insert result:", { data, error });

      if (error) {
        console.error("Finance Hook - Insert error:", error);
        throw error;
      }
      
      console.log("Finance Hook - Insert successful:", data);
      return data as FinancialRecord;
    },
    onSuccess: (data) => {
      console.log("Finance Hook - Mutation success, invalidating queries");
      // Invalidate and refetch financial records
      queryClient.invalidateQueries({ queryKey: ["financial-records", data.store_id] });
    },
    onError: (error) => {
      console.error("Finance Hook - Mutation error:", error);
    },
    getOptimisticData: (variables) => ({
      id: crypto.randomUUID(),
      ...variables,
      amount: String(variables.amount),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as FinancialRecord),
  });
};

// Delete a financial record
export const useDeleteFinancialRecord = () => {
  const queryClient = useQueryClient();
  
  return useOfflineMutation({
    tableName: "financial_records",
    action: "delete",
    mutationFn: async (recordId: string) => {
      const { error } = await supabase
        .from("financial_records")
        .delete()
        .eq("id", recordId);

      if (error) throw error;
      return recordId;
    },
    onSuccess: () => {
      // Invalidate all financial records queries
      queryClient.invalidateQueries({ queryKey: ["financial-records"] });
    },
    getOptimisticData: (recordId) => recordId,
  });
};

// Update a financial record
export const useUpdateFinancialRecord = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<AddFinancialRecordData> }) => {
      const { data, error } = await supabase
        .from("financial_records")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as FinancialRecord;
    },
    onSuccess: (data) => {
      // Invalidate and refetch financial records
      queryClient.invalidateQueries({ queryKey: ["financial-records", data.store_id] });
    },
  });
};

// Get financial summary for a store
export const useFinancialSummary = (storeId?: string) => {
  return useQuery({
    queryKey: ["financial-summary", storeId],
    queryFn: async () => {
      if (!storeId) return { totalIncome: 0, totalExpenses: 0, netIncome: 0 };
      
      const { data, error } = await supabase
        .from("financial_records")
        .select("type, amount")
        .eq("store_id", storeId);

      if (error) throw error;
      
      const totalIncome = data
        ?.filter(record => record.type === 'income')
        ?.reduce((sum, record) => sum + parseFloat(record.amount), 0) || 0;
        
      const totalExpenses = data
        ?.filter(record => record.type === 'expense')
        ?.reduce((sum, record) => sum + parseFloat(record.amount), 0) || 0;
        
      const netIncome = totalIncome - totalExpenses;
      
      return { totalIncome, totalExpenses, netIncome };
    },
    enabled: !!storeId,
  });
}; 