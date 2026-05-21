
import { authService } from './authService';

/**
 * Enhanced Local Database service with tenant isolation and realistic simulations.
 * This acts as the "core" for all mock services, ensuring data persistence.
 */
export const localDb = {
    /**
     * Get a tenant-specific key for localStorage
     */
    getKey(key: string): string {
        const tenantId = authService.getTenantId() || 'default_tenant';
        return `aura_${tenantId}_${key}`;
    },

    /**
     * Save data with tenant isolation
     */
    save<T>(key: string, data: T): void {
        localStorage.setItem(this.getKey(key), JSON.stringify(data));
    },

    /**
     * Load data with tenant isolation
     */
    load<T>(key: string, defaultValue: T): T {
        const stored = localStorage.getItem(this.getKey(key));
        if (!stored) return defaultValue;
        try {
            return JSON.parse(stored) as T;
        } catch (e) {
            console.error(`Failed to parse localDb key: ${key}`, e);
            return defaultValue;
        }
    },

    /**
     * Remove data
     */
    remove(key: string): void {
        localStorage.removeItem(this.getKey(key));
    },

    /**
     * Realistic simulation of a network request
     */
    async simulateRequest<T>(operation: () => T, delay: number = 1000): Promise<T> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Simulate occasional network errors (1% chance)
                    if (Math.random() < 0.01) {
                        throw new Error("Simulated network failure. Please try again.");
                    }
                    resolve(operation());
                } catch (e) {
                    reject(e);
                }
            }, delay + Math.random() * 500); // Add a bit of jitter
        });
    }
};
