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
    const { error } = await supabase.from('products').insert([payload]);
    if (error) throw error;
  }

  private async updateProduct(payload: any): Promise<void> {
    const { id, ...updateData } = payload;
    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id);
    if (error) throw error;
  }

  private async deleteProduct(payload: any): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', payload.id);
    if (error) throw error;
  }

  private async createSale(payload: any): Promise<void> {
    const { error } = await supabase.from('sales').insert([payload]);
    if (error) throw error;
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
    const { error } = await supabase.from('stores').insert([payload]);
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
    const { error } = await supabase.from('financial_records').insert([payload]);
    if (error) throw error;
  }

  private async deleteFinancialRecord(payload: any): Promise<void> {
    const { error } = await supabase
      .from('financial_records')
      .delete()
      .eq('id', payload.id);
    if (error) throw error;
  }
}

export const supabaseBackendAdapter = new SupabaseBackendAdapter();
