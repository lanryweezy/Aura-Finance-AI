
import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { getPayrollInsights } from '../services/geminiService';
import { EmployeeRoster } from './payroll/EmployeeRoster';
import { PayrollHistory } from './payroll/PayrollHistory';
import { RunPayrollWizard } from './payroll/RunPayrollWizard';
import { AddEditEmployeeModal } from './payroll/AddEditEmployeeModal';
import { PayrollRunDetailModal } from './payroll/PayrollRunDetailModal';
import { useCurrency } from './ui/CurrencyProvider';
import type { Employee, PayrollSummary, PayrollRun, PayrollAdjustment } from '../types';

interface PayrollViewProps {
    employees: Employee[];
    payrollSummary: PayrollSummary;
    payrollHistory: PayrollRun[];
    onAddEmployee: (employeeData: Omit<Employee, 'id'>) => void;
    onUpdateEmployee: (employeeData: Employee) => Promise<Employee>;
    onRemoveEmployee: (id: string) => void;
    onRunPayroll: (period: string, adjustments: Record<string, PayrollAdjustment>) => void;
}

export const PayrollView: React.FC<PayrollViewProps> = (props) => {
    const { formatAmount } = useCurrency();
    const { employees, payrollSummary, payrollHistory, onAddEmployee, onUpdateEmployee, onRemoveEmployee, onRunPayroll } = props;
    
    const [activeTab, setActiveTab] = useState<'dashboard' | 'employees' | 'history'>('dashboard');
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
    const [insight, setInsight] = useState('');
    const [isLoadingInsight, setIsLoadingInsight] = useState(false);

    useEffect(() => {
        setIsLoadingInsight(true);
        getPayrollInsights(payrollHistory)
            .then(setInsight)
            .finally(() => setIsLoadingInsight(false));
    }, [payrollHistory]);

    const handleAddEmployeeClick = () => {
        setSelectedEmployee(null);
        setIsEmployeeModalOpen(true);
    };
    
    const handleEditEmployeeClick = (employee: Employee) => {
        setSelectedEmployee(employee);
        setIsEmployeeModalOpen(true);
    };
    
    const handleViewRunDetails = (run: PayrollRun) => {
        setSelectedRun(run);
        setIsDetailModalOpen(true);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'employees':
                return <EmployeeRoster 
                            employees={employees} 
                            onEdit={handleEditEmployeeClick}
                            onRemove={onRemoveEmployee} 
                        />;
            case 'history':
                return <PayrollHistory 
                            runs={payrollHistory} 
                            onViewDetails={handleViewRunDetails}
                        />;
            case 'dashboard':
            default:
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                             <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                <Card><h3 className="text-gray-400 text-sm">Total Gross Payroll</h3><p className="text-xl lg:text-2xl font-bold text-white mt-1">{formatAmount(payrollSummary.totalGross)}</p></Card>
                                <Card><h3 className="text-gray-400 text-sm">Total Net Payout</h3><p className="text-xl lg:text-2xl font-bold text-brand-cyan mt-1">{formatAmount(payrollSummary.totalNet)}</p></Card>
                                <Card><h3 className="text-gray-400 text-sm">Active Employees</h3><p className="text-xl lg:text-2xl font-bold text-white mt-1">{payrollSummary.employeeCount}</p></Card>
                                <Card><h3 className="text-gray-400 text-sm">Total PAYE to Remit</h3><p className="text-xl lg:text-2xl font-bold text-orange-400 mt-1">{formatAmount(payrollSummary.totalPAYE)}</p></Card>
                                <Card><h3 className="text-gray-400 text-sm">Total Pension to Remit</h3><p className="text-xl lg:text-2xl font-bold text-cyan-400 mt-1">{formatAmount(payrollSummary.totalPension)}</p></Card>
                                <Card><h3 className="text-gray-400 text-sm">Total NHF to Remit</h3><p className="text-xl lg:text-2xl font-bold text-blue-400 mt-1">{formatAmount(payrollSummary.totalNHF)}</p></Card>
                            </div>
                        </div>
                        <Card>
                            <h3 className="text-xl font-bold text-white mb-4">AI Payroll Advisor</h3>
                            <div className="bg-dark-secondary p-4 rounded-lg h-full flex items-center justify-center min-h-[150px]">
                                {isLoadingInsight ? <Spinner /> : <p className="text-center text-gray-300 italic">{insight}</p>}
                            </div>
                        </Card>
                    </div>
                );
        }
    };
    
    return (
        <>
            <AddEditEmployeeModal 
                isOpen={isEmployeeModalOpen} 
                onClose={() => setIsEmployeeModalOpen(false)} 
                onSave={selectedEmployee ? onUpdateEmployee : onAddEmployee}
                employee={selectedEmployee}
            />
            <RunPayrollWizard 
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                employees={employees}
                onRunPayroll={onRunPayroll}
            />
            <PayrollRunDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                run={selectedRun}
            />
            <div className="space-y-6">
                 <div className="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                    <div>
                         <h2 className="text-3xl font-bold text-white">Payroll Command Center</h2>
                         <p className="text-gray-400 mt-1">Manage employees and automate payroll compliance.</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                        <button onClick={handleAddEmployeeClick} className="bg-dark-tertiary hover:bg-dark-primary border border-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                            Add Employee
                        </button>
                         <button onClick={() => setIsWizardOpen(true)} disabled={employees.length === 0} className="bg-brand-cyan hover:bg-brand-cyan/80 text-black font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l.79-.79"/></svg>
                            Run Payroll
                        </button>
                    </div>
                </div>

                <div className="bg-dark-tertiary p-1.5 rounded-lg flex gap-2 max-w-md">
                    <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${activeTab === 'dashboard' ? 'bg-brand-cyan text-black' : 'text-gray-300 hover:bg-dark-primary'}`}>Dashboard</button>
                    <button onClick={() => setActiveTab('employees')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${activeTab === 'employees' ? 'bg-brand-cyan text-black' : 'text-gray-300 hover:bg-dark-primary'}`}>Employees</button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-colors ${activeTab === 'history' ? 'bg-brand-cyan text-black' : 'text-gray-300 hover:bg-dark-primary'}`}>History</button>
                </div>
                
                <div className="mt-6">
                   {renderContent()}
                </div>

            </div>
        </>
    );
};
