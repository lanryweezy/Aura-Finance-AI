
import type { Estimate } from '../types';
import { apiClient } from './apiClient';

export const fetchEstimates = async (): Promise<Estimate[]> => {
    return await apiClient.get('/estimates');
};

export const addEstimate = async (estimate: Omit<Estimate, 'id'|'status'|'issueDate'>): Promise<Estimate> => {
    return await apiClient.post('/estimates', estimate);
};

export const updateEstimate = async (estimate: Estimate): Promise<Estimate> => {
    return await apiClient.put(`/estimates/${estimate.id}`, estimate);
};
