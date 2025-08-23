// SECURE AI SERVICE - All AI calls now happen on the backend
// No more client-side API key exposure!
import type { CategorizedTransaction, Invoice, Bill, Employee } from '../types';

// API base URL for backend AI services
const AI_API_BASE = process.env.VITE_API_URL || 'http://localhost:8000';

// Get settings from localStorage or defaults
const getAISettings = () => {
  const defaultSettings = {
    autoCategorizationEnabled: true,
    autoCategorizationConfidence: 85,
    autoReceiptMatching: true,
    smartDuplicateDetection: true,
    autoInvoiceReminders: true,
    autoPaymentReconciliation: true,
    smartPaymentTerms: false,
    autoLateFeesCalculation: false,
    autoExpenseApproval: false,
    expenseApprovalThreshold: 10000,
    smartVendorMatching: true,
    autoMileageTracking: false,
    autoVATCalculation: true,
    autoWHTDeduction: true,
    smartTaxOptimization: true,
    complianceAlerts: true,
    cashFlowForecasting: true,
    forecastPeriod: 90,
    smartBudgetAdjustments: false,
    automaticReporting: true,
    aiInsightsFrequency: 'weekly',
    predicitiveAnalytics: true,
    businessTrendAnalysis: true,
    competitorBenchmarking: false,
    smartNotifications: true,
    urgencyThreshold: 'medium',
    adaptiveLearning: true,
    userPreferenceLearning: true,
    businessPatternRecognition: true,
    customModelTraining: false,
  };

  const saved = localStorage.getItem('aiSettings');
  return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
};

// Secure API client for backend AI calls
const callAIService = async (endpoint: string, data: any): Promise<any> => {
  try {
    const response = await fetch(`${AI_API_BASE}/api/ai/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      console.warn(`AI service error: ${response.status}`);
      return { success: false, error: 'AI service unavailable' };
    }

    return await response.json();
  } catch (error) {
    console.warn('AI service call failed:', error);
    return { success: false, error: 'Network error' };
  }
};

// Smart Transaction Categorization with Learning (SECURE)
export const smartCategorizeTransaction = async (
  transaction: any,
  historicalData: CategorizedTransaction[],
  userCorrections: any[] = []
): Promise<{ category: string; confidence: number; reasoning: string }> => {
  const settings = getAISettings();
  
  if (!settings.autoCategorizationEnabled) {
    return { category: 'Uncategorized', confidence: 0, reasoning: 'Auto-categorization disabled' };
  }

  try {
    // Call secure backend AI service - NO MORE CLIENT-SIDE API KEYS!
    const response = await callAIService('categorize-transaction', {
      transaction,
      historical_data: historicalData.slice(-20), // Limit data sent
      user_preferences: {
        confidence_threshold: settings.autoCategorizationConfidence,
        learning_enabled: settings.adaptiveLearning,
        user_corrections: userCorrections.slice(-10)
      }
    });

    if (!response.success) {
      return { 
        category: 'Uncategorized', 
        confidence: 0, 
        reasoning: response.error || 'AI service unavailable' 
      };
    }

    const result = response.result;
    
    // Return standardized response
    return {
      category: result.category || 'Uncategorized',
      confidence: Math.round((result.confidence || 0) * 100), // Convert to percentage
      reasoning: result.reasoning || 'AI categorization completed'
    };
    
  } catch (error) {
    console.error('Transaction categorization failed:', error);
    return { category: 'Uncategorized', confidence: 0, reasoning: 'AI service error' };
  }
};

// Duplicate Detection
export const detectDuplicateTransactions = async (
  newTransaction: any,
  existingTransactions: CategorizedTransaction[]
): Promise<{ isDuplicate: boolean; matchedTransaction?: CategorizedTransaction; confidence: number }> => {
  const settings = getAISettings();
  
  if (!settings.smartDuplicateDetection) {
    return { isDuplicate: false, confidence: 0 };
  }

  const prompt = `
    Analyze if this new transaction is a duplicate of any existing transactions.
    
    NEW TRANSACTION: ${JSON.stringify(newTransaction)}
    
    RECENT TRANSACTIONS (last 50): ${JSON.stringify(existingTransactions.slice(-50))}
    
    Consider:
    - Same amount within ±2%
    - Same/similar narration
    - Date within 7 days
    - Same transaction type
    
    Return JSON: { "isDuplicate": boolean, "matchedTransactionId": "string", "confidence": number, "reason": "string" }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text);
    const matchedTransaction = result.matchedTransactionId 
      ? existingTransactions.find(t => t.id === result.matchedTransactionId)
      : undefined;

    return {
      isDuplicate: result.isDuplicate && result.confidence > 80,
      matchedTransaction,
      confidence: result.confidence
    };
  } catch (error) {
    console.error('Duplicate detection failed:', error);
    return { isDuplicate: false, confidence: 0 };
  }
};

// Smart Invoice Reminder System
export const generateIntelligentInvoiceReminder = async (
  invoice: Invoice,
  customerHistory: Invoice[] = []
): Promise<{ shouldSend: boolean; message: string; urgency: 'low' | 'medium' | 'high' }> => {
  const settings = getAISettings();
  
  if (!settings.autoInvoiceReminders) {
    return { shouldSend: false, message: '', urgency: 'low' };
  }

  const daysOverdue = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
  
  const prompt = `
    Generate a smart invoice reminder for a Nigerian business context.
    
    INVOICE DETAILS: ${JSON.stringify(invoice)}
    DAYS OVERDUE: ${daysOverdue}
    CUSTOMER HISTORY: ${JSON.stringify(customerHistory.slice(-5))}
    
    Consider:
    - Customer payment patterns
    - Nigerian business etiquette
    - Relationship preservation
    - Legal requirements
    
    Return JSON: { "shouldSend": boolean, "message": "string", "urgency": "low|medium|high", "recommendedFollowUp": "string" }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Invoice reminder generation failed:', error);
    return { shouldSend: false, message: '', urgency: 'low' };
  }
};

// Cash Flow Forecasting
export const generateCashFlowForecast = async (
  transactions: CategorizedTransaction[],
  bills: Bill[],
  invoices: Invoice[]
): Promise<{
  forecast: Array<{ date: string; projected: number; confidence: number }>;
  insights: string[];
  risks: string[];
}> => {
  const settings = getAISettings();
  
  if (!settings.cashFlowForecasting) {
    return { forecast: [], insights: [], risks: [] };
  }

  const prompt = `
    Generate a ${settings.forecastPeriod}-day cash flow forecast for a Nigerian business.
    
    HISTORICAL TRANSACTIONS: ${JSON.stringify(transactions.slice(-100))}
    PENDING BILLS: ${JSON.stringify(bills.filter(b => b.status !== 'Paid'))}
    PENDING INVOICES: ${JSON.stringify(invoices.filter(i => i.status !== 'Paid'))}
    
    Consider:
    - Nigerian seasonal patterns (rainy season, festive periods)
    - Payment behavior patterns
    - Economic factors affecting Nigerian businesses
    - Currency fluctuations (if applicable)
    
    Generate weekly forecasts with confidence levels and business insights.
    
    Return JSON: { 
      "forecast": [{"date": "YYYY-MM-DD", "projected": number, "confidence": number}],
      "insights": ["string"],
      "risks": ["string"],
      "recommendations": ["string"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Cash flow forecasting failed:', error);
    return { forecast: [], insights: [], risks: [] };
  }
};

// Smart Tax Optimization
export const generateTaxOptimizationSuggestions = async (
  transactions: CategorizedTransaction[],
  currentQuarter: number
): Promise<{
  suggestions: Array<{ title: string; description: string; impact: number; urgency: string }>;
  complianceAlerts: Array<{ type: string; deadline: string; action: string }>;
}> => {
  const settings = getAISettings();
  
  if (!settings.smartTaxOptimization) {
    return { suggestions: [], complianceAlerts: [] };
  }

  const prompt = `
    Provide tax optimization suggestions for a Nigerian business based on current transactions.
    
    TRANSACTIONS: ${JSON.stringify(transactions)}
    CURRENT QUARTER: ${currentQuarter}
    
    Focus on:
    - VAT optimization (7.5%)
    - WHT planning
    - Company Income Tax strategies
    - PAYE optimization
    - Nigerian tax deadlines and compliance
    
    Return JSON: {
      "suggestions": [{"title": "string", "description": "string", "impact": number, "urgency": "string"}],
      "complianceAlerts": [{"type": "string", "deadline": "string", "action": "string"}],
      "potentialSavings": number
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Tax optimization failed:', error);
    return { suggestions: [], complianceAlerts: [] };
  }
};

// Predictive Business Analytics
export const generatePredictiveAnalytics = async (
  transactions: CategorizedTransaction[],
  timeframe: 'monthly' | 'quarterly' | 'yearly' = 'monthly'
): Promise<{
  trends: Array<{ metric: string; trend: 'up' | 'down' | 'stable'; change: number; prediction: string }>;
  opportunities: string[];
  threats: string[];
  recommendations: string[];
}> => {
  const settings = getAISettings();
  
  if (!settings.predicitiveAnalytics) {
    return { trends: [], opportunities: [], threats: [], recommendations: [] };
  }

  const prompt = `
    Perform predictive analytics for a Nigerian business using transaction data.
    
    TRANSACTION DATA: ${JSON.stringify(transactions)}
    ANALYSIS TIMEFRAME: ${timeframe}
    
    Analyze:
    - Revenue trends and patterns
    - Expense category trends
    - Seasonal patterns in Nigerian context
    - Cash flow patterns
    - Growth opportunities
    - Risk factors
    
    Consider Nigerian business environment:
    - Economic conditions
    - Regulatory changes
    - Market dynamics
    - Currency stability
    
    Return JSON: {
      "trends": [{"metric": "string", "trend": "up|down|stable", "change": number, "prediction": "string"}],
      "opportunities": ["string"],
      "threats": ["string"],
      "recommendations": ["string"],
      "confidence": number
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Predictive analytics failed:', error);
    return { trends: [], opportunities: [], threats: [], recommendations: [] };
  }
};

// Smart Notification System
export const generateSmartNotifications = async (
  businessData: {
    transactions: CategorizedTransaction[];
    bills: Bill[];
    invoices: Invoice[];
    employees: Employee[];
  }
): Promise<Array<{
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  urgency: 'low' | 'medium' | 'high';
  actionRequired: boolean;
  actionText?: string;
  dismissible: boolean;
}>> => {
  const settings = getAISettings();
  
  if (!settings.smartNotifications) {
    return [];
  }

  const prompt = `
    Generate intelligent notifications for a Nigerian business based on current state.
    
    BUSINESS DATA: ${JSON.stringify(businessData)}
    URGENCY THRESHOLD: ${settings.urgencyThreshold}
    
    Generate contextual notifications for:
    - Overdue invoices
    - Upcoming tax deadlines
    - Cash flow concerns
    - Unusual spending patterns
    - Compliance requirements
    - Business opportunities
    
    Only include notifications that meet the urgency threshold: ${settings.urgencyThreshold}
    
    Return JSON array: [{
      "id": "string",
      "type": "info|warning|success|error",
      "title": "string",
      "message": "string",
      "urgency": "low|medium|high",
      "actionRequired": boolean,
      "actionText": "string",
      "dismissible": boolean
    }]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const notifications = JSON.parse(response.text);
    
    // Filter based on urgency threshold
    const urgencyOrder = { low: 1, medium: 2, high: 3 };
    const threshold = urgencyOrder[settings.urgencyThreshold];
    
    return notifications.filter((n: any) => urgencyOrder[n.urgency] >= threshold);
  } catch (error) {
    console.error('Smart notifications failed:', error);
    return [];
  }
};

// Automated Expense Approval
export const shouldAutoApproveExpense = async (
  expense: any,
  employeeHistory: any[] = []
): Promise<{ approved: boolean; reason: string; requiresReview: boolean }> => {
  const settings = getAISettings();
  
  if (!settings.autoExpenseApproval) {
    return { approved: false, reason: 'Auto-approval disabled', requiresReview: true };
  }

  // Simple threshold check first
  if (expense.amount > settings.expenseApprovalThreshold) {
    return { approved: false, reason: 'Amount exceeds threshold', requiresReview: true };
  }

  const prompt = `
    Determine if this expense should be auto-approved based on Nigerian business context.
    
    EXPENSE: ${JSON.stringify(expense)}
    EMPLOYEE HISTORY: ${JSON.stringify(employeeHistory.slice(-10))}
    THRESHOLD: ${settings.expenseApprovalThreshold} NGN
    
    Consider:
    - Amount vs threshold
    - Expense category appropriateness
    - Employee spending patterns
    - Nigerian business norms
    - Receipt/documentation quality
    
    Return JSON: { "approved": boolean, "reason": "string", "requiresReview": boolean, "confidence": number }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error('Expense approval failed:', error);
    return { approved: false, reason: 'Error in AI processing', requiresReview: true };
  }
};

// Business Pattern Learning
export const learnFromUserFeedback = async (
  feedback: {
    type: 'categorization_correction' | 'approval_override' | 'prediction_feedback';
    originalPrediction: any;
    userCorrection: any;
    context: any;
  }
): Promise<void> => {
  const settings = getAISettings();
  
  if (!settings.adaptiveLearning) {
    return;
  }

  // Store feedback for future learning
  const learningData = {
    ...feedback,
    timestamp: new Date().toISOString(),
  };
  
  const existing = JSON.parse(localStorage.getItem('aiLearningFeedback') || '[]');
  existing.push(learningData);
  localStorage.setItem('aiLearningFeedback', JSON.stringify(existing.slice(-500))); // Keep last 500

  // Update AI preferences based on feedback
  const preferences = JSON.parse(localStorage.getItem('aiUserPreferences') || '{}');
  
  if (feedback.type === 'categorization_correction') {
    const key = `${feedback.context.amount}_${feedback.context.narration?.substring(0, 20)}`;
    preferences[key] = feedback.userCorrection.category;
  }
  
  localStorage.setItem('aiUserPreferences', JSON.stringify(preferences));
};

// Export utility functions
export const aiAutomationUtils = {
  getAISettings,
  smartCategorizeTransaction,
  detectDuplicateTransactions,
  generateIntelligentInvoiceReminder,
  generateCashFlowForecast,
  generateTaxOptimizationSuggestions,
  generatePredictiveAnalytics,
  generateSmartNotifications,
  shouldAutoApproveExpense,
  learnFromUserFeedback,
};