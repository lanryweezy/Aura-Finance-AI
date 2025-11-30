
import type { Contact } from '../types';

let mockContacts: Contact[] = [
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

export const fetchContacts = (): Promise<Contact[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve([...mockContacts]), 400);
    });
};

export const addContact = (contactData: Omit<Contact, 'id'>): Promise<Contact> => {
    return new Promise(resolve => {
        const newContact: Contact = {
            id: `cont_${Date.now()}`,
            ...contactData
        };
        mockContacts.push(newContact);
        setTimeout(() => resolve(newContact), 300);
    });
};

export const updateContact = (contact: Contact): Promise<Contact> => {
    return new Promise(resolve => {
        mockContacts = mockContacts.map(c => c.id === contact.id ? contact : c);
        setTimeout(() => resolve(contact), 300);
    });
};
