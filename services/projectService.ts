import type { Project } from '../types';
import { db } from './db';

const TABLE = 'projects';

export const fetchProjects = async (): Promise<Project[]> => {
  return db.query<Project>(TABLE);
};

export const addProject = async (name: string): Promise<Project> => {
  return db.insert<Project>(TABLE, { name, status: 'Active' });
};
