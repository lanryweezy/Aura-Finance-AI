
import { CategorizedTransaction } from '../types';

export const integrationSyncService = {
    syncPaystack: (): CategorizedTransaction[] => {
        return [
            {
                id: `paystack_txn_${Date.now()}_1`,
                date: new Date().toISOString(),
                amount: 15000,
                narration: 'Paystack Payout - Web Sales',
                type: 'credit',
                category: 'Sales Revenue',
                balance: 0
            },
            {
                id: `paystack_txn_${Date.now()}_2`,
                date: new Date().toISOString(),
                amount: 225.50,
                narration: 'Paystack Transaction Fee',
                type: 'debit',
                category: 'Bank Charges & Fees',
                balance: 0
            }
        ];
    },

    syncShopify: (): CategorizedTransaction[] => {
        return [
            {
                id: `shopify_order_${Date.now()}`,
                date: new Date().toISOString(),
                amount: 45000,
                narration: 'Shopify Order #1042 - Lagos Delivery',
                type: 'credit',
                category: 'Sales Revenue',
                balance: 0
            }
        ];
    },

    syncUber: (): CategorizedTransaction[] => {
        return [
            {
                id: `uber_trip_${Date.now()}`,
                date: new Date().toISOString(),
                amount: 3200,
                narration: 'Uber Business Trip - Ikeja to VI',
                type: 'debit',
                category: 'Travel',
                balance: 0
            }
        ];
    }
};
