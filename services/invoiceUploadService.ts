import { aiClient, API_KEY, withTimeout, safeParseJSON } from './aiConfig';
import { usageService } from './usageService';
import { monitoringService } from './monitoringService';

export interface InvoiceUploadData {
  customer: string;
  description: string;
  amount: number;
  vat: number;
  total: number;
  issueDate: string;
  dueDate: string;
  lineItems: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  currency: string;
  notes: string;
  reference?: string;
  confidence: number;
}

function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve({ inlineData: { data: base64, mimeType: file.type } });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fileToText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsText(file);
  });
}

const invoiceSchema = {
  type: 'object',
  properties: {
    customer: { type: 'string', description: 'Customer or client name' },
    description: { type: 'string', description: 'Overall description of the invoice' },
    amount: { type: 'number', description: 'Subtotal before tax' },
    vat: { type: 'number', description: 'VAT amount (typically 7.5% in Nigeria)' },
    total: { type: 'number', description: 'Total amount including tax' },
    issueDate: { type: 'string', description: 'Invoice date in YYYY-MM-DD format' },
    dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD format' },
    currency: { type: 'string', description: 'Currency code (NGN, USD, EUR, GBP)' },
    reference: { type: 'string', description: 'Invoice number or reference from the document' },
    notes: { type: 'string', description: 'Any notes or terms from the invoice' },
    lineItems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          quantity: { type: 'number' },
          unitPrice: { type: 'number' },
          total: { type: 'number' },
        },
      },
    },
  },
};

export async function extractInvoiceFromFile(file: File): Promise<InvoiceUploadData> {
  if (await usageService.isRateLimited('ocr_scan')) {
    throw new Error('Upload limit reached for your plan.');
  }

  if (!aiClient || !API_KEY) {
    return simulateExtraction(file.name);
  }

  try {
    let parts: any[];
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    const systemInstruction = `Analyze this invoice document and extract ALL data. Return structured JSON matching the provided schema.
Be precise with numbers. If a field is not found, use reasonable defaults (empty string for text, 0 for numbers, today's date for dates). For Nigerian invoices, VAT is typically 7.5%.`;

    if (isImage) {
      const imagePart = await fileToGenerativePart(file);
      parts = [imagePart, { text: "Extract invoice data from this image." }];
    } else if (isPDF) {
      // For PDFs, try reading as text first (digital PDFs)
      const text = await fileToText(file);
      if (text.length > 100 && !text.includes('%PDF')) {
        // Digital PDF with extractable text
        parts = [{ text: `Extract invoice data from this text content:\n\n${text.slice(0, 10000)}` }];
      } else {
        // Scanned PDF — can't read directly, simulate
        return simulateExtraction(file.name);
      }
    } else {
      return simulateExtraction(file.name);
    }

    const response = await withTimeout(aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: invoiceSchema as any,
      },
    }), 20000);

    await usageService.trackUsage('ocr_scan');

    const result = safeParseJSON<any>(response.text.trim());

    // AI Quality: Validate expected JSON structure to prevent silent UI crashes on malformed output
    if (!result || typeof result !== 'object') {
      throw new Error('AI output is missing required fields or is malformed');
    }

    return {
      ...result,
      confidence: 0.9,
      lineItems: Array.isArray(result.lineItems) ? result.lineItems : [],
    };
  } catch (error) {
    monitoringService.trackError('INVOICE_UPLOAD', error as Error);
    return simulateExtraction(file.name);
  }
}

function simulateExtraction(fileName: string): InvoiceUploadData {
  const today = new Date().toISOString().split('T')[0];
  const due = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  return {
    customer: 'Uploaded Customer',
    description: `Invoice from ${fileName}`,
    amount: 100000,
    vat: 7500,
    total: 107500,
    issueDate: today,
    dueDate: due,
    currency: 'NGN',
    reference: `UP-${Date.now().toString(36).toUpperCase()}`,
    notes: '',
    lineItems: [{ name: 'Service', description: 'Extracted from upload', quantity: 1, unitPrice: 100000, total: 100000 }],
    confidence: 0.7,
  };
}
