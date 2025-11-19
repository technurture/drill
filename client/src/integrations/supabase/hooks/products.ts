import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { Product } from "../../../types/database.types";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

export const useProducts = (storeId: string) => {
  const { isOnline } = useOfflineStatus();
  
  return useQuery({
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
    enabled: Boolean(storeId) && (isOnline || navigator.onLine),
    staleTime: 1000 * 60, // 1 minute
    refetchOnMount: isOnline ? true : false,
    refetchOnWindowFocus: isOnline,
  });
};

// Split into separate files to reduce file size
export * from "./product-mutations";
