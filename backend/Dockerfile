# Multi-stage build para otimizar tamanho da imagem
FROM golang:1.23-alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache git ca-certificates tzdata

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY go.mod go.sum ./

# Baixar dependências
RUN go mod download

# Copiar código fonte
COPY . .

# Build da aplicação
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# Imagem final com Selenium simples
FROM ubuntu:22.04

# Instalar dependências básicas
RUN apt-get update && apt-get install -y \
    ca-certificates \
    curl \
    wget \
    openjdk-11-jre-headless \
    && rm -rf /var/lib/apt/lists/*

# Baixar Selenium Standalone Server
RUN wget -O /opt/selenium-server.jar "https://github.com/SeleniumHQ/selenium/releases/download/selenium-4.15.0/selenium-server-4.15.0.jar"

# Baixar Chrome
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar binário do builder
COPY --from=builder /app/main .

# Copiar script de inicialização
COPY scripts/start_services.sh /app/start_services.sh
RUN chmod +x /app/start_services.sh

# Expor porta
EXPOSE 8080

# Comando para executar Selenium e aplicação
CMD ["/app/start_services.sh"] 