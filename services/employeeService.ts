
import type { Employee } from '../types';
import { apiClient } from './apiClient';
import { localDb } from './localDb';

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

// Seed the local database if empty
const seedEmployees = () => {
    const employees = localDb.load('employees', []);
    if (employees.length === 0) {
        localDb.save('employees', initialEmployees);
    }
};

export const fetchEmployees = async (): Promise<Employee[]> => {
    seedEmployees();
    const employees = await apiClient.get('/employees');
    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
};

export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    return await apiClient.post('/employees', employeeData);
};

export const updateEmployee = async (employeeData: Employee): Promise<Employee> => {
    return await apiClient.put(`/employees/${employeeData.id}`, employeeData);
};

export const removeEmployee = async (employeeId: string): Promise<void> => {
    return await apiClient.delete(`/employees/${employeeId}`);
};
