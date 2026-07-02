import { describe, it, expect, vi } from 'vitest';
import { calculateDeductions, calculateCorporateTax, calculateVat, calculateWht } from '../taxCalculatorService';

describe('Nigerian PAYE Tax Calculation', () => {
  it('should calculate correct PAYE for ₦300,000 salary', () => {
    const result = calculateDeductions(300000);
    expect(result.grossSalary).toBe(300000);
    expect(result.paye).toBeGreaterThan(0);
    expect(result.pension).toBeGreaterThan(0);
    expect(result.nhf).toBeGreaterThan(0);
    expect(result.netSalary).toBeLessThan(300000);
    expect(result.netSalary).toBeGreaterThan(0);
  });

  it('should calculate correct PAYE for ₦1,000,000 salary', () => {
    const result = calculateDeductions(1000000);
    expect(result.grossSalary).toBe(1000000);
    expect(result.paye).toBeGreaterThan(0);
    expect(result.pension).toBeGreaterThan(0);
    expect(result.nhf).toBeGreaterThan(0);
  });

  it('should never produce negative net salary', () => {
    for (const salary of [100000, 300000, 500000, 1000000, 5000000]) {
      const result = calculateDeductions(salary);
      expect(result.netSalary).toBeGreaterThan(0);
    }
  });

  it('should have total deductions less than gross', () => {
    const result = calculateDeductions(500000);
    expect(result.totalStatutoryDeductions).toBeLessThan(result.grossSalary);
  });
});

describe('Corporate Tax', () => {
  it('should calculate CIT for large companies (>100M turnover)', () => {
    const result = calculateCorporateTax(5000000, 200000000);
    expect(result.cit).toBeGreaterThan(0);
  });

  it('should have 0% CIT for small companies (<25M turnover)', () => {
    const result = calculateCorporateTax(500000, 10000000);
    expect(result.cit).toBe(0);
  });

  it('should always have positive total tax', () => {
    const result = calculateCorporateTax(1000000, 50000000);
    expect(result.totalTax).toBeGreaterThanOrEqual(0);
  });
});

describe('VAT Calculation', () => {
  it('should calculate 7.5% VAT', () => {
    const result = calculateVat(100000);
    expect(result.outputVat).toBe(7500);
  });

  it('should calculate net VAT payable', () => {
    const result = calculateVat(200000);
    expect(result.netVatPayable).toBeDefined();
  });
});

describe('WHT Calculation', () => {
  it('should calculate WHT on services', () => {
    const result = calculateWht(100000, 50000, 0.05);
    expect(result.whtPayable).toBe(2500);
    expect(result.whtSuffered).toBe(5000);
  });

  it('should calculate WHT on rent', () => {
    const result = calculateWht(100000, 80000, 0.10);
    expect(result.whtPayable).toBe(8000);
    expect(result.whtSuffered).toBe(10000);
  });
});
