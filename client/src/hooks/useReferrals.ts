import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/supabase";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

interface Referral {
  referral_id: string;
  referrer_id: string;
  referral_code: string;
  is_subscribed: boolean;
  amount: number;
  created_at: string;
  referred_user: {
    email: string;
  };
}

interface Earnings {
  total_earnings: number;
  available_balance: number;
}

export const useReferrals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const getReferralCode = () =>
    useQuery({
      queryKey: ["referralCode", user?.id],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from("users")
            .select("referrer_code")
            .eq("id", user?.id)
            .single();

          if (error) {
            console.error("Error fetching referral code:", error);
            return "";
          }
          return data?.referrer_code || "";
        } catch (error) {
          console.error("Error in getReferralCode:", error);
          return "";
        }
      },
      enabled: !!user?.id,
    });

  const getReferrals = () =>
    useQuery<Referral[]>({
      queryKey: ["referral_board", user?.id],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from("referral_board")
            .select("*, referred_user:referred_user(email)")
            .eq("referral_id", user?.id);

          if (error) {
            console.error("Error fetching referrals:", error);
            return [];
          }
          return (data as Referral[]) || [];
        } catch (error) {
          console.error("Error in getReferrals:", error);
          return [];
        }
      },
      enabled: !!user?.id,
    });

  const getEarnings = () =>
    useQuery<Earnings>({
      queryKey: ["earnings", user?.id],
      queryFn: async () => {
        try {
          const { data, error } = await supabase
            .from("earnings")
            .select("*")
            .eq("user_id", user?.id)
            .maybeSingle();

          if (error && error.code !== "PGRST116") {
            console.error("Error fetching earnings:", error);
          }

          return (
            data || {
              total_earnings: 0,
              available_balance: 0,
            }
          );
        } catch (error) {
          console.error("Error in getEarnings:", error);
          return {
            total_earnings: 0,
            available_balance: 0,
          };
        }
      },
      enabled: !!user?.id,
    });

  const createReferral = useMutation({
    mutationFn: async (referralCode: string) => {
      try {
        // First, get the referrer's user ID based on the referral code
        const { data: referrerUser, error: referrerError } = await supabase
          .from("users")
          .select("*")
          .eq("referrer_code", referralCode)
          .single();

        if (referrerError || !referrerUser) {
          toast.error("Invalid referral code");
          throw new Error("Invalid referral code");
        }

        // Check if this user has already been referred
        const { data: existingReferral, error: existingError } = await supabase
          .from("referral_board")
          .select("*")
          .eq("referred_id", user?.id);
        if (existingReferral) {
          toast.error("You have already used a referral code");
          throw new Error("Already referred");
        }

        // Create the referral record
        const { error: referralError } = await supabase
          .from("referral_board")
          .insert([
            {
              referral_id: referrerUser.id,
              referred_user: user?.id,
              referral_code: referralCode,
              is_subscribed: false,
              amount: 0,
            },
          ])
          .select();

        if (referralError) {
          toast.error("Error creating referral");
          throw referralError;
        }
        toast.success("Referral code applied successfully");
      } catch (error: any) {
        console.error("Error in createReferral:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referral_board"] });
      queryClient.invalidateQueries({ queryKey: ["earnings"] });
    },
  });

  return {
    getReferrals,
    getEarnings,
    createReferral,
    getReferralCode,
  };
};


