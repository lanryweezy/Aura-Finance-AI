
import type { BankConnection } from '../types';
import { localDb } from './localDb';

const STORAGE_KEY = 'bank_connections';

const availableAccounts = [
    { bankName: 'GTBank', accountName: 'Aura Business Inc.', last4: '1234' },
    { bankName: 'Kuda Bank', accountName: 'Aura Logistics', last4: '5678' },
    { bankName: 'Zenith Bank', accountName: 'Aura Consulting', last4: '9012' },
    { bankName: 'Access Bank', accountName: 'Tunde O.', last4: '3456' },
];

export const fetchConnections = async (): Promise<BankConnection[]> => {
    return localDb.simulateRequest(() => {
        return localDb.load<BankConnection[]>(STORAGE_KEY, []);
    }, 500);
};

export const simulateConnect = async (provider: 'mono' | 'okra'): Promise<BankConnection> => {
    return localDb.simulateRequest(() => {
        const connections = localDb.load<BankConnection[]>(STORAGE_KEY, []);
        const connectedBankNames = connections.map(c => c.bankName);
        const unconnectedAccount = availableAccounts.find(acc => !connectedBankNames.includes(acc.bankName));

        if (!unconnectedAccount) {
            throw new Error("All available mock accounts are already connected.");
        }

        const newConnection: BankConnection = {
            id: `conn_${Date.now()}`,
            provider,
            bankName: unconnectedAccount.bankName,
            accountNumber: `******${unconnectedAccount.last4}`,
            accountName: unconnectedAccount.accountName,
            lastSynced: new Date().toISOString(),
        };

        localDb.save(STORAGE_KEY, [...connections, newConnection]);
        return newConnection;
    }, 2500);
};

export const unlinkConnection = async (id: string): Promise<void> => {
    return localDb.simulateRequest(() => {
        const connections = localDb.load<BankConnection[]>(STORAGE_KEY, []);
        const filtered = connections.filter(c => c.id !== id);
        localDb.save(STORAGE_KEY, filtered);
    }, 700);
};

export const syncConnection = async (id: string): Promise<BankConnection> => {
    return localDb.simulateRequest(() => {
        const connections = localDb.load<BankConnection[]>(STORAGE_KEY, []);
        const index = connections.findIndex(c => c.id === id);
        if (index === -1) {
            throw new Error("Connection not found.");
        }
        connections[index].lastSynced = new Date().toISOString();
        localDb.save(STORAGE_KEY, connections);
        return connections[index];
    }, 1500);
}
