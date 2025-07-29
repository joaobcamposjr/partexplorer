# PartExplorer - Catálogo de Peças Automotivas

Sistema de catálogo de peças automotivas com busca inteligente e alta performance.

## 🏗️ Arquitetura

- **Backend:** Go + PostgreSQL + Elasticsearch + Redis
- **Frontend:** React + Material UI
- **Infraestrutura:** Docker + GitHub Actions + AWS ECR/ECS

## 📁 Estrutura do Projeto

```
partexplorer/
├── backend/                 # API Go
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── api/
│   │   ├── database/
│   │   ├── elasticsearch/
│   │   ├── redis/
│   │   └── models/
│   ├── pkg/
│   ├── Dockerfile
│   ├── go.mod
│   └── go.sum
├── frontend/                # React App
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── infrastructure/          # Scripts de infraestrutura
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── scripts/
├── references/              # DDL e dados de referência
│   ├── ddl_catalogo.sql
│   ├── base.js
│   └── aplication.js
└── .github/
    └── workflows/           # GitHub Actions
        ├── backend.yml
        ├── frontend.yml
        └── infrastructure.yml
```

## 🚀 Deploy

### Desenvolvimento Local
```bash
# Subir todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f backend
```

### Produção (AWS)
```bash
# Build e push das imagens
./scripts/build-and-push.sh

# Deploy no ECS
./scripts/deploy-ecs.sh
```

## 🔧 Tecnologias

- **Backend:** Go 1.21+, Gin, GORM
- **Database:** PostgreSQL 15
- **Search:** Elasticsearch 8.11
- **Cache:** Redis 7
- **Frontend:** React 18, Material UI
- **Container:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **Cloud:** AWS ECR, ECS, RDS, ElastiCache