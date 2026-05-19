import { monitoringService } from './monitoringService';

import type { Contact } from '../types';
import { authService } from './authService';

const getStorageKey = () => `aura_${authService.getTenantId()}_contacts`;

const initialContacts: Contact[] = [
    {
        id: 'cont_1',
        type: 'Customer',
        name: 'John Doe',
        companyName: 'Client A Inc.',
        email: 'accounts@clienta.com',
        phone: '+234 801 234 5678',
        address: '12 Ozumba Mbadiwe, VI, Lagos',
        tin: '12345678-0001'
    },
    {
        id: 'cont_2',
        type: 'Customer',
        name: 'Sarah Smith',
        companyName: 'Client B Ltd.',
        email: 'billing@clientb.com',
        phone: '+234 809 876 5432',
    },
    {
        id: 'cont_3',
        type: 'Vendor',
        name: 'Tech Depot',
        companyName: 'Tech Supplies Ltd',
        email: 'sales@techdepot.ng',
        address: 'Computer Village, Ikeja',
    },
    {
        id: 'cont_4',
        type: 'Vendor',
        name: 'Google LLC',
        companyName: 'Google Workspace',
        email: 'billing@google.com',
    }
];

const loadContacts = (): Contact[] => {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e: any) {
            monitoringService.trackError('SERVICE', e, { message: 'Failed to parse contacts' });
            return initialContacts;
        }
    }
    return initialContacts;
};

export const fetchContacts = (): Promise<Contact[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(loadContacts()), 400);
    });
};

export const addContact = (contactData: Omit<Contact, 'id'>): Promise<Contact> => {
    return new Promise(resolve => {
        const current = loadContacts();
        const newContact: Contact = {
            id: `cont_${Date.now()}`,
            ...contactData
        };
        const updated = [...current, newContact];
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        setTimeout(() => resolve(newContact), 300);
    });
};

export const updateContact = (contact: Contact): Promise<Contact> => {
    return new Promise(resolve => {
        const current = loadContacts();
        const updated = current.map(c => c.id === contact.id ? contact : c);
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        setTimeout(() => resolve(contact), 300);
    });
};
