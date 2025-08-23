
import type { Project } from '../types';
import { api } from './api';

let mockProjects: Project[] = [
    { id: 'proj_1', name: 'Aura Website Revamp' },
    { id: 'proj_2', name: 'Q4 Marketing Campaign' },
    { id: 'proj_3', name: 'Internal HR Platform' },
];

export const fetchProjects = async (): Promise<Project[]> => {
    try {
        return await api.get<Project[]>('/projects/');
    } catch {
        return [...mockProjects];
    }
};

export const addProject = async (projectName: string): Promise<Project> => {
    try {
        return await api.post<Project>('/projects/', { name: projectName });
    } catch {
        const newProject: Project = {
            id: `proj_${Date.now()}`,
            name: projectName,
        };
        mockProjects.push(newProject);
        return newProject;
    }
};
