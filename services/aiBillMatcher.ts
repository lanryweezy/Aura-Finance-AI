import { aiClient, API_KEY, withTimeout, safeParseJSON } from './aiConfig';
import { usageService } from './usageService';
import type { Bill, PurchaseOrder } from '../types';

export interface BillMatch {
  billId: string;
  poId: string;
  confidence: number;
  reason: string;
}

export async function matchBillsToPOs(bills: Bill[], pos: PurchaseOrder[]): Promise<BillMatch[]> {
  if (bills.length === 0 || pos.length === 0) return [];

  if (!aiClient || !API_KEY) {
    return simulateMatching(bills, pos);
  }

  if (await usageService.isRateLimited('ai_insight')) {
    return simulateMatching(bills, pos);
  }

  try {
    const response = await withTimeout(aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: `Bills: ${JSON.stringify(bills.map(b => ({ id: b.id, vendor: b.vendor, amount: b.amount, description: b.description })))}\n\nPOs: ${JSON.stringify(pos.map(p => ({ id: p.id, vendor: p.vendor, total: p.total, lineItems: p.lineItems?.map((l: any) => l.name) })))}` }] }],
      config: {
        systemInstruction: 'You are an AI assistant. Match these bills to purchase orders based on the provided JSON data. Return a JSON array of matches with billId, poId, confidence (0-1), and reason.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              billId: { type: 'string' },
              poId: { type: 'string' },
              confidence: { type: 'number' },
              reason: { type: 'string' },
            },
          },
        },
      },
    }), 15000);

    await usageService.trackUsage('ai_insight');
    const result = safeParseJSON(response.text.trim());

    // AI Quality: Validate expected JSON structure to prevent silent UI crashes on malformed output
    if (!result || !Array.isArray(result)) {
      throw new Error('AI output is not an array or is malformed');
    }

    return result as BillMatch[];
  } catch (error) {
    return simulateMatching(bills, pos);
  }
}

function simulateMatching(bills: Bill[], pos: PurchaseOrder[]): BillMatch[] {
  const matches: BillMatch[] = [];
  for (const bill of bills) {
    for (const po of pos) {
      if (bill.vendor.toLowerCase() === po.vendor.toLowerCase()) {
        const amountDiff = Math.abs(bill.amount - po.total);
        const confidence = amountDiff < po.total * 0.1 ? 0.95 : amountDiff < po.total * 0.3 ? 0.7 : 0.4;
        if (confidence > 0.5) {
          matches.push({ billId: bill.id, poId: po.id, confidence, reason: `Same vendor (${bill.vendor}), amount within ${((amountDiff / po.total) * 100).toFixed(0)}%` });
        }
      }
    }
  }
  return matches;
}
