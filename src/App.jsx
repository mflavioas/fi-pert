import React from 'react';
import { useApp } from './context/AppContext';
import { icons } from './config/icons';
import { format } from 'date-fns';
import DiagramCanvas from './components/Diagram/DiagramCanvas';
import EmptyState from './components/UI/EmptyState';
import ActivityModal from './components/Modals/ActivityModal';
import ProjectModal from './components/Modals/ProjectModal';

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
        handleSave,
        handleLoadClick,
        handleFileChange,
        openActivityModal,
        closeActivityModal,
        saveActivity,
        saveProjectDetails,
    } = useApp();

    const isProjectLoaded = !!projectData;
    const isEditable = isProjectLoaded && projectData.editavel;

    const statusColors = {
        'Planejamento': 'bg-gray-500',
        'Em Andamento': 'bg-blue-500',
        'Concluído': 'bg-green-500',
        'Com Erro': 'bg-red-500',
        'Interrompido': 'bg-yellow-500'
    };

    const renderResponsaveis = () => {
        if (!projectData || !projectData.responsaveis || projectData.responsaveis.length === 0) {
            return 'Nenhum';
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
    const startDateLabel = isProjectLoaded && projectData.data_hora_inicio_real ? 'Início Real' : 'Início';

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
                        <h1 className="text-xl font-bold text-gray-800">{projectData?.nome_projeto || "Visual PERT"}</h1>
                        {isProjectLoaded && (
                        <div className="text-sm text-gray-500">
                            <span>OS: {projectData?.os} | {startDateLabel}: {format(new Date(displayStartDate), 'dd/MM/yyyy HH:mm')}</span>
                            <p className="truncate max-w-xs" title={projectData.responsaveis.map(r => `${r.nome} (${r.telefone})`).join('; ')}>
                                Responsáveis: {renderResponsaveis()}
                            </p>
                        </div>
                        )}
                    </div>
                </div>
                {isProjectLoaded && (
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Data Final Planejada</p>
                            <p className="text-lg font-bold text-gray-600">
                                {plannedEndDate ? format(plannedEndDate, 'dd/MM/yyyy HH:mm') : 'N/A'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Data Final Prevista</p>
                            <p className="text-lg font-bold text-blue-600">
                                {estimatedEndDate ? format(estimatedEndDate, 'dd/MM/yyyy HH:mm') : 'N/A'}
                            </p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-600">Status do Projeto</p>
                            <span className={`px-3 py-1 text-sm font-semibold text-white rounded-full ${statusColors[projectStatus]}`}>
                                {projectStatus}
                            </span>
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={handleNewProject} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow transition-colors" title="Novo Projeto">
                        {icons.newProject} 
                    </button>
                    <button onClick={() => openActivityModal()} disabled={!isEditable} className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow transition-colors ${!isEditable && 'btn-disabled'}`} title="Nova Atividade">
                        {icons.newActivity} 
                    </button>
                    <button onClick={handleSave} disabled={!isProjectLoaded} className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow transition-colors ${!isProjectLoaded && 'btn-disabled'}`} title="Salvar Projeto">
                        {icons.save}
                    </button>
                    <button onClick={handleLoadClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow transition-colors" title="Carregar Projeto">
                        {icons.load}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                </div>
            </header>
            <main className="flex-grow">
                {isProjectLoaded ? 
                    <DiagramCanvas /> : 
                    <EmptyState onNewProject={handleNewProject} onLoadProject={handleLoadClick} />
                }
            </main>
            <ActivityModal isOpen={activityModal.isOpen} onClose={closeActivityModal} activity={activityModal.activity} onSave={saveActivity} isReadOnly={activityModal.isReadOnly || !isEditable} />
            <ProjectModal isOpen={projectModal.isOpen} onClose={() => setProjectModal({isOpen: false, isCreating: false})} onSave={saveProjectDetails} isCreating={projectModal.isCreating} />
        </div>
    );
}