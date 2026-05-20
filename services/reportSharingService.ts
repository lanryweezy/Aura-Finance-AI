
import type { FinancialSummary } from './reportService';

export interface SharedReportPayload {
    orgName: string;
    summary: FinancialSummary;
    expiresAt: string;
    generatedAt: string;
}

export interface SharedReportLink {
    id: string;
    reportType: string;
    expiresAt: string;
    token: string;
    viewCount: number;
}

/**
 * Service to generate and verify shareable, self-contained report links.
 * We encode the report snapshot into the URL for a zero-backend architecture.
 */
export const reportSharingService = {
    generateLink: (orgName: string, summary: FinancialSummary, expiresInDays: number = 7): { token: string; url: string } => {
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

        return {
            token: encoded,
            url: url.toString()
        };
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
    },

    // Compatibility wrapper for components that might expect the token-based API
    verifyToken: async (token: string): Promise<SharedReportPayload | null> => {
        return reportSharingService.decodePayload(token);
    }
};
