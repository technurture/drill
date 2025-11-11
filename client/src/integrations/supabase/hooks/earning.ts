import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { earningType } from "@/types/database.types";

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};
export const useGetEarnings = (userId: string) =>
  useQuery({
    queryKey: ["earnings", userId],
    queryFn: () =>
      fromSupabase(supabase.from("earnings").select("*").eq("user_id", userId)),
  });
export const useAddEarnings = () => {
  return useMutation({
    mutationFn: async (earningDetails: earningType) => {
      fromSupabase(supabase.from("earnings").insert([earningDetails]).select());
    },
  });
};
export const useUpdateEarnings = () => {
  return useMutation({
    mutationFn: async (updates: {
      total_earnings: number;
      available_balance: number;
      user_id: string;
    }) => {
      fromSupabase(
        supabase
          .from("earnings")
          .update({
            total_earnings: updates.total_earnings,
            available_balance: updates.available_balance,
          })
          .eq("user_id", updates.user_id)
          .select(),
      );
    },
  });
};
