import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { Sale, SaleItem } from "../../../types/database.types";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useSales = (storeId?: string, options = {}) =>
  useQuery({
    queryKey: ["sales", storeId],
    queryFn: async () => {
      if (!storeId) return [];
      
      // First try a simple query to debug the 400 error
      console.log("Fetching sales for store ID:", storeId);
      
      const { data, error } = await supabase
        .from("sales")
        .select(`
          *,
          items:sale_items(
            *,
            product:products(*)
          )
        `)
        .eq("store_id", storeId);

      if (error) {
        console.error("Sales fetch error:", error);
        throw error;
      }
      
      console.log("Sales data fetched:", data);
      return (data || []) as unknown as Sale[];
    },
    enabled: !!storeId,
    ...options,
  });

export const useSalesPerDay = (storeId: string, time: string) =>
  useQuery({
    queryKey: ["sales", storeId, time],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from("sales")
        .select(`*`)
        .match({ store_id: storeId, created_date: time });

      if (error) throw error;
      return (data || []) as unknown as Sale[];
    },
  });
export const useProductSoldPerDay = (
  storeId: string,
  time: string,
  name: string,
) =>
  useQuery({
    queryKey: ["sales", storeId, time, name],
    queryFn: async () => {
      if (!storeId) return [];
      const { data, error } = await supabase
        .from("sales")
        .select("*")
        .match({ store_id: storeId, created_at: time, name: name });
      if (error) throw error;
      return (data || []) as unknown as Sale[];
    },
  });

export const useGetSale = (saleId: string) =>
  useQuery({
    queryKey: ["sales", saleId],
    queryFn: () =>
      fromSupabase(
        supabase.from("sales").select("*").eq("id", saleId).single(),
      ),
  });

export const useAddSale = () => {
  const queryClient = useQueryClient();
  
  return useOfflineMutation({
    tableName: "sales",
    action: "create",
    mutationFn: async (newSale: {
      total_price: number;
      payment_mode: "cash" | "credit" | "bank_transfer" | "POS";
      sales_rep_id?: string;
      sales_rep_name?: string;
      sales_type: any;
      note?: string;
      store_id: string;
      created_date: string;
      product_id?: string;
      quantity_sold?: string;
      items?: Array<Omit<SaleItem, "id" | "sale_id">>;
    }) => {
      const { items, ...saleData } = newSale;

      // Insert sale into 'sales' table
      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([saleData])
        .select()
        .single();

      if (saleError) throw saleError;
      if (!sale) throw new Error("Failed to create sale");

      const saleWithId = sale as unknown as Sale;

      // Insert sale items into 'sale_items' table
      const { error: itemsError } = await supabase.from("sale_items").insert(
        items.map((item) => ({
          ...item,
          sale_id: saleWithId.id,
        })),
      );

      if (itemsError) throw itemsError;

      return saleWithId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sales", variables.store_id],
      });
    },
    getOptimisticData: (variables) => {
      const { items, ...saleData } = variables;
      return {
        id: crypto.randomUUID(),
        ...saleData,
        created_at: new Date().toISOString(),
        items: [],
      } as unknown as Sale;
    },
  });
};

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updateData
    }: {
      id: string;
      total_price?: number;
      payment_mode?: "cash" | "credit" | "bank_transfer" | "POS";
      sales_rep_id?: string;
      note?: string;
      store_id: string;
    }) => {
      const { data, error } = await supabase
        .from("sales")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Sale;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sales", variables.store_id],
      });
    },
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    tableName: "sales",
    action: "delete",
    mutationFn: async ({ id, storeId }: { id: string; storeId: string }) => {
      // First delete any linked finance income records
      const { error: financeError } = await supabase
        .from("financial_records")
        .delete()
        .eq("sale_id", id);
      if (financeError) throw financeError;

      // Then delete the sale
      const { error } = await supabase.from("sales").delete().eq("id", id);
      if (error) throw error;
      
      return { id, store_id: storeId };
    },
    onSuccess: (_, variables) => {
      // Invalidate sales and finance queries
      queryClient.invalidateQueries({ queryKey: ["sales", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["financial-records", variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ["financial-summary", variables.storeId] });
    },
    getOptimisticData: (variables) => ({
      id: variables.id,
      store_id: variables.storeId,
    }),
  });
};

export const useUpdateSaleNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      note,
      storeId,
    }: {
      id: string;
      note: string;
      storeId: string;
    }) => {
      const { data, error } = await supabase
        .from("sales")
        .update({ note })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as Sale;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales", variables.storeId] });
    },
  });
};
export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async(sales_id: string) => {
       const {data, error} = await supabase.from("sales").update({note: ""}).eq("id", sales_id).select().single()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["sales"]});
    },
  })
}
