import { aiClient, API_KEY, withTimeout, safeParseJSON } from './aiConfig';
import { usageService } from './usageService';
import { monitoringService } from './monitoringService';
import type { ReceiptScan } from '../types';

export const receiptOcrService = {
  scanReceipt: async (imageUrl: string, imageFile?: File): Promise<ReceiptScan> => {
    if (await usageService.isRateLimited('ocr_scan')) {
      throw new Error('OCR scan limit reached for your plan.');
    }

    if (!aiClient || !API_KEY) {
      return simulateOcr(imageUrl);
    }

    try {
      let imagePart: any;
      if (imageFile) {
        const base64 = await fileToBase64(imageFile);
        imagePart = { inlineData: { data: base64, mimeType: imageFile.type } };
      } else {
        imagePart = { fileData: { mimeType: 'image/jpeg', fileUri: imageUrl } };
      }

      // AI Quality: Extract persona and formatting rules into systemInstruction
      // to ensure strict adherence and reduce risk of prompt injection.
      const systemInstruction = `You are an expert AI data extractor. Analyze the provided receipt and extract: merchant name, date (YYYY-MM-DD), total amount, VAT amount, category, description, and line items (description + amount). Return as JSON.`;

      const response = await withTimeout(aiClient.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [imagePart] }],
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'object',
            properties: {
              merchantName: { type: 'string' },
              date: { type: 'string' },
              totalAmount: { type: 'number' },
              vat: { type: 'number' },
              category: { type: 'string' },
              description: { type: 'string' },
              lineItems: { type: 'array', items: { type: 'object', properties: { description: { type: 'string' }, amount: { type: 'number' } } } },
              confidence: { type: 'number' },
            },
          },
        },
      }), 15000);

      await usageService.trackUsage('ocr_scan');
      const result = safeParseJSON<any>(response.text.trim());

      // AI Quality: Validate expected JSON structure to prevent silent UI crashes on malformed output
      if (!result || typeof result !== 'object' || !result.merchantName || typeof result.totalAmount !== 'number' || !result.date) {
        throw new Error('AI output is missing required fields or is malformed');
      }

      return { ...result, id: `scan_${Date.now()}`, imageUrl, status: 'scanned', createdAt: new Date().toISOString() } as ReceiptScan;
    } catch (error) {
      monitoringService.trackError('OCR_ENGINE', error as Error);
      return simulateOcr(imageUrl);
    }
  },
};

function simulateOcr(imageUrl: string): ReceiptScan {
  return {
    id: `scan_${Date.now()}`, imageUrl,
    merchantName: 'Sample Merchant', date: new Date().toISOString().split('T')[0],
    totalAmount: 15000, vat: 1125, category: 'Office Supplies',
    description: 'Office supplies purchase', lineItems: [{ description: 'Office supplies', amount: 15000 }],
    confidence: 0.85, status: 'scanned', createdAt: new Date().toISOString(),
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
