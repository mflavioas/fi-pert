import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { icons } from './config/icons';
import { format } from 'date-fns';
import DiagramCanvas from './components/Diagram/DiagramCanvas';
import EmptyState from './components/UI/EmptyState';
import LanguageSwitcher from './components/UI/LanguageSwitcher';
import ActivityModal from './components/Modals/ActivityModal';
import ProjectModal from './components/Modals/ProjectModal';
import SearchProjectsModal from './components/Modals/SearchProjectsModal';
import { useTranslation } from 'react-i18next';
import apiConfig from './config/apiConfig';
import axios from 'axios';

export default function App() {
    const {
        projectData,
        activityModal,
        projectModal,
        estimatedEndDate,
        plannedEndDate,
        projectStatus,
        fileInputRef,
        setProjectModal,
        handleNewProject,
        handleFileChange,
        openActivityModal,
        closeActivityModal,
        saveActivity,
        saveProjectDetails,
    } = useApp();
    const { t } = useTranslation();
    const isProjectLoaded = !!projectData;
    const isEditable = isProjectLoaded && projectData.editavel;
    const [searchProjectsModal, setSearchProjectsModal] = useState(false);

    const statusColors = {
        [t('status.planning')]: 'bg-gray-500',
        [t('status.inProgress')]: 'bg-blue-500',
        [t('status.completed')]: 'bg-green-500',
        [t('status.WithError')]: 'bg-red-500',
        [t('status.interrupted')]: 'bg-yellow-500'
    };

    const renderResponsaveis = () => {
        if (!projectData || !projectData.responsaveis || projectData.responsaveis.length === 0) {
            return [t('header.none')];
        }
        const responsaveis = projectData.responsaveis;
        const first = responsaveis[0].nome;
        const restCount = responsaveis.length - 1;
        if (restCount > 0) {
            return `${first} +${restCount}`;
        }
        return first;
    };

    const displayStartDate = isProjectLoaded ? (projectData.data_hora_inicio_real || projectData.data_hora_inicio) : null;
    const startDateLabel = isProjectLoaded && projectData.data_hora_inicio_real ? [t('header.realStart')] : [t('header.start')];

    const handleLoadClickUnified = async () => {
        if (apiConfig.baseURL && apiConfig.endpoints.loadProject) {
            setSearchProjectsModal(true);
        } else {
            fileInputRef.current.click();
        }
    };

    const handleSelectProject = async (projectId) => {
        if (apiConfig.baseURL && apiConfig.endpoints.saveProject) {
            try {
                const response = await axios.get(`${apiConfig.baseURL}${apiConfig.endpoints.loadProject}`, {
                    params: { id: projectId },
                    headers: apiConfig.headers,
                });
                setProjectData(response.data);
                setSearchProjectsModal(false);
            } catch (error) {
                console.error('Erro ao carregar o projeto:', error);
                fileInputRef.current.click();
            }
        } else {
            fileInputRef.current.click();
        }
    };

    const SaveJson = async () => {
        const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${projectData?.nome_projeto || 'projeto'}.json`;
            link.click();
    }

    const handleSaveUnified = async () => {
        if (apiConfig.baseURL && apiConfig.endpoints.saveProject) {
            try {
                const response = await axios.post(`${apiConfig.baseURL}${apiConfig.endpoints.saveProject}`, projectData, {
                    headers: apiConfig.headers,
                });
            } catch (error) {
                console.error('Erro ao salvar o projeto na API:', error);
                SaveJson(); 
            }
        } else {
            SaveJson();
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-100 flex flex-col">
            <header className="bg-white shadow-md p-3 flex justify-between items-center z-10">
                <div 
                    className={`flex items-center gap-4 p-2 rounded-md ${isProjectLoaded ? 'cursor-pointer hover:bg-gray-100' : 'cursor-default'} transition-colors`}
                    onClick={() => isProjectLoaded && setProjectModal({ isOpen: true, isCreating: false })}
                >
                    <div className="text-blue-600">
                        {icons.logo}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{projectData?.nome_projeto || [t('header.title')]}</h1>
                        {isProjectLoaded && (
                        <div className="text-sm text-gray-500">
                            <span>OS: {projectData?.os} | {startDateLabel}: {format(new Date(displayStartDate), t('formats.datetime'))}</span>
                            <p className="truncate max-w-xs" title={projectData.responsaveis.map(r => `${r.nome} (${r.telefone})`).join('; ')}>
                                {t('modals.responsibles')}: {renderResponsaveis()}
                            </p>
                        </div>
                        )}
                    </div>
                </div>
                {isProjectLoaded && (
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">{t('header.plannedEndDate')}</p>
                            <p className="text-lg font-bold text-gray-600">
                                {plannedEndDate ? format(plannedEndDate, t('formats.datetime')) : 'N/A'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">{t('header.estimatedEndDate')}</p>
                            <p className="text-lg font-bold text-blue-600">
                                {estimatedEndDate ? format(estimatedEndDate, t('formats.datetime')) : 'N/A'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">{t('header.projectStatus')}</p>
                            <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${statusColors[projectStatus]}`}>
                                {projectStatus}
                            </span>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={handleNewProject} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow transition-colors" title={t('buttons.newProject')}>
                        {icons.newProject} 
                    </button>
                    <button onClick={() => openActivityModal()} disabled={!isEditable} className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow transition-colors ${!isEditable && 'btn-disabled'}`} title={t('buttons.newActivity')}>
                        {icons.newActivity} 
                    </button>
                    <button onClick={handleSaveUnified} disabled={!isProjectLoaded} className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow transition-colors ${!isProjectLoaded && 'btn-disabled'}`} title={t('buttons.saveJson')}>
                        {icons.save}
                    </button>
                    <button onClick={handleLoadClickUnified} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow transition-colors" title={t('buttons.loadJson')}>
                        {icons.load}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>
            </header>
            <main className="flex-grow">
                {isProjectLoaded ? 
                    <DiagramCanvas /> : 
                    <EmptyState onNewProject={handleNewProject} onLoadProject={handleLoadClickUnified} />
                }
            </main>
            
            <footer class="bg-gray-900 text-white py-6">
                <div class="text-sm mb-2 text-center">
                {t('footer.developerBy')} <span class="font-semibold">Flávio Alves dos Santos (Tissu)</span> - {t('footer.allRightsReserved')} &copy; 2025
                </div>
                <div class="flex justify-center gap-4 mt-2">
                    <a href="https://github.com/mflavioas" target="_blank" rel="noopener noreferrer" class="hover:text-gray-400 transition">
                        <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.3.8-.6v-2.2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1.1 1.5 1.1.9 1.5 2.3 1 2.9.8.1-.7.3-1 .5-1.3-2.6-.3-5.4-1.3-5.4-5.8 0-1.3.5-2.4 1.2-3.3-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17 5.8 18 6.1 18 6.1c.6 1.6.2 2.8.1 3.1.8.9 1.2 2 1.2 3.3 0 4.6-2.8 5.5-5.4 5.8.3.2.6.7.6 1.4v2c0 .3.2.7.8.6 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.65 18.35.5 12 .5z"/>
                        </svg>
                    </a>
                    <a href="https://www.linkedin.com/in/mflavioas/" target="_blank" rel="noopener noreferrer" class="hover:text-gray-400 transition">
                        <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M20.45 20.45h-3.6v-5.5c0-1.3 0-3-1.85-3s-2.15 1.4-2.15 2.9v5.6h-3.6V9h3.45v1.6h.05c.5-.95 1.7-1.95 3.5-1.95 3.75 0 4.45 2.45 4.45 5.6v6.2zM5.34 7.45a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.13 20.45H3.55V9h3.58v11.45zM22.22 0H1.78C.8 0 0 .77 0 1.7v20.6C0 23.23.8 24 1.78 24h20.44c.98 0 1.78-.77 1.78-1.7V1.7C24 .77 23.2 0 22.22 0z"/>
                        </svg>
                    </a>
                    
                </div>
                <div>
                    <LanguageSwitcher/>
                </div>
            </footer>
            <ActivityModal isOpen={activityModal.isOpen} onClose={closeActivityModal} activity={activityModal.activity} onSave={saveActivity} isReadOnly={activityModal.isReadOnly || !isEditable} />
            <ProjectModal isOpen={projectModal.isOpen} onClose={() => setProjectModal({isOpen: false, isCreating: false})} onSave={saveProjectDetails} isCreating={projectModal.isCreating} />
            <SearchProjectsModal
                isOpen={searchProjectsModal}
                onClose={() => setSearchProjectsModal(false)}
                onSelectProject={handleSelectProject}
            />
        </div>
    );
}