import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### sales_reps

| name       | type                     | format | required |
|------------|--------------------------|--------|----------|
| id         | uuid                     | string | true     |
| name       | text                     | string | true     |
| user_id    | uuid                     | string | false    |
| created_at | timestamp with time zone | string | true     |

Foreign Key Relationships:
- user_id references users.id
*/

export const useSalesRep = (id: string) =>
  useQuery({
    queryKey: ["sales_reps", id],
    queryFn: () =>
      fromSupabase(
        supabase.from("sales_reps").select("*").eq("id", id).single(),
      ),
  });

export const useSalesReps = () =>
  useQuery({
    queryKey: ["sales_reps"],
    queryFn: () => fromSupabase(supabase.from("sales_reps").select("*")),
  });

export const useAddSalesRep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newSalesRep: { name: string; user_id?: string }) =>
      fromSupabase(supabase.from("sales_reps").insert([newSalesRep])),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_reps"] });
    },
  });
};

export const useUpdateSalesRep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...updateData
    }: {
      id: string;
      name?: string;
      user_id?: string;
    }) =>
      fromSupabase(supabase.from("sales_reps").update(updateData).eq("id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_reps"] });
    },
  });
};

export const useDeleteSalesRep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fromSupabase(supabase.from("sales_reps").delete().eq("id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales_reps"] });
    },
  });
};

export const useCheckSalesRep = (email: string) => 
  useQuery({
    queryKey: ["sales_rep", email],
    queryFn: () => fromSupabase(supabase.from("store_sales_reps").select("*").eq("email", email))
  })
