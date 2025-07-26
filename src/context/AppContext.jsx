import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from 'react';
import { initialConfig, emptyProjectTemplate } from '../config/initialData.js';
import { calculateProjectEndDate } from '../core/pertCalculator.js';
import { useTranslation } from 'react-i18next';

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {

    const { t } = useTranslation();
    const [projectData, setProjectData] = useState(null);
    const [tiposAtividade] = useState(initialConfig.tiposAtividade);
    const [activityModal, setActivityModal] = useState({ isOpen: false, activity: null, isReadOnly: false });
    const [projectModal, setProjectModal] = useState({ isOpen: false, isCreating: false });
    const fileInputRef = useRef(null);

    const estimatedEndDate = useMemo(() => calculateProjectEndDate(projectData), [projectData]);
    const plannedEndDate = useMemo(() => calculateProjectEndDate(projectData, false), [projectData]);

console.log('Project Status:', projectData);

    const projectStatus = useMemo(() => {
        if (!projectData || !projectData.atividades || projectData.atividades.length === 0) {
            return t('status.planning');
        }
        const activities = projectData.atividades;
        console.log('Activities:', activities);
        const objMenorId = activities.reduce((min, obj) => obj.id < min.id ? obj : min, { id: Infinity });
        console.log('Activities:', activities, objMenorId);
        if (objMenorId.status === t('status.pending')) return t('status.planning');
        const objMaiorId = activities.reduce((max, obj) => obj.id > max.id ? obj : max, { id: -Infinity });
        if (objMaiorId.status === t('status.pending')) return t('status.inProgress');
        return objMaiorId.status;
    }, [projectData]);

    const handleNewProject = useCallback(() => {
        setProjectModal({ isOpen: true, isCreating: true });
    }, []);

    const handleSave = useCallback(() => {
        if (!projectData) return;
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(projectData, null, 2))}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = `project.json`;
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
                alert(t('errors.errorReadingFile'));
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

        const finishedStatuses = [t('status.completed'), t('status.completedWithErrors'), t('status.interrupted')];

        if (finishedStatuses.includes(activityToUpdate.status) && !finishedStatuses.includes(newStatus)) {
            const subsequentActivities = projectData.atividades.filter(act => act.dependencia?.includes(activityId));
            const blockingActivities = subsequentActivities.filter(act => act.status === t('status.inProgress') || finishedStatuses.includes(act.status));

            if (blockingActivities.length > 0) {
                const blockingNames = blockingActivities.map(act => act.nome).join(', ');
                alert(t('alerts.blockReverseStatus') + ` ${blockingNames}.`);
                return;
            }
        }

        if ((newStatus === t('status.inProgress') || newStatus === t('status.completed'))) {
            const activitiesMap = new Map(projectData.atividades.map(a => [a.id, a]));
            
            const incompleteDependencies = (activityToUpdate.dependencia || []).filter(depId => {
                const depActivity = activitiesMap.get(depId);
                if (!depActivity || finishedStatuses.includes(depActivity.status)) {
                    return false;
                }

                const parentActivities = projectData.atividades.filter(parent => parent.dependencia?.includes(depId));
                
                const isBypassed = parentActivities.some(parent => 
                    parent.status === t('status.completedWithErrors')
                );

                if (isBypassed) {
                    return false;
                }

                return true;
            });

            if (incompleteDependencies.length > 0) {
                const depNames = incompleteDependencies.map(depId => activitiesMap.get(depId)?.nome).join(', ');
                alert([t('alerts.blockDependencies')] + depNames);
                return;
            }
        }

        let updatedProjectData = { ...projectData };

        const isFirstToStart = newStatus === t('status.inProgress') && !projectData.atividades.some(a => a.status === t('status.inProgress') || finishedStatuses.includes(a.status));
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