import { useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { auditLogService } from '../auditLogService';
import { calculateDeductions } from '../taxCalculatorService';
import { addEmployee, updateEmployee, removeEmployee } from '../employeeService';
import type { Employee, PayrollSummary, PayrollPayslip, PayrollAdjustment, PayrollRun } from '../../types';

export function usePayroll() {
  const { employees, setEmployees, payrollHistory, setPayrollHistory } = useAppStore();

  const payrollSummary: PayrollSummary = employees.reduce(
    (acc, emp) => {
      const d = calculateDeductions(emp.grossSalary);
      acc.totalGross += d.grossSalary;
      acc.totalPAYE += d.paye;
      acc.totalPension += d.pension;
      acc.totalNHF += d.nhf;
      acc.totalNet += d.netSalary;
      return acc;
    },
    { totalGross: 0, totalPAYE: 0, totalPension: 0, totalNHF: 0, totalNet: 0, employeeCount: employees.length }
  );

  const log = useCallback(async (action: string) => {
    await auditLogService.add(action, 'User', 'Payroll');
    const logs = await auditLogService.getLogs();
    useAppStore.getState().setAuditLog(logs);
  }, []);

  const handleAddEmployee = useCallback(async (data: Omit<Employee, 'id'>) => {
    const newEmp = await addEmployee(data);
    setEmployees(prev => [...prev, newEmp]);
    await log(`Added new employee: ${newEmp.name}`);
    return newEmp;
  }, [setEmployees, log]);

  const handleUpdateEmployee = useCallback(async (data: Employee) => {
    const updated = await updateEmployee(data);
    setEmployees(prev => prev.map(e => (e.id === updated.id ? updated : e)));
    await log(`Updated employee: ${updated.name}`);
    return updated;
  }, [setEmployees, log]);

  const handleRemoveEmployee = useCallback(async (id: string) => {
    if (!window.confirm('Remove this employee?')) return;
    const emp = employees.find(e => e.id === id);
    await removeEmployee(id);
    setEmployees(prev => prev.filter(e => e.id !== id));
    if (emp) await log(`Removed employee: ${emp.name}`);
  }, [employees, setEmployees, log]);

  const handleRunPayroll = useCallback((period: string, adjustments: Record<string, PayrollAdjustment>) => {
    const payslips: PayrollPayslip[] = employees.map(emp => {
      const adj = adjustments[emp.id] || { bonus: 0, deduction: 0 };
      const d = calculateDeductions(emp.grossSalary, adj.bonus, adj.deduction);
      return {
        employeeId: emp.id, employeeName: emp.name, grossSalary: emp.grossSalary,
        bonus: adj.bonus, deduction: adj.deduction, totalIncome: d.totalIncome,
        paye: d.paye, pension: d.pension, nhf: d.nhf,
        totalDeductions: d.totalStatutoryDeductions + adj.deduction, netSalary: d.netSalary,
      };
    });
    const summary = payslips.reduce(
      (acc, p) => {
        acc.totalGross += p.grossSalary; acc.totalBonuses += p.bonus;
        acc.totalDeductions += p.totalDeductions; acc.totalNet += p.netSalary;
        acc.totalPAYE += p.paye; acc.totalPension += p.pension;
        return acc;
      },
      { totalGross: 0, totalBonuses: 0, totalDeductions: 0, totalNet: 0, totalPAYE: 0, totalPension: 0 }
    );
    const run: PayrollRun = {
      id: `pr_${Date.now()}`, runDate: new Date().toISOString(), period,
      summary: { ...summary, employeeCount: employees.length }, payslips,
    };
    setPayrollHistory(prev => [run, ...prev]);
    log(`Ran payroll for ${period}`);
  }, [employees, setPayrollHistory, log]);

  return { employees, payrollSummary, payrollHistory, handleAddEmployee, handleUpdateEmployee, handleRemoveEmployee, handleRunPayroll };
}
