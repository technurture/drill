/**
 * Example Controller
 * 
 * This file demonstrates how to structure controllers for SheBalance.
 * Controllers contain business logic and database interactions.
 * 
 * This is an EXAMPLE ONLY - uses 'products' table as a reference.
 * In production, you would create specific controllers for each feature.
 */

import { supabase } from '../db';

// Note: In production, you should copy the Database types to the server directory
// For now, we'll use 'any' type to allow the build to succeed
type Product = any;
type ProductInsert = any;
type ProductUpdate = any;

/**
 * Example Product Controller
 * Demonstrates basic CRUD operations
 */
export const exampleController = {
  /**
   * Get all products for a store
   */
  async getAllProducts(storeId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data || [];
  },

  /**
   * Get single product by ID
   */
  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data;
  },

  /**
   * Create new product
   */
  async createProduct(productData: ProductInsert): Promise<Product> {
    if (!productData.name || productData.name.trim() === '') {
      throw new Error('Product name is required');
    }

    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to create product: No data returned');
    }

    return data;
  },

  /**
   * Update existing product
   */
  async updateProduct(id: string, updates: ProductUpdate): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    if (!data) {
      throw new Error('Failed to update product: No data returned');
    }

    return data;
  },

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  },
};
