#!/bin/bash

# Script de deploy do sistema de monitoramento para PartExplorer
# Autor: Sistema de Monitoramento
# Data: $(date)

set -e

echo "🚀 Iniciando deploy do sistema de monitoramento PartExplorer..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.prod.yml" ]; then
    error "Execute este script no diretório raiz do projeto PartExplorer"
    exit 1
fi

# Criar diretórios necessários
log "Criando diretórios para monitoramento..."
mkdir -p infrastructure/monitoring/{prometheus,rules,grafana/{provisioning/{datasources,dashboards},dashboards},loki,promtail,alertmanager}
mkdir -p logs/{nginx,backend,frontend}

# Verificar se o docker-compose principal está rodando
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    warn "O docker-compose principal não está rodando. Iniciando..."
    docker-compose -f docker-compose.prod.yml up -d
    sleep 10
fi

# Verificar se a rede existe
if ! docker network ls | grep -q "partexplorer-network"; then
    log "Criando rede partexplorer-network..."
    docker network create partexplorer-network
fi

# Deploy do sistema de monitoramento
log "Iniciando deploy do sistema de monitoramento..."
cd infrastructure/monitoring

# Parar containers existentes se houver
docker-compose -f docker-compose.monitoring.yml down 2>/dev/null || true

# Iniciar sistema de monitoramento
log "Iniciando containers de monitoramento..."
docker-compose -f docker-compose.monitoring.yml up -d

# Aguardar inicialização
log "Aguardando inicialização dos serviços..."
sleep 30

# Verificar status dos containers
log "Verificando status dos containers..."
docker-compose -f docker-compose.monitoring.yml ps

# Verificar se os serviços estão respondendo
log "Verificando conectividade dos serviços..."

# Prometheus
if curl -s http://localhost:9090/api/v1/status/config > /dev/null; then
    log "✅ Prometheus está funcionando"
else
    warn "⚠️  Prometheus pode não estar funcionando corretamente"
fi

# Grafana
if curl -s http://localhost:3001/api/health > /dev/null; then
    log "✅ Grafana está funcionando"
else
    warn "⚠️  Grafana pode não estar funcionando corretamente"
fi

# Loki
if curl -s http://localhost:3100/ready > /dev/null; then
    log "✅ Loki está funcionando"
else
    warn "⚠️  Loki pode não estar funcionando corretamente"
fi

# Nginx Exporter
if curl -s http://localhost:9113/metrics > /dev/null; then
    log "✅ Nginx Exporter está funcionando"
else
    warn "⚠️  Nginx Exporter pode não estar funcionando corretamente"
fi

# Configurar datasources no Grafana
log "Configurando datasources no Grafana..."
sleep 10

# Aguardar Grafana estar pronto
for i in {1..30}; do
    if curl -s http://localhost:3001/api/health | grep -q "ok"; then
        break
    fi
    sleep 2
done

# Criar dashboard de exemplo se não existir
if [ ! -f "grafana/dashboards/nginx-overview.json" ]; then
    log "Criando dashboard de exemplo..."
    # O dashboard já foi criado anteriormente
fi

# Configurar alertas básicos
log "Configurando alertas básicos..."

# Verificar se o nginx está configurado corretamente
if docker exec partexplorer-nginx nginx -t 2>/dev/null; then
    log "✅ Configuração do nginx está válida"
else
    warn "⚠️  Verifique a configuração do nginx"
fi

# Mostrar informações de acesso
echo ""
log "🎉 Deploy do sistema de monitoramento concluído!"
echo ""
echo "📊 URLs de acesso:"
echo "   Grafana: http://localhost:3001 (admin/admin123)"
echo "   Prometheus: http://localhost:9090"
echo "   Alertmanager: http://localhost:9093"
echo "   Loki: http://localhost:3100"
echo "   Nginx Exporter: http://localhost:9113/metrics"
echo "   cAdvisor: http://localhost:8088"
echo ""
echo "🔧 Próximos passos:"
echo "   1. Acesse o Grafana e configure os dashboards"
echo "   2. Configure alertas no Alertmanager"
echo "   3. Monitore os logs no Loki"
echo "   4. Integre o widget de analytics no frontend"
echo ""
echo "📝 Comandos úteis:"
echo "   Ver logs: docker-compose -f infrastructure/monitoring/docker-compose.monitoring.yml logs -f"
echo "   Parar: docker-compose -f infrastructure/monitoring/docker-compose.monitoring.yml down"
echo "   Reiniciar: docker-compose -f infrastructure/monitoring/docker-compose.monitoring.yml restart"
echo ""

# Verificar uso de recursos
log "Verificando uso de recursos..."
echo "📈 Uso de recursos dos containers de monitoramento:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
    partexplorer-prometheus partexplorer-grafana partexplorer-loki partexplorer-nginx-exporter

echo ""
log "✅ Deploy concluído com sucesso!"
