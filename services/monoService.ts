
import type { RawTransaction } from '../types';
import { localDb } from './localDb';

const STORAGE_KEY = 'raw_transactions';

const initialMockData: RawTransaction[] = [
  {
    "id": "txn_1",
    "amount": 500000,
    "type": "credit",
    "date": "2023-10-28T10:00:00Z",
    "narration": "PAYSTACK/INVOICE-CLIENT-A",
    "balance": 1500000
  },
  {
    "id": "txn_2",
    "amount": 25000,
    "type": "debit",
    "date": "2023-10-28T12:30:00Z",
    "narration": "BUYGOODS/JUMIA-OFFICESUPPLIES",
    "balance": 1475000
  },
  {
    "id": "txn_3",
    "amount": 5000,
    "type": "debit",
    "date": "2023-10-29T09:15:00Z",
    "narration": "AIRTIME VTU PURCHASE-MTN",
    "balance": 1470000
  },
  {
    "id": "txn_4",
    "amount": 150000,
    "type": "debit",
    "date": "2023-10-30T18:00:00Z",
    "narration": "NIP/UBA-DESIGNER-OCT-SALARY",
    "balance": 1320000
  },
  {
    "id": "txn_5",
    "amount": 75000,
    "type": "debit",
    "date": "2023-11-01T11:00:00Z",
    "narration": "WEB/GOOGLE-ADS-MARKETING",
    "balance": 1245000
  },
  {
    "id": "txn_6",
    "amount": 750000,
    "type": "credit",
    "date": "2023-11-02T14:20:00Z",
    "narration": "NIP FROM CLIENT B",
    "balance": 1995000
  },
  {
    "id": "txn_7",
    "amount": 15000,
    "type": "debit",
    "date": "2023-11-03T13:00:00Z",
    "narration": "IKEDC/ELECTRICITY-BILL",
    "balance": 1980000
  },
  {
    "id": "txn_8",
    "amount": 12500,
    "type": "debit",
    "date": "2023-11-05T16:45:00Z",
    "narration": "BOLT/RIDE-IKEJA",
    "balance": 1967500
  },
   {
    "id": "txn_9",
    "amount": 350000,
    "type": "debit",
    "date": "2023-11-06T10:00:00Z",
    "narration": "NIP/UBA-DEVELOPER-NOV-SALARY",
    "balance": 1617500
  },
  {
    "id": "txn_10",
    "amount": 250000,
    "type": "credit",
    "date": "2023-11-07T15:00:00Z",
    "narration": "PAYMENT RECEIVED/PROJECT-C",
    "balance": 1867500
  }
];

export const fetchTransactions = async (): Promise<RawTransaction[]> => {
    return localDb.simulateRequest(() => {
        let transactions = localDb.load<RawTransaction[]>(STORAGE_KEY, []);
        if (transactions.length === 0) {
            transactions = initialMockData;
            localDb.save(STORAGE_KEY, transactions);
        }
        return transactions;
    }, 1500);
};
