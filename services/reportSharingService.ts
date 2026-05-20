
import type { FinancialSummary } from './reportService';

export interface SharedReportPayload {
    orgName: string;
    summary: FinancialSummary;
    expiresAt: string;
    generatedAt: string;
}

/**
 * Service to generate and verify shareable, self-contained report links.
 * For this environment, we encode the report snapshot into the URL.
 */
export const reportSharingService = {
    generateLink: (orgName: string, summary: FinancialSummary, expiresInDays: number = 7): string => {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        const payload: SharedReportPayload = {
            orgName,
            summary,
            expiresAt: expiresAt.toISOString(),
            generatedAt: new Date().toISOString(),
        };

        // Base64 encode the payload
        const jsonStr = JSON.stringify(payload);
        const encoded = btoa(encodeURIComponent(jsonStr));

        const url = new URL(window.location.origin + '/shared/report');
        url.searchParams.set('data', encoded);

        return url.toString();
    },

    decodePayload: (encoded: string): SharedReportPayload | null => {
        try {
            const jsonStr = decodeURIComponent(atob(encoded));
            const payload: SharedReportPayload = JSON.parse(jsonStr);

            // Basic validation
            if (!payload.orgName || !payload.summary || !payload.expiresAt) {
                return null;
            }

            // Check expiration
            if (new Date(payload.expiresAt) < new Date()) {
                console.error('Shared report link has expired');
                return null;
            }

            return payload;
        } catch (err) {
            console.error('Failed to decode shared report payload', err);
            return null;
        }
import { apiClient } from './apiClient';

export interface SharedReportLink {
    id: string;
    reportType: string;
    expiresAt: string;
    token: string;
    viewCount: number;
}

export const reportSharingService = {
    generateLink: async (reportType: string, expiresInDays: number = 7): Promise<SharedReportLink> => {
        // Use cryptographically secure random values for token generation
        const array = new Uint8Array(24);
        window.crypto.getRandomValues(array);
        const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        const newLink: SharedReportLink = {
            id: `rl_${Date.now()}`,
            reportType,
            expiresAt: expiresAt.toISOString(),
            token,
            viewCount: 0
        };

        // In a real app, this would be persisted in the DB
        const existing = JSON.parse(localStorage.getItem('aura_shared_reports') || '[]');
        localStorage.setItem('aura_shared_reports', JSON.stringify([...existing, newLink]));

        return newLink;
    },

    getLinks: async (): Promise<SharedReportLink[]> => {
        return JSON.parse(localStorage.getItem('aura_shared_reports') || '[]');
    },

    revokeLink: async (id: string): Promise<void> => {
        const existing = JSON.parse(localStorage.getItem('aura_shared_reports') || '[]');
        localStorage.setItem('aura_shared_reports', JSON.stringify(existing.filter((l: any) => l.id !== id)));
    },

    verifyToken: async (token: string): Promise<SharedReportLink | null> => {
        const existing = JSON.parse(localStorage.getItem('aura_shared_reports') || '[]');
        const link = existing.find((l: SharedReportLink) => l.token === token);

        if (!link) return null;
        if (new Date(link.expiresAt) < new Date()) {
            reportSharingService.revokeLink(link.id);
            return null;
        }

        return link;
    }
};
