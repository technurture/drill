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
      // ALSO need to update ["savings-plans", storeId] since that's what the UI displays
      if ((variables as any).savings_plan_id) {
        keys.push(["savings-contributions", (variables as any).savings_plan_id]);
      }
      if (storeId) {
        keys.push(["savings-plans", storeId]);
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
    networkMode: 'always',
    mutationFn: async (variables: TVariables) => {
      console.log(`🚀 mutationFn STARTED for ${config.tableName} ${config.action}`);
      const currentlyOffline = !navigator.onLine || !isOnline;
      // Try to execute online first if we think we are online
      if (!currentlyOffline) {
        try {
          console.log(`🌐 ONLINE: Executing ${config.action} on ${config.tableName}`);

          // Define a timeout for the online operation to handle "Lie-fi" (connected but no internet)
          const ONLINE_TIMEOUT = 5000; // 5 seconds

          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Network request timed out')), ONLINE_TIMEOUT);
          });

          // Race the actual mutation against the timeout
          const result = await Promise.race([
            config.mutationFn(variables),
            timeoutPromise
          ]);

          console.log(`✅ ONLINE: Operation successful for ${config.tableName}`);
          return result as TData;
        } catch (error: any) {
          console.warn(`⚠️ Online operation failed:`, error);

          // Check if it's a network-related error that justifies offline queuing
          const isNetworkError =
            error.message?.includes('Failed to fetch') ||
            error.message?.includes('Network request failed') ||
            error.message?.includes('connection') ||
            error.message?.includes('offline') ||
            error.message?.includes('timed out') ||
            !navigator.onLine; // Double check navigator status

          if (isNetworkError) {
            console.log(`📴 Network error detected (or timeout), falling back to offline queue...`);
            // Fallthrough to offline logic below
          } else {
            // If it's a logic error (e.g. validation), rethrow
            throw error;
          }
        }
      }

      // Offline Logic (either initially offline or fell back due to error)
      console.log(`📴 📴 📴 OFFLINE: Queueing ${config.action} operation for ${config.tableName}`);

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

                // Special case: Skip savings-plans update for contributions (handled separately below)
                if (config.tableName === 'savings_contributions' && queryKey[0] === 'savings-plans') {
                  console.log(`⏭️ Skipping general CREATE for savings-plans - will handle specially`);
                  return oldData;
                }

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
          // Special case: savings_contributions need to update nested contributions array in savings-plans
          if (config.tableName === 'savings_contributions' && config.action === 'create') {
            const planId = (variables as any).savings_plan_id;
            if (planId) {
              queryClient.setQueryData(['savings-plans', storeId], (oldData: any) => {
                if (!oldData || !Array.isArray(oldData)) return oldData;
                console.log(`📝 Updating nested contributions for plan ${planId} in savings-plans query`);
                return oldData.map((plan: any) =>
                  plan.id === planId
                    ? {
                      ...plan,
                      contributions: [optimisticData, ...(plan.contributions || [])]
                    }
                    : plan
                );
              });
            }
          }

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

          // IMPORTANT: While offline, we rely ONLY on cache updates without invalidation
          // Invalidation while offline would trigger React Query to try to refetch
          // We'll invalidate after syncing when back online
          console.log(`📦 DEBUG: Optimistic cache update applied to ${queryKeys.length} query keys`);
          queryKeys.forEach((queryKey, index) => {
            const cachedData = queryClient.getQueryData(queryKey);
            console.log(`   ✅ Query ${index + 1}: ${JSON.stringify(queryKey)} now has ${Array.isArray(cachedData) ? cachedData.length : 0} items`);
          });

          console.log(`🎯 Offline optimistic update complete for ${config.action} on ${config.tableName} (${queryKeys.length} cache entries updated, invalidation deferred until sync)`);
        }

        console.log(`✅ ✅ ✅ Offline operation completed successfully for ${config.tableName}`);
        console.log(`🔍 Returning optimistic data:`, optimisticData);
        console.log(`🔍 About to return from mutationFn, this should trigger onSuccess...`);

        return optimisticData as TData;
      } catch (error) {
        console.error(`❌ Failed to queue offline operation:`, error);
        throw new Error(`Failed to save offline: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    onSuccess: (data, variables) => {
      const currentlyOffline = !navigator.onLine || !isOnline;

      console.log(`🎉 🎉 🎉 useOfflineMutation onSuccess TRIGGERED for ${config.tableName}`);
      console.log(`🔍 onSuccess - offline: ${currentlyOffline}, data:`, data);

      if (currentlyOffline) {
        console.log(`📴 Offline operation queued successfully for ${config.tableName}`);
      } else {
        console.log(`✅ Online operation completed for ${config.tableName}`);
      }

      console.log(`🔍 About to call config.onSuccess callback...`);
      if (config.onSuccess) {
        console.log(`🔍 config.onSuccess exists, calling it now...`);
        config.onSuccess(data, variables);
        console.log(`🔍 config.onSuccess callback completed`);
      } else {
        console.log(`⚠️ config.onSuccess is undefined - no callback to call`);
      }
    },
    onError: (error: Error, variables) => {
      console.error(`❌ ❌ ❌ useOfflineMutation onError TRIGGERED for ${config.tableName}:`, error);
      const currentlyOffline = !navigator.onLine || !isOnline;

      if (currentlyOffline) {
        toast.error('Failed to save offline', {
          description: error.message || 'Please try again',
        });
      }

      console.log(`🔍 About to call config.onError callback...`);
      if (config.onError) {
        console.log(`🔍 config.onError exists, calling it now...`);
        config.onError(error, variables);
        console.log(`🔍 config.onError callback completed`);
      } else {
        console.log(`⚠️ config.onError is undefined - no callback to call`);
      }
    },
  });
}
