import { describe, it, expect } from 'vitest';
import { exportToCSV, exportToJSON, exportFirsVatSchedule, exportFirsWhtSchedule } from '../exportService';

describe('Export Service Integration', () => {
  const sampleData = [
    { id: '1', customer: 'TechCorp', amount: 100000, status: 'Paid', date: '2026-01-01' },
    { id: '2', customer: 'GreenLeaf', amount: 200000, status: 'Unpaid', date: '2026-01-15' },
  ];

  beforeEach(() => {
    // Mock URL.createObjectURL for jsdom
    if (!URL.createObjectURL) {
      URL.createObjectURL = vi.fn(() => 'blob:mock');
    }
    if (!URL.revokeObjectURL) {
      URL.revokeObjectURL = vi.fn();
    }
  });

  it('should export CSV without errors', () => {
    expect(() => exportToCSV('test-export', sampleData)).not.toThrow();
  });

  it('should export JSON without errors', () => {
    expect(() => exportToJSON('test-export', sampleData)).not.toThrow();
  });

  it('should handle empty data', () => {
    expect(() => exportToCSV('empty', [])).not.toThrow();
    expect(() => exportToJSON('empty', [])).not.toThrow();
  });

  it('should export FIRS VAT schedule without errors', () => {
    const invoices = [
      { id: '1', customer: 'Test', amount: 100000, vat: 7500, total: 107500, issueDate: '2026-01-01' },
    ];
    expect(() => exportFirsVatSchedule(invoices, '2026-01-01', '2026-01-31')).not.toThrow();
  });
});
