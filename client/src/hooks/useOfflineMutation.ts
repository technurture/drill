import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useOfflineStatus } from "./useOfflineStatus";
import { actionQueueRepository } from "@/offline/queue/ActionQueueRepository";
import { ActionType } from "@/offline/types";
import { toast } from "sonner";

interface OfflineMutationConfig<TData, TVariables> {
  tableName: string;
  action: 'create' | 'update' | 'delete' | 'withdraw_full' | 'withdraw_partial';
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  getOptimisticData?: (variables: TVariables) => TData;
}

// Map table name and action to ActionType
function getActionType(tableName: string, action: string): ActionType {
  const mapping: Record<string, ActionType> = {
    'products-create': 'CREATE_PRODUCT',
    'products-update': 'UPDATE_PRODUCT',
    'products-delete': 'DELETE_PRODUCT',
    'sales-create': 'CREATE_SALE',
    'sales-update': 'UPDATE_SALE',
    'sales-delete': 'DELETE_SALE',
    'stores-create': 'CREATE_STORE',
    'stores-update': 'UPDATE_STORE',
    'financial_records-create': 'ADD_FINANCIAL_RECORD',
    'financial_records-update': 'UPDATE_FINANCIAL_RECORD',
    'financial_records-delete': 'DELETE_FINANCIAL_RECORD',
    'loans-create': 'CREATE_LOAN',
    'loans-update': 'UPDATE_LOAN',
    'loans-delete': 'DELETE_LOAN',
    'loan_repayments-create': 'ADD_LOAN_REPAYMENT',
    'savings_plans-create': 'CREATE_SAVINGS_PLAN',
    'savings_plans-delete': 'DELETE_SAVINGS_PLAN',
    'savings_contributions-create': 'ADD_SAVINGS_CONTRIBUTION',
    'savings_contributions-delete': 'DELETE_SAVINGS_CONTRIBUTION',
    'savings_withdrawals-create': 'WITHDRAW_SAVINGS',
    'savings_withdrawals-withdraw_full': 'WITHDRAW_SAVINGS',
    'savings_withdrawals-withdraw_partial': 'WITHDRAW_PARTIAL_SAVINGS',
  };
  
  const key = `${tableName}-${action}`;
  const actionType = mapping[key];
  
  if (!actionType) {
    throw new Error(`Unknown action type for ${key}`);
  }
  
  return actionType;
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
      // CRITICAL: Re-check navigator.onLine at call time for most accurate status
      // The hook's isOnline may be stale if network changed after component render
      // Use OR logic: if EITHER says offline, treat as offline; safer than AND
      const navigatorOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      const hookOffline = isOnline === false;
      const currentlyOffline = navigatorOffline || hookOffline;
      
      if (currentlyOffline) {
        console.log(`📴 Offline: Queueing ${config.action} operation for ${config.tableName}`);
        
        // Queue the FULL operation payload for later sync - preserve all nested data
        const queueData: any = { ...variables };
        
        // Generate temporary ID if creating a new record
        if (config.action === 'create' && !queueData.id) {
          queueData.id = crypto.randomUUID();
        }
        
        // CRITICAL: For sales with items, generate stable IDs for each item
        // This ensures we can track which items were synced during retries
        if (config.tableName === 'sales' && queueData.items) {
          queueData.items = queueData.items.map((item: any) => ({
            ...item,
            id: item.id || crypto.randomUUID(), // Generate stable ID for deduplication
          }));
        }
        
        // Queue using the new ActionQueue system
        const actionType = getActionType(config.tableName, config.action);
        await actionQueueRepository.enqueue(actionType, queueData, {
          userId: (queueData as any).user_id,
          storeId: (queueData as any).store_id,
          maxRetries: 3,
        });
        
        // Log queued data for verification (truncate for readability)
        const dataPreview = JSON.stringify(queueData, null, 2).substring(0, 300);
        console.log(`✅ Queued for sync: ${config.action} on ${config.tableName} (${actionType})`, dataPreview);
        
        // Generate optimistic data for UI responsiveness
        const optimisticData = config.getOptimisticData?.(variables) ?? queueData;
        
        // CRITICAL: Apply optimistic update to React Query cache immediately
        // Use setQueriesData with predicate to update all matching queries safely
        const storeId = (variables as any).store_id || (variables as any).storeId;
        if (storeId) {
          if (config.action === 'create') {
            // Add new item to all matching query caches
            queryClient.setQueriesData(
              { queryKey: [config.tableName, storeId] },
              (oldData: any) => {
                if (!oldData) return [optimisticData];
                return Array.isArray(oldData) ? [...oldData, optimisticData] : [optimisticData];
              }
            );
          } else if (config.action === 'update') {
            // Update existing item in all matching query caches
            queryClient.setQueriesData(
              { queryKey: [config.tableName, storeId] },
              (oldData: any) => {
                if (!oldData) return [optimisticData];
                if (Array.isArray(oldData)) {
                  return oldData.map((item: any) => 
                    item.id === (optimisticData as any).id ? { ...item, ...optimisticData } : item
                  );
                }
                return optimisticData;
              }
            );
          } else if (config.action === 'delete') {
            // Remove item from all matching query caches
            queryClient.setQueriesData(
              { queryKey: [config.tableName, storeId] },
              (oldData: any) => {
                if (!oldData) return [];
                if (Array.isArray(oldData)) {
                  return oldData.filter((item: any) => item.id !== (optimisticData as any).id);
                }
                return [];
              }
            );
          }
          
          // Invalidate dashboard and all related queries to refresh dependent data
          queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'none' });
          
          console.log(`🎯 Applied optimistic update to cache for ${config.tableName}`);
        }
        
        // Show user-friendly toast notification
        const actionText = config.action === 'create' ? 'created' : config.action === 'update' ? 'updated' : 'deleted';
        toast.success(`Action ${actionText} and saved locally!`, {
          description: 'Your data will sync automatically when you come back online.',
          duration: 5000,
        });
        
        return optimisticData as TData;
      }
      
      // Online: Execute the mutation normally
      console.log(`🌐 Online: Executing ${config.action} on ${config.tableName}`);
      return await config.mutationFn(variables);
    },
    onSuccess: (data, variables) => {
      const navigatorOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      const hookOffline = isOnline === false;
      const currentlyOffline = navigatorOffline || hookOffline;
      
      if (currentlyOffline) {
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
