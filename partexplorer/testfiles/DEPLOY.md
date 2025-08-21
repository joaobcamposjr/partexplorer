# 🚀 Guia de Deploy - PartExplorer

## 📋 Pré-requisitos

### Desenvolvimento Local
- Docker Desktop
- Docker Compose
- Go 1.21+
- Node.js 18+ (para frontend)

### Produção (AWS)
- AWS CLI configurado
- Conta AWS com permissões para:
  - ECR (Elastic Container Registry)
  - ECS (Elastic Container Service)
  - RDS (PostgreSQL)
  - ElastiCache (Redis)
  - Elasticsearch Service

## 🏃‍♂️ Desenvolvimento Local

### 1. Setup Inicial
```bash
# Clone o repositório
git clone <your-repo-url>
cd partexplorer

# Execute o script de setup
cd infrastructure/scripts
./dev-setup.sh
```

### 2. Verificar Serviços
```bash
# Verificar status
docker-compose ps

# Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f elasticsearch
```

### 3. Testar Endpoints
```bash
# Health check
curl http://localhost:8080/health

# API endpoints
curl http://localhost:8080/api/v1/search?q=test
```

## 🐳 Containers Separados - Estratégia

### Por que Containers Separados?

✅ **Vantagens:**
- **Desenvolvimento independente:** Cada equipe trabalha isoladamente
- **Escalabilidade:** Pode escalar cada serviço separadamente
- **Deploy flexível:** Diferentes estratégias para cada serviço
- **Debugging:** Mais fácil identificar problemas
- **CI/CD:** Pipelines separados

### Estrutura de Containers:
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   PostgreSQL    │
│   (React)       │◄──►│   (Go API)      │◄──►│   (Port 5432)   │
│   Port 3000     │    │   Port 8080     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Elasticsearch │    │   Redis         │
                       │   Port 9200     │    │   Port 6379     │
                       └─────────────────┘    └─────────────────┘
```

## ☁️ Deploy Produção (AWS)

### 1. Configurar Variáveis de Ambiente
```bash
# AWS
export AWS_ACCOUNT_ID="123456789012"
export AWS_REGION="us-east-1"
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"

# GitHub Secrets (configurar no repositório)
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
```

### 2. Build e Push das Imagens
```bash
# Desenvolvimento
./infrastructure/scripts/build-and-push.sh dev

# Produção
./infrastructure/scripts/build-and-push.sh prod
```

### 3. Deploy no ECS
```bash
# Deploy automático via GitHub Actions
# Ou manual:
./infrastructure/scripts/deploy-ecs.sh
```

## 🔧 Configuração de Serviços AWS

### 1. ECR (Elastic Container Registry)
```bash
# Criar repositórios
aws ecr create-repository --repository-name partexplorer-backend
aws ecr create-repository --repository-name partexplorer-frontend
```

### 2. ECS (Elastic Container Service)
```bash
# Cluster
aws ecs create-cluster --cluster-name partexplorer-cluster

# Task Definitions (criar via console ou CloudFormation)
# Services (criar via console ou CloudFormation)
```

### 3. RDS (PostgreSQL)
```bash
# Criar instância PostgreSQL
aws rds create-db-instance \
  --db-instance-identifier partexplorer-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password your-password \
  --allocated-storage 20
```

### 4. ElastiCache (Redis)
```bash
# Criar cluster Redis
aws elasticache create-cache-cluster \
  --cache-cluster-id partexplorer-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1
```

### 5. Elasticsearch Service
```bash
# Criar domínio Elasticsearch
aws es create-elasticsearch-domain \
  --domain-name partexplorer-search \
  --elasticsearch-version 8.11 \
  --elasticsearch-cluster-config InstanceType=t3.small.elasticsearch,InstanceCount=1
```

## 📊 Monitoramento

### CloudWatch
- Logs dos containers
- Métricas de performance
- Alertas automáticos

### Health Checks
```bash
# Backend
curl https://your-api-domain.com/health

# Frontend
curl https://your-frontend-domain.com

# Elasticsearch
curl https://your-es-domain.com/_cluster/health
```

## 🔒 Segurança

### 1. IAM Roles
- ECS Task Role para acessar outros serviços
- ECS Service Role para gerenciar containers

### 2. Security Groups
- Backend: 8080 (interno)
- Frontend: 80, 443 (público)
- Database: 5432 (interno)
- Redis: 6379 (interno)
- Elasticsearch: 9200 (interno)

### 3. Secrets Management
```bash
# Usar AWS Secrets Manager para senhas
aws secretsmanager create-secret \
  --name partexplorer/db-password \
  --secret-string "your-secure-password"
```

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Container não inicia
```bash
# Verificar logs
docker-compose logs [service-name]

# Verificar recursos
docker stats
```

#### 2. Conexão com banco
```bash
# Testar conexão
docker-compose exec backend go run cmd/server/main.go

# Verificar variáveis de ambiente
docker-compose exec backend env | grep DB
```

#### 3. Elasticsearch não responde
```bash
# Verificar status
curl http://localhost:9200/_cluster/health

# Verificar logs
docker-compose logs elasticsearch
```

## 📈 Próximos Passos

1. **Implementar endpoints** no backend Go
2. **Configurar indexação** no Elasticsearch
3. **Desenvolver frontend** React
4. **Configurar CI/CD** completo
5. **Implementar monitoramento** avançado
6. **Otimizar performance** e cache

## 📞 Suporte

- **Issues:** GitHub Issues
- **Documentação:** Este arquivo e README.md
- **Logs:** CloudWatch (produção) / Docker logs (desenvolvimento) 