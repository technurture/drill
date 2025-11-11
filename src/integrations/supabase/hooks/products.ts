import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { Product } from "../../../types/database.types";

export const useProducts = (storeId: string) =>
  useQuery({
    queryKey: ["products", storeId],
    queryFn: async () => {
      if (!storeId) {
        throw new Error("Store ID is required to fetch products");
      }
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }

      console.log('Fetched products for store:', storeId, 'data:', data); // Debug log
      return (data || []) as Product[];
    },
    enabled: Boolean(storeId),
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

// Split into separate files to reduce file size
export * from "./product-mutations";
