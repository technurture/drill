import { useMutation, useQueryClient, UseMutationOptions } from "@tanstack/react-query";
import { useOfflineStatus } from "./useOfflineStatus";
import { actionQueueRepository } from "@/offline/queue/ActionQueueRepository";
import { ActionType } from "@/offline/types";
import { toast } from "sonner";

// Helper function to get all possible query keys for a table that should receive optimistic updates
// Only targets base query keys (e.g., ["products", storeId]) not filtered views
function getQueryKeysForTable(tableName: string, storeId: string, variables: any): any[][] {
  const keys: any[][] = [];
  
  switch (tableName) {
    case 'products':
      // Products use: ["products", storeId]
      keys.push(["products", storeId]);
      break;
      
    case 'sales':
      // Sales use: ["sales", storeId], ["sales", storeId, time], ["sales", storeId, time, name]
      // Only update base query - filtered queries will update via invalidation
      keys.push(["sales", storeId]);
      break;
      
    case 'financial_records':
      // Finance uses: ["financial-records", storeId], ["financial-summary", storeId]
      // Only update the records list - summary will update via invalidation
      keys.push(["financial-records", storeId]);
      break;
      
    case 'loans':
      // Loans use: ["loans", storeId], ["loan", loanId], ["loans-summary", storeId]
      // Only update the loans list - summary will update via invalidation
      keys.push(["loans", storeId]);
      break;
      
    case 'loan_repayments':
      // Loan repayments use: ["loan-repayments", loanId], ["loan-repayments-by-store", storeId]
      if ((variables as any).loan_id) {
        keys.push(["loan-repayments", (variables as any).loan_id]);
      }
      if (storeId) {
        keys.push(["loan-repayments-by-store", storeId]);
      }
      break;
      
    case 'savings_plans':
      // Savings plans use: ["savings-plans", storeId], ["savings-plan", planId]
      keys.push(["savings-plans", storeId]);
      break;
      
    case 'savings_contributions':
      // Savings contributions use: ["savings-contributions", planId]
      if ((variables as any).savings_plan_id) {
        keys.push(["savings-contributions", (variables as any).savings_plan_id]);
      }
      break;
      
    case 'savings_withdrawals':
      // Savings withdrawals use: ["savings-withdrawals", planId]
      if ((variables as any).planId || (variables as any).savings_plan_id) {
        const planId = (variables as any).planId || (variables as any).savings_plan_id;
        keys.push(["savings-withdrawals", planId]);
      }
      break;
      
    case 'stores':
      // Stores use: ["stores", userId], ["stores", storeId]
      keys.push(["stores", storeId]);
      break;
      
    default:
      // Fallback to simple key structure
      keys.push([tableName, storeId]);
      break;
  }
  
  return keys;
}

// Helper function to get summary/aggregate query keys that should be invalidated (not optimistically updated)
function getSummaryQueryKeys(tableName: string, storeId: string): any[][] {
  const keys: any[][] = [];
  
  switch (tableName) {
    case 'financial_records':
      keys.push(["financial-summary", storeId]);
      break;
      
    case 'loans':
    case 'loan_repayments':
      keys.push(["loans-summary", storeId]);
      break;
      
    case 'savings_plans':
    case 'savings_contributions':
    case 'savings_withdrawals':
      keys.push(["savings-summary", storeId]);
      break;
      
    case 'sales':
      // Sales might affect financial records
      keys.push(["financial-records", storeId]);
      keys.push(["financial-summary", storeId]);
      break;
  }
  
  return keys;
}

interface OfflineMutationConfig<TData, TVariables> {
  tableName: string;
  action: 'create' | 'update' | 'delete' | 'withdraw_full' | 'withdraw_partial';
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  getOptimisticData?: (variables: TVariables) => TData;
}

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

export function useOfflineMutation<TData = unknown, TVariables = unknown>(
  config: OfflineMutationConfig<TData, TVariables>
) {
  const { isOnline } = useOfflineStatus();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      const currentlyOffline = !navigator.onLine || !isOnline;
      
      console.log(`🔍 Mutation check - navigator.onLine: ${navigator.onLine}, hook isOnline: ${isOnline}, treating as offline: ${currentlyOffline}`);
      
      if (currentlyOffline) {
        console.log(`📴 OFFLINE: Queueing ${config.action} operation for ${config.tableName}`);
        
        const queueData: any = { ...variables };
        
        if (config.action === 'create' && !queueData.id) {
          queueData.id = crypto.randomUUID();
        }
        
        if (config.tableName === 'sales' && queueData.items) {
          queueData.items = queueData.items.map((item: any) => ({
            ...item,
            id: item.id || crypto.randomUUID(),
          }));
        }
        
        const actionType = getActionType(config.tableName, config.action);
        
        try {
          await actionQueueRepository.enqueue(actionType, queueData, {
            userId: (queueData as any).user_id,
            storeId: (queueData as any).store_id,
            maxRetries: 3,
          });
          
          const dataPreview = JSON.stringify(queueData, null, 2).substring(0, 300);
          console.log(`✅ Queued for sync: ${config.action} on ${config.tableName} (${actionType})`, dataPreview);
          
          const optimisticData = config.getOptimisticData?.(variables) ?? queueData;
          
          const storeId = (variables as any).store_id || (variables as any).storeId;
          if (storeId) {
            // Get all possible query keys for this resource
            const queryKeys = getQueryKeysForTable(config.tableName, storeId, variables);
            
            // Apply optimistic update to all relevant query keys
            queryKeys.forEach(queryKey => {
              if (config.action === 'create') {
                queryClient.setQueryData(queryKey, (oldData: any) => {
                  console.log(`📝 Applying optimistic CREATE to key:`, queryKey, 'Old data type:', typeof oldData, 'is array:', Array.isArray(oldData));
                  // Guard: Only update if oldData is an array or undefined
                  if (oldData === undefined || oldData === null) return [optimisticData];
                  if (!Array.isArray(oldData)) {
                    console.warn('⚠️ Skipping optimistic CREATE - cache is not an array:', queryKey);
                    return oldData;
                  }
                  return [optimisticData, ...oldData];
                });
              } else if (config.action === 'update') {
                queryClient.setQueryData(queryKey, (oldData: any) => {
                  console.log(`📝 Applying optimistic UPDATE to key:`, queryKey, 'Old data type:', typeof oldData, 'is array:', Array.isArray(oldData));
                  // Guard: Only update if oldData is an array
                  if (!Array.isArray(oldData)) {
                    console.warn('⚠️ Skipping optimistic UPDATE - cache is not an array:', queryKey);
                    return oldData;
                  }
                  return oldData.map((item: any) => 
                    item.id === (optimisticData as any).id ? { ...item, ...optimisticData } : item
                  );
                });
              } else if (config.action === 'delete') {
                queryClient.setQueryData(queryKey, (oldData: any) => {
                  console.log(`📝 Applying optimistic DELETE to key:`, queryKey, 'Old data type:', typeof oldData, 'is array:', Array.isArray(oldData));
                  // Guard: Only update if oldData is an array
                  if (!Array.isArray(oldData)) {
                    console.warn('⚠️ Skipping optimistic DELETE - cache is not an array:', queryKey);
                    return oldData;
                  }
                  return oldData.filter((item: any) => item.id !== (optimisticData as any).id);
                });
              }
            });
            
            // Handle special cases
            if (config.action === 'withdraw_full' || config.action === 'withdraw_partial') {
              const planId = (variables as any).planId;
              if (planId && config.tableName === 'savings_withdrawals') {
                queryClient.setQueryData(['savings-plans', storeId], (oldData: any) => {
                  if (!oldData || !Array.isArray(oldData)) return oldData;
                  return oldData.map((plan: any) => 
                    plan.id === planId 
                      ? { ...plan, status: config.action === 'withdraw_full' ? 'withdrawn' : plan.status } 
                      : plan
                  );
                });
              }
            }
            
            // DON'T invalidate queries when offline - the optimistic cache data is the source of truth
            // Invalidation will happen after successful sync when back online in offlineSync.ts
            // Just log that we've updated the cache
            console.log(`🎯 Optimistic update applied for ${config.action} on ${config.tableName} (${queryKeys.length} cache entries updated, invalidation deferred until sync)`);
          }
          
          const actionText = config.action === 'create' ? 'created' : config.action === 'update' ? 'updated' : 'deleted';
          toast.success(`Saved offline!`, {
            description: `Your data has been saved locally and will sync when you're back online.`,
            duration: 4000,
          });
          
          console.log(`✅ Offline operation completed successfully for ${config.tableName}`);
          
          return optimisticData as TData;
        } catch (error) {
          console.error(`❌ Failed to queue offline operation:`, error);
          throw new Error(`Failed to save offline: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
      
      console.log(`🌐 ONLINE: Executing ${config.action} on ${config.tableName}`);
      return await config.mutationFn(variables);
    },
    onSuccess: (data, variables) => {
      const currentlyOffline = !navigator.onLine || !isOnline;
      
      if (currentlyOffline) {
        console.log(`📴 Offline operation queued successfully for ${config.tableName}`);
      } else {
        console.log(`✅ Online operation completed for ${config.tableName}`);
      }
      
      config.onSuccess?.(data, variables);
    },
    onError: (error: Error, variables) => {
      console.error(`❌ Mutation error for ${config.tableName}:`, error);
      const currentlyOffline = !navigator.onLine || !isOnline;
      
      if (currentlyOffline) {
        toast.error('Failed to save offline', {
          description: error.message || 'Please try again',
        });
      }
      
      config.onError?.(error, variables);
    },
  });
}
