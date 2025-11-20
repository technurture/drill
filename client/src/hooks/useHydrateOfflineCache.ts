import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { actionQueueRepository } from '@/offline/queue/ActionQueueRepository';
import type { ActionEnvelope } from '@/offline/types';

/**
 * Hydrates React Query cache from IndexedDB on app initialization.
 * This ensures offline data persists across page refreshes.
 */
export const useHydrateOfflineCache = () => {
  const queryClient = useQueryClient();
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;

    const hydrate = async () => {
      try {
        console.log('🔄 Hydrating offline cache from IndexedDB...');
        const pendingActions = await actionQueueRepository.getPending();
        
        if (pendingActions.length === 0) {
          console.log('✅ No pending offline actions to hydrate');
          return;
        }

        console.log(`📦 Found ${pendingActions.length} pending offline actions`);

        pendingActions.forEach((action: ActionEnvelope) => {
          const { type, payload, storeId } = action;

          if (type === 'CREATE_SALE' && storeId) {
            console.log('💾 Hydrating offline sale:', payload);
            
            queryClient.setQueryData(['sales', storeId], (oldData: any) => {
              if (!oldData || !Array.isArray(oldData)) {
                return [payload];
              }
              
              const exists = oldData.some((item: any) => item.id === (payload as any).id);
              if (exists) {
                return oldData;
              }
              
              return [payload, ...oldData];
            });
          }

          if (type === 'ADD_FINANCIAL_RECORD' && storeId) {
            console.log('💾 Hydrating offline financial record:', payload);
            
            queryClient.setQueryData(['financial-records', storeId], (oldData: any) => {
              if (!oldData || !Array.isArray(oldData)) {
                return [payload];
              }
              
              const exists = oldData.some((item: any) => item.id === (payload as any).id);
              if (exists) {
                return oldData;
              }
              
              return [payload, ...oldData];
            });
          }

          if (type === 'CREATE_PRODUCT' && storeId) {
            console.log('💾 Hydrating offline product:', payload);
            
            queryClient.setQueryData(['products', storeId], (oldData: any) => {
              if (!oldData || !Array.isArray(oldData)) {
                return [payload];
              }
              
              const exists = oldData.some((item: any) => item.id === (payload as any).id);
              if (exists) {
                return oldData;
              }
              
              return [payload, ...oldData];
            });
          }

          if (type === 'UPDATE_PRODUCT' && storeId) {
            console.log('💾 Hydrating product update:', payload);
            
            queryClient.setQueryData(['products', storeId], (oldData: any) => {
              if (!oldData || !Array.isArray(oldData)) {
                return oldData;
              }
              
              return oldData.map((item: any) => 
                item.id === (payload as any).id ? { ...item, ...(payload as any) } : item
              );
            });
          }

          if (type === 'DELETE_PRODUCT' && storeId) {
            console.log('💾 Hydrating product deletion:', payload);
            
            queryClient.setQueryData(['products', storeId], (oldData: any) => {
              if (!oldData || !Array.isArray(oldData)) {
                return oldData;
              }
              
              return oldData.filter((item: any) => item.id !== (payload as any).id);
            });
          }
        });

        console.log(`✅ Successfully hydrated ${pendingActions.length} offline operations into cache`);
      } catch (error) {
        console.error('❌ Failed to hydrate offline cache:', error);
      }
    };

    hydrate();
  }, [queryClient]);
};
