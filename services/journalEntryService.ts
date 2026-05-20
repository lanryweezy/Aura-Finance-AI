import { monitoringService } from './monitoringService';

import type { JournalEntry } from '../types';
import { authService } from './authService';

const getStorageKey = () => `aura_${authService.getTenantId()}_journal_entries`;

const initialJournalEntries: JournalEntry[] = [
    {
        id: `je_${Date.now() - 50000}`,
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        narration: 'To record depreciation for the month',
        lines: [
            { accountName: 'Depreciation', type: 'debit', amount: 50000 },
            { accountName: 'Accumulated Depreciation', type: 'credit', amount: 50000 }
        ]
    }
];

const loadJournalEntries = (): JournalEntry[] => {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            monitoringService.trackError('SERVICE', e, { message: 'Failed to parse journal entries' });
            return initialJournalEntries;
        }
    }
    return initialJournalEntries;
};

export const fetchJournalEntries = (): Promise<JournalEntry[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(loadJournalEntries()), 600);
    });
};

export const addJournalEntry = (entryData: Omit<JournalEntry, 'id' | 'date'>): Promise<JournalEntry> => {
    return new Promise(resolve => {
        const current = loadJournalEntries();
        const newEntry: JournalEntry = {
            ...entryData,
            id: `je_${Date.now()}`,
            date: new Date().toISOString(),
        };
        const updated = [newEntry, ...current];
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        setTimeout(() => resolve(newEntry), 300);
    });
};
