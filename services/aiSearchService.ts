import { aiClient, API_KEY, withTimeout, safeParseJSON } from './aiConfig';
import { usageService } from './usageService';
import { monitoringService } from './monitoringService';
import type { CategorizedTransaction, Invoice, Bill, Contact } from '../types';

export interface SearchResult {
  type: 'transaction' | 'invoice' | 'bill' | 'contact' | 'insight';
  id: string;
  title: string;
  subtitle: string;
  amount?: number;
  date?: string;
  status?: string;
}

export async function naturalLanguageSearch(
  query: string,
  transactions: CategorizedTransaction[],
  invoices: Invoice[],
  bills: Bill[],
  contacts: Contact[]
): Promise<SearchResult[]> {
  if (!aiClient || !API_KEY) {
    return simulateSearch(query, transactions, invoices, bills, contacts);
  }

  if (await usageService.isRateLimited('ai_chat')) {
    return simulateSearch(query, transactions, invoices, bills, contacts);
  }

  const context = {
    transactionCount: transactions.length,
    invoiceCount: invoices.length,
    billCount: bills.length,
    contactCount: contacts.length,
    sampleTransactions: transactions.slice(0, 5).map(t => ({ id: t.id, narration: t.narration, amount: t.amount, type: t.type, category: t.category })),
    sampleInvoices: invoices.slice(0, 5).map(i => ({ id: i.id, customer: i.customer, total: i.total, status: i.status })),
    sampleBills: bills.slice(0, 5).map(b => ({ id: b.id, vendor: b.vendor, amount: b.amount, status: b.status })),
    sampleContacts: contacts.slice(0, 5).map(c => ({ id: c.id, name: c.name, type: c.type })),
  };

  try {
    monitoringService.trackAIUsage('nl_search', query);
    const response = await withTimeout(() => aiClient.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [{
          text: `User query: "${query}"\n\nAvailable data: ${JSON.stringify(context)}`
        }],
      }],
      config: {
        // AI Quality: Extracted persona and formatting constraints to systemInstruction
        // to prevent prompt injection and ensure structural adherence
        systemInstruction: `You are a search engine for a financial app. Given this user query, find matching items from the data below.
Return JSON array of matches with ONLY: type (transaction/invoice/bill/contact) and id.
Limit to 10 results. Only return actual matches.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              id: { type: 'string' },
            },
            required: ['type', 'id']
          },
        },
      },
    }), 10000);

    await usageService.trackUsage('ai_chat');
    const result = safeParseJSON<any[]>(response.text.trim());

    // AI Quality: Validate expected JSON structure to prevent silent UI crashes on malformed output
    if (!Array.isArray(result) || (result.length > 0 && (!result[0] || typeof result[0] !== 'object'))) {
      throw new Error('AI output is not an array or contains invalid objects');
    }

    // AI Quality: Strict runtime validation of expected output schema.
    // Ensure all required fields exist and the type enum is valid.
    // If not, fail loudly so the catch block handles graceful fallback.
    const validTypes = ['transaction', 'invoice', 'bill', 'contact', 'insight'];

    for (const item of result) {
      if (!item.type || !validTypes.includes(item.type) || !item.id) {
        throw new Error('AI output is missing required fields or has invalid types');
      }
    }

    // AI Quality: Reconstruct full objects manually instead of trusting AI to echo
    // complex source data back accurately. This prevents silent data corruption.
    const fullResults: SearchResult[] = [];
    for (const item of result) {
      if (item.type === 'transaction') {
        const match = transactions.find(t => t.id === item.id);
        if (match) fullResults.push({ type: 'transaction', id: match.id, title: match.narration, subtitle: `${match.category} • ${match.type}`, amount: match.amount, date: match.date });
      } else if (item.type === 'invoice') {
        const match = invoices.find(i => i.id === item.id);
        if (match) fullResults.push({ type: 'invoice', id: match.id, title: `Invoice to ${match.customer}`, subtitle: match.description || '', amount: match.total, date: match.issueDate, status: match.status });
      } else if (item.type === 'bill') {
        const match = bills.find(b => b.id === item.id);
        if (match) fullResults.push({ type: 'bill', id: match.id, title: `Bill from ${match.vendor}`, subtitle: match.description || '', amount: match.amount, date: match.issueDate, status: match.status });
      } else if (item.type === 'contact') {
        const match = contacts.find(c => c.id === item.id);
        if (match) fullResults.push({ type: 'contact', id: match.id, title: match.name, subtitle: `${match.type} • ${match.companyName || match.email}` });
      }
    }

    return fullResults;
  } catch (error) {
    monitoringService.trackError('AI_ENGINE', error as Error);
    return simulateSearch(query, transactions, invoices, bills, contacts);
  }
}

function simulateSearch(
  query: string,
  transactions: CategorizedTransaction[],
  invoices: Invoice[],
  bills: Bill[],
  contacts: Contact[]
): SearchResult[] {
  const q = query.toLowerCase();
  const results: SearchResult[] = [];

  transactions.filter(t =>
    t.narration.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
  ).slice(0, 5).forEach(t => {
    results.push({
      type: 'transaction', id: t.id,
      title: t.narration, subtitle: `${t.category} • ${t.type}`,
      amount: t.amount, date: t.date,
    });
  });

  invoices.filter(i =>
    i.customer.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
  ).slice(0, 5).forEach(i => {
    results.push({
      type: 'invoice', id: i.id,
      title: `Invoice to ${i.customer}`, subtitle: i.description || '',
      amount: i.total, date: i.issueDate, status: i.status,
    });
  });

  bills.filter(b =>
    b.vendor.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)
  ).slice(0, 5).forEach(b => {
    results.push({
      type: 'bill', id: b.id,
      title: `Bill from ${b.vendor}`, subtitle: b.description || '',
      amount: b.amount, date: b.issueDate, status: b.status,
    });
  });

  contacts.filter(c =>
    c.name.toLowerCase().includes(q) || c.companyName?.toLowerCase().includes(q)
  ).slice(0, 5).forEach(c => {
    results.push({
      type: 'contact', id: c.id,
      title: c.name, subtitle: `${c.type} • ${c.companyName || c.email}`,
    });
  });

  return results.slice(0, 10);
}
