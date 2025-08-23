
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-dark-tertiary rounded-2xl p-8 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-6">{employee ? 'Edit Employee' : 'Add New Employee'}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                         <input type="text" name="jobTitle" placeholder="Job Title" value={formData.jobTitle} onChange={handleChange} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    </div>
                    <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="text-sm text-gray-400 mb-1 block">Hire Date</label>
                             <input type="date" name="hireDate" value={formData.hireDate} onChange={handleChange} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                        </div>
                        <input type="number" name="grossSalary" placeholder="Gross Monthly Salary" value={formData.grossSalary || ''} onChange={handleChange} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan self-end" />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="bankName" placeholder="Bank Name" value={formData.bankName} onChange={handleChange} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                        <input type="text" name="accountNumber" placeholder="Account Number" value={formData.accountNumber} onChange={handleChange} required className="w-full bg-dark-secondary border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand-cyan" />
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-dark-secondary">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-lg bg-brand-cyan text-black font-bold hover:bg-brand-cyan/80">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
