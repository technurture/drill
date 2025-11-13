import { Router } from 'express';
import type { Request, Response } from 'express';

/**
 * Example API Routes
 * 
 * This file demonstrates how to structure API routes for SheBalance.
 * 
 * CURRENT STATE: Routes not yet integrated - Supabase client is used directly in frontend
 * FUTURE STATE: These routes will replace direct Supabase client calls
 * 
 * Migration path:
 * 1. Create routes like this for each feature
 * 2. Implement controllers with business logic
 * 3. Update frontend to call these API endpoints instead of Supabase client
 * 4. Remove Supabase client library from frontend
 */

const router = Router();

/**
 * Example: Get all items for a user
 * 
 * Current: client calls supabase.from('items').select('*').eq('user_id', userId)
 * Future: client calls GET /api/items
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Future implementation:
    // const userId = req.user?.id; // from auth middleware
    // const items = await itemController.getAll(userId);
    // res.json({ data: items, error: null });
    
    res.json({ 
      message: 'Example route - not yet implemented',
      note: 'This will replace direct Supabase client calls'
    });
  } catch (error) {
    res.status(500).json({ 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Example: Get single item by ID
 * 
 * Current: client calls supabase.from('items').select('*').eq('id', id).single()
 * Future: client calls GET /api/items/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Future implementation:
    // const item = await itemController.getById(id, req.user?.id);
    // res.json({ data: item, error: null });
    
    res.json({ 
      message: `Example route for item ${id} - not yet implemented` 
    });
  } catch (error) {
    res.status(500).json({ 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Example: Create new item
 * 
 * Current: client calls supabase.from('items').insert(data)
 * Future: client calls POST /api/items with body data
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    // Future implementation:
    // const userId = req.user?.id;
    // const newItem = await itemController.create(req.body, userId);
    // res.status(201).json({ data: newItem, error: null });
    
    res.json({ 
      message: 'Example POST route - not yet implemented',
      receivedData: req.body 
    });
  } catch (error) {
    res.status(500).json({ 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Example: Update item
 * 
 * Current: client calls supabase.from('items').update(data).eq('id', id)
 * Future: client calls PUT /api/items/:id with body data
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Future implementation:
    // const updated = await itemController.update(id, req.body, req.user?.id);
    // res.json({ data: updated, error: null });
    
    res.json({ 
      message: `Example PUT route for item ${id} - not yet implemented`,
      receivedData: req.body 
    });
  } catch (error) {
    res.status(500).json({ 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

/**
 * Example: Delete item
 * 
 * Current: client calls supabase.from('items').delete().eq('id', id)
 * Future: client calls DELETE /api/items/:id
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Future implementation:
    // await itemController.delete(id, req.user?.id);
    // res.json({ data: { id }, error: null });
    
    res.json({ 
      message: `Example DELETE route for item ${id} - not yet implemented` 
    });
  } catch (error) {
    res.status(500).json({ 
      data: null, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
});

export default router;
