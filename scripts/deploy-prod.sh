#!/bin/bash

# Script de Deploy para Produção
# Uso: ./scripts/deploy-prod.sh

set -e

echo "🚀 INICIANDO DEPLOY DE PRODUÇÃO..."

# Verificar se estamos na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ ERRO: Deploy de produção deve ser feito da branch main"
    echo "Branch atual: $CURRENT_BRANCH"
    echo "Execute: git checkout main"
    exit 1
fi

echo "✅ Branch correta: $CURRENT_BRANCH"

# Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# Parar containers de produção
echo "🛑 Parando containers de produção..."
docker compose -f docker-compose.prod.yml down

# Rebuild e subir containers
echo "🔨 Rebuild e subindo containers..."
docker compose -f docker-compose.prod.yml up -d --build

# Verificar status
echo "🔍 Verificando status dos containers..."
docker compose -f docker-compose.prod.yml ps

echo "✅ DEPLOY DE PRODUÇÃO CONCLUÍDO!"
echo "🌐 Site disponível em: https://www.proencalho.com"

# Script de Deploy para Produção
# Uso: ./scripts/deploy-prod.sh

set -e

echo "🚀 INICIANDO DEPLOY DE PRODUÇÃO..."

# Verificar se estamos na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ ERRO: Deploy de produção deve ser feito da branch main"
    echo "Branch atual: $CURRENT_BRANCH"
    echo "Execute: git checkout main"
    exit 1
fi

echo "✅ Branch correta: $CURRENT_BRANCH"

# Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# Parar containers de produção
echo "🛑 Parando containers de produção..."
docker compose -f docker-compose.prod.yml down

# Rebuild e subir containers
echo "🔨 Rebuild e subindo containers..."
docker compose -f docker-compose.prod.yml up -d --build

# Verificar status
echo "🔍 Verificando status dos containers..."
docker compose -f docker-compose.prod.yml ps

echo "✅ DEPLOY DE PRODUÇÃO CONCLUÍDO!"
echo "🌐 Site disponível em: https://www.proencalho.com"



# Script de Deploy para Produção
# Uso: ./scripts/deploy-prod.sh

set -e

echo "🚀 INICIANDO DEPLOY DE PRODUÇÃO..."

# Verificar se estamos na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ ERRO: Deploy de produção deve ser feito da branch main"
    echo "Branch atual: $CURRENT_BRANCH"
    echo "Execute: git checkout main"
    exit 1
fi

echo "✅ Branch correta: $CURRENT_BRANCH"

# Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# Parar containers de produção
echo "🛑 Parando containers de produção..."
docker compose -f docker-compose.prod.yml down

# Rebuild e subir containers
echo "🔨 Rebuild e subindo containers..."
docker compose -f docker-compose.prod.yml up -d --build

# Verificar status
echo "🔍 Verificando status dos containers..."
docker compose -f docker-compose.prod.yml ps

echo "✅ DEPLOY DE PRODUÇÃO CONCLUÍDO!"
echo "🌐 Site disponível em: https://www.proencalho.com"

# Script de Deploy para Produção
# Uso: ./scripts/deploy-prod.sh

set -e

echo "🚀 INICIANDO DEPLOY DE PRODUÇÃO..."

# Verificar se estamos na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ ERRO: Deploy de produção deve ser feito da branch main"
    echo "Branch atual: $CURRENT_BRANCH"
    echo "Execute: git checkout main"
    exit 1
fi

echo "✅ Branch correta: $CURRENT_BRANCH"

# Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# Parar containers de produção
echo "🛑 Parando containers de produção..."
docker compose -f docker-compose.prod.yml down

# Rebuild e subir containers
echo "🔨 Rebuild e subindo containers..."
docker compose -f docker-compose.prod.yml up -d --build

# Verificar status
echo "🔍 Verificando status dos containers..."
docker compose -f docker-compose.prod.yml ps

echo "✅ DEPLOY DE PRODUÇÃO CONCLUÍDO!"
echo "🌐 Site disponível em: https://www.proencalho.com"



# Script de Deploy para Produção
# Uso: ./scripts/deploy-prod.sh

set -e

echo "🚀 INICIANDO DEPLOY DE PRODUÇÃO..."

# Verificar se estamos na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ ERRO: Deploy de produção deve ser feito da branch main"
    echo "Branch atual: $CURRENT_BRANCH"
    echo "Execute: git checkout main"
    exit 1
fi

echo "✅ Branch correta: $CURRENT_BRANCH"

# Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# Parar containers de produção
echo "🛑 Parando containers de produção..."
docker compose -f docker-compose.prod.yml down

# Rebuild e subir containers
echo "🔨 Rebuild e subindo containers..."
docker compose -f docker-compose.prod.yml up -d --build

# Verificar status
echo "🔍 Verificando status dos containers..."
docker compose -f docker-compose.prod.yml ps

echo "✅ DEPLOY DE PRODUÇÃO CONCLUÍDO!"
echo "🌐 Site disponível em: https://www.proencalho.com"

# Script de Deploy para Produção
# Uso: ./scripts/deploy-prod.sh

set -e

echo "🚀 INICIANDO DEPLOY DE PRODUÇÃO..."

# Verificar se estamos na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ ERRO: Deploy de produção deve ser feito da branch main"
    echo "Branch atual: $CURRENT_BRANCH"
    echo "Execute: git checkout main"
    exit 1
fi

echo "✅ Branch correta: $CURRENT_BRANCH"

# Atualizar código
echo "📥 Atualizando código..."
git pull origin main

# Parar containers de produção
echo "🛑 Parando containers de produção..."
docker compose -f docker-compose.prod.yml down

# Rebuild e subir containers
echo "🔨 Rebuild e subindo containers..."
docker compose -f docker-compose.prod.yml up -d --build

# Verificar status
echo "🔍 Verificando status dos containers..."
docker compose -f docker-compose.prod.yml ps

echo "✅ DEPLOY DE PRODUÇÃO CONCLUÍDO!"
echo "🌐 Site disponível em: https://www.proencalho.com"


