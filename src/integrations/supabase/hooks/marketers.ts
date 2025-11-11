import { marketerTableType } from "@/types/database.types";
import { supabase } from "../supabase";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  };

  export const useAddFinancialInclusion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async(data: marketerTableType) => 
            fromSupabase(supabase.from("Financial_Inclusion_board").insert(data).select()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["Financial_Inclusion_board"] });
          },
    })
  }
  export const useUpdateFinancialInclusion = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async(updates: {payment_status: string, amount_paid: string, reward: string, email: string}) => 
            fromSupabase(supabase.from("Financial_Inclusion_board").update({
                ...updates
            }).eq("email", updates.email).select()),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["Financial_Inclusion_board"] });
              },        
    })
  }
  export const useGetMarketerUsers = (email: string) => 
    useQuery({
        queryKey: ["Financial_Inclusion_board", email],
        queryFn: async() => 
            fromSupabase(supabase.from("Financial_Inclusion_board").select("*").eq("email", email).single())
})