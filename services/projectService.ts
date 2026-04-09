import { monitoringService } from './monitoringService';

import type { Project } from '../types';
import { authService } from './authService';

const getStorageKey = () => `aura_${authService.getTenantId()}_projects`;

const initialProjects: Project[] = [
    { id: 'proj_1', name: 'Aura Website Revamp' },
    { id: 'proj_2', name: 'Q4 Marketing Campaign' },
    { id: 'proj_3', name: 'Internal HR Platform' },
];

const loadProjects = (): Project[] => {
    const stored = localStorage.getItem(getStorageKey());
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            monitoringService.trackError('SERVICE', e, { message: 'Failed to parse projects' });
            return initialProjects;
        }
    }
    return initialProjects;
};

export const fetchProjects = (): Promise<Project[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(loadProjects()), 200);
    });
};

export const addProject = (projectName: string): Promise<Project> => {
    return new Promise(resolve => {
        const current = loadProjects();
        const newProject: Project = {
            id: `proj_${Date.now()}`,
            name: projectName,
        };
        const updated = [...current, newProject];
        localStorage.setItem(getStorageKey(), JSON.stringify(updated));
        setTimeout(() => resolve(newProject), 300);
    });
};
