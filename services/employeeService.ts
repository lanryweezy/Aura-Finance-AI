
import type { Employee } from '../types';

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

export const fetchEmployees = (): Promise<Employee[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockEmployees].sort((a, b) => a.name.localeCompare(b.name)));
    }, 500);
  });
};

export const addEmployee = (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newEmployee: Employee = {
                id: `emp_${Date.now()}`,
                ...employeeData
            };
            mockEmployees.push(newEmployee);
            resolve(newEmployee);
        }, 300);
    });
};

export const updateEmployee = (employeeData: Employee): Promise<Employee> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockEmployees.findIndex(e => e.id === employeeData.id);
            if(index !== -1){
                mockEmployees[index] = employeeData;
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
            mockEmployees = mockEmployees.filter(emp => emp.id !== employeeId);
            resolve();
        }, 300);
    });
};
