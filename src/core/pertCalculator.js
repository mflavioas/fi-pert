import { addHours, max as maxDate } from 'date-fns';

export function calculateProjectEndDate(project, useActualDates = true) {
    if (!project || !project.atividades || !Array.isArray(project.atividades) || !project.data_hora_inicio) {
        return null;
    }

    // Define a data de início base: usa a data real se disponível para previsões, senão a planejada.
    const baseStartDate = useActualDates && project.data_hora_inicio_real ? project.data_hora_inicio_real : project.data_hora_inicio;
    const projectStartDate = new Date(baseStartDate);

    if (isNaN(projectStartDate.getTime())) {
        return null;
    }

    if (project.atividades.length === 0) {
        return null;
    }

    const activitiesMap = new Map(project.atividades.map(act => [act.id, act]));
    const memo = new Map();

    function getFinishDate(activityId) {
        if (memo.has(activityId)) return memo.get(activityId);
        
        const activity = activitiesMap.get(activityId);
        if (!activity) {
            return null;
        }

        if (useActualDates && activity.data_hora_fim_real) {
            const realFinishDate = new Date(activity.data_hora_fim_real);
            if (!isNaN(realFinishDate.getTime())) {
                memo.set(activityId, realFinishDate);
                return realFinishDate;
            }
        }

        let startDate;
        if (!activity.dependencia || activity.dependencia.length === 0) {
            startDate = projectStartDate;
        } else {
            const dependencyFinishDates = activity.dependencia
                .map(depId => getFinishDate(depId))
                .filter(d => d instanceof Date && !isNaN(d));
            
            if (dependencyFinishDates.length === 0) {
                startDate = projectStartDate;
            } else {
                startDate = maxDate(dependencyFinishDates);
            }
        }
        
        const duration = Number(activity.tempo_execucao_horas) || 0;
        const finishDate = addHours(startDate, duration);
        memo.set(activityId, finishDate);
        return finishDate;
    }
    
    const allFinishDates = project.atividades
        .map(act => getFinishDate(act.id))
        .filter(d => d instanceof Date && !isNaN(d));

    if (allFinishDates.length === 0) {
        return projectStartDate;
    }
    
    return maxDate(allFinishDates);
}