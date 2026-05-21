
import type { JournalEntry } from '../types';
import { apiClient } from './apiClient';

export const fetchJournalEntries = async (): Promise<JournalEntry[]> => {
    return await apiClient.get('/journal_entries');
};

export const addJournalEntry = async (entry: Omit<JournalEntry, 'id'|'date'>): Promise<JournalEntry> => {
    return await apiClient.post('/journal_entries', entry);
};
