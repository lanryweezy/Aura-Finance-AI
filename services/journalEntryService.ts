
import type { JournalEntry } from '../types';

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

export const fetchJournalEntries = (): Promise<JournalEntry[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve([...mockJournalEntries]), 600);
    });
};

export const addJournalEntry = (entryData: Omit<JournalEntry, 'id' | 'date'>): Promise<JournalEntry> => {
    return new Promise(resolve => {
        const newEntry: JournalEntry = {
            ...entryData,
            id: `je_${Date.now()}`,
            date: new Date().toISOString(),
        };
        mockJournalEntries = [newEntry, ...mockJournalEntries];
        setTimeout(() => resolve(newEntry), 300);
    });
};
