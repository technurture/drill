import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { Product } from "../../../types/database.types";

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useStores = (userId: string) =>
  useQuery({
    queryKey: ["stores", userId],
    queryFn: () =>
      fromSupabase(supabase.from("stores").select("*").eq("owner_id", userId)),
    enabled: !!userId,
  });
export const useStoresSalesRep = (storeId: string) =>
  useQuery({
    queryKey: ["stores", storeId],
    queryFn: () =>
      fromSupabase(supabase.from("stores").select("*").eq("store_id", storeId)),
    enabled: !!storeId,
  });

export const useStore = (storeId: string) =>
  useQuery({
    queryKey: ["stores", storeId],
    queryFn: () =>
      fromSupabase(
        supabase.from("stores").select("*").eq("id", storeId).single(),
      ),
    enabled: !!storeId,
  });

export const useUpdateStoreLocation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ storeId, locationId, marketId }: { storeId: string; locationId: string; marketId: string | null }) => {
      const { data, error } = await supabase
        .from("stores")
        .update({ 
          location_id: locationId,
          market_id: marketId 
        })
        .eq("id", storeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate the specific store cache and the list
      queryClient.invalidateQueries({ queryKey: ["stores", data.id] });
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};

export const useAddStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newStore: { name: string; owner_id: string }) => {
      const { data, error } = await supabase
        .from("stores")
        .insert([newStore])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};

export const useUpdateStoreName = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      storeId,
      name,
    }: {
      storeId: string;
      name: string;
    }) => {
      console.log('Updating store name:', { storeId, name });
      
      // Try both field names to see which one works
      let data, error;
      
      try {
        // First try with store_name
        const result1 = await supabase
          .from("stores")
          .update({ store_name: name })
          .eq("id", storeId)
          .select()
          .single();
        
        data = result1.data;
        error = result1.error;
        
        if (!error) {
          console.log('Success with store_name field');
          return data;
        }
      } catch (e) {
        console.log('Failed with store_name, trying name field');
      }
      
      // If that failed, try with name
      const result2 = await supabase
        .from("stores")
        .update({ name })
        .eq("id", storeId)
        .select()
        .single();

      data = result2.data;
      error = result2.error;

      if (error) {
        console.error('Store update error:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }
      
      console.log('Store updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};

export const useDuplicateStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      storeId,
      newStoreName,
      ownerId,
      newStoreLocation,
    }: {
      storeId: string;
      newStoreName: string;
      ownerId: string;
      newStoreLocation: string;
    }) => {
      // First, create the new store
      const { data: newStore, error: storeError } = await supabase
        .from("stores")
        .insert([
          { name: newStoreName, owner_id: ownerId, location: newStoreLocation },
        ])
        .select()
        .single();

      if (storeError) throw storeError;

      // Then, get all products from the original store
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("store_id", storeId);

      if (productsError) throw productsError;

      // If there are products, duplicate them for the new store
      if (products && products.length > 0) {
        const newProducts = products.map((product: Product) => ({
          name: product.name,
          unit_price: product.unit_price,
          quantity: product.quantity,
          low_stock_threshold: product.low_stock_threshold,
          store_id: newStore.id,
        }));

        const { error: insertError } = await supabase
          .from("products")
          .insert(newProducts);

        if (insertError) throw insertError;
      }

      return newStore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};

export const useDeleteStore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) =>
      fromSupabase(supabase.from("stores").delete().eq("id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stores"] });
    },
  });
};
