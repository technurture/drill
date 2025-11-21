import { Router } from 'express';
import {
    sendManualNotification,
    sendNotificationToUser,
    sendNotificationToStore,
    sendTestNotification,
    getPreferences,
    updatePreferences,
} from '../controllers/notification.controller';

const router = Router();

// Send notifications
router.post('/send', sendManualNotification);
router.post('/send-to-user', sendNotificationToUser);
router.post('/send-to-store', sendNotificationToStore);
router.post('/test', sendTestNotification);

// Manage preferences
router.get('/preferences/:userId', getPreferences);
router.put('/preferences/:userId', updatePreferences);

export default router;
