export const initialConfig = {
    tiposAtividade: [
        { id: 1, nome: "Planejamento", cor: "#3b82f6", icone: "rule" },
        { id: 2, nome: "Execução", cor: "#f97316", icone: "construction" },
        { id: 3, nome: "Validação", cor: "#16a34a", icone: "check_circle" }
    ],    
};

export const emptyProjectTemplate = {
    nome_projeto: "Novo Projeto",
    data_hora_inicio: new Date().toISOString(),
    os: "",
    resumo: "",
    responsaveis: [],
    atividades: [],
    editavel: true
};