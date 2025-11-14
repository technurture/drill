/**
 * Example Controller
 *
 * This file demonstrates how to structure controllers for SheBalance.
 * Controllers contain business logic and database interactions.
 *
 * CURRENT STATE: Not yet integrated - Supabase client is used directly in frontend
 * FUTURE STATE: These controllers will handle all business logic
 *
 * Migration path:
 * 1. Create controllers like this for each feature
 * 2. Initially use Supabase client (server-side) in controllers
 * 3. Later replace Supabase with direct database queries
 * 4. Add validation, authorization, and business rules
 */
import { supabase } from '@/integrations/supabase';
/**
 * Example Controller
 * Contains business logic for item management
 */
export const exampleController = {
    /**
     * Get all items for a user
     *
     * @param userId - ID of the user
     * @returns Array of items
     */
    async getAll(userId) {
        // Future: Replace with direct database query
        // const items = await db.select().from('items').where({ user_id: userId });
        // Current: Use Supabase (server-side)
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) {
            throw new Error(`Failed to fetch items: ${error.message}`);
        }
        // Business logic: Filter, transform, or enhance data
        return data || [];
    },
    /**
     * Get single item by ID
     *
     * @param id - Item ID
     * @param userId - ID of the user (for authorization)
     * @returns Single item
     */
    async getById(id, userId) {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('id', id)
            .single();
        if (error) {
            throw new Error(`Failed to fetch item: ${error.message}`);
        }
        if (!data) {
            throw new Error('Item not found');
        }
        // Authorization: Ensure user owns the item
        if (data.user_id !== userId) {
            throw new Error('Unauthorized: You do not own this item');
        }
        return data;
    },
    /**
     * Create new item
     *
     * @param itemData - Item data to insert
     * @param userId - ID of the user creating the item
     * @returns Created item
     */
    async create(itemData, userId) {
        // Business logic: Validate data
        if (!itemData.name || itemData.name.trim() === '') {
            throw new Error('Item name is required');
        }
        // Add user_id to the data
        const dataWithUser = {
            ...itemData,
            user_id: userId,
        };
        const { data, error } = await supabase
            .from('items')
            .insert(dataWithUser)
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to create item: ${error.message}`);
        }
        if (!data) {
            throw new Error('Failed to create item: No data returned');
        }
        return data;
    },
    /**
     * Update existing item
     *
     * @param id - Item ID
     * @param updates - Partial item data to update
     * @param userId - ID of the user updating the item
     * @returns Updated item
     */
    async update(id, updates, userId) {
        // First verify ownership
        await this.getById(id, userId);
        // Business logic: Validate updates
        if (updates.name !== undefined && updates.name.trim() === '') {
            throw new Error('Item name cannot be empty');
        }
        const { data, error } = await supabase
            .from('items')
            .update(updates)
            .eq('id', id)
            .eq('user_id', userId) // Additional security check
            .select()
            .single();
        if (error) {
            throw new Error(`Failed to update item: ${error.message}`);
        }
        if (!data) {
            throw new Error('Failed to update item: No data returned');
        }
        return data;
    },
    /**
     * Delete item
     *
     * @param id - Item ID
     * @param userId - ID of the user deleting the item
     */
    async delete(id, userId) {
        // First verify ownership
        await this.getById(id, userId);
        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', id)
            .eq('user_id', userId); // Additional security check
        if (error) {
            throw new Error(`Failed to delete item: ${error.message}`);
        }
    },
    /**
     * Example of complex business logic
     * Get items with calculated statistics
     *
     * @param userId - ID of the user
     * @returns Items with statistics
     */
    async getWithStats(userId) {
        const items = await this.getAll(userId);
        // Business logic: Calculate statistics
        const stats = {
            total: items.length,
            byCategory: items.reduce((acc, item) => {
                const category = item.category || 'uncategorized';
                acc[category] = (acc[category] || 0) + 1;
                return acc;
            }, {}),
        };
        return {
            items,
            stats,
        };
    },
};
/**
 * Notes for future migration:
 *
 * 1. Replace Supabase client with direct database queries:
 *    - Import db from '../db'
 *    - Use db.select(), db.insert(), etc.
 *
 * 2. Add more sophisticated validation:
 *    - Use validation libraries (Zod, Joi, etc.)
 *    - Create reusable validators
 *
 * 3. Implement caching:
 *    - Add Redis for frequently accessed data
 *    - Cache user permissions
 *
 * 4. Add transaction support:
 *    - Use database transactions for complex operations
 *    - Ensure data consistency
 *
 * 5. Implement audit logging:
 *    - Log all data modifications
 *    - Track who changed what and when
 */
