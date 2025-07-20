# --- Estágio 1: Build da Aplicação React ---
FROM node:18-alpine AS build

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de pacotes
COPY package*.json ./

# Instala todas as dependências do projeto
# Usamos 'npm ci' para uma instalação limpa e consistente em ambientes de CI/CD
RUN npm ci

# Copia o restante dos arquivos da aplicação para o container
COPY . .

# Executa o comando de build para gerar os arquivos estáticos na pasta /dist
RUN npm run build

# --- Estágio 2: Servidor de Produção com Nginx ---
FROM nginx:stable-alpine

# Copia os arquivos estáticos gerados no estágio de build para o diretório padrão do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do Nginx
EXPOSE 80

# Comando para iniciar o servidor Nginx em primeiro plano quando o container for executado
CMD ["nginx", "-g", "daemon off;"]
