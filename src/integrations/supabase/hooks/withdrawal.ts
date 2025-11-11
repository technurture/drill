import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { withdrawalType } from "@/types/database.types";

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export const useAddWithdrawal = () => {
  return useMutation({
    mutationFn: async (details: withdrawalType) => {
      fromSupabase(
        supabase.from("withdrawal_board").insert([details]).select(),
      );
    },
  });
};
export const useGetWithdrawalStatus = (userId: string) =>
  useQuery({
    queryKey: ["withdrawal_board", userId, "status"],
    queryFn: () =>
      fromSupabase(
        supabase
          .from("withdrawal_board")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "pending"),
      ),
  });
