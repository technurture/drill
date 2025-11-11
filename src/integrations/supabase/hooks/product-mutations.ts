import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { Product } from "../../../types/database.types";

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useAddProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
    onSuccess: (_, variables) => {
      console.log("AddProduct mutation success, invalidating queries for store:", variables.store_id);
      queryClient.invalidateQueries({
        queryKey: ["products", variables.store_id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
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
  return useMutation({
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.store_id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, storeId }: { id: string; storeId: string }) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id)
        .eq("store_id", storeId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.storeId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useUpdateProductQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
  });
};

export const useReturnProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async({
      product_id,
      store_id,
      quantity
    }: {
      product_id: string,
      store_id: string,
      quantity: number
    }) => {
      const { data: product} = await supabase.from("products").select("*").eq("id", product_id).eq("store_id", store_id).single()
      if(product) {
        const newQty = product.quantity + quantity
        const { data, error } = await supabase.from("products").update({quantity: newQty}).eq("id", product_id).eq("store_id", store_id).single()
        if(error) throw error.message
        if(data) return data
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.store_id],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  })
}

export const useRestockProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["products", variables.storeId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};

export const useRemoveExpiryDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
  });
};

export const useToggleFavouriteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
  });
};

export const useUpdatePurchasePrice = () => {
  const queryClient = useQueryClient();
  return useMutation({
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
  });
};
