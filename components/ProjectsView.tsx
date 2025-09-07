import React, { useState } from 'react';
import type { Project } from '../types';
import { Card } from './ui/Card';

interface ProjectsViewProps {
  projects: Project[];
  onAddProject: (projectName: string) => void;
  onSelectProject: (project: Project) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, onAddProject, onSelectProject }) => {
  const [newProjectName, setNewProjectName] = useState('');

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setNewProjectName('');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Projects</h1>
        <div className="flex gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="New project name"
            className="bg-dark-tertiary border-2 border-gray-600 rounded-lg p-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-cyan"
          />
          <button
            onClick={handleAddProject}
            className="bg-brand-cyan text-black font-bold p-2 rounded-lg hover:bg-brand-cyan/80 transition-colors"
          >
            Add Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="bg-dark-secondary hover:bg-dark-tertiary cursor-pointer"
            onClick={() => onSelectProject(project)}
          >
            <h2 className="text-xl font-bold text-white">{project.name}</h2>
          </Card>
        ))}
      </div>
    </div>
  );
};
