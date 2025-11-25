import { getMessaging, getToken, deleteToken } from 'firebase/messaging';
import { app } from '@/integrations/firebase/firebase';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
const FCM_TOKEN_KEY = 'fcm_token';
const FCM_TOKEN_TIMESTAMP_KEY = 'fcm_token_timestamp';
const TOKEN_REFRESH_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 days

export class FCMTokenService {
    private messaging = getMessaging(app);

    /**
     * Get the stored FCM token from localStorage
     */
    private getStoredToken(): string | null {
        return localStorage.getItem(FCM_TOKEN_KEY);
    }

    /**
     * Get the timestamp when the token was last refreshed
     */
    private getTokenTimestamp(): number {
        const timestamp = localStorage.getItem(FCM_TOKEN_TIMESTAMP_KEY);
        return timestamp ? parseInt(timestamp, 10) : 0;
    }

    /**
     * Store the FCM token and timestamp
     */
    private storeToken(token: string): void {
        localStorage.setItem(FCM_TOKEN_KEY, token);
        localStorage.setItem(FCM_TOKEN_TIMESTAMP_KEY, Date.now().toString());
    }

    /**
     * Clear stored token and timestamp
     */
    private clearStoredToken(): void {
        localStorage.removeItem(FCM_TOKEN_KEY);
        localStorage.removeItem(FCM_TOKEN_TIMESTAMP_KEY);
    }

    /**
     * Check if the stored token needs to be refreshed
     */
    private shouldRefreshToken(): boolean {
        const timestamp = this.getTokenTimestamp();
        if (!timestamp) return true;

        const age = Date.now() - timestamp;
        return age > TOKEN_REFRESH_INTERVAL;
    }

    /**
     * Validate if a token is still valid by attempting to use it
     */
    async validateToken(token: string): Promise<boolean> {
        try {
            // Try to get a new token - if the old one is invalid, this will generate a new one
            const currentToken = await getToken(this.messaging, { vapidKey: VAPID_KEY });
            return currentToken === token;
        } catch (error) {
            console.error('[FCM] Token validation failed:', error);
            return false;
        }
    }

    /**
     * Get a fresh FCM token, either from cache or by requesting a new one
     */
    async getToken(forceRefresh: boolean = false): Promise<string | null> {
        try {
            // Check if we have a stored token and it doesn't need refresh
            const storedToken = this.getStoredToken();

            if (storedToken && !forceRefresh && !this.shouldRefreshToken()) {
                // Validate the stored token
                const isValid = await this.validateToken(storedToken);
                if (isValid) {
                    console.log('[FCM] Using cached valid token');
                    return storedToken;
                }
                console.log('[FCM] Cached token is invalid, getting new token');
            }

            // Request notification permission
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                console.log('[FCM] Notification permission denied');
                return null;
            }

            // Get a new token
            console.log('[FCM] Requesting new token...');
            const newToken = await getToken(this.messaging, { vapidKey: VAPID_KEY });

            if (newToken) {
                this.storeToken(newToken);
                console.log('[FCM] New token obtained and stored');
                return newToken;
            }

            return null;
        } catch (error) {
            console.error('[FCM] Error getting token:', error);
            // Clear invalid token
            this.clearStoredToken();
            return null;
        }
    }

    /**
     * Refresh the FCM token
     */
    async refreshToken(): Promise<string | null> {
        console.log('[FCM] Forcing token refresh...');

        try {
            // Delete the old token
            await this.deleteToken();

            // Get a new token
            return await this.getToken(true);
        } catch (error) {
            console.error('[FCM] Error refreshing token:', error);
            return null;
        }
    }

    /**
     * Delete the current FCM token
     */
    async deleteToken(): Promise<void> {
        try {
            await deleteToken(this.messaging);
            this.clearStoredToken();
            console.log('[FCM] Token deleted successfully');
        } catch (error) {
            console.error('[FCM] Error deleting token:', error);
            // Clear stored token anyway
            this.clearStoredToken();
        }
    }

    /**
     * Clear invalid tokens from storage
     */
    async clearInvalidTokens(): Promise<void> {
        const storedToken = this.getStoredToken();

        if (storedToken) {
            const isValid = await this.validateToken(storedToken);
            if (!isValid) {
                console.log('[FCM] Clearing invalid token from storage');
                this.clearStoredToken();
            }
        }
    }

    /**
     * Register token with backend
     */
    async registerToken(token: string, userId: string): Promise<boolean> {
        try {
            // This should call your backend API to register the token
            // Adjust the endpoint and payload as needed
            const response = await fetch('/api/notifications/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    userId,
                    platform: this.getPlatform(),
                    timestamp: Date.now(),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to register token with backend');
            }

            console.log('[FCM] Token registered with backend');
            return true;
        } catch (error) {
            console.error('[FCM] Error registering token with backend:', error);
            return false;
        }
    }

    /**
     * Unregister token from backend
     */
    async unregisterToken(token: string): Promise<boolean> {
        try {
            const response = await fetch('/api/notifications/unregister', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            if (!response.ok) {
                throw new Error('Failed to unregister token from backend');
            }

            console.log('[FCM] Token unregistered from backend');
            return true;
        } catch (error) {
            console.error('[FCM] Error unregistering token from backend:', error);
            return false;
        }
    }

    /**
     * Get the current platform
     */
    private getPlatform(): string {
        const userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.includes('chrome')) return 'chrome';
        if (userAgent.includes('safari')) return 'safari';
        if (userAgent.includes('samsung')) return 'samsung';
        if (userAgent.includes('firefox')) return 'firefox';

        return 'unknown';
    }
}

// Export singleton instance
export const fcmTokenService = new FCMTokenService();
