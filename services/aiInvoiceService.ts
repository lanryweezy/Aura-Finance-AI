import { aiClient, API_KEY, withTimeout, safeParseJSON } from './aiConfig';
import { usageService } from './usageService';
import { monitoringService } from './monitoringService';

export interface AIInvoiceData {
  customer: string;
  description: string;
  lineItems: Array<{
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  amount: number;
  vat: number;
  total: number;
  notes: string;
  dueDate: string;
  currency: string;
}

export async function generateInvoiceFromPrompt(prompt: string): Promise<AIInvoiceData> {
  if (!aiClient || !API_KEY) {
    throw new Error('AI client not configured. Cannot generate invoice.');
  }

  if (await usageService.isRateLimited('ai_chat')) {
    throw new Error('AI limit reached for this month.');
  }

  const systemPrompt = `You are an AI assistant for a Nigerian accounting app. Parse the user's invoice request and generate structured invoice data.
  VAT rate is 7.5%. All amounts in NGN (₦).
  Return JSON with: customer, description, lineItems (array of {name, description, quantity, unitPrice, total}), amount (subtotal), vat, total, notes, dueDate (YYYY-MM-DD), currency.
  If the user doesn't specify quantities, default to 1. If they don't specify a customer, use "Customer". If no due date, default to 30 days from now.`;

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
                  description: { type: 'string' },
                  quantity: { type: 'number' },
                  unitPrice: { type: 'number' },
                  total: { type: 'number' },
                },
              },
            },
            amount: { type: 'number' },
            vat: { type: 'number' },
            total: { type: 'number' },
            notes: { type: 'string' },
            dueDate: { type: 'string' },
            currency: { type: 'string' },
          },
        },
      },
    }), 15000);

    await usageService.trackUsage('ai_chat');
    const result = safeParseJSON(response.text.trim()) as AIInvoiceData | null;

    // AI Quality: Validate expected JSON structure to prevent silent UI crashes on malformed output
    if (!result || typeof result !== 'object' || !result.customer || !Array.isArray(result.lineItems)) {
      throw new Error('AI output is missing required fields or is malformed');
    }

    return result;
  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    throw new Error('Failed to generate invoice from prompt.');
  }
}
