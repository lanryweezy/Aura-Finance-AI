import type { Estimate } from '../types';
import { db } from './db';

const TABLE = 'estimates';

export const fetchEstimates = async (): Promise<Estimate[]> => {
  return db.query<Estimate>(TABLE);
};

export const addEstimate = async (estimate: Omit<Estimate, 'id' | 'status' | 'issueDate'>): Promise<Estimate> => {
  return db.insert<Estimate>(TABLE, {
    customer: estimate.customer,
    expiry_date: estimate.expiryDate,
    line_items: JSON.stringify(estimate.lineItems),
    total: estimate.total,
    project_id: estimate.projectId,
    entity_id: estimate.entityId,
    status: 'Draft',
  });
};

export const updateEstimate = async (estimate: Estimate): Promise<Estimate> => {
  return db.update<Estimate>(TABLE, estimate.id, {
    status: estimate.status,
    total: estimate.total,
    customer: estimate.customer,
  });
};
