import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { useEffect } from "react";

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

export interface Notification {
  id: number;
  user_id: string;
  message: string;
  type:
    | "sale"
    | "note"
    | "subscription"
    | "low_stock_threshold"
    | "expiring_date"
    | "sales_rep_auth";
  read: boolean;
  created_at: string;
  store_id: string;
}

export const useAddNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (notification: {
      user_id: string;
      message: string;
      type:
        | "sale"
        | "note"
        | "subscription"
        | "sales_rep_auth"
        | "low_stock_threshold";
      read?: boolean;
      store_id: string;
    }) => {
      const { data, error } = await supabase
        .from("notifications")
        .insert([{ ...notification, read: false }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useUpdateNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; read: boolean }) => {
      const { data, error } = await supabase
        .from("notifications")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};

export const useNotifications = (userId: string, storeId: string) =>
  useQuery({
    queryKey: ["notifications", userId, storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!userId && !!storeId,
  });
export const useGetUnread = (userId: string, storeId: string, read: boolean) =>
  useQuery({
    queryKey: ["notifications", userId, storeId, read],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("store_id", storeId)
        .eq("read", read)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
export const useUnreadNotificationsCount = (userId: string, storeId: string) =>
  useQuery({
    queryKey: ["unreadNotifications", userId, storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .eq("store_id", storeId)
        .eq("read", false);
      if (error) throw error;
      return data?.length || 0;
    },
    enabled: !!userId && !!storeId,
  });

export const useGetDeviceToken = (userid: string | undefined) =>
  useQuery({
    queryKey: ["devices_token", userid],
    queryFn: () =>
      fromSupabase(
        supabase.from("devices_token").select("*").eq("user_id", userid),
      ),
    enabled: Boolean(userid),
  });
