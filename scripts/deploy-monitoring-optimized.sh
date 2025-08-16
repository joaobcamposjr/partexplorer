#!/bin/bash

# Script de deploy otimizado para VPS pequena
# Autor: Sistema de Monitoramento PartExplorer
# Data: $(date)

set -e

echo "🚀 Iniciando deploy otimizado do sistema de monitoramento PartExplorer..."

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

# Verificar recursos da VPS
log "Verificando recursos da VPS..."

# Verificar memória disponível
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
AVAILABLE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $7}')
log "Memória total: ${TOTAL_MEM}MB"
log "Memória disponível: ${AVAILABLE_MEM}MB"

if [ $AVAILABLE_MEM -lt 1000 ]; then
    warn "Pouca memória disponível! Recomendado ter pelo menos 1GB livre."
fi

# Verificar espaço em disco
TOTAL_DISK=$(df -h / | awk 'NR==2{print $2}' | sed 's/G//')
USED_DISK=$(df -h / | awk 'NR==2{print $3}' | sed 's/G//')
log "Disco total: ${TOTAL_DISK}GB"
log "Disco usado: ${USED_DISK}GB"

if [ $USED_DISK -gt $((TOTAL_DISK * 80 / 100)) ]; then
    warn "Disco quase cheio! Recomendado ter pelo menos 20% livre."
fi

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

# Deploy do sistema de monitoramento otimizado
log "Iniciando deploy do sistema de monitoramento otimizado..."
cd infrastructure/monitoring

# Parar containers existentes se houver
docker-compose -f docker-compose.monitoring-optimized.yml down 2>/dev/null || true

# Limpar volumes antigos se necessário
if [ "$1" = "--clean" ]; then
    log "Limpando volumes antigos..."
    docker volume rm partexplorer-prometheus_data partexplorer-grafana_data partexplorer-loki_data partexplorer-alertmanager_data 2>/dev/null || true
fi

# Iniciar sistema de monitoramento otimizado
log "Iniciando containers de monitoramento otimizados..."
docker-compose -f docker-compose.monitoring-optimized.yml up -d

# Aguardar inicialização
log "Aguardando inicialização dos serviços..."
sleep 30

# Verificar status dos containers
log "Verificando status dos containers..."
docker-compose -f docker-compose.monitoring-optimized.yml ps

# Verificar uso de recursos
log "Verificando uso de recursos..."
echo "📊 Uso de recursos dos containers:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
    partexplorer-prometheus partexplorer-grafana partexplorer-loki partexplorer-nginx-exporter

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

# Configurar limpeza automática
log "Configurando limpeza automática..."

# Criar script de limpeza
cat > cleanup-monitoring.sh << 'EOF'
#!/bin/bash
# Script de limpeza automática para VPS pequena

echo "🧹 Iniciando limpeza automática..."

# Limpar logs antigos do Prometheus (mais de 7 dias)
docker exec partexplorer-prometheus find /prometheus -name "*.wal" -mtime +7 -delete 2>/dev/null || true

# Limpar logs antigos do Loki (mais de 7 dias)
docker exec partexplorer-loki find /loki -name "*.log" -mtime +7 -delete 2>/dev/null || true

# Limpar cache do Grafana
docker exec partexplorer-grafana rm -rf /var/lib/grafana/plugins/*/node_modules 2>/dev/null || true

# Limpar logs do sistema (mais de 3 dias)
find /var/log -name "*.log" -mtime +3 -delete 2>/dev/null || true

echo "✅ Limpeza concluída!"
EOF

chmod +x cleanup-monitoring.sh

# Configurar cron job para limpeza automática (diária às 2h)
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/cleanup-monitoring.sh") | crontab -

# Mostrar informações de acesso
echo ""
log "🎉 Deploy otimizado concluído!"
echo ""
echo "📊 URLs de acesso:"
echo "   Grafana: http://localhost:3001 (admin/admin123)"
echo "   Prometheus: http://localhost:9090"
echo "   Alertmanager: http://localhost:9093"
echo "   Loki: http://localhost:3100"
echo "   Nginx Exporter: http://localhost:9113/metrics"
echo "   cAdvisor: http://localhost:8088"
echo ""
echo "🔧 Configurações otimizadas:"
echo "   - Prometheus: 7 dias de retenção, limite 5GB"
echo "   - Grafana: Analytics desabilitado"
echo "   - Loki: Compressão habilitada"
echo "   - Limpeza automática: Diária às 2h"
echo ""
echo "📝 Comandos úteis:"
echo "   Ver logs: docker-compose -f infrastructure/monitoring/docker-compose.monitoring-optimized.yml logs -f"
echo "   Parar: docker-compose -f infrastructure/monitoring/docker-compose.monitoring-optimized.yml down"
echo "   Reiniciar: docker-compose -f infrastructure/monitoring/docker-compose.monitoring-optimized.yml restart"
echo "   Limpeza manual: ./cleanup-monitoring.sh"
echo ""

# Verificar uso final de recursos
log "Verificando uso final de recursos..."
echo "📈 Uso atual de recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
    partexplorer-prometheus partexplorer-grafana partexplorer-loki partexplorer-nginx-exporter

echo ""
log "✅ Deploy otimizado concluído com sucesso!"
log "💡 Dica: Execute './cleanup-monitoring.sh' periodicamente para manter o sistema leve."
