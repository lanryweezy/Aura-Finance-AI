
import type { JournalEntry } from '../types';

const STORAGE_KEY = 'aura_journal_entries';

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
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse journal entries', e);
            return initialJournalEntries;
        }
    }
    return initialJournalEntries;
};

let mockJournalEntries: JournalEntry[] = loadJournalEntries();

const saveJournalEntriesToStore = (entries: JournalEntry[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

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
        saveJournalEntriesToStore(mockJournalEntries);
        setTimeout(() => resolve(newEntry), 300);
    });
};
