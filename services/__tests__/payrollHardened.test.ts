import { describe, it, expect } from 'vitest';
import { calculateDeductions } from '../taxCalculatorService';

describe('Nigerian Payroll — Hardened Edge Cases', () => {
  it('should handle zero salary', () => {
    const result = calculateDeductions(0);
    expect(result.grossSalary).toBe(0);
    expect(result.paye).toBe(0);
    expect(result.pension).toBe(0);
    expect(result.nhf).toBe(0);
    expect(result.netSalary).toBe(0);
  });

  it('should handle very small salary (₦10,000)', () => {
    const result = calculateDeductions(10000);
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.paye).toBe(0); // Below tax threshold
  });

  it('should handle very large salary (₦10,000,000)', () => {
    const result = calculateDeductions(10000000);
    expect(result.netSalary).toBeGreaterThan(0);
    expect(result.paye).toBeGreaterThan(0);
  });

  it('should handle salary with bonus', () => {
    const result = calculateDeductions(500000, 100000, 0);
    expect(result.totalIncome).toBe(600000);
    expect(result.paye).toBeGreaterThan(0);
  });

  it('should handle salary with deduction', () => {
    const result = calculateDeductions(500000, 0, 50000);
    expect(result.totalIncome).toBe(500000);
    expect(result.netSalary).toBeLessThan(500000);
  });

  it('should never produce negative net salary', () => {
    const salaries = [10000, 50000, 100000, 300000, 500000, 1000000, 5000000, 10000000];
    for (const salary of salaries) {
      const result = calculateDeductions(salary);
      expect(result.netSalary).toBeGreaterThanOrEqual(0);
    }
  });

  it('should apply correct pension rate (8%)', () => {
    const result = calculateDeductions(500000);
    expect(result.pension).toBe(40000);
  });

  it('should apply correct NHF rate (2.5%)', () => {
    const result = calculateDeductions(500000);
    expect(result.nhf).toBe(12500);
  });

  it('should have total deductions less than gross', () => {
    const result = calculateDeductions(500000);
    expect(result.totalStatutoryDeductions).toBeLessThan(result.grossSalary);
  });

  it('should handle negative bonus gracefully', () => {
    const result = calculateDeductions(500000, -10000, 0);
    // Negative bonus reduces total income
    expect(result.totalIncome).toBeLessThanOrEqual(500000);
    expect(result.netSalary).toBeGreaterThan(0);
  });
});
