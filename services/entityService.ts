
import { authService } from './authService';
import type { Entity } from '../types';

const getStorageKey = () => `aura_${authService.getTenantId()}_entities`;

const initialEntities: Entity[] = [
    { id: 'ent_main', name: 'Aura Corp (Headquarters)', type: 'Main', currency: 'NGN', isMain: true },
    { id: 'ent_sub1', name: 'Aura Logistics South', type: 'Subsidiary', currency: 'USD', isMain: false }
];

export const entityService = {
    fetchEntities: async (): Promise<Entity[]> => {
        const stored = localStorage.getItem(getStorageKey());
        if (stored) return JSON.parse(stored);
        return initialEntities;
    },

    addEntity: async (entity: Omit<Entity, 'id'>): Promise<Entity> => {
        const entities = await entityService.fetchEntities();
        const newEntity: Entity = { ...entity, id: `ent_${Date.now()}` };
        const updated = [...entities, newEntity];
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        return newEntity;
    }
};
