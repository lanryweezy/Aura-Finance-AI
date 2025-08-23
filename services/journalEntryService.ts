
import type { JournalEntry } from '../types';
import { api } from './api';

let mockJournalEntries: JournalEntry[] = [
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

export const fetchJournalEntries = async (): Promise<JournalEntry[]> => {
    try {
        return await api.get<JournalEntry[]>('/journal-entries/');
    } catch {
        return [...mockJournalEntries];
    }
};

export const addJournalEntry = async (entryData: Omit<JournalEntry, 'id' | 'date'>): Promise<JournalEntry> => {
    try {
        const created = await api.post<JournalEntry>('/journal-entries/', entryData);
        return created;
    } catch {
        const newEntry: JournalEntry = {
            ...entryData,
            id: `je_${Date.now()}`,
            date: new Date().toISOString(),
        };
        mockJournalEntries = [newEntry, ...mockJournalEntries];
        return newEntry;
    }
};
