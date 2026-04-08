
import { GoogleGenAI, Type } from "@google/genai";
import type { RawTransaction, CategorizedTransaction, FinancialInsight, Invoice, ReportData, PayrollRun } from '../types';

const API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const categorizeTransactions = async (transactions: RawTransaction[], categoryList: string[]): Promise<CategorizedTransaction[]> => {
  if (!ai || !API_KEY) {
     return transactions.map(t => ({ ...t, category: 'Uncategorized' }));
  }

  const transactionSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        amount: { type: Type.NUMBER },
        type: { type: Type.STRING },
        date: { type: Type.STRING },
        narration: { type: Type.STRING },
        balance: { type: Type.NUMBER, nullable: true },
        category: { 
          type: Type.STRING,
          description: `Categorize the transaction into one of the following, based on Nigerian business context: ${categoryList.join(', ')}. If the category is ambiguous or cannot be determined, use 'Uncategorized'.`
        },
      },
      required: ["id", "amount", "type", "date", "narration", "category"],
    },
  };

  const prompt = `
    You are an expert accountant for Nigerian businesses. Analyze the following list of bank transactions. Your task is to accurately categorize each transaction into ONE of the specified categories.
    The 'balance' field is the running balance after the transaction and might not be present. Do not use it for categorization.
    Prioritize accuracy. If a transaction cannot be clearly categorized, assign it to 'Uncategorized'.
    The 'narration' field contains the most context for categorization. Infer based on common Nigerian payment descriptions (e.g., NIP, PAYSTACK, JUMIA, IKEDC, BOLT, SALARY).

    Here are the ONLY allowed categories:
    ${categoryList.join(', ')}

    Here is the transaction list:
    ${JSON.stringify(transactions, null, 2)}

    Return a JSON array matching the provided schema. For transactions that look like salary payments, use the 'Salaries & Wages' category.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: transactionSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as CategorizedTransaction[];

  } catch (error) {
    console.error("Error categorizing transactions:", error);
    // Fallback: return transactions with a default category
    return transactions.map(t => ({ ...t, category: 'Uncategorized' }));
  }
};


const insightsSchema = {
  type: Type.ARRAY,
  items: {
      type: Type.OBJECT,
      properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
      },
      required: ['title', 'description', 'priority']
  }
};


export const getFinancialInsights = async (transactions: CategorizedTransaction[]): Promise<FinancialInsight[]> => {
  if (!ai || !API_KEY) {
    return [
      {
        title: 'AI Analysis Disabled',
        description: 'Set your Gemini API key to enable automated financial insights.',
        priority: 'Medium',
      }
    ];
  }

  if (transactions.length === 0) {
    return [];
  }
  
  const prompt = `
    Based on the following financial transactions for a Nigerian small business, generate 3 concise and actionable insights.
    Focus on spending patterns, income sources, potential savings, and financial health warnings.
    Format the output as a JSON array according to the provided schema.

    Transactions:
    ${JSON.stringify(transactions, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: insightsSchema,
      },
    });
    
    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    return result as FinancialInsight[];

  } catch (error) {
    console.error("Error getting financial insights:", error);
    return [
      {
        title: 'Analysis Unavailable',
        description: 'Could not generate AI insights at this time. Please check your connection or API key.',
        priority: 'High',
      }
    ];
  }
};

export const getPayrollInsights = async (payrollHistory: PayrollRun[]): Promise<string> => {
  if (!ai || !API_KEY) {
      return "AI features are disabled. Please set your API key.";
  }
  if (payrollHistory.length === 0) {
    return "Run your first payroll to get AI-powered strategic insights on workforce spending and trends.";
  }

  const prompt = `
    You are an expert HR and Finance strategist for a Nigerian SME.
    Analyze the following payroll history for a business. The most recent run is the first in the array.
    
    Payroll History:
    ${JSON.stringify(payrollHistory, null, 2)}

    Provide one concise, actionable strategic insight based on trends in the data.
    Focus on things like:
    - Growth in total payroll cost over time.
    - Changes in employee count.
    - The impact of bonuses on total payout.
    - Any potential cost-saving observations or budgeting advice.
    
    Keep the insight to 2-3 sentences. Be specific and data-driven. For example, instead of "payroll is growing", say "Your total payroll has increased by X% over the last Y months, driven by Z."
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error getting payroll insights:", error);
    return "Could not generate AI insight at this time.";
  }
};


export const getFinancialReportAnalysis = async (currentPeriodData: ReportData, comparisonPeriodData?: ReportData): Promise<string> => {
    if (!ai || !API_KEY) {
        return "AI features are disabled. Please set your API key.";
    }

    const prompt = `
    You are a professional CFO providing an Executive Summary for a Nigerian Small Business owner.
    Analyze the following financial data for the current period. If comparison data is provided, highlight key changes and trends.
    Your analysis must be insightful, easy to understand, and actionable. Use Nigerian Naira (NGN).

    **Current Period Financial Data:**
    - Profit & Loss: ${JSON.stringify(currentPeriodData.pAndL, null, 2)}
    - Balance Sheet: ${JSON.stringify(currentPeriodData.balanceSheet, null, 2)}
    - Cash Flow: ${JSON.stringify(currentPeriodData.cashFlow, null, 2)}

    **Comparison Period Financial Data (if available):**
    ${comparisonPeriodData ? JSON.stringify(comparisonPeriodData.pAndL, null, 2) : "Not available"}

    **Your Task:**
    Generate a comprehensive Executive Summary covering these points:
    1.  **Overall Performance:** Start with a 1-2 sentence summary of the business's performance in the current period (e.g., profitable, growing, facing challenges).
    2.  **Profitability Analysis (P&L):**
        - Comment on the Gross Profit and Net Profit. Is the core business profitable before operating expenses? How much is left after all expenses?
        - What are the top 3 expense categories? Are they reasonable for the revenue generated? Point out any significant increases in expenses compared to the prior period.
    3.  **Financial Health (Balance Sheet):**
        - Analyze the Current Ratio (${currentPeriodData.balanceSheet.currentRatio.toFixed(2)}). Explain what this means in simple terms (e.g., ability to cover short-term debts).
        - Comment on the levels of Accounts Receivable vs Accounts Payable. Is the company collecting cash faster than it's paying bills?
    4.  **Cash Flow Analysis:**
        - Was the cash flow for the period positive or negative?
        - Where did the cash come from/go to (Operating, Financing)? Was the business's core operation generating cash?
    5.  **One Key Strategic Recommendation:** Based on your entire analysis, provide one clear, actionable recommendation for the business owner.

    Structure your response with clear headings or bullet points for readability. Be professional, but avoid overly technical jargon.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error getting financial report analysis:", error);
        return "Could not generate AI analysis at this time. Please check your connection or API key.";
    }
};

export const generateInvoiceReminder = async (invoice: Invoice): Promise<string> => {
  if (!ai || !API_KEY) {
      return "AI features are disabled. Please set your API key.";
  }

  const prompt = `
    You are a professional and polite accounting assistant for a Nigerian business.
    Generate a reminder email for the following invoice which is unpaid.
    The customer's name is ${invoice.customer}.
    The invoice amount is NGN ${invoice.total.toLocaleString()}.
    The due date was ${new Date(invoice.dueDate).toLocaleDateString('en-GB')}.
    The invoice is for "${invoice.description}".

    Keep the tone friendly but professional. Mention the invoice ID (${invoice.id.slice(-6)}) and amount for reference.
    Start the email with a greeting to the customer. End with a polite closing.
    Do not include a subject line. Just generate the body of the email.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error generating invoice reminder:", error);
    return "Could not generate AI reminder at this time.";
  }
};
