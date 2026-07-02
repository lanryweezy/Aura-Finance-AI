import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportToCSV, exportToJSON } from '../exportService';

// Mock browser APIs
beforeEach(() => {
  Object.defineProperty(global, 'URL', {
    value: {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    },
  });
  Object.defineProperty(global, 'document', {
    value: {
      ...document,
      createElement: vi.fn(() => ({ href: '', download: '', click: vi.fn() })),
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
    },
  });
});

describe('Export Service', () => {
  it('should export data to CSV', () => {
    const data = [
      { name: 'Test Invoice', amount: 100000, status: 'Paid' },
      { name: 'Test Bill', amount: 50000, status: 'Unpaid' },
    ];
    expect(() => exportToCSV('test', data)).not.toThrow();
  });

  it('should export data to JSON', () => {
    const data = [{ id: 1, name: 'Test' }];
    expect(() => exportToJSON('test', data)).not.toThrow();
  });

  it('should handle empty data', () => {
    expect(() => exportToCSV('empty', [])).not.toThrow();
    expect(() => exportToJSON('empty', [])).not.toThrow();
  });
});
