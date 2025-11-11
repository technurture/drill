import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### sale_items

| name       | type    | format  | required |
|------------|---------|---------|----------|
| id         | uuid    | string  | true     |
| sale_id    | uuid    | string  | false    |
| product_id | uuid    | string  | false    |
| quantity   | integer | integer | true     |
| unit_price | numeric | number  | true     |

Foreign Key Relationships:
- sale_id references sales.id
- product_id references products.id
*/

export const useSaleItem = (id: string) =>
  useQuery({
    queryKey: ["sale_items", id],
    queryFn: () =>
      fromSupabase(
        supabase.from("sale_items").select("*").eq("id", id).single(),
      ),
  });

export const useSaleItems = () =>
  useQuery({
    queryKey: ["sale_items"],
    queryFn: () => fromSupabase(supabase.from("sale_items").select("*")),
  });

export const useAddSaleItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newSaleItem: {
      sale_id?: string;
      product_id?: string;
      quantity: number;
      unit_price: number;
    }) => fromSupabase(supabase.from("sale_items").insert([newSaleItem])),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale_items"] });
    },
  });
};

export const useUpdateSaleItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...updateData
    }: {
      id: string;
      sale_id?: string;
      product_id?: string;
      quantity?: number;
      unit_price?: number;
    }) =>
      fromSupabase(supabase.from("sale_items").update(updateData).eq("id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale_items"] });
    },
  });
};

export const useDeleteSaleItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fromSupabase(supabase.from("sale_items").delete().eq("id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sale_items"] });
    },
  });
};
