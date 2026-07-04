/**
 * Input Validation Service
 * Validates all user inputs across the app.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateInvoiceInput(data: {
  customer?: string;
  amount?: number;
  dueDate?: string;
}): ValidationResult {
  const errors: string[] = [];
  if (!data.customer || data.customer.trim().length === 0) errors.push('Customer name is required');
  if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
  if (data.amount && data.amount > 1000000000) errors.push('Amount seems too large');
  if (!data.dueDate) errors.push('Due date is required');
  return { valid: errors.length === 0, errors };
}

export function validateBillInput(data: {
  vendor?: string;
  amount?: number;
  dueDate?: string;
}): ValidationResult {
  const errors: string[] = [];
  if (!data.vendor || data.vendor.trim().length === 0) errors.push('Vendor name is required');
  if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
  if (!data.dueDate) errors.push('Due date is required');
  return { valid: errors.length === 0, errors };
}

export function validateEmployeeInput(data: {
  name?: string;
  email?: string;
  grossSalary?: number;
  bankName?: string;
  accountNumber?: string;
}): ValidationResult {
  const errors: string[] = [];
  if (!data.name || data.name.trim().length === 0) errors.push('Name is required');
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Valid email is required');
  if (!data.grossSalary || data.grossSalary <= 0) errors.push('Salary must be greater than 0');
  if (!data.bankName) errors.push('Bank name is required');
  if (!data.accountNumber || data.accountNumber.length < 10) errors.push('Account number must be at least 10 digits');
  return { valid: errors.length === 0, errors };
}

export function validateExpenseInput(data: {
  amount?: number;
  description?: string;
  category?: string;
}): ValidationResult {
  const errors: string[] = [];
  if (!data.amount || data.amount <= 0) errors.push('Amount must be greater than 0');
  if (!data.description || data.description.trim().length === 0) errors.push('Description is required');
  if (!data.category) errors.push('Category is required');
  return { valid: errors.length === 0, errors };
}

export function validateContactInput(data: {
  name?: string;
  email?: string;
  type?: string;
}): ValidationResult {
  const errors: string[] = [];
  if (!data.name || data.name.trim().length === 0) errors.push('Name is required');
  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.push('Valid email is required');
  if (!data.type) errors.push('Contact type is required');
  return { valid: errors.length === 0, errors };
}

export function validateInventoryInput(data: {
  name?: string;
  sku?: string;
  costPrice?: number;
  salePrice?: number;
}): ValidationResult {
  const errors: string[] = [];
  if (!data.name || data.name.trim().length === 0) errors.push('Name is required');
  if (!data.sku || data.sku.trim().length === 0) errors.push('SKU is required');
  if (!data.costPrice || data.costPrice <= 0) errors.push('Cost price must be greater than 0');
  if (!data.salePrice || data.salePrice <= 0) errors.push('Sale price must be greater than 0');
  if (data.salePrice && data.costPrice && data.salePrice < data.costPrice) errors.push('Sale price should be higher than cost price');
  return { valid: errors.length === 0, errors };
}

export function validateJournalEntry(data: {
  narration?: string;
  lines?: any[];
}): ValidationResult {
  const errors: string[] = [];
  if (!data.narration || data.narration.trim().length === 0) errors.push('Narration is required');
  if (!data.lines || data.lines.length < 2) errors.push('At least 2 lines required (debit + credit)');
  const debits = data.lines?.filter((l: any) => l.type === 'debit').reduce((s: number, l: any) => s + l.amount, 0) || 0;
  const credits = data.lines?.filter((l: any) => l.type === 'credit').reduce((s: number, l: any) => s + l.amount, 0) || 0;
  if (Math.abs(debits - credits) > 0.01) errors.push('Debits and credits must be equal');
  return { valid: errors.length === 0, errors };
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 1000); // Max 1000 chars
}

export function validateAmount(amount: any): boolean {
  const num = Number(amount);
  return !isNaN(num) && isFinite(num) && num >= 0 && num <= 1000000000;
}
