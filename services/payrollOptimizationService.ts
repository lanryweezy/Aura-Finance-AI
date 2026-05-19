
import { Employee, PayrollDeductions } from '../types';
import { calculateDeductions } from './taxCalculatorService';

export interface PayrollOptimization {
    employeeId: string;
    employeeName: string;
    currentTax: number;
    optimizedTax: number;
    potentialSaving: number;
    recommendation: string;
}

class PayrollOptimizationService {
    analyze(employees: Employee[]): PayrollOptimization[] {
        return employees.map(emp => {
            const current = calculateDeductions(emp.grossSalary);

            // Simulation: Propose restructuring non-taxable allowances
            // (In a real scenario, this would involve shifting components to CRA-eligible items or other tax-exempt benefits)
            const simulatedSaving = current.paye * 0.15; // Propose 15% reduction in PAYE through restructure

            return {
                employeeId: emp.id,
                employeeName: emp.name,
                currentTax: current.paye,
                optimizedTax: current.paye - simulatedSaving,
                potentialSaving: simulatedSaving,
                recommendation: `Restructure allowance for ${emp.name}. Shifting 10% of gross to non-taxable transport/housing allowances could save ${Math.round(simulatedSaving)} in monthly PAYE.`
            };
        }).filter(opt => opt.potentialSaving > 1000); // Only significant savings
    }
}

export const payrollOptimizationService = new PayrollOptimizationService();
