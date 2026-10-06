import { aiClient, API_KEY, withTimeout, safeParseJSON } from './aiConfig';
import { usageService } from './usageService';
import { monitoringService } from './monitoringService';
import type { Invoice, LineItem } from '../types';

export interface AIGeneratedInvoice {
  customer: string;
  description: string;
  lineItems: Array<{ name: string; quantity: number; unitPrice: number; total: number }>;
  amount: number;
  vat: number;
  total: number;
}

export async function generateInvoiceFromPrompt(prompt: string): Promise<AIGeneratedInvoice> {
  if (!aiClient || !API_KEY) {
    throw new Error('AI client not configured. Cannot generate invoice.');
  }

  if (await usageService.isRateLimited('ai_chat')) {
    throw new Error('AI limit reached for this month.');
  }

  const systemPrompt = `You are an AI assistant for a Nigerian accounting app. Parse the user's invoice request and generate structured invoice data.
  VAT rate is 7.5%. All amounts in NGN (₦).
  Return JSON with: customer, description, lineItems (array of {name, quantity, unitPrice, total}), amount (subtotal), vat, total.
  If the user doesn't specify quantities, default to 1. If they don't specify a customer, use "Customer".`;

  try {
    monitoringService.trackAIUsage('invoice_generation', prompt);
    const response = await withTimeout(() => aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: `User request: ${prompt}` }] }],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            customer: { type: 'string' },
            description: { type: 'string' },
            lineItems: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  quantity: { type: 'number' },
                  unitPrice: { type: 'number' },
                  total: { type: 'number' },
                },
              },
            },
            amount: { type: 'number' },
            vat: { type: 'number' },
            total: { type: 'number' },
          },
        },
      },
    }), 15000);

    await usageService.trackUsage('ai_chat');
    const result = safeParseJSON(response.text.trim());

    // AI Quality: Validate expected JSON structure to prevent silent UI crashes on malformed output
    if (!result || typeof result !== 'object' || !(result as any).customer || !Array.isArray((result as any).lineItems)) {
      throw new Error('AI output is missing required fields or is malformed');
    }

    return result as AIGeneratedInvoice;
  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    throw new Error('Failed to generate invoice from prompt.');
  }
}
