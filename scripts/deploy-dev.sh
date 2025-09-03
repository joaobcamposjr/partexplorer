#!/bin/bash

# Script de Deploy para Desenvolvimento
# Uso: ./scripts/deploy-dev.sh

set -e

echo "🔧 INICIANDO DEPLOY DE DESENVOLVIMENTO..."

# Verificar se estamos na branch develop
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "❌ ERRO: Deploy de desenvolvimento deve ser feito da branch develop"
    echo "Branch atual: $CURRENT_BRANCH"
    echo "Execute: git checkout develop"
    exit 1
fi

echo "✅ Branch correta: $CURRENT_BRANCH"

# Atualizar código
echo "📥 Atualizando código..."
git pull origin develop

# Parar containers de desenvolvimento
echo "🛑 Parando containers de desenvolvimento..."
docker compose -f docker-compose.dev.yml down

# Rebuild e subir containers
echo "🔨 Rebuild e subindo containers..."
docker compose -f docker-compose.dev.yml up -d --build

# Verificar status
echo "🔍 Verificando status dos containers..."
docker compose -f docker-compose.dev.yml ps

echo "✅ DEPLOY DE DESENVOLVIMENTO CONCLUÍDO!"
echo "🌐 Site disponível em: https://dev.proencalho.com:9443"

# Script de Deploy para Desenvolvimento
# Uso: ./scripts/deploy-dev.sh

set -e

echo "🔧 INICIANDO DEPLOY DE DESENVOLVIMENTO..."

# Verificar se estamos na branch develop
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "develop" ]; then
    echo "❌ ERRO: Deploy de desenvolvimento deve ser feito da branch develop"
    echo "Branch atual: $CURRENT_BRANCH"
    echo "Execute: git checkout develop"
    exit 1
fi

echo "✅ Branch correta: $CURRENT_BRANCH"

# Atualizar código
echo "📥 Atualizando código..."
git pull origin develop

# Parar containers de desenvolvimento
echo "🛑 Parando containers de desenvolvimento..."
docker compose -f docker-compose.dev.yml down

# Rebuild e subir containers
echo "🔨 Rebuild e subindo containers..."
docker compose -f docker-compose.dev.yml up -d --build

# Verificar status
echo "🔍 Verificando status dos containers..."
docker compose -f docker-compose.dev.yml ps

echo "✅ DEPLOY DE DESENVOLVIMENTO CONCLUÍDO!"
echo "🌐 Site disponível em: https://dev.proencalho.com:9443"


