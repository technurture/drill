import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useOfflineStatus } from "./useOfflineStatus";
import { actionQueueRepository } from "@/offline/queue/ActionQueueRepository";
import { ActionType } from "@/offline/types";
import { toast } from "sonner";

interface OfflineMutationConfig<TData, TVariables> {
  tableName: string;
  action: 'create' | 'update' | 'delete';
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
      if (!isOnline) {
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
        
        // Show user-friendly toast notification
        const actionText = config.action === 'create' ? 'created' : config.action === 'update' ? 'updated' : 'deleted';
        toast.success(`Action ${actionText} and saved locally!`, {
          description: 'Your data will sync automatically when you come back online.',
          duration: 5000,
        });
        
        // Return optimistic data for UI responsiveness
        const optimisticData = config.getOptimisticData?.(variables) ?? queueData;
        
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
