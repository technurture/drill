import { Request, Response } from 'express';
import {
    sendNotification,
    sendToUser,
    sendToStore,
    getNotificationPreferences,
    updateNotificationPreferences,
} from '../services/notification.service.js';

/**
 * POST /api/notifications/send
 * Manual notification endpoint
 */
export const sendManualNotification = async (req: Request, res: Response) => {
    try {
        const { tokens, title, body, data } = req.body;

        if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
            return res.status(400).json({ error: 'Tokens array is required' });
        }

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        const result = await sendNotification(tokens, title, body, data);

        return res.json({
            success: result.success,
            failedTokens: result.failedTokens,
        });
    } catch (error) {
        console.error('Error in sendManualNotification:', error);
        return res.status(500).json({ error: 'Failed to send notification' });
    }
};

/**
 * POST /api/notifications/send-to-user
 * Send notification to specific user
 */
export const sendNotificationToUser = async (req: Request, res: Response) => {
    try {
        const { userId, title, body, data } = req.body;

        if (!userId || !title || !body) {
            return res.status(400).json({ error: 'userId, title, and body are required' });
        }

        const success = await sendToUser(userId, title, body, data);

        return res.json({ success });
    } catch (error) {
        console.error('Error in sendNotificationToUser:', error);
        return res.status(500).json({ error: 'Failed to send notification' });
    }
};

/**
 * POST /api/notifications/send-to-store
 * Send notification to all users in a store
 */
export const sendNotificationToStore = async (req: Request, res: Response) => {
    try {
        const { storeId, title, body, data } = req.body;

        if (!storeId || !title || !body) {
            return res.status(400).json({ error: 'storeId, title, and body are required' });
        }

        const success = await sendToStore(storeId, title, body, data);

        return res.json({ success });
    } catch (error) {
        console.error('Error in sendNotificationToStore:', error);
        return res.status(500).json({ error: 'Failed to send notification' });
    }
};

/**
 * POST /api/notifications/test
 * Test notification endpoint - sends to current user
 */
export const sendTestNotification = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const success = await sendToUser(
            userId,
            '🔔 Test Notification',
            'This is a test notification from StockWise!',
            { link: '/', type: 'test' }
        );

        return res.json({ success });
    } catch (error) {
        console.error('Error in sendTestNotification:', error);
        return res.status(500).json({ error: 'Failed to send test notification' });
    }
};

/**
 * GET /api/notifications/preferences/:userId
 * Get notification preferences for a user
 */
export const getPreferences = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const preferences = await getNotificationPreferences(userId);

        if (!preferences) {
            return res.status(404).json({ error: 'Preferences not found' });
        }

        return res.json(preferences);
    } catch (error) {
        console.error('Error in getPreferences:', error);
        return res.status(500).json({ error: 'Failed to fetch preferences' });
    }
};

/**
 * PUT /api/notifications/preferences/:userId
 * Update notification preferences for a user
 */
export const updatePreferences = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const preferences = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const updated = await updateNotificationPreferences(userId, preferences);

        if (!updated) {
            return res.status(500).json({ error: 'Failed to update preferences' });
        }

        return res.json(updated);
    } catch (error) {
        console.error('Error in updatePreferences:', error);
        return res.status(500).json({ error: 'Failed to update preferences' });
    }
};
