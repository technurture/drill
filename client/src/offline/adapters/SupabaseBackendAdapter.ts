import { supabase } from '@/integrations/supabase/supabase';
import type { BackendSyncAdapter } from '../types';
import type { ActionEnvelope } from '../types';

export class SupabaseBackendAdapter implements BackendSyncAdapter {
  async syncAction<T>(action: ActionEnvelope<T>): Promise<void> {
    switch (action.type) {
      case 'CREATE_PRODUCT':
        await this.createProduct(action.payload);
        break;
      case 'UPDATE_PRODUCT':
        await this.updateProduct(action.payload);
        break;
      case 'DELETE_PRODUCT':
        await this.deleteProduct(action.payload);
        break;
      case 'CREATE_SALE':
        await this.createSale(action.payload);
        break;
      case 'UPDATE_SALE':
        await this.updateSale(action.payload);
        break;
      case 'DELETE_SALE':
        await this.deleteSale(action.payload);
        break;
      case 'CREATE_STORE':
        await this.createStore(action.payload);
        break;
      case 'UPDATE_STORE':
        await this.updateStore(action.payload);
        break;
      case 'ADD_FINANCIAL_RECORD':
        await this.addFinancialRecord(action.payload);
        break;
      case 'DELETE_FINANCIAL_RECORD':
        await this.deleteFinancialRecord(action.payload);
        break;
      case 'UPDATE_FINANCIAL_RECORD':
        await this.updateFinancialRecord(action.payload);
        break;
      case 'CREATE_LOAN':
        await this.createLoan(action.payload);
        break;
      case 'UPDATE_LOAN':
        await this.updateLoan(action.payload);
        break;
      case 'DELETE_LOAN':
        await this.deleteLoan(action.payload);
        break;
      case 'ADD_LOAN_REPAYMENT':
        await this.addLoanRepayment(action.payload);
        break;
      case 'CREATE_SAVINGS_PLAN':
        await this.createSavingsPlan(action.payload);
        break;
      case 'ADD_SAVINGS_CONTRIBUTION':
        await this.addSavingsContribution(action.payload);
        break;
      case 'DELETE_SAVINGS_PLAN':
        await this.deleteSavingsPlan(action.payload);
        break;
      case 'DELETE_SAVINGS_CONTRIBUTION':
        await this.deleteSavingsContribution(action.payload);
        break;
      case 'WITHDRAW_SAVINGS':
        await this.withdrawSavings(action.payload);
        break;
      case 'WITHDRAW_PARTIAL_SAVINGS':
        await this.withdrawPartialSavings(action.payload);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  async reconcile(): Promise<void> {
    console.log('Reconciling data with backend...');
  }

  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  }

  private async createProduct(payload: any): Promise<void> {
    const { id, ...dataWithoutId } = payload;
    
    if (id) {
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (existing) {
        console.log(`Product ${id} already exists, skipping insert`);
        return;
      }
    }
    
    const insertData = id ? payload : dataWithoutId;
    const { error } = await supabase.from('products').insert([insertData]);
    if (error) throw error;
  }

  private async updateProduct(payload: any): Promise<void> {
    const { id, quantity, storeId, store_id, ...updateData } = payload;
    
    if (quantity !== undefined && (storeId || store_id)) {
      const actualStoreId = storeId || store_id;
      
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('store_id', actualStoreId)
        .single();

      if (fetchError) throw fetchError;
      if (!product) throw new Error('Product not found');

      const newQuantity = product.quantity + quantity;

      const { error } = await supabase
        .from('products')
        .update({ quantity: newQuantity, ...updateData })
        .eq('id', id)
        .eq('store_id', actualStoreId);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);
      if (error) throw error;
    }
  }

  private async deleteProduct(payload: any): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', payload.id);
    if (error) throw error;
  }

  private async createSale(payload: any): Promise<void> {
    const { items, id, ...saleData } = payload;

    if (id) {
      const { data: existing } = await supabase
        .from('sales')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (existing) {
        console.log(`Sale ${id} already exists, skipping insert`);
        return;
      }
    }

    const insertData = id ? { id, ...saleData } : saleData;
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert([insertData])
      .select()
      .single();

    if (saleError) throw saleError;
    if (!sale) throw new Error('Failed to create sale');

    if (items && items.length > 0) {
      const { error: itemsError } = await supabase.from('sale_items').insert(
        items.map((item: any) => {
          const { id: itemId, ...itemData } = item;
          return {
            ...itemData,
            sale_id: sale.id,
          };
        })
      );

      if (itemsError) throw itemsError;
    }
  }

  private async updateSale(payload: any): Promise<void> {
    const { id, ...updateData } = payload;
    const { error } = await supabase
      .from('sales')
      .update(updateData)
      .eq('id', id);
    if (error) throw error;
  }

  private async deleteSale(payload: any): Promise<void> {
    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', payload.id);
    if (error) throw error;
  }

  private async createStore(payload: any): Promise<void> {
    const { id, ...dataWithoutId } = payload;
    
    if (id) {
      const { data: existing } = await supabase
        .from('stores')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (existing) {
        console.log(`Store ${id} already exists, skipping insert`);
        return;
      }
    }
    
    const insertData = id ? payload : dataWithoutId;
    const { error } = await supabase.from('stores').insert([insertData]);
    if (error) throw error;
  }

  private async updateStore(payload: any): Promise<void> {
    const { id, ...updateData } = payload;
    const { error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', id);
    if (error) throw error;
  }

  private async addFinancialRecord(payload: any): Promise<void> {
    const { id, ...dataWithoutId } = payload;
    
    if (id) {
      const { data: existing } = await supabase
        .from('financial_records')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (existing) {
        console.log(`Financial record ${id} already exists, skipping insert`);
        return;
      }
    }
    
    const insertData = id ? payload : dataWithoutId;
    const { error } = await supabase.from('financial_records').insert([insertData]);
    if (error) throw error;
  }

  private async deleteFinancialRecord(payload: any): Promise<void> {
    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', payload.id);
    if (error) throw error;
  }

  private async updateFinancialRecord(payload: any): Promise<void> {
    const { id, ...updateData } = payload;
    const { error } = await supabase
      .from('financial_records')
      .update(updateData)
      .eq('id', id);
    if (error) throw error;
  }

  private async createLoan(payload: any): Promise<void> {
    const { id, ...dataWithoutId } = payload;
    
    if (id) {
      const { data: existing } = await supabase
        .from('loans')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (existing) {
        console.log(`Loan ${id} already exists, skipping insert`);
        return;
      }
    }
    
    const insertData = id ? payload : dataWithoutId;
    const { error } = await supabase.from('loans').insert([insertData]);
    if (error) throw error;
  }

  private async updateLoan(payload: any): Promise<void> {
    const { id, ...updateData } = payload;
    const { error } = await supabase
      .from('loans')
      .update(updateData)
      .eq('id', id);
    if (error) throw error;
  }

  private async deleteLoan(payload: any): Promise<void> {
    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', payload.id);
    if (error) throw error;
  }

  private async addLoanRepayment(payload: any): Promise<void> {
    const { id, ...dataWithoutId } = payload;
    
    if (id) {
      const { data: existing } = await supabase
        .from('loan_repayments')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (existing) {
        console.log(`Loan repayment ${id} already exists, skipping insert`);
        return;
      }
    }
    
    const insertData = id ? payload : dataWithoutId;
    const { error } = await supabase.from('loan_repayments').insert([insertData]);
    if (error) throw error;
  }

  private async createSavingsPlan(payload: any): Promise<void> {
    const { id, ...dataWithoutId } = payload;
    
    if (id) {
      const { data: existing } = await supabase
        .from('savings_plans')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (existing) {
        console.log(`Savings plan ${id} already exists, skipping insert`);
        return;
      }
    }
    
    const insertData = id ? payload : dataWithoutId;
    const { error } = await supabase.from('savings_plans').insert([insertData]);
    if (error) throw error;
  }

  private async addSavingsContribution(payload: any): Promise<void> {
    const { id, ...dataWithoutId } = payload;
    
    if (id) {
      const { data: existing } = await supabase
        .from('savings_contributions')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (existing) {
        console.log(`Savings contribution ${id} already exists, skipping insert`);
        return;
      }
    }
    
    const insertData = id ? payload : dataWithoutId;
    const { error } = await supabase.from('savings_contributions').insert([insertData]);
    if (error) throw error;
  }

  private async deleteSavingsPlan(payload: any): Promise<void> {
    const { error } = await supabase
      .from('savings_plans')
      .delete()
      .eq('id', payload.id);
    if (error) throw error;
  }

  private async deleteSavingsContribution(payload: any): Promise<void> {
    const { error } = await supabase
      .from('savings_contributions')
      .delete()
      .eq('id', payload.id);
    if (error) throw error;
  }

  private async withdrawSavings(payload: any): Promise<void> {
    const { planId, totalAmount } = payload;
    
    const { error: planError } = await supabase
      .from('savings_plans')
      .update({ 
        status: 'withdrawn',
        end_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', planId);
      
    if (planError) throw planError;

    const { error: withdrawalError } = await supabase
      .from('savings_withdrawals')
      .insert({
        savings_plan_id: planId,
        amount_withdrawn: totalAmount || 0,
        withdrawal_date: new Date().toISOString().split('T')[0]
      });
    
    if (withdrawalError) throw withdrawalError;
  }

  private async withdrawPartialSavings(payload: any): Promise<void> {
    const { planId, amount } = payload;
    
    const { data: plan, error: fetchError } = await supabase
      .from('savings_plans')
      .select('current_amount,contributions:savings_contributions(amount)')
      .eq('id', planId)
      .single();
      
    if (fetchError) throw fetchError;
    
    const currentFromField = parseFloat(plan?.current_amount ?? 0);
    const sumContrib = (plan?.contributions || []).reduce((sum: number, c: any) => sum + parseFloat(c.amount), 0);
    const effectiveSaved = currentFromField > 0 ? currentFromField : sumContrib;
    const newAmount = Math.max(0, effectiveSaved - amount);
    
    const { error: planError } = await supabase
      .from('savings_plans')
      .update({ current_amount: newAmount.toString() })
      .eq('id', planId);
      
    if (planError) throw planError;

    const { error: withdrawalError } = await supabase
      .from('savings_withdrawals')
      .insert({
        savings_plan_id: planId,
        amount_withdrawn: amount,
        withdrawal_date: new Date().toISOString().split('T')[0]
      });
    
    if (withdrawalError) throw withdrawalError;
  }
}

export const supabaseBackendAdapter = new SupabaseBackendAdapter();
