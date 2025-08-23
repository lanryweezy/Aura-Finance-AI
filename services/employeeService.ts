
import type { Employee } from '../types';
import { api } from './api';

let mockEmployees: Employee[] = [
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

export const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const employees = await api.get<Employee[]>('/employees/');
    return employees.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [...mockEmployees].sort((a, b) => a.name.localeCompare(b.name));
  }
};

export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
  try {
    const created = await api.post<Employee>('/employees/', employeeData);
    return created;
  } catch {
    const newEmployee: Employee = {
      id: `emp_${Date.now()}`,
      ...employeeData
    };
    mockEmployees.push(newEmployee);
    return newEmployee;
  }
};

export const updateEmployee = async (employeeData: Employee): Promise<Employee> => {
  try {
    const updated = await api.put<Employee>(`/employees/${employeeData.id}`, employeeData);
    return updated;
  } catch {
    const index = mockEmployees.findIndex(e => e.id === employeeData.id);
    if(index !== -1){
      mockEmployees[index] = employeeData;
      return employeeData;
    }
    throw new Error('Employee not found');
  }
};

export const removeEmployee = async (employeeId: string): Promise<void> => {
  try {
    await api.delete(`/employees/${employeeId}`);
  } catch {
    mockEmployees = mockEmployees.filter(emp => emp.id !== employeeId);
  }
};
