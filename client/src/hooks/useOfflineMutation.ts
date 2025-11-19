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
            if (config.action === 'create') {
              queryClient.setQueriesData(
                { queryKey: [config.tableName, storeId] },
                (oldData: any) => {
                  if (!oldData) return [optimisticData];
                  return Array.isArray(oldData) ? [...oldData, optimisticData] : [optimisticData];
                }
              );
            } else if (config.action === 'update') {
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
            
            queryClient.invalidateQueries({ queryKey: ['dashboard'], refetchType: 'none' });
            
            console.log(`🎯 Applied optimistic update to cache for ${config.tableName}`);
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
