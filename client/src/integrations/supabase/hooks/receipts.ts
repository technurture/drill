import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### receipts

| name          | type                     | format | required |
|---------------|--------------------------|--------|----------|
| id            | uuid                     | string | true     |
| sale_id       | uuid                     | string | false    |
| qr_code_link  | text                     | string | true     |
| created_at    | timestamp with time zone | string | true     |

Foreign Key Relationships:
- sale_id references sales.id
*/

export const useReceipt = (id: string) =>
  useQuery({
    queryKey: ["receipts", id],
    queryFn: () =>
      fromSupabase(supabase.from("receipts").select("*").eq("id", id).single()),
  });

export const useReceipts = () =>
  useQuery({
    queryKey: ["receipts"],
    queryFn: () => fromSupabase(supabase.from("receipts").select("*")),
  });

export const useAddReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newReceipt: { sale_id?: string; qr_code_link: string }) =>
      fromSupabase(supabase.from("receipts").insert([newReceipt])),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
  });
};

export const useUpdateReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...updateData
    }: {
      id: string;
      sale_id?: string;
      qr_code_link?: string;
    }) =>
      fromSupabase(supabase.from("receipts").update(updateData).eq("id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
  });
};

export const useDeleteReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fromSupabase(supabase.from("receipts").delete().eq("id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["receipts"] });
    },
  });
};
