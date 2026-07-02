const ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';

async function mlRequest(endpoint: string, body: any): Promise<any> {
  try {
    const response = await fetch(`${ML_API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.detail || `ML API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.warn(`ML API call failed: ${endpoint}`, error);
    return null;
  }
}

// ============== TabFM: Transaction Categorization ==============
export async function categorizeWithTabFM(
  transactions: Array<{ id: string; amount: number; narration: string; type: string }>,
  historical?: { transactions: any[]; categories: string[] }
): Promise<Array<{ id: string; category: string; confidence: number }>> {
  const result = await mlRequest('/categorize', {
    transactions: transactions.map(t => ({
      id: t.id,
      amount: t.amount,
      narration: t.narration,
      type: t.type,
    })),
    historical_transactions: historical?.transactions,
    historical_categories: historical?.categories,
  });

  if (!result) return [];
  return result.results.map((r: any) => ({
    id: r.id,
    category: r.category,
    confidence: r.confidence,
  }));
}

// ============== TimesFM: Cash Flow Forecasting ==============
export async function forecastCashFlow(
  dailyBalances: number[],
  horizon: number = 90
): Promise<{ forecast: number[]; lowerBound: number[]; upperBound: number[] } | null> {
  const result = await mlRequest('/forecast', {
    historical_values: dailyBalances,
    horizon,
  });

  if (!result) return null;
  return {
    forecast: result.forecast,
    lowerBound: result.lower_bound,
    upperBound: result.upper_bound,
  };
}

// ============== TabFM: Fraud Detection ==============
export async function detectFraud(
  transactions: Array<{ id: string; amount: number; narration: string; type: string }>,
  historical?: { transactions: any[]; labels: number[] }
): Promise<Array<{ id: string; isFraud: boolean; riskScore: number }>> {
  const result = await mlRequest('/detect-fraud', {
    transactions: transactions.map(t => ({
      id: t.id,
      amount: t.amount,
      narration: t.narration,
      type: t.type,
    })),
    historical_transactions: historical?.transactions,
    historical_labels: historical?.labels,
  });

  if (!result) return [];
  return result.results.map((r: any) => ({
    id: r.id,
    isFraud: r.is_fraud,
    riskScore: r.risk_score,
  }));
}

// ============== TabFM: Risk Scoring ==============
export async function scoreRisk(
  features: Array<{ id: string; [key: string]: any }>,
  historical?: { features: any[]; labels: string[] }
): Promise<Array<{ id: string; riskLevel: string; riskScore: number }>> {
  const result = await mlRequest('/risk-score', {
    features,
    historical_features: historical?.features,
    historical_labels: historical?.labels,
  });

  if (!result) return [];
  return result.results.map((r: any) => ({
    id: r.id,
    riskLevel: r.risk_level,
    riskScore: r.risk_score,
  }));
}

// ============== Health Check ==============
export async function checkMLHealth(): Promise<{ tabfm: boolean; timesfm: boolean }> {
  try {
    const response = await fetch(`${ML_API_URL}/health`, { signal: AbortSignal.timeout(5000) });
    return await response.json();
  } catch {
    return { tabfm: false, timesfm: false };
  }
}
