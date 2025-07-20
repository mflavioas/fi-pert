# PERT Visual - Aplicação Avançada de Gestão de Projetos

## Visão Geral

O **PERT Visual** é uma aplicação web interativa, do tipo single-page, projetada para o planejamento, visualização e acompanhamento de projetos utilizando a metodologia PERT (Program Evaluation and Review Technique). A ferramenta permite que os usuários criem um fluxo de trabalho detalhado, definam atividades, suas durações, dependências e, crucialmente, planejem caminhos de contingência para possíveis erros.

A aplicação é totalmente client-side, o que significa que roda inteiramente no navegador sem a necessidade de um backend complexo. Os projetos podem ser salvos e carregados localmente através de arquivos JSON, garantindo portabilidade e controle total dos dados pelo usuário.

## Funcionalidades Principais

- **Criação e Edição de Projetos:** Defina o nome do projeto, Ordem de Serviço (OS), data de início planejada e adicione múltiplos responsáveis.
    
- **Gestão de Atividades:** Crie, edite e exclua atividades, especificando nome, duração, tipo, descrição e anexos.
    
- **Mapeamento de Dependências:** Estabeleça relações de precedência entre as atividades para construir o fluxo de trabalho principal.
    
- **Planejamento de Contingência (Fluxo de Erro):** Defina um ou mais caminhos alternativos (`Em Caso de Erro, Ir Para...`) para uma atividade, criando um plano de ação visual para desvios no projeto.
    
- **Visualização em Diagrama:** O projeto é renderizado como um diagrama de rede interativo, onde as dependências normais são linhas sólidas e os caminhos de contingência são linhas vermelhas tracejadas.
    
- **Cálculo de Prazos (Planejado vs. Previsto):**
    
    - **Data Final Planejada:** O prazo original, baseado nas durações estimadas.
        
    - **Data Final Prevista:** Um prazo dinâmico, recalculado em tempo real com base nas datas reais de início e conclusão das atividades.
        
- **Controle de Status Detalhado:** Altere o status de cada atividade (`Pendente`, `Em Andamento`, `Concluído`, `Concluído com erros`, `Interrompido`).
    
- **Status Geral do Projeto:** O projeto possui um status geral (`Planejamento`, `Em Andamento`, `Concluído`, `Com Erro`, `Interrompido`) que reflete o estado mais crítico do trabalho.
    
- **Regras de Fluxo de Trabalho Inteligentes:**
    
    - Impede que uma atividade seja iniciada antes que suas predecessoras sejam concluídas (a menos que a predecessora tenha sido "pulada" por um fluxo de erro).
        
    - Impede que o status de uma atividade finalizada seja revertido se suas sucessoras já foram iniciadas.
        
- **Modo Somente Leitura:** Um projeto pode ser "travado" para evitar alterações estruturais, permitindo apenas o avanço do status das atividades. Quando o projeto é concluído, ele é totalmente bloqueado.
    
- **Anexos por Atividade:** Faça o upload de múltiplos arquivos para cada atividade. Os arquivos são convertidos para Base64 e salvos dentro do próprio arquivo JSON do projeto.
    
- **Persistência Local:** Salve o estado completo do seu projeto em um arquivo `.json` e carregue-o a qualquer momento para continuar o trabalho.
    

## Tecnologias Utilizadas

- **Framework Principal:** [React](https://react.dev/ "null") (utilizando [Vite](https://vitejs.dev/ "null") como ferramenta de build)
    
- **Visualização de Diagramas:** [React Flow](https://reactflow.dev/ "null")
    
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/ "null") (via CDN para simplicidade no deploy)
    
- **Manipulação de Datas:** [date-fns](https://date-fns.org/ "null")
    

## Como Executar o Projeto Localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/ "null") (versão 18 ou superior)
    
- [npm](https://www.npmjs.com/ "null") (ou [Yarn](https://yarnpkg.com/ "null"))
    

### Passos para Instalação

1.  **Clone o repositório:**
    
    ```
    git clone https://github.com/mflavioas/fi-pert.git
    cd fi-pert
    ```
    
2.  **Instale as dependências do projeto:**
    
    ```
    npm install
    ```
    
    *(ou `yarn install` se estiver usando Yarn)*
    
3.  **Inicie o servidor de desenvolvimento:**
    
    ```
    npm run dev
    ```
    
    *(ou `yarn dev`)*
    
4.  **Acesse a aplicação:** Abra seu navegador e acesse o endereço fornecido pelo Vite (geralmente `http://localhost:5173`).
    

## Estrutura do Projeto

O código-fonte está organizado na pasta `src` com a seguinte estrutura:

- `/components`: Contém os componentes React reutilizáveis, divididos por funcionalidade (Diagrama, Modais, UI).
    
- `/config`: Arquivos de configuração estáticos, como os tipos de atividade e ícones.
    
- `/context`: O `AppContext`, que gerencia o estado global e a lógica de negócio da aplicação.
    
- `/core`: Funções puras e complexas, como a de cálculo do PERT.
    
- `App.jsx`: O componente principal que monta a estrutura da aplicação.
    
- `main.jsx`: O ponto de entrada da aplicação.
    

## Como Usar a Aplicação

1.  **Início:** Ao abrir a aplicação, você terá a opção de "Criar Novo Projeto" ou "Carregar Projeto".
    
2.  **Criar/Editar Projeto:** Preencha os detalhes do projeto. Marque a opção "Projeto Editável" para permitir alterações na estrutura.
    
3.  **Adicionar Atividades:** Com um projeto aberto e editável, clique em "Nova Atividade". Preencha os detalhes, anexe arquivos e defina as dependências de fluxo normal e de contingência.
    
4.  **Acompanhar o Progresso:**
    
    - Clique com o botão direito em uma atividade para alterar seu status.
        
    - Se uma tarefa falhar, mude seu status para "Concluído com erros". O diagrama mostrará o desvio para o caminho de contingência.
        
    - Acompanhe o impacto de atrasos e adiantamentos comparando a data "Planejada" com a "Prevista".
        
5.  **Salvar:** A qualquer momento, clique em "Salvar JSON" para baixar o arquivo do projeto e garantir que seu progresso não seja perdido.