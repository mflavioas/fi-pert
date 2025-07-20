import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from 'react';
import { initialConfig, emptyProjectTemplate } from '../config/initialData.js';
import { calculateProjectEndDate } from '../core/pertCalculator.js';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
    const [projectData, setProjectData] = useState(null);
    const [tiposAtividade] = useState(initialConfig.tiposAtividade);
    const [activityModal, setActivityModal] = useState({ isOpen: false, activity: null, isReadOnly: false });
    const [projectModal, setProjectModal] = useState({ isOpen: false, isCreating: false });
    const fileInputRef = useRef(null);

    const estimatedEndDate = useMemo(() => calculateProjectEndDate(projectData), [projectData]);
    const plannedEndDate = useMemo(() => calculateProjectEndDate(projectData, false), [projectData]);

    const projectStatus = useMemo(() => {
        if (!projectData || !projectData.atividades || projectData.atividades.length === 0) {
            return "Planejamento";
        }
        const activities = projectData.atividades;
        
        const objMenorId = activities.reduce((min, obj) => obj.id > min.id ? obj : min, { id: -Infinity });
        if (objMenorId.status === 'Pendente') return "Planejamento";

        const finishedStatuses = ['Concluído', 'Concluído com erros', 'Interrompido'];
        const isFinished = activities.every(act => finishedStatuses.includes(act.status));
        const objMaiorId = activities.reduce((max, obj) => obj.id > max.id ? obj : max, { id: -Infinity });
        
        if (isFinished) {
            if (objMaiorId.status === 'Concluído') return "Concluído";
            if (objMaiorId.status === 'Interrompido') return "Interrompido";
            return "Com Erro";
        }

        return "Em Andamento";
    }, [projectData]);

    const handleNewProject = useCallback(() => {
        setProjectModal({ isOpen: true, isCreating: true });
    }, []);

    const handleSave = useCallback(() => {
        if (!projectData) return;
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(projectData, null, 2))}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = `projeto_${projectData.os || 'export'}.json`;
        link.click();
    }, [projectData]);

    const handleLoadClick = () => fileInputRef.current.click();

    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                setProjectData(jsonData);
            } catch (error) {
                alert("Erro ao ler o arquivo JSON.");
            }
        };
        reader.readAsText(file);
        event.target.value = null;
    }, []);

    const openActivityModal = useCallback((activity = null, isReadOnly = false) => {
        setActivityModal({ isOpen: true, activity, isReadOnly });
    }, []);
    const closeActivityModal = useCallback(() => setActivityModal({ isOpen: false, activity: null, isReadOnly: false }), []);

    const saveActivity = useCallback((activityData) => {
        setProjectData(prev => {
            if (!prev) return null;
            const existing = prev.atividades.find(a => a.id === activityData.id);
            let newActivities;
            if (existing) {
                newActivities = prev.atividades.map(a => a.id === activityData.id ? activityData : a);
            } else {
                newActivities = [...prev.atividades, activityData];
            }
            return { ...prev, atividades: newActivities };
        });
    }, []);

    const saveProjectDetails = useCallback((details, isCreating) => {
        const updatedDetails = {
            nome_projeto: details.nome_projeto,
            os: details.os,
            data_hora_inicio: details.data_hora_inicio,
            responsaveis: details.responsaveis,
            editavel: details.editavel
        };

        if (isCreating) {
            setProjectData({
                ...emptyProjectTemplate,
                ...updatedDetails
            });
        } else {
            setProjectData(prev => ({
                ...prev,
                ...updatedDetails
            }));
        }
    }, []);

    const deleteActivity = useCallback((activityId) => {
        setProjectData(prev => {
            if (!prev) return null;
            const updatedActivities = prev.atividades
                .filter(act => act.id !== activityId)
                .map(act => ({
                    ...act,
                    dependencia: act.dependencia.filter(depId => depId !== activityId)
                }));
            return { ...prev, atividades: updatedActivities };
        });
    }, []);

    const updateActivityStatus = useCallback((activityId, newStatus) => {
        if (!projectData) return;

        const activityToUpdate = projectData.atividades.find(a => a.id === activityId);
        if (!activityToUpdate || activityToUpdate.status === newStatus) {
            return;
        }

        const finishedStatuses = ['Concluído', 'Concluído com erros', 'Interrompido'];

        if (finishedStatuses.includes(activityToUpdate.status) && !finishedStatuses.includes(newStatus)) {
            const subsequentActivities = projectData.atividades.filter(act => act.dependencia?.includes(activityId));
            const blockingActivities = subsequentActivities.filter(act => act.status === 'Em Andamento' || finishedStatuses.includes(act.status));

            if (blockingActivities.length > 0) {
                const blockingNames = blockingActivities.map(act => act.nome).join(', ');
                alert(`Ação bloqueada. Não é possível reverter o status desta atividade, pois as seguintes tarefas já foram iniciadas: ${blockingNames}.`);
                return;
            }
        }

        if ((newStatus === 'Em Andamento' || newStatus === 'Concluído')) {
            const activitiesMap = new Map(projectData.atividades.map(a => [a.id, a]));
            
            const incompleteDependencies = (activityToUpdate.dependencia || []).filter(depId => {
                const depActivity = activitiesMap.get(depId);
                if (!depActivity || finishedStatuses.includes(depActivity.status)) {
                    return false;
                }

                const parentActivities = projectData.atividades.filter(parent => parent.dependencia?.includes(depId));
                
                const isBypassed = parentActivities.some(parent => 
                    parent.status === 'Concluído com erros' && parent.onErrorGoTo && parent.onErrorGoTo.length > 0
                );

                if (isBypassed) {
                    return false;
                }

                return true;
            });

            if (incompleteDependencies.length > 0) {
                const depNames = incompleteDependencies.map(depId => activitiesMap.get(depId)?.nome).join(', ');
                alert(`Ação bloqueada. Conclua as seguintes dependências primeiro: ${depNames}.`);
                return;
            }
        }

        let updatedProjectData = { ...projectData };

        const isFirstToStart = newStatus === 'Em Andamento' && !projectData.atividades.some(a => a.status === 'Em Andamento' || finishedStatuses.includes(a.status));
        if (isFirstToStart && !updatedProjectData.data_hora_inicio_real) {
            updatedProjectData.data_hora_inicio_real = new Date().toISOString();
        }

        const newActivities = projectData.atividades.map(a => {
            if (a.id === activityId) {
                const updatedActivity = { ...a, status: newStatus };
                if (finishedStatuses.includes(newStatus)) {
                    if (!updatedActivity.data_hora_fim_real) {
                        updatedActivity.data_hora_fim_real = new Date().toISOString();
                    }
                } else {
                    delete updatedActivity.data_hora_fim_real;
                }
                return updatedActivity;
            }
            return a;
        });

        updatedProjectData.atividades = newActivities;
        setProjectData(updatedProjectData);

    }, [projectData]);

    const value = useMemo(() => ({
        projectData,
        tiposAtividade,
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
        deleteActivity,
        updateActivityStatus
    }), [
        projectData, 
        activityModal, 
        projectModal, 
        estimatedEndDate,
        plannedEndDate,
        projectStatus,
        handleNewProject,
        handleSave,
        handleLoadClick,
        handleFileChange,
        openActivityModal,
        closeActivityModal,
        saveActivity,
        saveProjectDetails,
        deleteActivity,
        updateActivityStatus
    ]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}