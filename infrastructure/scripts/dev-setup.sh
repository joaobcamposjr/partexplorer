#!/bin/bash

# Script para setup do ambiente de desenvolvimento
# Uso: ./dev-setup.sh

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARN] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

log "🚀 Iniciando setup do ambiente de desenvolvimento..."

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado. Instale o Docker Desktop primeiro."
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado."
fi

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    error "Docker não está rodando. Inicie o Docker Desktop."
fi

log "✅ Docker verificado"

# Criar arquivo .env se não existir
if [ ! -f "../backend/.env" ]; then
    log "📝 Criando arquivo .env para o backend..."
    # Criar diretório backend se não existir
    mkdir -p ../backend
    cat > ../backend/.env << EOF
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=partexplorer

# Elasticsearch
ES_HOST=elasticsearch
ES_PORT=9200

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Server
PORT=8080
GIN_MODE=debug
EOF
    log "✅ Arquivo .env criado"
else
    log "✅ Arquivo .env já existe"
fi

# Baixar dependências do Go
log "📦 Baixando dependências do Go..."
cd ../backend
if [ -f "go.mod" ]; then
    go mod tidy
    go mod download
    log "✅ Dependências do Go baixadas"
else
    warn "⚠️  Arquivo go.mod não encontrado, pulando download de dependências"
fi

# Voltar para o diretório de scripts
cd ../infrastructure/scripts

# Subir serviços
log "🐳 Subindo serviços com Docker Compose..."
cd ..
docker-compose up -d

# Aguardar serviços ficarem prontos
log "⏳ Aguardando serviços ficarem prontos..."
sleep 30

# Verificar status dos serviços
log "🔍 Verificando status dos serviços..."
docker-compose ps

# Testar endpoints
log "🧪 Testando endpoints..."

# Health check do backend
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    log "✅ Backend está respondendo"
else
    warn "⚠️  Backend ainda não está respondendo (pode levar alguns minutos)"
fi

# Elasticsearch
if curl -f http://localhost:9200 > /dev/null 2>&1; then
    log "✅ Elasticsearch está respondendo"
else
    warn "⚠️  Elasticsearch ainda não está respondendo"
fi

# Redis
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    log "✅ Redis está respondendo"
else
    warn "⚠️  Redis ainda não está respondendo"
fi

# PostgreSQL
if docker-compose exec postgres pg_isready -U postgres > /dev/null 2>&1; then
    log "✅ PostgreSQL está respondendo"
else
    warn "⚠️  PostgreSQL ainda não está respondendo"
fi

log "🎉 Setup concluído!"
log ""
log "📋 Serviços disponíveis:"
log "   Backend API: http://localhost:8080"
log "   Frontend: http://localhost:3000"
log "   Elasticsearch: http://localhost:9200"
log "   Kibana: http://localhost:5601"
log "   PostgreSQL: localhost:5432"
log "   Redis: localhost:6379"
log ""
log "🔧 Comandos úteis:"
log "   Ver logs: docker-compose logs -f [service]"
log "   Parar serviços: docker-compose down"
log "   Reiniciar: docker-compose restart"
log ""
log "📚 Próximos passos:"
log "   1. Implementar endpoints no backend"
log "   2. Configurar indexação no Elasticsearch"
log "   3. Desenvolver frontend React"
log "   4. Configurar CI/CD no GitHub Actions" 