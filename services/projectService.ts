
import type { Project } from '../types';
import { apiClient } from './apiClient';

export const fetchProjects = async (): Promise<Project[]> => {
    return await apiClient.get('/projects');
};

export const addProject = async (name: string): Promise<Project> => {
    return await apiClient.post('/projects', { name, status: 'Active' });
};
