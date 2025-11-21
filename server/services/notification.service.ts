import * as admin from 'firebase-admin';
import { supabase } from '../db';

// Initialize Firebase Admin SDK
let firebaseApp: admin.app.App | null = null;

export const initializeFirebaseAdmin = () => {
    if (firebaseApp) {
        return firebaseApp;
    }

    try {
        const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!projectId || !clientEmail || !privateKey) {
            console.warn('Firebase Admin credentials not configured. Push notifications will be disabled.');
            return null;
        }

        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
            }),
        });

        console.log('✅ Firebase Admin SDK initialized successfully');
        return firebaseApp;
    } catch (error) {
        console.error('Failed to initialize Firebase Admin SDK:', error);
        return null;
    }
};

/**
 * Send push notification to specific FCM tokens
 */
export const sendNotification = async (
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<{ success: boolean; failedTokens: string[] }> => {
    const app = initializeFirebaseAdmin();

    if (!app || tokens.length === 0) {
        return { success: false, failedTokens: tokens };
    }

    try {
        const message: admin.messaging.MulticastMessage = {
            tokens,
            notification: {
                title,
                body,
            },
            data: data || {},
            webpush: {
                fcmOptions: {
                    link: data?.link || '/',
                },
                notification: {
                    icon: '/icon-192x192.png',
                    badge: '/icon-192x192.png',
                    requireInteraction: false,
                },
            },
        };

        const response = await admin.messaging().sendEachForMulticast(message);

        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                failedTokens.push(tokens[idx]);
                console.error(`Failed to send to token ${tokens[idx]}:`, resp.error);
            }
        });

        console.log(`✅ Sent ${response.successCount}/${tokens.length} notifications`);

        return {
            success: response.successCount > 0,
            failedTokens,
        };
    } catch (error) {
        console.error('Error sending notification:', error);
        return { success: false, failedTokens: tokens };
    }
};

/**
 * Send notification to a specific user
 */
export const sendToUser = async (
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<boolean> => {
    try {
        // Get user's FCM tokens from database
        const { data: tokens, error } = await supabase
            .from('devices_token')
            .select('token')
            .eq('user_id', userId);

        if (error || !tokens || tokens.length === 0) {
            console.log(`No FCM tokens found for user ${userId}`);
            return false;
        }

        const fcmTokens = tokens.map(t => t.token);
        const result = await sendNotification(fcmTokens, title, body, data);

        return result.success;
    } catch (error) {
        console.error(`Error sending notification to user ${userId}:`, error);
        return false;
    }
};

/**
 * Send notification to all users in a store
 */
export const sendToStore = async (
    storeId: string,
    title: string,
    body: string,
    data?: Record<string, string>
): Promise<boolean> => {
    try {
        // Get all users in the store
        const { data: storeUsers, error: storeError } = await supabase
            .from('store_users')
            .select('user_id')
            .eq('store_id', storeId);

        if (storeError || !storeUsers || storeUsers.length === 0) {
            console.log(`No users found for store ${storeId}`);
            return false;
        }

        const userIds = storeUsers.map(su => su.user_id);

        // Get all FCM tokens for these users
        const { data: tokens, error: tokenError } = await supabase
            .from('devices_token')
            .select('token')
            .in('user_id', userIds);

        if (tokenError || !tokens || tokens.length === 0) {
            console.log(`No FCM tokens found for store ${storeId}`);
            return false;
        }

        const fcmTokens = tokens.map(t => t.token);
        const result = await sendNotification(fcmTokens, title, body, data);

        return result.success;
    } catch (error) {
        console.error(`Error sending notification to store ${storeId}:`, error);
        return false;
    }
};

/**
 * Get notification preferences for a user
 */
export const getNotificationPreferences = async (userId: string) => {
    try {
        const { data, error } = await supabase
            .from('notification_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching notification preferences:', error);
            return null;
        }

        // Create default settings if none exist
        if (!data) {
            const { data: newSettings, error: createError } = await supabase
                .from('notification_settings')
                .insert({
                    user_id: userId,
                    enabled: true,
                    sales: true,
                    inventory: true,
                    loans: true,
                    messages: true,
                    daily_summary: false,
                })
                .select()
                .single();

            if (createError) {
                console.error('Error creating default notification settings:', createError);
                return null;
            }

            return newSettings;
        }

        return data;
    } catch (error) {
        console.error('Error in getNotificationPreferences:', error);
        return null;
    }
};

/**
 * Update notification preferences for a user
 */
export const updateNotificationPreferences = async (
    userId: string,
    preferences: Partial<{
        enabled: boolean;
        sales: boolean;
        inventory: boolean;
        loans: boolean;
        messages: boolean;
        daily_summary: boolean;
    }>
) => {
    try {
        const { data, error } = await supabase
            .from('notification_settings')
            .update({ ...preferences, updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating notification preferences:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in updateNotificationPreferences:', error);
        return null;
    }
};
