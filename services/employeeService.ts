import type { Employee } from '../types';
import { db } from './db';

const TABLE = 'employees';

export const fetchEmployees = async (): Promise<Employee[]> => {
  const employees = await db.query<Employee>(TABLE);
  return [...employees].sort((a, b) => a.name.localeCompare(b.name));
};

export const addEmployee = async (employeeData: Omit<Employee, 'id'>): Promise<Employee> => {
  return db.insert<Employee>(TABLE, {
    name: employeeData.name,
    job_title: employeeData.jobTitle,
    hire_date: employeeData.hireDate,
    email: employeeData.email,
    bank_name: employeeData.bankName,
    account_number: employeeData.accountNumber,
    gross_salary: employeeData.grossSalary,
    entity_id: employeeData.entityId,
  });
};

export const updateEmployee = async (employeeData: Employee): Promise<Employee> => {
  return db.update<Employee>(TABLE, employeeData.id, {
    name: employeeData.name,
    job_title: employeeData.jobTitle,
    hire_date: employeeData.hireDate,
    email: employeeData.email,
    bank_name: employeeData.bankName,
    account_number: employeeData.accountNumber,
    gross_salary: employeeData.grossSalary,
    entity_id: employeeData.entityId,
  });
};

export const removeEmployee = async (employeeId: string): Promise<void> => {
  await db.remove(TABLE, employeeId);
};
