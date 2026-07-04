import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateDeductions, calculateCorporateTax, calculateVat, calculateWht } from '../taxCalculatorService';

describe('Tax Calculator Integration', () => {
  describe('Full Payroll Calculation', () => {
    it('should calculate complete payroll for a team of 5 employees', () => {
      const employees = [
        { salary: 450000, name: 'Ada' },
        { salary: 380000, name: 'Bolu' },
        { salary: 220000, name: 'Chidi' },
        { salary: 800000, name: 'Funke' },
        { salary: 350000, name: 'Tunde' },
      ];

      let totalGross = 0;
      let totalPAYE = 0;
      let totalPension = 0;
      let totalNHF = 0;

      for (const emp of employees) {
        const d = calculateDeductions(emp.salary);
        totalGross += d.grossSalary;
        totalPAYE += d.paye;
        totalPension += d.pension;
        totalNHF += d.nhf;
        expect(d.netSalary).toBeGreaterThan(0);
        expect(d.netSalary).toBeLessThan(emp.salary);
      }

      expect(totalGross).toBe(2200000);
      expect(totalPAYE).toBeGreaterThan(0);
      expect(totalPension).toBeGreaterThan(0);
      expect(totalNHF).toBeGreaterThan(0);
    });
  });

  describe('Corporate Tax Scenarios', () => {
    it('should handle small company (0% CIT)', () => {
      const result = calculateCorporateTax(500000, 10000000);
      expect(result.cit).toBe(0);
    });

    it('should handle medium company (20% CIT)', () => {
      const result = calculateCorporateTax(5000000, 50000000);
      expect(result.cit).toBeGreaterThan(0);
    });

    it('should handle large company (30% CIT)', () => {
      const result = calculateCorporateTax(10000000, 200000000);
      expect(result.cit).toBeGreaterThan(0);
    });
  });

  describe('VAT Scenarios', () => {
    it('should calculate output VAT', () => {
      const result = calculateVat(1000000, 0);
      expect(result.outputVat).toBe(75000);
    });

    it('should calculate input VAT', () => {
      const result = calculateVat(0, 500000);
      expect(result.inputVat).toBe(37500);
    });

    it('should calculate net VAT', () => {
      const result = calculateVat(1000000, 500000);
      expect(result.netVatPayable).toBe(37500);
    });
  });

  describe('WHT Scenarios', () => {
    it('should calculate 5% WHT on services', () => {
      const result = calculateWht(1000000, 500000, 0.05);
      expect(result.whtSuffered).toBe(50000);
      expect(result.whtPayable).toBe(25000);
    });
  });
});
