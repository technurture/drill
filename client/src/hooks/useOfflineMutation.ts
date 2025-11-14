import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useOfflineStatus } from "./useOfflineStatus";
import { addToOfflineQueue } from "@/utils/indexedDB";

interface OfflineMutationConfig<TData, TVariables> {
  tableName: string;
  action: 'create' | 'update' | 'delete';
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  getOptimisticData?: (variables: TVariables) => TData;
}

/**
 * A wrapper around useMutation that automatically queues operations when offline
 * and syncs them when connection is restored.
 */
export function useOfflineMutation<TData = unknown, TVariables = unknown>(
  config: OfflineMutationConfig<TData, TVariables>
) {
  const { isOnline } = useOfflineStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      if (!isOnline) {
        console.log(`📴 Offline: Queueing ${config.action} operation for ${config.tableName}`);
        
        // Queue the operation for later sync
        const queueData: any = { ...variables };
        
        // Generate temporary ID if creating a new record
        if (config.action === 'create' && !queueData.id) {
          queueData.id = crypto.randomUUID();
        }
        
        await addToOfflineQueue(config.action, config.tableName, queueData);
        
        // Return optimistic data if available, otherwise return the queued data
        const optimisticData = config.getOptimisticData?.(variables) ?? queueData;
        
        console.log(`✅ Queued for sync: ${config.action} on ${config.tableName}`, optimisticData);
        return optimisticData as TData;
      }
      
      // Online: Execute the mutation normally
      console.log(`🌐 Online: Executing ${config.action} on ${config.tableName}`);
      return await config.mutationFn(variables);
    },
    onSuccess: (data, variables) => {
      if (!isOnline) {
        console.log(`📴 Offline operation queued successfully for ${config.tableName}`);
      } else {
        console.log(`✅ Online operation completed for ${config.tableName}`);
      }
      
      // Call custom success handler
      config.onSuccess?.(data, variables);
    },
    onError: (error: Error, variables) => {
      console.error(`❌ Mutation error for ${config.tableName}:`, error);
      config.onError?.(error, variables);
    },
  });
}
