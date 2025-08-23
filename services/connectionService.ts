
import type { BankConnection } from '../types';
import { api } from './api';

let mockConnections: BankConnection[] = [];

// Helper to simulate a delay
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock bank details that can be "connected"
const availableAccounts = [
    { bankName: 'GTBank', accountName: 'Aura Business Inc.', last4: '1234' },
    { bankName: 'Kuda Bank', accountName: 'Aura Logistics', last4: '5678' },
    { bankName: 'Zenith Bank', accountName: 'Aura Consulting', last4: '9012' },
    { bankName: 'Access Bank', accountName: 'Tunde O.', last4: '3456' },
];

export const fetchConnections = async (): Promise<BankConnection[]> => {
  try {
    return await api.get<BankConnection[]>('/connections/');
  } catch {
    await sleep(500);
    return [...mockConnections];
  }
};

export const simulateConnect = async (provider: 'mono' | 'okra'): Promise<BankConnection> => {
  try {
    return await api.post<BankConnection>('/connections/connect', { provider });
  } catch {
    await sleep(2500); // Simulate the user interacting with the widget
    // Pick a random bank that isn't already connected
    const connectedBankNames = mockConnections.map(c => c.bankName);
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

    mockConnections.push(newConnection);
    return newConnection;
  }
};

export const unlinkConnection = async (id: string): Promise<void> => {
  try {
    await api.delete(`/connections/${id}`);
  } catch {
    await sleep(700);
    mockConnections = mockConnections.filter(c => c.id !== id);
  }
};

export const syncConnection = async (id: string): Promise<BankConnection> => {
    try {
      return await api.post<BankConnection>(`/connections/${id}/sync`);
    } catch {
      await sleep(1500);
      const connectionIndex = mockConnections.findIndex(c => c.id === id);
      if(connectionIndex === -1) {
          throw new Error("Connection not found.");
      }
      mockConnections[connectionIndex].lastSynced = new Date().toISOString();
      return mockConnections[connectionIndex];
    }
}
