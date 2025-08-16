#!/bin/bash

# Script de Setup Completo - PartExplorer + Monitoramento
# Para quem não conhece nada de monitoramento!

set -e

echo "🎉 Bem-vindo ao Setup Completo do PartExplorer + Monitoramento!"
echo "Este script vai configurar TUDO para você!"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Verificar se estamos no diretório correto
if [ ! -f "docker-compose.prod.yml" ]; then
    error "Execute este script no diretório raiz do projeto PartExplorer"
    exit 1
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    error "Docker não está instalado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    log "Docker instalado! Faça logout e login novamente."
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose não está instalado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log "Docker Compose instalado!"
fi

log "✅ Docker e Docker Compose verificados!"

# Perguntar IP da VPS
echo ""
read -p "🌐 Digite o IP da sua VPS: " VPS_IP
read -p "👤 Digite o usuário da VPS (geralmente 'root'): " VPS_USER

# Criar arquivo de configuração
log "Criando arquivo de configuração..."
cat > .env.monitoring << EOF
# Configuração do Monitoramento PartExplorer
VPS_IP=$VPS_IP
VPS_USER=$VPS_USER

# URLs de acesso
GRAFANA_URL=http://$VPS_IP:3001
PROMETHEUS_URL=http://$VPS_IP:9090
ALERTMANAGER_URL=http://$VPS_IP:9093
LOKI_URL=http://$VPS_IP:3100

# Credenciais
GRAFANA_USER=admin
GRAFANA_PASSWORD=admin123
EOF

log "✅ Arquivo de configuração criado: .env.monitoring"

# Criar diretórios
log "Criando estrutura de diretórios..."
mkdir -p infrastructure/monitoring/{prometheus,rules,grafana/{provisioning/{datasources,dashboards},dashboards},loki,promtail,alertmanager}
mkdir -p logs/{nginx,backend,frontend}

# Verificar se o sistema principal está rodando
log "Verificando sistema principal..."
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    warn "Sistema principal não está rodando. Iniciando..."
    docker-compose -f docker-compose.prod.yml up -d
    sleep 10
fi

# Criar rede se não existir
if ! docker network ls | grep -q "partexplorer-network"; then
    log "Criando rede partexplorer-network..."
    docker network create partexplorer-network
fi

# Deploy do monitoramento
log "Iniciando deploy do sistema de monitoramento..."
cd infrastructure/monitoring

# Parar containers existentes
docker-compose -f docker-compose.monitoring-optimized.yml down 2>/dev/null || true

# Iniciar monitoramento
log "Iniciando containers de monitoramento..."
docker-compose -f docker-compose.monitoring-optimized.yml up -d

# Aguardar inicialização
log "Aguardando inicialização dos serviços..."
sleep 30

# Verificar status
log "Verificando status dos containers..."
docker-compose -f docker-compose.monitoring-optimized.yml ps

# Testar conectividade
log "Testando conectividade dos serviços..."

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
cat > cleanup-monitoring.sh << 'EOF'
#!/bin/bash
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

# Configurar cron job
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/cleanup-monitoring.sh") | crontab -

# Criar script de status
cat > status-monitoring.sh << 'EOF'
#!/bin/bash
echo "📊 Status do Sistema de Monitoramento PartExplorer"
echo "=================================================="

echo ""
echo "🔍 Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep partexplorer

echo ""
echo "📈 Uso de Recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
    partexplorer-prometheus partexplorer-grafana partexplorer-loki partexplorer-nginx-exporter

echo ""
echo "🌐 URLs de Acesso:"
echo "   Grafana: http://localhost:3001 (admin/admin123)"
echo "   Prometheus: http://localhost:9090"
echo "   Alertmanager: http://localhost:9093"
echo "   Loki: http://localhost:3100"
EOF

chmod +x status-monitoring.sh

# Mostrar informações finais
echo ""
log "🎉 Setup completo concluído com sucesso!"
echo ""
echo "📊 URLs de Acesso:"
echo "   Grafana: http://$VPS_IP:3001 (admin/admin123)"
echo "   Prometheus: http://$VPS_IP:9090"
echo "   Alertmanager: http://$VPS_IP:9093"
echo "   Loki: http://$VPS_IP:3100"
echo "   Nginx Exporter: http://$VPS_IP:9113/metrics"
echo "   cAdvisor: http://$VPS_IP:8088"
echo ""
echo "📚 Próximos Passos:"
echo "   1. Acesse o Grafana: http://$VPS_IP:3001"
echo "   2. Login: admin / admin123"
echo "   3. Explore os dashboards disponíveis"
echo "   4. Leia o GUIA_COMPLETO_MONITORAMENTO.md"
echo ""
echo "🛠️ Comandos Úteis:"
echo "   Status: ./status-monitoring.sh"
echo "   Limpeza: ./cleanup-monitoring.sh"
echo "   Logs: docker-compose -f docker-compose.monitoring-optimized.yml logs -f"
echo "   Parar: docker-compose -f docker-compose.monitoring-optimized.yml down"
echo ""
echo "📖 Documentação:"
echo "   - GUIA_COMPLETO_MONITORAMENTO.md (guia completo)"
echo "   - MONITORING_SUMMARY.md (resumo executivo)"
echo ""

# Verificar uso de recursos
log "Verificando uso final de recursos..."
echo "📈 Uso atual de recursos:"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" \
    partexplorer-prometheus partexplorer-grafana partexplorer-loki partexplorer-nginx-exporter

echo ""
log "✅ Setup completo! Agora você tem um sistema de monitoramento profissional!"
log "💡 Dica: Comece explorando o Grafana - é a ferramenta mais amigável!"
