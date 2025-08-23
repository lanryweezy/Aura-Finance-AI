
import type { Project } from '../types';

let mockProjects: Project[] = [
    { id: 'proj_1', name: 'Aura Website Revamp' },
    { id: 'proj_2', name: 'Q4 Marketing Campaign' },
    { id: 'proj_3', name: 'Internal HR Platform' },
];

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
        setTimeout(() => resolve(newProject), 300);
    });
};
