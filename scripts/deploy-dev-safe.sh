#!/bin/bash

# Script de Deploy DEV - NÃO AFETA PRODUÇÃO
# Este script roda APENAS no ambiente DEV

set -e

echo "🚀 Iniciando deploy DEV (NÃO AFETA PRODUÇÃO)..."

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "❌ Erro: docker-compose.dev.yml não encontrado!"
    exit 1
fi

# Parar serviços DEV existentes (se houver)
echo "🛑 Parando serviços DEV existentes..."
docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true

# Limpar containers DEV antigos
echo "🧹 Limpando containers DEV antigos..."
docker container prune -f 2>/dev/null || true

# Construir e iniciar serviços DEV
echo "🔨 Construindo e iniciando serviços DEV..."
docker-compose -f docker-compose.dev.yml up -d --build

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços DEV ficarem prontos..."
sleep 30

# Verificar status dos serviços DEV
echo "🔍 Verificando status dos serviços DEV..."
docker-compose -f docker-compose.dev.yml ps

# Health check DEV
echo "🏥 Fazendo health check DEV..."
for i in {1..10}; do
    if curl -f http://localhost:8081 >/dev/null 2>&1; then
        echo "✅ Frontend DEV está funcionando!"
        break
    fi
    echo "⏳ Tentativa $i/10 - Aguardando frontend DEV..."
    sleep 10
done

# Verificar se o botão Mapa está visível (DEV)
echo "🗺️ Verificando se o botão Mapa está visível no DEV..."
if curl -s http://localhost:8081 | grep -q "🗺️"; then
    echo "✅ Botão Mapa encontrado no DEV!"
else
    echo "❌ Botão Mapa NÃO encontrado no DEV!"
fi

echo "🎉 Deploy DEV concluído com sucesso!"
echo "🌐 Frontend DEV: http://localhost:8081"
echo "🔧 Backend DEV: http://localhost:8080"
echo "🗺️ Botão Mapa deve estar visível APENAS no DEV"

# Script de Deploy DEV - NÃO AFETA PRODUÇÃO
# Este script roda APENAS no ambiente DEV

set -e

echo "🚀 Iniciando deploy DEV (NÃO AFETA PRODUÇÃO)..."

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.dev.yml" ]; then
    echo "❌ Erro: docker-compose.dev.yml não encontrado!"
    exit 1
fi

# Parar serviços DEV existentes (se houver)
echo "🛑 Parando serviços DEV existentes..."
docker-compose -f docker-compose.dev.yml down --remove-orphans 2>/dev/null || true

# Limpar containers DEV antigos
echo "🧹 Limpando containers DEV antigos..."
docker container prune -f 2>/dev/null || true

# Construir e iniciar serviços DEV
echo "🔨 Construindo e iniciando serviços DEV..."
docker-compose -f docker-compose.dev.yml up -d --build

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços DEV ficarem prontos..."
sleep 30

# Verificar status dos serviços DEV
echo "🔍 Verificando status dos serviços DEV..."
docker-compose -f docker-compose.dev.yml ps

# Health check DEV
echo "🏥 Fazendo health check DEV..."
for i in {1..10}; do
    if curl -f http://localhost:8081 >/dev/null 2>&1; then
        echo "✅ Frontend DEV está funcionando!"
        break
    fi
    echo "⏳ Tentativa $i/10 - Aguardando frontend DEV..."
    sleep 10
done

# Verificar se o botão Mapa está visível (DEV)
echo "🗺️ Verificando se o botão Mapa está visível no DEV..."
if curl -s http://localhost:8081 | grep -q "🗺️"; then
    echo "✅ Botão Mapa encontrado no DEV!"
else
    echo "❌ Botão Mapa NÃO encontrado no DEV!"
fi

echo "🎉 Deploy DEV concluído com sucesso!"
echo "🌐 Frontend DEV: http://localhost:8081"
echo "🔧 Backend DEV: http://localhost:8080"
echo "🗺️ Botão Mapa deve estar visível APENAS no DEV"



