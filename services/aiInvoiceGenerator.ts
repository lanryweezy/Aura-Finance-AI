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
    const result = safeParseJSON(response.text.trim()) as any;

    // AI Quality: Validate expected JSON structure to prevent silent UI crashes on malformed output
    if (!result || typeof result !== 'object' || typeof result.customer !== 'string' || !Array.isArray(result.lineItems)) {
      throw new Error('AI output is missing required fields or is malformed');
    }

    // 🤖 Astra AI Quality: Implement deep validation for AI-generated arrays
    // Explicitly validate every element to fail loudly on malformed items rather than silently defaulting them.
    const isInvalidNum = (val: any) => typeof val !== 'number' && (typeof val !== 'string' || val.trim() === '' || isNaN(Number(val)));
    for (const item of result.lineItems) {
      // AI Quality: Allow empty strings and explicitly validate coercible numbers to prevent false positives
      if (!item || typeof item !== 'object' || typeof item.name !== 'string' || isInvalidNum(item.quantity) || isInvalidNum(item.unitPrice) || isInvalidNum(item.total)) {
        throw new Error('AI output line item is missing required fields or has invalid types');
      }
      // AI Quality: Coerce strings to numbers to maintain strict type boundaries and prevent downstream crashes
      item.quantity = Number(item.quantity);
      item.unitPrice = Number(item.unitPrice);
      item.total = Number(item.total);
    }

    // AI Quality: Sanitize and validate model-returned numeric values to prevent logic errors
    // Enforcing non-negative boundaries and defaults for all financial figures.
    const sanitizedInvoice: AIGeneratedInvoice = {
      customer: String(result.customer),
      description: String(result.description || ''),
      amount: Math.max(0, Number(result.amount) || 0),
      vat: Math.max(0, Number(result.vat) || 0),
      total: Math.max(0, Number(result.total) || 0),
      lineItems: result.lineItems.map((item: any) => ({
        name: String(item.name),
        quantity: Math.max(1, Number(item.quantity)),
        unitPrice: Math.max(0, Number(item.unitPrice)),
        total: Math.max(0, Number(item.total))
      }))
    };

    return sanitizedInvoice;
  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    throw new Error('Failed to generate invoice from prompt.');
  }
}
