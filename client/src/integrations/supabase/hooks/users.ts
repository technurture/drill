import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase";
import { string } from "zod";

const fromSupabase = async (query) => {
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

/*
### users

| name       | type                     | format | required |
|------------|--------------------------|--------|----------|
| id         | uuid                     | string | true     |
| email      | text                     | string | true     |
| role       | text                     | string | true     |
| created_at | timestamp with time zone | string | true     |
*/

export const useUser = (id: string | undefined) =>
  useQuery({
    queryKey: ["users", id],
    queryFn: () =>
      fromSupabase(supabase.from("users").select("*").eq("id", id).single()),
    enabled: Boolean(id),
  });

export const useUsers = () =>
  useQuery({
    queryKey: ["users"],
    queryFn: () => fromSupabase(supabase.from("users").select("*")),
  });

export const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newUser: { email: string; role: string }) =>
      fromSupabase(supabase.from("users").insert([newUser])),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...updateData
    }: {
      id: string;
      email?: string;
      role?: string;
    }) => fromSupabase(supabase.from("users").update(updateData).eq("id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
export const useHideBalance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hide_balance }: { id: string; hide_balance: boolean }) =>
      fromSupabase(
        supabase
          .from("users")
          .update({ hide_balance: hide_balance })
          .eq("id", id),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fromSupabase(supabase.from("users").delete().eq("id", id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useAgents = () =>
  useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email")
        .or("is_agent.eq.true,name.not.is.null")
        .order("name");

      if (error) {
        console.error("Error fetching agents:", error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const useCurrentUser = (userId: string) =>
  useQuery({
    queryKey: ["current-user", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("useCurrentUser: No userId provided");
        return null;
      }
      
      console.log("useCurrentUser: Fetching user with ID:", userId);
      
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("useCurrentUser: Error fetching current user:", error);
        throw error;
      }

      console.log("useCurrentUser: Fetched user data:", data);
      return data;
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const useUpdatePushNotificationPreference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, push_notifications_enabled }: { id: string; push_notifications_enabled: boolean }) =>
      fromSupabase(
        supabase
          .from("users")
          .update({ push_notifications_enabled })
          .eq("id", id),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};
