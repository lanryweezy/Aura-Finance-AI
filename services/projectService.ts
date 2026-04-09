
import type { Project } from '../types';

const STORAGE_KEY = 'aura_projects';

const initialProjects: Project[] = [
    { id: 'proj_1', name: 'Aura Website Revamp' },
    { id: 'proj_2', name: 'Q4 Marketing Campaign' },
    { id: 'proj_3', name: 'Internal HR Platform' },
];

const loadProjects = (): Project[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Failed to parse projects', e);
            return initialProjects;
        }
    }
    return initialProjects;
};

let mockProjects: Project[] = loadProjects();

const saveProjects = (projects: Project[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
};

export const fetchProjects = (): Promise<Project[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve([...mockProjects]), 200);
    });
};

export const addProject = (projectName: string): Promise<Project> => {
    return new Promise(resolve => {
        const newProject: Project = {
            id: `proj_${Date.now()}`,
            name: projectName,
        };
        mockProjects.push(newProject);
        saveProjects(mockProjects);
        setTimeout(() => resolve(newProject), 300);
    });
};
