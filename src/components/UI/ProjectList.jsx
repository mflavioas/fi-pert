import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../../context/AppContext';

export default function ProjectList() {
    const { t } = useTranslation();
    const { projects, setActiveProjectId, deleteProject, activeProjectId } = useApp();

    const handleDelete = (projectId) => {
        if (window.confirm(t('alerts.confirmDeleteProject'))) {
            deleteProject(projectId);
        }
    };

    return (
        <div className="w-64 bg-gray-100 border-r p-4 flex flex-col">
            <h2 className="text-lg font-bold mb-4">{t('projectList.title')}</h2>
            <div className="flex-grow overflow-y-auto">
                {projects.map(project => (
                    <div 
                        key={project.id} 
                        className={`p-2 mb-2 rounded-md cursor-pointer flex justify-between items-center ${activeProjectId === project.id ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
                    >
                        <span onClick={() => setActiveProjectId(project.id)} className="flex-grow truncate pr-2">
                            {project.nome_projeto}
                        </span>
                        <button 
                            onClick={() => handleDelete(project.id)} 
                            className="text-red-500 hover:text-red-700 font-bold text-lg"
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
