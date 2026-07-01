import { aiClient, API_KEY, withTimeout } from './aiConfig';
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
    return simulateInvoiceGeneration(prompt);
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
    const response = await withTimeout(aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUser request: ${prompt}` }] }],
      config: {
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
    const result = JSON.parse(response.text.trim());
    return result as AIGeneratedInvoice;
  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    throw new Error('Failed to generate invoice from prompt.');
  }
}

function simulateInvoiceGeneration(prompt: string): AIGeneratedInvoice {
  const lower = prompt.toLowerCase();
  let customer = 'Customer';
  const lines: string[] = ['for', 'to', 'from', 'client', 'customer'];
  for (const line of lines) {
    const match = lower.match(new RegExp(`${line}\\s+(.+?)(?:\\s+for|\\s+amount|\\s+₦|$)`));
    if (match) { customer = match[1].trim().replace(/^["']|["']$/g, ''); break; }
  }

  const amountMatch = prompt.match(/₦?\s*([\d,]+(?:\.\d+)?)/);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 50000;
  const items = prompt.match(/(?:service|product|item|work|consulting|design|development|delivery)\w*/gi) || ['Professional Service'];

  const lineItems = items.slice(0, 5).map(item => ({
    name: item.charAt(0).toUpperCase() + item.slice(1),
    quantity: 1,
    unitPrice: Math.round(amount / items.length),
    total: Math.round(amount / items.length),
  }));

  const subtotal = lineItems.reduce((s, i) => s + i.total, 0);
  const vat = Math.round(subtotal * 0.075);

  return {
    customer,
    description: prompt.slice(0, 100),
    lineItems,
    amount: subtotal,
    vat,
    total: subtotal + vat,
  };
}
