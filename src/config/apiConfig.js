const apiConfig = {
    baseURL: '', // Substitua pela URL base da sua API (https://api.example.com)
    endpoints: {
        loadProject: '', // Endpoint para carregar o projeto (/projects/load)
        saveProject: '', // Endpoint para salvar o projeto (/projects/save)
    },
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_TOKEN', // Substitua pelo token de autenticação, se necessário
    },
};

export default apiConfig;
