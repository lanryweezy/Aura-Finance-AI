import { monitoringService } from './monitoringService';

import type { Employee } from '../types';
import { authService } from './authService';

const getStorageKey = () => `aura_${authService.getTenantId()}_employees`;

const initialEmployees: Employee[] = [
  {
    id: 'emp_1',
    name: 'Ada Okoro',
    grossSalary: 350000,
    jobTitle: 'Lead Developer',
    hireDate: '2022-05-15T00:00:00Z',
    email: 'ada.okoro@example.com',
    bankName: 'GTBank',
    accountNumber: '0123456789'
  },
  {
    id: 'emp_2',
    name: 'Bolu Adebayo',
    grossSalary: 450000,
    jobTitle: 'Product Manager',
    hireDate: '2021-11-20T00:00:00Z',
    email: 'bolu.adebayo@example.com',
    bankName: 'Kuda Bank',
    accountNumber: '0987654321'
  },
  {
    id: 'emp_3',
    name: 'Chidi Eze',
    grossSalary: 150000,
    jobTitle: 'Junior Designer',
    hireDate: '2023-08-01T00:00:00Z',
    email: 'chidi.eze@example.com',
    bankName: 'Access Bank',
    accountNumber: '1122334455'
  },
  {
    id: 'emp_4',
    name: 'Funke Williams',
    grossSalary: 800000,
    jobTitle: 'Chief Operating Officer',
    hireDate: '2020-02-10T00:00:00Z',
    email: 'funke.williams@example.com',
    bankName: 'Zenith Bank',
    accountNumber: '5566778899'
  }
];

const loadEmployees = (): Employee[] => {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            monitoringService.trackError('SERVICE', e, { message: 'Failed to parse employees' });
            return initialEmployees;
        }
    }
    return initialEmployees;
};

export const fetchEmployees = (): Promise<Employee[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const employees = loadEmployees();
      resolve([...employees].sort((a, b) => a.name.localeCompare(b.name)));
    }, 400);
  });
};

export const addEmployee = (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const current = loadEmployees();
            const newEmployee: Employee = {
                id: `emp_${Date.now()}`,
                ...employeeData
            };
            const updated = [...current, newEmployee];
            localStorage.setItem(getStorageKey(), JSON.stringify(updated));
            resolve(newEmployee);
        }, 300);
    });
};

export const updateEmployee = (employeeData: Employee): Promise<Employee> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const current = loadEmployees();
            const index = current.findIndex(e => e.id === employeeData.id);
            if(index !== -1){
                current[index] = employeeData;
                localStorage.setItem(getStorageKey(), JSON.stringify(current));
                resolve(employeeData);
            } else {
                reject(new Error("Employee not found"));
            }
        }, 300);
    });
};

export const removeEmployee = (employeeId: string): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const current = loadEmployees();
            const updated = current.filter(emp => emp.id !== employeeId);
            localStorage.setItem(getStorageKey(), JSON.stringify(updated));
            resolve();
        }, 300);
    });
};
