#!/bin/bash

# Script de Deploy para VPS
set -e

echo "🚀 Iniciando deploy..."

# Verificar e instalar Docker Compose se necessário
if ! command -v docker-compose &> /dev/null; then
    echo "📦 Instalando Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose instalado"
fi

# Parar containers existentes
echo "📦 Parando containers..."
docker compose -f infrastructure/docker-compose.yml down

# Limpar cache
echo "🧹 Limpando cache..."
docker system prune -f

# Reconstruir e subir containers
echo "🔨 Reconstruindo containers..."
docker compose -f infrastructure/docker-compose.yml up -d --build

# Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 30

# Health checks
echo "🏥 Verificando saúde dos serviços..."

# Frontend check
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend: OK"
else
    echo "❌ Frontend: FALHOU"
    exit 1
fi

# Backend check
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Backend: OK"
else
    echo "❌ Backend: FALHOU"
    exit 1
fi

# Nginx check
if curl -f http://localhost:8081 > /dev/null 2>&1; then
    echo "✅ Nginx: OK"
else
    echo "❌ Nginx: FALHOU"
    exit 1
fi

echo "🎉 Deploy concluído com sucesso!"
echo "🌐 Frontend: http://95.217.76.135:3000"
echo "🔧 Backend: http://95.217.76.135:8080"
echo "🌍 Nginx: http://95.217.76.135:8081" 