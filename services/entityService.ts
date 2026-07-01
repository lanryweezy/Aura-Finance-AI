import type { Entity } from '../types';
import { db } from './db';

const TABLE = 'entities';

export const entityService = {
  fetchEntities: async (): Promise<Entity[]> => {
    return db.query<Entity>(TABLE);
  },

  addEntity: async (entity: Omit<Entity, 'id'>): Promise<Entity> => {
    return db.insert<Entity>(TABLE, {
      name: entity.name,
      type: entity.type,
      tax_id: entity.taxId,
      currency: entity.currency,
      is_main: entity.isMain,
    });
  },
};
