import { useQuery } from "@tanstack/react-query";
import { supabase } from "../supabase";

export const useLocations = () =>
  useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching locations:", error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

export const useMarketsByLocation = (locationId: string) =>
  useQuery({
    queryKey: ["markets", locationId],
    queryFn: async () => {
      if (!locationId) return [];
      
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .eq("location_id", locationId)
        .order("name");

      if (error) {
        console.error("Error fetching markets:", error);
        throw error;
      }

      return data || [];
    },
    enabled: Boolean(locationId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  }); 