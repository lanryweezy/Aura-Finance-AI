
import type { Entity } from '../types';
import { apiClient } from './apiClient';

export const entityService = {
    fetchEntities: async (): Promise<Entity[]> => {
        return await apiClient.get('/entities');
    },

    addEntity: async (entity: Omit<Entity, 'id'>): Promise<Entity> => {
        return await apiClient.post('/entities', entity);
    }
};
