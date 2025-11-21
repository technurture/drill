import { Router } from 'express';
import { supabaseWebhookHandler } from '../events/supabase-events';

const router = Router();

// Supabase webhook endpoint
router.post('/supabase', supabaseWebhookHandler);

export default router;
