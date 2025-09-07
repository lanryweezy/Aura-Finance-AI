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

// Duplicate Detection (SECURE)
export const detectDuplicateTransactions = async (
  newTransaction: any,
  existingTransactions: CategorizedTransaction[]
): Promise<{ isDuplicate: boolean; matchedTransaction?: CategorizedTransaction; confidence: number }> => {
  const settings = getAISettings();
  
  if (!settings.smartDuplicateDetection) {
    return { isDuplicate: false, confidence: 0 };
  }

  try {
    const response = await callAIService('detect-duplicate', {
      new_transaction: newTransaction,
      existing_transactions: existingTransactions.slice(-50),
    });

    if (!response.success) {
      return { isDuplicate: false, confidence: 0 };
    }

    const result = response.result;
    const matchedTransaction = result.matchedTransactionId
      ? existingTransactions.find(t => t.id === result.matchedTransactionId)
      : undefined;

    return {
      isDuplicate: result.isDuplicate && result.confidence > 0.8, // Use confidence from backend
      matchedTransaction,
      confidence: result.confidence,
    };

  } catch (error) {
    console.error('Duplicate detection failed:', error);
    return { isDuplicate: false, confidence: 0 };
  }
};

// Smart Invoice Reminder System (SECURE)
export const generateIntelligentInvoiceReminder = async (
  invoice: Invoice,
  customerHistory: Invoice[] = []
): Promise<{ shouldSend: boolean; message: string; urgency: 'low' | 'medium' | 'high' }> => {
  const settings = getAISettings();
  
  if (!settings.autoInvoiceReminders) {
    return { shouldSend: false, message: '', urgency: 'low' };
  }

  try {
    const response = await callAIService('generate-invoice-reminder', {
      invoice,
      customer_history: customerHistory.slice(-5),
    });

    if (!response.success) {
      return { shouldSend: false, message: '', urgency: 'low' };
    }

    return response.result;

  } catch (error) {
    console.error('Invoice reminder generation failed:', error);
    return { shouldSend: false, message: '', urgency: 'low' };
  }
};

// Cash Flow Forecasting (SECURE)
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

  try {
    const response = await callAIService('generate-cashflow-forecast', {
      historical_transactions: transactions.slice(-100),
      pending_bills: bills.filter(b => b.status !== 'Paid'),
      pending_invoices: invoices.filter(i => i.status !== 'Paid'),
      settings: {
        forecast_period: settings.forecastPeriod,
      },
    });

    if (!response.success) {
      return { forecast: [], insights: [], risks: [] };
    }

    return response.result;

  } catch (error) {
    console.error('Cash flow forecasting failed:', error);
    return { forecast: [], insights: [], risks: [] };
  }
};

// Smart Tax Optimization (SECURE)
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

  try {
    const response = await callAIService('generate-tax-suggestions', {
      transactions,
      current_quarter: currentQuarter,
    });

    if (!response.success) {
      return { suggestions: [], complianceAlerts: [] };
    }

    return response.result;

  } catch (error) {
    console.error('Tax optimization failed:', error);
    return { suggestions: [], complianceAlerts: [] };
  }
};

// Predictive Business Analytics (SECURE)
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

  try {
    const response = await callAIService('generate-predictive-analytics', {
      transaction_data: transactions,
      analysis_timeframe: timeframe,
    });

    if (!response.success) {
      return { trends: [], opportunities: [], threats: [], recommendations: [] };
    }

    return response.result;

  } catch (error) {
    console.error('Predictive analytics failed:', error);
    return { trends: [], opportunities: [], threats: [], recommendations: [] };
  }
};

// Smart Notification System (SECURE)
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

  try {
    const response = await callAIService('generate-smart-notifications', {
      business_data: businessData,
      urgency_threshold: settings.urgencyThreshold,
    });

    if (!response.success) {
      return [];
    }

    // Filtering logic can now be assumed to be on the backend
    return response.result;

  } catch (error) {
    console.error('Smart notifications failed:', error);
    return [];
  }
};

// Automated Expense Approval (SECURE)
export const shouldAutoApproveExpense = async (
  expense: any,
  employeeHistory: any[] = []
): Promise<{ approved: boolean; reason: string; requiresReview: boolean }> => {
  const settings = getAISettings();
  
  if (!settings.autoExpenseApproval) {
    return { approved: false, reason: 'Auto-approval disabled', requiresReview: true };
  }

  if (expense.amount > settings.expenseApprovalThreshold) {
    return { approved: false, reason: 'Amount exceeds threshold', requiresReview: true };
  }

  try {
    const response = await callAIService('should-auto-approve-expense', {
      expense,
      employee_history: employeeHistory.slice(-10),
      threshold: settings.expenseApprovalThreshold,
    });

    if (!response.success) {
      return { approved: false, reason: 'Error in AI processing', requiresReview: true };
    }

    return response.result;

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