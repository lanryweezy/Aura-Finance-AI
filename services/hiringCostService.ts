import type { Employee } from '../types';

export interface HiringCostEstimate {
  monthlyCost: number;
  annualCost: number;
  breakdown: { item: string; amount: number }[];
  recommendation: string;
}

export function calculateHiringCost(employees: Employee[], newHires: number, avgSalary: number = 300000): HiringCostEstimate {
  const breakdown = [
    { item: 'Base Salary (Monthly)', amount: avgSalary * newHires },
    { item: 'Pension (10%)', amount: Math.round(avgSalary * 0.10 * newHires) },
    { item: 'NHF (2.5%)', amount: Math.round(avgSalary * 0.025 * newHires) },
    { item: 'NSITF (1%)', amount: Math.round(avgSalary * 0.01 * newHires) },
    { item: 'Training & Onboarding', amount: Math.round(avgSalary * 0.2 * newHires) },
    { item: 'Equipment & Setup', amount: Math.round(150000 * newHires) },
  ];

  const monthlyCost = breakdown.slice(0, 3).reduce((s, b) => s + b.amount, 0);
  const annualCost = breakdown.reduce((s, b) => s + b.amount, 0);

  const currentPayroll = employees.reduce((s, e) => s + e.grossSalary, 0);
  const totalAfterHire = currentPayroll + monthlyCost;

  let recommendation = '';
  if (totalAfterHire > currentPayroll * 1.3) {
    recommendation = `Warning: Adding ${newHires} hires increases payroll by ${Math.round((monthlyCost / currentPayroll) * 100)}%. Consider hiring gradually.`;
  } else if (totalAfterHire < currentPayroll * 1.2) {
    recommendation = `You can afford ${newHires} hires. Total payroll will be within 20% of current.`;
  } else {
    recommendation = `Adding ${newHires} hires is feasible but will increase payroll by ${Math.round((monthlyCost / currentPayroll) * 100)}%. Review cash flow first.`;
  }

  return { monthlyCost, annualCost, breakdown, recommendation };
}
