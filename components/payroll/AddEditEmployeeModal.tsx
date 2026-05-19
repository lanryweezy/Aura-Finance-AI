
import React, { useState, useEffect } from 'react';
import type { Employee } from '../../types';

interface AddEditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employeeData: any) => void;
    employee: Employee | null;
}

export const AddEditEmployeeModal: React.FC<AddEditEmployeeModalProps> = ({ isOpen, onClose, onSave, employee }) => {
    const [formData, setFormData] = useState<Omit<Employee, 'id'>>({
        name: '',
        jobTitle: '',
        email: '',
        hireDate: '',
        grossSalary: 0,
        bankName: '',
        accountNumber: ''
    });

    useEffect(() => {
        if (employee) {
            setFormData({
                name: employee.name,
                jobTitle: employee.jobTitle,
                email: employee.email,
                hireDate: new Date(employee.hireDate).toISOString().split('T')[0],
                grossSalary: employee.grossSalary,
                bankName: employee.bankName,
                accountNumber: employee.accountNumber,
            });
        } else {
            setFormData({
                name: '',
                jobTitle: '',
                email: '',
                hireDate: new Date().toISOString().split('T')[0],
                grossSalary: 0,
                bankName: '',
                accountNumber: ''
            });
        }
    }, [employee, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const dataToSave = {
            ...formData,
            grossSalary: Number(formData.grossSalary),
            hireDate: new Date(formData.hireDate).toISOString()
        };
        if (employee) {
            onSave({ id: employee.id, ...dataToSave });
        } else {
            onSave(dataToSave);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="emp-modal-title"
        >
            <div className="bg-white dark:bg-dark-tertiary rounded-2xl p-8 w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-700" onClick={e => e.stopPropagation()}>
                <h3 id="emp-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-6">{employee ? 'Edit Employee' : 'Add New Employee'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <legend className="sr-only">Basic Information</legend>
                         <div className="flex flex-col gap-1">
                            <label htmlFor="emp-name" className="text-[10px] font-black text-gray-400 uppercase ml-1">Full Name</label>
                            <input id="emp-name" type="text" name="name" placeholder="Tunde Okechukwu" value={formData.name} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium" />
                         </div>
                         <div className="flex flex-col gap-1">
                            <label htmlFor="emp-job" className="text-[10px] font-black text-gray-400 uppercase ml-1">Job Title</label>
                            <input id="emp-job" type="text" name="jobTitle" placeholder="Software Engineer" value={formData.jobTitle} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium" />
                         </div>
                    </fieldset>

                    <div className="flex flex-col gap-1">
                        <label htmlFor="emp-email" className="text-[10px] font-black text-gray-400 uppercase ml-1">Email Address</label>
                        <input id="emp-email" type="email" name="email" placeholder="tunde@company.ng" value={formData.email} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium" />
                    </div>

                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <legend className="sr-only">Compensation Details</legend>
                        <div>
                             <label htmlFor="emp-hire-date" className="text-[10px] font-black text-gray-400 uppercase ml-1">Hire Date</label>
                             <input id="emp-hire-date" type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="emp-salary" className="text-[10px] font-black text-gray-400 uppercase ml-1">Gross Salary</label>
                            <input id="emp-salary" type="number" name="grossSalary" placeholder="e.g. 500000" value={formData.grossSalary || ''} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-mono font-bold" />
                        </div>
                    </fieldset>

                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <legend className="sr-only">Bank Account Details</legend>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="emp-bank" className="text-[10px] font-black text-gray-400 uppercase ml-1">Bank Name</label>
                            <input id="emp-bank" type="text" name="bankName" placeholder="Access Bank" value={formData.bankName} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-medium" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="emp-account" className="text-[10px] font-black text-gray-400 uppercase ml-1">Account Number</label>
                            <input id="emp-account" type="text" name="accountNumber" placeholder="0123456789" value={formData.accountNumber} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-dark-secondary border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-cyan transition-all font-mono font-bold" />
                        </div>
                    </fieldset>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-secondary transition-all font-bold">Cancel</button>
                        <button type="submit" className="px-8 py-2.5 rounded-xl bg-brand-cyan text-black font-bold hover:bg-brand-cyan/90 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20">Save Employee</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
