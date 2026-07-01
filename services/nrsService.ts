export interface NRSValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export interface NRSInvoiceData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  sellerName: string;
  sellerTIN: string;
  sellerCAC?: string;
  buyerName: string;
  buyerTIN?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    taxCategory: 'Standard' | 'ZeroRated' | 'Exempt';
    amount: number;
  }>;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
}

function validateTIN(tin: string): boolean {
  const clean = tin.replace(/[\s-]/g, '');
  return /^\d{8,14}$/.test(clean);
}

function validateCAC(cac: string): boolean {
  const clean = cac.replace(/[\s-]/g, '').toUpperCase();
  return /^(RC|RN|BN|IT)\d+$/i.test(clean);
}

export const nrsService = {
  validateInvoice: (data: NRSInvoiceData): NRSValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.invoiceNumber) errors.push('Invoice number is required');
    if (!data.issueDate) errors.push('Issue date is required');
    if (!data.dueDate) errors.push('Due date is required');
    if (!data.sellerName) errors.push('Seller name is required');
    if (!data.sellerTIN) errors.push('Seller TIN is required');
    else if (!validateTIN(data.sellerTIN)) errors.push('Seller TIN format is invalid (8-14 digits)');
    if (!data.buyerName) errors.push('Buyer name is required');
    if (data.buyerTIN && !validateTIN(data.buyerTIN)) warnings.push('Buyer TIN format may be invalid');
    if (data.sellerCAC && !validateCAC(data.sellerCAC)) warnings.push('Seller CAC number format may be invalid');

    if (data.lineItems.length === 0) errors.push('At least one line item is required');
    data.lineItems.forEach((item, i) => {
      if (!item.description) errors.push(`Line item ${i + 1}: description is required`);
      if (item.quantity <= 0) errors.push(`Line item ${i + 1}: quantity must be positive`);
      if (item.unitPrice < 0) errors.push(`Line item ${i + 1}: price cannot be negative`);
    });

    if (data.vatRate < 0 || data.vatRate > 100) errors.push('VAT rate must be between 0 and 100');
    if (data.vatRate !== 0 && data.vatRate !== 7.5) warnings.push('Standard Nigerian VAT rate is 7.5%');

    const expectedVat = Math.round(data.subtotal * data.vatRate) / 100;
    if (Math.abs(data.vatAmount - expectedVat) > 1) {
      warnings.push(`VAT amount (₦${data.vatAmount}) differs from expected (₦${expectedVat})`);
    }

    const expectedTotal = data.subtotal + data.vatAmount;
    if (Math.abs(data.totalAmount - expectedTotal) > 1) {
      errors.push(`Total (₦${data.totalAmount}) doesn't match subtotal + VAT (₦${expectedTotal})`);
    }

    if (data.currency !== 'NGN') warnings.push('Multi-currency invoices may have additional NRS requirements');

    const score = errors.length === 0 ? (warnings.length === 0 ? 100 : 80) : Math.max(0, 60 - errors.length * 10);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  },

  calculateStampDuty: (amount: number): number => {
    if (amount <= 1000) return 0;
    if (amount <= 5000) return 50;
    if (amount <= 10000) return 100;
    if (amount <= 20000) return 200;
    if (amount <= 50000) return 500;
    return Math.ceil(amount / 100000) * 500;
  },

  calculateWHT: (amount: number, rate: number = 5): number => {
    return Math.round(amount * rate / 100);
  },

  getComplianceScore: (hasTIN: boolean, hasCAC: boolean, hasStampDuty: boolean, nrsValid: boolean): number => {
    let score = 0;
    if (hasTIN) score += 30;
    if (hasCAC) score += 20;
    if (hasStampDuty) score += 20;
    if (nrsValid) score += 30;
    return score;
  },
};
