import type { JournalEntry } from '../types';
import { db } from './db';

const TABLE = 'journal_entries';

export const fetchJournalEntries = async (): Promise<JournalEntry[]> => {
  return db.query<JournalEntry>(TABLE);
};

export const addJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'date'>): Promise<JournalEntry> => {
  return db.insert<JournalEntry>(TABLE, {
    narration: entry.narration,
    lines: JSON.stringify(entry.lines),
    entity_id: entry.entityId,
  });
};
