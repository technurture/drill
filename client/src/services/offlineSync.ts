import { actionQueueRepository } from '@/offline/queue/ActionQueueRepository';
import { supabase } from '@/integrations/supabase';
import { QueryClient } from '@tanstack/react-query';
import type { ActionEnvelope, ActionType } from '@/offline/types';

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;

let queryClient: QueryClient | null = null;

export function setQueryClient(client: QueryClient) {
  queryClient = client;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Map ActionType to table name and action
function parseActionType(type: ActionType): { table: string; action: string } {
  const mapping: Record<ActionType, { table: string; action: string }> = {
    'CREATE_PRODUCT': { table: 'products', action: 'create' },
    'UPDATE_PRODUCT': { table: 'products', action: 'update' },
    'DELETE_PRODUCT': { table: 'products', action: 'delete' },
    'CREATE_SALE': { table: 'sales', action: 'create' },
    'UPDATE_SALE': { table: 'sales', action: 'update' },
    'DELETE_SALE': { table: 'sales', action: 'delete' },
    'CREATE_STORE': { table: 'stores', action: 'create' },
    'UPDATE_STORE': { table: 'stores', action: 'update' },
    'ADD_FINANCIAL_RECORD': { table: 'financial_records', action: 'create' },
    'UPDATE_FINANCIAL_RECORD': { table: 'financial_records', action: 'update' },
    'DELETE_FINANCIAL_RECORD': { table: 'financial_records', action: 'delete' },
    'CREATE_LOAN': { table: 'loans', action: 'create' },
    'UPDATE_LOAN': { table: 'loans', action: 'update' },
    'DELETE_LOAN': { table: 'loans', action: 'delete' },
    'ADD_LOAN_REPAYMENT': { table: 'loan_repayments', action: 'create' },
    'CREATE_SAVINGS_PLAN': { table: 'savings_plans', action: 'create' },
    'DELETE_SAVINGS_PLAN': { table: 'savings_plans', action: 'delete' },
    'ADD_SAVINGS_CONTRIBUTION': { table: 'savings_contributions', action: 'create' },
    'DELETE_SAVINGS_CONTRIBUTION': { table: 'savings_contributions', action: 'delete' },
    'WITHDRAW_SAVINGS': { table: 'savings_withdrawals', action: 'create' },
    'WITHDRAW_PARTIAL_SAVINGS': { table: 'savings_withdrawals', action: 'create' },
  };
  
  return mapping[type] || { table: '', action: '' };
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
  const queue = await actionQueueRepository.getPending();
  let success = 0;
  let failed = 0;

  console.log(`🔄 Starting offline sync - ${queue.length} items in queue`);
  
  // Log queue summary for debugging
  if (queue.length > 0) {
    const summary = queue.reduce((acc, item) => {
      const key = item.type;
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
        const { table, action } = parseActionType(item.type);
        const data = item.payload;
        let result;

        // Handle special cases for tables with complex nested data or multi-step operations
        if (table === 'savings_withdrawals' && action === 'create') {
          // Savings withdrawals involve updating the plan AND creating a withdrawal record
          const withdrawalData = data as any;
          const { planId, storeId, totalAmount, amount, store_id } = withdrawalData;
          
          // Determine if this is a full or partial withdrawal based on the data structure
          const isFullWithdrawal = totalAmount !== undefined || withdrawalData.withdrawal?.amount_withdrawn !== undefined;
          const isPartialWithdrawal = amount !== undefined;
          
          if (isFullWithdrawal) {
            // Full withdrawal: mark plan as withdrawn
            const withdrawAmount = totalAmount || withdrawalData.withdrawal?.amount_withdrawn || 0;
            
            // Update the savings plan status
            const { error: planError } = await supabase
              .from('savings_plans')
              .update({
                status: 'withdrawn',
                end_date: new Date().toISOString().split('T')[0]
              })
              .eq('id', planId);
            
            if (planError) {
              result = { error: planError };
            } else {
              // Create withdrawal record
              const { error: withdrawalError } = await supabase
                .from('savings_withdrawals')
                .insert({
                  savings_plan_id: planId,
                  amount_withdrawn: withdrawAmount,
                  withdrawal_date: new Date().toISOString().split('T')[0]
                });
              
              result = withdrawalError ? { error: withdrawalError } : { data: withdrawalData };
            }
          } else if (isPartialWithdrawal) {
            // Partial withdrawal: update current_amount
            // First fetch current plan to calculate new amount
            const { data: plan, error: fetchError } = await supabase
              .from('savings_plans')
              .select('current_amount,contributions:savings_contributions(amount)')
              .eq('id', planId)
              .single();
            
            if (fetchError) {
              result = { error: fetchError };
            } else {
              const currentFromField = parseFloat(plan?.current_amount ?? 0);
              const sumContrib = (plan?.contributions || []).reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0);
              const effectiveSaved = currentFromField > 0 ? currentFromField : sumContrib;
              const newAmount = Math.max(0, effectiveSaved - amount);
              
              // Update plan
              const { error: planError } = await supabase
                .from('savings_plans')
                .update({ current_amount: newAmount })
                .eq('id', planId);
              
              if (planError) {
                result = { error: planError };
              } else {
                // Create withdrawal record
                const { error: withdrawalError } = await supabase
                  .from('savings_withdrawals')
                  .insert({
                    savings_plan_id: planId,
                    amount_withdrawn: amount,
                    withdrawal_date: new Date().toISOString().split('T')[0]
                  });
                
                result = withdrawalError ? { error: withdrawalError } : { data: withdrawalData };
              }
            }
          } else {
            result = { error: new Error('Invalid withdrawal data: missing amount information') };
          }
        } else if (table === 'sales' && action === 'create') {
          // Sales have nested sale_items that need to be handled separately
          const salesData = data as any;
          const { items, financial_record_data, ...saleData } = salesData;

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
              result = await supabase.from(table).update(data).eq('id', (data as any).id);
              break;
            case 'delete':
              result = await supabase.from(table).delete().eq('id', (data as any).id);
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
          await actionQueueRepository.delete(item.id);
          success++;
          synced = true;
          console.log(`✓ Synced ${action} on ${table}${table === 'sales' && (data as any).items ? ` with ${(data as any).items.length} items` : ''}`);
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
      await actionQueueRepository.updateStatus(item.id, 'failed', 'Max retry attempts exceeded');
      console.error(`✗ Failed to sync item ${item.id} after ${MAX_RETRY_ATTEMPTS} attempts`);
    }
  }

  console.log(`Offline sync complete - Success: ${success}, Failed: ${failed}`);
  
  if (success > 0 && queryClient) {
    console.log('🔄 Invalidating React Query cache after successful sync...');
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['sales'] });
    queryClient.invalidateQueries({ queryKey: ['financial_records'] });
    queryClient.invalidateQueries({ queryKey: ['financial-records'] });
    queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
    queryClient.invalidateQueries({ queryKey: ['savings_plans'] });
    queryClient.invalidateQueries({ queryKey: ['savings-plans'] });
    queryClient.invalidateQueries({ queryKey: ['savings-plan'] });
    queryClient.invalidateQueries({ queryKey: ['savings_contributions'] });
    queryClient.invalidateQueries({ queryKey: ['savings-contributions'] });
    queryClient.invalidateQueries({ queryKey: ['savings-withdrawals'] });
    queryClient.invalidateQueries({ queryKey: ['savings-summary'] });
    queryClient.invalidateQueries({ queryKey: ['loans'] });
    queryClient.invalidateQueries({ queryKey: ['loan'] });
    queryClient.invalidateQueries({ queryKey: ['loan_repayments'] });
    queryClient.invalidateQueries({ queryKey: ['loan-repayments'] });
    queryClient.invalidateQueries({ queryKey: ['loan-repayments-by-store'] });
    queryClient.invalidateQueries({ queryKey: ['loans-summary'] });
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
