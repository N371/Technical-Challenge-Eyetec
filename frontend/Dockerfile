# Estágio 1: Build da aplicação React com Vite
FROM node:20-alpine AS build
WORKDIR /app

# Copia apenas os arquivos de dependências para aproveitar o cache do Docker
COPY package*.json ./
RUN npm install

# Copia o restante dos arquivos do front-end e gera a pasta dist/
COPY . .
RUN npm run build

# Estágio 2: Imagem final leve que contém apenas os arquivos estáticos
FROM alpine:3.18
WORKDIR /var/www/html

# Copia os arquivos compilados do estágio anterior para cá
COPY --from=build /app/dist .

# Mantém o container vivo apenas segurando os arquivos (o Caddy vai ler esta pasta)
CMD ["sh", "-c", "tail -f /dev/null"]
