import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV, exportToJSON } from '../exportService';

let originalBlob: any;

// Mock browser APIs
beforeEach(() => {
  Object.defineProperty(global, 'URL', {
    value: {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    },
    configurable: true
  });
  Object.defineProperty(global, 'document', {
    value: {
      ...document,
      createElement: vi.fn(() => ({ href: '', download: '', click: vi.fn() })),
      body: { appendChild: vi.fn(), removeChild: vi.fn() },
    },
    configurable: true
  });

  originalBlob = global.Blob;
  // @ts-ignore
  global.Blob = class BlobMock {
    constructor(content: any[]) {}
  };
});

afterEach(() => {
  global.Blob = originalBlob;
});

describe('Export Service', () => {

  it('should export data to CSV', () => {
    const data = [
      { name: 'Test Invoice', amount: 100000, status: 'Paid' },
      { name: 'Test Bill', amount: 50000, status: 'Unpaid' },
    ];
    expect(() => exportToCSV('test', data)).not.toThrow();
  });

  it('should escape CSV formula injections and properly quote fields', () => {
    const data = [
      {
        id: 1,
        name: '=1+1',
        desc: 'Hello, "world"',
        note: '@SUM(1)',
        comment: '-cmd|',
        multiline: 'line1\nline2'
      }
    ];

    // Test the escaping logic by spying on URL.createObjectURL since Blob throws in this vitest env
    // Because Blob is global, let's redefine Blob temporarily if needed, but actually we can't easily spy on new Blob
    // Let's redefine downloadFile or spy on Blob by intercepting it on global
    const originalBlob = global.Blob;
    let blobContent = '';

    // @ts-ignore
    global.Blob = class BlobMock {
      constructor(content: any[]) {
        blobContent = content[0];
      }
    };

    exportToCSV('test-escape', data);

    // Header should be present
    expect(blobContent).toContain('id,name,desc,note,comment,multiline');

    // Formulas should be prefixed with a single quote
    expect(blobContent).toContain(`'=1+1`);
    expect(blobContent).toContain(`'@SUM(1)`);
    expect(blobContent).toContain(`'-cmd|`);

    // Quotes and commas should be escaped and wrapped in double quotes
    expect(blobContent).toContain(`"Hello, ""world"""`);

    // Newlines should be wrapped in double quotes
    expect(blobContent).toContain(`"line1\nline2"`);

    global.Blob = originalBlob;
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
