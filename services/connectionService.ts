import type { BankConnection } from '../types';
import { db } from './db';

const TABLE = 'bank_connections';

export const fetchConnections = async (): Promise<BankConnection[]> => {
  return db.query<BankConnection>(TABLE);
};

export const simulateConnect = async (provider: 'mono' | 'okra'): Promise<BankConnection> => {
  const banks = ['GTBank', 'Kuda Bank', 'Zenith Bank', 'Access Bank'];
  const names = ['Aura Business Inc.', 'Aura Logistics', 'Aura Consulting', 'Tunde O.'];
  const idx = Math.floor(Math.random() * banks.length);
  return db.insert<BankConnection>(TABLE, {
    provider,
    bank_name: banks[idx],
    account_number: `******${String(Math.floor(1000 + Math.random() * 9000))}`,
    account_name: names[idx],
    last_synced: new Date().toISOString(),
  });
};

export const unlinkConnection = async (id: string): Promise<void> => {
  await db.remove(TABLE, id);
};

export const syncConnection = async (id: string): Promise<BankConnection> => {
  return db.update<BankConnection>(TABLE, id, {
    last_synced: new Date().toISOString(),
  });
};
