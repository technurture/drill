import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { Product } from "../../../types/database.types";
import { useOfflineMutation } from "@/hooks/useOfflineMutation";
import { sendNotificationToStore } from "@/lib/notificationHelper";

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useAddProduct = () => {
  const queryClient = useQueryClient();

  return useOfflineMutation({
    tableName: "products",
    action: "create",
    mutationFn: async (newProduct: any) => {
      console.log("AddProduct mutation called with:", newProduct);
      if (!newProduct.store_id) {
        throw new Error("Store ID is required");
      }
      const { data, error } = await supabase
        .from("products")
        .insert([newProduct])
        .select()
        .single();

      if (error) throw error;
      console.log("AddProduct mutation success, data:", data);
      return data as Product;
    },
    onSuccess: async (data, variables) => {
      console.log("AddProduct mutation success, invalidating queries for store:", variables.store_id);
      queryClient.invalidateQueries({
        queryKey: ["products", variables.store_id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      // Send notification about new product
      try {
        await sendNotificationToStore(
          variables.store_id,
          `New product added: ${data.name}`,
          "product_create",
          "/dashboard/inventory"
        );
      } catch (error) {
        console.error("Failed to send product create notification:", error);
      }
    },
    getOptimisticData: (variables) => ({
      id: crypto.randomUUID(),
      ...variables,
      created_at: new Date().toISOString(),
      updated_at: null,
    } as Product),
  });
};

export const useAddMultipleProducts = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (newProducts: any,) => {
      const { data, error } = await supabase.from("products").insert([...newProducts])
      if (error) throw error;
      return data as Product;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.store_id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  })
}

export const useGetProduct = (product_id: string) =>
  useQuery({
    queryKey: ["products", product_id],
    queryFn: () =>
      fromSupabase(
        supabase.from("products").select("*").eq("id", product_id).single(),
      ),
  });

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    tableName: "products",
    action: "update",
    mutationFn: async ({
      id,
      ...updateData
    }: Partial<Product> & { id: string; store_id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", id)
        .eq("store_id", updateData.store_id)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.store_id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      // Send notification about product update
      try {
        await sendNotificationToStore(
          variables.store_id,
          `Product updated: ${data.name || 'Product'}`,
          "product_update",
          "/dashboard/inventory"
        );
      } catch (error) {
        console.error("Failed to send product update notification:", error);
      }

      // Check for low stock and send alert if needed
      if (data.quantity <= (data.low_stock_threshold || 0)) {
        try {
          await sendNotificationToStore(
            variables.store_id,
            `⚠️ Low stock alert: ${data.name} (${data.quantity} remaining)`,
            "low_stock_threshold",
            "/dashboard/inventory"
          );
        } catch (error) {
          console.error("Failed to send low stock notification:", error);
        }
      }
    },
    getOptimisticData: (variables) => ({
      ...variables,
      updated_at: new Date().toISOString(),
    } as Product),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    tableName: "products",
    action: "delete",
    mutationFn: async ({ id, storeId }: { id: string; storeId: string }) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("store_id", storeId);

      if (error) throw error;
      return { id, store_id: storeId } as any;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.storeId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      // Send notification about product deletion
      try {
        await sendNotificationToStore(
          variables.storeId,
          "A product has been deleted from inventory",
          "product_delete",
          "/dashboard/inventory"
        );
      } catch (error) {
        console.error("Failed to send product delete notification:", error);
      }
    },
    getOptimisticData: (variables) => ({
      id: variables.id,
      store_id: variables.storeId,
    } as any),
  });
};

export const useUpdateProductQuantity = () => {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    tableName: "products",
    action: "update",
    mutationFn: async ({
      id,
      quantity,
      storeId,
    }: {
      id: string;
      quantity: number;
      storeId: string;
    }) => {
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("store_id", storeId)
        .single();

      if (fetchError) throw fetchError;
      if (!product) throw new Error("Product not found");

      const newQuantity = product.quantity - quantity;
      if (newQuantity < 0) throw new Error("Insufficient stock");

      const { data, error } = await supabase
        .from("products")
        .update({ quantity: newQuantity })
        .eq("id", id)
        .eq("store_id", storeId)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.storeId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    getOptimisticData: (variables) => ({
      id: variables.id,
      store_id: variables.storeId,
      // We can't easily know the new quantity without reading the current state, 
      // but for optimistic updates we might need to accept a slight limitation 
      // or implement a more complex state reader. 
      // For now, we'll skip specific field updates in optimistic data if we can't calculate them,
      // relying on the fact that useOfflineMutation's update logic merges data.
      // BUT, for quantity, we really want to show the change.
      // Since we don't have the old quantity here easily without passing it in,
      // we might just have to wait for sync or pass current quantity in variables.
      // Let's assume the UI updates optimistically via the cache update logic in useOfflineMutation
      // which merges this object. If we don't provide quantity, it won't update.
      // To fix this properly, the component calling this should pass the *new* quantity or *current* quantity.
      // For now, we'll leave it as is, but note that optimistic update for quantity specifically 
      // might be tricky without the current value.
      // actually, looking at the mutationFn, it calculates newQuantity.
      // We can't replicate that logic easily in getOptimisticData without the current product data.
      // So we will return a partial object that matches the structure but maybe lacks the exact new quantity
      // UNLESS we change the signature to accept newQuantity directly.
      // Given the constraints, we'll just return the ID to ensure at least no crash, 
      // but the UI might not reflect the quantity change until sync if we don't guess it.
      updated_at: new Date().toISOString(),
    } as any),
  });
};

export const useReturnProduct = () => {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    tableName: "products",
    action: "update",
    mutationFn: async ({
      product_id,
      store_id,
      quantity
    }: {
      product_id: string,
      store_id: string,
      quantity: number
    }) => {
      const { data: product } = await supabase.from("products").select("*").eq("id", product_id).eq("store_id", store_id).single()
      if (product) {
        const newQty = product.quantity + quantity
        const { data, error } = await supabase.from("products").update({ quantity: newQty }).eq("id", product_id).eq("store_id", store_id).single()
        if (error) throw error.message
        if (data) return data
      }
      throw new Error("Product not found");
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.store_id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    getOptimisticData: (variables) => ({
      id: variables.product_id,
      store_id: variables.store_id,
      // Optimistic update for quantity is tricky without current state, 
      // but we can return the ID to trigger a re-render if needed.
      // Ideally we'd read the cache here.
      updated_at: new Date().toISOString(),
    } as any),
  })
}

export const useRestockProduct = () => {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    tableName: "products",
    action: "update",
    mutationFn: async ({
      id,
      quantity,
      storeId,
    }: {
      id: string;
      quantity: number;
      storeId: string;
    }) => {
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("store_id", storeId)
        .single();

      if (fetchError) throw fetchError;
      if (!product) throw new Error("Product not found");

      const newQuantity = product.quantity + quantity;

      const { data, error } = await supabase
        .from("products")
        .update({
          quantity: newQuantity,
        })
        .eq("id", id)
        .eq("store_id", storeId)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.storeId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });

      // Send notification about product restock
      try {
        await sendNotificationToStore(
          variables.storeId,
          `Product restocked: ${data.name} (+${variables.quantity} units)`,
          "restock",
          "/dashboard/inventory"
        );
      } catch (error) {
        console.error("Failed to send restock notification:", error);
      }
    },
    getOptimisticData: (variables) => ({
      id: variables.id,
      store_id: variables.storeId,
      // quantity: variables.quantity, // This is the added amount, not total. 
      updated_at: new Date().toISOString(),
    } as any),
  });
};

export const useRemoveExpiryDate = () => {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    tableName: "products",
    action: "update",
    mutationFn: async ({ id, storeId }: { id: string; storeId: string }) => {
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("store_id", storeId)
        .single();
      if (fetchError) throw fetchError;
      if (!product) throw new Error("Product not found");
      const { data, error } = await supabase
        .from("products")
        .update({ expiring_date: null })
        .eq("id", id)
        .eq("store_id", storeId)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.storeId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    getOptimisticData: (variables) => ({
      id: variables.id,
      store_id: variables.storeId,
      expiring_date: null,
      updated_at: new Date().toISOString(),
    } as any),
  });
};

export const useToggleFavouriteProduct = () => {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    tableName: "products",
    action: "update",
    mutationFn: async ({ id, store_id, favourite }: { id: string; store_id: string; favourite: boolean }) => {
      const { data, error } = await supabase
        .from("products")
        .update({ favourite })
        .eq("id", id)
        .eq("store_id", store_id)
        .select()
        .single();
      if (error) throw error;
      return data as Product;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products", variables.store_id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    getOptimisticData: (variables) => ({
      id: variables.id,
      store_id: variables.store_id,
      favourite: variables.favourite,
      updated_at: new Date().toISOString(),
    } as any),
  });
};

export const useUpdatePurchasePrice = () => {
  const queryClient = useQueryClient();
  return useOfflineMutation({
    tableName: "products",
    action: "update",
    mutationFn: async ({
      id,
      purchased_price,
      store_id,
    }: {
      id: string;
      purchased_price: number;
      store_id: string;
    }) => {
      const { data, error } = await supabase
        .from("products")
        .update({ purchased_price })
        .eq("id", id)
        .eq("store_id", store_id)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: (_, variables) => {
      // Invalidate both the specific product and the products list
      queryClient.invalidateQueries({ queryKey: ["products", variables.store_id] });
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    getOptimisticData: (variables) => ({
      id: variables.id,
      store_id: variables.store_id,
      purchased_price: variables.purchased_price,
      updated_at: new Date().toISOString(),
    } as any),
  });
};
