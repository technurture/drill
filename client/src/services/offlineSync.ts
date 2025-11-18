import { getOfflineQueue, markQueueItemSynced, removeQueueItem } from '@/utils/indexedDB';
import { supabase } from '@/integrations/supabase';
import { QueryClient } from '@tanstack/react-query';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

let queryClient: QueryClient | null = null;

export function setQueryClient(client: QueryClient) {
  queryClient = client;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Syncs all queued offline operations to Supabase.
 * 
 * Supported operations:
 * - Sales (complex): Has nested sale_items array - requires special handling
 * - Financial Records (simple): Income/expense records - standard insert
 * - Savings Plans (simple): Savings plan creation - standard insert
 * - Savings Contributions (simple): Contribution records - standard insert
 */
export async function syncOfflineData(): Promise<{ success: number; failed: number }> {
  const queue = await getOfflineQueue();
  let success = 0;
  let failed = 0;

  console.log(`🔄 Starting offline sync - ${queue.length} items in queue`);
  
  // Log queue summary for debugging
  if (queue.length > 0) {
    const summary = queue.reduce((acc, item) => {
      const key = `${item.table}-${item.action}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('📊 Queue summary:', summary);
  }

  for (const item of queue) {
    let attempts = 0;
    let synced = false;

    while (attempts < MAX_RETRY_ATTEMPTS && !synced) {
      try {
        const { action, table, data } = item;
        let result;

        // Handle special cases for tables with complex nested data
        if (table === 'sales' && action === 'create') {
          // Sales have nested sale_items that need to be handled separately
          const { items, financial_record_data, ...saleData } = data;

          // Check if sale already exists (from previous partial sync attempt)
          let sale = null;
          const { data: existingSale, error: lookupError } = await supabase
            .from('sales')
            .select('*')
            .eq('id', saleData.id)
            .maybeSingle();

          // Handle lookup errors - treat as retriable
          if (lookupError) {
            console.error(`Error checking for existing sale ${saleData.id}:`, lookupError);
            result = { error: lookupError };
          } else if (existingSale) {
            console.log(`✓ Sale ${saleData.id} already synced, proceeding to sync items`);
            sale = existingSale;
            result = { data: sale }; // Initialize result as success
          } else {
            // Insert the sale first
            const { data: newSale, error: saleError } = await supabase
              .from('sales')
              .insert([saleData])
              .select()
              .single();

            if (saleError) {
              result = { error: saleError };
              sale = null;
            } else {
              sale = newSale;
              result = { data: sale }; // Initialize result as success
            }
          }

          // Only attempt items insertion if we have a sale AND no errors so far
          if (sale && !result?.error && items && items.length > 0) {
            // Check which items are already inserted
            const { data: existingItems, error: itemCheckError } = await supabase
              .from('sale_items')
              .select('id')
              .eq('sale_id', sale.id);
            
            if (itemCheckError) {
              console.error(`Error checking existing sale items:`, itemCheckError);
              result = { error: itemCheckError };
            } else {
              const existingItemIds = new Set((existingItems || []).map((i: any) => i.id));
              const itemsToInsert = items.filter((item: any) => !existingItemIds.has(item.id));

              if (itemsToInsert.length > 0) {
                console.log(`📤 Inserting ${itemsToInsert.length} sale items (IDs: ${itemsToInsert.map((i: any) => i.id).join(', ')})`);
                
                // Insert items one at a time to track which ones succeed/fail
                let itemsSucceeded = 0;
                let firstItemError = null;
                
                for (const item of itemsToInsert) {
                  const { error: singleItemError } = await supabase.from('sale_items').insert({
                    ...item,
                    sale_id: sale.id,
                  });
                  
                  if (singleItemError) {
                    console.error(`Failed to insert sale item ${item.id}:`, singleItemError);
                    if (!firstItemError) firstItemError = singleItemError;
                  } else {
                    itemsSucceeded++;
                  }
                }
                
                if (firstItemError) {
                  console.error(`⚠️ Partial items sync: ${itemsSucceeded}/${itemsToInsert.length} succeeded`);
                  result = { error: firstItemError, data: sale };
                } else {
                  console.log(`✓ All ${itemsToInsert.length} sale items inserted successfully`);
                  result = { data: sale }; // Success!
                }
              } else {
                console.log(`✓ All ${items.length} sale items already synced`);
                result = { data: sale };
              }
            }
          }

          // After successfully syncing sale and items, create the linked financial record if needed
          // This resolves the race condition where financial records tried to reference sales that don't exist yet
          if (sale && !result?.error && financial_record_data) {
            console.log('💰 Creating linked financial record for sale:', sale.id);
            
            // Check if financial record already exists
            const { data: existingFinRecord, error: finLookupError } = await supabase
              .from('financial_records')
              .select('id')
              .eq('sale_id', sale.id)
              .maybeSingle();
            
            if (finLookupError) {
              console.error('Error checking for existing financial record:', finLookupError);
              result = { error: finLookupError };
            } else if (existingFinRecord) {
              console.log('✓ Financial record already exists for this sale');
            } else {
              // Create the financial record with the real sale_id from Supabase
              const { error: finRecordError } = await supabase
                .from('financial_records')
                .insert({
                  ...financial_record_data,
                  sale_id: sale.id, // Use the real sale.id from Supabase, not the temporary one
                });
              
              if (finRecordError) {
                console.error('Failed to create financial record:', finRecordError);
                result = { error: finRecordError };
              } else {
                console.log('✓ Financial record created successfully');
              }
            }
          }
          
          // Ensure result is always defined
          if (!result) {
            result = { error: new Error('Sales sync incomplete: no result generated') };
          }
        } else {
          // Standard CRUD operations for simple tables
          // Handles: financial_records, savings_plans, savings_contributions, products, loans, loan_repayments
          console.log(`📤 Syncing ${action} on ${table}:`, JSON.stringify(data, null, 2).substring(0, 200));
          
          switch (action) {
            case 'create':
              result = await supabase.from(table).insert(data);
              break;
            case 'update':
              result = await supabase.from(table).update(data).eq('id', data.id);
              break;
            case 'delete':
              result = await supabase.from(table).delete().eq('id', data.id);
              break;
          }
          
          // Ensure result is always defined for standard operations too
          if (!result) {
            result = { error: new Error(`${table} sync incomplete: no result generated`) };
          }
        }

        if (result && result.error) {
          console.error(`Failed to sync item ${item.id} (attempt ${attempts + 1}/${MAX_RETRY_ATTEMPTS}):`, result.error);
          attempts++;
          if (attempts < MAX_RETRY_ATTEMPTS) {
            await delay(RETRY_DELAY_MS * attempts);
          }
        } else {
          await removeQueueItem(item.id);
          success++;
          synced = true;
          console.log(`✓ Synced ${action} on ${table}${table === 'sales' && data.items ? ` with ${data.items.length} items` : ''}`);
        }
      } catch (error) {
        console.error(`Exception while syncing item ${item.id} (attempt ${attempts + 1}/${MAX_RETRY_ATTEMPTS}):`, error);
        attempts++;
        if (attempts < MAX_RETRY_ATTEMPTS) {
          await delay(RETRY_DELAY_MS * attempts);
        }
      }
    }

    if (!synced) {
      failed++;
      console.error(`✗ Failed to sync item ${item.id} after ${MAX_RETRY_ATTEMPTS} attempts`);
    }
  }

  console.log(`Offline sync complete - Success: ${success}, Failed: ${failed}`);
  
  if (success > 0 && queryClient) {
    console.log('🔄 Invalidating React Query cache after successful sync...');
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['sales'] });
    queryClient.invalidateQueries({ queryKey: ['financial_records'] });
    queryClient.invalidateQueries({ queryKey: ['savings_plans'] });
    queryClient.invalidateQueries({ queryKey: ['savings_contributions'] });
    queryClient.invalidateQueries({ queryKey: ['loans'] });
    queryClient.invalidateQueries({ queryKey: ['loan_repayments'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    console.log('✅ React Query cache invalidated - UI will refresh with synced data');
  }
  
  return { success, failed };
}

let syncListenerRegistered = false;

export async function registerBackgroundSync(): Promise<void> {
  // Note: Background sync registration is attempted but there's no service worker
  // handler for it yet. Actual syncing happens via the 'online' event listener below,
  // which runs in the window context where QueryClient is available for cache invalidation.
  if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('offline-sync');
      console.log('Background sync registered');
    } catch (error) {
      console.warn('Background sync registration failed:', error);
      console.log('Falling back to online event listener');
    }
  }
}

export function setupAutoSync() {
  if (syncListenerRegistered) {
    return;
  }

  syncListenerRegistered = true;

  if (navigator.onLine) {
    console.log('App started while online - triggering initial sync...');
    syncOfflineData().catch(err => console.error('Initial sync failed:', err));
  }

  window.addEventListener('online', async () => {
    console.log('Connection restored - starting auto sync...');
    
    try {
      await registerBackgroundSync();
    } catch (error) {
      console.warn('Failed to register background sync, syncing immediately:', error);
      await syncOfflineData().catch(err => console.error('Auto sync failed:', err));
    }
    
    await syncOfflineData().catch(err => console.error('Auto sync failed:', err));
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        console.log('Background sync completed:', event.data.payload);
      }
    });
  }
}
