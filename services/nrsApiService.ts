const NRS_API_URL = import.meta.env.VITE_NRS_API_URL || 'https://api.doftwerks.com';
const NRS_API_KEY = import.meta.env.VITE_NRS_API_KEY || '';
const NRS_SERVICE_ID = import.meta.env.VITE_NRS_SERVICE_ID || '';

export interface NRSInvoiceData {
  business_id: string;
  irn: string;
  issue_date: string;
  issue_time: string;
  invoice_type_code: string;
  document_currency_code: string;
  tax_currency_code: string;
  accounting_supplier_party: {
    party_name: string;
    tin: string;
    email: string;
    telephone: string;
    business_description: string;
    postal_address: {
      street_name: string;
      city_name: string;
      lga: string;
      state: string;
      postal_zone: string;
      country: string;
    };
  };
  accounting_customer_party: {
    party_name: string;
    tin: string;
    email: string;
    telephone: string;
    business_description: string;
    postal_address: {
      street_name: string;
      city_name: string;
      lga: string;
      state: string;
      postal_zone: string;
      country: string;
    };
  };
  tax_total: Array<{
    tax_amount: number;
    tax_subtotal: Array<{
      taxable_amount: number;
      tax_amount: number;
      tax_category: { id: string; percent: number };
    }>;
  }>;
  legal_monetary_total: {
    line_extension_amount: number;
    tax_exclusive_amount: number;
    tax_inclusive_amount: number;
    payable_amount: number;
  };
  invoice_line: Array<{
    hsn_code: string;
    product_category: string;
    invoiced_quantity: number;
    line_extension_amount: number;
    item: { name: string; description: string; sellers_item_identification: string };
    price: { price_amount: number; base_quantity: number; price_unit: string };
    discount_amount: number;
    discount_rate: number;
    fee_rate: number;
    fee_amount: number;
    tax_code: string;
    tax_rate: number;
  }>;
  sale_type: number;
}

export interface NRSResponse {
  ok: boolean;
  irn?: string;
  csid?: string;
  qr_code_png?: string;
  error?: string;
}

async function nrsRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<any> {
  if (!NRS_API_KEY) {
    return { ok: false, error: 'NRS API key not configured. Set VITE_NRS_API_KEY in .env.local' };
  }

  try {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${NRS_API_KEY}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${NRS_API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { ok: false, error: errorData.message || `HTTP ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'NRS API request failed' };
  }
}

export const nrsApiService = {
  generateIRN: async (invoiceNumber: string): Promise<NRSResponse> => {
    if (!NRS_SERVICE_ID) {
      return { ok: false, error: 'NRS Service ID not configured. Set VITE_NRS_SERVICE_ID in .env.local' };
    }
    return nrsRequest(`/api/generate-irn?irn=${encodeURIComponent(invoiceNumber)}&service_id=${NRS_SERVICE_ID}`);
  },

  getQRCode: async (irn: string, size: number = 300): Promise<NRSResponse> => {
    return nrsRequest(`/api/get-qr-code?irn=${encodeURIComponent(irn)}&size=${size}`);
  },

  validateIRN: async (irn: string): Promise<NRSResponse> => {
    return nrsRequest(`/api/validate-irn`, 'POST', { irn });
  },

  validateInvoice: async (invoiceData: NRSInvoiceData): Promise<NRSResponse> => {
    return nrsRequest(`/api/validate-invoice`, 'POST', { invoice_data: invoiceData });
  },

  signInvoice: async (invoiceData: NRSInvoiceData): Promise<NRSResponse> => {
    return nrsRequest(`/api/sign-invoice`, 'POST', { invoice_data: invoiceData });
  },

  transmitInvoice: async (invoiceData: NRSInvoiceData): Promise<NRSResponse> => {
    return nrsRequest(`/api/transmit-invoice`, 'POST', { invoice_data: invoiceData });
  },

  confirmInvoice: async (irn: string): Promise<NRSResponse> => {
    return nrsRequest(`/api/confirm-invoice?irn=${encodeURIComponent(irn)}`);
  },

  downloadInvoice: async (irn: string): Promise<NRSResponse> => {
    return nrsRequest(`/api/download-invoice?irn=${encodeURIComponent(irn)}`);
  },

  getProductCodes: async (): Promise<any[]> => {
    const result = await nrsRequest('/api/product-codes');
    return result.ok !== false ? result : [];
  },

  getServiceCodes: async (): Promise<any[]> => {
    const result = await nrsRequest('/api/service-codes');
    return result.ok !== false ? result : [];
  },

  getStateCodes: async (): Promise<any[]> => {
    const result = await nrsRequest('/api/state-codes');
    return result.ok !== false ? result : [];
  },

  getLGACodes: async (stateCode?: string): Promise<any[]> => {
    const query = stateCode ? `?state_code=${stateCode}` : '';
    const result = await nrsRequest(`/api/lga-codes${query}`);
    return result.ok !== false ? result : [];
  },

  isConfigured: (): boolean => !!(NRS_API_KEY && NRS_SERVICE_ID),
};
