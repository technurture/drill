import { Request, Response } from 'express';
import { sendToStore, sendToUser, getNotificationPreferences } from '../services/notification.service.js';

/**
 * Handle new sale created event
 */
export const handleSaleCreated = async (data: any) => {
    try {
        const { store_id, user_id, total_amount, customer_name } = data.record;

        // Get user preferences
        const prefs = await getNotificationPreferences(user_id);
        if (!prefs || !prefs.enabled || !prefs.sales) {
            return false;
        }

        const title = '💰 New Sale Recorded';
        const body = customer_name
            ? `Sale to ${customer_name}: ₦${total_amount.toLocaleString()}`
            : `Sale amount: ₦${total_amount.toLocaleString()}`;

        await sendToStore(store_id, title, body, {
            link: '/dashboard/sales',
            type: 'sale',
            saleId: data.record.id,
        });

        return true;
    } catch (error) {
        console.error('Error handling sale created:', error);
        return false;
    }
};

/**
 * Handle low inventory alert
 */
export const handleLowInventory = async (data: any) => {
    try {
        const { store_id, product_name, quantity } = data.record;

        const title = '⚠️ Low Stock Alert';
        const body = `${product_name} is running low (${quantity} remaining)`;

        await sendToStore(store_id, title, body, {
            link: '/inventory',
            type: 'inventory',
            productId: data.record.id,
        });

        return true;
    } catch (error) {
        console.error('Error handling low inventory:', error);
        return false;
    }
};

/**
 * Handle loan repayment reminder
 */
export const handleLoanReminder = async (data: any) => {
    try {
        const { user_id, borrower_name, amount_remaining, due_date } = data.record;

        // Get user preferences
        const prefs = await getNotificationPreferences(user_id);
        if (!prefs || !prefs.enabled || !prefs.loans) {
            return false;
        }

        const title = '📅 Loan Payment Reminder';
        const body = `${borrower_name} has ₦${amount_remaining.toLocaleString()} due on ${due_date}`;

        await sendToUser(user_id, title, body, {
            link: '/loans',
            type: 'loan',
            loanId: data.record.id,
        });

        return true;
    } catch (error) {
        console.error('Error handling loan reminder:', error);
        return false;
    }
};

/**
 * Main Supabase webhook handler
 * POST /api/webhooks/supabase
 */
export const supabaseWebhookHandler = async (req: Request, res: Response) => {
    try {
        const { type, table, record, old_record } = req.body;

        console.log(`Webhook received: ${type} on ${table}`);

        let handled = false;

        // Route to appropriate handler based on table and type
        if (table === 'sales' && type === 'INSERT') {
            handled = await handleSaleCreated({ record, old_record });
        } else if (table === 'products' && type === 'UPDATE') {
            // Check if quantity dropped below threshold
            if (record.quantity < 10 && old_record.quantity >= 10) {
                handled = await handleLowInventory({ record, old_record });
            }
        } else if (table === 'loans' && type === 'INSERT') {
            handled = await handleLoanReminder({ record, old_record });
        }

        return res.json({ success: handled });
    } catch (error) {
        console.error('Error in supabaseWebhookHandler:', error);
        return res.status(500).json({ error: 'Webhook processing failed' });
    }
};
