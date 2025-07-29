#!/bin/bash

# Script para build e push das imagens Docker para AWS ECR
# Uso: ./build-and-push.sh [environment]
# environment: dev, staging, prod (default: dev)

set -e

# Configurações
ENVIRONMENT=${1:-dev}
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=${AWS_ACCOUNT_ID}

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Verificar se AWS CLI está configurado
if ! command -v aws &> /dev/null; then
    error "AWS CLI não está instalado"
fi

# Verificar se Docker está rodando
if ! docker info &> /dev/null; then
    error "Docker não está rodando"
fi

# Verificar variáveis de ambiente
if [ -z "$AWS_ACCOUNT_ID" ]; then
    error "AWS_ACCOUNT_ID não está definido"
fi

log "Iniciando build e push para ambiente: $ENVIRONMENT"

# Definir repositórios ECR
BACKEND_REPO="partexplorer-backend"
FRONTEND_REPO="partexplorer-frontend"

# Criar repositórios ECR se não existirem
log "Verificando/criando repositórios ECR..."

aws ecr describe-repositories --repository-names $BACKEND_REPO --region $AWS_REGION || \
aws ecr create-repository --repository-name $BACKEND_REPO --region $AWS_REGION

aws ecr describe-repositories --repository-names $FRONTEND_REPO --region $AWS_REGION || \
aws ecr create-repository --repository-name $FRONTEND_REPO --region $AWS_REGION

# Login no ECR
log "Fazendo login no ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Definir tags
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKEND_TAG="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$BACKEND_REPO:$ENVIRONMENT-$TIMESTAMP"
FRONTEND_TAG="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$FRONTEND_REPO:$ENVIRONMENT-$TIMESTAMP"

# Build e push do Backend
log "Buildando imagem do Backend..."
cd ../backend
docker build -t $BACKEND_TAG .
docker push $BACKEND_TAG
log "Backend buildado e enviado: $BACKEND_TAG"

# Build e push do Frontend
log "Buildando imagem do Frontend..."
cd ../frontend
docker build -t $FRONTEND_TAG .
docker push $FRONTEND_TAG
log "Frontend buildado e enviado: $FRONTEND_TAG"

# Salvar tags em arquivo para uso no deploy
cd ../infrastructure/scripts
echo "BACKEND_IMAGE=$BACKEND_TAG" > .env.images
echo "FRONTEND_IMAGE=$FRONTEND_TAG" >> .env.images

log "Build e push concluído com sucesso!"
log "Tags salvas em: .env.images"
log "Backend: $BACKEND_TAG"
log "Frontend: $FRONTEND_TAG" 