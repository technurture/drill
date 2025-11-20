import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { Product } from "../../../types/database.types";
import { useOfflineStatus } from "@/hooks/useOfflineStatus";

export const useProducts = (storeId?: string) => {
  const { isOnline } = useOfflineStatus();
  
  return useQuery({
    queryKey: ["products", storeId],
    queryFn: async () => {
      if (!storeId) return [] as Product[];
      
      // No offline check - just call Supabase
      // Natural network failure when offline
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data || []) as Product[];
    },
    enabled: Boolean(storeId),
    networkMode: 'offlineFirst',
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60,
    refetchOnMount: isOnline,
    refetchOnWindowFocus: isOnline,
    refetchOnReconnect: true,
  });
};

// Split into separate files to reduce file size
export * from "./product-mutations";
