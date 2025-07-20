export const initialConfig = {
    tiposAtividade: [
        { id: 1, nameKey: "activityTypes.planning", cor: "#3b82f6", icone: "rule" },
        { id: 2, nameKey: "activityTypes.execution", cor: "#f97316", icone: "construction" },
        { id: 3, nameKey: "activityTypes.validation", cor: "#16a34a", icone: "check_circle" }
    ],    
};

export const emptyProjectTemplate = {
    nome_projeto: "[---]",
    data_hora_inicio: new Date().toISOString(),
    os: "",
    resumo: "",
    responsaveis: [],
    atividades: [],
    editavel: true
};